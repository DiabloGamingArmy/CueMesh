import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  addDoc,
  query,
  collectionGroup,
  orderBy,
  where,
  type Firestore
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { AccessRole, CueStatus, CueType, Department, Priority } from '@cuemesh/shared';
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
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser ?? null);
    });
    return () => unsub();
  }, [auth]);

  return { app, db, user } satisfies FirebaseContextValue;
};

const resolveDeviceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export const createShow = async (
  db: Firestore,
  userId: string,
  name: string,
  venue: string,
  options?: { email?: string; deviceId?: string }
) => {
  const showRef = doc(collection(db, 'shows'));
  const batch = writeBatch(db);
  batch.set(showRef, {
    name,
    venue,
    status: 'ACTIVE',
    createdAt: serverTimestamp(),
    createdBy: userId
  });
  const displayName = options?.email?.split('@')[0] ?? 'Director';
  const memberRef = doc(db, 'shows', showRef.id, 'members', userId);
  batch.set(memberRef, {
    userId,
    displayName,
    accessRole: 'DIRECTOR',
    department: 'DIRECTOR_TD',
    customDeptLabel: null,
    presence: {
      online: true,
      lastSeenAt: serverTimestamp()
    },
    deviceId: options?.deviceId ?? resolveDeviceId()
  });

  if (
    typeof window !== 'undefined' &&
    window.localStorage.getItem('cuemesh-debug-events') === '1'
  ) {
    void addDoc(collection(db, 'debugEvents'), {
      type: 'CREATE_SHOW',
      userId,
      name,
      venue,
      createdAt: serverTimestamp()
    }).catch(() => undefined);
  }

  try {
    await batch.commit();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`createShow failed for showId=${showRef.id}: ${message}`);
  }
  return showRef.id;
};

export const joinShow = async (
  db: Firestore,
  showId: string,
  userId: string,
  displayName: string,
  accessRole: AccessRole,
  department: Department,
  deviceId: string,
  customDeptLabel?: string
) => {
  const memberRef = doc(db, 'shows', showId, 'members', userId);
  await setDoc(
    memberRef,
    {
      userId,
      displayName,
      accessRole,
      department,
      customDeptLabel: customDeptLabel ?? null,
      presence: {
        online: true,
        lastSeenAt: new Date().toISOString()
      },
      deviceId
    },
    { merge: true }
  );
};

export const useShow = (db: Firestore, showId?: string) => {
  const [show, setShow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (!showId) return;
    const ref = doc(db, 'shows', showId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setError(null);
        setShow(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
      (err) => {
        setError(err);
      }
    );
    return () => unsub();
  }, [db, showId]);
  return { show, error };
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

export const useMember = (db: Firestore, showId?: string, userId?: string) => {
  const [member, setMember] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!showId || !userId) return;
    const ref = doc(db, 'shows', showId, 'members', userId);
    const unsub = onSnapshot(ref, (snap) => {
      setMember(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [db, showId, userId]);
  return member;
};

export const usePresenceHeartbeat = (db: Firestore, showId?: string, userId?: string) => {
  useEffect(() => {
    if (!showId || !userId) return;
    const memberRef = doc(db, 'shows', showId, 'members', userId);
    const markOnline = () =>
      updateDoc(memberRef, {
        presence: { online: true, lastSeenAt: serverTimestamp() }
      }).catch(() => undefined);
    const markOffline = () =>
      updateDoc(memberRef, {
        presence: { online: false, lastSeenAt: serverTimestamp() }
      }).catch(() => undefined);

    markOnline();
    const interval = setInterval(markOnline, 30000);
    const handleUnload = () => {
      void markOffline();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      void markOffline();
    };
  }, [db, showId, userId]);
};

const normalizeCueTargets = (cue: Record<string, unknown>) => {
  const targets = cue.targets as unknown;
  if (Array.isArray(targets)) {
    return { ...cue, targets: { departments: targets } };
  }
  if (targets && typeof targets === 'object' && 'roles' in (targets as object)) {
    const rolesTargets = targets as { roles?: string[] };
    return { ...cue, targets: { departments: rolesTargets.roles ?? [] } };
  }
  if (targets && typeof targets === 'object' && 'departments' in (targets as object)) {
    return cue;
  }
  return { ...cue, targets: { departments: [] } };
};

export const useCues = (db: Firestore, showId?: string) => {
  const [cues, setCues] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    if (!showId) return;
    const ref = query(collection(db, 'shows', showId, 'cues'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(ref, (snap) => {
      setCues(
        snap.docs.map((docSnap) =>
          normalizeCueTargets({ id: docSnap.id, ...docSnap.data() })
        )
      );
    });
    return () => unsub();
  }, [db, showId]);
  return cues;
};

export const useCueAcks = (db: Firestore, showId?: string, userId?: string) => {
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!showId || !userId) return;
    const ref = query(
      collectionGroup(db, 'acks'),
      where('userId', '==', userId)
    );
    const unsub = onSnapshot(ref, (snap) => {
      const next: Record<string, boolean> = {};
      snap.docs.forEach((docSnap) => {
        const path = docSnap.ref.parent.parent?.id;
        if (path) next[path] = true;
      });
      setAcks(next);
    });
    return () => unsub();
  }, [db, showId, userId]);
  return acks;
};

export const useCueConfirms = (db: Firestore, showId?: string, userId?: string) => {
  const [confirms, setConfirms] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!showId || !userId) return;
    const ref = query(
      collectionGroup(db, 'confirms'),
      where('userId', '==', userId)
    );
    const unsub = onSnapshot(ref, (snap) => {
      const next: Record<string, boolean> = {};
      snap.docs.forEach((docSnap) => {
        const path = docSnap.ref.parent.parent?.id;
        if (path) next[path] = true;
      });
      setConfirms(next);
    });
    return () => unsub();
  }, [db, showId, userId]);
  return confirms;
};

export const createCue = async (
  db: Firestore,
  showId: string,
  userId: string,
  targets?: { departments: Department[]; accessRoles?: AccessRole[] },
  options?: {
    cueType?: CueType;
    title?: string;
    details?: string;
    priority?: Priority;
    requiresConfirm?: boolean;
  }
) => {
  const cueRef = doc(collection(db, 'shows', showId, 'cues'));
  await setDoc(cueRef, {
    cueType: options?.cueType ?? 'STAGE',
    title: options?.title ?? 'New Cue',
    details: options?.details ?? '',
    targets: targets ?? { departments: ['DECK'] },
    priority: options?.priority ?? 'MEDIUM',
    status: 'DRAFT',
    createdAt: serverTimestamp(),
    createdBy: userId,
    requiresConfirm: options?.requiresConfirm ?? false
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
      setCue(snap.exists() ? normalizeCueTargets({ id: snap.id, ...snap.data() }) : null);
    });
    return () => unsub();
  }, [db, showId, cueId]);
  return cue;
};

export const fetchShow = async (db: Firestore, showId: string) => {
  const showRef = doc(db, 'shows', showId);
  const snap = await getDoc(showRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
