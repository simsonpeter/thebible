import { cn } from "@/utils/misc";

export function SplashScreen({
  stage,
  percent = 0,
  error,
}: {
  stage?: string;
  percent?: number;
  error?: string;
}) {
  return (
    <main
      className={cn(
        "relative grid min-h-screen place-items-center overflow-hidden px-6 text-center text-white",
        "bg-[radial-gradient(ellipse_at_top,#1d3b5a_0%,#0b1a2b_45%,#050b14_100%)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(198,163,90,0.18), transparent 28%), radial-gradient(circle at 80% 15%, rgba(232,213,163,0.12), transparent 24%), radial-gradient(circle at 50% 100%, rgba(198,163,90,0.16), transparent 35%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-[8%] rounded-[2rem] border border-gold/20"
        style={{ boxShadow: "inset 0 0 0 1px rgba(232,213,163,0.08)" }}
      />
      <div className="pointer-events-none absolute left-1/2 top-[12%] h-24 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="splash-crest mb-6 grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-navy-deep/60 shadow-[0_0_40px_rgba(198,163,90,0.25)]">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
            <path
              d="M17 4v26M8 12h18"
              stroke="#c6a35a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="17" cy="17" r="15" stroke="#e8d5a3" strokeOpacity="0.35" strokeWidth="1" />
          </svg>
        </div>

        <p className="splash-fade text-[0.7rem] tracking-[0.45em] text-gold uppercase">NJC Bible App</p>
        <h1 className="splash-rise mt-3 font-serif text-4xl font-semibold tracking-tight text-gold-soft sm:text-5xl">
          The Word
        </h1>
        <p className="tamil splash-fade mt-3 text-base text-white/75">தமிழ் வேதாகமம் • English Bible</p>

        <div className="mt-8 h-px w-40 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        {error ? (
          <div className="mt-8 max-w-sm">
            <p className="text-sm text-gold-soft">Bible data is not installed yet.</p>
            <p className="mt-2 text-xs text-white/60">{error}</p>
          </div>
        ) : (
          <div className="mt-8 w-full max-w-xs">
            <p className="text-sm text-gold-soft">{stage || "Opening your offline Bible…"}</p>
            <div className="mx-auto mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(6, Math.min(100, percent))}%` }}
              />
            </div>
          </div>
        )}

        <p className="splash-credit mt-16 text-[0.7rem] tracking-[0.35em] text-gold/80 uppercase">
          by JayathaSoft
        </p>
      </div>
    </main>
  );
}
