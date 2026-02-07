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
  const userId = firebase.user?.uid;

  const handleCreate = async () => {
    if (!userId) return;
    if (!name.trim()) {
      setErrorMessage('Show name is required.');
      return;
    }
    setIsWorking(true);
    setErrorMessage(null);
    try {
      const id = await createShow(firebase.db, userId, name.trim(), venue, {
        email: firebase.user?.email ?? undefined
      });
      navigate(`/show/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create show.';
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
          <button
            className="cm-btn cm-btn-good"
            onClick={handleCreate}
            disabled={!userId || isWorking}
          >
            Create show
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
