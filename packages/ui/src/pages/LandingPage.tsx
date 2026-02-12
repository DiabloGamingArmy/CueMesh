import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FirebaseContextValue } from '../services/firebase';
import { createShow, logClientEvent } from '../services/firebase';
import { ErrorBanner } from '../components/ErrorBanner';
import type { BuildInfo } from '../App';

export const LandingPage = ({
  firebase
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

  const handleCreate = async () => {
    if (!firebase.user) {
      const message =
        'Not signed in or auth not ready. If you just signed in, wait 1–2 seconds and try again.';
      setErrorMessage(message);
      await logClientEvent(firebase.db, {
        type: 'CREATE_SHOW_BLOCKED_AUTH',
        reason: 'NO_USER',
        showName: name.trim(),
        venue
      });
      return;
    }

    if (isWorking) {
      setErrorMessage('Create already in progress…');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Show name is required.');
      return;
    }

    setIsWorking(true);
    setErrorMessage(null);

    try {
      const id = await createShow(firebase.db, firebase.user.uid, name.trim(), venue, {
        email: firebase.user.email ?? undefined
      });
      navigate(`/show/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create show.';
      console.error('[CueMesh] CreateShow failed', error);
      setErrorMessage(message);
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
          <button type="button" className="cm-btn cm-btn-good" onClick={handleCreate} disabled={isWorking}>
            {isWorking ? 'Creating…' : 'Create show'}
          </button>
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
