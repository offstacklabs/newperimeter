import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "AI Platform Teams — New Perimeter";
const D = "Manage shared MCP servers, tool policies and agent keys without maintaining a separate setup for every team.";

export const Route = createFileRoute("/solutions/ai-platform")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/solutions/ai-platform" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions/ai-platform" }],
  }),
  component: AiPlatformPage,
});

const capabilities: [string, string][] = [
  ["Shared server list", "Manage approved connections in each workspace."],
  ["Central tool rules", "Update gateway policies without editing every agent’s configuration."],
  ["Separate team access", "Use workspaces to keep members, servers and policies separate."],
  ["Call history", "Search activity and export results when investigating a problem."],
];

function AiPlatformPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · AI Platform Teams"
        title={<> For AI platform teams </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/catalog" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore the Catalog</Link>
      </PageHero>

      <Section eyebrow="Capabilities" title="One place to manage connections.">
        <CardGrid items={capabilities} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
