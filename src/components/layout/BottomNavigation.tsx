import { NavLink } from "react-router-dom";
import { cn } from "@/utils/misc";

const items = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/bible", label: "Bible", icon: BibleIcon },
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/bookmarks", label: "Bookmarks", icon: SavedIcon },
  { to: "/settings", label: "Settings", icon: MoreIcon },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-navy/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-white/10 dark:bg-[#0c1016]/95"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  isActive ? "text-navy dark:text-gold" : "text-muted dark:text-white/50",
                )
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function BibleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V4Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h8M8 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function SavedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10a1 1 0 0 1 1 1v16l-6-3.5L6 21V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
