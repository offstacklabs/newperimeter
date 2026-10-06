import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero, EmailForm } from "@/components/marketing";

const T = "Book a demo — New Perimeter";
const D = "Explore New Perimeter’s MCP gateway, workspace policies and audit log.";

export const Route = createFileRoute("/book-a-demo")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/book-a-demo" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/book-a-demo" }],
  }),
  component: BookADemoPage,
});

const agenda: [string, string][] = [
  ["Your setup", "The agents and MCP servers you want to connect."],
  ["Gateway walkthrough", "A tool policy in action and the resulting audit record."],
  ["Next steps", "What a small pilot could include."],
];

function BookADemoPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Book a demo"
        title={<> Book a New Perimeter demo </>}
        lead="A walkthrough of MCP connections, tool rules and gateway activity."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-xl font-extrabold tracking-tight">What to expect</h2>
          <div className="mt-6 space-y-6">
            {agenda.map(([t, d], i) => (
              <div key={t} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">{i + 1}</span>
                <div>
                  <h3 className="font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-xl font-extrabold tracking-tight">Request a time</h2>
          <EmailForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
