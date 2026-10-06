import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, LogPanel, CtaBand } from "@/components/marketing";

const T = "Perimeter Gateway — New Perimeter";
const D = "Put a controlled entry point between your agents and MCP tools. Approve connections, stop unwanted calls before they reach a server and keep a record of each gateway decision.";

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
  ["Connect a server", "Add its MCP address and approve it in your workspace."],
  ["Give your agent a key", "Create a workspace API key and connect to the server’s gateway address."],
  ["Check every call", "Allowed and flagged calls are forwarded. Blocked calls stop at the gateway."],
];

const capabilities: [string, string][] = [
  ["Workspace API keys", "Give each agent or integration its own workspace key so you can revoke access independently. Raw keys are shown once; only their hashes are stored."],
  ["Tool rules", "Keep the tools your agents need available while blocking actions they should never take. Match rules to a tool name or a server-and-tool pattern."],
  ["Default action", "Decide how unfamiliar tool calls are handled, rather than leaving access to chance. New workspaces block calls with no matching rule."],
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
        title={<> Perimeter Gateway </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/catalog" className="rounded-full border bg-background px-6 py-3 font-semibold">See the Catalog</Link>
      </PageHero>

      <Section eyebrow="How it works" title="From connection to control in three steps.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Example decisions" title="Allow, flag or block." alternate>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <LogPanel rows={logs} />
          <p className="text-lg text-muted-foreground">Flagging lets a call run and records it for review. If any call in a batch is blocked, the whole batch is rejected.</p>
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="Let useful work through. Keep unwanted actions out.">
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
