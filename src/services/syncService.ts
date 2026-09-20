import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/db";
import { BIBLE_SYNC_FIELD, BIBLE_SYNC_UPDATED_FIELD } from "@/config/firebase";
import { currentAuthUser, type AuthUser } from "@/services/authService";
import { exportUserData, importUserData } from "@/services/backupService";
import { getFirebaseDb } from "@/services/firebaseApp";
import type { UserBackupV1 } from "@/types/userData";
import { backupFingerprint, mergeUserBackups } from "@/utils/mergeBackup";

const SYNC_STATE_KEY = "syncState";

export interface SyncState {
  lastPulledAt?: string;
  lastPushedAt?: string;
  lastError?: string;
  busy?: boolean;
}

let applyingRemote = false;
let hooksAttached = false;
let saveTimer: number | null = null;
let syncInFlight = false;
let pendingSync = false;
const listeners = new Set<(state: SyncState) => void>();

function emit(state: SyncState): void {
  listeners.forEach((listener) => listener(state));
}

export function subscribeSyncState(listener: (state: SyncState) => void): () => void {
  listeners.add(listener);
  void loadSyncState().then(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadSyncState(): Promise<SyncState> {
  const row = await db.settings.get(SYNC_STATE_KEY);
  return (row?.value as SyncState | undefined) ?? {};
}

async function saveSyncState(patch: SyncState): Promise<SyncState> {
  const current = await loadSyncState();
  const next = { ...current, ...patch };
  await db.settings.put({ key: SYNC_STATE_KEY, value: next });
  emit(next);
  return next;
}

function userStateRef(uid: string) {
  return doc(getFirebaseDb(), "users", uid, "app", "state");
}

function asBackup(value: unknown): UserBackupV1 | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as UserBackupV1;
  if (payload.version !== 1 || payload.app !== "NJC Bible App") return null;
  if (!Array.isArray(payload.bookmarks) || !Array.isArray(payload.notes)) return null;
  return payload;
}

export async function pullCloudBackup(user: AuthUser): Promise<UserBackupV1 | null> {
  const snapshot = await getDoc(userStateRef(user.uid));
  if (!snapshot.exists()) return null;
  return asBackup(snapshot.data()?.[BIBLE_SYNC_FIELD]);
}

export async function pushCloudBackup(user: AuthUser, backup: UserBackupV1): Promise<void> {
  await setDoc(
    userStateRef(user.uid),
    {
      [BIBLE_SYNC_FIELD]: JSON.parse(JSON.stringify(backup)) as UserBackupV1,
      [BIBLE_SYNC_UPDATED_FIELD]: Date.now(),
    },
    { merge: true },
  );
}

export async function syncAccountNow(user = currentAuthUser()): Promise<SyncState> {
  if (!user) {
    return saveSyncState({ lastError: "Sign in to sync across devices.", busy: false });
  }
  if (syncInFlight) {
    pendingSync = true;
    return loadSyncState();
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    pendingSync = true;
    return saveSyncState({ lastError: "Connect to the internet to sync.", busy: false });
  }
  syncInFlight = true;
  await saveSyncState({ busy: true, lastError: "" });
  try {
    const remote = await pullCloudBackup(user);
    const local = await exportUserData();
    const merged = mergeUserBackups(local, remote);
    if (backupFingerprint(merged) !== backupFingerprint(local)) {
      applyingRemote = true;
      try {
        await importUserData(merged);
      } finally {
        applyingRemote = false;
      }
    }
    await pushCloudBackup(user, merged);
    const stamp = new Date().toISOString();
    return saveSyncState({ lastPulledAt: stamp, lastPushedAt: stamp, lastError: "", busy: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    return saveSyncState({ lastError: message, busy: false });
  } finally {
    syncInFlight = false;
    if (pendingSync) {
      pendingSync = false;
      window.setTimeout(() => {
        void syncAccountNow();
      }, 50);
    }
  }
}

export function queueAccountSync(): void {
  if (applyingRemote || !currentAuthUser()) return;
  if (syncInFlight) {
    pendingSync = true;
    return;
  }
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    void syncAccountNow();
  }, 900);
}

export function attachSyncHooks(): void {
  if (hooksAttached) return;
  hooksAttached = true;
  const tables = [
    db.bookmarks,
    db.highlights,
    db.notes,
    db.sermons,
    db.sermonPassages,
    db.readingHistory,
    db.readingProgress,
    db.planDays,
  ] as const;
  for (const table of tables) {
    table.hook("creating", () => queueAccountSync());
    table.hook("updating", () => queueAccountSync());
    table.hook("deleting", () => queueAccountSync());
  }
  window.addEventListener("online", () => {
    if (currentAuthUser()) void syncAccountNow();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && currentAuthUser()) void syncAccountNow();
  });
}
