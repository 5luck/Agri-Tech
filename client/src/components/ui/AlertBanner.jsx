import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AlertBanner = ({
  severity = 'moderate',
  title,
  message,
  action,
  className = ''
}) => {
  const styles = {
    low: { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', Icon: CheckCircle2 },
    moderate: { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17', Icon: Info },
    high: { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100', Icon: AlertTriangle },
    critical: { bg: '#FFEBEE', border: '#FFCDD2', text: '#C62828', Icon: AlertCircle }
  };

  const { bg, border, text, Icon } = styles[severity] || styles.moderate;

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '14px'
      }}
      className={className}
    >
      <Icon size={20} color={text} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 600, fontSize: '14px', color: text, marginBottom: '2px' }}>{title}</div>}
        {message && <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>{message}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
