import { createFileRoute } from "@tanstack/react-router";
import { auth, authBaseUrl, isTrustedRequestOrigin } from "@/lib/auth.server";
import { db } from "@/lib/db.server";
import { escapeHtml, sendEmail } from "@/lib/email.server";
import { randomHex } from "@/lib/random";

type Input = { action: string; [key: string]: unknown };

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function handle(request: Request) {
  const origin = request.headers.get("origin");
  if (!isTrustedRequestOrigin(origin)) return jsonError("Invalid request origin", 403);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return jsonError("Sign in required", 401);

  let input: Input;
  try {
    input = (await request.json()) as Input;
    if (!input || typeof input.action !== "string") throw new Error();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const userId = session.user.id;
  const workspaceId = typeof input["workspaceId"] === "string" ? input["workspaceId"] : "";
  const requireMember = async () => {
    const result = await db.query<{ allowed: boolean }>(
      "select public.is_workspace_member($1::uuid, $2::uuid) as allowed",
      [workspaceId, userId],
    );
    if (!result.rows[0]?.allowed) throw new Error("Workspace access denied");
  };
  const requireAdmin = async () => {
    const result = await db.query<{ allowed: boolean }>(
      "select public.has_workspace_role($1::uuid, $2::uuid, 'admin'::public.app_role) as allowed",
      [workspaceId, userId],
    );
    if (!result.rows[0]?.allowed) throw new Error("Workspace admin access required");
  };
  const value = (key: string) => input[key];
  const string = (key: string) => {
    const v = value(key);
    if (typeof v !== "string" || !v.trim()) throw new Error(`Invalid ${key}`);
    return v.trim();
  };

  try {
    let data: unknown;
    switch (input.action) {
      case "getWorkspaces": {
        const result = await db.query(
          `select w.id, w.name, w.created_by, w.default_action, w.audit_retention_days,
                  w.alert_webhook_url, w.alert_on, m.role
             from public.workspaces w
             join public.workspace_members m on m.workspace_id = w.id and m.user_id = $1::uuid
            order by w.created_at`,
          [userId],
        );
        data = result.rows;
        break;
      }
      case "getMyRole": {
        await requireMember();
        const result = await db.query(
          "select role from public.workspace_members where workspace_id = $1::uuid and user_id = $2::uuid",
          [workspaceId, userId],
        );
        data = result.rows[0]?.role ?? null;
        break;
      }
      case "createWorkspace": {
        const name = string("name");
        const client = await db.connect();
        try {
          await client.query("begin");
          const ws = await client.query<{ id: string }>(
            "insert into public.workspaces(name, created_by) values ($1, $2::uuid) returning id",
            [name, userId],
          );
          const id = ws.rows[0]!.id;
          await client.query(
            "insert into public.workspace_members(workspace_id, user_id, role) values ($1::uuid, $2::uuid, 'admin')",
            [id, userId],
          );
          await client.query("commit");
          data = { id };
        } catch (error) {
          await client.query("rollback");
          throw error;
        } finally {
          client.release();
        }
        break;
      }
      case "updateWorkspace": {
        await requireAdmin();
        const name = typeof value("name") === "string" ? String(value("name")).trim() : undefined;
        const defaultAction = value("default_action");
        const retention = value("audit_retention_days");
        const alertUrl = value("alert_webhook_url");
        const alertOn = value("alert_on");
        if (name !== undefined) {
          await db.query("update public.workspaces set name = $2 where id = $1::uuid", [workspaceId, name]);
        }
        if (defaultAction !== undefined || retention !== undefined) {
          await db.query(
            `update public.workspaces set
              default_action = coalesce($2, default_action),
              audit_retention_days = coalesce($3, audit_retention_days)
             where id = $1::uuid`,
            [workspaceId, defaultAction ?? null, retention ?? null],
          );
        }
        if (alertUrl !== undefined || alertOn !== undefined) {
          await db.query(
            `update public.workspaces set
              alert_webhook_url = coalesce($2, alert_webhook_url),
              alert_on = coalesce($3, alert_on)
             where id = $1::uuid`,
            [workspaceId, alertUrl, alertOn],
          );
        }
        data = null;
        break;
      }
      case "deleteWorkspace": {
        await requireAdmin();
        await db.query("delete from public.workspaces where id = $1::uuid", [workspaceId]);
        data = null;
        break;
      }
      case "listMembers": {
        await requireAdmin();
        const result = await db.query(
          `select m.user_id, u.email, m.role, m.created_at
             from public.workspace_members m
             join public."user" u on u.id = m.user_id
            where m.workspace_id = $1::uuid order by m.created_at`,
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "listInvitations": {
        await requireAdmin();
        const result = await db.query(
          `select id, email, role, token, expires_at from public.workspace_invitations
            where workspace_id = $1::uuid and accepted_at is null and revoked_at is null
              and expires_at > now() order by created_at desc`,
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "createInvitation": {
        await requireAdmin();
        const email = string("email").toLowerCase();
        const role = value("role");
        if (role !== "admin" && role !== "viewer") throw new Error("Invalid role");
        const workspaceResult = await db.query<{ name: string }>(
          "select name from public.workspaces where id = $1::uuid",
          [workspaceId],
        );
        const workspaceName = workspaceResult.rows[0]?.name;
        if (!workspaceName) throw new Error("Workspace not found");
        const token = randomHex(24);
        await db.query(
          `insert into public.workspace_invitations(workspace_id, email, role, token, invited_by)
           values ($1::uuid, $2, $3::public.app_role, $4, $5::uuid)`,
          [workspaceId, email, role, token, userId],
        );
        const inviteUrl = new URL(`/invite/${token}`, authBaseUrl).toString();
        const safeWorkspaceName = escapeHtml(workspaceName);
        const safeInviteUrl = escapeHtml(inviteUrl);
        try {
          await sendEmail({
            to: email,
            subject: `Invitation to join ${workspaceName} on New Perimeter`,
            text: `You have been invited to join ${workspaceName} on New Perimeter as a ${role}. Accept your invitation: ${inviteUrl}`,
            html: `<p>You have been invited to join <strong>${safeWorkspaceName}</strong> on New Perimeter as a ${role}.</p><p><a href="${safeInviteUrl}">Accept invitation</a></p><p>This invitation expires in 7 days.</p>`,
          });
        } catch (error) {
          await db.query(
            "delete from public.workspace_invitations where token = $1 and workspace_id = $2::uuid",
            [token, workspaceId],
          );
          throw error;
        }
        data = { token };
        break;
      }
      case "revokeInvitation": {
        await requireAdmin();
        await db.query(
          "update public.workspace_invitations set revoked_at = now() where id = $1::uuid and workspace_id = $2::uuid",
          [string("id"), workspaceId],
        );
        data = null;
        break;
      }
      case "removeMember": {
        await requireAdmin();
        const memberId = string("userId");
        if (memberId === userId) throw new Error("You cannot remove yourself");
        await db.query(
          "delete from public.workspace_members where workspace_id = $1::uuid and user_id = $2::uuid",
          [workspaceId, memberId],
        );
        data = null;
        break;
      }
      case "listServers": {
        await requireMember();
        const result = await db.query(
          "select * from public.mcp_servers where workspace_id = $1::uuid order by created_at desc",
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "createServer": {
        await requireAdmin();
        const result = await db.query(
          `insert into public.mcp_servers(name, url, workspace_id, created_by)
           values ($1, $2, $3::uuid, $4::uuid) returning *`,
          [string("name"), string("url"), workspaceId, userId],
        );
        data = result.rows[0];
        break;
      }
      case "setServerStatus": {
        await requireAdmin();
        const status = value("status");
        if (status !== "pending" && status !== "approved" && status !== "blocked") throw new Error("Invalid status");
        await db.query(
          "update public.mcp_servers set status = $3 where id = $1::uuid and workspace_id = $2::uuid",
          [string("id"), workspaceId, status],
        );
        data = null;
        break;
      }
      case "listPolicies": {
        await requireMember();
        const result = await db.query(
          "select * from public.policies where workspace_id = $1::uuid order by created_at desc",
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "createPolicy": {
        await requireAdmin();
        const effect = value("effect");
        if (effect !== "allow" && effect !== "block" && effect !== "flag") throw new Error("Invalid effect");
        const result = await db.query(
          `insert into public.policies(name, tool_pattern, effect, workspace_id)
           values ($1, $2, $3, $4::uuid) returning *`,
          [string("name"), string("tool_pattern"), effect, workspaceId],
        );
        data = result.rows[0];
        break;
      }
      case "togglePolicy": {
        await requireAdmin();
        await db.query(
          "update public.policies set enabled = not enabled where id = $1::uuid and workspace_id = $2::uuid",
          [string("id"), workspaceId],
        );
        data = null;
        break;
      }
      case "listAuditLogs": {
        await requireMember();
        const result = await db.query(
          "select * from public.audit_logs where workspace_id = $1::uuid order by created_at desc limit 500",
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "listApiKeys": {
        await requireAdmin();
        const result = await db.query(
          `select id, name, key_prefix, created_at, last_used_at, revoked_at
             from public.workspace_api_keys where workspace_id = $1::uuid order by created_at desc`,
          [workspaceId],
        );
        data = result.rows;
        break;
      }
      case "createApiKey": {
        await requireAdmin();
        const result = await db.query(
          `insert into public.workspace_api_keys(workspace_id, name, key_prefix, key_hash, created_by)
           values ($1::uuid, $2, $3, $4, $5::uuid) returning id`,
          [workspaceId, string("name"), string("key_prefix"), string("key_hash"), userId],
        );
        data = result.rows[0];
        break;
      }
      case "revokeApiKey": {
        await requireAdmin();
        await db.query(
          "update public.workspace_api_keys set revoked_at = now() where id = $1::uuid and workspace_id = $2::uuid",
          [string("id"), workspaceId],
        );
        data = null;
        break;
      }
      case "updateAlertSettings": {
        await requireAdmin();
        const alertUrl = value("alert_webhook_url");
        const alertOn = value("alert_on");
        if (alertUrl !== null && typeof alertUrl !== "string") throw new Error("Invalid alert_webhook_url");
        if (alertOn !== "block" && alertOn !== "flag_block") throw new Error("Invalid alert_on");
        await db.query(
          "update public.workspaces set alert_webhook_url = $2, alert_on = $3 where id = $1::uuid",
          [workspaceId, alertUrl, alertOn],
        );
        data = null;
        break;
      }
      default:
        return jsonError("Unknown action", 400);
    }
    return Response.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = /access denied|admin access required/i.test(message) ? 403 : 400;
    return jsonError(message, status);
  }
}

export const Route = createFileRoute("/api/admin")({
  server: { handlers: { POST: ({ request }) => handle(request) } },
});
