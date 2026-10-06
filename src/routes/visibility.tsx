import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/marketing";

const T = "Perimeter Audit — New Perimeter";
const D = "See usage, spend, adoption and audit history across the users, clients, tools, agents and workflows behind AI work.";

export const Route = createFileRoute("/visibility")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/visibility" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/visibility" }],
  }),
  component: VisibilityPage,
});

const capabilities: [string, string][] = [
  ["Adoption by team", "Who is using agents, how often, and for what — so rollout decisions follow data instead of anecdotes."],
  ["Spend per tool", "Costs attributed to the servers, clients and workflows that generate them. Kill zombie tools, fund the ones that work."],
  ["Complete audit history", "Every request with actor, tool, arguments and outcome — retained, searchable and exportable to your SIEM."],
  ["Risk review queue", "Flagged events from Runtime Security land in one queue with full context, so reviewers decide in minutes."],
  ["Per-client breakdown", "Claude, Cursor, ChatGPT, Codex and internal agents, compared side by side on usage and value."],
  ["Board-ready reporting", "One-page summaries of adoption, savings and risk posture — the numbers leadership actually asks for."],
];

const stats: [string, string][] = [
  ["2.4M", "tool calls governed per month"],
  ["1 day/week", "of platform time reclaimed from config churn"],
  ["Minutes", "to answer 'who did what' — not days of log archaeology"],
];

function VisibilityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Perimeter Audit"
        title={<>Know what your agents actually do — and what it's worth.</>}
        lead={D}
      >
        <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        <Link to="/blog" className="rounded-full border bg-background px-6 py-3 font-semibold">Read the blog</Link>
      </PageHero>

      <Section eyebrow="Proof, not promises" title="The numbers platform teams report on.">
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {stats.map(([n, d]) => (
            <div key={n} className="bg-card p-8">
              <p className="text-4xl font-extrabold tracking-tight text-primary">{n}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="From raw events to decisions." alternate>
        <CardGrid items={capabilities} />
      </Section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
