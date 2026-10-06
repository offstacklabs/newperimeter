import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Audit — New Perimeter";
const D = "Know what happened—and why. Trace gateway calls to their tool, server and key, investigate blocked or flagged activity and export the records your team needs.";

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
  ["Search activity", "Follow a question to the relevant calls. Search by tool, server, key or decision detail without sifting through unrelated activity."],
  ["Filter decisions", "Focus on blocked or flagged calls, or review what was allowed. Narrow the results to a server for a closer investigation."],
  ["Export CSV", "Take the evidence with you. Export the filtered results as CSV for investigation, review or reporting."],
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


      <Section eyebrow="Capabilities" title="From gateway activity to actionable answers." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
