type CueCardProps = {
  cue: Record<string, unknown>;
  onStandby?: () => void;
  onGo?: () => void;
  onAck?: () => void;
  onConfirm?: () => void;
  onCant?: () => void;
  children?: React.ReactNode;
};

export const CueCard = ({
  cue,
  onStandby,
  onGo,
  onAck,
  onConfirm,
  onCant,
  children
}: CueCardProps) => {
  const requiresConfirm = Boolean(cue.requiresConfirm);
  const hasActions = Boolean(onStandby || onGo || onAck || onConfirm || onCant);

  return (
    <div className="cm-panel" style={{ background: 'rgba(255,255,255,.02)' }}>
      <div className="cm-panel-bd">
        <div className="cm-row">
          <div style={{ fontWeight: 900 }}>{String(cue.title ?? 'Untitled')}</div>
          <span className="cm-chip" style={{ fontFamily: 'var(--mono)' }}>
            {String(cue.cueType ?? 'CUSTOM')}
          </span>
          <span className="cm-chip">{String(cue.priority ?? 'MEDIUM')}</span>
          <div className="cm-spacer" />
          <span className="cm-chip">{String(cue.status ?? 'DRAFT')}</span>
        </div>

        {cue.details ? (
          <div style={{ marginTop: 8, color: 'var(--muted)', lineHeight: 1.35 }}>
            {String(cue.details)}
          </div>
        ) : null}

        {hasActions ? (
          <div className="cm-row" style={{ marginTop: 12 }}>
            {onStandby && (
              <button className="cm-btn cm-btn-warn" onClick={onStandby}>
                Standby
              </button>
            )}
            {onGo && (
              <button className="cm-btn cm-btn-bad" onClick={onGo}>
                Go
              </button>
            )}
            {onAck && (
              <button className="cm-btn cm-btn-good" onClick={onAck}>
                ACK
              </button>
            )}
            {requiresConfirm && onConfirm && (
              <button className="cm-btn cm-btn-warn" onClick={onConfirm}>
                CONFIRM
              </button>
            )}
            {onCant && (
              <button className="cm-btn cm-btn-bad" onClick={onCant}>
                CAN'T
              </button>
            )}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};
