import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FirebaseContextValue } from '../services/firebase';
import { createShow } from '../services/firebase';

export const LandingPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [showId, setShowId] = useState('');
  const userId = firebase.user?.uid;

  const handleCreate = async () => {
    if (!userId || !name) return;
    const id = await createShow(firebase.db, userId, name, venue);
    navigate(`/show/${id}`);
  };

  const handleJoin = () => {
    if (!showId) return;
    navigate(`/show/${showId}`);
  };

  return (
    <div className="page">
      <section className="panel">
        <h2>Create a show</h2>
        <label>
          Show name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Venue
          <input value={venue} onChange={(event) => setVenue(event.target.value)} />
        </label>
        <button onClick={handleCreate} disabled={!userId}>
          Create show
        </button>
      </section>
      <section className="panel">
        <h2>Join a show</h2>
        <label>
          Show ID
          <input value={showId} onChange={(event) => setShowId(event.target.value)} />
        </label>
        <button onClick={handleJoin}>Join show</button>
      </section>
    </div>
  );
};
