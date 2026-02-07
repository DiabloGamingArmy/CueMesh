import './cue-card.css';

type CueCardProps = {
  cue: Record<string, unknown>;
  onStandby?: () => void;
  onGo?: () => void;
  onAck?: () => void;
  onConfirm?: () => void;
  onCant?: () => void;
};

export const CueCard = ({ cue, onStandby, onGo, onAck, onConfirm, onCant }: CueCardProps) => {
  return (
    <article className="cue-card">
      <div className="cue-header">
        <div>
          <div className="cue-title">{String(cue.title ?? 'Untitled')}</div>
          <div className="cue-meta">
            <span>{String(cue.cueType ?? 'CUSTOM')}</span>
            <span>{String(cue.priority ?? 'MEDIUM')}</span>
            <span>Status: {String(cue.status ?? 'DRAFT')}</span>
          </div>
        </div>
        <div className="cue-actions">
          {onStandby && <button onClick={onStandby}>Standby</button>}
          {onGo && <button onClick={onGo}>Go</button>}
          {onAck && <button onClick={onAck}>ACK</button>}
          {onConfirm && <button onClick={onConfirm}>CONFIRM</button>}
          {onCant && <button className="warn" onClick={onCant}>CAN'T</button>}
        </div>
      </div>
      {cue.details && <p className="cue-details">{String(cue.details)}</p>}
    </article>
  );
};
