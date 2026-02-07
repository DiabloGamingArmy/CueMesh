import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import type { FirebaseContextValue } from '../services/firebase';
import { createCue, updateCueStatus, useCues } from '../services/firebase';
import { CueStatus } from '@cuemesh/shared';

export const DirectorPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const userId = firebase.user?.uid;

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Director console</div>
          <button
            className="cm-btn cm-btn-good"
            onClick={() =>
              showId && userId ? createCue(firebase.db, showId, userId) : Promise.resolve()
            }
            disabled={!showId || !userId}
          >
            Create cue
          </button>
        </div>
        <div className="cm-panel-bd" style={{ display: 'grid', gap: 16 }}>
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
      </section>
    </div>
  );
};
