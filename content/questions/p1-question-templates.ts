import type { CodeLanguage, LessonQuestion, LessonSpec, QuestionType, StageId } from "@/lib/curriculum/types";

import type { QuestionBankEntry } from "./apply-question-bank";

type P1QuestionType = Extract<QuestionType, "diagnosis" | "repair" | "completion" | "execution-order">;

export type QuestionBankSeedLesson = Pick<
  LessonSpec,
  "id" | "stageId" | "kind" | "title" | "concept" | "points" | "memoryHook" | "files" | "entryFile"
>;

type P1QuestionProfile = Partial<Record<StageId, readonly P1QuestionType[]>>;

type BankBuilderOptions = {
  courseLabel: "Node.js" | "Next.js";
  runtimeLabel: string;
  stageProfile: P1QuestionProfile;
};

export function buildP1QuestionBank(
  lessons: readonly QuestionBankSeedLesson[],
  options: BankBuilderOptions
): QuestionBankEntry[] {
  const stageCounters = new Map<StageId, number>();

  return lessons.map((lesson) => {
    const questionType = pickQuestionType(lesson, options.stageProfile, stageCounters);
    const questions = lesson.kind === "stage-project"
      ? createProjectQuestions(lesson, options)
      : [createKnowledgeQuestion(lesson, questionType, options)];

    return {
      lessonId: lesson.id,
      questions
    };
  });
}

function pickQuestionType(
  lesson: QuestionBankSeedLesson,
  stageProfile: P1QuestionProfile,
  stageCounters: Map<StageId, number>
): P1QuestionType {
  const profile = stageProfile[lesson.stageId] ?? ["diagnosis", "repair", "completion"];
  const current = stageCounters.get(lesson.stageId) ?? 0;
  stageCounters.set(lesson.stageId, current + 1);

  return profile[current % profile.length];
}

function createKnowledgeQuestion(
  lesson: QuestionBankSeedLesson,
  type: P1QuestionType,
  options: BankBuilderOptions
): LessonQuestion {
  if (type === "repair") return createRepairQuestion(lesson, options, `${lesson.id}-repair`);
  if (type === "completion") return createCompletionQuestion(lesson, options, `${lesson.id}-completion`);
  if (type === "execution-order") return createExecutionOrderQuestion(lesson, options, `${lesson.id}-execution-order`);

  return createDiagnosisQuestion(lesson, options, `${lesson.id}-diagnosis`);
}

function createProjectQuestions(lesson: QuestionBankSeedLesson, options: BankBuilderOptions): LessonQuestion[] {
  return [
    createRepairQuestion(lesson, options, `${lesson.id}-project-repair`),
    createExecutionOrderQuestion(lesson, options, `${lesson.id}-project-execution-order`)
  ];
}

function createDiagnosisQuestion(
  lesson: QuestionBankSeedLesson,
  options: BankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "diagnosis",
    prompt: `阅读「${lesson.title}」的运行现象，最可能的根因是什么？`,
    materialTitle: `${options.runtimeLabel} 诊断现场`,
    materialCode: getEntryCode(lesson),
    materialLanguage: getEntryLanguage(lesson),
    expectedOutput: `需要围绕「${lesson.memoryHook}」定位，而不是只看表面日志。`,
    difficulty: "beginner",
    estimatedSeconds: 75,
    options: [
      {
        id: "a",
        label: `先确认 ${options.courseLabel} 的运行边界`,
        detail: lesson.points[0] ?? lesson.memoryHook,
        feedback: `正确：这个现象要回到「${lesson.concept}」来解释。`
      },
      {
        id: "b",
        label: "先假设是语法解析失败",
        detail: "忽略了代码已经进入运行阶段",
        feedback: "如果脚本已经产生可观察输出，优先诊断运行时边界、数据流或框架约定。"
      },
      {
        id: "c",
        label: "先把所有逻辑搬到客户端",
        detail: "用位置变化掩盖根因",
        feedback: `这会绕开 ${options.courseLabel} 的核心心智模型，无法稳定解释同类问题。`
      }
    ],
    answerId: "a",
    correctExplanation: `「${lesson.title}」的关键是：${lesson.memoryHook}。诊断时先确认运行位置、输入输出和可观察日志，再改代码。`
  };
}

function createRepairQuestion(
  lesson: QuestionBankSeedLesson,
  options: BankBuilderOptions,
  id: string
): LessonQuestion {
  const language = getEntryLanguage(lesson);

  return {
    id,
    type: "repair",
    prompt: `如果「${lesson.title}」的示例在真实项目里不稳定，哪种修复最符合当前知识点？`,
    materialTitle: `${options.runtimeLabel} 修复选择`,
    materialCode: getEntryCode(lesson),
    materialLanguage: language,
    difficulty: lesson.kind === "stage-project" ? "intermediate" : "beginner",
    estimatedSeconds: lesson.kind === "stage-project" ? 110 : 85,
    options: [
      {
        id: "a",
        label: "保留运行边界，并显式处理关键输入",
        detail: lesson.points[0] ?? "先让输入、边界和输出可观察",
        feedback: `正确：修复应该服务于「${lesson.memoryHook}」，而不是隐藏问题。`,
        language,
        diffLines: [2, 3],
        code: createRepairCode(lesson, true)
      },
      {
        id: "b",
        label: "吞掉异常，只保留成功日志",
        detail: "让演示看似稳定，但丢失真实错误",
        feedback: "吞掉异常会让学习者看不到真实失败路径，项目中也会增加排障成本。",
        language,
        diffLines: [2, 4],
        code: createRepairCode(lesson, false)
      },
      {
        id: "c",
        label: "复制代码到另一个入口重新运行",
        detail: "改变入口不等于修复模型",
        feedback: `入口变化不能替代对 ${options.courseLabel} 运行机制的理解。`,
        language,
        diffLines: [1],
        code: `// 只是换入口，核心问题仍然存在\n${getCommentPrefix(language)} ${lesson.title}`
      }
    ],
    answerId: "a",
    correctExplanation: `稳定修复要保留当前运行模型，并把「${lesson.memoryHook}」对应的输入、边界和输出处理清楚。`
  };
}

function createCompletionQuestion(
  lesson: QuestionBankSeedLesson,
  options: BankBuilderOptions,
  id: string
): LessonQuestion {
  const language = getEntryLanguage(lesson);

  return {
    id,
    type: "completion",
    prompt: `补全「${lesson.title}」的学习检查点，哪段代码最能表达这个知识点？`,
    materialTitle: `${options.runtimeLabel} 补全任务`,
    materialCode: createCompletionCode(lesson, false),
    materialLanguage: language,
    expectedOutput: `输出应能说明：${lesson.memoryHook}`,
    difficulty: "beginner",
    estimatedSeconds: 90,
    options: [
      {
        id: "a",
        label: "输出知识点和检查点数量",
        detail: "把概念落到可观察结果",
        feedback: "正确：补全后的代码能同时展示主题、检查点和可观察输出。",
        language,
        diffLines: [3, 4],
        code: createCompletionCode(lesson, true)
      },
      {
        id: "b",
        label: "只声明数组但不输出",
        detail: "无法看到运行结果",
        feedback: "学习题需要可观察反馈，只声明数据不能验证心智模型。",
        language,
        diffLines: [3],
        code: createIncompleteCode(lesson)
      },
      {
        id: "c",
        label: "输出固定字符串 done",
        detail: "看不到具体知识点",
        feedback: "固定输出无法说明当前课程的核心边界，也不利于迁移到真实项目。",
        language,
        diffLines: [4],
        code: `const topic = "${escapeForCode(lesson.title)}";\nconsole.log("done");`
      }
    ],
    answerId: "a",
    correctExplanation: `补全题要让代码输出能证明「${lesson.memoryHook}」，而不是只让脚本“跑起来”。`
  };
}

function createExecutionOrderQuestion(
  lesson: QuestionBankSeedLesson,
  options: BankBuilderOptions,
  id: string
): LessonQuestion {
  const orderItems = [
    `读取入口 ${lesson.entryFile}`,
    `应用知识点：${lesson.points[0] ?? lesson.title}`,
    "产生日志、页面或运行结果"
  ];

  return {
    id,
    type: "execution-order",
    prompt: `学习「${lesson.title}」时，哪条执行链路最可靠？`,
    materialTitle: `${options.runtimeLabel} 执行链路`,
    materialCode: getEntryCode(lesson),
    materialLanguage: getEntryLanguage(lesson),
    orderItems,
    difficulty: lesson.kind === "stage-project" ? "intermediate" : "beginner",
    estimatedSeconds: lesson.kind === "stage-project" ? 100 : 80,
    options: [
      {
        id: "a",
        label: orderItems.join(" -> "),
        detail: "先定位入口，再解释机制，最后看结果",
        feedback: "正确：这是可复用的调试和学习顺序。"
      },
      {
        id: "b",
        label: "产生日志 -> 猜测原因 -> 再找入口",
        detail: "倒着排查容易误判",
        feedback: "日志是结果，不是入口；先找执行入口能减少猜测。"
      },
      {
        id: "c",
        label: "跳过代码，只记结论",
        detail: "无法迁移到项目",
        feedback: `只背结论不能解释 ${options.courseLabel} 在真实项目里的执行路径。`
      }
    ],
    answerId: "a",
    correctExplanation: `执行顺序题帮助学习者把「${lesson.title}」还原成入口、机制和结果三段链路。`
  };
}

function getEntryCode(lesson: QuestionBankSeedLesson): string {
  const code = lesson.files?.find((file) => file.name === lesson.entryFile)?.code ?? lesson.files?.[0]?.code ?? "";
  return code.split("\n").slice(0, 18).join("\n");
}

function getEntryLanguage(lesson: QuestionBankSeedLesson): CodeLanguage {
  const entryFile = lesson.entryFile ?? lesson.files?.[0]?.name ?? "";
  if (entryFile.endsWith(".tsx")) return "tsx";
  if (entryFile.endsWith(".ts")) return "ts";
  if (entryFile.endsWith(".json")) return "json";
  if (entryFile.endsWith(".sh")) return "bash";
  return "js";
}

function createRepairCode(lesson: QuestionBankSeedLesson, correct: boolean): string {
  const title = escapeForCode(lesson.title);
  const hook = escapeForCode(lesson.memoryHook);

  if (correct) {
    return `const topic = "${title}";\nconst model = "${hook}";\nif (!model) throw new Error("missing runtime model");\nconsole.log(topic, model);`;
  }

  return `const topic = "${title}";\ntry {\n  console.log(topic);\n} catch {\n  console.log("ok");\n}`;
}

function createCompletionCode(lesson: QuestionBankSeedLesson, complete: boolean): string {
  const checkpoints = lesson.points.slice(0, 2).map(escapeForCode);
  const [first = "定位入口", second = "观察输出"] = checkpoints;
  const output = complete ? `\nconsole.log(topic, checkpoints.length);` : "\n// TODO: 输出可观察检查结果";

  return `const topic = "${escapeForCode(lesson.title)}";\nconst checkpoints = ["${first}", "${second}"];${output}`;
}

function createIncompleteCode(lesson: QuestionBankSeedLesson): string {
  const checkpoint = escapeForCode(lesson.points[0] ?? lesson.memoryHook);
  return `const topic = "${escapeForCode(lesson.title)}";\nconst checkpoints = ["${checkpoint}"];\n// 没有输出，学习者无法验证结果`;
}

function getCommentPrefix(language: CodeLanguage): string {
  return language === "json" ? "\"note\":" : "//";
}

function escapeForCode(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
