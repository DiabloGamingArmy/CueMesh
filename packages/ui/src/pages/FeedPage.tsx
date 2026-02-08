import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import { PresenceList } from '../components/PresenceList';
import type { FirebaseContextValue } from '../services/firebase';
import { addAck, addCant, addConfirm, useCues, useMembers, usePresenceHeartbeat, useShow } from '../services/firebase';
import type { Cue, Member } from '@cuemesh/shared';
import { AccessRole, Department, Priority, cueTargetsMember } from '@cuemesh/shared';
import { getNativeBridge } from '../nativeBridge';

export const FeedPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const members = useMembers(firebase.db, showId);
  const { show } = useShow(firebase.db, showId);
  usePresenceHeartbeat(firebase.db, showId, firebase.user?.uid);
  const [department, setDepartment] = useState<Department>('DECK');
  const [accessRole, setAccessRole] = useState<AccessRole>('CREW');
  const [priority, setPriority] = useState<Priority | 'ALL'>('ALL');
  const userId = firebase.user?.uid;
  const playedGoRef = useRef<Set<string>>(new Set());
  const native = getNativeBridge();

  useEffect(() => {
    const selfMember = members.find((member) => member.id === userId);
    if (!selfMember) return;
    if (selfMember.department) {
      setDepartment(selfMember.department as Department);
    }
    if (selfMember.accessRole) {
      setAccessRole(selfMember.accessRole as AccessRole);
    }
  }, [members, userId]);

  const currentMember = useMemo(
    () => ({ department, accessRole }) satisfies Pick<Member, 'department' | 'accessRole'>,
    [department, accessRole]
  );

  const filtered = useMemo(() => {
    return cues.filter((cue) => {
      const matchesTargets = cueTargetsMember(cue as Cue, currentMember);
      const matchesPriority = priority === 'ALL' || cue.priority === priority;
      return matchesTargets && matchesPriority;
    });
  }, [cues, currentMember, priority]);

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
            <span className="cm-chip">Department: {department}</span>
            <span className="cm-chip">Access: {accessRole}</span>
            <span className="cm-chip">Show: {String(show?.name ?? showId ?? 'Unknown')}</span>
          </div>
        </div>
        <div className="cm-panel-bd">
          <div className="cm-row" style={{ marginBottom: 12 }}>
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
