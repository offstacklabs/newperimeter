import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Audit — New Perimeter";
const D = "Search gateway activity by tool, server or key. Filter decisions and export the results as CSV.";

export const Route = createFileRoute("/visibility")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/visibility" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/visibility" }],
  }),
  component: VisibilityPage,
});

const capabilities: [string, string][] = [
  ["Search activity", "Find calls by tool, server, key or decision detail."],
  ["Filter decisions", "Show allowed, flagged or blocked calls for a selected server."],
  ["Export CSV", "Download the filtered results for review or reporting."],
];


function VisibilityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Audit"
        title={<> Perimeter Audit </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>


      <Section eyebrow="Capabilities" title="Find the calls that matter." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
