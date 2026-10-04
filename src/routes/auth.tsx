import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Agentwall" },
      { name: "description", content: "Sign in to the Agentwall admin console." },
      { property: "og:title", content: "Sign in — Agentwall" },
      { property: "og:description", content: "Sign in to the Agentwall admin console." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
        } else {
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl">
        <div className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">A</span>
          Agentwall
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          {mode === "signin" ? "Sign in to the console" : "Create an admin account"}
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            required
            type="password"
            placeholder="Password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
