import type { ProgressSnapshot } from "./types";

export type StreakInfo = {
  currentStreak: number;
  bestStreak: number;
  totalStudyDays: number;
  todayAnsweredCount: number;
  masteryTitle: string;
  isStudiedToday: boolean;
};

export function calculateStreak(progress: ProgressSnapshot): StreakInfo {
  const datesSet = new Set<string>();
  const todayStr = new Date().toISOString().split("T")[0]!;
  let todayAnsweredCount = 0;

  Object.values(progress.questionAttempts).forEach((record) => {
    if (record.lastAnsweredAt) {
      const datePart = new Date(record.lastAnsweredAt).toISOString().split("T")[0]!;
      datesSet.add(datePart);
      if (datePart === todayStr) {
        todayAnsweredCount += 1;
      }
    }
  });

  const sortedDates = Array.from(datesSet).sort().reverse();
  const totalStudyDays = sortedDates.length;
  const isStudiedToday = datesSet.has(todayStr);

  let currentStreak = 0;
  let bestStreak = 0;

  if (sortedDates.length > 0) {
    const checkDate = new Date();
    // Check if studied today
    let checkStr = checkDate.toISOString().split("T")[0]!;
    if (!datesSet.has(checkStr)) {
      // If not studied today, check if studied yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split("T")[0]!;
    }

    if (datesSet.has(checkStr)) {
      currentStreak = 1;
      const tempDate = new Date(checkStr);

      while (true) {
        tempDate.setDate(tempDate.getDate() - 1);
        const prevStr = tempDate.toISOString().split("T")[0]!;
        if (datesSet.has(prevStr)) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }
  }

  // Calculate best streak
  let streakCounter = 0;
  const chronological = Array.from(datesSet).sort();
  for (let i = 0; i < chronological.length; i++) {
    if (i === 0) {
      streakCounter = 1;
    } else {
      const prev = new Date(chronological[i - 1]!).getTime();
      const curr = new Date(chronological[i]!).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        streakCounter += 1;
      } else {
        streakCounter = 1;
      }
    }
    bestStreak = Math.max(bestStreak, streakCounter);
  }
  bestStreak = Math.max(bestStreak, currentStreak);

  // Mastery title based on completed lessons
  const completedCount = progress.completedLessonIds.length + progress.completedProjectIds.length;
  let masteryTitle = "初学探索者";
  if (completedCount >= 50) masteryTitle = "全栈架构宗师";
  else if (completedCount >= 30) masteryTitle = "高级工程专家";
  else if (completedCount >= 15) masteryTitle = "异步与模块能手";
  else if (completedCount >= 5) masteryTitle = "新星研发者";

  return {
    currentStreak,
    bestStreak,
    totalStudyDays,
    todayAnsweredCount,
    masteryTitle,
    isStudiedToday
  };
}
