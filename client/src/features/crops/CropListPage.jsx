import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  ChevronRight,
  Droplet,
  Shield,
  Search
} from 'lucide-react';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const CropListPage = () => {
  const { t } = useTranslation();
  const { farms, selectedFarm } = useOutletContext();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Modals
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cropForm, setCropForm] = useState({
    farmId: '',
    name: '',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    growthStage: 'seedling',
    cultivatedArea: '',
    irrigationMethod: 'Drip',
    notes: ''
  });

  const [activityForm, setActivityForm] = useState({
    title: '',
    type: 'irrigation',
    dueDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchCrops = () => {
    setLoading(true);
    const query = selectedFarm?._id ? `?farmId=${selectedFarm._id}` : '';
    api.get(`/crops${query}`)
      .then((res) => {
        const list = res.data || [];
        setCrops(list);
        if (list.length > 0 && !selectedCrop) {
          setSelectedCrop(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrops();
  }, [selectedFarm]);

  const openAddCrop = () => {
    setCropForm({
      farmId: selectedFarm?._id || farms[0]?._id || '',
      name: '',
      variety: '',
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: '',
      growthStage: 'seedling',
      cultivatedArea: '',
      irrigationMethod: selectedFarm?.irrigationMethod || 'Drip',
      notes: ''
    });
    setIsCropModalOpen(true);
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/crops', {
        ...cropForm,
        cultivatedArea: Number(cropForm.cultivatedArea)
      });
      fetchCrops();
      setIsCropModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to create crop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedCrop) return;
    setSubmitting(true);
    try {
      await api.post(`/crops/${selectedCrop._id}/activities`, activityForm);
      // Refresh current crop
      const updated = await api.get(`/crops/${selectedCrop._id}`);
      setSelectedCrop(updated.data);
      fetchCrops();
      setIsActivityModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to schedule activity');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivityStatus = async (cropId, actId) => {
    try {
      await api.patch(`/crops/${cropId}/activities/${actId}`);
      const updated = await api.get(`/crops/${cropId}`);
      setSelectedCrop(updated.data);
      fetchCrops();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('crops.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {t('crops.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddCrop}>
          {t('crops.addCrop')}
        </Button>
      </div>

      {crops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No registered crops"
          description={t('crops.noCrops')}
          actionLabel={t('crops.addCrop')}
          onAction={openAddCrop}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Crop List Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {crops.map((crop) => {
              const isSelected = selectedCrop?._id === crop._id;
              return (
                <div
                  key={crop._id}
                  onClick={() => setSelectedCrop(crop)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-sage-light)' : '#FFFFFF',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {crop.name}
                    </h3>
                    <Badge variant="neutral">{crop.growthStage}</Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Variety: {crop.variety || 'Standard'} • Area: {crop.cultivatedArea} Acres
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Sown: {new Date(crop.plantingDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Crop Card & Activities Timeline */}
          {selectedCrop && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '18px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      {selectedCrop.name}
                    </h2>
                    <Badge variant="success">{selectedCrop.status}</Badge>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Variety: <strong>{selectedCrop.variety || 'Standard'}</strong> • Cultivated: <strong>{selectedCrop.cultivatedArea} Acres</strong> • Method: <strong>{selectedCrop.irrigationMethod}</strong>
                  </p>
                </div>
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsActivityModalOpen(true)}>
                  {t('crops.addActivity')}
                </Button>
              </div>

              {/* Phenological Stage Progress Indicator */}
              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Growth Stage Progress
                </span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['seedling', 'vegetative', 'flowering', 'ripening', 'harvest-ready'].map((stg) => {
                    const isPassed = ['seedling', 'vegetative', 'flowering', 'ripening', 'harvest-ready'].indexOf(selectedCrop.growthStage) >= ['seedling', 'vegetative', 'flowering', 'ripening', 'harvest-ready'].indexOf(stg);
                    return (
                      <div
                        key={stg}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: isPassed ? 'var(--color-primary)' : 'var(--color-bg-ivory)',
                          color: isPassed ? '#FFFFFF' : 'var(--color-text-muted)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {stg}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Timeline List */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
                  {t('crops.activities')} ({selectedCrop.activities?.length || 0})
                </h3>

                {(!selectedCrop.activities || selectedCrop.activities.length === 0) ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No activities recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedCrop.activities.map((act) => (
                      <div
                        key={act._id}
                        onClick={() => toggleActivityStatus(selectedCrop._id, act._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: act.completed ? '#F1F8E9' : '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2
                          size={20}
                          color={act.completed ? 'var(--color-success)' : 'var(--color-border)'}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, textDecoration: act.completed ? 'line-through' : 'none', color: act.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            Category: {act.type} • Due: {new Date(act.dueDate).toLocaleDateString()}
                            {act.notes && ` • ${act.notes}`}
                          </div>
                        </div>
                        <Badge variant={act.completed ? 'success' : 'warning'}>
                          {act.completed ? 'Done' : 'Scheduled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={t('crops.addCrop')}
      >
        <form onSubmit={handleCreateCrop}>
          <Select
            label="Target Farm"
            value={cropForm.farmId}
            onChange={(e) => setCropForm({ ...cropForm, farmId: e.target.value })}
            options={farms.map((f) => ({ value: f._id, label: `${f.name} (${f.location.district})` }))}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={t('crops.cropName')}
              value={cropForm.name}
              onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
              placeholder="e.g. Sharbati Wheat"
              required
            />
            <Input
              label={t('crops.variety')}
              value={cropForm.variety}
              onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
              placeholder="e.g. HD-2967"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={t('crops.plantedOn')}
              type="date"
              value={cropForm.plantingDate}
              onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
              required
            />
            <Input
              label={t('crops.harvestDate')}
              type="date"
              value={cropForm.expectedHarvestDate}
              onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={t('crops.cultivatedArea')}
              type="number"
              step="0.1"
              value={cropForm.cultivatedArea}
              onChange={(e) => setCropForm({ ...cropForm, cultivatedArea: e.target.value })}
              placeholder="e.g. 5.5"
              required
            />
            <Select
              label={t('crops.stage')}
              value={cropForm.growthStage}
              onChange={(e) => setCropForm({ ...cropForm, growthStage: e.target.value })}
              options={[
                { value: 'seedling', label: 'Seedling / Emergence' },
                { value: 'vegetative', label: 'Vegetative Tillering' },
                { value: 'flowering', label: 'Flowering / Heading' },
                { value: 'ripening', label: 'Grain Ripening' },
                { value: 'harvest-ready', label: 'Harvest Ready' }
              ]}
            />
          </div>

          <Input
            label="Initial Observations & Treatment Notes"
            value={cropForm.notes}
            onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
            placeholder="Seed germination rate, basal fertilizer applied"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsCropModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {t('crops.addCrop')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title={t('crops.addActivity')}
      >
        <form onSubmit={handleAddActivity}>
          <Input
            label="Activity Name"
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
            placeholder="e.g. Second Urea Top-Dressing"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Activity Type"
              value={activityForm.type}
              onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
              options={[
                { value: 'irrigation', label: 'Irrigation' },
                { value: 'fertilization', label: 'Fertilization / Spray' },
                { value: 'pest_control', label: 'Pest Scouting & Defense' },
                { value: 'inspection', label: 'Growth Inspection' },
                { value: 'harvest', label: 'Harvesting Task' }
              ]}
            />
            <Input
              label="Target Due Date"
              type="date"
              value={activityForm.dueDate}
              onChange={(e) => setActivityForm({ ...activityForm, dueDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Dosage / Execution Notes"
            value={activityForm.notes}
            onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
            placeholder="e.g. 45 kg/acre neem coated urea applied after irrigation"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsActivityModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
