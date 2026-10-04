import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "About — Agentwall";
const D = "Agentwall is the control plane for enterprise AI agents — built by security and platform operators who lived the problem.";

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
  ["Governance should enable, not gate", "Every control we ship comes with a golden path that makes the governed way the convenient way. Blocking without enabling just pushes AI underground."],
  ["Security is a product surface", "Policies that only engineers can read, logs only auditors open, dashboards nobody checks — that's security theater. We design controls people actually use."],
  ["Fail closed, ship fast", "Availability never outranks safety: unresolvable requests don't execute. Within that boundary, we obsess over the 50–100ms that keeps enforcement invisible."],
  ["Open where it matters", "MCP is an open standard and we build on it as-is — no proprietary lock-in on the wire, exportable logs, self-hosting in your VPC."],
];

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="About Agentwall"
        title={<>The control plane for enterprise AI agents.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>

      <Section eyebrow="Why we exist" title="Agents arrived before governance did.">
        <div className="mt-6 max-w-2xl space-y-4 text-lg text-muted-foreground">
          <p>
            In 2025, MCP turned AI assistants into actors: agents that read your code, query your databases and post to
            your systems. Adoption outran oversight everywhere — every team wired its own servers, nobody could say
            which tools touched production data, and security teams were left answering yes or no with no evidence.
          </p>
          <p>
            Agentwall is the layer that was missing: a single control plane that sits between the AI clients employees
            already use and the systems agents act on. One catalog of what's approved, one policy engine deciding every
            call, one audit trail answering every question.
          </p>
          <p>
            The pattern is old — APIs got gateways, databases got access control, SaaS got SSO. We're building the same
            layer for agents, because it's how enterprises say yes.
          </p>
        </div>
      </Section>

      <Section eyebrow="Principles" title="What we optimize for." alternate>
        <CardGrid items={values} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
