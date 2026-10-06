import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CtaBand } from "@/components/marketing";
import { blogPosts } from "@/lib/content";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Blog — New Perimeter" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const title = `${post.title} — New Perimeter Blog`;
    return {
      meta: [
        { title },
        { name: "description", content: post.description },
        { property: "og:title", content: title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${post.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="grid-bg border-b">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">← All posts</Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">{post.date}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.description}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16">
        {post.body.map((section) => (
          <div key={section.h} className="mt-10 first:mt-0">
            <h2 className="text-2xl font-extrabold tracking-tight">{section.h}</h2>
            {section.p.map((p, i) => (
              <p key={i} className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </div>
        ))}
      </article>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
