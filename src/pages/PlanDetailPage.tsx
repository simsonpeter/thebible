import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { getPlan, listPlanDays, planProgress, togglePlanDay } from "@/services/planService";
import type { PlanDayRecord, ReadingPlanRecord } from "@/types/userData";
import { ProgressCard } from "@/components/ui/ProgressCard";

export function PlanDetailPage() {
  const { planId = "" } = useParams();
  const [plan, setPlan] = useState<ReadingPlanRecord | undefined>();
  const [days, setDays] = useState<PlanDayRecord[]>([]);
  const [completed, setCompleted] = useState(0);
  const navigate = useNavigate();

  async function reload() {
    setPlan(await getPlan(planId));
    setDays(await listPlanDays(planId));
    const progress = await planProgress(planId);
    setCompleted(progress.completed);
  }

  useEffect(() => {
    void reload();
  }, [planId]);

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
        title={`Day ${completed} / ${plan.totalDays}`}
        percent={plan.totalDays ? Math.round((completed / plan.totalDays) * 100) : 0}
        detail={`${completed} completed`}
      />
      <div className="mt-4 grid gap-2">
        {days.map((day) => (
          <article key={day.day} className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gold">Day {day.day}</p>
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
            <div className="mt-2 flex flex-wrap gap-3">
              {(day.readings.some((reading) => reading.slot)
                ? (["morning", "evening"] as const).filter((slot) => day.readings.some((reading) => reading.slot === slot))
                : [undefined]
              ).map((slot) => {
                const first = slot
                  ? day.readings.find((reading) => reading.slot === slot)
                  : day.readings[0];
                if (!first) return null;
                const query = first.verseStart ? `?verse=${first.verseStart}` : "";
                return (
                  <button
                    key={slot ?? "reading"}
                    type="button"
                    className="min-h-11 text-sm font-semibold capitalize"
                    onClick={() => navigate(`/bible/${first.bookId}/${first.chapter}${query}`)}
                  >
                    {slot ? `Open ${slot}` : "Open reading"}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}
