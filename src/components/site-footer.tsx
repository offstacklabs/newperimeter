import { Link } from "@tanstack/react-router";

const columns: { title: string; links: { to: string; name: string }[] }[] = [
  {
    title: "Product",
    links: [
      { to: "/mcp-gateway", name: "Perimeter Gateway" },
      { to: "/identity-policy", name: "Perimeter Identity & Policy" },
      { to: "/guard", name: "Perimeter Runtime" },
      { to: "/catalog", name: "Perimeter Catalog" },
      { to: "/visibility", name: "Perimeter Audit" },
      { to: "/watch", name: "Perimeter Discover" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { to: "/solutions/ai-transformation", name: "AI Transformation" },
      { to: "/solutions/ai-platform", name: "AI Platform Teams" },
      { to: "/solutions/it-security", name: "IT & Security" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", name: "About" },
      { to: "/blog", name: "Blog" },
      { to: "/book-a-demo", name: "Book a demo" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">NP</span>
            New Perimeter
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Access control and audit logs for MCP.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground">
          <span>© 2026 New Perimeter</span>
        </div>
      </div>
    </footer>
  );
}
