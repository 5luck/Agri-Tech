import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Droplet,
  Thermometer,
  Layers,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const SoilDashboardPage = () => {
  const { t } = useTranslation();
  const { selectedFarm } = useOutletContext();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [soilForm, setSoilForm] = useState({
    ph: '6.5',
    nitrogen: '160',
    phosphorus: '30',
    potassium: '210',
    moisture: '45',
    temperature: '25',
    electricalConductivity: '0.6',
    organicMatter: '1.2',
    source: 'laboratory',
    notes: ''
  });

  const fetchRecords = () => {
    if (!selectedFarm?._id) return;
    setLoading(true);
    api.get(`/soil-records/farm/${selectedFarm._id}`)
      .then((res) => {
        setRecords(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedFarm]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/soil-records/farm/${selectedFarm._id}`, {
        measurements: {
          ph: Number(soilForm.ph),
          nitrogen: Number(soilForm.nitrogen),
          phosphorus: Number(soilForm.phosphorus),
          potassium: Number(soilForm.potassium),
          moisture: Number(soilForm.moisture),
          temperature: soilForm.temperature ? Number(soilForm.temperature) : undefined,
          electricalConductivity: soilForm.electricalConductivity ? Number(soilForm.electricalConductivity) : undefined,
          organicMatter: soilForm.organicMatter ? Number(soilForm.organicMatter) : undefined
        },
        source: soilForm.source,
        notes: soilForm.notes
      });
      fetchRecords();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to record soil data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this soil record?')) return;
    try {
      await api.delete(`/soil-records/${id}`);
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  const latest = records[0];

  // Prepare chart comparing N, P, K over time
  const npkChartData = records.slice(0, 5).reverse().map((r) => ({
    date: new Date(r.measuredAt).toLocaleDateString(),
    Nitrogen: r.measurements.nitrogen,
    Phosphorus: r.measurements.phosphorus,
    Potassium: r.measurements.potassium
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('soil.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {selectedFarm?.name} — {t('soil.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          {t('soil.newRecord')}
        </Button>
      </div>

      {!latest ? (
        <EmptyState
          icon={FlaskConical}
          title="No Soil Records Logged"
          description="Log laboratory soil reports or sensor readings to receive agronomic nutrient recommendations."
          actionLabel={t('soil.newRecord')}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <>
          {/* Top Nutrient Level Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {t('soil.phLevel')}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {latest.measurements.ph}
              </div>
              <Badge variant={latest.measurements.ph >= 6 && latest.measurements.ph <= 7.5 ? 'success' : 'warning'}>
                {latest.measurements.ph >= 6 && latest.measurements.ph <= 7.5 ? 'Balanced (6.0 - 7.5)' : latest.measurements.ph < 6 ? 'Acidic' : 'Alkaline'}
              </Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {t('soil.nitrogen')}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {latest.measurements.nitrogen} <span style={{ fontSize: '16px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <Badge variant={latest.measurements.nitrogen >= 140 ? 'success' : 'warning'}>
                {latest.measurements.nitrogen >= 140 ? 'Adequate' : 'Deficient (<140)'}
              </Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {t('soil.phosphorus')}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {latest.measurements.phosphorus} <span style={{ fontSize: '16px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <Badge variant={latest.measurements.phosphorus >= 20 ? 'success' : 'warning'}>
                {latest.measurements.phosphorus >= 20 ? 'Sufficient' : 'Deficient (<20)'}
              </Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {t('soil.potassium')}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {latest.measurements.potassium} <span style={{ fontSize: '16px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <Badge variant={latest.measurements.potassium >= 140 ? 'success' : 'warning'}>
                {latest.measurements.potassium >= 140 ? 'Sufficient' : 'Low (<140)'}
              </Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {t('soil.moisture')}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {latest.measurements.moisture}%
              </div>
              <Badge variant={latest.measurements.moisture >= 35 ? 'success' : 'danger'}>
                {latest.measurements.moisture >= 35 ? 'Field Capacity' : 'Moisture Stress'}
              </Badge>
            </Card>
          </div>

          {/* Transparent Recommendations & NPK History Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Agronomic Recommendations */}
            <Card title={t('soil.advisories')} subtitle="Rule-based actions based on validated agronomic fertility thresholds">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {latest.recommendations?.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: rec.status === 'optimal' ? '#F1F8E9' : rec.status === 'critical' ? '#FFEBEE' : 'var(--color-bg-ivory)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary-dark)' }}>
                        {rec.parameter}
                      </span>
                      <Badge variant={rec.status === 'optimal' ? 'success' : rec.status === 'critical' ? 'danger' : 'warning'}>
                        {rec.status}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      {rec.advisory}
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Action: {rec.action}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* NPK Trend Chart */}
            <Card title="NPK Macronutrient Trends (kg/ha)">
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={npkChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE3" />
                    <XAxis dataKey="date" />
                    <YAxis unit=" kg/ha" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Nitrogen" fill="#244C3A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Phosphorus" fill="#8A6748" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Potassium" fill="#4F7958" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Historical Soil Records Table */}
          <Card title={t('soil.history')}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Source</th>
                    <th style={{ padding: '12px 14px' }}>pH</th>
                    <th style={{ padding: '12px 14px' }}>N (kg/ha)</th>
                    <th style={{ padding: '12px 14px' }}>P (kg/ha)</th>
                    <th style={{ padding: '12px 14px' }}>K (kg/ha)</th>
                    <th style={{ padding: '12px 14px' }}>Moisture</th>
                    <th style={{ padding: '12px 14px' }}>Notes</th>
                    <th style={{ padding: '12px 14px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{new Date(r.measuredAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 14px' }}><Badge variant="neutral">{r.source}</Badge></td>
                      <td style={{ padding: '12px 14px' }}>{r.measurements.ph}</td>
                      <td style={{ padding: '12px 14px' }}>{r.measurements.nitrogen}</td>
                      <td style={{ padding: '12px 14px' }}>{r.measurements.phosphorus}</td>
                      <td style={{ padding: '12px 14px' }}>{r.measurements.potassium}</td>
                      <td style={{ padding: '12px 14px' }}>{r.measurements.moisture}%</td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-text-muted)' }}>{r.notes || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => handleDeleteRecord(r._id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Log Soil Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('soil.newRecord')}
      >
        <form onSubmit={handleCreateRecord}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Soil pH (0 - 14)"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={soilForm.ph}
              onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
              required
            />
            <Input
              label="Soil Moisture (%)"
              type="number"
              step="1"
              min="0"
              max="100"
              value={soilForm.moisture}
              onChange={(e) => setSoilForm({ ...soilForm, moisture: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <Input
              label="Nitrogen (kg/ha)"
              type="number"
              value={soilForm.nitrogen}
              onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
              required
            />
            <Input
              label="Phosphorus (kg/ha)"
              type="number"
              value={soilForm.phosphorus}
              onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
              required
            />
            <Input
              label="Potassium (kg/ha)"
              type="number"
              value={soilForm.potassium}
              onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Soil Temperature (°C)"
              type="number"
              value={soilForm.temperature}
              onChange={(e) => setSoilForm({ ...soilForm, temperature: e.target.value })}
            />
            <Select
              label="Measurement Origin"
              value={soilForm.source}
              onChange={(e) => setSoilForm({ ...soilForm, source: e.target.value })}
              options={[
                { value: 'laboratory', label: 'Certified Soil Testing Lab' },
                { value: 'sensor', label: 'IoT Sensor Telemetry' },
                { value: 'manual', label: 'Manual Field Test Kit' }
              ]}
            />
          </div>

          <Input
            label="Soil Observations / Lab Batch #"
            value={soilForm.notes}
            onChange={(e) => setSoilForm({ ...soilForm, notes: e.target.value })}
            placeholder="e.g. Sample collected at 15cm root depth after rainfall"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Evaluate & Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
