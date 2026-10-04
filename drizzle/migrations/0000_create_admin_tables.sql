CREATE TABLE public.mcp_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','blocked')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mcp_servers TO authenticated;
GRANT ALL ON public.mcp_servers TO service_role;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read servers" ON public.mcp_servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert servers" ON public.mcp_servers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update servers" ON public.mcp_servers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete servers" ON public.mcp_servers FOR DELETE TO authenticated USING (true);

CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tool_pattern text NOT NULL,
  effect text NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow','block','flag')),
  scope text NOT NULL DEFAULT 'all teams',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policies TO authenticated;
GRANT ALL ON public.policies TO service_role;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read policies" ON public.policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert policies" ON public.policies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update policies" ON public.policies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete policies" ON public.policies FOR DELETE TO authenticated USING (true);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  tool text NOT NULL,
  server text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('allow','block','flag')),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.mcp_servers (name, url, version, status) VALUES
  ('GitHub MCP', 'https://mcp.github.internal', '2.4.1', 'approved'),
  ('Postgres Tools', 'https://mcp.db.internal', '1.9.0', 'approved'),
  ('Slack Connector', 'https://mcp.slack.internal', '0.8.2', 'pending'),
  ('Filesystem RW', 'https://mcp.fs.internal', '1.2.0', 'blocked');

INSERT INTO public.policies (name, tool_pattern, effect, scope, enabled) VALUES
  ('No destructive DB calls', 'postgres.drop_*', 'block', 'all teams', true),
  ('PR creation allowed', 'github.create_pr', 'allow', 'engineering', true),
  ('Watch outbound Slack posts', 'slack.post_message', 'flag', 'all teams', true),
  ('Read-only search', 'linear.search', 'allow', 'all teams', false);

INSERT INTO public.audit_logs (actor, tool, server, outcome, detail, created_at) VALUES
  ('maria@acme.io', 'github.create_pr', 'GitHub MCP', 'allow', 'PR #412 created in acme/api', now() - interval '4 minutes'),
  ('agent:cursor-42', 'postgres.drop_table', 'Postgres Tools', 'block', 'Blocked by policy: No destructive DB calls', now() - interval '11 minutes'),
  ('dev@acme.io', 'linear.search', 'Linear MCP', 'allow', 'query="auth bug"', now() - interval '26 minutes'),
  ('agent:claude-7', 'slack.post_message', 'Slack Connector', 'flag', 'Message contained external link', now() - interval '48 minutes'),
  ('sam@acme.io', 'github.read_file', 'GitHub MCP', 'allow', 'src/auth/login.ts', now() - interval '1 hour'),
  ('agent:cursor-42', 'fs.write_file', 'Filesystem RW', 'block', 'Server is blocked', now() - interval '2 hours');