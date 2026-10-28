import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit2, Archive, CheckCircle2, Droplets, Mountain } from 'lucide-react';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const FarmListPage = () => {
  const { t } = useTranslation();
  const { farms, refreshFarms, selectedFarm, setSelectedFarm } = useOutletContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    district: '',
    village: '',
    latitude: '',
    longitude: '',
    area: '',
    areaUnit: 'acre',
    soilType: 'Loamy',
    irrigationMethod: 'Drip',
    description: ''
  });

  const openCreateModal = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      state: '',
      district: '',
      village: '',
      latitude: '22.5645',
      longitude: '72.9289',
      area: '',
      areaUnit: 'acre',
      soilType: 'Loamy',
      irrigationMethod: 'Drip',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      state: farm.location.state,
      district: farm.location.district,
      village: farm.location.village || '',
      latitude: farm.location.latitude?.toString() || '',
      longitude: farm.location.longitude?.toString() || '',
      area: farm.area.toString(),
      areaUnit: farm.areaUnit,
      soilType: farm.soilType,
      irrigationMethod: farm.irrigationMethod,
      description: farm.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined
        },
        area: Number(formData.area),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType,
        irrigationMethod: formData.irrigationMethod,
        description: formData.description
      };

      if (editingFarm) {
        await api.patch(`/farms/${editingFarm._id}`, payload);
      } else {
        await api.post('/farms', payload);
      }

      await refreshFarms();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save farm');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (farmId) => {
    if (!window.confirm('Are you sure you want to archive this farm?')) return;
    try {
      await api.delete(`/farms/${farmId}`);
      await refreshFarms();
    } catch (err) {
      alert(err.message || 'Failed to archive farm');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('farms.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {t('farms.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          {t('farms.createNew')}
        </Button>
      </div>

      {farms.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No registered farms yet"
          description={t('farms.noFarms')}
          actionLabel={t('farms.createNew')}
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {farms.map((farm) => {
            const isCurrent = selectedFarm?._id === farm._id;
            return (
              <Card
                key={farm._id}
                style={{
                  border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {farm.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      {farm.location.village ? `${farm.location.village}, ` : ''}{farm.location.district}, {farm.location.state}
                    </p>
                  </div>
                  <Badge variant={farm.status === 'active' ? 'success' : 'neutral'}>
                    {farm.status}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', padding: '12px', backgroundColor: 'var(--color-bg-ivory)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Area</span>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {farm.area} {farm.areaUnit}s
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Soil Type</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {farm.soilType}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Irrigation</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {farm.irrigationMethod}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>GPS Coordinates</span>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-main)' }}>
                      {farm.location.latitude?.toFixed(2) || '22.56'}°N, {farm.location.longitude?.toFixed(2) || '72.93'}°E
                    </div>
                  </div>
                </div>

                {farm.description && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {farm.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <Button
                    variant={isCurrent ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFarm(farm)}
                  >
                    {isCurrent ? 'Active Dashboard Farm' : 'Select Farm'}
                  </Button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" icon={Edit2} onClick={() => openEditModal(farm)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" icon={Archive} onClick={() => handleArchive(farm._id)}>
                      Archive
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Register / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Edit Farm Details' : t('farms.createNew')}
        maxWidth="560px"
      >
        <form onSubmit={handleSave}>
          <Input
            label={t('farms.farmName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sahyadri Organic Plot #2"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={t('farms.state')}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Gujarat"
              required
            />
            <Input
              label={t('farms.district')}
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Anand"
              required
            />
          </div>

          <Input
            label={t('farms.village')}
            value={formData.village}
            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            placeholder="e.g. Boriavi"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Latitude (for weather forecast)"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="22.5645"
            />
            <Input
              label="Longitude (for weather forecast)"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="72.9289"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <Input
              label={t('farms.area')}
              type="number"
              step="0.1"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="10.5"
              required
            />
            <Select
              label={t('farms.areaUnit')}
              value={formData.areaUnit}
              onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
              options={[
                { value: 'acre', label: 'Acres' },
                { value: 'hectare', label: 'Hectares' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label={t('farms.soilType')}
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              options={[
                { value: 'Alluvial', label: 'Alluvial' },
                { value: 'Black Cotton', label: 'Black Cotton' },
                { value: 'Red / Laterite', label: 'Red / Laterite' },
                { value: 'Sandy Loam', label: 'Sandy Loam' },
                { value: 'Clay Loam', label: 'Clay Loam' },
                { value: 'Loamy', label: 'Loamy' }
              ]}
            />
            <Select
              label={t('farms.irrigation')}
              value={formData.irrigationMethod}
              onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value })}
              options={[
                { value: 'Drip', label: 'Drip Irrigation' },
                { value: 'Sprinkler', label: 'Sprinkler System' },
                { value: 'Canal', label: 'Canal / Gravity' },
                { value: 'Tube Well', label: 'Tube Well / Flood' },
                { value: 'Rainfed', label: 'Rainfed (Dryland)' }
              ]}
            />
          </div>

          <Input
            label={t('farms.description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Special notes regarding microclimate or cultivation plans"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
