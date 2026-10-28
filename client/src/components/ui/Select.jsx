import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  id,
  required = false,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
      {label && (
        <label htmlFor={selectId} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)' }}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: error ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          fontSize: '14px',
          color: 'var(--color-text-main)',
          outline: 'none',
          cursor: 'pointer'
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
};
