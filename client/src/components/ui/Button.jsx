import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'padding: 6px 12px; font-size: 13px;',
    md: 'padding: 10px 18px; font-size: 14px;',
    lg: 'padding: 12px 24px; font-size: 16px;'
  };

  return (
    <button
      className={clsx('btn', `btn-${variant}`, className)}
      style={{
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '10px 18px',
        fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px'
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
};
