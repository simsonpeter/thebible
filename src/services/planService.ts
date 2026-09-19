import { PLAN_TEMPLATES, buildPlanDays, labelPlanDay } from "@/data/readingPlans";
import { db } from "@/db";
import type { PlanDayRecord, ReadingPlanRecord } from "@/types/userData";
import { nowIso } from "@/utils/misc";

export async function seedReadingPlans(): Promise<void> {
  for (const plan of PLAN_TEMPLATES) {
    const existing = await db.readingPlans.get(plan.id);
    const readings = buildPlanDays(plan.id);
    if (!existing) {
      await db.readingPlans.put({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        totalDays: readings.length,
      });
      await db.planDays.bulkPut(
        readings.map((dayReadings, index) => ({
          planId: plan.id,
          day: index + 1,
          label: labelPlanDay(dayReadings),
          readings: dayReadings,
          completed: false,
        })),
      );
    } else if (existing.name !== plan.name || existing.description !== plan.description) {
      await db.readingPlans.update(plan.id, {
        name: plan.name,
        description: plan.description,
      });
    }
  }
}

export async function listPlans(): Promise<ReadingPlanRecord[]> {
  await seedReadingPlans();
  return db.readingPlans.toArray();
}

export async function getPlan(planId: string): Promise<ReadingPlanRecord | undefined> {
  await seedReadingPlans();
  return db.readingPlans.get(planId);
}

export async function listPlanDays(planId: string): Promise<PlanDayRecord[]> {
  return db.planDays.where("planId").equals(planId).sortBy("day");
}

export async function togglePlanDay(planId: string, day: number, completed: boolean): Promise<void> {
  await db.planDays.where("[planId+day]").equals([planId, day]).modify({
    completed,
    completedAt: completed ? nowIso() : undefined,
  });
}

export async function planProgress(planId: string): Promise<{ completed: number; total: number; currentDay: number }> {
  const days = await listPlanDays(planId);
  const completed = days.filter((day) => day.completed).length;
  const current = days.find((day) => !day.completed)?.day ?? days.length;
  return { completed, total: days.length, currentDay: current };
}
