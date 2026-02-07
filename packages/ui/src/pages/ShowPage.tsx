import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PresenceList } from '../components/PresenceList';
import type { FirebaseContextValue } from '../services/firebase';
import { joinShow, useMembers, useShow } from '../services/firebase';
import { Role } from '@cuemesh/shared';

export const ShowPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const show = useShow(firebase.db, showId);
  const members = useMembers(firebase.db, showId);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');
  const userId = firebase.user?.uid;
  const deviceId = useMemo(() => crypto.randomUUID(), []);

  const handleJoin = async () => {
    if (!showId || !userId) return;
    await joinShow(firebase.db, showId, userId, displayName || 'Crew', role, deviceId);
    navigate(`/show/${showId}/feed`);
  };

  return (
    <div className="cm-shell">
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Show lobby</div>
          <span className="cm-chip">{String(show?.name ?? showId ?? 'Show')}</span>
        </div>
        <div className="cm-panel-bd">
          <p style={{ color: 'var(--muted)' }}>Choose your role and set presence.</p>
          <label>
            Display name
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {Object.values(Role).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <button className="cm-btn cm-btn-good" onClick={handleJoin} disabled={!userId}>
            Join show
          </button>
        </div>
      </section>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Presence</div>
        </div>
        <div className="cm-panel-bd">
          <PresenceList members={members as Array<{ id: string }>} />
        </div>
      </section>
    </div>
  );
};
