import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";

export function Page({
  title,
  subtitle,
  children,
  back,
  actions,
  showStatus,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
  actions?: ReactNode;
  showStatus?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="safe-bottom min-h-screen">
      <TopBar
        title={title}
        subtitle={subtitle}
        showStatus={showStatus}
        left={
          back ? (
            <button
              type="button"
              className="min-h-11 min-w-11 rounded-full text-xl"
              aria-label="Back"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
          ) : undefined
        }
        right={actions}
      />
      <div className="px-4 py-5">{children}</div>
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className="font-semibold text-navy dark:text-gold">
      {children}
    </NavLink>
  );
}
