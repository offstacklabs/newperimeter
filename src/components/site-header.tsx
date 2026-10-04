import { Link } from "@tanstack/react-router";

const product = [
  { to: "/mcp-gateway", name: "MCP Gateway", desc: "One governed entry point for every AI client" },
  { to: "/identity-policy", name: "Agent IAM & Policy", desc: "Identity, credentials and policy decisions" },
  { to: "/guard", name: "Runtime Security", desc: "Catch risky behavior before it runs" },
  { to: "/catalog", name: "Catalog", desc: "Registry of approved servers and skills" },
  { to: "/visibility", name: "Observability & ROI", desc: "Usage, spend and audit history" },
  { to: "/watch", name: "Shadow AI", desc: "Find and control unmanaged AI" },
] as const;

const solutions = [
  { to: "/solutions/ai-transformation", name: "AI Transformation", desc: "A golden path to governed agent adoption" },
  { to: "/solutions/ai-platform", name: "AI Platform Teams", desc: "Publish approved tools as reusable infrastructure" },
  { to: "/solutions/it-security", name: "IT & Security", desc: "Access control, runtime security and audit" },
] as const;

const company = [
  { to: "/about", name: "About" },
  { to: "/customers", name: "Customers" },
  { to: "/blog", name: "Blog" },
  { to: "/book-a-demo", name: "Book a demo" },
] as const;

function Dropdown({ label, items }: { label: string; items: readonly { to: string; name: string; desc?: string }[] }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 py-2 text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
        <span className="text-[10px] text-muted-foreground">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-80 rounded-2xl border bg-card p-2 opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-xl px-4 py-3 hover:bg-muted"
          >
            <span className="text-sm font-bold">{item.name}</span>
            {item.desc && <span className="mt-0.5 block text-xs text-muted-foreground">{item.desc}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">A</span>
          Agentwall
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Dropdown label="Product" items={product} />
          <Dropdown label="Solutions" items={solutions} />
          {company.slice(0, 3).map((item) => (
            <Link key={item.to} to={item.to} className="py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/admin" className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:block">Console</Link>
          <Link to="/book-a-demo" className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Book a demo</Link>
        </div>
      </div>

      <details className="border-t md:hidden">
        <summary className="cursor-pointer px-6 py-3 text-sm font-semibold text-muted-foreground">Menu</summary>
        <div className="space-y-1 px-6 pb-4">
          {[...product, ...solutions, ...company].map((item) => (
            <Link key={item.to} to={item.to} className="block rounded-lg px-2 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.name}
            </Link>
          ))}
          <Link to="/admin" className="block rounded-lg px-2 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
            Console
          </Link>
        </div>
      </details>
    </header>
  );
}
