## New Perimeter

The security and control layer between AI and your systems.

New Perimeter sits between AI applications and the tools, APIs, data, and infrastructure they can access.

It answers five fundamental questions:

- Who is acting?

- What are they trying to access?

- Are they allowed to do it?

- Is the action safe?

- What happened?

The platform provides a unified layer for AI identity, access, policy, runtime protection, and audit.

### Local database setup

The application uses PostgreSQL through `DATABASE_URL`. Authentication uses Better Auth and stores users and sessions in the same database.

For a Vercel-hosted database, connect Neon to the Vercel project from the Vercel Marketplace. The integration provides `DATABASE_URL` to the project. To use the same values locally, link the project with the Vercel CLI and run `vercel env pull .env.local`.

1. Copy `.env.example` to `.env` (or pull Vercel development variables into `.env.local`) and set `DATABASE_URL`, `BETTER_AUTH_URL`, and a random `BETTER_AUTH_SECRET` of at least 32 characters. Use the deployed app's URL for `BETTER_AUTH_URL` in Vercel.
2. Configure `RESEND_API_KEY` and `EMAIL_FROM` so signup verification and workspace invitation emails can be sent. Set `EMAIL_FROM` to `New Perimeter <notify@newperimeter.dev>` and verify `newperimeter.dev` in Resend.
3. Apply [`drizzle/standalone.sql`](drizzle/standalone.sql) to the Neon database before starting the app. You can run it from Neon’s SQL Editor.

The old Supabase migrations under `drizzle/migrations` are retained for existing deployments. They depend on Supabase's `auth` schema and are not the setup path for a standalone PostgreSQL database.
