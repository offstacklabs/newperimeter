<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Brand: the product is "New Perimeter" (domain newperimeter.dev); capability pages are named Perimeter Gateway / Identity & Policy / Runtime / Audit / Catalog / Discover. Never use the old name "Agentwall" in UI copy.
- Multi-tenancy: every row in `mcp_servers`, `policies`, `audit_logs` is scoped to a `workspace_id`; access is granted only through `workspace_members` (per-workspace admin/viewer roles) via the `is_workspace_member` / `has_workspace_role` security-definer functions. Global `user_roles` is deprecated — never grant access through it.
- A signed-up user with no workspace sees a "Create a workspace" screen (creator becomes its admin); do not auto-join users to existing workspaces.
- MCP gateway: agents call `/api/public/mcp/<serverId>` with a workspace API key (only its SHA-256 hash is stored); the route evaluates policies via `src/lib/policy-engine.ts` (block > flag > allow, else workspace default), writes audit_logs, then forwards to the upstream URL — keep enforcement server-side in that route.
- Workspace invitations: admins create rows in workspace_invitations (random token, 7-day expiry); joining happens only via accept_invitation RPC, which requires the signed-in email to match the invite — keeps membership grants server-checked.
