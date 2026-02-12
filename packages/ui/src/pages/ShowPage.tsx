import { useEffect, useMemo, useState } from 'react';
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
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (show || error) {
      setIsLoading(false);
      return;
    }
    const timeout = window.setTimeout(() => setIsLoading(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [show, error]);

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
    if (!showId || !userId || !displayName.trim()) return;
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

  const handleCopyShowId = async () => {
    if (!showId) return;
    try {
      await navigator.clipboard.writeText(showId);
      setCopyStatus('Copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  };

  return (
    <div className="cm-shell">
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Show Lobby</div>
          <span className="cm-chip">{String(show?.name ?? showId ?? 'Show')}</span>
        </div>
        <div className="cm-panel-bd cm-stack">
          {isLoading ? <div className="cm-muted">Loading show…</div> : null}

          {error ? (
            <div className="cm-stack">
              <ErrorBanner message={`Unable to load show: ${error.message}`} />
              <div className="cm-muted">Common causes: rules deny read, membership missing.</div>
            </div>
          ) : null}

          <div className="cm-row" style={{ alignItems: 'center' }}>
            <strong>Show ID:</strong>
            <code>{showId ?? '(missing)'}</code>
            <button className="cm-btn" onClick={handleCopyShowId} disabled={!showId}>
              Copy Show ID
            </button>
            {copyStatus ? <span className="cm-chip">{copyStatus}</span> : null}
          </div>

          <div className="cm-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div className="cm-panel">
              <div className="cm-panel-bd">
                <div className="cm-muted">Show name</div>
                <div>{String(show?.name ?? '(unavailable)')}</div>
              </div>
            </div>
            <div className="cm-panel">
              <div className="cm-panel-bd">
                <div className="cm-muted">Venue</div>
                <div>{String(show?.venue ?? '(unavailable)')}</div>
              </div>
            </div>
            <div className="cm-panel">
              <div className="cm-panel-bd">
                <div className="cm-muted">Status</div>
                <div>{String(show?.status ?? '(unavailable)')}</div>
              </div>
            </div>
          </div>

          <div className="cm-panel">
            <div className="cm-panel-bd">
              <strong>You are:</strong>{' '}
              {member
                ? `${String(member.displayName ?? 'Crew')} (${String(member.accessRole ?? 'CREW')})`
                : 'Not joined yet'}
            </div>
          </div>

          <div className="cm-row">
            <button className="cm-btn cm-btn-good" onClick={() => navigate(`/show/${showId}/feed`)}>
              Open Feed
            </button>
            {member?.accessRole === 'DIRECTOR' ? (
              <button className="cm-btn" onClick={() => navigate(`/show/${showId}/director`)}>
                Open Director
              </button>
            ) : null}
          </div>

          {!member ? (
            <>
              <p style={{ color: 'var(--muted)' }}>Join this show to establish membership identity.</p>
              <label>
                Display name
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
              </label>
              <label>
                Department
                <select value={department} onChange={(event) => setDepartment(event.target.value as Department)}>
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
                className="cm-btn"
                onClick={handleJoin}
                disabled={!userId || !displayName.trim() || !showId}
              >
                Join show
              </button>
            </>
          ) : null}
        </div>
      </section>

      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Members ({members.length})</div>
        </div>
        <div className="cm-panel-bd cm-stack">
          {members.length ? (
            <ul>
              {members.map((entry) => (
                <li key={String(entry.id)}>
                  {String(entry.displayName ?? entry.userId ?? entry.id)} —{' '}
                  {String(entry.department ?? entry.accessRole ?? 'Unknown')}
                </li>
              ))}
            </ul>
          ) : (
            <div className="cm-muted">No members found.</div>
          )}
          <PresenceList members={members as Array<{ id: string }>} />
        </div>
      </section>
    </div>
  );
};
