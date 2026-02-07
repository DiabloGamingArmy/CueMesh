import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import { PresenceList } from '../components/PresenceList';
import type { FirebaseContextValue } from '../services/firebase';
import { addAck, addCant, addConfirm, useCues, useMembers, useShow } from '../services/firebase';
import { Priority, Role } from '@cuemesh/shared';
import { getNativeBridge } from '../nativeBridge';

export const FeedPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const members = useMembers(firebase.db, showId);
  const show = useShow(firebase.db, showId);
  const [role, setRole] = useState<Role>('OPERATOR');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const userId = firebase.user?.uid;
  const playedGoRef = useRef<Set<string>>(new Set());
  const native = getNativeBridge();

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

  useEffect(() => {
    if (!native?.playAudio) return;
    goCues.forEach((cue) => {
      const cueId = String(cue.id ?? '');
      if (!cueId || playedGoRef.current.has(cueId)) return;
      playedGoRef.current.add(cueId);
      native.playAudio('assets/beep.wav').catch(() => undefined);
    });
  }, [goCues, native]);

  const handleCant = async (cueId: string) => {
    if (!showId || !userId) return;
    const note = window.prompt("Add a CAN'T note", 'Cannot execute cue');
    if (!note) return;
    await addCant(firebase.db, showId, cueId, userId, note);
  };

  return (
    <div className="cm-shell">
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Operator Feed</div>
          <div className="cm-row">
            <span className="cm-chip">Role: {role}</span>
            <span className="cm-chip">Show: {String(show?.name ?? showId ?? 'Unknown')}</span>
          </div>
        </div>
        <div className="cm-panel-bd">
          <div className="cm-row" style={{ marginBottom: 12 }}>
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
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority | 'ALL')}
              >
                <option value="ALL">ALL</option>
                {Object.values(Priority).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="cm-grid-rails">
            <div className="cm-rail cm-rail-standby">
              <div className="cm-rail-hd">
                <span>STANDBY</span>
                <span className="cm-chip">{standbyCues.length}</span>
              </div>
              <div className="cm-rail-bd">
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
            </div>
            <div className="cm-rail cm-rail-go">
              <div className="cm-rail-hd">
                <span>GO</span>
                <span className="cm-chip">{goCues.length}</span>
              </div>
              <div className="cm-rail-bd">
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
        </div>
      </section>
      <aside className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Presence</div>
        </div>
        <div className="cm-panel-bd">
          <PresenceList members={members as Array<{ id: string }>} />
        </div>
      </aside>
    </div>
  );
};
