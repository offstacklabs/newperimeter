import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Identity & Policy — New Perimeter";
const D = "Control workspace access with admin and viewer roles, API keys and rules for individual tools.";

export const Route = createFileRoute("/identity-policy")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/identity-policy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/identity-policy" }],
  }),
  component: IdentityPolicyPage,
});

const steps: [string, string][] = [
  ["Invite your team", "Invite people as admins or viewers. Each workspace has its own members."],
  ["Create agent keys", "Issue a workspace key for each agent or integration. Revoke it when access is no longer needed."],
  ["Set tool rules", "Choose which tools to allow, flag or block, plus a default for unmatched calls."],
];

const capabilities: [string, string][] = [
  ["Admin or viewer", "Admins manage workspace settings, servers, keys and policies. Viewers can review workspace data."],
  ["Block takes priority", "When rules overlap, block wins over flag, and flag wins over allow."],
  ["Recorded decisions", "The audit log identifies the key, tool and policy decision for each call."],
];

function IdentityPolicyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Identity & Policy"
        title={<> Perimeter Identity & Policy </>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/mcp-gateway" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore the Gateway</Link>
      </PageHero>

      <Section eyebrow="How it works" title="Set access in three steps.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="How decisions work" alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
