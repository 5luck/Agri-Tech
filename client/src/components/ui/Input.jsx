import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: error ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          fontSize: '14px',
          color: 'var(--color-text-main)',
          outline: 'none',
          transition: 'var(--transition)'
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{helperText}</span>}
    </div>
  );
};
