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
- Multi-tenancy: every row in `mcp_servers`, `policies`, `audit_logs` is scoped to a `workspace_id`; access is granted only through `workspace_members` (per-workspace admin/viewer roles) via the `is_workspace_member` / `has_workspace_role` security-definer functions. Global `user_roles` is deprecated — never grant access through it.
- A signed-up user with no workspace sees a "Create a workspace" screen (creator becomes its admin); do not auto-join users to existing workspaces.
