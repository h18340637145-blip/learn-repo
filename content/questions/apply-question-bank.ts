import type { LessonQuestion, LessonSpec } from "@/lib/curriculum/types";

export type QuestionBankEntry = {
  lessonId: string;
  questions: LessonQuestion[];
};

export function applyQuestionBank(lessons: LessonSpec[], bank: readonly QuestionBankEntry[]): LessonSpec[] {
  const questionsByLessonId = new Map(bank.map((entry) => [entry.lessonId, entry.questions]));

  return lessons.map((lesson) => ({
    ...lesson,
    questions: [
      ...lesson.questions,
      ...(questionsByLessonId.get(lesson.id) ?? [])
    ]
  }));
}
