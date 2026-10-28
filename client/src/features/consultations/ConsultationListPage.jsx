import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import api from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const ConsultationListPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { farms, selectedFarm } = useOutletContext();

  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations' | 'experts'
  const [consultations, setConsultations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Consultation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpertForBooking, setSelectedExpertForBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const [consultationForm, setConsultationForm] = useState({
    expertId: '',
    farmId: '',
    subject: '',
    description: '',
    preferredDate: ''
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/consultations'),
      api.get('/consultations/experts')
    ])
      .then(([consRes, expRes]) => {
        const list = consRes.data || [];
        setConsultations(list);
        setExperts(expRes.data || []);
        if (list.length > 0 && !selectedConsultation) {
          setSelectedConsultation(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBookingModal = (expert = null) => {
    setSelectedExpertForBooking(expert);
    setConsultationForm({
      expertId: expert?._id || experts[0]?._id || '',
      farmId: selectedFarm?._id || farms[0]?._id || '',
      subject: '',
      description: '',
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/consultations', consultationForm);
      fetchData();
      setIsModalOpen(false);
      setActiveTab('consultations');
    } catch (err) {
      alert(err.message || 'Failed to submit consultation request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConsultation) return;

    try {
      const res = await api.post(`/consultations/${selectedConsultation._id}/messages`, {
        message: newMessage
      });
      setSelectedConsultation(res.data);
      setNewMessage('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  const updateStatus = async (status) => {
    if (!selectedConsultation) return;
    try {
      const res = await api.patch(`/consultations/${selectedConsultation._id}/status`, { status });
      setSelectedConsultation(res.data);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update consultation status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('consultations.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {t('consultations.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => openBookingModal()}>
          {t('consultations.request')}
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('consultations')}
          style={{
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'consultations' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'consultations' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
          }}
        >
          {t('consultations.myConsultations')} ({consultations.length})
        </button>
        <button
          onClick={() => setActiveTab('experts')}
          style={{
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderBottom: activeTab === 'experts' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'experts' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
          }}
        >
          {t('consultations.directory')} ({experts.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'experts' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {experts.map((exp) => (
            <Card key={exp._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                  {exp.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{exp.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
                    Verified Agricultural Scientist
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {exp.expertProfile?.yearsExperience} Years Field Experience
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Specialization
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  {exp.expertProfile?.specialization?.join(', ') || 'Agronomy'}
                </div>

                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Languages
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
                  {exp.expertProfile?.languages?.join(', ') || 'English'}
                </div>
              </div>

              {exp.expertProfile?.bio && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {exp.expertProfile.bio}
                </p>
              )}

              <Button variant="primary" style={{ width: '100%' }} onClick={() => openBookingModal(exp)}>
                Book Consultation
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        /* My Consultations List & Message Thread */
        consultations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Active Consultations"
            description="Submit a consultation inquiry to connect with verified agronomists and plant doctors."
            actionLabel={t('consultations.request')}
            onAction={() => openBookingModal()}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Consultations Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {consultations.map((item) => {
                const isSelected = selectedConsultation?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedConsultation(item)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--color-sage-light)' : '#FFFFFF',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        {item.subject}
                      </h4>
                      <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'warning' : 'neutral'}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      With: <strong>{user?.role === 'expert' ? item.farmerId?.name : item.expertId?.name}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Consultation Messaging Thread */}
            {selectedConsultation && (
              <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '620px' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {selectedConsultation.subject}
                    </h3>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Participant: <strong>{user?.role === 'expert' ? selectedConsultation.farmerId?.name : selectedConsultation.expertId?.name}</strong> • Farm: {selectedConsultation.farmId?.name || 'General Plot'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user?.role === 'expert' && selectedConsultation.status === 'pending' && (
                      <Button variant="primary" size="sm" onClick={() => updateStatus('accepted')}>
                        Accept
                      </Button>
                    )}
                    {user?.role === 'expert' && ['accepted', 'in_progress'].includes(selectedConsultation.status) && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus('completed')}>
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>

                {/* Message Timeline */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--color-bg-ivory)' }}>
                  {(selectedConsultation.messages || []).map((msg, idx) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          backgroundColor: isMe ? 'var(--color-primary)' : '#FFFFFF',
                          color: isMe ? '#FFFFFF' : 'var(--color-text-main)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: 600 }}>
                          {isMe ? 'You' : msg.senderRole === 'expert' ? 'Dr. Expert' : 'Farmer'} • {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendMessage} style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px', backgroundColor: '#FFFFFF' }}>
                  <input
                    type="text"
                    placeholder="Type diagnostic observation, prescription, or question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                  <Button type="submit" variant="primary" icon={Send}>
                    Send
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )
      )}

      {/* Book Consultation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('consultations.request')}
      >
        <form onSubmit={handleCreateConsultation}>
          <Select
            label="Select Agricultural Scientist"
            value={consultationForm.expertId}
            onChange={(e) => setConsultationForm({ ...consultationForm, expertId: e.target.value })}
            options={experts.map((exp) => ({ value: exp._id, label: `${exp.name} (${exp.expertProfile?.specialization?.[0] || 'Agronomist'})` }))}
            required
          />

          <Select
            label="Target Farm (Optional)"
            value={consultationForm.farmId}
            onChange={(e) => setConsultationForm({ ...consultationForm, farmId: e.target.value })}
            options={[{ value: '', label: 'None / General Inquiry' }, ...farms.map((f) => ({ value: f._id, label: f.name }))]}
          />

          <Input
            label="Inquiry Subject"
            value={consultationForm.subject}
            onChange={(e) => setConsultationForm({ ...consultationForm, subject: e.target.value })}
            placeholder="e.g. Yellowing leaf tips in vegetative wheat plot"
            required
          />

          <Input
            label="Detailed Diagnostic Description"
            value={consultationForm.description}
            onChange={(e) => setConsultationForm({ ...consultationForm, description: e.target.value })}
            placeholder="Describe soil moisture, fertilizer doses applied, recent temperature changes, or observed symptoms"
            required
          />

          <Input
            label="Preferred Consultation Date"
            type="date"
            value={consultationForm.preferredDate}
            onChange={(e) => setConsultationForm({ ...consultationForm, preferredDate: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Consultation Inquiry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
