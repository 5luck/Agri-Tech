import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Globe } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../ui/Button';

export const PublicLayout = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Top Navbar */}
      <header
        style={{
          height: '72px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sprout size={20} color="#A8BE9A" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Agri-Tech
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>How It Works</a>
          <a href="#advisory" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>Expert Network</a>
          <a href="#faq" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>FAQ</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-ivory)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--color-primary)'
            }}
          >
            <Globe size={16} />
            {i18n.language === 'hi' ? 'English' : 'हिन्दी'}
          </button>

          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">{t('nav.getStarted')}</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-primary-dark)', color: '#FFFFFF', padding: '48px 36px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sprout size={24} color="#A8BE9A" />
              <span style={{ fontSize: '18px', fontWeight: 700 }}>Agri-Tech</span>
            </div>
            <p style={{ fontSize: '13px', color: '#A8BE9A', lineHeight: 1.6 }}>
              Smart farming management platform empowering agricultural decision-makers through transparent analytics, real-time weather risks, and expert agronomic guidance.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#A8BE9A' }}>
              <li><Link to="/farms">Farm Monitoring</Link></li>
              <li><Link to="/soil">Soil Nutrient Analytics</Link></li>
              <li><Link to="/weather">Weather Forecaster</Link></li>
              <li><Link to="/marketplace">Agri Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>Consultation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#A8BE9A' }}>
              <li><Link to="/consultations">Find Certified Agronomists</Link></li>
              <li><Link to="/community">Farmer Discussion Forum</Link></li>
              <li><Link to="/alerts">Pest Advisories</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#FFFFFF' }}>Compliance & Trust</h4>
            <p style={{ fontSize: '13px', color: '#A8BE9A', lineHeight: 1.6 }}>
              Weather telemetry powered by Open-Meteo API. Soil guidance adheres to transparent agricultural threshold standards.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#A8BE9A' }}>
          © {new Date().getFullYear()} Agri-Tech Platform. Designed for modern, sustainable agriculture.
        </div>
      </footer>
    </div>
  );
};
