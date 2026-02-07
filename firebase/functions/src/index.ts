import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

initializeApp();

const db = getFirestore();

export const onCueStatusChange = onDocumentUpdated(
  'shows/{showId}/cues/{cueId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.status === after.status) return;

    const showId = event.params.showId as string;
    await db.collection('shows').doc(showId).collection('events').add({
      type: 'CUE_STATUS_CHANGED',
      payload: {
        cueId: event.params.cueId,
        from: before.status,
        to: after.status
      },
      createdAt: new Date().toISOString(),
      createdBy: after.createdBy ?? 'system'
    });
  }
);

export const escalationStub = onDocumentUpdated(
  'shows/{showId}/cues/{cueId}',
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;
    if (after.priority !== 'CRITICAL') return;

    // TODO: Implement escalation if a critical cue is not acknowledged within a timeout.
    console.log('Escalation stub for cue', event.params.cueId);
  }
);
