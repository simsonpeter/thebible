import { useEffect, useState, type FormEvent } from "react";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authErrorMessage, useAuth } from "@/hooks/useAuth";
import { loadSyncState, subscribeSyncState, syncAccountNow, type SyncState } from "@/services/syncService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useToast } from "@/hooks/useToast";

export function AccountPage() {
  const { user, signIn, register, resetPassword, signOut } = useAuth();
  const online = useOnlineStatus();
  const { push } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sync, setSync] = useState<SyncState>({});

  useEffect(() => subscribeSyncState(setSync), []);
  useEffect(() => {
    void loadSyncState().then(setSync);
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "register") await register(email, password);
      else await signIn(email, password);
      push("Signed in. Your notes and reading will sync.", "success");
    } catch (error) {
      setMessage(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    if (!email.trim()) {
      setMessage("Enter your email first to reset password.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Password reset email sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Account" subtitle="Same NJC login on every device" back>
      {user ? (
        <Card className="mb-4">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Signed in</p>
          <h2 className="mt-2 font-semibold">{user.email || "NJC account"}</h2>
          <p className="mt-1 text-sm text-muted">
            Notes, bookmarks, highlights, sermons, reading history, and reading plans sync with this NJC account.
          </p>
          <p className="mt-2 text-sm text-muted">
            {sync.lastPushedAt ? `Last synced ${new Date(sync.lastPushedAt).toLocaleString()}` : "Not synced yet"}
          </p>
          {sync.lastError ? <p className="mt-2 text-sm text-red-700">{sync.lastError}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={busy || sync.busy || !online}
              onClick={() => {
                setBusy(true);
                void syncAccountNow(user)
                  .then((state) => {
                    setSync(state);
                    push(state.lastError ? state.lastError : "Synced", state.lastError ? "error" : "success");
                  })
                  .finally(() => setBusy(false));
              }}
            >
              {sync.busy ? "Syncing…" : "Sync now"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void signOut().then(() => push("Signed out. Data stays on this device.", "info"));
              }}
            >
              Sign out
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mb-4">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">NJC account</p>
          <h2 className="mt-2 font-semibold">{mode === "register" ? "Create account" : "Sign in"}</h2>
          <p className="mt-1 text-sm text-muted">
            Use the same email and password as the NJC Church App. Reading still works without signing in.
          </p>
          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-1 text-sm">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11 rounded-2xl border border-navy/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              Password
              <input
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                className="min-h-11 rounded-2xl border border-navy/10 bg-white px-3 dark:border-white/10 dark:bg-white/5"
                required
              />
            </label>
            {message ? <p className="text-sm text-red-700">{message}</p> : null}
            <Button type="submit" disabled={busy || !online}>
              {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setMode(mode === "register" ? "login" : "register")}>
              {mode === "register" ? "Already have an account? Sign in" : "New user? Create account"}
            </Button>
            {mode === "login" ? (
              <Button variant="ghost" disabled={busy} onClick={() => void onReset()}>
                Forgot password?
              </Button>
            ) : null}
          </div>
        </Card>
      )}
      {!online ? <p className="text-sm text-muted">You are offline. Sign-in and sync need a connection.</p> : null}
    </Page>
  );
}
