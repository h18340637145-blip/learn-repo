import type { LessonQuestion, LessonSpec, QuestionType, StageId } from "@/lib/curriculum/types";

import type { QuestionBankEntry } from "./apply-question-bank";

type PythonQuestionType = Extract<QuestionType, "diagnosis" | "repair" | "completion" | "execution-order">;

export type PythonQuestionBankSeedLesson = Pick<
  LessonSpec,
  "id" | "stageId" | "kind" | "title" | "concept" | "points" | "memoryHook" | "files" | "entryFile"
>;

type PythonQuestionProfile = Partial<Record<StageId, readonly PythonQuestionType[]>>;

type PythonBankBuilderOptions = {
  runtimeLabel: string;
  stageProfile: PythonQuestionProfile;
};

const COURSE_LABEL = "Python" as const;

export function buildPythonP1QuestionBank(
  lessons: readonly PythonQuestionBankSeedLesson[],
  options: PythonBankBuilderOptions
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
  lesson: PythonQuestionBankSeedLesson,
  stageProfile: PythonQuestionProfile,
  stageCounters: Map<StageId, number>
): PythonQuestionType {
  const profile = stageProfile[lesson.stageId] ?? ["diagnosis", "repair", "completion"];
  const current = stageCounters.get(lesson.stageId) ?? 0;
  stageCounters.set(lesson.stageId, current + 1);

  return profile[current % profile.length];
}

function createKnowledgeQuestion(
  lesson: PythonQuestionBankSeedLesson,
  type: PythonQuestionType,
  options: PythonBankBuilderOptions
): LessonQuestion {
  if (type === "repair") return createRepairQuestion(lesson, options, `${lesson.id}-repair`);
  if (type === "completion") return createCompletionQuestion(lesson, options, `${lesson.id}-completion`);
  if (type === "execution-order") return createExecutionOrderQuestion(lesson, options, `${lesson.id}-execution-order`);

  return createDiagnosisQuestion(lesson, options, `${lesson.id}-diagnosis`);
}

function createProjectQuestions(
  lesson: PythonQuestionBankSeedLesson,
  options: PythonBankBuilderOptions
): LessonQuestion[] {
  return [
    createRepairQuestion(lesson, options, `${lesson.id}-project-repair`),
    createExecutionOrderQuestion(lesson, options, `${lesson.id}-project-execution-order`)
  ];
}

function createDiagnosisQuestion(
  lesson: PythonQuestionBankSeedLesson,
  options: PythonBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "diagnosis",
    prompt: `阅读「${lesson.title}」的运行现象，最可能的根因是什么？`,
    materialTitle: `${options.runtimeLabel} 诊断现场`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "py",
    expectedOutput: `需要围绕「${lesson.memoryHook}」定位，而不是只盯着 Traceback。`,
    difficulty: "beginner",
    estimatedSeconds: 75,
    options: [
      {
        id: "a",
        label: `先确认 ${COURSE_LABEL} 解释器的运行边界`,
        detail: lesson.points[0] ?? lesson.memoryHook,
        feedback: `正确：这个现象要回到「${lesson.concept}」来解释。`
      },
      {
        id: "b",
        label: "先假设是缩进或语法解析失败",
        detail: "忽略了脚本已经进入运行阶段",
        feedback: "如果 Traceback 出现在运行时，优先诊断运行时对象、模块加载与副作用，而不是回到语法层面。"
      },
      {
        id: "c",
        label: "先把所有逻辑搬到 Notebook 里跑",
        detail: "用环境切换掩盖根因",
        feedback: `这会绕开 ${COURSE_LABEL} 的核心心智模型，无法稳定解释同类问题。`
      }
    ],
    answerId: "a",
    correctExplanation: `「${lesson.title}」的关键是：${lesson.memoryHook}。诊断时先确认解释器上下文、输入输出和 Traceback 源头，再改代码。`
  };
}

function createRepairQuestion(
  lesson: PythonQuestionBankSeedLesson,
  options: PythonBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "repair",
    prompt: `如果「${lesson.title}」的示例在真实项目里不稳定，哪种修复最符合当前知识点？`,
    materialTitle: `${options.runtimeLabel} 修复选择`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "py",
    difficulty: lesson.kind === "stage-project" ? "intermediate" : "beginner",
    estimatedSeconds: lesson.kind === "stage-project" ? 110 : 85,
    options: [
      {
        id: "a",
        label: "保留运行边界，并显式处理关键输入",
        detail: lesson.points[0] ?? "先让输入、边界和输出可观察",
        feedback: `正确：修复应该服务于「${lesson.memoryHook}」，而不是隐藏异常。`,
        language: "py",
        diffLines: [2, 3],
        code: createRepairCode(lesson, true)
      },
      {
        id: "b",
        label: "用 try/except 静默吞掉异常",
        detail: "让演示看似稳定，但丢失真实错误",
        feedback: "裸 except 或吞异常会让学习者看不到真实失败路径，生产环境也会增加排障成本。",
        language: "py",
        diffLines: [2, 4],
        code: createRepairCode(lesson, false)
      },
      {
        id: "c",
        label: "换个 .py 文件重新运行",
        detail: "改变入口不等于修复模型",
        feedback: `入口变化不能替代对 ${COURSE_LABEL} 运行机制的理解。`,
        language: "py",
        diffLines: [1],
        code: `# 只是换入口，核心问题仍然存在\n# ${escapeForCode(lesson.title)}\nprint("rerun")`
      }
    ],
    answerId: "a",
    correctExplanation: `稳定修复要保留当前运行模型，并把「${lesson.memoryHook}」对应的输入、边界和输出处理清楚。`
  };
}

function createCompletionQuestion(
  lesson: PythonQuestionBankSeedLesson,
  options: PythonBankBuilderOptions,
  id: string
): LessonQuestion {
  return {
    id,
    type: "completion",
    prompt: `补全「${lesson.title}」的学习检查点，哪段代码最能表达这个知识点？`,
    materialTitle: `${options.runtimeLabel} 补全任务`,
    materialCode: createCompletionCode(lesson, false),
    materialLanguage: "py",
    expectedOutput: `输出应能说明：${lesson.memoryHook}`,
    difficulty: "beginner",
    estimatedSeconds: 90,
    options: [
      {
        id: "a",
        label: "输出知识点和检查点数量",
        detail: "把概念落到可观察结果",
        feedback: "正确：补全后的代码能同时展示主题、检查点和可观察输出。",
        language: "py",
        diffLines: [3, 4],
        code: createCompletionCode(lesson, true)
      },
      {
        id: "b",
        label: "只定义列表却不 print",
        detail: "无法看到运行结果",
        feedback: "学习题需要可观察反馈，只定义数据不能验证心智模型。",
        language: "py",
        diffLines: [3],
        code: createIncompleteCode(lesson)
      },
      {
        id: "c",
        label: "print 一个固定字符串 done",
        detail: "看不到具体知识点",
        feedback: "固定输出无法说明当前课程的核心边界，也不利于迁移到真实项目。",
        language: "py",
        diffLines: [4],
        code: `topic = "${escapeForCode(lesson.title)}"\nprint("done")`
      }
    ],
    answerId: "a",
    correctExplanation: `补全题要让代码输出能证明「${lesson.memoryHook}」，而不是只让脚本"跑起来"。`
  };
}

function createExecutionOrderQuestion(
  lesson: PythonQuestionBankSeedLesson,
  options: PythonBankBuilderOptions,
  id: string
): LessonQuestion {
  const entryFile = lesson.entryFile ?? lesson.files?.[0]?.name ?? "main.py";
  const orderItems = [
    `读取入口 ${entryFile}`,
    `应用知识点：${lesson.points[0] ?? lesson.title}`,
    "产生 print 日志或返回值"
  ];

  return {
    id,
    type: "execution-order",
    prompt: `学习「${lesson.title}」时，哪条执行链路最可靠？`,
    materialTitle: `${options.runtimeLabel} 执行链路`,
    materialCode: getEntryCode(lesson),
    materialLanguage: "py",
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
        label: "看到 Traceback -> 猜测原因 -> 再回头找入口",
        detail: "倒着排查容易误判",
        feedback: "Traceback 是结果，不是入口；先找 `if __name__ == \"__main__\"` 或模块级入口能减少猜测。"
      },
      {
        id: "c",
        label: "跳过代码，只记结论",
        detail: "无法迁移到项目",
        feedback: `只背结论不能解释 ${COURSE_LABEL} 在真实项目里的执行路径。`
      }
    ],
    answerId: "a",
    correctExplanation: `执行顺序题帮助学习者把「${lesson.title}」还原成入口、机制和结果三段链路。`
  };
}

function getEntryCode(lesson: PythonQuestionBankSeedLesson): string {
  const code = lesson.files?.find((file) => file.name === lesson.entryFile)?.code ?? lesson.files?.[0]?.code ?? "";
  return code.split("\n").slice(0, 18).join("\n");
}

function createRepairCode(lesson: PythonQuestionBankSeedLesson, correct: boolean): string {
  const title = escapeForCode(lesson.title);
  const hook = escapeForCode(lesson.memoryHook);

  if (correct) {
    return `topic = "${title}"\nmodel = "${hook}"\nif not model:\n    raise ValueError("missing runtime model")\nprint(topic, model)`;
  }

  return `topic = "${title}"\ntry:\n    print(topic)\nexcept Exception:\n    print("ok")`;
}

function createCompletionCode(lesson: PythonQuestionBankSeedLesson, complete: boolean): string {
  const checkpoints = lesson.points.slice(0, 2).map(escapeForCode);
  const [first = "定位入口", second = "观察输出"] = checkpoints;
  const output = complete
    ? `\nprint(topic, len(checkpoints))`
    : `\n# TODO: 输出可观察检查结果`;

  return `topic = "${escapeForCode(lesson.title)}"\ncheckpoints = ["${first}", "${second}"]${output}`;
}

function createIncompleteCode(lesson: PythonQuestionBankSeedLesson): string {
  const checkpoint = escapeForCode(lesson.points[0] ?? lesson.memoryHook);
  return `topic = "${escapeForCode(lesson.title)}"\ncheckpoints = ["${checkpoint}"]\n# 没有 print，学习者无法验证结果`;
}

function escapeForCode(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
