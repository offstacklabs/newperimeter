import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "About — New Perimeter";
const D = "New Perimeter helps teams control MCP access and understand what their agents do.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values: [string, string][] = [
  ["Clear rules", "People should be able to understand what a policy allows and blocks."],
  ["Checks before action", "Access decisions belong at the gateway, before a tool runs."],
  ["Useful records", "Logs should help answer a specific question, not just collect events."],
  ["Open connections", "Build on MCP and make activity exportable."],
];

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="About New Perimeter"
        title={<> About New Perimeter </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>

      <Section eyebrow="Why we exist" title="Why we’re building it">
        <div className="mt-6 max-w-2xl space-y-4 text-lg text-muted-foreground">
          <p>AI agents can read data and act on company systems. Teams need a way to choose which tools they can use and review what happened.</p>
          <p>We’re starting with a gateway, workspace access rules and searchable audit logs.</p>
        </div>
      </Section>

      <Section eyebrow="Principles" title="Our principles" alternate>
        <CardGrid items={values} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
