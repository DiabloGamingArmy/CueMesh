import { CueStatus, Role } from './enums';
import type { Cue } from './schemas';

export const isTargetedToRole = (cue: Cue, role: Role) => {
  if (!cue.targets.roles?.length) return true;
  return cue.targets.roles.includes(role);
};

export const canTransitionStatus = (from: CueStatus, to: CueStatus) => {
  const transitions: Record<CueStatus, CueStatus[]> = {
    DRAFT: ['STANDBY', 'CANCELED'],
    STANDBY: ['GO', 'HOLD', 'CANCELED'],
    GO: ['DONE', 'HOLD'],
    HOLD: ['STANDBY', 'GO', 'CANCELED'],
    DONE: [],
    CANCELED: []
  };
  return transitions[from].includes(to);
};

export const getCueRail = (status: CueStatus) => {
  if (status === 'STANDBY') return 'standby';
  if (status === 'GO') return 'go';
  return 'other';
};
