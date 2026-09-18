import type { ReactNode } from "react";
import { cn } from "@/utils/misc";

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "rounded-3xl border border-navy/8 bg-white/80 p-5 shadow-[0_10px_40px_-24px_rgba(18,38,58,0.45)] dark:border-white/10 dark:bg-white/5",
    onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:border-gold/40",
    className,
  );
  if (onClick) {
    return (
      <button type="button" className={cn(classes, "w-full text-left")} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <section className={classes}>{children}</section>;
}
