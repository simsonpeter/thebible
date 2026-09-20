import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/services/firebaseApp";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

export function toAuthUser(user: User | null): AuthUser | null {
  if (!user?.uid) return null;
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
  };
}

export function subscribeAuth(listener: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (user) => listener(toAuthUser(user)));
}

export function currentAuthUser(): AuthUser | null {
  return toAuthUser(getFirebaseAuth().currentUser);
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  const user = toAuthUser(result.user);
  if (!user) throw new Error("Sign in failed.");
  return user;
}

export async function registerWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  const user = toAuthUser(result.user);
  if (!user) throw new Error("Could not create account.");
  return user;
}

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export async function signOutAccount(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  if (code === "auth/email-already-in-use") return "Email already in use.";
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }
  if (code === "auth/weak-password") return "Password must be at least 6 characters.";
  if (code === "auth/invalid-email") return "Please enter a valid email.";
  if (code === "auth/too-many-requests") return "Too many attempts. Wait a few minutes and try again.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection and try again.";
  if (code === "auth/unauthorized-domain") {
    return "This website is not yet allowed for NJC login. Add thebible-five.vercel.app in Firebase Auth authorized domains.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Login failed. Please try again.";
}
