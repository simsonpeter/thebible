/**
 * Future account + cloud sync architecture.
 *
 * Version 1 stores everything locally. Offline reading must never depend on login.
 * A later backend can implement this adapter without rewriting feature screens.
 */
export type AuthProvider = "google" | "email" | "local";

export interface User {
  id: string;
  email?: string;
  provider: AuthProvider;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  xp: number;
  photoUrl?: string;
}

export interface CloudSync {
  lastPulledAt?: string;
  lastPushedAt?: string;
  bookmarks: unknown;
  highlights: unknown;
  notes: unknown;
  readingProgress: unknown;
  readingPlans: unknown;
  settings: unknown;
}

export interface Leaderboard {
  period: "weekly" | "all-time";
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  rank: number;
}

export interface UserAccount extends User {
  displayName: string;
}

export interface CloudSyncPayload extends CloudSync {}

export interface AccountAdapter {
  getCurrentUser(): Promise<User | null>;
  signIn?(provider: AuthProvider): Promise<User>;
  signOut?(): Promise<void>;
  pull?(): Promise<CloudSync | null>;
  push?(payload: CloudSync): Promise<void>;
}

export class LocalGuestAccount implements AccountAdapter {
  async getCurrentUser(): Promise<User | null> {
    return null;
  }
}

export const accountAdapter: AccountAdapter = new LocalGuestAccount();
