import type { ReadingPlanRecord } from "@/types/userData";
import { Card } from "@/components/ui/Card";

export function ReadingPlanCard({
  plan,
  completed,
  currentDay,
  onOpen,
}: {
  plan: ReadingPlanRecord;
  completed: number;
  currentDay: number;
  onOpen: () => void;
}) {
  return (
    <Card onClick={onOpen}>
      <h3 className="font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted">{plan.description}</p>
      <p className="mt-3 text-sm">
        Day {currentDay} / {plan.totalDays}
      </p>
      <p className="text-xs text-gold">{completed} completed</p>
    </Card>
  );
}
