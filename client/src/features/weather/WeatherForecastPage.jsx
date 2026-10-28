import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudSun,
  Droplets,
  Wind,
  Calendar,
  AlertTriangle,
  Clock,
  Compass,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import { Badge } from '../../components/ui/Badge';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { EmptyState } from '../../components/ui/EmptyState';

export const WeatherForecastPage = () => {
  const { t } = useTranslation();
  const { selectedFarm } = useOutletContext();

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedFarm?._id) {
      setLoading(true);
      api.get(`/weather/farm/${selectedFarm._id}/forecast`)
        .then((res) => {
          setWeatherData(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [selectedFarm]);

  if (!selectedFarm) {
    return (
      <EmptyState
        icon={CloudSun}
        title="No Farm Selected"
        description="Select or create a farm to view live Open-Meteo weather telemetry."
      />
    );
  }

  const { current, forecast = [], hourly = [], coordinates, provider, isCached, notice } = weatherData || {};

  // Temperature forecast chart
  const tempChartData = forecast.map((d) => ({
    date: d.date ? d.date.slice(5) : '',
    High: d.tempMax,
    Low: d.tempMin
  }));

  // Precipitation chart
  const rainChartData = forecast.map((d) => ({
    date: d.date ? d.date.slice(5) : '',
    RainProbability: d.precipitationProbability || 0,
    RainfallMM: d.precipitationSum || 0
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          {t('weather.title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          {selectedFarm.name} ({selectedFarm.location.district}, {selectedFarm.location.state}) • Provider: {provider || 'Open-Meteo'}
        </p>
      </div>

      {notice && (
        <AlertBanner severity="moderate" title="Weather Telemetry Notice" message={notice} />
      )}

      {/* Current Conditions Card */}
      {current && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudSun size={40} color="var(--color-primary)" />
              </div>
              <div>
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1 }}>
                  {current.temperature}°C
                </span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                  {current.condition}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  GPS: {coordinates?.latitude?.toFixed(2)}°N, {coordinates?.longitude?.toFixed(2)}°E
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', backgroundColor: 'var(--color-bg-ivory)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Humidity</span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {current.humidity}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Wind Speed</span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {current.windSpeed} km/h
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Precipitation</span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {current.precipitation || 0} mm
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 7-Day Forecast Cards */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
        {t('weather.forecast7Days')}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {forecast.map((day, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <CloudSun size={28} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {day.tempMax}° / <span style={{ color: 'var(--color-text-muted)' }}>{day.tempMin}°</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {day.condition}
            </div>
            <div style={{ fontSize: '11px', color: '#1565C0', marginTop: '6px', fontWeight: 600 }}>
              💧 {day.precipitationProbability}%
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Forecast Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <Card title="7-Day Temperature Range (°C)">
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE3" />
                <XAxis dataKey="date" />
                <YAxis unit="°C" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="High" stroke="#244C3A" strokeWidth={2} />
                <Line type="monotone" dataKey="Low" stroke="#A8BE9A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Precipitation Probability & Rainfall (mm)">
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="RainProbability" fill="#4F7958" radius={[4, 4, 0, 0]} name="Rain Probability (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
