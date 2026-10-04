import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Shadow AI — Agentwall";
const D = "Discover and control unmanaged AI across managed devices through your existing MDM — then approve, migrate or block unmanaged clients, servers, skills and plugins.";

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
  ["Discover without agents or opt-ins", "Agentwall reads inventory your MDM already collects. Within days you see every AI client, MCP server and plugin running on managed devices."],
  ["Classify what you find", "Each finding is labeled managed, shadow, outdated or risky — with the user, device and data it touches."],
  ["Approve, migrate or block", "Push findings into a single review queue. Good tools move into the catalog, redundant ones migrate to the golden path, dangerous ones are blocked."],
];

const capabilities: [string, string][] = [
  ["MDM-native deployment", "Works with the device management you already run. No new endpoint agent, no employee action required."],
  ["Client & server inventory", "Every AI client, MCP server, skill and plugin in use — even the ones installed outside IT's blessing."],
  ["Risk scoring", "Findings ranked by data sensitivity, tool permissions and known-bad patterns, so the queue starts with what matters."],
  ["Guided migration", "One-click paths from a shadow setup to its approved catalog equivalent, config included."],
  ["Continuous monitoring", "Discovery isn't a point-in-time audit. New installs and new versions surface automatically."],
  ["Policy follow-through", "Blocked doesn't mean invisible: blocked tools keep generating findings until they're removed, so cleanup actually completes."],
];

function WatchPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Agentwall Shadow AI"
        title={<>Find the AI your security team doesn't know about.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/guard" className="rounded-full border bg-background px-6 py-3 font-semibold">Then secure what you found</Link>
      </PageHero>

      <Section eyebrow="How it works" title="From unknown unknowns to a clean inventory.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="Shadow AI is a rollout problem. Treat it like one." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
