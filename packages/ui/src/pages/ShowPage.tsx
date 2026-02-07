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
    <div className="page">
      <section className="panel">
        <h2>{String(show?.name ?? 'Show')}</h2>
        <p>Choose your role to join and set your presence.</p>
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
        <button onClick={handleJoin} disabled={!userId}>
          Join show
        </button>
      </section>
      <PresenceList members={members as Array<{ id: string }>} />
    </div>
  );
};
