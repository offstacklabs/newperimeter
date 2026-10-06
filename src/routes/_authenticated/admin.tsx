import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { sha256Hex } from "@/lib/policy-engine";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — New Perimeter" },
      { name: "description", content: "Manage MCP servers, policies and audit logs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "servers" | "policies" | "audit" | "keys" | "team" | "settings";
type Role = "admin" | "viewer";
type Workspace = { id: string; name: string; created_by: string | null; default_action: "allow" | "flag" | "block"; audit_retention_days: number; alert_webhook_url: string | null; alert_on: string };

function AlertsCard({ workspace }: { workspace: Workspace }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState(workspace.alert_webhook_url ?? "");
  const [on, setOn] = useState(workspace.alert_on);
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = url.trim();
    if (v && !v.startsWith("https://")) return void toast.error("Webhook URL must start with https://");
    setBusy(true);
    const { error } = await supabase.from("workspaces").update({ alert_webhook_url: v || null, alert_on: on }).eq("id", workspace.id);
    if (check(error, v ? "Alerts saved" : "Alerts turned off")) queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    setBusy(false);
  }
  async function test() {
    const v = url.trim();
    if (!v.startsWith("https://")) return void toast.error("Enter an https:// webhook URL first");
    try {
      await fetch(v, { method: "POST", mode: "no-cors", headers: { "content-type": "text/plain" }, body: JSON.stringify({ text: "New Perimeter test alert: alerts are working." }) });
      toast.success("Test alert sent — check your channel");
    } catch {
      toast.error("Could not reach that URL");
    }
  }
  return (
    <form onSubmit={save} className="rounded-2xl border bg-card p-6 lg:col-span-2">
      <h2 className="text-lg font-bold">Alerts</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Post a message to a webhook (Slack, Microsoft Teams, or your own endpoint) when the gateway stops a tool call. Leave empty to turn off.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/…"
          className="min-w-64 flex-1 rounded-lg border bg-background px-4 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        <select value={on} onChange={(e) => setOn(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="block">Blocked calls</option>
          <option value="flag_block">Blocked + flagged calls</option>
        </select>
        <button type="button" onClick={test} className="rounded-lg border px-4 py-2 text-sm font-semibold">Send test</button>
        <button disabled={busy} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">Save</button>
      </div>
    </form>
  );
}

type WorkspaceContextValue = { workspaceId: string; role: Role };
const WorkspaceContext = createContext<WorkspaceContextValue>({ workspaceId: "", role: "viewer" });
const useWs = () => useContext(WorkspaceContext);
const useIsAdmin = () => useWs().role === "admin";

function check(error: { message: string } | null, success?: string) {
  if (error) {
    toast.error(error.message);
    return false;
  }
  if (success) toast.success(success);
  return true;
}

const outcomeStyles: Record<string, string> = {
  block: "bg-destructive text-destructive-foreground",
  flag: "bg-primary text-primary-foreground",
  allow: "bg-muted",
};

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [creating, setCreating] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => {
    const ws = sessionStorage.getItem("np_ws");
    sessionStorage.removeItem("np_ws");
    return ws;
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces", user.id],
    queryFn: async (): Promise<Workspace[]> => {
      const { data, error } = await supabase.from("workspaces").select("id, name, created_by, default_action, audit_retention_days").order("created_at");
      if (error) throw error;
      return (data ?? []) as Workspace[];
    },
  });

  const workspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0] ?? null;

  const { data: role } = useQuery({
    queryKey: ["my-role", workspace?.id, user.id],
    enabled: !!workspace,
    queryFn: async (): Promise<Role | null> => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspace!.id)
        .eq("user_id", user.id);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role);
      return roles.includes("admin") ? "admin" : roles.includes("viewer") ? "viewer" : null;
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const tabs: Tab[] = role === "admin" ? ["overview", "servers", "policies", "audit", "keys", "team", "settings"] : ["overview", "servers", "policies", "audit"];

  return (
    <div className="min-h-screen bg-muted">
      <Toaster />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">NP</span>
            New Perimeter <span className="font-mono text-xs font-normal text-muted-foreground">console</span>
          </div>
          <div className="flex items-center gap-3">
            {workspaces.length > 0 && (
              <select
                value={workspace?.id ?? ""}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setCreating(true);
                    return;
                  }
                  setCreating(false);
                  setWorkspaceId(e.target.value);
                }}
                className="rounded-lg border bg-background px-3 py-1.5 text-sm font-semibold outline-none focus:border-primary"
                aria-label="Workspace"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
                <option value="__new__">+ New workspace</option>
              </select>
            )}
            {role && <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{role}</span>}
            <span className="hidden text-sm text-muted-foreground sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border bg-background px-4 py-1.5 text-sm font-semibold hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        </div>
        {workspace && role && (
          <nav className="mx-auto flex max-w-6xl gap-1 px-6 pb-3">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                  tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {t === "audit" ? "Audit log" : t === "keys" ? "API keys" : t}
              </button>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : workspaces.length === 0 ? (
          <CreateWorkspace />
        ) : creating ? (
          <CreateWorkspace onCreated={(id) => { setCreating(false); setWorkspaceId(id); }} />
        ) : !workspace || !role ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center">
            <h1 className="text-xl font-extrabold">Waiting for access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account ({user.email}) isn't part of this workspace yet. Ask an admin to add you from the Team tab.
            </p>
          </div>
        ) : (
          <WorkspaceContext.Provider value={{ workspaceId: workspace.id, role }}>
            {tab === "overview" && <Overview />}
            {tab === "servers" && <Servers />}
            {tab === "policies" && <Policies />}
            {tab === "audit" && <AuditLog />}
            {tab === "team" && role === "admin" && <Team currentUserId={user.id} />}
            {tab === "keys" && role === "admin" && <ApiKeys />}
            {tab === "settings" && role === "admin" && (
              <Settings
                key={workspace.id}
                workspace={workspace}
                onDeleted={() => {
                  setWorkspaceId(null);
                  setCreating(false);
                  setTab("overview");
                }}
              />
            )}
          </WorkspaceContext.Provider>
        )}
      </main>
    </div>
  );
}

function CreateWorkspace({ onCreated }: { onCreated?: (id: string) => void }) {
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name, created_by: user.id })
      .select("id")
      .single();
    if (!check(wsError) || !ws) return setBusy(false);
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: ws.id, user_id: user.id, role: "admin" });
    if (!check(memberError)) return setBusy(false);
    toast.success(`Workspace "${name}" created`);
    setName("");
    setBusy(false);
    queryClient.invalidateQueries({ queryKey: ["workspaces", user.id] });
    onCreated?.(ws.id);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-8">
      <h1 className="text-xl font-extrabold tracking-tight">Create a workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A workspace holds its own servers, policies, audit log and team. Invite teammates once it's set up.
      </p>
      <form onSubmit={create} className="mt-6 flex gap-2">
        <input
          required
          placeholder="Workspace name (e.g. Acme Inc)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button disabled={busy} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Creating…" : "Create"}
        </button>
      </form>
    </div>
  );
}

function Team({ currentUserId }: { currentUserId: string }) {
  const { workspaceId } = useWs();
  const queryClient = useQueryClient();
  const { data: members = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_workspace_members", { _ws: workspaceId });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: invites = [] } = useQuery({
    queryKey: ["invites", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_invitations")
        .select("id, email, role, token, expires_at")
        .eq("workspace_id", workspaceId)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");

  const linkFor = (token: string) => `${window.location.origin}/invite/${token}`;
  async function copyLink(token: string) {
    await navigator.clipboard.writeText(linkFor(token));
    toast.success("Invite link copied");
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("workspace_invitations")
      .insert({ workspace_id: workspaceId, email: email.trim().toLowerCase(), role })
      .select("token")
      .single();
    if (check(error, `Invite created for ${email} — link copied, send it to them`)) {
      setEmail("");
      if (data) navigator.clipboard.writeText(linkFor(data.token)).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ["invites", workspaceId] });
  }

  async function revokeInvite(id: string) {
    const { error } = await supabase.from("workspace_invitations").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    check(error, "Invite revoked");
    queryClient.invalidateQueries({ queryKey: ["invites", workspaceId] });
  }

  async function revoke(userId: string) {
    const { error } = await supabase.rpc("remove_from_workspace", { _ws: workspaceId, _user: userId });
    check(error, "Access removed");
    queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
  }

  return (
    <div>
      <form onSubmit={grant} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row">
        <input
          required
          type="email"
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="viewer">viewer</option>
          <option value="admin">admin</option>
        </select>
        <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Create invite</button>
      </form>
      {invites.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Pending invites (expire after 7 days)</h3>
          <div className="overflow-hidden rounded-2xl border bg-card">
            {invites.map((i) => (
              <div key={i.id} className="flex items-center gap-3 border-t px-5 py-3 first:border-t-0">
                <span className="flex-1 text-sm">{i.email}</span>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{i.role}</span>
                <button onClick={() => copyLink(i.token)} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">Copy link</button>
                <button onClick={() => revokeInvite(i.id)} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">Revoke</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">Members</h3>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {members.map((m) => (
          <div key={m.user_id + m.role} className="flex items-center gap-3 border-t px-5 py-4 first:border-t-0">
            <span className="flex-1 font-semibold">{m.email}</span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{m.role}</span>
            {m.user_id !== currentUserId && (
              <button onClick={() => revoke(m.user_id)} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings({
  workspace,
  onDeleted,
}: {
  workspace: Workspace;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const [name, setName] = useState(workspace.name);
  const [defaultAction, setDefaultAction] = useState<"allow" | "flag" | "block">(workspace.default_action);
  const [retention, setRetention] = useState(String(workspace.audit_retention_days));
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("workspaces").update({ name }).eq("id", workspace.id);
    if (check(error, "Workspace renamed")) queryClient.invalidateQueries({ queryKey: ["workspaces", user.id] });
    setBusy(false);
  }

  async function saveEnforcement(e: React.FormEvent) {
    e.preventDefault();
    const days = Number(retention);
    if (!Number.isInteger(days) || days < 7 || days > 3650) {
      toast.error("Audit retention must be between 7 and 3650 days");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("workspaces")
      .update({ default_action: defaultAction, audit_retention_days: days })
      .eq("id", workspace.id);
    if (check(error, "Enforcement defaults saved")) queryClient.invalidateQueries({ queryKey: ["workspaces", user.id] });
    setBusy(false);
  }

  async function deleteWorkspace() {
    if (confirmName !== workspace.name) {
      toast.error("Type the workspace name exactly to confirm");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("delete_workspace", { _ws: workspace.id });
    if (!check(error, `Workspace "${workspace.name}" deleted`)) return setBusy(false);
    setConfirmName("");
    setBusy(false);
    queryClient.invalidateQueries({ queryKey: ["workspaces", user.id] });
    onDeleted();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveGeneral} className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-bold">General</h2>
        <label className="mt-4 block text-sm font-semibold text-muted-foreground" htmlFor="ws-name">
          Workspace name
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="ws-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button disabled={busy || name === workspace.name} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            Save
          </button>
        </div>
      </form>

      <form onSubmit={saveEnforcement} className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-bold">Enforcement defaults</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applied when the enforcement layer sees a tool call that no policy covers.
        </p>
        <label className="mt-4 block text-sm font-semibold text-muted-foreground" htmlFor="ws-action">
          Default action for unlisted tools
        </label>
        <select
          id="ws-action"
          value={defaultAction}
          onChange={(e) => setDefaultAction(e.target.value as "allow" | "flag" | "block")}
          className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="block">block (fail closed)</option>
          <option value="flag">flag (allow, mark for review)</option>
          <option value="allow">allow (fail open)</option>
        </select>
        <label className="mt-4 block text-sm font-semibold text-muted-foreground" htmlFor="ws-retention">
          Audit log retention (days)
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="ws-retention"
            required
            type="number"
            min={7}
            max={3650}
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
            className="w-32 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button disabled={busy} className="ml-auto rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            Save
          </button>
        </div>
      </form>

      <AlertsCard workspace={workspace} />


      <div className="rounded-2xl border border-destructive/40 bg-card p-6 lg:col-span-2">
        <h2 className="text-lg font-bold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleting <span className="font-semibold">{workspace.name}</span> permanently removes its servers, policies,
          audit log and team memberships. This cannot be undone.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            placeholder={`Type "${workspace.name}" to confirm`}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-destructive"
          />
          <button
            disabled={busy || confirmName !== workspace.name}
            onClick={deleteWorkspace}
            className="rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
          >
            Delete workspace
          </button>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const { workspaceId } = useWs();
  const { data: servers = [] } = useQuery({
    queryKey: ["servers", workspaceId],
    queryFn: async () =>
      (await supabase.from("mcp_servers").select("*").eq("workspace_id", workspaceId)).data ?? [],
  });
  const { data: policies = [] } = useQuery({
    queryKey: ["policies", workspaceId],
    queryFn: async () =>
      (await supabase.from("policies").select("*").eq("workspace_id", workspaceId)).data ?? [],
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["audit", workspaceId],
    queryFn: async () =>
      (await supabase.from("audit_logs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false })).data ?? [],
  });

  const blocked = logs.filter((l) => l.outcome === "block").length;
  const flagged = logs.filter((l) => l.outcome === "flag").length;

  const stats = [
    ["Registered servers", servers.length],
    ["Active policies", policies.filter((p) => p.enabled).length],
    ["Calls logged", logs.length],
    ["Blocked attempts", blocked],
    ["Flagged calls", flagged],
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-card p-5">
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-bold">Recent activity</h2>
      <div className="mt-4 rounded-2xl border bg-card p-5">
        {logs.slice(0, 5).map((l) => (
          <div key={l.id} className="flex items-center justify-between border-t py-3 font-mono text-sm first:border-t-0">
            <span className={`w-14 rounded px-2 py-0.5 text-center text-xs ${outcomeStyles[l.outcome]}`}>{l.outcome}</span>
            <span className="flex-1 px-4">{l.tool}</span>
            <span className="text-muted-foreground">{l.actor}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
      </div>
    </div>
  );
}

function Servers() {
  const { workspaceId } = useWs();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { data: servers = [] } = useQuery({
    queryKey: ["servers", workspaceId],
    queryFn: async () =>
      (await supabase.from("mcp_servers").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false })).data ?? [],
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  async function addServer(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("mcp_servers").insert({
      name,
      url,
      workspace_id: workspaceId,
      created_by: userData.user?.id ?? null,
    });
    if (!check(error, "Server registered")) return;
    setName("");
    setUrl("");
    queryClient.invalidateQueries({ queryKey: ["servers", workspaceId] });
  }

  async function setStatus(id: string, status: "approved" | "blocked" | "pending") {
    const { error } = await supabase.from("mcp_servers").update({ status }).eq("id", id).eq("workspace_id", workspaceId);
    check(error);
    queryClient.invalidateQueries({ queryKey: ["servers", workspaceId] });
  }

  return (
    <div>
      {isAdmin && <form onSubmit={addServer} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row">
        <input
          required
          placeholder="Server name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          required
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Register</button>
      </form>}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {servers.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 border-t px-5 py-4 first:border-t-0">
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{s.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{s.url} · v{s.version}</p>
              <button
                type="button"
                title="Copy the address agents should use instead of the server's own URL"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/public/mcp/${s.id}`);
                  toast.success("Gateway URL copied");
                }}
                className="mt-1 font-mono text-xs text-primary hover:underline"
              >
                Gateway: /api/public/mcp/{s.id.slice(0, 8)}… (copy)
              </button>
            </div>
            <span
              className={`rounded px-2 py-0.5 font-mono text-xs ${
                s.status === "blocked"
                  ? "bg-destructive text-destructive-foreground"
                  : s.status === "approved"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
              }`}
            >
              {s.status}
            </span>
            {isAdmin && <div className="flex gap-2">
              <button onClick={() => setStatus(s.id, "approved")} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">Approve</button>
              <button onClick={() => setStatus(s.id, "blocked")} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">Block</button>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Policies() {
  const { workspaceId } = useWs();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { data: policies = [] } = useQuery({
    queryKey: ["policies", workspaceId],
    queryFn: async () =>
      (await supabase.from("policies").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false })).data ?? [],
  });
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("");
  const [effect, setEffect] = useState<"allow" | "block" | "flag">("block");

  async function addPolicy(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("policies").insert({ name, tool_pattern: pattern, effect, workspace_id: workspaceId });
    if (!check(error, "Policy added")) return;
    setName("");
    setPattern("");
    queryClient.invalidateQueries({ queryKey: ["policies", workspaceId] });
  }

  async function toggle(id: string, enabled: boolean) {
    const { error } = await supabase.from("policies").update({ enabled: !enabled }).eq("id", id).eq("workspace_id", workspaceId);
    check(error);
    queryClient.invalidateQueries({ queryKey: ["policies", workspaceId] });
  }

  return (
    <div>
      {isAdmin && <form onSubmit={addPolicy} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row">
        <input
          required
          placeholder="Policy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          required
          placeholder="write_file or filesystem.* or *.drop_*"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        <select
          value={effect}
          onChange={(e) => setEffect(e.target.value as "allow" | "block" | "flag")}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="allow">allow</option>
          <option value="block">block</option>
          <option value="flag">flag</option>
        </select>
        <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Add</button>
      </form>}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {policies.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 border-t px-5 py-4 first:border-t-0">
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{p.tool_pattern} · {p.scope}</p>
            </div>
            <span className={`rounded px-2 py-0.5 font-mono text-xs ${outcomeStyles[p.effect]}`}>{p.effect}</span>
            <button
              disabled={!isAdmin}
              onClick={() => toggle(p.id, p.enabled)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                p.enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {p.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLog() {
  const { workspaceId } = useWs();
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState<"all" | "allow" | "flag" | "block">("all");
  const [server, setServer] = useState("all");
  const { data: logs = [] } = useQuery({
    queryKey: ["audit", workspaceId],
    queryFn: async () =>
      (await supabase.from("audit_logs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const servers = [...new Set(logs.map((l) => l.server))].sort();
  const q = search.trim().toLowerCase();
  const filtered = logs.filter(
    (l) =>
      (outcome === "all" || l.outcome === outcome) &&
      (server === "all" || l.server === server) &&
      (!q || l.tool.toLowerCase().includes(q) || l.server.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q) || (l.detail ?? "").toLowerCase().includes(q)),
  );

  function exportCsv() {
    const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["time", "outcome", "tool", "server", "actor", "detail"].join(","),
      ...filtered.map((l) => [l.created_at, l.outcome, l.tool, l.server, l.actor, l.detail].map(esc).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `newperimeter-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectCls = "rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search tool, server, actor or detail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-56 flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <select value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)} className={selectCls}>
          <option value="all">All outcomes</option>
          <option value="allow">Allowed</option>
          <option value="flag">Flagged</option>
          <option value="block">Blocked</option>
        </select>
        <select value={server} onChange={(e) => setServer(e.target.value)} className={selectCls}>
          <option value="all">All servers</option>
          {servers.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
        >
          Export CSV ({filtered.length})
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border bg-card">
        {filtered.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-3 border-t px-5 py-3 font-mono text-sm first:border-t-0">
            <span className={`w-14 rounded px-2 py-0.5 text-center text-xs ${outcomeStyles[l.outcome]}`}>{l.outcome}</span>
            <span className="min-w-40 flex-1">{l.tool}</span>
            <span className="text-muted-foreground">{l.server}</span>
            <span className="text-muted-foreground">{l.actor}</span>
            <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
            {l.detail && <span className="w-full text-xs text-muted-foreground">{l.detail}</span>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">{logs.length === 0 ? "No events logged yet." : "No events match these filters."}</p>
        )}
      </div>
    </div>
  );
}

function ApiKeys() {
  const { workspaceId } = useWs();
  const queryClient = useQueryClient();
  const { data: keys = [] } = useQuery({
    queryKey: ["api-keys", workspaceId],
    queryFn: async () =>
      (await supabase
        .from("workspace_api_keys")
        .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })).data ?? [],
  });
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const key = "aw_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabase.from("workspace_api_keys").insert({
      workspace_id: workspaceId,
      name,
      key_prefix: key.slice(0, 10),
      key_hash: await sha256Hex(key),
    });
    if (!check(error, "API key created")) return;
    setFresh(key);
    setName("");
    queryClient.invalidateQueries({ queryKey: ["api-keys", workspaceId] });
  }

  async function revoke(id: string) {
    const { error } = await supabase
      .from("workspace_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    check(error, "Key revoked");
    queryClient.invalidateQueries({ queryKey: ["api-keys", workspaceId] });
  }

  return (
    <div>
      <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        Point agents at a server's <span className="font-semibold text-foreground">Gateway URL</span> (Servers tab) and send{" "}
        <code className="font-mono text-foreground">Authorization: Bearer &lt;key&gt;</code>. Every tool call is checked against your
        policies and logged. If the real server needs its own token, send it as{" "}
        <code className="font-mono text-foreground">X-Upstream-Authorization</code>.
      </div>
      <form onSubmit={create} className="mt-4 flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row">
        <input
          required
          placeholder="Key name (e.g. cursor-prod)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Create key</button>
      </form>
      {fresh && (
        <div className="mt-4 rounded-2xl border border-primary bg-card p-4">
          <p className="text-sm font-semibold">Copy this key now — it won't be shown again.</p>
          <div className="mt-2 flex gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 font-mono text-xs" data-testid="new-key">{fresh}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(fresh); toast.success("Copied"); }}
              className="rounded border px-3 text-xs font-semibold hover:bg-accent"
            >
              Copy
            </button>
            <button onClick={() => setFresh(null)} className="rounded border px-3 text-xs font-semibold hover:bg-accent">Done</button>
          </div>
        </div>
      )}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {keys.length === 0 && <p className="px-5 py-4 text-sm text-muted-foreground">No keys yet.</p>}
        {keys.map((k) => (
          <div key={k.id} className="flex flex-wrap items-center gap-3 border-t px-5 py-4 first:border-t-0">
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{k.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {k.key_prefix}… · last used {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}
              </p>
            </div>
            {k.revoked_at ? (
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">revoked</span>
            ) : (
              <button onClick={() => revoke(k.id)} className="rounded border px-3 py-1 text-xs font-semibold hover:bg-accent">Revoke</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
