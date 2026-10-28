import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  FlaskConical,
  CloudSun,
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
  Users,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms'), icon: MapPin },
    { to: '/crops', label: t('nav.crops'), icon: Sprout },
    { to: '/soil', label: t('nav.soil'), icon: FlaskConical },
    { to: '/weather', label: t('nav.weather'), icon: CloudSun },
    { to: '/alerts', label: t('nav.alerts'), icon: AlertTriangle },
    { to: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { to: '/orders', label: t('nav.orders'), icon: PackageCheck },
    { to: '/consultations', label: t('nav.consultations'), icon: Users },
    { to: '/community', label: t('nav.community'), icon: MessageSquare }
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: t('nav.admin'), icon: ShieldCheck });
  }

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sprout size={20} color="#A8BE9A" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', letterSpacing: '-0.5px' }}>
            Agri-Tech
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Smart Farming Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                  backgroundColor: isActive ? 'var(--color-sage-light)' : 'transparent',
                  transition: 'var(--transition)'
                })}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User Role Status */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-ivory)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success)'
          }}
        />
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
          Connected as: <strong>{user?.role || 'Guest'}</strong>
        </span>
      </div>
    </aside>
  );
};
