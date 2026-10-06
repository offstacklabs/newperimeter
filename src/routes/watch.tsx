import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Discover — New Perimeter";
const D = "Bring unapproved AI tools into view. Perimeter Discover is being developed to identify AI clients and MCP servers on managed devices, so teams can review what belongs in their approved setup. Discovery integrations are not available yet.";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/watch" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/watch" }],
  }),
  component: WatchPage,
});

const steps: [string, string][] = [
  ["Find tools", "Use device inventory to identify AI clients and MCP servers."],
  ["Review findings", "Compare installed tools with the approved server list."],
  ["Decide what stays", "Approve useful connections and identify those that need removal."],
];

const capabilities: [string, string][] = [
  ["Device inventory", "Planned integrations with existing device management tools."],
  ["Unapproved connections", "Highlight servers and clients outside the approved setup."],
  ["Ongoing review", "Surface new installations and changes for review."],
];

function WatchPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Discover"
        title={<> Perimeter Discover </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/mcp-gateway" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore the Gateway</Link>
      </PageHero>

      <Section eyebrow="How it works" title="Find the gaps in your approved setup.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="Discovery scope" alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
