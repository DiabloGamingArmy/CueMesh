# CueMesh Architecture

## Overview
CueMesh is a web-first, desktop-enhanced real-time cueing system. The web UI is shared between Firebase Hosting and a Tauri desktop wrapper. The desktop build extends the UI through a thin JS → native bridge for hotkeys and audio playback.

## Firestore Data Model

```
shows/{showId}
  - name
  - venue
  - status
  - createdAt
  - createdBy

shows/{showId}/members/{memberId}
  - userId
  - displayName
  - role
  - presence (online, lastSeenAt)
  - permissions

shows/{showId}/cues/{cueId}
  - cueType
  - title
  - details
  - targets (roles/users)
  - priority
  - status (DRAFT|STANDBY|GO|DONE|CANCELED|HOLD)
  - createdAt
  - createdBy
  - goAt
  - requiresConfirm

shows/{showId}/cues/{cueId}/acks/{ackId}
  - userId
  - ackAt

shows/{showId}/cues/{cueId}/confirms/{confirmId}
  - userId
  - confirmAt

shows/{showId}/events/{eventId}
  - type
  - payload
  - createdAt
  - createdBy
```

## Roles and Permissions

- **DIRECTOR**: Creates cues, sets status (DRAFT → STANDBY → GO), and manages show-level updates.
- **OPERATOR/STAGE_MANAGER/CREW**: Read cues, acknowledge, confirm, or submit CAN'T events.

Firestore rules enforce that only show members can read data. The director role is required to create or update cues.

## STANDBY → GO Flow

1. Director creates a cue (DRAFT).
2. Director sets cue to **STANDBY** to move it into the standby rail.
3. Director sets cue to **GO**. The system timestamps `goAt` for auditing.
4. Operators acknowledge (ACK) and confirm as needed. A CAN'T event writes to the audit log and updates cue notes.
