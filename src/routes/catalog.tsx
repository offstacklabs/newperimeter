import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Catalog — New Perimeter";
const D = "Keep approved MCP servers in one workspace. Add connections and control which servers agents can reach.";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/catalog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
  }),
  component: CatalogPage,
});

const steps: [string, string][] = [
  ["Add a server", "Save its name and MCP address."],
  ["Approve the connection", "The gateway rejects requests to unapproved servers."],
  ["Connect through the gateway", "Copy the server’s gateway address and use a workspace API key."],
];

const capabilities: [string, string][] = [
  ["Separate workspaces", "Each team manages its own server list."],
  ["Tool policies", "Set rules for tools on a specific server or across the workspace."],
  ["Activity history", "Review server calls and their outcomes in the audit log."],
];

function CatalogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Catalog"
        title={<> Perimeter Catalog </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/visibility" className="rounded-full border bg-background px-6 py-3 font-semibold">View audit logs</Link>
      </PageHero>

      <Section eyebrow="How it works" title="Manage your server list.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="Server controls" alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
