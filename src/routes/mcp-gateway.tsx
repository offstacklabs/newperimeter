import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, LogPanel, CtaBand } from "@/components/marketing";

const T = "Perimeter Gateway — New Perimeter";
const D = "Connect agents to approved MCP servers through one gateway. Each request is checked against workspace policies and logged.";

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
  ["Workspace API keys", "Create and revoke keys. Only a hash of each key is stored."],
  ["Tool rules", "Allow, flag or block tools by name or server-and-tool pattern."],
  ["Default action", "Choose what happens when no policy matches. New workspaces default to block."],
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

      <Section eyebrow="How it works" title="Connect, check, forward.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Example decisions" title="Allow, flag or block." alternate>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <LogPanel rows={logs} />
          <p className="text-lg text-muted-foreground">Flagging lets a call run and records it for review. If any call in a batch is blocked, the whole batch is rejected.</p>
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="Gateway controls">
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
