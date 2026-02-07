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

export const AccessRole = {
  DIRECTOR: 'DIRECTOR',
  STAGE_MANAGER: 'STAGE_MANAGER',
  DEPT_HEAD: 'DEPT_HEAD',
  CREW: 'CREW',
  VIEWER: 'VIEWER'
} as const;

export type AccessRole = (typeof AccessRole)[keyof typeof AccessRole];

export const Department = {
  AUDIO_A1: 'AUDIO_A1',
  AUDIO_A2: 'AUDIO_A2',
  LIGHTING_LX_OP: 'LIGHTING_LX_OP',
  LIGHTING_LX_DESIGN: 'LIGHTING_LX_DESIGN',
  VIDEO_PROJ: 'VIDEO_PROJ',
  VIDEO_SHADING: 'VIDEO_SHADING',
  GRAPHICS_GFX: 'GRAPHICS_GFX',
  SPOTLIGHT: 'SPOTLIGHT',
  DECK: 'DECK',
  FOH: 'FOH',
  MONITORS: 'MONITORS',
  BACKLINE: 'BACKLINE',
  WARDROBE: 'WARDROBE',
  MAKEUP: 'MAKEUP',
  PROPS: 'PROPS',
  CARPENTRY: 'CARPENTRY',
  RIGGING: 'RIGGING',
  FLY: 'FLY',
  PYRO: 'PYRO',
  SAFETY: 'SAFETY',
  PRODUCER: 'PRODUCER',
  ASSISTANT_DIRECTOR: 'ASSISTANT_DIRECTOR',
  STAGE_MANAGER: 'STAGE_MANAGER',
  ASSISTANT_STAGE_MANAGER: 'ASSISTANT_STAGE_MANAGER',
  DIRECTOR_TD: 'DIRECTOR_TD',
  STREAM_OP: 'STREAM_OP',
  CAMERA_OP: 'CAMERA_OP',
  CAMERA_SHADER: 'CAMERA_SHADER',
  COMMS: 'COMMS',
  RUNNER: 'RUNNER',
  CUSTOM: 'CUSTOM'
} as const;

export type Department = (typeof Department)[keyof typeof Department];
