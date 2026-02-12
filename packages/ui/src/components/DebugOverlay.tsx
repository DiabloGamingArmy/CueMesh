import { useEffect, useMemo, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { logClientEvent } from '../services/firebase';

type OverlayError = {
  message: string;
  source: 'window.error' | 'unhandledrejection';
  timestamp: string;
};

export const DebugOverlay = ({ db }: { db: Firestore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<OverlayError[]>([]);

  const pushError = (next: OverlayError) => {
    setErrors((current) => [next, ...current].slice(0, 5));
  };

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.error instanceof Error ? event.error.stack ?? event.error.message : event.message;
      const payload: OverlayError = {
        message: message || 'Unknown error',
        source: 'window.error',
        timestamp: new Date().toISOString()
      };
      pushError(payload);
      void logClientEvent(db, {
        type: 'CLIENT_ERROR',
        source: payload.source,
        message: payload.message,
        timestamp: payload.timestamp
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.stack ?? reason.message : String(reason ?? 'Unknown rejection');
      const payload: OverlayError = {
        message,
        source: 'unhandledrejection',
        timestamp: new Date().toISOString()
      };
      pushError(payload);
      void logClientEvent(db, {
        type: 'CLIENT_UNHANDLED_REJECTION',
        source: payload.source,
        message: payload.message,
        timestamp: payload.timestamp
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [db]);

  const title = useMemo(() => `Debug Overlay (${errors.length})`, [errors.length]);

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        width: 360,
        maxWidth: 'calc(100vw - 24px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(11, 15, 20, 0.92)',
        color: '#e5e7eb',
        zIndex: 10000,
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
      }}
    >
      <button
        type="button"
        className="cm-btn"
        style={{ width: '100%', textAlign: 'left', border: 'none', borderRadius: '12px 12px 0 0' }}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? '▼' : '▶'} {title}
      </button>
      {isOpen ? (
        <div style={{ padding: 10, fontSize: 12, maxHeight: 220, overflow: 'auto' }}>
          {errors.length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>No captured errors.</div>
          ) : (
            errors.map((entry, index) => (
              <div
                key={`${entry.timestamp}-${index}`}
                style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div style={{ opacity: 0.75 }}>{entry.timestamp}</div>
                <div style={{ opacity: 0.75 }}>{entry.source}</div>
                <div>{entry.message}</div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};
