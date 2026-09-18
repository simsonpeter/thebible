export function ProgressCard({
  title,
  percent,
  detail,
}: {
  title: string;
  percent: number;
  detail?: string;
}) {
  return (
    <article className="rounded-3xl border border-navy/8 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-gold">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-navy/10 dark:bg-white/10">
        <div className="h-full rounded-full bg-navy dark:bg-gold" style={{ width: `${percent}%` }} />
      </div>
      {detail ? <p className="mt-2 text-sm text-muted dark:text-white/60">{detail}</p> : null}
    </article>
  );
}
