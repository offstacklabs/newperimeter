import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Agentwall" },
      { name: "description", content: "Manage MCP servers, policies and audit logs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "servers" | "policies" | "audit" | "team";
type Role = "admin" | "viewer";
type Workspace = { id: string; name: string; created_by: string | null };

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
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces", user.id],
    queryFn: async (): Promise<Workspace[]> => {
      const { data, error } = await supabase.from("workspaces").select("id, name, created_by").order("created_at");
      if (error) throw error;
      return data ?? [];
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

  const tabs: Tab[] = role === "admin" ? ["overview", "servers", "policies", "audit", "team"] : ["overview", "servers", "policies", "audit"];

  return (
    <div className="min-h-screen bg-muted">
      <Toaster />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">A</span>
            Agentwall <span className="font-mono text-xs font-normal text-muted-foreground">console</span>
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
                {t === "audit" ? "Audit log" : t}
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
          </WorkspaceContext.Provider>
        )}
      </main>
    </div>
  );
}

function CreateWorkspace() {
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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.rpc("invite_to_workspace", { _ws: workspaceId, _email: email, _role: role });
    if (check(error, `Access granted to ${email}`)) setEmail("");
    queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
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
          placeholder="teammate@company.com (must have signed up)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="viewer">viewer</option>
          <option value="admin">admin</option>
        </select>
        <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Grant access</button>
      </form>
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
          placeholder="tool.pattern_*"
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
  const { data: logs = [] } = useQuery({
    queryKey: ["audit", workspaceId],
    queryFn: async () =>
      (await supabase.from("audit_logs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {logs.map((l) => (
        <div key={l.id} className="flex flex-wrap items-center gap-3 border-t px-5 py-3 font-mono text-sm first:border-t-0">
          <span className={`w-14 rounded px-2 py-0.5 text-center text-xs ${outcomeStyles[l.outcome]}`}>{l.outcome}</span>
          <span className="min-w-40 flex-1">{l.tool}</span>
          <span className="text-muted-foreground">{l.server}</span>
          <span className="text-muted-foreground">{l.actor}</span>
          <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
        </div>
      ))}
      {logs.length === 0 && <p className="p-5 text-sm text-muted-foreground">No events logged yet.</p>}
    </div>
  );
}
