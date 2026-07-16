import type { LessonSpec } from "../../lib/curriculum/types";
import { createAdvancedLesson } from "./advanced-lesson-factory";

export const stageNineTestingSecurityLessons: LessonSpec[] = [
  createAdvancedLesson({
    id: "testing-node-test",
    stageId: "testing-security",
    kind: "knowledge",
    order: 1,
    title: "使用 node:test 编写测试",
    concept: "Node.js 内置测试运行器通过 `node:test` 注册测试，再由 `node --test` 发现并执行测试文件。它会为每个用例记录通过、失败和耗时，不需要额外安装测试框架就能建立可重复的验证入口。",
    points: ["从 node:test 导入 test", "测试体抛错或断言失败会标记用例失败", "node --test 负责发现和汇总测试"],
    memoryHook: "test 定义证据，node --test 汇总证据",
    code: `import test from "node:test";
import assert from "node:assert/strict";

function total(prices) {
  return prices.reduce((sum, price) => sum + price, 0);
}

test("total 会累加所有价格", () => {
  assert.equal(total([12, 8, 5]), 25);
});

test("空列表的总价是 0", () => {
  assert.equal(total([]), 0);
});

// 运行：node --test total.test.mjs`,
    entryFile: "total.test.mjs",
    prompt: "如果 total([]) 错误地返回 undefined，第二个用例会怎样？",
    correct: "assert.equal 失败，该用例被标记为 failed，进程返回非零退出码",
    wrongA: "测试仍然通过，因为空数组会被跳过",
    wrongB: "Node 会自动把 undefined 修正为 0",
    correctFeedback: "正确：断言抛出的 AssertionError 会让该测试失败，`node --test` 汇总失败并设置非零退出码。",
    wrongAFeedback: "用例已经显式执行 `total([])`，测试运行器不会因为输入为空而跳过。",
    wrongBFeedback: "测试运行器只验证行为，不会修改被测函数的返回值。",
    lanes: ["发现测试", "执行断言", "汇总结果"],
    frameValues: ["2 tests", "25 / 0", "2 passed"],
    log: ["test discovered: total 会累加所有价格", "assert.equal(actual, expected)", "tests 2, pass 2, fail 0"],
    summary: ["node:test 提供 Node.js 内置测试 API", "node --test 负责执行并汇总用例", "测试应覆盖正常输入和有意义的边界输入"],
    sourceTitle: "Test runner",
    sourceUrl: "https://nodejs.org/api/test.html"
  }),
  createAdvancedLesson({
    id: "testing-assertions",
    stageId: "testing-security",
    kind: "knowledge",
    order: 2,
    title: "用严格断言表达契约",
    concept: "`node:assert/strict` 提供严格相等、深度结构比较、异常和异步拒绝等断言。断言应直接表达业务契约：原始值用 `equal`，对象结构用 `deepEqual`，错误路径用 `throws` 或 `rejects`。",
    points: ["equal 使用严格相等语义", "deepEqual 比较对象和数组结构", "rejects 验证 Promise 拒绝"],
    memoryHook: "值用 equal，结构用 deepEqual，失败用 rejects",
    code: `import test from "node:test";
import assert from "node:assert/strict";

async function loadUser(id) {
  if (!id) throw new TypeError("id required");
  return { id, roles: ["reader"] };
}

test("返回稳定的用户结构", async () => {
  assert.deepEqual(await loadUser("u-1"), {
    id: "u-1",
    roles: ["reader"]
  });
});

test("缺少 id 时拒绝", async () => {
  await assert.rejects(loadUser(""), {
    name: "TypeError",
    message: "id required"
  });
});`,
    entryFile: "assertions.test.mjs",
    prompt: "为什么对象结果应使用 deepEqual，而不是 equal？",
    correct: "deepEqual 比较对象内容，equal 只会比较两个对象是否是同一引用",
    wrongA: "因为 equal 只能比较字符串长度",
    wrongB: "因为 deepEqual 会自动调用远程 API",
    correctFeedback: "正确：两个内容相同但独立创建的对象不是同一引用，结构契约应使用深度比较。",
    wrongAFeedback: "equal 可以比较各种原始值，也能比较引用；它并不限于字符串长度。",
    wrongBFeedback: "deepEqual 是同步结构比较，不会产生网络请求。",
    lanes: ["准备输入", "选择断言", "验证契约"],
    frameValues: ["u-1 / empty", "deepEqual / rejects", "pass"],
    log: ["loadUser(u-1) resolved", "object structure matched", "TypeError rejection matched"],
    summary: ["断言类型要与契约类型匹配", "异常测试应同时验证错误类型和关键信息", "严格断言能减少隐式类型转换造成的误判"],
    sourceTitle: "Assert",
    sourceUrl: "https://nodejs.org/api/assert.html"
  }),
  createAdvancedLesson({
    id: "testing-lifecycle",
    stageId: "testing-security",
    kind: "knowledge",
    order: 3,
    title: "测试生命周期与资源清理",
    concept: "测试中的临时目录、Server、数据库连接等资源必须有明确生命周期。`before`/`after` 适合套件级资源，`beforeEach`/`afterEach` 适合每个用例独享的状态；清理钩子让失败用例也不会污染后续测试。",
    points: ["before 在一组测试前准备资源", "beforeEach 为每个用例重置状态", "after 和 afterEach 负责释放资源"],
    memoryHook: "测试前布置，测试后归零",
    code: `import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

let workDir;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), "nodepath-"));
});

beforeEach(async () => {
  await writeFile(join(workDir, "state.json"), "{}", "utf8");
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

test("每个用例都从空状态开始", async () => {
  assert.equal(await readFile(join(workDir, "state.json"), "utf8"), "{}");
});`,
    entryFile: "lifecycle.test.mjs",
    prompt: "为什么临时目录放在 after 中删除？",
    correct: "整组测试结束后统一释放套件资源，避免残留文件污染环境",
    wrongA: "after 会在每条断言之前运行",
    wrongB: "这样可以让测试共享上一次运行的脏数据",
    correctFeedback: "正确：目录由 before 创建并供套件使用，after 在套件结束时对称清理。",
    wrongAFeedback: "after 是测试结束后的钩子，不会在断言之前执行。",
    wrongBFeedback: "清理的目的正是消除跨运行残留，而不是保留脏数据。",
    lanes: ["创建夹具", "重置状态", "释放资源"],
    frameValues: ["mkdtemp", "state={}", "rm recursive"],
    log: ["suite temp directory created", "fixture reset before test", "suite temp directory removed"],
    summary: ["生命周期钩子让测试资源边界可见", "每个用例应尽量从可预测状态开始", "清理逻辑必须覆盖测试失败后的路径"],
    sourceTitle: "Using test runner",
    sourceUrl: "https://nodejs.org/en/learn/test-runner/using-test-runner"
  }),
  createAdvancedLesson({
    id: "testing-mocking",
    stageId: "testing-security",
    kind: "knowledge",
    order: 4,
    title: "使用 Node.js Mock API 隔离边界",
    concept: "Mock 适合隔离支付网关、时钟或邮件发送等外部边界，而不应替代核心业务断言。测试上下文的 `t.mock.method()` 可以临时替换对象方法，并记录调用参数；用例结束后测试运行器会恢复它管理的 mock。",
    points: ["通过依赖对象暴露可替换边界", "t.mock.method 记录调用", "核心返回值仍用真实断言验证"],
    memoryHook: "只替身边界，不替身业务事实",
    code: `import test from "node:test";
import assert from "node:assert/strict";

const mailer = {
  async send(message) {
    throw new Error("真实测试不应发送邮件");
  }
};

async function register(email) {
  await mailer.send({ to: email, template: "welcome" });
  return { email, status: "active" };
}

test("注册成功后发送欢迎邮件", async (t) => {
  const send = t.mock.method(mailer, "send", async () => ({ id: "mail-1" }));

  assert.deepEqual(await register("learner@example.com"), {
    email: "learner@example.com",
    status: "active"
  });
  assert.equal(send.mock.callCount(), 1);
  assert.equal(send.mock.calls[0].arguments[0].template, "welcome");
});`,
    entryFile: "mocking.test.mjs",
    prompt: "这个测试为什么要 mock mailer.send？",
    correct: "隔离真实邮件副作用，同时验证调用次数和参数",
    wrongA: "让 register 函数完全不执行",
    wrongB: "把所有业务断言都替换成固定通过",
    correctFeedback: "正确：外部发送边界被替换，但 register 的业务返回值和调用契约仍被真实验证。",
    wrongAFeedback: "register 仍然完整执行，只是它依赖的发送方法被测试替身替换。",
    wrongBFeedback: "Mock 不应掩盖业务事实；返回结构和调用参数仍需要明确断言。",
    lanes: ["安装 Mock", "执行业务", "检查调用"],
    frameValues: ["mailer.send", "register", "1 call"],
    log: ["mock method installed", "register returned active user", "mailer.send called with welcome"],
    summary: ["Mock 应集中在不可控外部边界", "Node 测试上下文可管理方法替身的恢复", "调用次数与参数是边界契约的重要证据"],
    sourceTitle: "Mocking in tests",
    sourceUrl: "https://nodejs.org/en/learn/test-runner/mocking"
  }),
  createAdvancedLesson({
    id: "testing-coverage",
    stageId: "testing-security",
    kind: "knowledge",
    order: 5,
    title: "阅读代码覆盖率",
    concept: "Node.js 测试运行器可通过 `--experimental-test-coverage` 收集覆盖率并输出摘要。覆盖率说明哪些行、分支和函数在测试时被执行过，但它不能证明断言正确，也不能替代边界、错误和安全场景的设计。",
    points: ["覆盖率功能通过命令行显式开启", "覆盖率报告展示执行触达情况", "高覆盖率不等于高质量测试"],
    memoryHook: "覆盖率照亮走过的路，不证明方向正确",
    code: `import test from "node:test";
import assert from "node:assert/strict";

function discount(price, role) {
  if (price < 0) throw new RangeError("price must be non-negative");
  return role === "member" ? price * 0.9 : price;
}

test("会员享受九折", () => {
  assert.equal(discount(100, "member"), 90);
});

// 收集：node --test --experimental-test-coverage price.test.mjs`,
    entryFile: "price.test.mjs",
    prompt: "报告显示普通用户分支未覆盖，最合适的下一步是什么？",
    correct: "新增一个有明确业务断言的普通用户用例",
    wrongA: "删除普通用户分支，让覆盖率数字变高",
    wrongB: "只把覆盖率输出改成 100%",
    correctFeedback: "正确：覆盖率用于发现未触达路径，下一步应补充能证明该路径契约的测试。",
    wrongAFeedback: "不能为了指标删除真实业务行为；先判断该分支是否是有效需求。",
    wrongBFeedback: "修改报告不增加任何验证证据，也无法防止回归。",
    lanes: ["执行测试", "收集覆盖", "补充场景"],
    frameValues: ["member path", "uncovered else", "new assertion"],
    log: ["test pass: member discount", "coverage reports uncovered default branch", "add default-role behavior test"],
    summary: ["Node 内置覆盖率需要通过 experimental 标志显式启用", "覆盖率是测试设计的反馈工具而非质量结论", "每个新增用例都应包含可解释的行为断言"],
    sourceTitle: "Collecting code coverage",
    sourceUrl: "https://nodejs.org/en/learn/test-runner/collecting-code-coverage"
  }),
  createAdvancedLesson({
    id: "testing-integration",
    stageId: "testing-security",
    kind: "knowledge",
    order: 6,
    title: "HTTP 集成测试",
    concept: "HTTP 集成测试应启动真实 Server、通过网络接口发请求并断言状态码和响应体。监听端口 `0` 让操作系统分配空闲端口，`finally` 中关闭 Server，能避免端口冲突和失败用例留下的句柄。",
    points: ["server.listen(0) 避免固定端口冲突", "等待 listening 后读取实际端口", "finally 保证 server.close 执行"],
    memoryHook: "随机端口真请求，finally 关服务",
    code: `import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";

function buildServer() {
  return createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ path: request.url }));
  });
}

test("GET /healthz 返回真实 HTTP 响应", async () => {
  const server = buildServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch("http://127.0.0.1:" + address.port + "/healthz");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { path: "/healthz" });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});`,
    entryFile: "http-integration.test.mjs",
    prompt: "为什么集成测试监听端口 0？",
    correct: "让操作系统分配当前可用端口，避免并行测试争抢固定端口",
    wrongA: "端口 0 是生产环境固定对外端口",
    wrongB: "这样 fetch 就不会真的发出 HTTP 请求",
    correctFeedback: "正确：测试仍通过真实 TCP/HTTP 访问，只是端口由系统动态选择。",
    wrongAFeedback: "端口 0 用于请求系统分配临时端口，不是客户端实际访问的生产端口。",
    wrongBFeedback: "测试从 `server.address()` 读取实际端口并真实调用 fetch。",
    lanes: ["监听临时端口", "发起 Fetch", "关闭 Server"],
    frameValues: ["port=dynamic", "200 JSON", "close"],
    log: ["server listening on ephemeral port", "GET /healthz -> 200", "server closed in finally"],
    summary: ["集成测试验证模块组合后的真实协议行为", "动态端口支持可靠并行执行", "网络资源必须在 finally 中关闭"],
    sourceTitle: "Introduction to Node.js test runner",
    sourceUrl: "https://nodejs.org/en/learn/test-runner/introduction"
  }),
  createAdvancedLesson({
    id: "security-permissions-secrets",
    stageId: "testing-security",
    kind: "knowledge",
    order: 7,
    title: "权限模型与密钥边界",
    concept: "Node.js 权限模型是需要通过 `--permission` 显式启用的可选加固层，可以限制文件系统等敏感能力；它不是默认安全沙箱。密钥仍应从环境变量或密钥服务注入，并在日志、响应和错误信息中始终脱敏。",
    points: ["权限模型需要显式启用", "只授予进程实际需要的资源能力", "密钥进入内存后也不能写入日志"],
    memoryHook: "权限做最小化，密钥只使用不展示",
    code: `import { readFile } from "node:fs/promises";

// 可选加固运行方式：
// SERVICE_API_KEY=... node --permission --allow-fs-read=./config secure-config.mjs

const apiKey = process.env.SERVICE_API_KEY;
if (!apiKey) throw new Error("SERVICE_API_KEY is required");

const configUrl = new URL("./config/public.json", import.meta.url);
const publicConfig = JSON.parse(await readFile(configUrl, "utf8"));

console.log(JSON.stringify({
  event: "config.loaded",
  region: publicConfig.region,
  apiKey: "[REDACTED]"
}));

// 只把 apiKey 传给需要鉴权的下游调用，不写入日志或响应。`,
    entryFile: "secure-config.mjs",
    prompt: "这段代码中的 `--permission` 和环境变量分别解决什么问题？",
    correct: "权限模型限制进程能力，环境变量提供密钥边界；两者都不能替代日志脱敏",
    wrongA: "权限模型默认开启，并会自动加密所有日志",
    wrongB: "环境变量可以安全地原样返回给浏览器",
    correctFeedback: "正确：权限模型是可选的纵深防御，密钥注入和输出脱敏仍是独立责任。",
    wrongAFeedback: "权限模型需要显式开启，也不会自动识别和加密日志中的秘密。",
    wrongBFeedback: "环境变量只改变密钥来源；服务端仍不能把秘密暴露到客户端。",
    lanes: ["启用最小权限", "读取密钥", "脱敏输出"],
    frameValues: ["--permission", "SERVICE_API_KEY", "[REDACTED]"],
    log: ["filesystem read permission granted for ./config", "secret injected from environment", "config.loaded without secret value"],
    summary: ["Node 权限模型是显式启用的可选加固能力", "最小权限减少进程被利用后的影响面", "密钥不可进入日志、错误详情或客户端响应"],
    sourceTitle: "Permissions",
    sourceUrl: "https://nodejs.org/api/permissions.html"
  }),
  createAdvancedLesson({
    id: "security-dependencies-web",
    stageId: "testing-security",
    kind: "knowledge",
    order: 8,
    title: "依赖与 Web 输入安全",
    concept: "Web 服务的攻击面既来自依赖供应链，也来自外部输入。锁定并审计依赖、限制请求体大小、只挑选允许字段、设置安全响应头，可以把常见风险变成明确的代码和发布检查项。",
    points: ["提交 lockfile 并持续审计依赖", "请求体设置上限", "使用字段白名单避免意外写入"],
    memoryHook: "依赖要查，输入要限，字段要挑",
    code: `import { createServer } from "node:http";

async function readLimitedJson(request, maxBytes = 64 * 1024) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new RangeError("body_too_large");
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const input = await readLimitedJson(request);
    const safeUser = {
      displayName: String(input.displayName ?? "").trim(),
      locale: input.locale === "en" ? "en" : "zh-CN"
    };
    response.end(JSON.stringify(safeUser));
  } catch (error) {
    response.statusCode = error instanceof RangeError ? 413 : 400;
    response.end(JSON.stringify({ error: "invalid_request" }));
  }
}).listen(3000);

// 发布检查：npm audit`,
    entryFile: "web-boundary.mjs",
    prompt: "为什么不直接把 input 整体写入用户对象？",
    correct: "字段白名单可以阻止客户端注入角色等不允许修改的属性",
    wrongA: "因为 JSON 对象不能包含两个字段",
    wrongB: "因为 npm audit 会自动删除所有输入字段",
    correctFeedback: "正确：服务端只挑选公开可写字段，避免批量赋值和越权属性进入持久状态。",
    wrongAFeedback: "JSON 对象可以有多个字段；问题在于哪些字段被服务端信任。",
    wrongBFeedback: "npm audit 检查依赖漏洞，不负责运行时输入过滤。",
    lanes: ["限制体积", "挑选字段", "发布审计"],
    frameValues: ["64 KiB", "displayName/locale", "npm audit"],
    log: ["request body within limit", "unsafe fields discarded", "security headers and JSON response applied"],
    summary: ["依赖安全需要 lockfile、审计和及时升级共同维护", "外部输入必须限制大小并验证形状", "白名单写入比复制整个请求对象更安全"],
    sourceTitle: "Security best practices",
    sourceUrl: "https://nodejs.org/en/learn/getting-started/security-best-practices"
  }),
  createAdvancedLesson({
    id: "project-tested-auth",
    stageId: "testing-security",
    kind: "stage-project",
    order: 9,
    title: "经过测试的鉴权边界",
    concept: "阶段项目把 HTTP 输入边界、统一错误、教学用 HMAC 完整性签名、依赖注入 Mock 和真实端口集成测试组合起来。示例只演示如何生成可供消费方校验完整性的 HMAC 材料；它不是 JWT 或生产会话令牌，也没有实现过期时间、吊销和消费方验签流程，因此不能直接作为认证凭证使用。",
    points: ["登录接口先验证输入再校验凭证", "教学签名不能替代成熟的会话或令牌方案", "集成测试在 finally 中关闭临时 Server"],
    memoryHook: "先验证，再鉴权；密钥注入，测试留证",
    code: `import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";

function createTeachingSignature(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}

async function readJson(request, maxBytes = 16 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new RangeError("body_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function createAuthServer({ credentials, tokenSecret }) {
  return createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("X-Content-Type-Options", "nosniff");

    if (request.method !== "POST" || request.url !== "/login") {
      response.statusCode = 404;
      return response.end(JSON.stringify({ error: "not_found" }));
    }

    try {
      const input = await readJson(request);
      if (typeof input.email !== "string" || typeof input.password !== "string") {
        response.statusCode = 400;
        return response.end(JSON.stringify({ error: "invalid_input" }));
      }
      if (!(await credentials.verify(input.email, input.password))) {
        response.statusCode = 401;
        return response.end(JSON.stringify({ error: "invalid_credentials" }));
      }

      const signedProof = createTeachingSignature({ sub: input.email, scope: ["learn"] }, tokenSecret);
      response.end(JSON.stringify({ signedProof }));
    } catch (error) {
      if (error instanceof RangeError && error.message === "body_too_large") {
        response.statusCode = 413;
        return response.end(JSON.stringify({ error: "body_too_large" }));
      }
      if (error instanceof SyntaxError) {
        response.statusCode = 400;
        return response.end(JSON.stringify({ error: "invalid_json" }));
      }

      response.statusCode = 500;
      response.end(JSON.stringify({ error: "internal_error" }));
    }
  });
}

test("合法凭证返回教学签名且不暴露密钥", async (t) => {
  const credentials = { verify: async () => false };
  const verify = t.mock.method(credentials, "verify", async () => true);
  const server = createAuthServer({ credentials, tokenSecret: "test-secret" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch("http://127.0.0.1:" + address.port + "/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "learner@example.com", password: "correct" })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(verify.mock.callCount(), 1);
    assert.equal(typeof body.signedProof, "string");
    assert.equal(JSON.stringify(body).includes("test-secret"), false);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("缺少 password 时不会调用凭证校验器", async (t) => {
  const credentials = { verify: async () => true };
  const verify = t.mock.method(credentials, "verify");
  const server = createAuthServer({ credentials, tokenSecret: "test-secret" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch("http://127.0.0.1:" + address.port + "/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "learner@example.com" })
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(Object.hasOwn(body, "signedProof"), false);
    assert.equal(verify.mock.callCount(), 0);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});`,
    entryFile: "auth-service.test.mjs",
    prompt: "缺少 password 的请求为什么必须在 credentials.verify 之前返回 400？",
    correct: "输入契约未通过，不应调用鉴权依赖，更不能生成教学签名",
    wrongA: "因为所有 POST 请求都必须返回 400",
    wrongB: "为了把 tokenSecret 写进错误响应",
    correctFeedback: "正确：验证失败要在副作用和安全决策之前短路，测试也应证明校验器没有被调用。",
    wrongAFeedback: "POST /login 在输入和凭证都有效时应返回成功；400 只代表请求数据不合格。",
    wrongBFeedback: "签名密钥绝不能出现在响应、日志或断言失败信息中。",
    lanes: ["验证输入", "Mock 鉴权", "签发与断言"],
    frameValues: ["email/password", "verify=1 call", "proof no secret"],
    log: ["POST /login parsed on ephemeral port", "missing password -> 400; verify calls=0", "valid credentials -> 200 teaching proof; secret absent"],
    summary: ["阶段项目用成功和非法输入两条真实 HTTP 集成测试验证鉴权边界", "外部凭证服务通过 Node Mock API 隔离，并证明非法输入不会调用该边界", "自定义 HMAC 仅演示完整性签名，不具备 JWT、过期、吊销或消费方验签等生产会话能力"],
    sourceTitle: "Test runner mocking",
    sourceUrl: "https://nodejs.org/api/test.html#mocking"
  })
];
