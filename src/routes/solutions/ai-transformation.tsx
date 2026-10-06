import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "AI Transformation — New Perimeter";
const D = "Start with a small set of approved tools, clear access rules and a record of how agents use them.";

export const Route = createFileRoute("/solutions/ai-transformation")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/solutions/ai-transformation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions/ai-transformation" }],
  }),
  component: AiTransformationPage,
});

const steps: [string, string][] = [
  ["Choose a pilot", "Pick a team and the MCP servers it needs."],
  ["Set access rules", "Approve servers, issue keys and define which tools can run."],
  ["Review before expanding", "Check the audit log, adjust policies and add teams as needed."],
];

const wins: [string, string][] = [
  ["Employees", "Use approved tools with clear access boundaries."],
  ["Platform teams", "Manage shared connections and workspace keys."],
  ["Security teams", "Review blocked and flagged calls."],
  ["Leadership", "Start with a scoped pilot rather than a company-wide commitment."],
];

function AiTransformationPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · AI Transformation"
        title={<> Roll out AI with clear boundaries </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>

      <Section eyebrow="The playbook" title="Start small, review, expand.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="For your teams" title="What each team gets" alternate>
        <CardGrid items={wins} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
