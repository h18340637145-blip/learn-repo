import { createLessonSpec } from "./lesson-factory";
import type { AnswerOption, CodeLanguage, CourseId, LessonQuestion, LessonSpec, StageId, VisualizerType } from "../../lib/curriculum/types";

type BlueprintLessonSeed = {
  title: string;
  concept: string;
  points: readonly string[];
  memoryHook: string;
  code: string;
  prompt: string;
  correct: string;
  wrongA: string;
  wrongB: string;
  correctExplanation: string;
};

type BlueprintCourseSeed = {
  courseId: CourseId;
  stageId: StageId;
  stageLabel: string;
  runtimeLabel: string;
  fileExtension: string;
  language: CodeLanguage;
  visualizerType: VisualizerType;
  sourceTitle: string;
  sourceUrl: string;
  lessons: readonly BlueprintLessonSeed[];
  project: {
    title: string;
    concept: string;
    code: string;
    prompt: string;
    correct: string;
    wrongA: string;
    wrongB: string;
    secondPrompt: string;
    secondCorrect: string;
    secondWrongA: string;
    secondWrongB: string;
    summary: readonly string[];
  };
};

const sharedLanes = ["输入", "模型", "执行", "输出"] as const;

function createOptions(seed: BlueprintLessonSeed): AnswerOption[] {
  return [
    {
      id: "a",
      label: seed.wrongA,
      detail: "常见误判",
      feedback: "这个判断只抓住了表面现象，没有解释运行时真正发生的那一步。"
    },
    {
      id: "b",
      label: seed.correct,
      detail: "符合运行模型",
      feedback: seed.correctExplanation
    },
    {
      id: "c",
      label: seed.wrongB,
      detail: "边界混淆",
      feedback: "这个方向容易把概念边界混在一起，后续调试会找错位置。"
    }
  ];
}

function createSecondProjectQuestion(course: BlueprintCourseSeed): LessonQuestion {
  return {
    id: `${course.courseId}-${course.stageId}-project-check`,
    type: "best-practice",
    prompt: course.project.secondPrompt,
    options: [
      {
        id: "a",
        label: course.project.secondWrongA,
        detail: "只解决眼前现象",
        feedback: "阶段项目需要把前面知识串起来，不能只改最后一行现象。"
      },
      {
        id: "b",
        label: course.project.secondCorrect,
        detail: "兼顾模型和验证",
        feedback: "正确：阶段项目的目标是建立可解释、可复查的运行链路。"
      },
      {
        id: "c",
        label: course.project.secondWrongB,
        detail: "跳过验证",
        feedback: "没有验证输出，学习者无法知道修复是否真的覆盖了关键路径。"
      }
    ],
    answerId: "b",
    correctExplanation: "阶段项目要把概念、代码、运行轨迹和最终输出合成一个闭环。"
  };
}

function lessonFileName(course: BlueprintCourseSeed, index: number) {
  return `${course.courseId}-${String(index + 1).padStart(2, "0")}.${course.fileExtension}`;
}

function createKnowledgeLesson(course: BlueprintCourseSeed, seed: BlueprintLessonSeed, index: number): LessonSpec {
  const id = `${course.courseId}-${course.stageId}-lesson-${index + 1}`;
  const fileName = lessonFileName(course, index);

  return createLessonSpec({
    id,
    stageId: course.stageId,
    eyebrow: `00.${index + 1} · ${course.stageLabel}`,
    title: seed.title,
    durationMinutes: 10,
    difficulty: "基础",
    nodeVersion: course.runtimeLabel,
    objectives: [`理解${seed.title}的核心模型`, "先预测输出，再用可视化轨迹验证"],
    prerequisites: ["具备基础编程阅读能力"],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: fileName, code: seed.code }],
    entryFile: fileName,
    answer: {
      type: index % 3 === 0 ? "concept-match" : index % 3 === 1 ? "prediction" : "best-practice",
      prompt: seed.prompt,
      options: createOptions(seed),
      answerId: "b",
      correctExplanation: seed.correctExplanation
    },
    execution: {
      visualizer: {
        type: course.visualizerType,
        title: `${course.stageLabel}运行轨迹`,
        nodes: [seed.title, ...seed.points.slice(0, 3)]
      },
      lanes: [...sharedLanes],
      frames: [
        {
          activeLane: 0,
          laneValues: [seed.title, "等待建模", "等待执行", "等待输出"],
          log: [`读取案例：${fileName}`],
          note: "先观察输入和题目，不急着看答案。",
          delayMs: 320
        },
        {
          activeLane: 1,
          laneValues: [seed.title, seed.points[0] ?? "核心模型", "准备执行", "等待输出"],
          log: [`建立模型：${seed.memoryHook}`],
          note: "把抽象知识点转换成可追踪的运行状态。",
          delayMs: 560
        },
        {
          activeLane: 3,
          laneValues: [seed.title, seed.points[1] ?? "边界", "完成", seed.correct],
          log: [seed.correctExplanation],
          note: "用输出验证预测，形成可复用的心智模型。",
          delayMs: 680
        }
      ]
    },
    summary: [seed.correctExplanation, ...seed.points.slice(0, 2)],
    sources: [{ title: course.sourceTitle, url: course.sourceUrl }]
  });
}

function createProjectLesson(course: BlueprintCourseSeed): LessonSpec {
  const id = `${course.courseId}-${course.stageId}-project`;
  const fileName = `${course.courseId}-${course.stageId}-project.${course.fileExtension}`;
  const projectSeed: BlueprintLessonSeed = {
    title: course.project.title,
    concept: course.project.concept,
    points: ["组合前面 8 个知识点", "先定位输入和状态，再验证输出", "用阶段项目沉淀工程判断"],
    memoryHook: "项目不是大题，而是一条完整运行链路",
    code: course.project.code,
    prompt: course.project.prompt,
    correct: course.project.correct,
    wrongA: course.project.wrongA,
    wrongB: course.project.wrongB,
    correctExplanation: "正确：阶段项目要把知识点串成可运行、可观察、可解释的结果。"
  };

  return createLessonSpec({
    id,
    stageId: course.stageId,
    kind: "stage-project",
    eyebrow: "PROJECT · 阶段综合演练",
    title: course.project.title,
    durationMinutes: 18,
    difficulty: "进阶",
    nodeVersion: course.runtimeLabel,
    objectives: ["组合首阶段知识点完成一个小型项目", "通过运行轨迹解释项目结果"],
    prerequisites: course.lessons.slice(0, 4).map((lesson) => lesson.title),
    concept: course.project.concept,
    points: [...projectSeed.points],
    memoryHook: projectSeed.memoryHook,
    files: [{ name: fileName, code: course.project.code }],
    entryFile: fileName,
    answer: {
      type: "implementation",
      prompt: course.project.prompt,
      options: [
        {
          id: "a",
          label: course.project.wrongA,
          detail: "遗漏关键路径",
          feedback: "这个方案无法解释完整输入到输出链路。",
          code: "// 只处理局部现象，缺少关键验证",
          language: course.language
        },
        {
          id: "b",
          label: course.project.correct,
          detail: "完整项目路径",
          feedback: "正确：它能把输入、核心模型、运行步骤和输出验证串起来。",
          code: course.project.code,
          language: course.language,
          diffLines: [1, 2, 3]
        },
        {
          id: "c",
          label: course.project.wrongB,
          detail: "缺少运行反馈",
          feedback: "没有运行反馈，学习者无法确认项目是否真的成立。",
          code: "// 缺少可观察输出",
          language: course.language
        }
      ],
      answerId: "b",
      correctExplanation: "阶段项目的正确方案必须能解释执行结果，而不是只给出最终代码。"
    },
    additionalQuestions: [createSecondProjectQuestion(course)],
    execution: {
      visualizer: {
        type: "stage-project-core",
        title: `${course.stageLabel}阶段项目运行核心`,
        nodes: [course.project.title, "输入", "模型", "验证", "总结"]
      },
      lanes: [...sharedLanes],
      frames: [
        {
          activeLane: 0,
          laneValues: ["项目输入", "等待", "等待", "等待"],
          log: [`启动阶段项目：${course.project.title}`],
          note: "阶段项目先确认输入边界。",
          delayMs: 420
        },
        {
          activeLane: 2,
          laneValues: ["项目输入", course.stageLabel, "组合执行", "等待"],
          log: ["组合首阶段知识点"],
          note: "把前面课程的模型组合起来。",
          delayMs: 760
        },
        {
          activeLane: 3,
          laneValues: ["项目输入", course.stageLabel, "组合执行", "项目完成"],
          log: [course.project.summary[0] ?? "项目运行完成"],
          note: "输出可解释结果并生成阶段总结。",
          delayMs: 820
        }
      ]
    },
    summary: [...course.project.summary],
    sources: [{ title: course.sourceTitle, url: course.sourceUrl }]
  });
}

function createCourseLessons(course: BlueprintCourseSeed): LessonSpec[] {
  return [
    ...course.lessons.map((lesson, index) => createKnowledgeLesson(course, lesson, index)),
    createProjectLesson(course)
  ];
}

const pythonSeeds: BlueprintLessonSeed[] = [
  {
    title: "变量与动态类型",
    concept: "Python 名字绑定到对象，变量本身不保存静态类型；类型属于运行时对象。",
    points: ["名字绑定对象", "type 观察运行时类型", "重新赋值会改变绑定"],
    memoryHook: "变量像标签，贴到对象上",
    code: `value = 41\nvalue = value + 1\nprint(type(value).__name__, value)`,
    prompt: "这段 Python 执行后最能说明什么？",
    correct: "变量名绑定到 int 对象，输出 int 42",
    wrongA: "变量声明后类型不可改变",
    wrongB: "value 保存的是字符串 42",
    correctExplanation: "Python 的类型跟随对象，value 当前绑定到 int 对象 42。"
  },
  {
    title: "函数调用栈",
    concept: "函数调用会创建新的栈帧，局部变量存在于当前调用上下文中。",
    points: ["调用创建栈帧", "参数进入局部作用域", "return 弹出栈帧"],
    memoryHook: "每次调用都像压入一张任务卡",
    code: `def add_tax(price):\n    total = price * 1.06\n    return round(total, 2)\n\nprint(add_tax(100))`,
    prompt: "total 变量最准确的生命周期是什么？",
    correct: "进入 add_tax 栈帧后创建，return 后释放",
    wrongA: "在全局永久存在",
    wrongB: "在 print 调用后才创建",
    correctExplanation: "total 是函数局部变量，属于 add_tax 的调用栈帧。"
  },
  {
    title: "条件与循环",
    concept: "条件决定路径，循环重复执行同一段逻辑，直到迭代结束或条件不满足。",
    points: ["if 选择路径", "for 消费可迭代对象", "break 可提前退出"],
    memoryHook: "条件是岔路，循环是轨道",
    code: `scores = [58, 76, 91]\npassed = []\nfor score in scores:\n    if score >= 60:\n        passed.append(score)\nprint(passed)`,
    prompt: "最终 passed 的值是什么？",
    correct: "[76, 91]",
    wrongA: "[58, 76, 91]",
    wrongB: "True",
    correctExplanation: "只有满足 score >= 60 的元素会进入 passed。"
  },
  {
    title: "异常处理",
    concept: "try/except 把可能失败的路径显式变成可处理分支，避免程序直接中断。",
    points: ["try 包裹风险代码", "except 捕获指定异常", "不要吞掉未知错误"],
    memoryHook: "异常处理是给失败路径修护栏",
    code: `raw = "42px"\ntry:\n    size = int(raw)\nexcept ValueError:\n    size = 0\nprint(size)`,
    prompt: "这段代码为什么输出 0？",
    correct: "int('42px') 触发 ValueError，被 except 转成兜底值",
    wrongA: "Python 会自动提取数字 42",
    wrongB: "except 在 try 成功后也会执行",
    correctExplanation: "转换失败进入 ValueError 分支，所以 size 被设为 0。"
  },
  {
    title: "列表与切片",
    concept: "list 保存有序元素，切片会按范围返回新的列表视图结果。",
    points: ["索引从 0 开始", "切片左闭右开", "切片不会修改原列表"],
    memoryHook: "切片像裁剪，不是撕掉原纸",
    code: `items = ["a", "b", "c", "d"]\nprint(items[1:3], items)`,
    prompt: "输出最可能是什么？",
    correct: "['b', 'c']，原列表保持不变",
    wrongA: "['b', 'c', 'd']，并删除前三项",
    wrongB: "['a', 'b', 'c']，原列表变短",
    correctExplanation: "Python 切片左闭右开，items[1:3] 返回 b 和 c。"
  },
  {
    title: "字典查询",
    concept: "dict 用 key 映射 value，get 可以在 key 不存在时返回默认值。",
    points: ["key 定位 value", "get 提供默认值", "直接索引缺失 key 会报错"],
    memoryHook: "dict 是带索引卡的档案柜",
    code: `user = {"name": "Ada"}\nprint(user.get("role", "learner"))`,
    prompt: "为什么这里适合用 get？",
    correct: "role 可能不存在，get 可以给默认值 learner",
    wrongA: "get 会修改原字典",
    wrongB: "get 只能读取已有 key",
    correctExplanation: "get 在缺失 key 时不会抛错，会返回指定默认值。"
  },
  {
    title: "模块导入",
    concept: "import 会加载模块并暴露其中的函数、类或常量，用于拆分代码职责。",
    points: ["模块是代码边界", "import 复用能力", "标准库减少重复实现"],
    memoryHook: "import 是把工具箱拿到桌面上",
    code: `from pathlib import Path\npath = Path("notes/today.md")\nprint(path.suffix)`,
    prompt: "Path(...).suffix 返回什么？",
    correct: ".md",
    wrongA: "notes/today",
    wrongB: "today.md",
    correctExplanation: "suffix 表示文件后缀名，包含点号。"
  },
  {
    title: "脚本入口",
    concept: "__name__ 可以区分文件是被直接运行还是被当作模块导入。",
    points: ["直接运行时 __name__ 为 __main__", "导入模块时不会自动跑入口", "入口保护便于测试"],
    memoryHook: "__main__ 是脚本的登场灯",
    code: `def main():\n    print("run task")\n\nif __name__ == "__main__":\n    main()`,
    prompt: "入口保护最主要的作用是什么？",
    correct: "直接运行才执行 main，被 import 时不自动执行",
    wrongA: "让函数变成私有函数",
    wrongB: "提高 print 的性能",
    correctExplanation: "入口保护让模块既能被测试导入，也能作为脚本运行。"
  }
];

const courseSeeds: BlueprintCourseSeed[] = [
  {
    courseId: "python",
    stageId: "python-foundations",
    stageLabel: "Python 语法与运行模型",
    runtimeLabel: "Python 3.13",
    fileExtension: "py",
    language: "py",
    visualizerType: "memory-stack",
    sourceTitle: "Python Tutorial",
    sourceUrl: "https://docs.python.org/3/tutorial/",
    lessons: pythonSeeds,
    project: {
      title: "命令行文本清洗器",
      concept: "读取文本、清洗空白、统计词频，并把结果打印成可验证输出。",
      code: `from collections import Counter\nraw = " NodePath  python python  trace "\nwords = raw.strip().lower().split()\ncounts = Counter(words)\nprint(counts.most_common())`,
      prompt: "哪个方案最像一个可靠的文本清洗器？",
      correct: "先 strip/lower/split，再用 Counter 统计",
      wrongA: "只 print 原始字符串",
      wrongB: "只删除所有空格但不统计",
      secondPrompt: "项目完成后最应该验证什么？",
      secondCorrect: "验证输入清洗、词频统计和输出顺序",
      secondWrongA: "只看脚本是否没有语法报错",
      secondWrongB: "只检查文件名是否正确",
      summary: ["文本清洗器把字符串处理、集合统计和脚本入口串成一个闭环。", "Python 入门项目要优先观察数据如何一步步变形。"]
    }
  },
  {
    courseId: "network",
    stageId: "network-url-dns",
    stageLabel: "URL、DNS 与连接建立",
    runtimeLabel: "Browser Network",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "browser-network-debug",
    sourceTitle: "MDN Web Docs: HTTP",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    lessons: [
      ["URL 结构", "URL 由协议、主机、路径、查询和片段组成，浏览器用它决定请求目标。", "const url = new URL('https://api.example.com/tasks?status=open#top');\nconsole.log(url.protocol, url.hostname, url.pathname, url.searchParams.get('status'));"],
      ["DNS 查询", "DNS 把域名解析成可连接的地址，是网络请求的第一段寻址。", "const host = 'api.example.com';\nconsole.log('resolve host', host, '-> edge ip');"],
      ["TCP 握手", "TCP 连接在传输数据前需要建立可靠的双向通道。", "const handshake = ['SYN', 'SYN-ACK', 'ACK'];\nconsole.log(handshake.join(' -> '));"],
      ["TLS 协商", "HTTPS 在 TCP 之上协商加密参数和证书信任。", "const tls = { protocol: 'TLS 1.3', trusted: true };\nconsole.log(tls.protocol, tls.trusted);"],
      ["请求方法", "GET、POST 等方法表达客户端意图，服务端据此选择处理方式。", "const request = { method: 'GET', path: '/tasks' };\nconsole.log(request.method === 'GET' ? 'read' : 'mutate');"],
      ["状态码", "状态码是服务端给客户端的处理结果摘要。", "const status = 404;\nconsole.log(status >= 400 ? 'client/server issue' : 'ok');"],
      ["Headers", "Headers 承载内容类型、认证、缓存和协商元信息。", "const headers = new Headers({ 'content-type': 'application/json' });\nconsole.log(headers.get('content-type'));"],
      ["瀑布流", "Network waterfall 用时间轴展示 DNS、连接、等待和下载耗时。", "const timing = ['dns', 'connect', 'ttfb', 'download'];\nconsole.log(timing.join(' > '));"]
    ].map(([title, concept, code]) => ({
      title,
      concept,
      points: ["请求链路分层观察", "每一层都有可验证输出", "先定位慢在哪一层"],
      memoryHook: "网络请求像接力赛，每一棒都要交接",
      code,
      prompt: `${title}最应该帮助我们判断什么？`,
      correct: "定位请求链路中的具体阶段和责任边界",
      wrongA: "把所有问题都归因到浏览器缓存",
      wrongB: "跳过网络层直接改 UI",
      correctExplanation: `${title}让网络问题从黑盒变成可观察链路。`
    })),
    project: {
      title: "页面加载链路解释器",
      concept: "把 URL、DNS、连接、TLS、请求、响应和瀑布流串成一次页面加载说明。",
      code: `const trace = ['parse URL', 'DNS', 'TCP', 'TLS', 'HTTP GET', '200 HTML'];\nconsole.log(trace.join(' -> '));`,
      prompt: "哪个解释器输出最适合学习网络链路？",
      correct: "按 URL -> DNS -> TCP -> TLS -> HTTP 顺序输出",
      wrongA: "只输出最终 HTML",
      wrongB: "只记录按钮点击事件",
      secondPrompt: "网络阶段项目最关键的复盘指标是什么？",
      secondCorrect: "每一层是否能解释下一层为什么发生",
      secondWrongA: "只看页面颜色是否正确",
      secondWrongB: "只统计 JavaScript 文件数量",
      summary: ["页面加载链路解释器把抽象协议变成可追踪时间线。", "网络调试要先分层，再定位。"]
    }
  },
  {
    courseId: "server-engineering",
    stageId: "server-api-design",
    stageLabel: "API 设计与错误模型",
    runtimeLabel: "Service Runtime",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "service-boundary",
    sourceTitle: "MDN Web Docs: HTTP response status codes",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
    lessons: [
      ["资源建模", "API 资源应该围绕业务名词建模，而不是围绕页面按钮命名。"],
      ["输入校验", "服务端必须验证输入类型、范围和必填字段。"],
      ["错误码设计", "稳定错误码让客户端能明确展示和重试。"],
      ["幂等请求", "重复提交同一请求不应造成重复副作用。"],
      ["分页查询", "分页保护服务和数据库，避免一次返回过多数据。"],
      ["鉴权边界", "认证说明是谁，授权说明能做什么。"],
      ["超时预算", "服务调用必须有超时，避免请求无限悬挂。"],
      ["结构化日志", "日志要带 requestId、用户、动作和结果。"]
    ].map(([title, concept]) => ({
      title,
      concept,
      points: ["输入边界清晰", "输出结构稳定", "错误可被客户端理解"],
      memoryHook: "API 是契约，不是临时函数",
      code: `type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };\nconst result: ApiResult<string[]> = { ok: true, data: ['task-1'] };\nconsole.log(result.ok ? result.data.length : result.error.code);`,
      prompt: `${title}的工程价值是什么？`,
      correct: "让客户端和服务端围绕稳定契约协作",
      wrongA: "让接口路径越短越好",
      wrongB: "只要数据库能查出来就够",
      correctExplanation: `${title}服务的是长期可维护 API 契约。`
    })),
    project: {
      title: "任务 API 设计复盘",
      concept: "设计任务查询、创建、错误返回和幂等键，让 API 可以被前端稳定消费。",
      code: `const response = { ok: false, error: { code: 'TASK_TITLE_REQUIRED', message: '标题不能为空' } };\nconsole.log(response.error.code);`,
      prompt: "哪个 API 方案更适合阶段项目？",
      correct: "统一 success/error 结构，并给错误码",
      wrongA: "所有错误都返回 200 和字符串",
      wrongB: "客户端自己猜错误原因",
      secondPrompt: "复盘任务 API 时最应该看什么？",
      secondCorrect: "输入校验、错误模型和客户端处理是否闭环",
      secondWrongA: "只看接口名字是否好听",
      secondWrongB: "只看数据库表字段数量",
      summary: ["任务 API 项目把资源建模、校验和错误模型连成服务契约。", "服务端工程的第一课是把边界说清楚。"]
    }
  },
  {
    courseId: "android",
    stageId: "android-app-foundations",
    stageLabel: "App 基础与生命周期",
    runtimeLabel: "Android Runtime",
    fileExtension: "kt",
    language: "kt",
    visualizerType: "android-system-trace",
    sourceTitle: "Android Developers: App fundamentals",
    sourceUrl: "https://developer.android.com/guide/components/fundamentals",
    lessons: [
      ["Activity 生命周期", "Activity 会在创建、启动、恢复、暂停和销毁之间流转。"],
      ["Intent 跳转", "Intent 描述要执行的动作和目标组件。"],
      ["Manifest 声明", "Manifest 声明组件、权限和应用入口。"],
      ["资源系统", "资源文件让布局、字符串和图片与代码解耦。"],
      ["权限模型", "敏感能力需要在 Manifest 和运行时授权。"],
      ["ViewModel 边界", "ViewModel 保存 UI 状态，避免配置变化丢失数据。"],
      ["主线程", "UI 更新必须在主线程，耗时任务不能阻塞它。"],
      ["日志定位", "Logcat 用标签和级别追踪 App 运行过程。"]
    ].map(([title, concept]) => ({
      title,
      concept,
      points: ["组件状态可追踪", "系统回调驱动运行", "跨层边界要清楚"],
      memoryHook: "Android 像剧场，系统导演组件登场退场",
      code: `class MainActivity : Activity() {\n  override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    Log.d("NodePath", "${title}")\n  }\n}`,
      prompt: `${title}最适合放进哪种心智模型？`,
      correct: "系统回调驱动的组件生命周期",
      wrongA: "一次性 main 函数顺序执行",
      wrongB: "浏览器 DOM 事件冒泡",
      correctExplanation: `${title}需要从 Android 系统回调和组件状态理解。`
    })),
    project: {
      title: "启动流程诊断器",
      concept: "观察 Activity 创建、资源加载、权限检查和首屏日志，解释 App 为什么能启动。",
      code: `val events = listOf("Launcher", "Activity.onCreate", "inflate layout", "first frame")\nprintln(events.joinToString(" -> "))`,
      prompt: "启动诊断器应该优先记录什么？",
      correct: "Launcher 到 first frame 的组件生命周期事件",
      wrongA: "只记录按钮点击次数",
      wrongB: "只输出应用包名",
      secondPrompt: "Android 首阶段项目的验证重点是什么？",
      secondCorrect: "生命周期、资源和首帧输出是否连贯",
      secondWrongA: "只看图标是否存在",
      secondWrongB: "只看 Kotlin 文件行数",
      summary: ["启动流程诊断器把 App 基础知识串成系统调用链。", "Android 学习要从组件生命周期进入系统视角。"]
    }
  },
  {
    courseId: "ai-application",
    stageId: "ai-app-prompt-rag",
    stageLabel: "Prompt 与 RAG",
    runtimeLabel: "AI App Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs",
    sourceUrl: "https://platform.openai.com/docs",
    lessons: [
      ["Prompt 结构", "清晰的角色、任务、约束和输出格式能减少模型歧义。"],
      ["结构化输出", "应用层应要求模型返回可解析结构，而不是自由文本。"],
      ["文档切分", "RAG 先把长文档切成可检索片段。"],
      ["向量检索", "检索用语义相似度找到相关上下文。"],
      ["召回与重排", "召回取候选，重排提升最终上下文质量。"],
      ["上下文预算", "上下文窗口有限，需要选择最有用的信息。"],
      ["工具调用", "模型可以选择工具，但参数必须由应用校验。"],
      ["评测样本", "AI 应用要用固定样本回归验证效果。"]
    ].map(([title, concept]) => ({
      title,
      concept,
      points: ["输入要明确", "上下文要可追踪", "输出要可验证"],
      memoryHook: "AI 应用是模型加工程护栏",
      code: `const request = { task: "${title}", output: "json", guardrail: true };\nconsole.log(request.task, request.output);`,
      prompt: `${title}对 AI 应用最重要的作用是什么？`,
      correct: "降低不确定性，让模型输出可验证",
      wrongA: "让模型完全不需要上下文",
      wrongB: "绕过应用层校验",
      correctExplanation: `${title}让 AI 能力进入可控的工程流程。`
    })),
    project: {
      title: "知识库问答诊断",
      concept: "从用户问题出发，检索文档、组装上下文、生成结构化答案并记录依据。",
      code: `const answer = { claim: "NodePath uses authored traces", citations: ["lesson-registry"], confidence: 0.82 };\nconsole.log(JSON.stringify(answer));`,
      prompt: "知识库问答最可靠的输出是什么？",
      correct: "答案、引用来源和置信度一起返回",
      wrongA: "只返回一句看似流畅的话",
      wrongB: "让模型编造不存在的来源",
      secondPrompt: "RAG 项目最应该复盘哪条链路？",
      secondCorrect: "问题 -> 检索 -> 上下文 -> 答案 -> 引用",
      secondWrongA: "只看回答字数多不多",
      secondWrongB: "只调大温度参数",
      summary: ["知识库问答诊断把 Prompt、检索和结构化输出连成闭环。", "AI 应用开发的核心是可控和可评测。"]
    }
  },
  {
    courseId: "ai-agent",
    stageId: "ai-agent-loop-planning",
    stageLabel: "观察-计划-行动循环",
    runtimeLabel: "Agent Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs: Agents",
    sourceUrl: "https://platform.openai.com/docs/guides/agents",
    lessons: [
      ["Observe 观察", "Agent 首先把环境、任务和约束转成可处理状态。"],
      ["Plan 计划", "计划把目标拆成可执行步骤。"],
      ["Act 行动", "行动阶段调用工具或产出中间结果。"],
      ["Reflect 反思", "反思检查结果是否满足目标，并决定是否修正。"],
      ["工具选择", "Agent 应根据任务选择最小必要工具。"],
      ["参数构造", "工具参数必须来自已知上下文和校验规则。"],
      ["失败恢复", "工具失败后要读取错误并选择恢复路径。"],
      ["Trace 复盘", "完整 Trace 让人能审查 Agent 为什么这么做。"]
    ].map(([title, concept]) => ({
      title,
      concept,
      points: ["状态显式化", "步骤可审查", "失败可恢复"],
      memoryHook: "Agent 不是魔法，是循环和记录",
      code: `const trace = ["observe", "plan", "act", "reflect"];\nconsole.log(trace.includes("${title.split(" ")[0].toLowerCase()}") ? "focus" : "loop");`,
      prompt: `${title}在 Agent 中解决什么问题？`,
      correct: "让任务执行过程可拆解、可追踪",
      wrongA: "让 Agent 跳过上下文",
      wrongB: "让工具不需要参数",
      correctExplanation: `${title}是 Agent 循环中可审查的一环。`
    })),
    project: {
      title: "Agent Trace 复盘",
      concept: "复盘一个 Agent 从观察任务、规划步骤、调用工具到反思结果的完整过程。",
      code: `const trace = [{ step: "observe" }, { step: "plan" }, { step: "act" }, { step: "reflect" }];\nconsole.log(trace.map((item) => item.step).join(" -> "));`,
      prompt: "哪个 Trace 最适合阶段项目复盘？",
      correct: "包含 observe、plan、act、reflect 和每步证据",
      wrongA: "只保存最终答案",
      wrongB: "只保存工具名称",
      secondPrompt: "Agent 项目的核心验收标准是什么？",
      secondCorrect: "人能沿 Trace 解释每个行动原因",
      secondWrongA: "答案越长越好",
      secondWrongB: "工具调用越多越好",
      summary: ["Agent Trace 复盘让循环、工具和反思变得透明。", "学习 Agent 要优先看过程，而不是只看最终答案。"]
    }
  },
  {
    courseId: "ai-math",
    stageId: "ai-math-linear-algebra",
    stageLabel: "线性代数与向量空间",
    runtimeLabel: "Math Graph Lab",
    fileExtension: "math",
    language: "math",
    visualizerType: "math-graph-lab",
    sourceTitle: "Khan Academy: Linear algebra",
    sourceUrl: "https://www.khanacademy.org/math/linear-algebra",
    lessons: [
      ["向量表示", "向量可以表示方向、大小，也可以表示特征空间中的点。"],
      ["向量加法", "向量加法可以理解为位移的连续叠加。"],
      ["点积", "点积衡量两个向量方向的一致程度。"],
      ["矩阵乘法", "矩阵乘法表示一组线性变换的组合。"],
      ["线性变换", "线性变换保持网格线平行和原点固定。"],
      ["基向量", "基向量定义坐标系，变化基会改变表示方式。"],
      ["特征向量", "特征向量在线性变换后只缩放不转向。"],
      ["Embedding", "Embedding 把离散 token 映射到连续向量空间。"]
    ].map(([title, concept]) => ({
      title,
      concept,
      points: ["用几何看公式", "用变换看矩阵", "用空间看模型"],
      memoryHook: "AI 数学先画出来，再算出来",
      code: `v = [2, 1]\nw = [1, 3]\nscore = dot(v, w)\nshow(score)`,
      prompt: `${title}最适合怎样记忆？`,
      correct: "把公式对应到空间里的方向、长度或变换",
      wrongA: "只背符号不看图形",
      wrongB: "把所有矩阵都当普通数字",
      correctExplanation: `${title}需要建立几何直觉，才能服务后续 AI 模型理解。`
    })),
    project: {
      title: "二维变换实验室",
      concept: "观察向量经过矩阵变换后的方向、长度和网格变化。",
      code: `matrix = [[1, 1], [0, 1]]\nvector = [2, 1]\nresult = multiply(matrix, vector)\nshow(result)`,
      prompt: "二维变换实验室应该展示什么？",
      correct: "矩阵如何改变向量和网格",
      wrongA: "只显示公式名称",
      wrongB: "只输出随机数",
      secondPrompt: "AI 数学阶段项目最重要的反馈是什么？",
      secondCorrect: "公式、图形和结果能互相解释",
      secondWrongA: "只看最终分数",
      secondWrongB: "只追求动画复杂",
      summary: ["二维变换实验室把向量、矩阵和线性变换合成可视化直觉。", "AI 数学学习应优先形成空间感。"]
    }
  }
];

type SecondStageInput = {
  courseId: CourseId;
  stageId: StageId;
  stageLabel: string;
  runtimeLabel: string;
  fileExtension: string;
  language: CodeLanguage;
  visualizerType: VisualizerType;
  sourceTitle: string;
  sourceUrl: string;
  lessonTitles: readonly string[];
  projectTitle: string;
  projectConcept: string;
};

function createSecondStageCourse(input: SecondStageInput): BlueprintCourseSeed {
  return {
    courseId: input.courseId,
    stageId: input.stageId,
    stageLabel: input.stageLabel,
    runtimeLabel: input.runtimeLabel,
    fileExtension: input.fileExtension,
    language: input.language,
    visualizerType: input.visualizerType,
    sourceTitle: input.sourceTitle,
    sourceUrl: input.sourceUrl,
    lessons: input.lessonTitles.map((title, index) => ({
      title,
      concept: `${title}是 ${input.stageLabel} 的关键学习点，重点训练学习者把概念、案例和运行反馈连成稳定判断。`,
      points: [`识别${title}的输入边界`, `观察${title}的运行状态`, `用输出验证${title}的结论`],
      memoryHook: `${input.stageLabel}像第二圈轨道，${title}负责补强工程判断`,
      code: createSecondStageCode(input, title, index),
      prompt: `${title}最应该帮助学习者建立什么能力？`,
      correct: "把局部知识点放回完整运行链路中验证",
      wrongA: "只记住术语名称，不观察输入输出",
      wrongB: "跳过案例，直接背最终结论",
      correctExplanation: `${title}需要通过案例运行和可视化反馈建立可迁移的判断。`
    })),
    project: {
      title: input.projectTitle,
      concept: input.projectConcept,
      code: createSecondStageProjectCode(input),
      prompt: `${input.projectTitle}最应该采用哪个实现方向？`,
      correct: "组合本阶段知识点，并输出可验证的运行摘要",
      wrongA: "只复用第一节课的局部代码",
      wrongB: "只写总结，不提供运行反馈",
      secondPrompt: `${input.projectTitle}完成后应该如何复盘？`,
      secondCorrect: "检查输入、关键状态、输出和错误路径是否闭环",
      secondWrongA: "只看是否出现绿色成功提示",
      secondWrongB: "只统计代码行数",
      summary: [`${input.projectTitle}把 ${input.stageLabel} 的知识点合成为一个阶段项目。`, "P2 阶段项目强调持续学习：能继续做、能验证、能复盘。"]
    }
  };
}

function createSecondStageCode(input: SecondStageInput, title: string, index: number): string {
  if (input.language === "py") {
    return `topic = "${title}"\nsteps = ["input", "model", "verify"]\nprint(topic, steps[${index % 3}])`;
  }

  if (input.language === "kt") {
    return `val topic = "${title}"\nval steps = listOf("input", "model", "verify")\nprintln("$topic -> \${steps[${index % 3}]}")`;
  }

  if (input.language === "math") {
    return `topic = "${title}"\nvector = [${index + 1}, ${index + 2}]\nshow(topic, vector)`;
  }

  return `const topic = "${title}";\nconst steps = ["input", "model", "verify"];\nconsole.log(topic, steps[${index % 3}]);`;
}

function createSecondStageProjectCode(input: SecondStageInput): string {
  if (input.language === "py") {
    return `project = "${input.projectTitle}"\nresult = {"stage": "${input.stageLabel}", "status": "verified"}\nprint(project, result["status"])`;
  }

  if (input.language === "kt") {
    return `val project = "${input.projectTitle}"\nval result = mapOf("stage" to "${input.stageLabel}", "status" to "verified")\nprintln("$project -> \${result["status"]}")`;
  }

  if (input.language === "math") {
    return `project = "${input.projectTitle}"\nresult = transform(input_space, output_space)\nshow(project, result)`;
  }

  return `const project = "${input.projectTitle}";\nconst result = { stage: "${input.stageLabel}", status: "verified" };\nconsole.log(project, result.status);`;
}

const secondStageCourseSeeds: BlueprintCourseSeed[] = [
  createSecondStageCourse({
    courseId: "python",
    stageId: "python-data-structures",
    stageLabel: "Python 数据结构与标准库",
    runtimeLabel: "Python 3.13",
    fileExtension: "py",
    language: "py",
    visualizerType: "memory-stack",
    sourceTitle: "Python Standard Library",
    sourceUrl: "https://docs.python.org/3/library/",
    lessonTitles: ["list 与切片", "dict 查询与更新", "set 去重", "tuple 与不可变数据", "迭代器协议", "列表推导式", "pathlib 文件路径", "json 序列化"],
    projectTitle: "日志聚合统计器",
    projectConcept: "读取日志行、解析字段、按状态聚合数量，并输出可检查的统计摘要。"
  }),
  createSecondStageCourse({
    courseId: "network",
    stageId: "network-http-cache",
    stageLabel: "HTTP 与缓存",
    runtimeLabel: "Browser Network",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "browser-network-debug",
    sourceTitle: "MDN Web Docs: HTTP caching",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching",
    lessonTitles: ["HTTP 请求响应", "状态码诊断", "Content-Type", "Cookie", "Cache-Control", "ETag", "协商缓存", "缓存失效"],
    projectTitle: "缓存命中调试面板",
    projectConcept: "观察请求头、响应头和缓存状态，判断一次资源加载为什么命中或重新请求。"
  }),
  createSecondStageCourse({
    courseId: "server-engineering",
    stageId: "server-database-cache",
    stageLabel: "数据库、事务与缓存",
    runtimeLabel: "Service Runtime",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "service-boundary",
    sourceTitle: "PostgreSQL Documentation",
    sourceUrl: "https://www.postgresql.org/docs/",
    lessonTitles: ["索引选择", "查询过滤", "事务边界", "连接池", "缓存读取", "缓存失效", "迁移脚本", "一致性复盘"],
    projectTitle: "库存缓存一致性修复",
    projectConcept: "用事务更新库存，并让缓存失效与重新读取过程可观察。"
  }),
  createSecondStageCourse({
    courseId: "android",
    stageId: "android-jetpack-compose",
    stageLabel: "Jetpack 与 Compose",
    runtimeLabel: "Android Runtime",
    fileExtension: "kt",
    language: "kt",
    visualizerType: "android-system-trace",
    sourceTitle: "Android Developers: Jetpack Compose",
    sourceUrl: "https://developer.android.com/compose",
    lessonTitles: ["Composable 函数", "State 提升", "ViewModel 边界", "重组触发", "remember", "LazyColumn", "Navigation", "副作用处理"],
    projectTitle: "状态错乱修复任务",
    projectConcept: "定位 UI 状态错乱原因，把状态提升到稳定边界并验证重组结果。"
  }),
  createSecondStageCourse({
    courseId: "ai-application",
    stageId: "ai-app-tools-workflows",
    stageLabel: "工具调用与工作流",
    runtimeLabel: "AI App Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs: Tools",
    sourceUrl: "https://platform.openai.com/docs/guides/tools",
    lessonTitles: ["工具 Schema", "参数校验", "工具选择", "结果解析", "工作流节点", "错误重试", "权限边界", "审计日志"],
    projectTitle: "工具调用排障台",
    projectConcept: "记录模型选择工具、构造参数、接收结果和处理失败的完整链路。"
  }),
  createSecondStageCourse({
    courseId: "ai-agent",
    stageId: "ai-agent-memory-tools",
    stageLabel: "记忆与工具使用",
    runtimeLabel: "Agent Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs: Agents",
    sourceUrl: "https://platform.openai.com/docs/guides/agents",
    lessonTitles: ["短期记忆", "长期记忆", "检索记忆", "记忆更新", "工具选择", "参数构造", "工具失败", "记忆命中复盘"],
    projectTitle: "记忆命中调试",
    projectConcept: "观察 Agent 如何从记忆中取证据、选择工具，并在失败后修正。"
  }),
  createSecondStageCourse({
    courseId: "ai-math",
    stageId: "ai-math-probability-calculus",
    stageLabel: "概率统计与微积分",
    runtimeLabel: "Math Graph Lab",
    fileExtension: "math",
    language: "math",
    visualizerType: "math-graph-lab",
    sourceTitle: "Khan Academy: Probability and statistics",
    sourceUrl: "https://www.khanacademy.org/math/statistics-probability",
    lessonTitles: ["概率分布", "期望", "方差", "条件概率", "导数直觉", "链式法则", "梯度方向", "损失曲线"],
    projectTitle: "损失曲线解释器",
    projectConcept: "把损失函数、梯度方向和参数更新画成可解释的曲线变化。"
  })
];

const thirdStageCourseSeeds: BlueprintCourseSeed[] = [
  createSecondStageCourse({
    courseId: "python",
    stageId: "python-modules-testing",
    stageLabel: "Python 模块、包与测试",
    runtimeLabel: "Python 3.13",
    fileExtension: "py",
    language: "py",
    visualizerType: "memory-stack",
    sourceTitle: "Python Packaging User Guide",
    sourceUrl: "https://packaging.python.org/",
    lessonTitles: ["模块解析", "包结构", "虚拟环境", "依赖锁定", "pytest 断言", "fixture", "参数化测试", "可维护项目结构"],
    projectTitle: "可测试配置解析器",
    projectConcept: "把配置读取、默认值、异常路径和 pytest 验证组织成一个可维护的小型 Python 包。"
  }),
  createSecondStageCourse({
    courseId: "network",
    stageId: "network-security-realtime",
    stageLabel: "安全与实时连接",
    runtimeLabel: "Browser Network",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "browser-network-debug",
    sourceTitle: "MDN Web Docs: CORS",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
    lessonTitles: ["CORS 预检", "Cookie 与 SameSite", "CSRF 防护", "Token 携带", "WebSocket 握手", "SSE 重连", "心跳检测", "实时链路降级"],
    projectTitle: "实时通知链路诊断",
    projectConcept: "观察跨域请求、认证凭据、WebSocket 握手和 SSE 降级，判断实时通知为什么成功或失败。"
  }),
  createSecondStageCourse({
    courseId: "server-engineering",
    stageId: "server-queue-observability",
    stageLabel: "队列与可观测性",
    runtimeLabel: "Service Runtime",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "service-boundary",
    sourceTitle: "OpenTelemetry Documentation",
    sourceUrl: "https://opentelemetry.io/docs/",
    lessonTitles: ["消息投递", "消费确认", "死信队列", "重试退避", "结构化日志", "指标采样", "Trace Span", "任务链路复盘"],
    projectTitle: "订单任务追踪器",
    projectConcept: "把订单创建、消息投递、消费确认、重试和 Trace Span 串成一条可观测任务链路。"
  }),
  createSecondStageCourse({
    courseId: "android",
    stageId: "android-framework-binder",
    stageLabel: "Framework 与 Binder",
    runtimeLabel: "Android Runtime",
    fileExtension: "kt",
    language: "kt",
    visualizerType: "android-system-trace",
    sourceTitle: "Android Developers: AIDL",
    sourceUrl: "https://source.android.com/docs/core/architecture/aidl",
    lessonTitles: ["System Service", "Binder 调用", "AIDL 接口", "AMS 启动链", "WMS 窗口链路", "PMS 查询", "跨进程异常", "调用链追踪"],
    projectTitle: "跨进程调用链追踪",
    projectConcept: "把应用请求、Binder 代理、系统服务和异常返回画成一条可解释的 Android Framework 调用链。"
  }),
  createSecondStageCourse({
    courseId: "ai-application",
    stageId: "ai-app-multimodal-eval",
    stageLabel: "多模态与评测",
    runtimeLabel: "AI App Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs: Evals",
    sourceUrl: "https://platform.openai.com/docs/guides/evals",
    lessonTitles: ["图像输入", "文本图像对齐", "结构化输出", "样本集设计", "人工标注", "自动评分", "回归对比", "评测报告"],
    projectTitle: "多模态结果评测",
    projectConcept: "用固定样本集比较多模态输入、结构化输出和评分结果，形成可回归的 AI 应用评测报告。"
  }),
  createSecondStageCourse({
    courseId: "ai-agent",
    stageId: "ai-agent-multi-agent",
    stageLabel: "多 Agent 协作",
    runtimeLabel: "Agent Trace",
    fileExtension: "ts",
    language: "ts",
    visualizerType: "agent-trace",
    sourceTitle: "OpenAI Docs: Agents",
    sourceUrl: "https://platform.openai.com/docs/guides/agents",
    lessonTitles: ["Planner 角色", "Executor 角色", "Reviewer 角色", "任务树拆分", "消息协议", "共享记忆", "冲突解决", "协作复盘"],
    projectTitle: "多 Agent 协作复盘",
    projectConcept: "把 Planner、Executor、Reviewer 的消息、共享记忆和冲突解决过程整理成可审查协作 Trace。"
  }),
  createSecondStageCourse({
    courseId: "ai-math",
    stageId: "ai-math-optimization",
    stageLabel: "优化方法",
    runtimeLabel: "Math Graph Lab",
    fileExtension: "math",
    language: "math",
    visualizerType: "math-graph-lab",
    sourceTitle: "Khan Academy: Multivariable calculus",
    sourceUrl: "https://www.khanacademy.org/math/multivariable-calculus",
    lessonTitles: ["损失函数", "梯度下降", "学习率", "动量", "正则化", "过拟合", "验证集", "优化路径可视化"],
    projectTitle: "梯度下降可视化",
    projectConcept: "在二维曲面上观察损失、梯度方向、学习率和验证集指标如何共同决定优化路径。"
  })
];

export const blueprintFirstStageLessons = [
  ...courseSeeds.flatMap(createCourseLessons),
  ...secondStageCourseSeeds.flatMap(createCourseLessons),
  ...thirdStageCourseSeeds.flatMap(createCourseLessons)
] satisfies LessonSpec[];
