import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  CloudSun,
  FlaskConical,
  ShieldAlert,
  ShoppingBag,
  Users,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does Agri-Tech obtain weather forecasting information?',
      a: 'We integrate directly with Open-Meteo services using your farm exact geographic coordinates. Observations are automatically updated and cached on our secure backend to guarantee minimal latency.'
    },
    {
      q: 'Can I track multiple farm plots with different soil characteristics?',
      a: 'Yes. You can register multiple farms across any Indian state or district, specifying distinct acreage, soil types (e.g. Alluvial, Black Cotton, Sandy Loam), and irrigation setups.'
    },
    {
      q: 'Are the soil health recommendations automated or verified?',
      a: 'Our soil module uses transparent, published agronomic thresholds based on pH, available N-P-K, and moisture ranges. Recommendations clearly indicate parameter deficits and recommended corrective amendments.'
    },
    {
      q: 'How does expert consultation work?',
      a: 'Farmers can browse verified agricultural scientists, review their qualifications and languages, and submit targeted consultation requests with farm and crop details.'
    }
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-ivory)',
          padding: '80px 36px 90px',
          borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(180deg, #F7F6EF 0%, #E8EFE3 100%)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-sage-light)',
                border: '1px solid var(--color-sage)',
                color: 'var(--color-primary-dark)',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px'
              }}
            >
              <Sprout size={16} /> Smart Farming Management System
            </div>
            <h1
              style={{
                fontSize: '44px',
                lineHeight: 1.15,
                fontWeight: 800,
                color: 'var(--color-primary-dark)',
                letterSpacing: '-1px',
                marginBottom: '20px'
              }}
            >
              Smarter Farming Starts With Better Decisions.
            </h1>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
                marginBottom: '32px'
              }}
            >
              Manage your farms, monitor crop conditions, understand weather risks, and connect with agricultural experts through one simple, secure platform.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  {t('nav.getStarted')}
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Live Farm Monitor</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Surya Kiran Agro Farm</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Anand, Gujarat • 12.5 Acres</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>29.4°C</span>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Mainly clear • 58% Humidity</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Active Crop Stage</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>Sharbati Wheat</div>
                <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>Vegetative • 7.0 Acres</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Soil Status</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>pH 6.8 (Optimal)</div>
                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Moisture 52%</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} color="#F57F17" />
              <div style={{ fontSize: '12px', color: '#795548' }}>
                <strong>Upcoming Activity:</strong> CRI stage first irrigation due in 3 days.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section id="features" style={{ padding: '80px 36px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
              Designed For Real Farmers & Agricultural Decision Makers
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
              From sowing to harvest, manage every facet of your farm operation with reliable, data-backed agricultural tools.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sprout size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Farm & Crop Tracking</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Record farm boundaries, soil types, and active crops. Maintain scheduled timelines for irrigation, fertilizer split-dosing, and expected harvest dates.
              </p>
            </div>

            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FlaskConical size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Soil Health Analytics</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Store laboratory or sensor soil tests. Receive transparent rule-based advisories for pH balancing, NPK adjustments, and organic soil amendment.
              </p>
            </div>

            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CloudSun size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Live Weather & Risks</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Real 7-day weather forecasts and rainfall probabilities via Open-Meteo, allowing proactive defense against sudden rain, frost, and high winds.
              </p>
            </div>

            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Expert Consultations</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Submit consultation inquiries directly to verified agronomists and plant protection specialists. Exchange diagnostics and actionable recommendations.
              </p>
            </div>

            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShoppingBag size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Agricultural Marketplace</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Browse certified seeds, bio-fertilizers, and drip equipment. Place orders with transparent real-time inventory checks.
              </p>
            </div>

            <div className="agri-card">
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldAlert size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>Pest & Disease Alerts</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Receive verified pest outbreak warnings and advisory bulletins. Review recommended chemical or biological control actions before damage spreads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" style={{ padding: '80px 36px', backgroundColor: 'var(--color-bg-ivory)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '48px' }}>
            How Agri-Tech Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
                1
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Register Your Farm</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Enter your acreage, coordinates, and soil classification to customize local weather and crop advisories.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '32px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
                2
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Track Crops & Soil</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Log your planting dates, schedule irrigation activities, and enter soil tests to generate nutrient recommendations.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '32px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
                3
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Act With Confidence</h4>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Stay ahead of pest risks, procure genuine inputs from the marketplace, and consult verified agronomists anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions */}
      <section id="faq" style={{ padding: '80px 36px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', textAlign: 'center', marginBottom: '40px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    textAlign: 'left',
                    background: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--color-primary-dark)'
                  }}
                >
                  {faq.q}
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', padding: '64px 36px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
            Empower Your Farm Operations Today
          </h2>
          <p style={{ fontSize: '16px', color: '#A8BE9A', marginBottom: '32px' }}>
            Join forward-thinking farmers and agricultural experts managing crops with precision.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
