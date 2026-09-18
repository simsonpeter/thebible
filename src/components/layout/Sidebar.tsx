import { NavLink } from "react-router-dom";
import { OfflineBadge } from "@/components/ui/OfflineBadge";
import { cn } from "@/utils/misc";

const links = [
  { to: "/", label: "Home" },
  { to: "/bible", label: "Bible" },
  { to: "/search", label: "Search" },
  { to: "/bookmarks", label: "Bookmarks" },
  { to: "/highlights", label: "Highlights" },
  { to: "/notes", label: "Notes" },
  { to: "/reading-plans", label: "Plans" },
  { to: "/progress", label: "Progress" },
  { to: "/settings", label: "Settings" },
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-navy/10 bg-white/70 p-6 md:block dark:border-white/10 dark:bg-white/5">
      <p className="text-lg font-semibold tracking-tight">NJC Bible App</p>
      <p className="mt-1 tamil text-sm text-muted dark:text-white/60">தமிழ் வேதாகமம் • English Bible</p>
      <div className="mt-4">
        <OfflineBadge />
      </div>
      <nav aria-label="Sidebar" className="mt-8 grid gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              cn(
                "min-h-11 rounded-2xl px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-navy text-white dark:bg-gold dark:text-navy-deep"
                  : "text-navy/80 hover:bg-paper-2 dark:text-paper dark:hover:bg-white/10",
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
