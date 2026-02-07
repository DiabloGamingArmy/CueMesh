import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import type { FirebaseContextValue } from '../services/firebase';
import { createCue, updateCueStatus, useCues } from '../services/firebase';
import { AccessRole, CueStatus, Department } from '@cuemesh/shared';

export const DirectorPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const userId = firebase.user?.uid;
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [targetAccessRole, setTargetAccessRole] = useState<AccessRole | 'NONE'>('NONE');

  const quickPicks = useMemo(
    () => [
      { label: 'Audio', departments: ['AUDIO_A1', 'AUDIO_A2'] as Department[] },
      { label: 'Lighting', departments: ['LIGHTING_LX_OP', 'LIGHTING_LX_DESIGN'] as Department[] },
      { label: 'Video', departments: ['VIDEO_PROJ', 'VIDEO_SHADING'] as Department[] },
      { label: 'Graphics', departments: ['GRAPHICS_GFX'] as Department[] },
      { label: 'Stage/Deck', departments: ['DECK', 'STAGE_MANAGER'] as Department[] },
      { label: 'FOH', departments: ['FOH'] as Department[] }
    ],
    []
  );

  const toggleDepartment = (department: Department) => {
    setSelectedDepartments((current) =>
      current.includes(department) ? current.filter((item) => item !== department) : [...current, department]
    );
  };

  const applyQuickPick = (departments: Department[]) => {
    setSelectedDepartments(departments);
    setTargetAccessRole('NONE');
  };

  const handleCreateCue = async () => {
    if (!showId || !userId) return;
    const departments =
      selectedDepartments.length > 0 || targetAccessRole !== 'NONE'
        ? selectedDepartments
        : (['DECK'] as Department[]);
    const targets = {
      departments,
      accessRoles: targetAccessRole === 'NONE' ? undefined : [targetAccessRole]
    };
    await createCue(firebase.db, showId, userId, targets);
  };

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Director console</div>
          <button className="cm-btn cm-btn-good" onClick={handleCreateCue} disabled={!showId || !userId}>
            Create cue
          </button>
        </div>
        <div className="cm-panel-bd cm-stack">
          <div className="cm-row">
            {quickPicks.map((pick) => (
              <button key={pick.label} className="cm-btn" onClick={() => applyQuickPick(pick.departments)}>
                {pick.label}
              </button>
            ))}
            <button
              className="cm-btn"
              onClick={() => {
                setSelectedDepartments([]);
                setTargetAccessRole('CREW');
              }}
            >
              All Crew
            </button>
          </div>
          <div className="cm-panel">
            <div className="cm-panel-hd">
              <div className="cm-title">Target departments</div>
              <span className="cm-chip">{selectedDepartments.length}</span>
            </div>
            <div className="cm-panel-bd">
              <div className="cm-row">
                {Object.values(Department).map((dept) => (
                  <label key={dept} className="cm-chip" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept)}
                      onChange={() => toggleDepartment(dept)}
                      style={{ marginRight: 6 }}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label>
            Target access role (optional)
            <select
              value={targetAccessRole}
              onChange={(event) => setTargetAccessRole(event.target.value as AccessRole | 'NONE')}
            >
              <option value="NONE">None</option>
              {Object.values(AccessRole).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
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
