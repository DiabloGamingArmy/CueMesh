import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScriptProbeReport } from '../debug/scriptProbe';

const isEnabled = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('debugScripts') === '1' || window.localStorage.getItem('cuemesh-debug-scripts') === '1';
};

export const DebugScriptsPanel = () => {
  const [tick, setTick] = useState(0);
  const enabled = isEnabled();

  const report = useMemo(() => getScriptProbeReport(), [tick]);

  if (!enabled) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 320,
        maxHeight: 320,
        overflow: 'auto',
        background: 'rgba(17, 24, 39, 0.9)',
        color: 'white',
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.15)',
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Script Probe</strong>
        <button className="cm-btn" onClick={() => setTick((prev) => prev + 1)}>
          Refresh
        </button>
      </div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="cm-btn" onClick={handleCopy}>
          Copy report
        </button>
        <Link className="cm-btn" to="/debug">
          Deployment check
        </Link>
      </div>
      <div style={{ fontSize: 12 }}>
        <div>Scripts: {report.scripts.length}</div>
        <div>Errors: {report.errors.length}</div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11 }}>
        {report.scripts.map((event) => (
          <div key={`${event.time}-${event.meta.src}`} style={{ marginBottom: 6 }}>
            <div>{event.meta.src}</div>
            <div style={{ opacity: 0.7 }}>{event.meta.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
