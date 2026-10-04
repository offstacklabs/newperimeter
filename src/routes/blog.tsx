import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, CtaBand } from "@/components/marketing";
import { blogPosts } from "@/lib/content";

const T = "Blog — Agentwall";
const D = "Essays and engineering notes on MCP security, agent governance and enterprise AI adoption.";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Blog"
        title={<>Notes from the control plane.</>}
        lead="Essays and engineering notes on MCP security, agent governance and making enterprise AI adoption boring."
      />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="divide-y">
          {blogPosts.map((post) => (
            <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="group block py-8">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{post.date}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight group-hover:text-primary">{post.title}</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">{post.description}</p>
              <p className="mt-3 text-sm font-semibold text-primary group-hover:underline">Read post →</p>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
