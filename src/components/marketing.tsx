import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

type Pair = readonly [string, string];

export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead: string; children?: ReactNode }) {
  return (
    <section className="grid-bg border-b">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{lead}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function Section({ eyebrow, title, lead, children, alternate }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode; alternate?: boolean }) {
  return (
    <section className={alternate ? "border-t bg-muted" : "border-t"}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
        {lead && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function CardGrid({ items, columns = 3 }: { items: readonly Pair[]; columns?: 2 | 3 }) {
  return (
    <div className={`mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      {items.map(([t, d], i) => (
        <div key={t} className="bg-card p-8">
          <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 text-lg font-bold">{t}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{d}</p>
        </div>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: readonly Pair[] }) {
  return (
    <div className="mt-12 space-y-px overflow-hidden rounded-2xl border bg-border">
      {items.map(([t, d], i) => (
        <div key={t} className="flex items-start gap-6 bg-card p-8">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">{i + 1}</span>
          <div>
            <h3 className="text-lg font-bold">{t}</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LogPanel({ rows }: { rows: readonly (readonly [string, string, string])[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xl">
      <div className="mb-2 flex justify-between font-mono text-xs text-muted-foreground"><span>example · gateway</span><span>{rows.length} events</span></div>
      {rows.map(([s, tool, who], i) => (
        <div key={`${tool}-${i}`} className="flex items-center justify-between border-t py-3 font-mono text-sm">
          <span className={`w-14 rounded px-2 py-0.5 text-center text-xs ${s === "block" ? "bg-destructive text-destructive-foreground" : s === "flag" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</span>
          <span className="flex-1 px-4 overflow-hidden text-ellipsis">{tool}</span>
          <span className="text-muted-foreground">{who}</span>
        </div>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="border-t bg-muted">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">See New Perimeter in action</h2>
        <p className="mt-3 text-muted-foreground">Bring your agent use case. See where access is enforced and how every gateway decision can be reviewed.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/book-a-demo" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Book a demo</Link>
        </div>
      </div>
    </section>
  );
}

export function EmailForm({ centered = false }: { centered?: boolean }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return <p className={centered ? "mt-8 font-semibold text-primary" : "font-semibold text-primary"}>Thanks — we'll be in touch shortly.</p>;
  }
  return (
    <form
      className={centered ? "mt-8 flex gap-2" : "mt-8 flex flex-col gap-2 sm:flex-row"}
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
    >
      <input required type="email" placeholder="work@company.com" className="flex-1 rounded-full border bg-background px-5 py-3 text-sm outline-none focus:border-primary" />
      <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Request demo</button>
    </form>
  );
}
