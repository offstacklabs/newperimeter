import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "About — New Perimeter";
const D = "AI agents are changing how work gets done. New Perimeter gives teams the access controls and visibility to put them to work with clear boundaries.";

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
  ["Clear rules", "Security teams should be able to explain an access decision—not reverse-engineer it. Rules must make clear what is allowed and what is blocked."],
  ["Checks before action", "A record of a risky action is not enough. Enforce tool access at the gateway, before the request reaches the server."],
  ["Useful records", "Turn gateway activity into answers: which tool was called, which key was used and why the request was allowed or stopped."],
  ["Open connections", "Build on MCP, keep connections under your control and make activity exportable for the teams that need it."],
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

      <Section eyebrow="Why we exist" title="More capable agents. More deliberate access.">
        <div className="mt-6 max-w-2xl space-y-4 text-lg text-muted-foreground">
          <p>AI agents don’t just answer questions. They read company data, call tools and take action. Their access deserves the same attention as the people and systems you already trust.</p>
          <p>We’re building New Perimeter around that boundary: a gateway that checks requests before tools run, access rules your team can understand and audit records you can investigate. Start with the connections you need, then expand on your terms.</p>
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
