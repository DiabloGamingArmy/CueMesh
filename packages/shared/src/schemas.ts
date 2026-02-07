import { z } from 'zod';
import { AccessRole, CueStatus, CueType, Department, Priority } from './enums';

const accessRoleValues = Object.values(AccessRole) as [AccessRole, ...AccessRole[]];
const departmentValues = Object.values(Department) as [Department, ...Department[]];
const cueTypeValues = Object.values(CueType) as [CueType, ...CueType[]];
const cueStatusValues = Object.values(CueStatus) as [CueStatus, ...CueStatus[]];
const priorityValues = Object.values(Priority) as [Priority, ...Priority[]];

export const presenceSchema = z.object({
  online: z.boolean(),
  lastSeenAt: z.string().optional()
});

export const memberSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  accessRole: z.enum(accessRoleValues),
  department: z.enum(departmentValues),
  customDeptLabel: z.string().nullable().optional(),
  presence: presenceSchema,
  deviceId: z.string()
});

export const cueSchema = z.object({
  cueType: z.enum(cueTypeValues),
  title: z.string(),
  details: z.string().optional(),
  targets: z.object({
    departments: z.array(z.enum(departmentValues)),
    accessRoles: z.array(z.enum(accessRoleValues)).optional()
  }),
  priority: z.enum(priorityValues),
  status: z.enum(cueStatusValues),
  createdAt: z.string(),
  createdBy: z.string(),
  goAt: z.string().optional(),
  requiresConfirm: z.boolean()
});

export const eventSchema = z.object({
  type: z.string(),
  payload: z.record(z.unknown()),
  createdAt: z.string(),
  createdBy: z.string()
});

export type Presence = z.infer<typeof presenceSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Cue = z.infer<typeof cueSchema>;
export type CueEvent = z.infer<typeof eventSchema>;
