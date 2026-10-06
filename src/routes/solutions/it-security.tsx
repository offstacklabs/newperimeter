import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "IT & Security — New Perimeter";
const D = "Shadow AI detection, access control, runtime security and audit — the agent governance stack security teams can stand behind.";

export const Route = createFileRoute("/solutions/it-security")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/solutions/it-security" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions/it-security" }],
  }),
  component: ItSecurityPage,
});

const capabilities: [string, string][] = [
  ["Close the shadow gap", "Discover unmanaged AI clients and MCP servers through your MDM, then migrate or block them — no endpoint agent, no opt-in."],
  ["Enforce, don't advise", "Policies are evaluated at the gateway on every request. Approved access is the only access that works."],
  ["Inspect at runtime", "Tool definitions, inputs and outputs scanned inline for injection, exfiltration and destructive behavior — in 50–100ms."],
  ["Audit that survives scrutiny", "Actor, tool, arguments, decision, outcome — on every call, exportable to your SIEM and readable by auditors."],
  ["Fail closed", "Unresolvable requests don't execute. Downtime degrades to safety, never to open access."],
  ["SOC 2 & GDPR ready", "Self-host in your VPC or run in our cloud. Your data is never used for model training."],
];

function ItSecurityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Solutions · IT & Security"
        title={<>Govern agents without becoming the department of no.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/guard" className="rounded-full border bg-background px-6 py-3 font-semibold">See Runtime Security</Link>
      </PageHero>

      <Section eyebrow="Capabilities" title="Controls first, enablement close behind.">
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Security teams that only block push AI usage underground — where it's invisible and riskier. New Perimeter pairs
          hard controls with a golden path, so the secure route is also the convenient one.
        </p>
        <CardGrid items={capabilities} columns={2} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
