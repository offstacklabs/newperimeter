export type ServerRow = {
  id: string;
  name: string;
  url: string;
  version: string;
  status: "pending" | "approved" | "blocked";
  created_at: string;
  created_by: string | null;
  workspace_id: string;
};

export type PolicyRow = {
  id: string;
  name: string;
  tool_pattern: string;
  effect: "allow" | "block" | "flag";
  scope: string;
  enabled: boolean;
  created_at: string;
  workspace_id: string;
};

export type AuditLogRow = {
  id: string;
  actor: string;
  tool: string;
  server: string;
  outcome: "allow" | "block" | "flag";
  detail: string | null;
  created_at: string;
  workspace_id: string;
};

export type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type MemberRow = { user_id: string; email: string; role: "admin" | "viewer"; created_at: string };
export type InvitationRow = { id: string; email: string; role: "admin" | "viewer"; token: string; expires_at: string };
