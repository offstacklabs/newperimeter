import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LogPanel } from "@/components/marketing";

const T = "Agentwall — Secure MCP for the enterprise";
const D = "One control plane for every MCP server and AI agent: access policies, threat detection and full audit logs.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

// Feature cards double as navigation into the product pages.
const features: { to: string; t: string; d: string }[] = [
  { to: "/catalog", t: "Server registry", d: "Approve, version and catalog every MCP server your teams connect to Claude, Cursor or ChatGPT." },
  { to: "/identity-policy", t: "Granular policies", d: "Per-tool permissions by team, role and data class. Block destructive calls before they run." },
  { to: "/guard", t: "Threat detection", d: "Catch prompt injection, tool poisoning and data exfiltration in real time." },
  { to: "/visibility", t: "Full audit trail", d: "Every agent call logged with user, tool, arguments and outcome. Export to your SIEM." },
  { to: "/identity-policy", t: "SSO & SCIM", d: "Plug into Okta, Entra or Google. Access follows your identity provider." },
  { to: "/watch", t: "Shadow AI detection", d: "Find unmanaged clients and servers through your MDM — then approve, migrate or block." },
];

const logs: [string, string, string][] = [
  ["allow", "github.create_pr", "maria@acme.io"],
  ["block", "postgres.drop_table", "agent:cursor-42"],
  ["allow", "linear.search", "dev@acme.io"],
  ["flag", "slack.post_message", "agent:claude-7"],
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="grid-bg border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">MCP security platform</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Let your AI agents in.<br />Keep the risk out.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{D}</p>
            <div className="mt-8 flex gap-3">
              <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Get started</Link>
              <a href="#features" className="rounded-full border bg-background px-6 py-3 font-semibold">How it works</a>
            </div>
          </div>
          <LogPanel rows={logs} />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-4xl font-extrabold tracking-tight">Everything security teams need to say yes to MCP.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {features.map((f, i) => (
            <Link key={f.t} to={f.to} className="group bg-card p-8 transition-colors hover:bg-muted">
              <span className="font-mono text-xs text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">See Agentwall in action</h2>
          <p className="mt-3 text-muted-foreground">30-minute walkthrough with our team, tailored to your stack.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
            <Link to="/customers" className="rounded-full border bg-background px-6 py-3 font-semibold">Read customer stories</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
