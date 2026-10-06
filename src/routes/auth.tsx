import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthSearch = { redirect?: string | undefined; mode?: "signin" | "signup" | undefined; email?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => {
    const r = s["redirect"], m = s["mode"], e = s["email"];
    return {
      redirect: typeof r === "string" && /^\/invite\/[a-f0-9]+$/.test(r) ? r : undefined,
      mode: m === "signup" ? "signup" : undefined,
      email: typeof e === "string" ? e : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign in — New Perimeter" },
      { name: "description", content: "Sign in to the New Perimeter admin console." },
      { property: "og:title", content: "Sign in — New Perimeter" },
      { property: "og:description", content: "Sign in to the New Perimeter admin console." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState(search.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const goNext = () => (search.redirect ? navigate({ href: search.redirect }) : navigate({ to: "/admin" }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message);
        goNext();
      } else {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] ?? email,
          callbackURL: search.redirect ?? "/admin",
        });
        if (error) throw new Error(error.message);
        setNotice("Check your email to verify your account, then sign in.");
        setMode("signin");
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
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">NP</span>
          New Perimeter
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
