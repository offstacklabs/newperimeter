import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, CtaBand } from "@/components/marketing";
import { caseStudies } from "@/lib/content";

const T = "Customers — Agentwall";
const D = "How platform, security and IT teams use Agentwall to roll out governed AI agents across the enterprise.";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/customers" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/customers" }],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Customers"
        title={<>Enterprises that said yes to agents — safely.</>}
        lead="Platform, security and IT teams use Agentwall as their AI command-and-control plane. Here's what that looks like in practice."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((cs) => (
            <Link key={cs.slug} to="/customers/$slug" params={{ slug: cs.slug }} className="group rounded-2xl border bg-card p-8 transition-shadow hover:shadow-xl">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">{cs.industry}</p>
              <h2 className="mt-3 text-xl font-extrabold tracking-tight">{cs.company}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{cs.headline}</p>
              <p className="mt-4 text-sm font-semibold text-primary group-hover:underline">Read the story →</p>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
