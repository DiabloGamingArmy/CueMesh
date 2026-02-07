import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import type { FirebaseContextValue } from '../services/firebase';
import { createCue, updateCueStatus, useCues } from '../services/firebase';
import { CueStatus } from '@cuemesh/shared';
import './director.css';

export const DirectorPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const userId = firebase.user?.uid;

  return (
    <div>
      <section className="director-bar">
        <button
          onClick={() =>
            showId && userId ? createCue(firebase.db, showId, userId) : Promise.resolve()
          }
          disabled={!showId || !userId}
        >
          Create cue
        </button>
      </section>
      <div className="cue-list">
        {cues.map((cue) => (
          <CueCard
            key={String(cue.id)}
            cue={cue}
            onStandby={
              showId
                ? () => updateCueStatus(firebase.db, showId, String(cue.id), CueStatus.STANDBY)
                : undefined
            }
            onGo={
              showId
                ? () => updateCueStatus(firebase.db, showId, String(cue.id), CueStatus.GO)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};
