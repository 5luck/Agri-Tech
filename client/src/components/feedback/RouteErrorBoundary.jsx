import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route error caught by ErrorBoundary:', error);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          padding: '36px 32px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FFEBEE',
            color: 'var(--color-danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <AlertTriangle size={30} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
          Something went wrong
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {error?.message || error?.statusText || 'An unexpected error occurred while rendering this view.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          <Link to="/dashboard">
            <Button variant="primary" icon={Home}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
