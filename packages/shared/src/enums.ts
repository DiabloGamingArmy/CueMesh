export const CueStatus = {
  DRAFT: 'DRAFT',
  STANDBY: 'STANDBY',
  GO: 'GO',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
  HOLD: 'HOLD'
} as const;

export type CueStatus = (typeof CueStatus)[keyof typeof CueStatus];

export const CueType = {
  LIGHT: 'LIGHT',
  SOUND: 'SOUND',
  VIDEO: 'VIDEO',
  STAGE: 'STAGE',
  CUSTOM: 'CUSTOM'
} as const;

export type CueType = (typeof CueType)[keyof typeof CueType];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export const Role = {
  DIRECTOR: 'DIRECTOR',
  OPERATOR: 'OPERATOR',
  STAGE_MANAGER: 'STAGE_MANAGER',
  CREW: 'CREW'
} as const;

export type Role = (typeof Role)[keyof typeof Role];
