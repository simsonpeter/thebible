import type { ReactNode } from "react";

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted uppercase">{title}</h2>
      <div className="divide-y divide-navy/8 overflow-hidden rounded-3xl border border-navy/8 bg-white/80 dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
        {children}
      </div>
    </section>
  );
}
