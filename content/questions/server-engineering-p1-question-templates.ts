import type { LessonQuestion, LessonSpec, QuestionType, StageId } from "@/lib/curriculum/types";

import type { QuestionBankEntry } from "./apply-question-bank";

type AiAppQuestionType = Extract<QuestionType, "diagnosis" | "repair" | "completion" | "execution-order">;

export type AiAppQuestionBankSeedLesson = Pick<
  LessonSpec,
  "id" | "stageId" | "kind" | "title" | "concept" | "points" | "memoryHook" | "files" | "entryFile"
>;

type AiAppQuestionProfile = Partial<Record<StageId, readonly AiAppQuestionType[]>>;

type AiAppBankBuilderOptions = {
  runtimeLabel: string;
  stageProfile: AiAppQuestionProfile;
};

const COURSE_LABEL = "服务端工程" as const;

export function buildAiAppP1QuestionBank(
  lessons: readonly AiAppQuestionBankSeedLesson[],
  options: AiAppBankBuilderOptions
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
  lesson: AiAppQuestionBankSeedLesson,
  stageProfile: AiAppQuestionProfile,
  stageCounters: Map<StageId, number>
): AiAppQuestionType {
  const profile = stageProfile[lesson.stageId] ?? ["diagnosis", "repair", "completion"];
  const current = stageCounters.get(lesson.stageId) ?? 0;
  stageCounters.set(lesson.stageId, current + 1);

  return profile[current % profile.length];
}

function createKnowledgeQuestion(
  lesson: AiAppQuestionBankSeedLesson,
  type: AiAppQuestionType,
  options: AiAppBankBuilderOptions
): LessonQuestion {
  if (type === "repair") return createRepairQuestion(lesson, options, `${lesson.id}-repair`);
  if (type === "completion") return createCompletionQuestion(lesson, options, `${lesson.id}-completion`);
  if (type === "execution-order") return createExecutionOrderQuestion(lesson, options, `${lesson.id}-execution-order`);

  return createDiagnosisQuestion(lesson, options, `${lesson.id}-diagnosis`);
}

function createProjectQuestions(
  lesson: AiAppQuestionBankSeedLesson,
  options: AiAppBankBuilderOptions
): LessonQuestion[] {
  return [
    createRepairQuestion(lesson, options, `${lesson.id}-project-repair`),
    createExecutionOrderQuestion(lesson, options, `${lesson.id}-project-execution-order`)
  ];
}

function createDiagnosisQuestion(
  lesson: AiAppQuestionBankSeedLesson,
  options: AiAppBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "diagnosis",
    prompt: `阅读「${lesson.title}」的 服务端工程调用现象，最可能的根因是什么？`,
    materialTitle: `${options.runtimeLabel} 诊断现场`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "ts",
    expectedOutput: `需要围绕「${lesson.memoryHook}」定位，而不是只看单条 trace。`,
    difficulty: "beginner",
    estimatedSeconds: 80,
    options: [
      {
        id: "a",
        label: `先确认 ${COURSE_LABEL} 调用链 (API/DB/Cache/MQ/Trace) 的运行边界`,
        detail: lesson.points[0] ?? lesson.memoryHook,
        feedback: `正确：这个现象要回到「${lesson.concept}」来解释。`
      },
      {
        id: "b",
        label: "先假设是 接口是偶发抖动，直接重试请求",
        detail: "忽略了 服务端上下游的 API/DB/Cache/MQ/Trace 链路",
        feedback: "重试请求掩盖不了 API/DB/Cache/MQ 链路问题，先看结构化 trace 与召回命中。"
      },
      {
        id: "c",
        label: "把整条 trace 直接扔给用户看",
        detail: "用输出量掩盖真实原因",
        feedback: `这会绕开 ${COURSE_LABEL} 的核心运行心智模型，无法稳定解释同类问题。`
      }
    ],
    answerId: "a",
    correctExplanation: `「${lesson.title}」的关键是：${lesson.memoryHook}。诊断时先确认 服务端工程上下文、工具契约和 trace 源头，再改代码。`
  };
}

function createRepairQuestion(
  lesson: AiAppQuestionBankSeedLesson,
  options: AiAppBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "repair",
    prompt: `如果「${lesson.title}」的示例在真实 服务端工程服务里不稳定，哪种修复最符合当前知识点？`,
    materialTitle: `${options.runtimeLabel} 修复选择`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "ts",
    difficulty: lesson.kind === "stage-project" ? "intermediate" : "beginner",
    estimatedSeconds: lesson.kind === "stage-project" ? 115 : 90,
    options: [
      {
        id: "a",
        label: "保留 服务端工程运行边界，并显式处理关键输入 / 工具返回",
        detail: lesson.points[0] ?? "先让工具契约、记忆读写和 trace 可观察",
        feedback: `正确：修复应该服务于「${lesson.memoryHook}」，而不是隐藏异常。`,
        language: "ts",
        diffLines: [2, 3],
        code: createRepairCode(lesson, true)
      },
      {
        id: "b",
        label: "用 try/catch 静默吞掉工具异常",
        detail: "让 demo 看似稳定，但丢失真实错误",
        feedback: "裸 catch 或吞异常会让学习者看不到真实失败路径，生产 服务端工程 会加剧漂移与幻觉。",
        language: "ts",
        diffLines: [2, 4],
        code: createRepairCode(lesson, false)
      },
      {
        id: "c",
        label: "直接改超时时间掩盖问题",
        detail: "重试请求不等于修好 服务端工程",
        feedback: `重试请求不能替代对 ${COURSE_LABEL} SLO、事务与幂等的理解。`,
        language: "ts",
        diffLines: [1],
        code: `// 只是重试请求，核心问题仍然存在\n// ${escapeForCode(lesson.title)}\nconsole.log("rerun");`
      }
    ],
    answerId: "a",
    correctExplanation: `稳定修复要保留当前 服务端工程调用模型，并把「${lesson.memoryHook}」对应的工具契约、记忆与 trace 处理清楚。`
  };
}

function createCompletionQuestion(
  lesson: AiAppQuestionBankSeedLesson,
  options: AiAppBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "completion",
    prompt: `补全「${lesson.title}」的学习检查点，哪段代码最能表达这个 服务端工程知识点？`,
    materialTitle: `${options.runtimeLabel} 补全任务`,
    materialCode: createCompletionCode(lesson, false),
    materialLanguage: "ts",
    expectedOutput: `输出应能说明：${lesson.memoryHook}`,
    difficulty: "beginner",
    estimatedSeconds: 90,
    options: [
      {
        id: "a",
        label: "输出主题与检查点数量",
        detail: "把 服务端工程概念落到可观察结果",
        feedback: "正确：补全后的代码能同时展示主题、检查点和可观察输出。",
        language: "ts",
        diffLines: [3, 4],
        code: createCompletionCode(lesson, true)
      },
      {
        id: "b",
        label: "只声明数组却不打印",
        detail: "无法看到运行结果",
        feedback: "服务端工程学习题需要可观察反馈，只定义数据不能验证心智模型。",
        language: "ts",
        diffLines: [3],
        code: createIncompleteCode(lesson)
      },
      {
        id: "c",
        label: "console.log 一个固定字符串 done",
        detail: "看不到具体知识点",
        feedback: "固定输出无法说明当前 服务端工程阶段的核心边界，也不利于迁移到真实系统。",
        language: "ts",
        diffLines: [4],
        code: `const topic = "${escapeForCode(lesson.title)}";\nconsole.log("done");`
      }
    ],
    answerId: "a",
    correctExplanation: `补全题要让代码输出能证明「${lesson.memoryHook}」，而不是只让脚本"跑起来"。`
  };
}

function createExecutionOrderQuestion(
  lesson: AiAppQuestionBankSeedLesson,
  options: AiAppBankBuilderOptions,
  id: string
): LessonQuestion {
  const entryFile = lesson.entryFile ?? lesson.files?.[0]?.name ?? "handler.ts";
  const orderItems = [
    `读取入口 ${entryFile}`,
    `应用知识点：${lesson.points[0] ?? lesson.title}`,
    "产生 trace / 召回 / 接口返回"
  ];

  return {
    id,
    type: "execution-order",
    prompt: `学习「${lesson.title}」时，哪条 服务端工程执行链路最可靠？`,
    materialTitle: `${options.runtimeLabel} 执行链路`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "ts",
    orderItems,
    difficulty: lesson.kind === "stage-project" ? "intermediate" : "beginner",
    estimatedSeconds: lesson.kind === "stage-project" ? 105 : 80,
    options: [
      {
        id: "a",
        label: orderItems.join(" -> "),
        detail: "先定位入口，再解释机制，最后看 trace / 工具输出",
        feedback: "正确：这是可复用的 服务端工程调试和学习顺序。"
      },
      {
        id: "b",
        label: "先看响应体 -> 猜原因 -> 再回头找入口",
        detail: "倒着排查容易误判 服务端工程调用链",
        feedback: "接口返回只是结果，不是入口；先找 API/DB/Cache 入口与 Trace root 能减少猜测。"
      },
      {
        id: "c",
        label: "跳过代码，只记结论",
        detail: "无法迁移到真实 服务端工程系统",
        feedback: `只背结论不能解释 ${COURSE_LABEL} 在生产 服务端工程里的执行路径。`
      }
    ],
    answerId: "a",
    correctExplanation: `执行顺序题帮助学习者把「${lesson.title}」还原成入口、机制和 trace 三段链路。`
  };
}

function getEntryCode(lesson: AiAppQuestionBankSeedLesson): string {
  const code = lesson.files?.find((file) => file.name === lesson.entryFile)?.code ?? lesson.files?.[0]?.code ?? "";
  return code.split("\n").slice(0, 18).join("\n");
}

function createRepairCode(lesson: AiAppQuestionBankSeedLesson, correct: boolean): string {
  const title = escapeForCode(lesson.title);
  const hook = escapeForCode(lesson.memoryHook);

  if (correct) {
    return `const topic = "${title}";\nconst model = "${hook}";\nif (!model) {\n  throw new Error("missing AI application runtime model");\n}\nconsole.log(topic, model);`;
  }

  return `const topic = "${title}";\ntry {\n  console.log(topic);\n} catch (_err) {\n  console.log("ok");\n}`;
}

function createCompletionCode(lesson: AiAppQuestionBankSeedLesson, complete: boolean): string {
  const checkpoints = lesson.points.slice(0, 2).map(escapeForCode);
  const [first = "定位入口", second = "观察 trace"] = checkpoints;
  const output = complete
    ? `\nconsole.log(topic, checkpoints.length);`
    : `\n// TODO: 输出可观察检查结果`;

  return `const topic = "${escapeForCode(lesson.title)}";\nconst checkpoints = ["${first}", "${second}"];${output}`;
}

function createIncompleteCode(lesson: AiAppQuestionBankSeedLesson): string {
  const checkpoint = escapeForCode(lesson.points[0] ?? lesson.memoryHook);
  return `const topic = "${escapeForCode(lesson.title)}";\nconst checkpoints = ["${checkpoint}"];\n// 缺少 console.log，学习者无法验证结果`;
}

function escapeForCode(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
