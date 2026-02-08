import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CueCard } from '../components/CueCard';
import type { FirebaseContextValue } from '../services/firebase';
import { createCue, updateCueStatus, useCues, usePresenceHeartbeat } from '../services/firebase';
import { AccessRole, CueStatus, CueType, Department, Priority } from '@cuemesh/shared';

export const DirectorPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const { showId } = useParams();
  const cues = useCues(firebase.db, showId);
  const sortedCues = useMemo(
    () =>
      [...cues].sort(
        (a, b) =>
          Number((b.createdAt as { seconds?: number })?.seconds ?? 0) -
          Number((a.createdAt as { seconds?: number })?.seconds ?? 0)
      ),
    [cues]
  );
  const userId = firebase.user?.uid;
  usePresenceHeartbeat(firebase.db, showId, userId);
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [targetAccessRole, setTargetAccessRole] = useState<AccessRole | 'NONE'>('NONE');
  const [cueType, setCueType] = useState<CueType>('STAGE');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [requiresConfirm, setRequiresConfirm] = useState(false);

  const quickPicks = useMemo(
    () => [
      { label: 'Audio', departments: ['AUDIO_A1', 'AUDIO_A2'] as Department[] },
      { label: 'Lighting', departments: ['LIGHTING_LX_OP', 'LIGHTING_LX_DESIGN'] as Department[] },
      { label: 'Video', departments: ['VIDEO_PROJ', 'VIDEO_SHADING'] as Department[] },
      { label: 'Graphics', departments: ['GRAPHICS_GFX'] as Department[] },
      { label: 'Deck/Stage', departments: ['DECK', 'STAGE_MANAGER'] as Department[] },
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
    await createCue(firebase.db, showId, userId, targets, {
      cueType,
      title: title.trim() || 'New Cue',
      details: details.trim(),
      priority,
      requiresConfirm
    });
    setTitle('');
    setDetails('');
    setRequiresConfirm(false);
  };

  const handleStatusUpdate = async (cue: Record<string, unknown>, status: CueStatus) => {
    if (!showId) return;
    if (status === CueStatus.GO && cue.priority === Priority.CRITICAL) {
      const ok = window.confirm('This is a CRITICAL cue. Confirm GO?');
      if (!ok) return;
    }
    await updateCueStatus(firebase.db, showId, String(cue.id), status);
  };

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Director console</div>
          <button className="cm-btn cm-btn-good" onClick={handleCreateCue} disabled={!showId || !userId}>
            Create Cue (DRAFT)
          </button>
        </div>
        <div className="cm-panel-bd cm-stack">
          <div className="cm-panel">
            <div className="cm-panel-hd">
              <div className="cm-title">Cue composer</div>
            </div>
            <div className="cm-panel-bd cm-stack">
              <div className="cm-row">
                <label>
                  Cue type
                  <select value={cueType} onChange={(event) => setCueType(event.target.value as CueType)}>
                    <option value="SOUND">Audio</option>
                    <option value="LIGHT">Lighting</option>
                    <option value="VIDEO">Video</option>
                    <option value="FX">FX</option>
                    <option value="COMMS">Comms</option>
                    <option value="STAGE">Stage</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as Priority)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </label>
                <label>
                  Requires confirm
                  <input
                    type="checkbox"
                    checked={requiresConfirm}
                    onChange={(event) => setRequiresConfirm(event.target.checked)}
                  />
                </label>
              </div>
              <label>
                Title
                <input value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label>
                Details
                <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={3} />
              </label>
            </div>
          </div>
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
          {sortedCues.map((cue) => (
            <CueCard
              key={String(cue.id)}
              cue={cue}
              onStandby={() => handleStatusUpdate(cue, CueStatus.STANDBY)}
              onGo={() => handleStatusUpdate(cue, CueStatus.GO)}
              onCant={() => handleStatusUpdate(cue, CueStatus.CANCELED)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
