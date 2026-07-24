import type { LessonSpec } from "../../../lib/curriculum/types";
import { createAiAgentLesson, createAiAgentStageProject } from "./ai-agent-lesson-factory";

const eyebrow = "多模态与代码执行";

const knowledgeLessons: LessonSpec[] = [
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-vision-input",
    stageId: "ai-agent-multimodal-execution",
    order: 1,
    eyebrowStage: eyebrow,
    title: "图像输入与视觉理解",
    concept:
      "GPT-4o / Claude 3.5 支持在 `messages.content` 中混入 `image_url` 或 base64 图像。Agent 用它读截图、识别图表、抽取表格。图像越大 token 越贵，需要在客户端先压缩再上传。",
    points: [
      "content 用数组混合 text 与 image_url",
      "远程 URL 与 data:image/png;base64,... 两种传法",
      "先压缩再上传，控制 token 与延迟"
    ],
    memoryHook: "多模态输入 = text + image_url 数组",
    fileName: "vision-input.ts",
    code: `import OpenAI from "openai";

const openai = new OpenAI();

async function analyzeScreenshot(dataUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "描述这张截图并列出所有按钮文本" },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } }
        ]
      }
    ]
  });
  return response.choices[0].message.content;
}

const summary = await analyzeScreenshot("data:image/png;base64,iVBORw0KGgo...");
console.log(summary);`,
    prompt: "把图像传给 GPT-4o 时最关键的做法是什么？",
    correct: "在 content 数组里混合 text 与 image_url，并按需压缩控制 token",
    wrong: "只能通过 file upload API 上传图像，不能在 messages 里传",
    correctFeedback: "正确：Vision 接口就是 messages.content 里的多类型数组，本地图用 data URL 即可。",
    wrongFeedback: "错误：Vision 支持 https URL 与 data URL 两种直接传法，无需先走 file upload。",
    additionalWrong: {
      label: "把整张 4K 截图原样发送，Agent 才能看清所有细节",
      feedback: "原样发送会浪费大量 token，先按最长边压缩到 1024-2048 就足以识别 UI。"
    },
    output: "已识别 6 个按钮：登录/注册/搜索/购物车/我的/客服",
    lanes: ["构造消息", "调用 Vision", "解析结果"],
    laneValues: ["text + image_url", "gpt-4o 分析", "输出按钮列表"],
    log: [
      "组装 content 数组",
      "POST chat.completions",
      "已识别 6 个按钮：登录/注册/搜索/购物车/我的/客服"
    ],
    summary: [
      "content 支持 text 与 image_url 混排",
      "data URL 免上传适合本地截图",
      "detail: 'high' 增加 token 也提高识别率"
    ],
    sourceTitle: "OpenAI Vision Guide",
    sourceUrl: "https://platform.openai.com/docs/guides/vision"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-audio-transcription",
    stageId: "ai-agent-multimodal-execution",
    order: 2,
    eyebrowStage: eyebrow,
    title: "音频转录与生成",
    concept:
      "Whisper (`audio.transcriptions.create`) 把音频转成文本；TTS (`audio.speech.create`) 把文本转成语音。二者串联即可构建语音 Agent：STT → LLM → TTS。长音频要先切片再逐段转录。",
    points: [
      "Whisper 支持多语言自动识别",
      "TTS 支持 mp3 / opus / wav 等格式",
      "长音频先切片再合并转录结果"
    ],
    memoryHook: "语音 Agent = STT → LLM → TTS 三段闭环",
    fileName: "audio-transcription.ts",
    code: `import OpenAI from "openai";
import fs from "node:fs";

const openai = new OpenAI();

async function voiceAgent(audioPath: string) {
  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1"
  });

  const reply = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: transcript.text }]
  });

  const speech = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: reply.choices[0].message.content ?? ""
  });

  const buffer = Buffer.from(await speech.arrayBuffer());
  fs.writeFileSync("reply.mp3", buffer);
  return transcript.text;
}

const heard = await voiceAgent("question.mp3");
console.log("用户说：", heard);`,
    prompt: "构建语音 Agent 的三段闭环是什么？",
    correct: "Whisper 转录 → LLM 生成回复 → TTS 合成语音",
    wrong: "只用 Whisper 一步就能同时完成转录和语音回复",
    correctFeedback: "正确：Whisper 只做 STT，回复要用 LLM，语音要用 TTS，三者分工明确。",
    wrongFeedback: "错误：Whisper 只做语音→文本，无法生成语音，也不会写回复。",
    additionalWrong: {
      label: "把 1 小时录音一次性丢给 Whisper 最省事",
      feedback: "Whisper 单文件有 25MB 上限，长音频要按静音点切片后并行转录再合并。"
    },
    output: "用户说：帮我总结昨天的会议要点",
    lanes: ["音频转文本", "LLM 生成", "文本转音频"],
    laneValues: ["whisper-1", "gpt-4o-mini", "tts-1 alloy"],
    log: [
      "上传 question.mp3",
      "调用 gpt-4o-mini 生成回复",
      "用户说：帮我总结昨天的会议要点"
    ],
    summary: [
      "Whisper 负责 STT",
      "TTS 负责合成语音",
      "长音频先按静音切片再串行/并行处理"
    ],
    sourceTitle: "OpenAI Speech-to-Text",
    sourceUrl: "https://platform.openai.com/docs/guides/speech-to-text"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-code-sandbox",
    stageId: "ai-agent-multimodal-execution",
    order: 3,
    eyebrowStage: eyebrow,
    title: "代码执行沙箱",
    concept:
      "让 LLM 生成的代码直接跑在主机上会带来 RCE 风险。用 e2b / Riza / Docker gVisor 隔离运行，限制 CPU、内存、网络与文件系统。沙箱应短生命周期，任务完成立即销毁。",
    points: [
      "沙箱按任务创建，用完即毁",
      "限制 CPU / 内存 / 网络出口",
      "只把结果和 stdout 回传给 Agent"
    ],
    memoryHook: "沙箱是 Agent 代码执行的安全边界",
    fileName: "code-sandbox.ts",
    code: `import { Sandbox } from "@e2b/code-interpreter";

async function runGeneratedCode(pythonCode: string) {
  const sandbox = await Sandbox.create({ timeoutMs: 60_000 });
  try {
    const execution = await sandbox.runCode(pythonCode);
    if (execution.error) {
      return { ok: false, error: execution.error.value };
    }
    return {
      ok: true,
      stdout: execution.logs.stdout.join(""),
      result: execution.results[0]?.text ?? null
    };
  } finally {
    await sandbox.kill();
  }
}

const result = await runGeneratedCode("import pandas as pd\\nprint(pd.__version__)");
console.log(result);`,
    prompt: "为什么执行 LLM 生成的代码必须走沙箱？",
    correct: "隔离 CPU、内存、网络与文件系统，防止 RCE 或越权访问",
    wrong: "沙箱只是为了让执行速度更快，安全性无关",
    correctFeedback: "正确：LLM 生成的代码可能读文件、发请求、装恶意包，必须限制资源与权限。",
    wrongFeedback: "错误：沙箱通常比裸执行更慢，它的价值在安全隔离而不是性能。",
    additionalWrong: {
      label: "沙箱可以长期常驻，反复复用即可",
      feedback: "长驻沙箱会积累状态被后续任务污染；每次任务后 kill 才是最小信任。"
    },
    output: "{ ok: true, stdout: '2.2.2\\n', result: null }",
    lanes: ["创建沙箱", "运行代码", "销毁沙箱"],
    laneValues: ["Sandbox.create", "runCode", "sandbox.kill"],
    log: [
      "沙箱启动，超时 60s",
      "执行 pandas 版本查询",
      "{ ok: true, stdout: '2.2.2\\n', result: null }"
    ],
    summary: [
      "沙箱按任务短生命周期",
      "限制 CPU/内存/网络三件套",
      "finally 兜底 kill 防止泄漏"
    ],
    sourceTitle: "E2B Code Interpreter Docs",
    sourceUrl: "https://e2b.dev/docs"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-file-io",
    stageId: "ai-agent-multimodal-execution",
    order: 4,
    eyebrowStage: eyebrow,
    title: "文件读写操作",
    concept:
      "Agent 读写文件必须限定在工作目录内。用 `path.resolve` + 前缀校验防路径穿越（`../../etc/passwd`），写入前做备份，敏感目录只读挂载。所有路径参数都要经过白名单校验。",
    points: [
      "path.resolve 归一化后校验前缀",
      "写入前备份原文件",
      "只允许白名单目录，禁止绝对路径参数"
    ],
    memoryHook: "任何文件路径都要 resolve + 前缀校验",
    fileName: "file-io.ts",
    code: `import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE = path.resolve("./agent-workspace");

function safeResolve(userPath: string): string {
  const resolved = path.resolve(WORKSPACE, userPath);
  if (!resolved.startsWith(WORKSPACE + path.sep) && resolved !== WORKSPACE) {
    throw new Error(\`路径越界: \${userPath}\`);
  }
  return resolved;
}

export async function agentWriteFile(userPath: string, content: string) {
  const target = safeResolve(userPath);
  try {
    const original = await fs.readFile(target, "utf-8");
    await fs.writeFile(target + ".bak", original);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  await fs.writeFile(target, content, "utf-8");
  return target;
}

const saved = await agentWriteFile("notes/plan.md", "# 计划");
console.log("已写入", saved);`,
    prompt: "防止 Agent 路径穿越最可靠的做法是什么？",
    correct: "path.resolve 归一化后，校验结果必须以工作目录为前缀",
    wrong: "只要在写入前用 replace 把 '..' 去掉就安全",
    correctFeedback: "正确：resolve 会展开所有 ..、软链和符号，再比前缀才是可靠边界。",
    wrongFeedback: "错误：字符串 replace 处理 '..' 会被 URL 编码、软链、混合分隔符轻易绕过。",
    additionalWrong: {
      label: "写入前不用备份，出错 Agent 会自己重建",
      feedback: "覆盖写是不可逆的，Agent 幻觉可能一次抹掉重要文件，必须先备份。"
    },
    output: "已写入 /workspace/agent-workspace/notes/plan.md",
    lanes: ["解析路径", "备份原文件", "写入新内容"],
    laneValues: ["safeResolve", "读旧文件 → .bak", "fs.writeFile"],
    log: [
      "resolve 得到工作区内路径",
      "备份原文件到 plan.md.bak",
      "已写入 /workspace/agent-workspace/notes/plan.md"
    ],
    summary: [
      "path.resolve + startsWith 是防穿越标配",
      "写入前备份留后悔药",
      "只允许白名单目录参数"
    ],
    sourceTitle: "Node.js fs.promises",
    sourceUrl: "https://nodejs.org/api/fs.html#promises-api"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-browser-automation",
    stageId: "ai-agent-multimodal-execution",
    order: 5,
    eyebrowStage: eyebrow,
    title: "Web 浏览器操作",
    concept:
      "Playwright 让 Agent 浏览网页、填表、截图。可以先取可访问性树（`accessibility.snapshot`）交给 LLM 推断元素，再用 `locator` 精准点击。截图配合视觉模型可以处理不规范 UI。",
    points: [
      "accessibility.snapshot 提供结构化 DOM",
      "locator 优先，避免脆弱的 XPath",
      "截图 + 视觉模型兜底非标准 UI"
    ],
    memoryHook: "Playwright 是 Agent 的浏览器手臂",
    fileName: "browser-automation.ts",
    code: `import { chromium } from "playwright";

async function fillLoginForm(url: string, user: string, pass: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByLabel("用户名").fill(user);
    await page.getByLabel("密码").fill(pass);
    await page.getByRole("button", { name: "登录" }).click();
    await page.waitForURL(/dashboard/);
    const shot = await page.screenshot({ fullPage: true });
    return { ok: true, screenshot: shot.toString("base64").slice(0, 32) + "..." };
  } finally {
    await browser.close();
  }
}

console.log(await fillLoginForm("https://example.com/login", "demo", "demo"));`,
    prompt: "让 Agent 操作浏览器最稳的选择器策略是什么？",
    correct: "优先使用 getByRole / getByLabel 语义化 locator，截图 + 视觉模型兜底",
    wrong: "直接用绝对 XPath 定位，速度最快最稳定",
    correctFeedback: "正确：语义化 locator 抗 DOM 变化，视觉兜底应对非标准站点。",
    wrongFeedback: "错误：绝对 XPath 一旦页面重排就全部失效，是最脆弱的选择器策略。",
    additionalWrong: {
      label: "共用一个 browser 实例跑所有任务，性能最高",
      feedback: "多任务共享 browser 会串号 cookie 与登录态；应按会话隔离 context。"
    },
    output: "{ ok: true, screenshot: 'iVBORw0KGgoAAAANSUhEUgAA...' }",
    lanes: ["启动浏览器", "填表提交", "截图收尾"],
    laneValues: ["chromium.launch", "getByLabel + click", "screenshot 落地"],
    log: [
      "启动 headless chromium",
      "填写用户名/密码并点击登录",
      "{ ok: true, screenshot: 'iVBORw0KGgoAAAANSUhEUgAA...' }"
    ],
    summary: [
      "getByRole/getByLabel 抗 DOM 变化",
      "waitForURL 判定导航结束",
      "finally 关闭 browser 防泄漏"
    ],
    sourceTitle: "Playwright Getting Started",
    sourceUrl: "https://playwright.dev/docs/intro"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-desktop-control",
    stageId: "ai-agent-multimodal-execution",
    order: 6,
    eyebrowStage: eyebrow,
    title: "GUI/桌面操作",
    concept:
      "Claude Computer Use 通过 `computer` 工具让模型返回鼠标坐标与键盘动作，宿主执行后回传新截图。循环形式：截图 → 模型决策 → 执行 → 再截图，直到任务完成或触发人工中断。",
    points: [
      "screenshot / mouse_move / left_click 等工具动作",
      "每一轮都把新截图回传作为观察",
      "限制屏幕分辨率避免 token 爆炸"
    ],
    memoryHook: "Computer Use = 截图循环 + 坐标动作",
    fileName: "desktop-control.ts",
    code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function computerUseStep(screenshotBase64: string, task: string) {
  const response = await client.beta.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    tools: [{
      type: "computer_20241022",
      name: "computer",
      display_width_px: 1280,
      display_height_px: 800
    }],
    betas: ["computer-use-2024-10-22"],
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: task },
          { type: "image", source: { type: "base64", media_type: "image/png", data: screenshotBase64 } }
        ]
      }
    ]
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  return toolUse; // 宿主根据 action 执行鼠标/键盘，再回传新截图
}

const action = await computerUseStep("iVBORw0KGgo...", "打开设置，把主题改为深色");
console.log(action);`,
    prompt: "Claude Computer Use 的主循环应该长什么样？",
    correct: "截图作为观察 → 模型返回动作 → 宿主执行 → 再截图，直到任务完成",
    wrong: "只在开始时截一次图，之后模型盲跑动作即可",
    correctFeedback: "正确：每一步都要用新截图回传，否则模型看到的是过期屏幕，动作会漂移。",
    wrongFeedback: "错误：桌面状态每步都变化，缺失新截图会让后续坐标全部错位。",
    additionalWrong: {
      label: "直接用 4K 分辨率截图，识别精度更高",
      feedback: "分辨率越高 token 越贵、延迟越大；1280×800 已能覆盖多数任务。"
    },
    output: "{ type: 'tool_use', name: 'computer', input: { action: 'left_click', coordinate: [640, 320] } }",
    lanes: ["截图观察", "模型决策", "宿主执行"],
    laneValues: ["screenshot base64", "computer 工具", "left_click 640,320"],
    log: [
      "上传当前截图作为 image",
      "Claude 返回 computer tool_use",
      "{ type: 'tool_use', name: 'computer', input: { action: 'left_click', coordinate: [640, 320] } }"
    ],
    summary: [
      "每一轮都要回传新截图",
      "限制分辨率控制 token",
      "宿主执行后再进入下一轮"
    ],
    sourceTitle: "Anthropic Computer Use",
    sourceUrl: "https://docs.anthropic.com/en/docs/build-with-claude/computer-use"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-multimodal-output",
    stageId: "ai-agent-multimodal-execution",
    order: 7,
    eyebrowStage: eyebrow,
    title: "多模态输出组合",
    concept:
      "Agent 输出不再局限于纯文本：用 Markdown + Mermaid 生成图示，用结构化 JSON 供前端渲染表格与卡片。定义好 schema 让 LLM 严格输出，避免前端解析失败。",
    points: [
      "Markdown 承载文本，Mermaid 承载图示",
      "结构化 JSON 供前端渲染卡片/表格",
      "用 response_format 强制 schema"
    ],
    memoryHook: "多模态输出 = 文本 + 图 + 结构化数据",
    fileName: "multimodal-output.ts",
    code: `import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const ReportSchema = z.object({
  summary: z.string(),
  mermaid: z.string().describe("mermaid flowchart 源码"),
  table: z.array(z.object({ metric: z.string(), value: z.number() }))
});

async function buildReport(task: string) {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "输出必须包含摘要、mermaid 图和指标表。" },
      { role: "user", content: task }
    ],
    response_format: zodResponseFormat(ReportSchema, "report")
  });
  return completion.choices[0].message.parsed;
}

const report = await buildReport("分析上季度用户留存并画出漏斗");
console.log(report?.summary, report?.table.length, "行指标");`,
    prompt: "让 Agent 稳定输出结构化多模态结果的关键是什么？",
    correct: "用 response_format 绑定 schema，让 LLM 保证字段完备可解析",
    wrong: "在提示词里写清楚字段就够了，不需要 schema 强约束",
    correctFeedback: "正确：schema 由 SDK 校验，避免上线时 LLM 偶尔漏字段导致前端崩溃。",
    wrongFeedback: "错误：仅靠自然语言提示，LLM 会在长会话中漂移字段名或类型。",
    additionalWrong: {
      label: "让 LLM 直接输出 HTML 更省事",
      feedback: "HTML 难校验且容易夹带脚本，用结构化 JSON 让前端可控渲染更安全。"
    },
    output: "分析上季度留存漏斗，共 3 项关键指标 3 行指标",
    lanes: ["定义 schema", "调用 parse", "拿到结构化输出"],
    laneValues: ["Zod schema", "beta.parse", "summary + mermaid + table"],
    log: [
      "构造 ReportSchema",
      "beta.chat.completions.parse",
      "分析上季度留存漏斗，共 3 项关键指标 3 行指标"
    ],
    summary: [
      "Markdown + Mermaid + JSON 三件套",
      "response_format 强绑定 schema",
      "Zod 让 SDK 帮你做校验"
    ],
    sourceTitle: "Anthropic Vision Guide",
    sourceUrl: "https://docs.anthropic.com/en/docs/build-with-claude/vision"
  }),
  createAiAgentLesson({
    id: "ai-agent-multimodal-execution-feedback-loop",
    stageId: "ai-agent-multimodal-execution",
    order: 8,
    eyebrowStage: eyebrow,
    title: "执行结果反馈闭环",
    concept:
      "代码执行失败、截图不符预期时，把 stderr / diff 作为观察喂回 LLM 让它修正。必须限制最大重试次数（如 3 次）与总耗时，避免死循环；连续同类失败应升级到人工。",
    points: [
      "错误信息作为下一轮观察",
      "限制 maxAttempts 与总超时",
      "同类错误连续出现要升级人工"
    ],
    memoryHook: "反馈闭环要设上限，别让 Agent 自嗨",
    fileName: "feedback-loop.ts",
    code: `import { Sandbox } from "@e2b/code-interpreter";
import OpenAI from "openai";

const openai = new OpenAI();

async function selfHealingRun(task: string, maxAttempts = 3) {
  const sandbox = await Sandbox.create();
  const history: string[] = [];
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const chat = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "输出可直接运行的 Python 代码，不加解释。" },
          { role: "user", content: task },
          ...history.map((h) => ({ role: "user" as const, content: \`上一次失败：\${h}\` }))
        ]
      });
      const code = chat.choices[0].message.content ?? "";
      const exec = await sandbox.runCode(code);
      if (!exec.error) return { ok: true, attempt, stdout: exec.logs.stdout.join("") };
      history.push(exec.error.value);
    }
    return { ok: false, reason: "达到最大重试", history };
  } finally {
    await sandbox.kill();
  }
}

const result = await selfHealingRun("读取 sales.csv 并打印总额");
console.log(result);`,
    prompt: "自愈执行循环最关键的安全边界是什么？",
    correct: "限制最大重试次数与总耗时，同类失败要升级人工",
    wrong: "允许 Agent 无限重试，直到代码跑通为止",
    correctFeedback: "正确：没有上限的重试会烧钱、烧时间，还会让 Agent 陷入同一错误的循环。",
    wrongFeedback: "错误：无限重试是典型的失控模式，必须硬性上限并升级人工。",
    additionalWrong: {
      label: "只要把 stderr 拼进 prompt，Agent 一定能修好",
      feedback: "Agent 可能反复给出相同错误答案；除了反馈还要设上限并检测同类错误。"
    },
    output: "{ ok: true, attempt: 2, stdout: '总额 128560.5\\n' }",
    lanes: ["生成代码", "沙箱执行", "失败反馈"],
    laneValues: ["gpt-4o-mini", "runCode", "error → history"],
    log: [
      "第 1 次：pandas 未导入，失败",
      "第 2 次：补齐 import 后成功",
      "{ ok: true, attempt: 2, stdout: '总额 128560.5\\n' }"
    ],
    summary: [
      "错误信息作为下一轮观察",
      "maxAttempts + 总超时双上限",
      "连续同类失败升级人工"
    ],
    sourceTitle: "E2B Code Interpreter Docs",
    sourceUrl: "https://e2b.dev/docs"
  })
];

const project = createAiAgentStageProject({
  id: "ai-agent-multimodal-execution-project",
  stageId: "ai-agent-multimodal-execution",
  eyebrowStage: eyebrow,
  title: "多模态执行 Agent",
  brief:
    "构建一个多模态 Agent：接收图像+文本任务 → 视觉理解 → 生成执行代码 → 沙箱运行 → 截图验证 → 若失败自动修正 → 输出结构化报告。",
  concept:
    "把阶段所有技能串成闭环：Vision 读图 → LLM 计划 → e2b 执行 → 结果截图/输出 → 失败反馈重试 → 结构化多模态报告。",
  points: [
    "Vision + Code Sandbox + 反馈循环三段合一",
    "所有路径与代码执行受安全边界约束",
    "输出 Markdown + Mermaid + JSON 结构化报告"
  ],
  memoryHook: "多模态 Agent = 看图 → 执行 → 验证 → 报告",
  fileName: "multimodal-agent.ts",
  code: `import OpenAI from "openai";
import { Sandbox } from "@e2b/code-interpreter";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const PlanSchema = z.object({
  summary: z.string(),
  python: z.string(),
  expected: z.string()
});

async function multimodalAgent(imageDataUrl: string, task: string, maxAttempts = 3) {
  const plan = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "先分析图，再生成可直接运行的 python 代码。" },
      {
        role: "user",
        content: [
          { type: "text", text: task },
          { type: "image_url", image_url: { url: imageDataUrl } }
        ]
      }
    ],
    response_format: zodResponseFormat(PlanSchema, "plan")
  });
  const parsed = plan.choices[0].message.parsed!;

  const sandbox = await Sandbox.create({ timeoutMs: 60_000 });
  const history: string[] = [];
  try {
    let code = parsed.python;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const exec = await sandbox.runCode(code);
      if (!exec.error) {
        return {
          status: "ok",
          summary: parsed.summary,
          attempt,
          stdout: exec.logs.stdout.join(""),
          mermaid: "flowchart LR\\n  A[图像] --> B[计划] --> C[沙箱执行] --> D[报告]"
        };
      }
      history.push(exec.error.value);
      const fix = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "根据错误信息修正 python，只输出代码。" },
          { role: "user", content: \`任务：\${task}\\n错误：\${exec.error.value}\\n代码：\${code}\` }
        ]
      });
      code = fix.choices[0].message.content ?? code;
    }
    return { status: "failed", history };
  } finally {
    await sandbox.kill();
  }
}

const report = await multimodalAgent(
  "data:image/png;base64,iVBORw0KGgo...",
  "识别图中的销售表并计算总额"
);
console.log(report);`,
  prompt: "多模态执行 Agent 上线前最应该守住哪条边界？",
  correct: "所有代码在受限沙箱运行，并设置重试上限与结构化报告，失败可回溯",
  wrong: "只要视觉模型看懂了图，Agent 就可以直接在服务器上执行任何代码",
  correctFeedback: "正确：视觉能力和执行安全是两码事，任何 LLM 生成的代码都必须在沙箱内并有上限。",
  wrongFeedback: "错误：视觉理解正确 ≠ 代码安全，绕过沙箱等于把服务器交给模型幻觉。",
  additionalWrong: {
    label: "把重试次数关掉，让 Agent 一直改到成功",
    feedback: "无上限重试会造成成本失控与死循环；必须固定 maxAttempts 并升级人工。"
  },
  lanes: ["视觉计划", "沙箱执行", "报告输出"],
  laneValues: ["gpt-4o + Zod", "e2b runCode", "structured report"],
  log: [
    "视觉解析截图并生成 python 计划",
    "沙箱运行代码，第 1 次失败已自愈",
    "输出 { status: 'ok', attempt: 2, stdout: '总额 128560.5\\n' }"
  ],
  summary: [
    "视觉、执行、反馈三段闭环",
    "沙箱 + 上限守住安全边界",
    "结构化报告便于人工复核"
  ],
  sourceTitle: "OpenAI Vision Guide",
  sourceUrl: "https://platform.openai.com/docs/guides/vision"
});

export const aiAgentStageEightMultimodalExecutionLessons: LessonSpec[] = [...knowledgeLessons, project];
