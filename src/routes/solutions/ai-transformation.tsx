import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "AI Transformation — New Perimeter";
const D = "Give every employee a golden path to useful agents, with platform and security controls built in from day one.";

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
  ["Stand up the golden path", "One approved catalog, one gateway, one set of readable policies. Employees get a self-serve way in — security gets a single place to look."],
  ["Onboard teams in days, not quarters", "New teams inherit the approved tools and policy bundles instead of starting from scratch. Adoption spreads on its own because the path is the easiest one."],
  ["Measure and expand", "Adoption and spend dashboards show where agents create value. Double down on the workflows that work; retire the rest."],
];

const wins: [string, string][] = [
  ["Employees", "Pick approved agents from a catalog and ship real work in their first week — no configs, no waiting on security review."],
  ["Platform teams", "Publish internal skills once and distribute them everywhere, with usage data to guide the roadmap."],
  ["Security", "Say yes faster: policies and audit are part of the path, so every approval comes with controls attached."],
  ["Leadership", "Adoption, savings and risk posture in one report — and a story auditors can follow end to end."],
];

function AiTransformationPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · AI Transformation"
        title={<>Make governed AI the easiest AI.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>

      <Section eyebrow="The playbook" title="Three moves, in order.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Who wins" title="One rollout, four happy audiences." alternate>
        <CardGrid items={wins} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
