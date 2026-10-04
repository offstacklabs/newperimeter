import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "AI Platform Teams — Agentwall";
const D = "Publish approved tools and agents as reusable infrastructure across teams — with ownership, dependencies and usage signals built in.";

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
  ["Ship internal skills once", "Package internal tools as governed catalog entries. Every team consumes the same reviewed version instead of wiring their own."],
  ["Own what you publish", "Named owners, dependency declarations and version pinning — infrastructure practices, applied to agent tooling."],
  ["Kill config drift", "Clients point at the gateway and pull from the catalog. There is nothing per-machine to drift."],
  ["Measure everything", "Adoption per skill, spend per tool, call volume per workflow. Your roadmap writes itself from the usage data."],
  ["Reuse across clients", "A skill published once works for Claude, Cursor, ChatGPT and internal agents alike — one artifact, every client."],
  ["Golden-path onboarding", "New engineers pick from the catalog on day one. Ramp time on internal tooling drops to minutes."],
];

function AiPlatformPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · AI Platform Teams"
        title={<>Stop wiring MCP by hand. Start shipping platform.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/catalog" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore the Catalog</Link>
      </PageHero>

      <Section eyebrow="Capabilities" title="Platform engineering for the agent layer.">
        <CardGrid items={capabilities} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
