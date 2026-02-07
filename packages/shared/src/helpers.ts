import { AccessRole, CueStatus, Department } from './enums';
import type { Cue, Member } from './schemas';

export const deriveAccessRoleFromDepartment = (department: Department): AccessRole => {
  if (department === 'DIRECTOR_TD') return 'DIRECTOR';
  if (department === 'STAGE_MANAGER' || department === 'ASSISTANT_STAGE_MANAGER') {
    return 'STAGE_MANAGER';
  }
  return 'CREW';
};

type LegacyTargets = string[] | { roles?: string[]; users?: string[] };
type CueTargets = { departments: string[]; accessRoles?: string[] } | LegacyTargets;

export const cueTargetsMember = (cue: Cue, member: Pick<Member, 'department' | 'accessRole'>) => {
  const targets = cue.targets as CueTargets | undefined;
  if (!targets) return true;

  if (Array.isArray(targets)) {
    return targets.includes(member.department);
  }

  if ('departments' in targets) {
    const deptMatch = targets.departments?.includes(member.department) ?? false;
    const roleMatch = targets.accessRoles?.includes(member.accessRole) ?? false;
    if (!targets.departments?.length && !targets.accessRoles?.length) return true;
    return deptMatch || roleMatch;
  }

  if ('roles' in targets && targets.roles?.length) {
    return targets.roles.includes(member.accessRole);
  }

  return true;
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
