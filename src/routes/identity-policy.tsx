import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, Steps, CardGrid, CtaBand } from "@/components/marketing";

const T = "Agent IAM & Policy — Agentwall";
const D = "Tie every agent request to an actor, a credential source, a policy decision and an audit record — across autonomous and delegated access models.";

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
  ["Agents inherit human identity", "Sign in through Okta, Entra or Google and every agent session maps to an employee. No orphaned credentials, no anonymous agents."],
  ["Credentials are brokered, never shared", "The gateway issues short-lived, scoped credentials per request. Revoking a person revokes their agents instantly."],
  ["Policies resolve per request", "Team, role, environment and data class decide what each call may do — evaluated at runtime, not frozen into a config file."],
];

const capabilities: [string, string][] = [
  ["SSO & SCIM", "Provisioning and deprovisioning follow your identity provider. Offboarded employees lose agent access in the same refresh cycle as everything else."],
  ["Delegated access models", "Act-on-behalf-of with full attribution: the agent acts, the human owns the decision, the audit log shows both."],
  ["Autonomous access, scoped tight", "Agents that run unattended get least-privilege credentials with hard expiry and spend limits."],
  ["Readable policies", "Rules are written per tool pattern and effect — allow, block, flag — so the teams they constrain can actually read them."],
  ["Break-glass approvals", "Destructive or out-of-policy calls route to a named approver. The approval, the reviewer and the outcome are all in the audit trail."],
  ["Policy versioning", "Every policy change is versioned and diffable. Roll back in one click when a rule turns out to be too broad."],
];

function IdentityPolicyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Agentwall Identity & Policy"
        title={<>Every request has an owner, a rule and a record.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/mcp-gateway" className="rounded-full border bg-background px-6 py-3 font-semibold">How the gateway enforces it</Link>
      </PageHero>

      <Section eyebrow="How it works" title="Identity in, decision out, evidence everywhere.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Capabilities" title="Access control your security team can stand behind." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
