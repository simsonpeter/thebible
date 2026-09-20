import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  authErrorMessage,
  currentAuthUser,
  registerWithEmail,
  sendResetEmail,
  signInWithEmail,
  signOutAccount,
  subscribeAuth,
  type AuthUser,
} from "@/services/authService";
import { attachSyncHooks, syncAccountNow } from "@/services/syncService";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(currentAuthUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    attachSyncHooks();
    return subscribeAuth((next) => {
      setUser(next);
      setReady(true);
      if (next) void syncAccountNow(next);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      signIn: async (email, password) => {
        const next = await signInWithEmail(email, password);
        await syncAccountNow(next);
      },
      register: async (email, password) => {
        const next = await registerWithEmail(email, password);
        await syncAccountNow(next);
      },
      resetPassword: sendResetEmail,
      signOut: signOutAccount,
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

export { authErrorMessage };
