import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  ShieldAlert,
  Bug,
  CloudRain,
  FlaskConical,
  X
} from 'lucide-react';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const AlertsListPage = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertForm, setAlertForm] = useState({
    type: 'pest',
    title: '',
    description: '',
    severity: 'moderate',
    source: 'Farmer Field Report',
    recommendedAction: ''
  });

  const fetchAlerts = () => {
    setLoading(true);
    let query = '';
    const params = [];
    if (filterType !== 'all') params.push(`type=${filterType}`);
    if (filterSeverity !== 'all') params.push(`severity=${filterSeverity}`);
    if (params.length > 0) query = `?${params.join('&')}`;

    api.get(`/alerts${query}`)
      .then((res) => {
        setAlerts(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterType, filterSeverity]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'read' } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const dismissAlert = async (id) => {
    try {
      await api.patch(`/alerts/${id}/dismiss`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/alerts', alertForm);
      fetchAlerts();
      setIsModalOpen(false);
      setAlertForm({
        type: 'pest',
        title: '',
        description: '',
        severity: 'moderate',
        source: 'Farmer Field Report',
        recommendedAction: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to submit advisory');
    } finally {
      setSubmitting(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'weather': return CloudRain;
      case 'pest': return Bug;
      case 'soil': return FlaskConical;
      default: return AlertTriangle;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('nav.alerts')} & Agricultural Advisories
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Real-time pest outbreaks, weather warnings, and soil nutrient anomalies.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Report Field Threat
        </Button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '13px' }}
          >
            <option value="all">All Categories</option>
            <option value="pest">Pest & Disease</option>
            <option value="weather">Weather Risks</option>
            <option value="soil">Soil Deficits</option>
            <option value="system">System Notices</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '13px' }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Active Threats"
          description="Your farms and crops currently have no unresolved risk advisories."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const isUnread = alert.status === 'unread';

            return (
              <div
                key={alert._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: isUnread ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  padding: '18px 24px',
                  display: 'flex',
                  gap: '16px',
                  boxShadow: var_shadow => isUnread ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: alert.severity === 'critical' ? '#FFEBEE' : alert.severity === 'high' ? '#FFF3E0' : 'var(--color-sage-light)',
                    color: alert.severity === 'critical' ? 'var(--color-danger)' : alert.severity === 'high' ? '#E65100' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {alert.title}
                    </h3>
                    <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'neutral'}>
                      {alert.severity} Severity
                    </Badge>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Source: {alert.source} • {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5, marginBottom: '8px' }}>
                    {alert.description}
                  </p>

                  {alert.recommendedAction && (
                    <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                      <strong>Recommended Action:</strong> {alert.recommendedAction}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {isUnread && (
                      <Button variant="secondary" size="sm" onClick={() => markAsRead(alert._id)}>
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => dismissAlert(alert._id)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Threat Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Field Pest or Crop Threat"
      >
        <form onSubmit={handleCreateAlert}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Threat Category"
              value={alertForm.type}
              onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
              options={[
                { value: 'pest', label: 'Pest Outbreak' },
                { value: 'weather', label: 'Severe Weather Risk' },
                { value: 'soil', label: 'Soil Health Anomaly' },
                { value: 'system', label: 'General Threat' }
              ]}
            />
            <Select
              label="Severity Level"
              value={alertForm.severity}
              onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
              options={[
                { value: 'low', label: 'Low (Informational)' },
                { value: 'moderate', label: 'Moderate (Scouting advised)' },
                { value: 'high', label: 'High (Action required)' },
                { value: 'critical', label: 'Critical (Immediate outbreak)' }
              ]}
            />
          </div>

          <Input
            label="Threat Title"
            value={alertForm.title}
            onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
            placeholder="e.g. Early Blight Symptoms Observed on Tomato Leaves"
            required
          />

          <Input
            label="Detailed Description"
            value={alertForm.description}
            onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
            placeholder="Describe affected acreage, visible symptoms, leaf spots, or caterpillar damage"
            required
          />

          <Input
            label="Recommended Next Steps"
            value={alertForm.recommendedAction}
            onChange={(e) => setAlertForm({ ...alertForm, recommendedAction: e.target.value })}
            placeholder="e.g. Apply neem-based spray; isolate affected plants"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Threat Advisory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
