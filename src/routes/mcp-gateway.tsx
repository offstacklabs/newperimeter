import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, LogPanel, CtaBand } from "@/components/marketing";

const T = "Perimeter Gateway — New Perimeter";
const D = "Make approved MCP access the default across Claude, Cursor, ChatGPT and Codex — with policy, identity, runtime security and an audit trail on every request.";

export const Route = createFileRoute("/mcp-gateway")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/mcp-gateway" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mcp-gateway" }],
  }),
  component: McpGatewayPage,
});

const steps: [string, string][] = [
  ["Point every client at one endpoint", "Claude, Cursor, ChatGPT, Codex and internal agents connect to a single governed gateway. Employees keep the clients they already use — the config change is one line."],
  ["Every request is identified and policy-checked", "The gateway maps each call to an employee through SSO, resolves the tool against the approved catalog, and applies the policies for that team and data class before anything executes."],
  ["Risky behavior never reaches your systems", "Tool definitions, inputs and outputs are scanned inline. Injection, exfiltration and destructive calls are blocked or flagged in 50–100ms — and logged either way."],
];

const capabilities: [string, string][] = [
  ["OAuth & credential brokering", "Agents authenticate through your identity provider. Credentials are issued, scoped and rotated by the gateway — never pasted into client configs."],
  ["Per-tool policies", "Allow, block or flag any tool call by team, role, environment and data class. Destructive actions require explicit approval."],
  ["Streaming audit trail", "Actor, tool, arguments, decision and outcome on every request — exportable to your SIEM in real time."],
  ["Zero client-side trust", "Enforcement happens at the gateway. A tampered or unmanaged client still can't reach an unapproved server."],
  ["Works with 300+ clients", "One endpoint for every MCP-compatible client, from Claude Code to internal agents built on the SDK."],
  ["Fail-closed by design", "If the gateway can't evaluate a request, the request doesn't run. Availability degrades to safety, never the reverse."],
];

const logs: [string, string, string][] = [
  ["allow", "github.create_pr", "maria@acme.io"],
  ["block", "postgres.drop_table", "agent:cursor-42"],
  ["flag", "webhook.post → unknown.tld", "agent:claude-7"],
  ["allow", "linear.search", "dev@acme.io"],
];

function McpGatewayPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Gateway"
        title={<>One governed entry point for every AI client.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/catalog" className="rounded-full border bg-background px-6 py-3 font-semibold">See the Catalog</Link>
      </PageHero>

      <Section eyebrow="How it works" title="Approved access by default, enforced at the gateway.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Live enforcement" title="Every call, decided and logged in milliseconds." alternate>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <LogPanel rows={logs} />
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              The gateway evaluates every request against your policies before execution. Allowed calls pass through untouched.
              Flagged calls run with review. Blocked calls never reach the server.
            </p>
            <p className="text-lg text-muted-foreground">
              Because enforcement is centralized, a new policy takes effect for every client and every team the moment you save it — no config drift, no per-machine rollouts.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="Everything a gateway should do. Nothing it shouldn't.">
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
