import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const T = "Gatehouse — Secure MCP for the enterprise";
const D = "One control plane for every MCP server and AI agent: access policies, threat detection and full audit logs.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  ["Server registry", "Approve, version and catalog every MCP server your teams connect to Claude, Cursor or ChatGPT."],
  ["Granular policies", "Per-tool permissions by team, role and data class. Block destructive calls before they run."],
  ["Threat detection", "Catch prompt injection, tool poisoning and data exfiltration in real time."],
  ["Full audit trail", "Every agent call logged with user, tool, arguments and outcome. Export to your SIEM."],
  ["SSO & SCIM", "Plug into Okta, Entra or Google. Access follows your identity provider."],
  ["Self-host or cloud", "Run in your VPC or ours. SOC 2 Type II, data never used for training."],
];

const logs = [
  ["allow", "github.create_pr", "maria@acme.io"],
  ["block", "postgres.drop_table", "agent:cursor-42"],
  ["allow", "linear.search", "dev@acme.io"],
  ["flag", "slack.post_message", "agent:claude-7"],
];

function Index() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">G</span>
          Gatehouse
        </div>
        <a href="#demo" className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Book a demo</a>
      </header>

      <section className="grid-bg border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">MCP security platform</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Let your AI agents in.<br />Keep the risk out.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{D}</p>
            <div className="mt-8 flex gap-3">
              <a href="#demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Get started</a>
              <a href="#features" className="rounded-full border bg-background px-6 py-3 font-semibold">How it works</a>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-xl">
            <div className="mb-4 flex justify-between font-mono text-xs text-muted-foreground"><span>live · gateway</span><span>4 events</span></div>
            {logs.map(([s, tool, who]) => (
              <div key={tool} className="flex items-center justify-between border-t py-3 font-mono text-sm">
                <span className={`w-14 rounded px-2 py-0.5 text-center text-xs ${s === "block" ? "bg-destructive text-destructive-foreground" : s === "flag" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</span>
                <span className="flex-1 px-4">{tool}</span>
                <span className="text-muted-foreground">{who}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-4xl font-extrabold tracking-tight">Everything security teams need to say yes to MCP.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {features.map(([t, d], i) => (
            <div key={t} className="bg-card p-8">
              <span className="font-mono text-xs text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="border-t bg-muted">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">See Gatehouse in action</h2>
          <p className="mt-3 text-muted-foreground">30-minute walkthrough with our team.</p>
          {sent ? (
            <p className="mt-8 font-semibold text-primary">Thanks — we'll be in touch shortly.</p>
          ) : (
            <form className="mt-8 flex gap-2" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input required type="email" placeholder="work@company.com" className="flex-1 rounded-full border bg-background px-5 py-3 outline-none focus:border-primary" />
              <button className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Request</button>
            </form>
          )}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">© 2026 Gatehouse</footer>
    </div>
  );
}
