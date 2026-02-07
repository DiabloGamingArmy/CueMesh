import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { PresenceList } from '../components/PresenceList';
import type { FirebaseContextValue } from '../services/firebase';
import { joinShow, useMember, useMembers, usePresenceHeartbeat, useShow } from '../services/firebase';
import { Department, deriveAccessRoleFromDepartment } from '@cuemesh/shared';

export const ShowPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { show, error } = useShow(firebase.db, showId);
  const members = useMembers(firebase.db, showId);
  const member = useMember(firebase.db, showId, firebase.user?.uid);
  usePresenceHeartbeat(firebase.db, showId, firebase.user?.uid);
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState<Department>('DECK');
  const [customDeptLabel, setCustomDeptLabel] = useState('');
  const userId = firebase.user?.uid;
  const deviceId = useMemo(() => {
    const storageKey = 'cuemesh-device-id';
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(storageKey, next);
    return next;
  }, []);

  const handleJoin = async () => {
    if (!showId || !userId) return;
    if (!displayName.trim()) return;
    const accessRole = deriveAccessRoleFromDepartment(department);
    await joinShow(
      firebase.db,
      showId,
      userId,
      displayName.trim(),
      accessRole,
      department,
      deviceId,
      department === 'CUSTOM' ? customDeptLabel : undefined
    );
    const nextRoute = accessRole === 'DIRECTOR' ? 'director' : 'feed';
    navigate(`/show/${showId}/${nextRoute}`);
  };

  return (
    <div className="cm-shell">
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Show lobby</div>
          <span className="cm-chip">{String(show?.name ?? showId ?? 'Show')}</span>
        </div>
        <div className="cm-panel-bd">
          {error ? (
            <div className="cm-stack" style={{ marginBottom: 12 }}>
              <ErrorBanner message="You don’t have access to this show yet. If you just created it, refresh once." />
              <button className="cm-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : null}
          {member ? (
            <div className="cm-stack">
              <div className="cm-chip">
                You are joined as: {String(member.displayName ?? 'Crew')} /{' '}
                {String(member.department ?? 'Department')}
              </div>
              <div className="cm-row">
                <button className="cm-btn cm-btn-good" onClick={() => navigate(`/show/${showId}/feed`)}>
                  Open Operator Feed
                </button>
                {member.accessRole === 'DIRECTOR' ? (
                  <button className="cm-btn" onClick={() => navigate(`/show/${showId}/director`)}>
                    Open Director Console
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--muted)' }}>Choose your role and set presence.</p>
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </label>
              <label>
                Department
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value as Department)}
                >
                  {Object.values(Department).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              {department === 'CUSTOM' ? (
                <label>
                  Custom department label
                  <input
                    value={customDeptLabel}
                    onChange={(event) => setCustomDeptLabel(event.target.value)}
                  />
                </label>
              ) : null}
              <button
                className="cm-btn cm-btn-good"
                onClick={handleJoin}
                disabled={!userId || !displayName.trim()}
              >
                Join show
              </button>
            </>
          )}
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
