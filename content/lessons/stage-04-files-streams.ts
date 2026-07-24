import type { LessonSpec, RunnerFrame } from "../../lib/curriculum/types";
import { createLessonSpec } from "./lesson-factory";

const source = (title: string, url: string) => ({ title, url });

const frames = (notes: [string, string, string], values: [string, string, string], log: string[]): RunnerFrame[] => [
  { activeLane: 0, laneValues: [values[0], "等待", "等待"], log: log.slice(0, 1), note: notes[0], delayMs: 300 },
  { activeLane: 1, laneValues: ["完成", values[1], "等待"], log: log.slice(0, 2), note: notes[1], delayMs: 720 },
  { activeLane: 2, laneValues: ["完成", "完成", values[2]], log, note: notes[2], delayMs: 720 }
];

type MicroFileStreamSeed = {
  id: string;
  order: number;
  title: string;
  concept: string;
  points: [string, string, string];
  memoryHook: string;
  fileName: string;
  code: string;
  prompt: string;
  correct: string;
  wrong: string;
  output: string;
  sourceTitle: string;
  sourceUrl: string;
};

function createMicroFileStreamLesson(seed: MicroFileStreamSeed): LessonSpec {
  return createLessonSpec({
    id: seed.id,
    stageId: "files-streams",
    eyebrow: `04.${seed.order} · 文件、Buffer 与 Stream`,
    title: seed.title,
    objectives: [`掌握${seed.title}的真实使用边界`, "把碎片 API 放回文件处理链路中验证"],
    prerequisites: ["files-promises", "buffer-encoding", "streams-readable"],
    concept: seed.concept,
    points: [...seed.points],
    memoryHook: seed.memoryHook,
    files: [{ name: seed.fileName, code: seed.code }],
    entryFile: seed.fileName,
    answer: {
      type: seed.order % 2 === 0 ? "best-practice" : "prediction",
      prompt: seed.prompt,
      options: [
        { id: "a", label: seed.wrong, detail: "忽略边界", feedback: "这个选择没有把文件、Buffer 或 Stream 的边界条件显式处理出来。" },
        { id: "b", label: seed.correct, detail: "符合文件流模型", feedback: `正确：${seed.memoryHook}` }
      ],
      answerId: "b",
      correctExplanation: seed.memoryHook
    },
    execution: {
      lanes: ["输入", "处理", "输出"],
      frames: frames(["读取输入", "应用细碎 API", "得到可观察输出"], [seed.title, seed.points[0], seed.output], [seed.output])
    },
    summary: [seed.memoryHook, ...seed.points],
    sources: [source(seed.sourceTitle, seed.sourceUrl)]
  });
}

const nodeStreamMicroLessons = [
  createMicroFileStreamLesson({
    id: "files-glob-patterns",
    order: 9,
    title: "glob 与批量文件匹配",
    concept: "`fs.promises.glob` 可以按模式异步遍历文件路径，适合批量扫描日志、配置或测试夹具。它返回异步迭代结果，天然适合和 `for await...of` 组合。",
    points: ["glob 按模式找文件", "异步迭代避免一次性加载", "排除规则防止扫入构建产物"],
    memoryHook: "glob 是文件系统里的搜索雷达",
    fileName: "glob-scan.mjs",
    code: `import { glob } from "node:fs/promises";\n\nfor await (const file of glob("logs/**/*.log", { exclude: ["**/archive/**"] })) {\n  console.log(file.endsWith(".log"));\n}`,
    prompt: "这段脚本最适合解决什么问题？",
    correct: "按模式批量找到日志文件并逐个处理",
    wrong: "一次性读取每个日志文件内容到内存",
    output: "true",
    sourceTitle: "Node.js fsPromises.glob",
    sourceUrl: "https://nodejs.org/api/fs.html#fspromisesglobpattern-options"
  }),
  createMicroFileStreamLesson({
    id: "files-temp-workspace",
    order: 10,
    title: "临时目录与工作区清理",
    concept: "`mkdtemp` 创建隔离的临时目录，`rm(..., { recursive: true })` 可以在任务结束后清理。临时工作区能避免测试和 CLI 任务污染真实项目目录。",
    points: ["mkdtemp 创建唯一目录", "finally 中清理资源", "不要把临时产物写进源码目录"],
    memoryHook: "临时工作区像一次性实验舱，用完就回收",
    fileName: "tmp-workspace.mjs",
    code: `import { mkdtemp, rm } from "node:fs/promises";\nimport { tmpdir } from "node:os";\nimport { join } from "node:path";\n\nconst workspace = await mkdtemp(join(tmpdir(), "nodepath-"));\nconsole.log(workspace.includes("nodepath-"));\nawait rm(workspace, { recursive: true, force: true });`,
    prompt: "为什么临时目录清理通常要放进 finally 或任务收尾逻辑？",
    correct: "避免失败路径留下临时文件和污染状态",
    wrong: "让文件写入变成同步阻塞操作",
    output: "true",
    sourceTitle: "Node.js fsPromises.mkdtemp",
    sourceUrl: "https://nodejs.org/api/fs.html#fspromisesmkdtempprefix-options"
  }),
  createMicroFileStreamLesson({
    id: "buffer-binary-protocol",
    order: 11,
    title: "Buffer 与二进制协议",
    concept: "Buffer 可以按字节读写数字，例如 `writeUInt16BE` 和 `readUInt16BE` 常用于解析网络包、文件头和自定义二进制协议。",
    points: ["Buffer 操作原始字节", "大小端影响数字解释", "读写偏移必须明确"],
    memoryHook: "二进制协议先看字节顺序，再看字段偏移",
    fileName: "binary-protocol.mjs",
    code: `const packet = Buffer.alloc(2);\npacket.writeUInt16BE(513, 0);\nconsole.log(packet[0], packet[1]);\nconsole.log(packet.readUInt16BE(0));`,
    prompt: "这段代码输出最能说明什么？",
    correct: "大端写入 513 后字节为 2 和 1，读取还原为 513",
    wrong: "Buffer 只能保存字符串，不能保存数字",
    output: "2 1 / 513",
    sourceTitle: "Node.js Buffer",
    sourceUrl: "https://nodejs.org/api/buffer.html"
  }),
  createMicroFileStreamLesson({
    id: "buffer-base64-json",
    order: 12,
    title: "Base64 与 JSON 载荷",
    concept: "Base64 常用于把二进制数据塞进 JSON、Header 或文本协议。它不是加密，只是编码；解码后仍需要校验载荷来源和大小。",
    points: ["Base64 是编码不是加密", "文本协议可承载二进制", "解码后要校验大小和类型"],
    memoryHook: "Base64 像把字节装进文本信封",
    fileName: "base64-json.mjs",
    code: `const payload = { avatar: Buffer.from("NP").toString("base64") };\nconst decoded = Buffer.from(payload.avatar, "base64").toString("utf8");\nconsole.log(payload.avatar, decoded);`,
    prompt: "看到 Base64 字符串时最重要的判断是什么？",
    correct: "它只是可逆编码，解码后仍要验证内容",
    wrong: "它已经完成安全加密，可以直接信任",
    output: "TlA= NP",
    sourceTitle: "Node.js Buffer encodings",
    sourceUrl: "https://nodejs.org/api/buffer.html#buffers-and-character-encodings"
  }),
  createMicroFileStreamLesson({
    id: "streams-duplex",
    order: 13,
    title: "Duplex Stream 双向通道",
    concept: "Duplex 同时可读可写，网络 socket 就是典型例子。它既能接收输入，也会产生输出，需要分别理解读侧和写侧的背压。",
    points: ["Duplex 同时可读可写", "Socket 是典型双工流", "读写两侧都有背压"],
    memoryHook: "Duplex 像双向隧道，进出车道要分开看",
    fileName: "duplex.mjs",
    code: `import { Duplex } from "node:stream";\n\nconst channel = Duplex.from({ readable: ["pong"], writable: async function* (source) {\n  for await (const chunk of source) console.log(chunk.toString());\n}});\nchannel.write("ping");\nconsole.log(await channel[Symbol.asyncIterator]().next().then((x) => x.value));`,
    prompt: "Duplex 和普通 Readable 最大的区别是什么？",
    correct: "它既能消费写入，也能产出读取数据",
    wrong: "它只能一次性读取完整文件",
    output: "ping / pong",
    sourceTitle: "Node.js Duplex streams",
    sourceUrl: "https://nodejs.org/api/stream.html#duplex-streams"
  }),
  createMicroFileStreamLesson({
    id: "streams-error-handling",
    order: 14,
    title: "Stream 错误处理",
    concept: "手写 `pipe` 链容易漏掉中间流错误。`stream/promises.pipeline` 会把任意一段流错误转成 rejected Promise，更适合在 async 函数中统一处理。",
    points: ["pipeline 传递错误", "try/catch 覆盖整条链", "手写 pipe 容易漏处理"],
    memoryHook: "pipeline 是流管道的保险丝",
    fileName: "pipeline-error.mjs",
    code: `import { pipeline } from "node:stream/promises";\nimport { Readable, Transform } from "node:stream";\n\nconst boom = new Transform({ transform(chunk, enc, cb) { cb(new Error("bad chunk")); } });\ntry {\n  await pipeline(Readable.from(["x"]), boom);\n} catch (error) {\n  console.log(error.message);\n}`,
    prompt: "为什么真实项目更推荐 pipeline 管理多段流？",
    correct: "它能把中间流错误汇总到一个可捕获 Promise",
    wrong: "它会让所有流同步执行并阻塞线程",
    output: "bad chunk",
    sourceTitle: "Node.js stream.pipeline",
    sourceUrl: "https://nodejs.org/api/stream.html#streampipeline"
  }),
  createMicroFileStreamLesson({
    id: "streams-line-parser",
    order: 15,
    title: "按行解析日志流",
    concept: "`readline.createInterface` 可以把文件流切成行事件，适合日志分析、CSV 简析和 CLI 报表。它让大文件处理保持低内存，同时保持每行业务语义清晰。",
    points: ["readline 将流切成行", "for await 逐行处理", "适合日志和报表"],
    memoryHook: "日志流先切行，再聚合",
    fileName: "line-parser.mjs",
    code: `import { createInterface } from "node:readline";\nimport { Readable } from "node:stream";\n\nconst rl = createInterface({ input: Readable.from(["INFO ok\\nERROR bad"]) });\nfor await (const line of rl) {\n  console.log(line.split(" ")[0]);\n}`,
    prompt: "这段代码为什么比 readFile 后 split 更适合大日志？",
    correct: "它按行流式处理，不需要一次把整个文件放进内存",
    wrong: "它会自动修复所有日志格式错误",
    output: "INFO / ERROR",
    sourceTitle: "Node.js readline",
    sourceUrl: "https://nodejs.org/api/readline.html"
  })
];

export const stageFourFilesStreamsLessons: LessonSpec[] = [
  createLessonSpec({
    id: "files-path-url",
    stageId: "files-streams",
    eyebrow: "04.1 · 文件、Buffer 与 Stream",
    title: "path 与文件 URL",
    objectives: ["跨平台路径拼接", "区分绝对路径和 file:// URL"],
    prerequisites: ["modules-node-prefix"],
    concept: "Node 处理文件需要稳健的路径。使用 `path.join` 跨平台拼接路径，在 ESM 中可以使用 `new URL('...', import.meta.url)` 将相对 URL 转换为绝对文件 URL，甚至可以传给 fs API。",
    points: ["path 跨平台", "import.meta.url 解析", "file:// 支持"],
    memoryHook: "不要拼接字符串，用 path 或 URL",
    files: [{
      name: "resolve.mjs",
      code: `import { join } from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst url = new URL("./data.txt", import.meta.url);\nconsole.log(url.protocol);\nconsole.log(fileURLToPath(url).includes("data.txt"));`
    }],
    entryFile: "resolve.mjs",
    answer: {
      prompt: "这段代码的输出结果是？",
      options: [
        { id: "a", label: "file: 然后是 true", detail: "file URL 支持", feedback: "正确：Node 原生支持 file:// URL 操作。" },
        { id: "b", label: "http: 然后是 false", detail: "混淆了网络与文件", feedback: "import.meta.url 是基于文件协议的。" }
      ],
      answerId: "a",
      correctExplanation: "import.meta.url 是 file://，可以直接用并转换为路径。"
    },
    execution: { lanes: ["生成 URL", "协议读取", "转换为路径"], frames: frames(["解析 URL", "打印 file:", "路径验证"], ["URL对象", "file:", "true"], ["file:", "true"]) },
    summary: ["使用 path 模块处理字符串", "ESM 中使用 URL 解析相对路径", "可以直接向许多 API 传递 URL 对象"],
    sources: [source("Path module", "https://nodejs.org/api/path.html")]
  }),
  createLessonSpec({
    id: "files-promises",
    stageId: "files-streams",
    eyebrow: "04.2 · 文件、Buffer 与 Stream",
    title: "fs/promises：基于 Promise 的文件系统",
    objectives: ["使用 async/await 读取文件", "使用 async/await 写入文件"],
    prerequisites: ["async-await"],
    concept: "现代 Node.js 提倡使用 `node:fs/promises` 模块。它返回 Promise 而非依赖回调，非常适合与 async/await 结合，写出同步风格的非阻塞代码。",
    points: ["返回 Promise", "避免回调地狱", "支持 async/await"],
    memoryHook: "fs/promises 让文件读写平铺直叙",
    files: [{
      name: "readwrite.mjs",
      code: `import { readFile, writeFile } from "node:fs/promises";\n\nawait writeFile("hello.txt", "hello");\nconst text = await readFile("hello.txt", "utf-8");\nconsole.log(text);`
    }],
    entryFile: "readwrite.mjs",
    answer: {
      prompt: "代码的输出是什么？",
      options: [
        { id: "a", label: "hello", detail: "按顺序执行", feedback: "正确：await 确保先写完再读。" },
        { id: "b", label: "undefined", detail: "认为是并发", feedback: "await 暂停了执行，确保顺序。" }
      ],
      answerId: "a",
      correctExplanation: "await 会等待 Promise settled，所以读取发生在写入完成之后。"
    },
    execution: { lanes: ["准备写", "写完成", "读取并打印"], frames: frames(["发起写", "写完了", "读并打印"], ["Write", "Done", "hello"], ["hello"]) },
    summary: ["node:fs/promises 提供 Promise API", "完美结合 async/await", "不要忘记写文件需要权限"],
    sources: [source("fs Promises API", "https://nodejs.org/api/fs.html#promises-api")]
  }),
  createLessonSpec({
    id: "files-directories-stats",
    stageId: "files-streams",
    eyebrow: "04.3 · 文件、Buffer 与 Stream",
    title: "目录和文件元数据",
    objectives: ["读取目录内容", "获取文件状态 stat"],
    prerequisites: ["files-promises"],
    concept: "我们可以用 `readdir` 读取目录内的所有项目，结合 `stat` 可以判断每个项目是普通文件还是子目录。这常用于遍历文件系统。",
    points: ["readdir", "stat", "isFile/isDirectory"],
    memoryHook: "先列出再探测",
    files: [{
      name: "list.mjs",
      code: `import { stat } from "node:fs/promises";\n\nconst info = await stat(".");\nconsole.log(info.isDirectory());`
    }],
    entryFile: "list.mjs",
    answer: {
      prompt: "代码输出什么？",
      options: [
        { id: "a", label: "true", detail: "当前目录", feedback: "正确：`.` 代表当前目录，是一个目录。" },
        { id: "b", label: "false", detail: "当作文件", feedback: "`.` 是当前目录而非文件。" }
      ],
      answerId: "a",
      correctExplanation: "stat('.') 返回的 stats 对象的 isDirectory() 方法会返回 true。"
    },
    execution: { lanes: ["stat", "获取信息", "判断"], frames: frames(["读取状态", "得到 stats", "调用 isDirectory"], ["...", "Stats", "true"], ["true"]) },
    summary: ["stat 获得大小与权限", "isDirectory 区分目录", "可以结合 readdir 做递归"],
    sources: [source("fs.stat", "https://nodejs.org/api/fs.html#fspromisesstatpath-options")]
  }),
  createLessonSpec({
    id: "files-watch",
    stageId: "files-streams",
    eyebrow: "04.4 · 文件、Buffer 与 Stream",
    title: "文件监听",
    objectives: ["使用 fs.watch", "理解异步迭代监听"],
    prerequisites: ["files-promises"],
    concept: "`fs/promises.watch` 返回一个异步迭代器。每次文件或目录变动，都会 push 一个事件，利用 `for await...of` 可以轻松实现持续监听。",
    points: ["fs.watch 返回 AsyncIterable", "监听修改与重命名", "使用 for await"],
    memoryHook: "for await 持续监听文件变动",
    files: [{
      name: "watch.mjs",
      code: `// 伪代码演示\nimport { watch } from "node:fs/promises";\nconsole.log("监听开始");\n// for await (const event of watch(".")) { ... }`
    }],
    entryFile: "watch.mjs",
    answer: {
      prompt: "对于持续的文件监听，为什么推荐 watch() 产生异步迭代器？",
      options: [
        { id: "a", label: "能用 for await...of 简化连续事件", detail: "现代写法", feedback: "正确：异步迭代是处理无穷事件流的最佳现代方案。" },
        { id: "b", label: "因为它只返回一个 Promise", detail: "误解事件流", feedback: "文件会持续变动，不能只返回一次结果。" }
      ],
      answerId: "a",
      correctExplanation: "文件系统事件是一个随着时间推移不断产生值的序列，最契合异步迭代。"
    },
    execution: { lanes: ["调用 watch", "返回迭代器", "打印"], frames: frames(["watch 启动", "进入 for await", "输出"], ["启动", "...", "监听开始"], ["监听开始"]) },
    summary: ["事件流用异步迭代处理", "watch 不阻塞普通事件循环", "监听非常底层，不同系统表现有差异"],
    sources: [source("fs.watch", "https://nodejs.org/api/fs.html#fspromiseswatchfilename-options")]
  }),
  createLessonSpec({
    id: "buffer-encoding",
    stageId: "files-streams",
    eyebrow: "04.5 · 文件、Buffer 与 Stream",
    title: "Buffer 与字符编码",
    objectives: ["理解 Buffer", "Buffer 与 String 互转"],
    prerequisites: ["files-promises"],
    concept: "Node 中 I/O 读写的底层本质是字节序列。`Buffer` 用于直接操作这块内存。如果不指定编码，`readFile` 返回的就是 Buffer。",
    points: ["Buffer 是字节序列", "可以分配并转换为字符串", "utf-8 编码"],
    memoryHook: "文本用 utf8，底层用 Buffer",
    files: [{
      name: "buf.mjs",
      code: `const buf = Buffer.from("Hi");\nconsole.log(buf.length);\nconsole.log(buf.toString());`
    }],
    entryFile: "buf.mjs",
    answer: {
      prompt: "这段代码输出什么？",
      options: [
        { id: "a", label: "2 和 Hi", detail: "正确编码", feedback: "正确：Hi 占 2 字节，toString 还原为字符串。" },
        { id: "b", label: "1 和 Hi", detail: "算错字节", feedback: "H 和 i 各占 1 字节。" }
      ],
      answerId: "a",
      correctExplanation: "ASCII 字符各占一字节，from 创建 Buffer，toString() 将字节转回文本。"
    },
    execution: { lanes: ["创建 Buffer", "测量大小", "转为字符串"], frames: frames(["from", "length=2", "Hi"], ["48 69", "2", "Hi"], ["2", "Hi"]) },
    summary: ["Buffer 处理二进制数据", "length 反映字节数而非字符数", "总是显式指定编码"],
    sources: [source("Buffer", "https://nodejs.org/api/buffer.html")]
  }),
  createLessonSpec({
    id: "streams-readable",
    stageId: "files-streams",
    eyebrow: "04.6 · 文件、Buffer 与 Stream",
    title: "Readable Stream",
    objectives: ["分块读取大文件", "利用 data 事件或 for await"],
    prerequisites: ["buffer-encoding"],
    concept: "面对 G 级别的文件，直接 readFile 会把内存撑爆。`fs.createReadStream` 可以分块流式读取。这也是一个 AsyncIterable。",
    points: ["按 chunk 产生数据", "防内存溢出", "可迭代"],
    memoryHook: "涓涓细流不撑破内存",
    files: [{
      name: "stream.mjs",
      code: `import { Readable } from "node:stream";\nconst stream = Readable.from(["Chunk1", "Chunk2"]);\nfor await (const chunk of stream) {\n  console.log(chunk);\n}`
    }],
    entryFile: "stream.mjs",
    answer: {
      prompt: "输出结果是什么？",
      options: [
        { id: "a", label: "逐行输出 Chunk1 和 Chunk2", detail: "流式迭代", feedback: "正确：异步迭代处理流分块非常自然。" },
        { id: "b", label: "[ 'Chunk1', 'Chunk2' ]", detail: "打印整个数组", feedback: "迭代是按项处理，并不是一次性输出数组。" }
      ],
      answerId: "a",
      correctExplanation: "Readable.from 将数组转换为可读流，for await 按顺序消费每一个 chunk。"
    },
    execution: { lanes: ["构建", "读 chunk 1", "读 chunk 2"], frames: frames(["from", "Chunk1", "Chunk2"], ["...", "C1", "C2"], ["Chunk1", "Chunk2"]) },
    summary: ["大文件必须用流", "流可异步迭代", "Readable 是读取源"],
    sources: [source("Readable Streams", "https://nodejs.org/api/stream.html#readable-streams")]
  }),
  createLessonSpec({
    id: "streams-writable-transform",
    stageId: "files-streams",
    eyebrow: "04.7 · 文件、Buffer 与 Stream",
    title: "Writable 与 Transform Stream",
    objectives: ["流式写入", "通过 pipe 加工流"],
    prerequisites: ["streams-readable"],
    concept: "Writable 用于流式消费数据（如写文件、发送请求）。Transform 是中间件，可以在导流过程中加工（如压缩、转码）。",
    points: ["Writable 接收数据", "Transform 加工数据", "pipeline/pipe 连接"],
    memoryHook: "源头 -> 加工厂 -> 储水池",
    files: [{
      name: "pipe.mjs",
      code: `import { pipeline } from "node:stream/promises";\nimport { Readable, Transform } from "node:stream";\n\nconst upper = new Transform({\n  transform(chunk, enc, cb) {\n    cb(null, chunk.toString().toUpperCase());\n  }\n});\nconst src = Readable.from(["hi"]);\nlet out = "";\nconst dst = new Transform({ transform(c,e,cb) { out+=c; cb(); }});\nawait pipeline(src, upper, dst);\nconsole.log(out);`
    }],
    entryFile: "pipe.mjs",
    answer: {
      prompt: "代码输出什么？",
      options: [
        { id: "a", label: "HI", detail: "经历了变大写", feedback: "正确：流经过了 upper 转换中间件，最后存入 dst 并聚合。" },
        { id: "b", label: "hi", detail: "没有改变", feedback: "upper 会把数据变大写再传递给下一棒。" }
      ],
      answerId: "a",
      correctExplanation: "pipeline 管理流的错误并在完成时 resolve，中间件负责把数据转换。"
    },
    execution: { lanes: ["产生", "转换", "聚合"], frames: frames(["发hi", "转大写", "存HI"], ["hi", "HI", "HI"], ["HI"]) },
    summary: ["Transform 连接输入和输出", "推荐使用 pipeline 代替 pipe 以防内存泄露和丢失错误", "流向可以有多个中间件"],
    sources: [source("Transform", "https://nodejs.org/api/stream.html#class-streamtransform")]
  }),
  createLessonSpec({
    id: "stream-backpressure",
    stageId: "files-streams",
    eyebrow: "04.8 · 文件、Buffer 与 Stream",
    title: "pipe 与背压",
    objectives: ["理解流速不匹配", "背压机制"],
    prerequisites: ["streams-writable-transform"],
    concept: "如果读取速度远快于写入速度，内存会迅速被写缓存撑满。这就是背压。`pipeline` 或 `pipe` 会自动处理这一协调过程。",
    points: ["写不过来返回 false", "触发 drain 事件", "自动处理推荐 pipeline"],
    memoryHook: "写不过来就停，等 drain 再送",
    files: [{
      name: "drain.mjs",
      code: `// 伪代码，展示背压\nimport { createWriteStream } from "node:fs";\nconst dst = createWriteStream("out.txt");\n// dst.write("chunk") 如果返回 false，意味着不应继续。`
    }],
    entryFile: "drain.mjs",
    answer: {
      prompt: "当 write 返回 false 时，最好的做法是什么？",
      options: [
        { id: "c", label: "暂停读取，等待 writable 发出 drain 后再继续", detail: "自动协调", feedback: "正确：这是背压的核心规则，可以避免内存溢出。" },
        { id: "a", label: "立即重试，一直写", detail: "强行写爆内存", feedback: "继续写入会造成大块内存挂起，最终 OOM。" }
      ],
      answerId: "c",
      correctExplanation: "这就是所谓的“背压”：目的地写满了，源头暂停生产，等目的地排空 (drain) 后继续。"
    },
    execution: { lanes: ["读取", "缓存状态", "写入"], frames: frames(["生产很快", "缓存满", "等待 drain"], ["读入", "Full", "Pause"], []) },
    summary: ["背压平衡读写速度", "不要无视 false 的返回值", "尽量使用高级的 stream.pipeline 自动处理背压"],
    sources: [source("Backpressuring", "https://nodejs.org/en/learn/modules/backpressuring-in-streams")]
  }),
  ...nodeStreamMicroLessons,
  createLessonSpec({
    id: "project-cli-log-analyzer",
    stageId: "files-streams",
    kind: "stage-project",
    eyebrow: "阶段项目 04 · 综合训练",
    title: "CLI 日志分析器",
    durationMinutes: 15,
    difficulty: "进阶",
    objectives: ["组合文件流与流处理器完成日志聚合"],
    prerequisites: ["stream-backpressure"],
    concept: "本项目通过 Node 流读取超大日志文件，逐行解析日志等级，然后聚合输出。",
    points: ["流式读取", "使用 readline", "最终聚合"],
    memoryHook: "流式读取防 OOM，分行处理更自然",
    files: [{ name: "analyze.mjs", code: "// 项目载入中...\n" }],
    entryFile: "analyze.mjs",
    sources: [source("Reading files with Node.js", "https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs")],
    execution: { lanes: ["流输入", "解析", "聚合"], frames: frames(["发", "解", "合"], ["1", "2", "3"], ["Report"]) },
    steps: [
      {
        id: "step-1",
        title: "步骤 1：流式文件与行处理",
        context: "利用 fs.createReadStream 和 readline.createInterface 能够最优雅地流式按行处理文件。",
        files: [{ name: "analyze.mjs", code: `import { createReadStream } from 'node:fs';\nimport { createInterface } from 'node:readline';\n\nconst rl = createInterface({ input: createReadStream('app.log') });` }],
        entryFile: "analyze.mjs",
        question: {
          id: "project-cli-log-analyzer-step1",
          type: "prediction",
          prompt: "为什么处理巨大的日志文件推荐配合 readline 接口？",
          options: [
            { id: "a", label: "能将任意流自动切分为行流，按行迭代", detail: "自带分行", feedback: "正确：避免了我们手动通过查找换行符来切割 buffer 的繁琐工作。" },
            { id: "b", label: "能让运行更快", detail: "与速度无关", feedback: "主要是降低复杂度与内存占用，速度反倒有微弱开销。" }
          ],
          answerId: "a",
          correctExplanation: "readline 是原生的逐行分割中间件工具。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：聚合逻辑",
        context: "我们需要在 for await 循环中提取日志级别，并递增。如果是未知的日志，我们应当怎么办？",
        files: [{ name: "analyze.mjs", code: `const stats = { INFO: 0, WARN: 0, ERROR: 0 };\nfor await (const line of rl) {\n  const level = line.match(/\\[(.*?)\\]/)?.[1];\n  // ...\n}` }],
        entryFile: "analyze.mjs",
        question: {
          id: "project-cli-log-analyzer-step2",
          type: "implementation",
          prompt: "你会如何更新对应日志级别的计数？",
          options: [
            {
              id: "a",
              label: "判断属不属于我们初始化的键",
              detail: "防污染防御",
              feedback: "正确：不属于我们已知类型的，可以丢弃或者归类为 UNKNOWN。",
              language: "js",
              diffLines: [4, 5],
              code: `  if (level in stats) {\n    stats[level]++;\n  }`
            },
            {
              id: "b",
              label: "直接递增",
              detail: "相信输入",
              feedback: "未知级别会造成 undefined++，变成 NaN。",
              language: "js",
              diffLines: [4],
              code: `  stats[level]++;`
            }
          ],
          answerId: "a",
          correctExplanation: "日志属于不可靠输入，必须防御未知格式引起的 NaN。"
        }
      }
    ],
    summary: ["用流读取超大文件避免内存暴涨", "利用 Transform 处理数据块", "串联各种流来完成复杂的数据处理流水线"]
  })
];
