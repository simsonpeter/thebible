import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/Button";
import { getPlan, listPlanDays, planProgress, togglePlanDay } from "@/services/planService";
import type { PlanDayRecord, ReadingPlanRecord } from "@/types/userData";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { cn } from "@/utils/misc";

export function PlanDetailPage() {
  const { planId = "" } = useParams();
  const [plan, setPlan] = useState<ReadingPlanRecord | undefined>();
  const [days, setDays] = useState<PlanDayRecord[]>([]);
  const [completed, setCompleted] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const current = days.find((day) => day.day === currentDay) ?? days.find((day) => !day.completed) ?? days[0];

  async function reload() {
    try {
      setPlan(await getPlan(planId));
      setDays(await listPlanDays(planId));
      const progress = await planProgress(planId);
      setCompleted(progress.completed);
      setCurrentDay(progress.currentDay);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    void reload();
  }, [planId]);

  useEffect(() => {
    if (!current) return;
    const node = document.getElementById(`plan-day-${current.day}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current?.day, days.length]);

  if (!loaded) {
    return (
      <Page title="Reading plan" back>
        <p className="text-sm text-muted">Loading today&apos;s reading…</p>
      </Page>
    );
  }

  if (!plan) {
    return (
      <Page title="Reading plan" back>
        <p>This plan is not available.</p>
      </Page>
    );
  }

  return (
    <Page title={plan.name} subtitle={plan.description} back>
      <ProgressCard
        title={`Day ${currentDay} / ${plan.totalDays}`}
        percent={plan.totalDays ? Math.round((completed / plan.totalDays) * 100) : 0}
        detail={`${completed} completed`}
      />
      {current ? (
        <section className="mt-4 rounded-3xl bg-[#12263A] p-5 text-white">
          <p className="text-xs tracking-[0.25em] text-[#e8d5a3] uppercase">Read today</p>
          <h2 className="mt-2 text-xl font-semibold">Day {current.day}</h2>
          <p className="mt-1 text-sm text-white/80">{current.label}</p>
          <PlanDayButtons day={current} onOpen={(path) => navigate(path)} strong />
        </section>
      ) : null}
      <div className="mt-4 grid gap-2">
        {days.map((day) => (
          <article
            key={day.day}
            id={`plan-day-${day.day}`}
            className={cn(
              "rounded-2xl bg-white p-4 dark:bg-white/5",
              day.day === current?.day && "ring-2 ring-gold",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gold">
                  Day {day.day}
                  {day.day === current?.day ? " · now" : ""}
                </p>
                <p className="text-sm">{day.label}</p>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-6 w-6"
                checked={day.completed}
                aria-label={`Mark day ${day.day} complete`}
                onChange={(event) => {
                  void togglePlanDay(planId, day.day, event.target.checked).then(reload);
                }}
              />
            </div>
            <PlanDayButtons day={day} onOpen={(path) => navigate(path)} />
          </article>
        ))}
      </div>
    </Page>
  );
}

function PlanDayButtons({
  day,
  onOpen,
  strong,
}: {
  day: PlanDayRecord;
  onOpen: (path: string) => void;
  strong?: boolean;
}) {
  const slots = day.readings.some((reading) => reading.slot)
    ? (["morning", "evening"] as const).filter((slot) => day.readings.some((reading) => reading.slot === slot))
    : [undefined];

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {slots.map((slot) => {
        const first = slot ? day.readings.find((reading) => reading.slot === slot) : day.readings[0];
        if (!first) return null;
        const query = first.verseStart ? `?verse=${first.verseStart}` : "";
        const label = slot ? `Open ${slot}` : "Open reading";
        if (strong) {
          return (
            <Button key={slot ?? "reading"} variant="gold" onClick={() => onOpen(`/bible/${first.bookId}/${first.chapter}${query}`)}>
              {label}
            </Button>
          );
        }
        return (
          <button
            key={slot ?? "reading"}
            type="button"
            className="min-h-11 text-sm font-semibold capitalize"
            onClick={() => onOpen(`/bible/${first.bookId}/${first.chapter}${query}`)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
