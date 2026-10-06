import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Runtime — New Perimeter";
const D = "In development: content inspection for malicious instructions and sensitive data. Tool-policy enforcement is available today through Perimeter Gateway.";

export const Route = createFileRoute("/guard")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/guard" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/guard" }],
  }),
  component: GuardPage,
});

const detections: [string, string][] = [
  ["Hidden instructions", "Identify tool descriptions or responses that try to redirect an agent."],
  ["Sensitive data", "Check for secrets and personal data sent to unexpected destinations."],
  ["Risky actions", "Add content-aware checks alongside existing tool access rules."],
];


function GuardPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Runtime"
        title={<> Perimeter Runtime </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/watch" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore Discover</Link>
      </PageHero>

      <Section eyebrow="Detection" title="Planned inspection areas">
        <CardGrid items={detections} />
      </Section>


      <CtaBand />
      <SiteFooter />
    </div>
  );
}
