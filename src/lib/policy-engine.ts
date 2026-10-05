// Pure policy evaluation used by the MCP gateway. Safe for client and server.
export type Effect = "allow" | "flag" | "block";

export type PolicyRule = { name: string; tool_pattern: string; effect: string; enabled: boolean };

export function serverSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function globToRegex(pattern: string) {
  const escaped = pattern.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

/** A pattern matches the bare tool name ("write_file") or "<server-slug>.<tool>" ("filesystem.write_file"). */
export function matches(pattern: string, tool: string, server: string) {
  const re = globToRegex(pattern);
  return re.test(tool) || re.test(`${serverSlug(server)}.${tool}`);
}

/** Precedence: block beats flag beats allow. No match falls back to the workspace default. */
export function evaluate(
  rules: PolicyRule[],
  tool: string,
  server: string,
  defaultAction: Effect,
): { effect: Effect; policy: string | null } {
  const hits = rules.filter((r) => r.enabled && matches(r.tool_pattern, tool, server));
  for (const effect of ["block", "flag", "allow"] as const) {
    const hit = hits.find((r) => r.effect === effect);
    if (hit) return { effect, policy: hit.name };
  }
  return { effect: defaultAction, policy: null };
}

export async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
