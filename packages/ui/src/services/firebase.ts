import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  type Firestore
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { CueStatus, Priority, Role } from '@cuemesh/shared';
import { CueStatus as CueStatusEnum } from '@cuemesh/shared';

export type FirebaseContextValue = {
  app: FirebaseApp;
  db: Firestore;
  user: User | null;
};

export const useFirebase = (app: FirebaseApp) => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        await signInAnonymously(auth);
        return;
      }
      setUser(nextUser);
    });
    return () => unsub();
  }, [auth]);

  return { app, db, user } satisfies FirebaseContextValue;
};

export const createShow = async (db: Firestore, userId: string, name: string, venue: string) => {
  const showRef = doc(collection(db, 'shows'));
  await setDoc(showRef, {
    name,
    venue,
    status: 'ACTIVE',
    createdAt: serverTimestamp(),
    createdBy: userId
  });
  return showRef.id;
};

export const joinShow = async (
  db: Firestore,
  showId: string,
  userId: string,
  displayName: string,
  role: Role,
  deviceId: string
) => {
  const memberRef = doc(db, 'shows', showId, 'members', userId);
  await setDoc(
    memberRef,
    {
      userId,
      displayName,
      role,
      presence: {
        online: true,
        lastSeenAt: new Date().toISOString()
      },
      permissions: [],
      deviceId
    },
    { merge: true }
  );
};

export const useShow = (db: Firestore, showId?: string) => {
  const [show, setShow] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!showId) return;
    const ref = doc(db, 'shows', showId);
    const unsub = onSnapshot(ref, (snap) => {
      setShow(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [db, showId]);
  return show;
};

export const useMembers = (db: Firestore, showId?: string) => {
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    if (!showId) return;
    const ref = collection(db, 'shows', showId, 'members');
    const unsub = onSnapshot(ref, (snap) => {
      setMembers(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsub();
  }, [db, showId]);
  return members;
};

export const useCues = (db: Firestore, showId?: string) => {
  const [cues, setCues] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    if (!showId) return;
    const ref = query(collection(db, 'shows', showId, 'cues'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setCues(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsub();
  }, [db, showId]);
  return cues;
};

export const createCue = async (db: Firestore, showId: string, userId: string) => {
  const cueRef = doc(collection(db, 'shows', showId, 'cues'));
  await setDoc(cueRef, {
    cueType: 'STAGE',
    title: 'New Cue',
    details: '',
    targets: { roles: ['OPERATOR'] },
    priority: 'MEDIUM',
    status: 'DRAFT',
    createdAt: serverTimestamp(),
    createdBy: userId,
    requiresConfirm: false
  });
};

export const updateCueStatus = async (
  db: Firestore,
  showId: string,
  cueId: string,
  status: CueStatus
) => {
  const cueRef = doc(db, 'shows', showId, 'cues', cueId);
  const payload: Record<string, unknown> = { status };
  if (status === CueStatusEnum.GO) {
    payload.goAt = serverTimestamp();
  }
  await updateDoc(cueRef, payload);
};

export const addAck = async (db: Firestore, showId: string, cueId: string, userId: string) => {
  const ackRef = doc(db, 'shows', showId, 'cues', cueId, 'acks', userId);
  await setDoc(ackRef, { userId, ackAt: serverTimestamp() });
};

export const addConfirm = async (
  db: Firestore,
  showId: string,
  cueId: string,
  userId: string
) => {
  const confirmRef = doc(db, 'shows', showId, 'cues', cueId, 'confirms', userId);
  await setDoc(confirmRef, { userId, confirmAt: serverTimestamp() });
};

export const addCant = async (
  db: Firestore,
  showId: string,
  cueId: string,
  userId: string,
  note: string
) => {
  const cueRef = doc(db, 'shows', showId, 'cues', cueId);
  await updateDoc(cueRef, { details: note });
  await addDoc(collection(db, 'shows', showId, 'events'), {
    type: 'CUE_CANT',
    payload: { cueId, note },
    createdAt: serverTimestamp(),
    createdBy: userId
  });
};

export const useCue = (db: Firestore, showId?: string, cueId?: string) => {
  const [cue, setCue] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!showId || !cueId) return;
    const ref = doc(db, 'shows', showId, 'cues', cueId);
    const unsub = onSnapshot(ref, (snap) => {
      setCue(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [db, showId, cueId]);
  return cue;
};

export const useRoleFilter = (role: Role | null, priority: Priority | 'ALL') => {
  return { role, priority };
};

export const fetchShow = async (db: Firestore, showId: string) => {
  const showRef = doc(db, 'shows', showId);
  const snap = await getDoc(showRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
