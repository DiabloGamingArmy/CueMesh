import { z } from 'zod';
import { CueStatus, CueType, Priority, Role } from './enums';

const roleValues = Object.values(Role) as [Role, ...Role[]];
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
  role: z.enum(roleValues),
  presence: presenceSchema,
  permissions: z.array(z.string())
});

export const cueSchema = z.object({
  cueType: z.enum(cueTypeValues),
  title: z.string(),
  details: z.string().optional(),
  targets: z.object({
    roles: z.array(z.enum(roleValues)).optional(),
    users: z.array(z.string()).optional()
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
