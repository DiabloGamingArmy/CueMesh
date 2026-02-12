import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FirebaseContextValue } from '../services/firebase';
import { createShow, logClientEvent } from '../services/firebase';
import { ErrorBanner } from '../components/ErrorBanner';
import type { BuildInfo } from '../App';

export const LandingPage = ({
  firebase,
  buildInfo
}: {
  firebase: FirebaseContextValue;
  buildInfo?: BuildInfo;
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [showId, setShowId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [debug, setDebug] = useState<string | null>('Idle');
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [clickReceivedAt, setClickReceivedAt] = useState<string | null>(null);
  const userId = firebase.user?.uid;
  const debugEnabled =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const pushAction = (message: string) => {
    setActionLog((current) => [message, ...current].slice(0, 10));
  };

  const buildShaShort = (buildInfo?.sha ?? 'dev').slice(0, 7);
  const buildTime = buildInfo?.time ?? 'local';

  const handleCreate = async () => {
    const now = new Date();
    const clickStamp = `${now.toLocaleTimeString([], { hour12: false })}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setClickReceivedAt(clickStamp);
    pushAction(`Click received at ${clickStamp}`);
    setDebug('Create clicked');
    pushAction('Clicked');
    if (debugEnabled) window.alert('Create Show clicked (debug=1)');
    console.log('[CueMesh] CreateShow click', { userId, name, venue });

    if (!firebase.user) {
      const message =
        'Not signed in or auth not ready. If you just signed in, wait 1–2 seconds and try again.';
      setErrorMessage(message);
      setDebug('Blocked: no user');
      pushAction('User present: no');
      await logClientEvent(firebase.db, {
        type: 'CREATE_SHOW_BLOCKED_AUTH',
        reason: 'NO_USER',
        showName: name.trim(),
        venue,
        clickReceivedAt: clickStamp
      });
      return;
    }

    pushAction('User present: yes');

    if (isWorking) {
      setErrorMessage('Create already in progress…');
      setDebug('Blocked: already working');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Show name is required.');
      setDebug('Blocked: missing show name');
      return;
    }

    setIsWorking(true);
    setErrorMessage(null);
    setDebug('Creating show…');
    pushAction('Attempting Firestore batch…');

    try {
      const id = await createShow(firebase.db, firebase.user.uid, name.trim(), venue, {
        email: firebase.user.email ?? undefined
      });
      setDebug(`Created show ${id}, navigating…`);
      pushAction(`Created showId=${id}`);
      pushAction(`Navigating to /show/${id}`);
      navigate(`/show/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create show.';
      console.error('[CueMesh] CreateShow failed', error);
      setErrorMessage(message);
      setDebug(`Create failed: ${message}`);
      pushAction(`Create failed: ${message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handleJoin = () => {
    if (!showId) return;
    navigate(`/show/${showId}`);
  };

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Create a show</div>
        </div>
        <div className="cm-panel-bd">
          <div className="cm-muted" style={{ marginBottom: 8 }}>
            Build: {buildShaShort} / {buildTime}
          </div>
          {errorMessage ? (
            <div style={{ marginBottom: 12 }}>
              <ErrorBanner message={errorMessage} />
            </div>
          ) : null}

          <div className="cm-stack" style={{ marginBottom: 10, fontSize: 12, color: 'var(--muted)' }}>
            <div>Signed in as: {firebase.user?.email ?? '(none)'}</div>
            <div>UID: {userId ?? '(none)'}</div>
            <div>Working: {String(isWorking)}</div>
            <div>Last action: {debug ?? '(none)'}</div>
          </div>

          <div className="cm-panel" style={{ marginBottom: 10 }}>
            <div className="cm-panel-bd" style={{ fontSize: 12 }}>
              <strong>Action Log</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                {actionLog.length ? (
                  actionLog.map((entry, idx) => <li key={`${entry}-${idx}`}>{entry}</li>)
                ) : (
                  <li>No actions yet.</li>
                )}
              </ul>
            </div>
          </div>

          <label>
            Show name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Venue
            <input value={venue} onChange={(event) => setVenue(event.target.value)} />
          </label>
          <button
            type="button"
            className="cm-btn cm-btn-good"
            onPointerDown={() => {
              const now = new Date();
              const stamp = `${now.toLocaleTimeString([], { hour12: false })}.${String(now.getMilliseconds()).padStart(3, '0')}`;
              pushAction(`PointerDown at ${stamp}`);
            }}
            onClick={handleCreate}
            disabled={isWorking}
          >
            {isWorking ? 'Creating…' : 'Create show'}
          </button>
          <div className="cm-muted" style={{ marginTop: 8, fontSize: 12 }}>
            {clickReceivedAt ? `Click received at ${clickReceivedAt}` : 'Waiting for create interaction…'}
          </div>
        </div>
      </section>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Join a show</div>
        </div>
        <div className="cm-panel-bd">
          <label>
            Show ID
            <input value={showId} onChange={(event) => setShowId(event.target.value)} />
          </label>
          <button className="cm-btn" onClick={handleJoin}>
            Join show
          </button>
        </div>
      </section>
    </div>
  );
};
