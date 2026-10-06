import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Workspace invitation — New Perimeter" },
      { name: "description", content: "Accept your invitation to join an New Perimeter workspace." },
      { property: "og:title", content: "Workspace invitation — New Perimeter" },
      { property: "og:description", content: "Accept your invitation to join an New Perimeter workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

type Invite = { workspace_name: string; email: string; role: string; status: string };

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("get_invitation", { _token: token }).then(({ data }) => setInvite(data?.[0] ?? null));
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [token]);

  async function accept() {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("accept_invitation", { _token: token });
    setBusy(false);
    if (error) return setError(error.message);
    sessionStorage.setItem("aw_ws", data as string);
    navigate({ to: "/admin" });
  }

  async function switchAccount() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  const redirect = `/invite/${token}`;
  let body: React.ReactNode;
  if (invite === undefined || userEmail === undefined) body = <p className="text-muted-foreground">Loading…</p>;
  else if (!invite) body = <p>This invitation link is not valid.</p>;
  else if (invite.status !== "pending") body = <p>This invitation has {invite.status === "accepted" ? "already been used" : invite.status === "revoked" ? "been revoked" : "expired"}. Ask a workspace admin for a new one.</p>;
  else {
    body = (
      <>
        <p>
          You've been invited to join <strong>{invite.workspace_name}</strong> as <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{invite.role}</span>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Invitation for {invite.email}</p>
        {!userEmail ? (
          <div className="mt-6 flex gap-2">
            <Link to="/auth" search={{ redirect, mode: "signup", email: invite.email }} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Create account</Link>
            <Link to="/auth" search={{ redirect, email: invite.email }} className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold">Sign in</Link>
          </div>
        ) : userEmail.toLowerCase() !== invite.email.toLowerCase() ? (
          <div className="mt-6">
            <p className="text-sm text-destructive">You're signed in as {userEmail}. Sign in with {invite.email} to accept.</p>
            <button onClick={switchAccount} className="mt-3 w-full rounded-lg border px-4 py-2.5 text-sm font-semibold">Switch account</button>
          </div>
        ) : (
          <button onClick={accept} disabled={busy} className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Joining…" : "Accept and join"}
          </button>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">A</span>
          New Perimeter
        </div>
        {body}
      </div>
    </div>
  );
}
