import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CtaBand } from "@/components/marketing";
import { caseStudies } from "@/lib/content";

export const Route = createFileRoute("/customers/$slug")({
  loader: ({ params }) => {
    const cs = caseStudies.find((c) => c.slug === params.slug);
    if (!cs) throw notFound();
    return { cs };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Customer story — Agentwall" }, { name: "robots", content: "noindex" }] };
    }
    const { cs } = loaderData;
    const title = `${cs.company} — Agentwall Customer Story`;
    const description = cs.headline;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/customers/${cs.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/customers/${cs.slug}` }],
    };
  },
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const { cs } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="grid-bg border-b">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <Link to="/customers" className="text-sm font-semibold text-primary hover:underline">← All customer stories</Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-primary">{cs.industry}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{cs.headline}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {cs.results.map(([n, d]) => (
            <div key={n} className="bg-card p-6 text-center">
              <p className="text-3xl font-extrabold tracking-tight text-primary">{n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-12 rounded-2xl border-l-4 border-primary bg-muted p-8">
          <p className="text-xl font-semibold leading-snug">"{cs.quote}"</p>
          <p className="mt-4 text-sm text-muted-foreground">— {cs.quoteBy}</p>
        </blockquote>

        {cs.body.map((section) => (
          <div key={section.h} className="mt-12">
            <h2 className="text-2xl font-extrabold tracking-tight">{section.h}</h2>
            {section.p.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </div>
        ))}
      </section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
