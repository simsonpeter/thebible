import type { ReadingPlanRecord } from "@/types/userData";

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
    <button
      type="button"
      className="w-full rounded-3xl bg-[#12263A] p-5 text-left text-white dark:bg-[#1d3b5a]"
      onClick={onOpen}
    >
      <h3 className="font-semibold text-white">{plan.name}</h3>
      <p className="mt-1 text-sm text-white/80">{plan.description}</p>
      <p className="mt-3 text-sm text-white">
        Day {currentDay} / {plan.totalDays}
      </p>
      <p className="text-xs text-[#e8d5a3]">{completed} completed</p>
    </button>
  );
}
