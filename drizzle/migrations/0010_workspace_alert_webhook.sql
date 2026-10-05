ALTER TABLE public.workspaces
  ADD COLUMN alert_webhook_url text CHECK (alert_webhook_url IS NULL OR alert_webhook_url ~ '^https://'),
  ADD COLUMN alert_on text NOT NULL DEFAULT 'block' CHECK (alert_on IN ('block','flag_block'));