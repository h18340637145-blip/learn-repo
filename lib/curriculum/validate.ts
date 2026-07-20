import type { CodeLanguage, CourseSpec, CurriculumStage, LessonSpec, QuestionType } from "./types";

const supportedQuestionTypes = new Set<QuestionType>([
  "prediction",
  "implementation",
  "diagnosis",
  "repair",
  "completion",
  "execution-order",
  "best-practice",
  "concept-match",
  "equivalent-code",
  "sequence",
  "transfer"
]);

const p1QuestionTypes = new Set<QuestionType>(["diagnosis", "repair", "completion", "execution-order"]);

const supportedCodeLanguages = new Set<CodeLanguage>(["js", "ts", "tsx", "json", "bash", "text"]);

export function validateLessonSpec(lesson: LessonSpec): string[] {
  const errors: string[] = [];
  const questionIds = new Set<string>();

  if (lesson.questions.length === 0) errors.push(`课程 ${lesson.id} 没有题目`);
  if (lesson.sources.length === 0) errors.push(`课程 ${lesson.id} 没有来源`);
  if (!lesson.files.some((file) => file.name === lesson.entryFile)) {
    errors.push(`课程 ${lesson.id} 缺少入口文件 ${lesson.entryFile}`);
  }

  for (const question of lesson.questions) {
    if (questionIds.has(question.id)) {
      errors.push(`课程 ${lesson.id} 的题目 ID 重复：${question.id}`);
    }
    questionIds.add(question.id);

    if (!supportedQuestionTypes.has(question.type)) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 使用了不支持的题型 ${question.type}`);
    }
    if (question.options.length < 2) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 至少需要 2 个选项`);
    }
    if (!question.options.some((option) => option.id === question.answerId)) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 缺少正确答案选项 ${question.answerId}`);
    }
    if (question.type === "implementation" && !question.options.some((option) => option.code?.trim())) {
      errors.push(`课程 ${lesson.id} 的 implementation 题 ${question.id} 至少需要一个代码选项`);
    }
    if (p1QuestionTypes.has(question.type) && !question.difficulty) {
      errors.push(`课程 ${lesson.id} 的 P1 题 ${question.id} 必须声明 difficulty`);
    }
    if (p1QuestionTypes.has(question.type) && !question.estimatedSeconds) {
      errors.push(`课程 ${lesson.id} 的 P1 题 ${question.id} 必须声明 estimatedSeconds`);
    }
    if (question.materialLanguage && !supportedCodeLanguages.has(question.materialLanguage)) {
      errors.push(`课程 ${lesson.id} 的题目 ${question.id} 使用了不支持的材料语言 ${question.materialLanguage}`);
    }
    if (question.type === "repair" && question.options.filter((option) => option.code?.trim()).length < 2) {
      errors.push(`课程 ${lesson.id} 的 repair 题 ${question.id} 至少需要 2 个代码选项`);
    }
    if (question.type === "completion" && question.options.filter((option) => option.code?.trim()).length < 2) {
      errors.push(`课程 ${lesson.id} 的 completion 题 ${question.id} 至少需要 2 个代码选项`);
    }
    if (question.type === "execution-order" && question.orderItems && question.orderItems.length < 3) {
      errors.push(`课程 ${lesson.id} 的 execution-order 题 ${question.id} 的 orderItems 至少需要 3 项`);
    }
    for (const option of question.options) {
      if (option.feedback.trim() === "") {
        errors.push(`课程 ${lesson.id} 的题目 ${question.id} 选项 ${option.id} 缺少定向反馈`);
      }
      if (option.code?.trim() && !option.language) {
        errors.push(`课程 ${lesson.id} 的题目 ${question.id} 选项 ${option.id} 含代码但缺少 language`);
      }
      if (option.language && !supportedCodeLanguages.has(option.language)) {
        errors.push(`课程 ${lesson.id} 的题目 ${question.id} 选项 ${option.id} 使用了不支持的代码语言 ${option.language}`);
      }
      if (option.diffLines && !option.diffLines.every((line) => Number.isInteger(line) && line > 0)) {
        errors.push(`课程 ${lesson.id} 的题目 ${question.id} 选项 ${option.id} 的 diffLines 必须是正整数数组`);
      }
    }
  }

  return errors;
}

/** Validate a single course catalog (variable stage count). */
export function validateCourseCatalog(course: CourseSpec): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  if (course.stages.length === 0) errors.push(`课程 ${course.id} 没有阶段`);
  if (course.id === "nodejs" && course.stages.length !== 11) {
    errors.push(`课程 ${course.id} 应有 11 个阶段，实际为 ${course.stages.length}`);
  }
  if (course.id === "nextjs" && course.stages.length !== 10) {
    errors.push(`课程 ${course.id} 应有 10 个阶段，实际为 ${course.stages.length}`);
  }

  course.stages.forEach((stage, index) => {
    if (stage.number !== index) errors.push(`课程 ${course.id} 阶段 ${stage.id} 的编号应为 ${index}`);
    if (stage.lessons.length !== 8) errors.push(`课程 ${course.id} 阶段 ${stage.id} 应有 8 个知识点`);
    for (const item of [...stage.lessons, stage.project]) {
      if (ids.has(item.id)) errors.push(`课程 ${course.id} ID 重复：${item.id}`);
      ids.add(item.id);
    }
  });

  return errors;
}

/**
 * Backward-compatible: validate the Node.js catalog which must have exactly 11 stages.
 * This wraps validateCourseCatalog with the extra 11-stage constraint.
 */
export function validateCatalog(stages: readonly CurriculumStage[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  if (stages.length !== 11) errors.push(`课程目录应有 11 个阶段，实际为 ${stages.length}`);

  stages.forEach((stage, index) => {
    if (stage.number !== index) errors.push(`阶段 ${stage.id} 的编号应为 ${index}`);
    if (stage.lessons.length !== 8) errors.push(`阶段 ${stage.id} 应有 8 个知识点`);
    for (const item of [...stage.lessons, stage.project]) {
      if (ids.has(item.id)) errors.push(`课程 ID 重复：${item.id}`);
      ids.add(item.id);
    }
  });

  return errors;
}
