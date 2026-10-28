import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Sprout,
  AlertTriangle,
  Calendar,
  CloudSun,
  FlaskConical,
  Droplets,
  Wind,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../auth/AuthContext';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { EmptyState } from '../../components/ui/EmptyState';

export const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { farms, selectedFarm, setSelectedFarm } = useOutletContext();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingActivity, setTogglingActivity] = useState(false);

  useEffect(() => {
    if (selectedFarm?._id) {
      setLoading(true);
      api.get(`/farms/${selectedFarm._id}/summary`)
        .then((res) => {
          setSummaryData(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [selectedFarm]);

  const toggleTask = async (cropId, activityId) => {
    setTogglingActivity(true);
    try {
      await api.patch(`/crops/${cropId}/activities/${activityId}`);
      // Refresh summary
      const res = await api.get(`/farms/${selectedFarm._id}/summary`);
      setSummaryData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingActivity(false);
    }
  };

  if (!selectedFarm && farms.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Welcome to Agri-Tech!"
        description="You have not registered any farms yet. Register your first farm plot to begin monitoring crops, weather forecasts, and soil health."
        actionLabel="Register Your First Farm"
        onAction={() => {
          window.location.href = '/farms';
        }}
      />
    );
  }

  const { crops = [], latestSoil, weather, alerts = [] } = summaryData || {};

  // Extract upcoming activities across all active crops
  const upcomingActivities = [];
  crops.forEach((crop) => {
    (crop.activities || []).forEach((act) => {
      upcomingActivities.push({
        ...act,
        cropId: crop._id,
        cropName: crop.name
      });
    });
  });

  // Prepare chart data from 7-day weather forecast
  const weatherChartData = (weather?.forecast || []).map((day) => ({
    date: day.date ? day.date.slice(5) : '',
    maxTemp: day.tempMax,
    minTemp: day.tempMin,
    rain: day.precipitationSum || 0
  }));

  return (
    <div>
      {/* 1. Dashboard Greeting Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)', letterSpacing: '-0.5px' }}>
            {t('dashboard.welcome')}, {user?.name}!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <MapPin size={16} color="var(--color-primary)" />
            {selectedFarm?.name} — {selectedFarm?.location?.village ? `${selectedFarm.location.village}, ` : ''}
            {selectedFarm?.location?.district}, {selectedFarm?.location?.state} ({selectedFarm?.area} {selectedFarm?.areaUnit}s)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/crops">
            <Button variant="secondary" icon={Plus}>
              {t('dashboard.registerCrop')}
            </Button>
          </Link>
          <Link to="/soil">
            <Button variant="primary" icon={FlaskConical}>
              {t('dashboard.logSoilTest')}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Critical Alert Banner (if any) */}
      {alerts.length > 0 && alerts[0].status === 'unread' && (
        <AlertBanner
          severity={alerts[0].severity}
          title={alerts[0].title}
          message={alerts[0].description}
          action={
            <Link to="/alerts">
              <Button variant="outline" size="sm">View All Alerts</Button>
            </Link>
          }
        />
      )}

      {/* 3. Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{t('dashboard.totalFarms')}</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '4px' }}>
                {farms.length}
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{t('dashboard.activeCrops')}</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '4px' }}>
                {crops.length}
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{t('dashboard.upcomingTasks')}</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '4px' }}>
                {upcomingActivities.filter((a) => !a.completed).length}
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{t('dashboard.unreadAlerts')}</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: alerts.some((a) => a.severity === 'critical') ? 'var(--color-danger)' : 'var(--color-primary-dark)', marginTop: '4px' }}>
                {alerts.filter((a) => a.status === 'unread').length}
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Two-Column Dashboard Grid: Weather & Soil Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Weather Card */}
        <Card
          title={t('dashboard.currentWeather')}
          subtitle={weather?.provider ? `Provider: ${weather.provider} • Lat: ${selectedFarm?.location?.latitude?.toFixed(2) || '22.56'}, Lng: ${selectedFarm?.location?.longitude?.toFixed(2) || '72.93'}` : ''}
          action={
            <Link to="/weather">
              <Button variant="outline" size="sm" icon={ArrowRight}>
                7-Day Forecast
              </Button>
            </Link>
          }
        >
          {weather?.current ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CloudSun size={44} color="var(--color-primary)" />
                  <div>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      {weather.current.temperature}°C
                    </span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {weather.current.condition}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <Droplets size={16} /> Humidity: <strong>{weather.current.humidity}%</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    <Wind size={16} /> Wind: <strong>{weather.current.windSpeed} km/h</strong>
                  </div>
                </div>
              </div>

              {/* 7-Day Temperature Trend Chart */}
              {weatherChartData.length > 0 && (
                <div style={{ height: '160px', marginTop: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weatherChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis unit="°C" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="maxTemp" stroke="#244C3A" strokeWidth={2} name="High (°C)" />
                      <Line type="monotone" dataKey="minTemp" stroke="#A8BE9A" strokeWidth={2} name="Low (°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Weather telemetry loading...</p>
          )}
        </Card>

        {/* Latest Soil Health Card */}
        <Card
          title={t('dashboard.recentSoilReport')}
          subtitle={latestSoil ? `Sampled on ${new Date(latestSoil.measuredAt).toLocaleDateString()} (${latestSoil.source})` : 'No soil reports logged'}
          action={
            <Link to="/soil">
              <Button variant="outline" size="sm" icon={ArrowRight}>
                Soil History
              </Button>
            </Link>
          }
        >
          {latestSoil?.measurements ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>pH Value</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '2px' }}>
                    {latestSoil.measurements.ph}
                  </div>
                  <Badge variant={latestSoil.measurements.ph >= 6 && latestSoil.measurements.ph <= 7.5 ? 'success' : 'warning'}>
                    {latestSoil.measurements.ph >= 6 && latestSoil.measurements.ph <= 7.5 ? 'Optimal' : 'Needs Buffer'}
                  </Badge>
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Nitrogen (N)</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '2px' }}>
                    {latestSoil.measurements.nitrogen}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>kg/ha</span>
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Moisture</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '2px' }}>
                    {latestSoil.measurements.moisture}%
                  </div>
                  <Badge variant={latestSoil.measurements.moisture >= 40 ? 'success' : 'danger'}>
                    {latestSoil.measurements.moisture >= 40 ? 'Sufficient' : 'Deficit'}
                  </Badge>
                </div>
              </div>

              {/* Agronomic Recommendations preview */}
              {latestSoil.recommendations?.length > 0 && (
                <div style={{ backgroundColor: 'var(--color-sage-light)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    Top Recommendation:
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {latestSoil.recommendations[0].action}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <FlaskConical size={32} color="var(--color-sage)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                No soil record found for this farm yet.
              </p>
              <Link to="/soil">
                <Button variant="primary" size="sm">Log Soil Test</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* 5. Active Crops & Upcoming Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Active Crops on this farm */}
        <Card
          title={t('crops.title')}
          action={
            <Link to="/crops">
              <Button variant="outline" size="sm" icon={ArrowRight}>
                View All Crops
              </Button>
            </Link>
          }
        >
          {crops.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '16px 0' }}>
              {t('crops.noCrops')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {crops.map((crop) => (
                <div
                  key={crop._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-ivory)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sprout size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {crop.name} {crop.variety && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({crop.variety})</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Area: {crop.cultivatedArea} {selectedFarm?.areaUnit}s • Sown: {new Date(crop.plantingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="neutral">{crop.growthStage}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Scheduled Tasks Checklist */}
        <Card title={t('dashboard.recentActivities')}>
          {upcomingActivities.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '16px 0' }}>
              No activities scheduled.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingActivities.slice(0, 5).map((act) => (
                <div
                  key={act._id}
                  onClick={() => toggleTask(act.cropId, act._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: act.completed ? '#F1F8E9' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      color: act.completed ? 'var(--color-success)' : 'var(--color-border)'
                    }}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, textDecoration: act.completed ? 'line-through' : 'none', color: act.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {act.cropName} • Due: {new Date(act.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={act.completed ? 'success' : 'warning'}>
                    {act.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
