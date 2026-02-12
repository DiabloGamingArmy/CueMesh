import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FirebaseContextValue } from '../services/firebase';
import { createShow } from '../services/firebase';
import { ErrorBanner } from '../components/ErrorBanner';

export const LandingPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [showId, setShowId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [debugStatus, setDebugStatus] = useState('Idle');
  const userId = firebase.user?.uid;

  const handleCreate = async () => {
    console.log('[CueMesh] CreateShow click', { userId, name, venue });
    if (!userId) {
      setErrorMessage('Not signed in (userId missing). Refresh and sign in again.');
      setDebugStatus('Blocked: missing userId');
      return;
    }
    if (isWorking) {
      setErrorMessage('Create already in progress…');
      setDebugStatus('Blocked: already working');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Show name is required.');
      setDebugStatus('Blocked: missing show name');
      return;
    }
    setIsWorking(true);
    setErrorMessage(null);
    setDebugStatus('Creating…');
    try {
      const id = await createShow(firebase.db, userId, name.trim(), venue, {
        email: firebase.user?.email ?? undefined
      });
      setDebugStatus(`Created show ${id}, navigating…`);
      navigate(`/show/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create show.';
      setErrorMessage(message);
      setDebugStatus(`Error: ${message}`);
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
          {errorMessage ? (
            <div style={{ marginBottom: 12 }}>
              <ErrorBanner message={errorMessage} />
            </div>
          ) : null}
          <label>
            Show name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Venue
            <input value={venue} onChange={(event) => setVenue(event.target.value)} />
          </label>
          <button
            className="cm-btn cm-btn-good"
            onClick={handleCreate}
            disabled={!userId || isWorking}
          >
            Create show
          </button>
          <div className="cm-stack" style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            <div>Auth UID: {userId ?? '(none)'}</div>
            <div>Working: {String(isWorking)}</div>
            <div>Status: {debugStatus}</div>
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
