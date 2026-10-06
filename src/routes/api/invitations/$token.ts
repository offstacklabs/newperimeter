import { createFileRoute } from "@tanstack/react-router";
import { auth, authBaseUrl } from "@/lib/auth.server";
import { db } from "@/lib/db.server";

export const Route = createFileRoute("/api/invitations/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const result = await db.query(
            "select * from public.get_invitation($1)",
            [params.token],
          );
          return Response.json({ invite: result.rows[0] ?? null });
        } catch {
          return Response.json({ error: "Could not load invitation" }, { status: 500 });
        }
      },
      POST: async ({ request, params }) => {
        if (request.headers.get("origin") !== new URL(authBaseUrl).origin) {
          return Response.json({ error: "Invalid request origin" }, { status: 403 });
        }
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return Response.json({ error: "Sign in to accept this invitation" }, { status: 401 });
        try {
          const result = await db.query<{ workspace_id: string }>(
            "select public.accept_invitation($1, $2::uuid, $3) as workspace_id",
            [params.token, session.user.id, session.user.email],
          );
          return Response.json({ workspaceId: result.rows[0]?.workspace_id });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Could not accept invitation" },
            { status: 400 },
          );
        }
      },
    },
  },
});
