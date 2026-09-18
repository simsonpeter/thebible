import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { ReadingPlanCard } from "@/components/plans/ReadingPlanCard";
import { listPlans, planProgress } from "@/services/planService";
import type { ReadingPlanRecord } from "@/types/userData";

export function ReadingPlansPage() {
  const [plans, setPlans] = useState<Array<ReadingPlanRecord & { completed: number; currentDay: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const list = await listPlans();
      const withProgress = await Promise.all(
        list.map(async (plan) => {
          const progress = await planProgress(plan.id);
          return { ...plan, completed: progress.completed, currentDay: progress.currentDay };
        }),
      );
      setPlans(withProgress);
    })();
  }, []);

  return (
    <Page title="Reading plans" subtitle="All plans work fully offline">
      <div className="grid gap-3">
        {plans.map((plan) => (
          <ReadingPlanCard
            key={plan.id}
            plan={plan}
            completed={plan.completed}
            currentDay={plan.currentDay}
            onOpen={() => navigate(`/reading-plans/${plan.id}`)}
          />
        ))}
      </div>
    </Page>
  );
}
