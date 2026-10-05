import { createFileRoute } from "@tanstack/react-router";
import { evaluate, sha256Hex, type Effect } from "@/lib/policy-engine";

type RpcMessage = { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string } };

function rpcError(id: RpcMessage["id"], code: number, message: string, status = 200) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

const FORWARD_HEADERS = ["content-type", "accept", "mcp-session-id", "mcp-protocol-version", "last-event-id"];

async function authorize(request: Request, serverId: string) {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key.startsWith("aw_")) return { error: rpcError(null, -32001, "Missing or invalid Agentwall API key", 401) };
  if (!/^[0-9a-f-]{36}$/i.test(serverId)) return { error: rpcError(null, -32002, "Unknown server", 404) };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: apiKey } = await supabaseAdmin
    .from("workspace_api_keys")
    .select("id, name, workspace_id, revoked_at")
    .eq("key_hash", await sha256Hex(key))
    .maybeSingle();
  if (!apiKey || apiKey.revoked_at) return { error: rpcError(null, -32001, "API key revoked or not found", 401) };

  const { data: server } = await supabaseAdmin
    .from("mcp_servers")
    .select("id, name, url, status, workspace_id")
    .eq("id", serverId)
    .eq("workspace_id", apiKey.workspace_id)
    .maybeSingle();
  if (!server) return { error: rpcError(null, -32002, "Unknown server", 404) };

  await supabaseAdmin.from("workspace_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id);
  return { supabaseAdmin, apiKey, server };
}

async function forward(request: Request, url: string, body?: string) {
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
        const { supabaseAdmin, apiKey, server } = ctx;
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
            await supabaseAdmin.from("audit_logs").insert(
              calls.map((c) => ({
                workspace_id: server.workspace_id, actor, server: server.name,
                tool: String(c.params?.name ?? "unknown"), outcome: "block",
                detail: `Server is ${server.status}, not approved`,
              })),
            );
          }
          return rpcError(messages[0]?.id, -32004, `Server "${server.name}" is ${server.status}; an admin must approve it`, 403);
        }

        if (calls.length) {
          const [{ data: ws }, { data: rules }] = await Promise.all([
            supabaseAdmin.from("workspaces").select("default_action").eq("id", server.workspace_id).single(),
            supabaseAdmin.from("policies").select("name, tool_pattern, effect, enabled").eq("workspace_id", server.workspace_id),
          ]);
          const fallback = (ws?.default_action ?? "block") as Effect;
          const decisions = calls.map((c) => {
            const tool = String(c.params?.name ?? "unknown");
            return { call: c, tool, ...evaluate(rules ?? [], tool, server.name, fallback) };
          });
          await supabaseAdmin.from("audit_logs").insert(
            decisions.map((d) => ({
              workspace_id: server.workspace_id, actor, server: server.name, tool: d.tool, outcome: d.effect,
              detail: d.policy ? `Matched policy "${d.policy}"` : `No policy matched; workspace default (${d.effect})`,
            })),
          );
          const blocked = decisions.find((d) => d.effect === "block");
          if (blocked) {
            return rpcError(
              blocked.call.id, -32005,
              `Blocked by Agentwall: ${blocked.policy ? `policy "${blocked.policy}"` : "workspace default"}`,
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
