import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "IT & Security — New Perimeter";
const D = "Put agent access under security’s control. Approve MCP servers, block unwanted tool calls before they run and trace gateway decisions when your team needs answers.";

export const Route = createFileRoute("/solutions/it-security")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/solutions/it-security" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions/it-security" }],
  }),
  component: ItSecurityPage,
});

const capabilities: [string, string][] = [
  ["Approved servers only", "The gateway rejects connections to unapproved servers."],
  ["Block specific tools", "Stop unwanted calls before they reach the server."],
  ["Workspace boundaries", "Keep each team’s members, servers and policies separate."],
  ["Reviewable records", "Search decisions and export filtered activity as CSV."],
];

function ItSecurityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · IT & Security"
        title={<> For IT and security teams </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/guard" className="rounded-full border bg-background px-6 py-3 font-semibold">See Perimeter Runtime</Link>
      </PageHero>

      <Section eyebrow="Capabilities" title="Enforce the boundary. Keep the evidence.">
        <CardGrid items={capabilities} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
