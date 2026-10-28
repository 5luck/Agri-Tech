import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className = '', title, subtitle, action, ...props }) => {
  return (
    <div className={clsx('agri-card', className)} {...props}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: subtitle ? '4px' : '16px' }}>
          {title && <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
};
