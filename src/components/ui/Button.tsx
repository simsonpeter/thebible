import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/misc";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy-soft dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-soft",
  secondary:
    "bg-paper-2 text-navy hover:bg-gold-soft/40 dark:bg-white/10 dark:text-paper dark:hover:bg-white/15",
  ghost: "bg-transparent text-navy hover:bg-paper-2 dark:text-paper dark:hover:bg-white/10",
  gold: "bg-gold text-navy-deep hover:bg-gold-soft",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold tracking-wide transition disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
