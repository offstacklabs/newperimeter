import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, LogPanel, CtaBand } from "@/components/marketing";

const T = "Runtime Security — New Perimeter";
const D = "Catch risky behavior before it runs: inspect tool definitions, inputs, outputs and agent behavior inline — before risky actions reach company systems.";

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
  ["Tool poisoning", "Malicious instructions hidden in tool descriptions and metadata, caught by scanning definitions at connect time and call time."],
  ["Prompt injection", "Untrusted content trying to redirect the agent — flagged in tool outputs, web pages and file contents before the model acts on them."],
  ["Data exfiltration", "Secrets, PII and source code leaving toward unknown destinations, detected inline and blocked before the request leaves."],
  ["Privilege escalation", "Tool chains that combine into capabilities no single tool should have — scoped credentials make the escalation fail."],
  ["Destructive actions", "Drops, deletes and overwrites gated behind explicit approval, with the requester and approver on record."],
  ["Task drift & manipulation", "Session-level monitoring catches agents veering off-task or being steered mid-run, and pauses them for review."],
];

const logs: [string, string, string][] = [
  ["block", "exfil: ssh keys → unknown.tld", "agent:cursor-42"],
  ["flag", "pii in output: 3 records redacted", "agent:claude-7"],
  ["allow", "github.create_pr", "maria@acme.io"],
  ["block", "tool poison: connect-time scan", "server:community-mcp"],
];

function GuardPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="New Perimeter Runtime Security"
        title={<>Catch risky behavior before it runs.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/watch" className="rounded-full border bg-background px-6 py-3 font-semibold">Also: find shadow AI</Link>
      </PageHero>

      <Section eyebrow="Detection" title="What the scanner looks for.">
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Scans run inline at 50–100ms per call. Anything flagged is logged with full context; anything blocked never
          reaches your systems. Static review of a server happens once — runtime scanning happens on every single call.
        </p>
        <CardGrid items={detections} />
      </Section>

      <Section eyebrow="Live telemetry" title="See the decisions as they happen." alternate>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <LogPanel rows={logs} />
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Every scan result is an event: what was inspected, which detector fired, what the decision was, and what
              the agent did next. Feed it to your SIEM or review it in the console.
            </p>
            <p className="text-lg text-muted-foreground">
              Tuning is a policy change, not a code change — sensitivity per detector, per team, per data class.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
