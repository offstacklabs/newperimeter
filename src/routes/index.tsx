import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LogPanel } from "@/components/marketing";

const T = "New Perimeter — Secure MCP for the enterprise";
const D = "Give your AI agents room to work—not unrestricted access. New Perimeter connects them to approved MCP tools, enforces your rules and makes every gateway decision visible.";

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
  { to: "/catalog", t: "Perimeter Catalog", d: "Manage which MCP servers your workspace can connect to." },
  { to: "/identity-policy", t: "Perimeter Identity & Policy", d: "Use workspace keys and tool rules to control access." },
  { to: "/guard", t: "Perimeter Runtime", d: "In development: inspect tool content for hidden instructions and sensitive data." },
  { to: "/visibility", t: "Perimeter Audit", d: "Search gateway activity, review decisions and export CSV." },
  { to: "/mcp-gateway", t: "Perimeter Gateway", d: "Check each request before forwarding it to an approved server." },
  { to: "/watch", t: "Perimeter Discover", d: "In development: find AI tools outside your approved setup." },
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
            <p className="font-mono text-xs uppercase tracking-widest text-primary">MCP security</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              New Perimeter
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{D}</p>
            <div className="mt-8 flex gap-3">
              <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
              <a href="#features" className="rounded-full border bg-background px-6 py-3 font-semibold">Explore capabilities</a>
            </div>
          </div>
          <LogPanel rows={logs} />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl text-4xl font-extrabold tracking-tight">One perimeter for your agents, tools and teams.</h2>
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
          <h2 className="text-4xl font-extrabold tracking-tight">See New Perimeter in action</h2>
          <p className="mt-3 text-muted-foreground">See how to connect your agents, stop unwanted tool calls and review the decisions that matter.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
            <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
