import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import type { FirebaseContextValue } from '../services/firebase';
import { addAck, addCant, addConfirm, useCues } from '../services/firebase';
import { Priority, Role } from '@cuemesh/shared';
import './feed.css';

export const FeedPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const [role, setRole] = useState<Role>('OPERATOR');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const userId = firebase.user?.uid;

  const filtered = useMemo(() => {
    return cues.filter((cue) => {
      const targets = cue.targets as { roles?: string[] } | undefined;
      const targetRoles = targets?.roles;
      const matchesRole = !targetRoles?.length || targetRoles.includes(role);
      const matchesPriority = priority === 'ALL' || cue.priority === priority;
      return matchesRole && matchesPriority;
    });
  }, [cues, priority, role]);

  const standbyCues = filtered.filter((cue) => cue.status === 'STANDBY');
  const goCues = filtered.filter((cue) => cue.status === 'GO');

  const handleCant = async (cueId: string) => {
    if (!showId || !userId) return;
    const note = window.prompt('Add a CAN\'T note', 'Cannot execute cue');
    if (!note) return;
    await addCant(firebase.db, showId, cueId, userId, note);
  };

  return (
    <div>
      <section className="filters">
        <label>
          Role filter
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {Object.values(Role).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as Priority | 'ALL')}>
            <option value="ALL">ALL</option>
            {Object.values(Priority).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </section>
      <div className="rails">
        <div>
          <h3>Standby rail</h3>
          {standbyCues.map((cue) => (
            <CueCard
              key={String(cue.id)}
              cue={cue}
              onAck={
                userId && showId
                  ? () => addAck(firebase.db, showId, String(cue.id), userId)
                  : undefined
              }
              onConfirm={
                userId && showId
                  ? () => addConfirm(firebase.db, showId, String(cue.id), userId)
                  : undefined
              }
              onCant={userId && showId ? () => handleCant(String(cue.id)) : undefined}
            />
          ))}
        </div>
        <div>
          <h3>Go rail</h3>
          {goCues.map((cue) => (
            <CueCard
              key={String(cue.id)}
              cue={cue}
              onAck={
                userId && showId
                  ? () => addAck(firebase.db, showId, String(cue.id), userId)
                  : undefined
              }
              onConfirm={
                userId && showId
                  ? () => addConfirm(firebase.db, showId, String(cue.id), userId)
                  : undefined
              }
              onCant={userId && showId ? () => handleCant(String(cue.id)) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
