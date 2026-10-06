import { createFileRoute } from "@tanstack/react-router";
import { evaluate, sha256Hex, type Effect } from "@/lib/policy-engine";
import { db } from "@/lib/db.server";

type RpcMessage = { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string } };

function rpcError(id: RpcMessage["id"], code: number, message: string, status = 200) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

const FORWARD_HEADERS = ["content-type", "accept", "mcp-session-id", "mcp-protocol-version", "last-event-id"];

async function authorize(request: Request, serverId: string) {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key.startsWith("aw_")) return { error: rpcError(null, -32001, "Missing or invalid New Perimeter API key", 401) };
  if (!/^[0-9a-f-]{36}$/i.test(serverId)) return { error: rpcError(null, -32002, "Unknown server", 404) };

  const keyResult = await db.query<{ id: string; name: string; workspace_id: string; revoked_at: string | null }>(
    "select id, name, workspace_id, revoked_at from public.workspace_api_keys where key_hash = $1 limit 1",
    [await sha256Hex(key)],
  );
  const apiKey = keyResult.rows[0];
  if (!apiKey || apiKey.revoked_at) return { error: rpcError(null, -32001, "API key revoked or not found", 401) };

  const serverResult = await db.query<{ id: string; name: string; url: string; status: string; workspace_id: string }>(
    `select id, name, url, status, workspace_id from public.mcp_servers
      where id = $1::uuid and workspace_id = $2::uuid limit 1`,
    [serverId, apiKey.workspace_id],
  );
  const server = serverResult.rows[0];
  if (!server) return { error: rpcError(null, -32002, "Unknown server", 404) };

  await db.query("update public.workspace_api_keys set last_used_at = now() where id = $1::uuid", [apiKey.id]);
  return { apiKey, server };
}

async function writeAudit(rows: Array<{ workspaceId: string; actor: string; server: string; tool: string; outcome: Effect; detail: string }>) {
  for (const row of rows) {
    await db.query(
      `insert into public.audit_logs(workspace_id, actor, server, tool, outcome, detail)
       values ($1::uuid, $2, $3, $4, $5, $6)`,
      [row.workspaceId, row.actor, row.server, row.tool, row.outcome, row.detail],
    );
  }
}

async function forward(request: Request, url: string, body: string | null = null) {
  const headers = new Headers();
  for (const h of FORWARD_HEADERS) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  const upstreamAuth = request.headers.get("x-upstream-authorization");
  if (upstreamAuth) headers.set("authorization", upstreamAuth);
  try {
    const res = await fetch(url, { method: request.method, headers, body });
    const out = new Headers();
    for (const h of ["content-type", "mcp-session-id", "cache-control"]) {
      const v = res.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(res.body, { status: res.status, headers: out });
  } catch (e) {
    console.error("Upstream MCP server unreachable", e);
    return rpcError(null, -32003, "Upstream MCP server unreachable", 502);
  }
}

export const Route = createFileRoute("/api/public/mcp/$serverId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const ctx = await authorize(request, params.serverId);
        if ("error" in ctx) return ctx.error;
        const { apiKey, server } = ctx;
        const actor = `key:${apiKey.name}`;

        const raw = await request.text();
        let parsed: RpcMessage | RpcMessage[];
        try {
          parsed = JSON.parse(raw);
        } catch {
          return rpcError(null, -32700, "Parse error", 400);
        }
        const messages = Array.isArray(parsed) ? parsed : [parsed];
        const calls = messages.filter((m) => m?.method === "tools/call");

        if (server.status !== "approved") {
          if (calls.length) {
            await writeAudit(calls.map((c) => ({
              workspaceId: server.workspace_id, actor, server: server.name,
              tool: String(c.params?.name ?? "unknown"), outcome: "block" as const,
              detail: `Server is ${server.status}, not approved`,
            })));
          }
          return rpcError(messages[0]?.id, -32004, `Server "${server.name}" is ${server.status}; an admin must approve it`, 403);
        }

        if (calls.length) {
          const [wsResult, rulesResult] = await Promise.all([
            db.query<{ default_action: Effect; alert_webhook_url: string | null; alert_on: string }>(
              "select default_action, alert_webhook_url, alert_on from public.workspaces where id = $1::uuid",
              [server.workspace_id],
            ),
            db.query<Array<{ name: string; tool_pattern: string; effect: Effect; enabled: boolean }>[number]>(
              "select name, tool_pattern, effect, enabled from public.policies where workspace_id = $1::uuid",
              [server.workspace_id],
            ),
          ]);
          const ws = wsResult.rows[0];
          const rules = rulesResult.rows;
          const fallback = (ws?.default_action ?? "block") as Effect;
          const decisions = calls.map((c) => {
            const tool = String(c.params?.name ?? "unknown");
            return { call: c, tool, ...evaluate(rules ?? [], tool, server.name, fallback) };
          });
          await writeAudit(decisions.map((d) => ({
            workspaceId: server.workspace_id, actor, server: server.name, tool: d.tool, outcome: d.effect,
            detail: d.policy ? `Matched policy "${d.policy}"` : `No policy matched; workspace default (${d.effect})`,
          })));
          if (ws?.alert_webhook_url) {
            const alertable = decisions.filter(
              (d) => d.effect === "block" || (ws.alert_on === "flag_block" && d.effect === "flag"),
            );
            if (alertable.length) {
              const lines = alertable.map(
                (d) => `${d.effect === "block" ? "Blocked" : "Flagged"}: ${server.name}.${d.tool} by ${actor}${d.policy ? ` (policy "${d.policy}")` : " (workspace default)"}`,
              );
              try {
                await fetch(ws.alert_webhook_url, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    text: `New Perimeter alert\n${lines.join("\n")}`,
                    events: alertable.map((d) => ({ outcome: d.effect, server: server.name, tool: d.tool, actor, policy: d.policy ?? null })),
                  }),
                  signal: AbortSignal.timeout(3000),
                });
              } catch (e) {
                console.error("Alert webhook failed", e);
              }
            }
          }
          const blocked = decisions.find((d) => d.effect === "block");
          if (blocked) {
            return rpcError(
              blocked.call.id, -32005,
              `Blocked by New Perimeter: ${blocked.policy ? `policy "${blocked.policy}"` : "workspace default"}`,
            );
          }
        }
        return forward(request, server.url, raw);
      },
      GET: async ({ request, params }) => {
        const ctx = await authorize(request, params.serverId);
        if ("error" in ctx) return ctx.error;
        if (ctx.server.status !== "approved") return rpcError(null, -32004, "Server not approved", 403);
        return forward(request, ctx.server.url);
      },
      DELETE: async ({ request, params }) => {
        const ctx = await authorize(request, params.serverId);
        if ("error" in ctx) return ctx.error;
        return forward(request, ctx.server.url);
      },
    },
  },
});
