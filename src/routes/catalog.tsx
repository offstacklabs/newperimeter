import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Catalog — New Perimeter";
const D = "A governed registry of approved MCP servers, skills and plugins — with ownership, dependencies, access and usage signals on every entry.";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/catalog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
  }),
  component: CatalogPage,
});

const steps: [string, string][] = [
  ["Publish with an owner", "Every server, skill and plugin enters the catalog with a named owner, a version and a dependency declaration. Unowned entries can't be approved."],
  ["Review once, distribute everywhere", "Security reviews the entry — tool scopes, data access, permissions — and approves it for the whole company. One review instead of one per team."],
  ["Employees pick, nobody configures", "Users select approved entries from the catalog instead of hand-editing client configs. What's approved is what's connectable."],
];

const capabilities: [string, string][] = [
  ["Ownership & accountability", "Every entry names a person. When a version misbehaves, you know who fixes it and who to page."],
  ["Dependency awareness", "Entries declare what they depend on, so an upstream change is a tracked event, not a surprise."],
  ["Version pinning", "Teams run reviewed versions. Upgrades are a published, reviewable event — not a silent remote change."],
  ["Usage signals", "Adoption, call volume and spend per entry. Retire what nobody uses; invest where everyone does."],
  ["Private & public sources", "Publish internal skills alongside vetted public MCP servers, all behind the same review flow."],
  ["Instant revocation", "Removing an entry removes it from every client at once. Offboarding a tool takes one click, not a config sweep."],
];

function CatalogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Catalog"
        title={<>An app store for everything your agents may touch.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/visibility" className="rounded-full border bg-background px-6 py-3 font-semibold">See usage signals</Link>
      </PageHero>

      <Section eyebrow="How it works" title="From unreviewed connections to a governed registry.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="The registry is the control plane's memory." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
