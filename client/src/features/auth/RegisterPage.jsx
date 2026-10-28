import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'farmer',
    preferredLanguage: 'en',
    specialization: '',
    qualifications: '',
    yearsExperience: 0
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        preferredLanguage: formData.preferredLanguage,
        expertProfile: formData.role === 'expert' ? {
          specialization: formData.specialization.split(',').map((s) => s.trim()).filter(Boolean),
          qualifications: formData.qualifications.split(',').map((q) => q.trim()).filter(Boolean),
          yearsExperience: Number(formData.yearsExperience) || 0
        } : undefined
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        backgroundColor: 'var(--color-bg-ivory)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <Sprout size={24} color="#A8BE9A" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            Join Agri-Tech Platform
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Register as a farmer or an agricultural scientific advisor
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              border: '1px solid #FFCDD2',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Patel"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ramesh@example.com"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 00000"
            />
            <Select
              label="Preferred Language"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिन्दी (Hindi)' }
              ]}
            />
          </div>

          <Select
            label="Account Type"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'farmer', label: 'Farmer (Manage farms & crops)' },
              { value: 'expert', label: 'Agricultural Expert (Provide consultations)' }
            ]}
          />

          {formData.role === 'expert' && (
            <div style={{ backgroundColor: 'var(--color-bg-ivory)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'block', marginBottom: '8px' }}>
                Expert Credentials Verification
              </span>
              <Input
                label="Specialization (comma-separated)"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Soil Science, IPM, Plant Pathology"
              />
              <Input
                label="Degrees / Qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="e.g. M.Sc. Agronomy, Ph.D."
              />
              <Input
                label="Years of Advisory Experience"
                type="number"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleChange}
                min="0"
              />
            </div>
          )}

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '6px' }} loading={loading}>
            Create Account
          </Button>
        </form>

        <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
