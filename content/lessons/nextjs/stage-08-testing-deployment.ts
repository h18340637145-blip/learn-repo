import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsQuickLesson } from "./nextjs-quick-lesson";

export const nextjsStageEightTestingDeploymentLessons: LessonSpec[] = [
  createNextjsQuickLesson({
    id: "nextjs-test-unit",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.1 · 测试与部署",
    title: "组件单元测试",
    objectives: ["用 Vitest 给纯函数和小组件建立第一层质量护栏"],
    prerequisites: ["nextjs-foundations-client-components"],
    concept: "单元测试像给代码装小型哨兵：输入固定值，断言输出必须稳定。它不关心真实浏览器和数据库，专门负责快速抓住业务函数、格式化器和轻量组件的退化。",
    points: ["单元测试速度快，适合频繁运行", "断言应该覆盖关键边界值", "不要把网络和数据库混进纯单测"],
    memoryHook: "小函数先验明，红灯阻断崩",
    fileName: "lib/format-price.test.ts",
    code: `import { describe, expect, test } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  test("把分转换成人民币展示", () => {
    expect(formatPrice(1299)).toBe("¥12.99");
  });
});`,
    prompt: "如果 formatPrice 被误改成直接返回 `¥1299`，这类测试会怎样保护项目？",
    correctLabel: "Vitest 断言失败，CI 阶段阻止错误进入主分支",
    wrongLabels: ["Next.js 会自动在生产修正金额", "浏览器会把字符串重新格式化"],
    correctExplanation: "单元测试通过固定输入和期望输出抓住逻辑退化，失败后测试进程返回非 0，流水线可以停止合并或部署。",
    visualizerType: "quality-shield",
    visualizerTitle: "单元断言护盾",
    nodes: ["输入样例", "执行函数", "断言输出", "失败红灯", "阻断合并"],
    sourceTitle: "Next.js Testing",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/testing",
    summary: ["单元测试适合快速验证纯逻辑", "边界值比快乐路径更能发现问题", "CI 中的红灯是质量护城河"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-test-rtl",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.2 · 测试与部署",
    title: "React Testing Library",
    objectives: ["用用户视角测试 Client Component 的可见行为"],
    prerequisites: ["nextjs-test-unit"],
    concept: "RTL 的核心哲学是像真实用户一样找元素、点击元素、观察屏幕变化，而不是窥探组件内部 state。这样重构内部实现时，只要用户体验不变，测试就不会脆弱崩塌。",
    points: ["优先使用 role、label、text 查询", "测试行为而不是实现细节", "适合验证表单、按钮和交互反馈"],
    memoryHook: "像用户一样点，不问内部变量名",
    fileName: "components/favorite-button.test.tsx",
    code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteButton } from "./favorite-button";

test("点击后展示已收藏", async () => {
  render(<FavoriteButton />);
  await userEvent.click(screen.getByRole("button", { name: "收藏" }));
  expect(screen.getByText("已收藏")).toBeInTheDocument();
});`,
    prompt: "为什么这里用按钮文字和屏幕文案断言，而不是检查组件内部 state 变量？",
    correctLabel: "因为用户只关心可见行为，内部变量名变化不应导致测试失效",
    wrongLabels: ["因为 Client Component 不能写测试", "因为 RTL 会读取服务器数据库"],
    correctExplanation: "RTL 鼓励黑盒测试。只要点击后用户看见“已收藏”，组件内部用 useState、useReducer 还是外部 store 都不影响测试价值。",
    visualizerType: "quality-shield",
    visualizerTitle: "用户视角交互测试",
    nodes: ["渲染组件", "按角色找按钮", "模拟点击", "观察文案", "通过断言"],
    sourceTitle: "Next.js with Jest and RTL",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/testing/jest",
    summary: ["RTL 测试外部行为", "查询方式越像用户越稳", "它给重构留下安全空间"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-test-e2e",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.3 · 测试与部署",
    title: "Playwright E2E 测试",
    objectives: ["用真实浏览器机器人验证核心用户链路"],
    prerequisites: ["nextjs-test-rtl"],
    concept: "E2E 测试启动真实浏览器访问真实服务，覆盖页面、网络、路由、CSS 和后端接口。它比单测慢，但能守住登录、结账、发布内容这类最关键链路。",
    points: ["E2E 验证完整用户旅程", "适合覆盖少量高价值路径", "失败截图和 trace 能帮助定位真实页面问题"],
    memoryHook: "真浏览器走一遍，核心链路才算稳",
    fileName: "e2e/login.spec.ts",
    code: `import { expect, test } from "@playwright/test";

test("用户可以登录进入仪表盘", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("admin@nodepath.dev");
  await page.getByLabel("密码").fill("secret");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/dashboard/);
});`,
    prompt: "这段 E2E 测试和 RTL 最大区别是什么？",
    correctLabel: "它驱动真实浏览器访问真实 Next.js 页面，能发现路由、样式、接口串联问题",
    wrongLabels: ["它只测试一个纯函数返回值", "它不需要启动应用服务"],
    correctExplanation: "Playwright 是端到端验证，运行成本更高，但覆盖从浏览器到服务端的完整链路，因此非常适合保护业务生命线。",
    visualizerType: "nextjs-routing-tree",
    visualizerTitle: "E2E 真机巡航",
    nodes: ["打开页面", "填写表单", "点击提交", "服务端处理", "断言跳转"],
    sourceTitle: "Next.js Playwright",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/testing/playwright",
    summary: ["E2E 适合关键路径而不是所有细节", "真实浏览器能暴露集成问题", "截图、录像和 trace 是定位利器"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-test-api",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.4 · 测试与部署",
    title: "API 路由测试",
    objectives: ["验证 Route Handler 的状态码、JSON 结构和错误分支"],
    prerequisites: ["nextjs-api-route-handler"],
    concept: "Route Handler 是后端接口，测试时应关注 HTTP 语义：方法是否正确、状态码是否准确、错误 JSON 是否稳定。可以直接调用导出的 GET/POST，也可以启动测试服务发真实请求。",
    points: ["接口测试要覆盖成功与失败分支", "断言状态码比只看 body 更可靠", "请求体和鉴权头应使用真实格式"],
    memoryHook: "状态码先定调，JSON 再验身",
    fileName: "app/api/todos/route.test.ts",
    code: `import { describe, expect, test } from "vitest";
import { POST } from "./route";

describe("POST /api/todos", () => {
  test("缺少 title 返回 400", async () => {
    const request = new Request("http://test/api/todos", {
      method: "POST",
      body: JSON.stringify({})
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});`,
    prompt: "为什么 API 测试应该明确断言 `response.status === 400`？",
    correctLabel: "因为 HTTP 状态码是客户端、监控和调用方判断错误类型的第一信号",
    wrongLabels: ["因为 JSON body 在 Next.js 里不能读取", "因为 400 会自动重试数据库"],
    correctExplanation: "接口契约不仅是返回文案，还包括状态码。错误状态码稳定，前端和外部调用方才知道如何处理失败。",
    visualizerType: "service-boundary",
    visualizerTitle: "接口契约检测站",
    nodes: ["构造请求", "进入 Route Handler", "校验输入", "返回 400", "断言契约"],
    sourceTitle: "Route Handlers",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
    summary: ["API 测试关注 HTTP 契约", "失败分支和成功分支同样重要", "状态码是系统间协作语言"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-deploy-vercel",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.5 · 测试与部署",
    title: "Vercel 部署",
    objectives: ["理解 Next.js 应用如何构建并分发到云端运行时"],
    prerequisites: ["nextjs-deploy-env"],
    concept: "现代 Next.js 部署会把静态资源、Server Component 渲染、Route Handler、Middleware 和 Edge Runtime 分别打包到合适的运行位置。推送代码后，平台构建、产物分析、全球分发和运行时承载会形成一条自动化链路。",
    points: ["构建产物按能力拆分到静态、服务端和边缘运行时", "部署平台会为每次提交生成可访问版本", "日志和环境变量属于部署后排查核心"],
    memoryHook: "提交即构建，产物分舱飞",
    fileName: "package.json",
    code: `{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}`,
    prompt: "Next.js 部署平台为什么不能只把整个项目当成一个普通静态文件夹上传？",
    correctLabel: "因为应用可能包含 Server Components、Route Handlers 和 Middleware，需要服务端或边缘运行时承载",
    wrongLabels: ["因为 CSS 文件不能部署", "因为 React 只能在本地运行"],
    correctExplanation: "Next.js 是混合渲染框架，不只是静态 HTML。部署时必须识别哪些资源可静态分发，哪些逻辑要运行在服务器或边缘函数里。",
    visualizerType: "nextjs-build-output",
    visualizerTitle: "部署产物分舱",
    nodes: ["next build", "分析路由", "静态资源 CDN", "Serverless 函数", "边缘中间件"],
    sourceTitle: "Next.js Deploying",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/deploying",
    summary: ["Next.js 部署是混合产物编排", "平台会按路由能力选择运行位置", "日志、环境变量和构建输出是排障入口"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-deploy-env",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.6 · 测试与部署",
    title: "环境变量管理",
    objectives: ["区分服务端私密变量与客户端公开变量"],
    prerequisites: ["nextjs-foundations-config"],
    concept: "Next.js 默认不会把普通环境变量暴露到浏览器。只有 `NEXT_PUBLIC_` 前缀变量会被打进客户端包。数据库连接串、OAuth secret、支付密钥必须保持在服务端。",
    points: ["私密变量只能在服务端读取", "NEXT_PUBLIC_ 变量会进入浏览器 JS", "预览和生产环境应分别配置变量"],
    memoryHook: "私密无前缀，公开才 PUBLIC",
    fileName: ".env.local",
    code: `DATABASE_URL="postgres://user:pass@db/app"
AUTH_SECRET="server-only-secret"
NEXT_PUBLIC_ANALYTICS_ID="pub_123"`,
    prompt: "哪个变量会被允许进入客户端 JavaScript 包？",
    correctLabel: "`NEXT_PUBLIC_ANALYTICS_ID`，因为它带有明确公开前缀",
    wrongLabels: ["`DATABASE_URL`，因为页面需要数据库", "`AUTH_SECRET`，因为登录按钮要用它"],
    correctExplanation: "只有 NEXT_PUBLIC_ 前缀变量会被内联进客户端构建。数据库和认证密钥必须留在服务端。",
    visualizerType: "nextjs-build-output",
    visualizerTitle: "环境变量隔离门",
    nodes: ["读取 .env", "识别前缀", "服务端保密", "客户端内联公开值", "部署环境覆盖"],
    sourceTitle: "Next.js Environment Variables",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/configuring/environment-variables",
    summary: ["环境变量是秘密边界", "公开变量必须显式加前缀", "每个部署环境都需要独立配置"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-deploy-preview",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.7 · 测试与部署",
    title: "Preview 部署",
    objectives: ["理解每个分支/PR 的独立预览环境如何提高协作效率"],
    prerequisites: ["nextjs-deploy-vercel"],
    concept: "Preview 部署把一次分支提交变成独立可访问的网址。产品、设计、测试可以在合并前直接打开真实页面确认改动，不再只靠截图和口头描述。",
    points: ["Preview URL 对应某次提交或 PR", "预览环境应使用非生产数据库和密钥", "视觉回归和手动验收都可以基于预览链接完成"],
    memoryHook: "未合先进舱，人人看现场",
    fileName: ".github/pull_request_template.md",
    code: `## 预览检查
- Preview URL:
- 已验证页面:
- 已验证移动端:
- 数据库环境: preview
- 回滚方案:`,
    prompt: "为什么 Preview 环境不应该直接使用生产数据库？",
    correctLabel: "因为预览代码还没合并，测试数据和危险写入必须与生产隔离",
    wrongLabels: ["因为预览页面不能访问任何 API", "因为生产数据库只支持 main 分支"],
    correctExplanation: "Preview 是验收场，不是生产场。它应尽量模拟真实系统，但数据和密钥必须隔离，避免未审核代码影响真实用户。",
    visualizerType: "nextjs-build-output",
    visualizerTitle: "预览部署分支舱",
    nodes: ["PR 提交", "自动构建", "生成 Preview URL", "隔离变量", "协作验收"],
    sourceTitle: "Vercel Preview Deployments",
    sourceUrl: "https://vercel.com/docs/deployments/preview-deployments",
    summary: ["Preview 让改动在合并前可体验", "预览环境应隔离数据和密钥", "它是产品验收和视觉 QA 的重要入口"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-deploy-ci",
    stageId: "nextjs-testing-deployment",
    eyebrow: "08.8 · 测试与部署",
    title: "CI/CD 流水线",
    objectives: ["把 lint、测试、构建和部署串成自动质量闸门"],
    prerequisites: ["nextjs-test-api", "nextjs-deploy-preview"],
    concept: "CI/CD 的价值不是“自动把错代码发上去”，而是在部署前自动执行 lint、test、build、E2E 等关卡。任何一步红灯，部署都应该停止。",
    points: ["CI 负责持续集成和质量检查", "CD 负责通过检查后的自动交付", "密钥使用平台 secrets，不写入仓库"],
    memoryHook: "绿灯才发车，红灯就熔断",
    fileName: ".github/workflows/ci.yml",
    code: `name: ci
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
    prompt: "如果 `npm test` 失败，流水线下一步应该做什么？",
    correctLabel: "立即停止，不继续 build 或 deploy，等待修复后重新跑",
    wrongLabels: ["继续部署，用户发现再回滚", "把失败测试自动删除"],
    correctExplanation: "CI 是质量闸门。测试失败意味着当前提交不可信，继续部署会把风险扩散到预览或生产环境。",
    visualizerType: "quality-shield",
    visualizerTitle: "流水线质量闸门",
    nodes: ["拉取代码", "安装依赖", "Lint", "Test", "Build/Deploy"],
    sourceTitle: "GitHub Actions",
    sourceUrl: "https://docs.github.com/actions",
    summary: ["CI/CD 让质量检查自动化", "失败必须阻断后续阶段", "secrets 负责保护部署密钥"]
  }),

  createNextjsQuickLesson({
    id: "project-nextjs-test-suite",
    stageId: "nextjs-testing-deployment",
    kind: "stage-project",
    eyebrow: "阶段项目 08 · 测试与部署",
    title: "自动化测试套件",
    difficulty: "进阶",
    objectives: ["综合搭建覆盖组件、API、E2E 和部署预览的质量系统"],
    prerequisites: ["nextjs-test-unit", "nextjs-test-rtl", "nextjs-test-e2e", "nextjs-test-api", "nextjs-deploy-ci"],
    concept: "阶段项目要求你为一个迷你商城建立质量护城河：价格格式化用单测守住，收藏按钮用 RTL 守住，下单 API 用接口测试守住，登录购买链路用 Playwright 守住，最后用 CI 把它们串成合并前必须通过的闸门。",
    points: ["不同测试层级守护不同风险", "CI 让团队协作不靠自觉", "Preview URL 让非开发成员也能参与验收"],
    memoryHook: "四层护盾合一，发布才敢飞",
    fileName: "tests/quality-plan.md",
    code: `# NodePath Shop 质量计划
1. Unit: formatPrice / calculateDiscount
2. RTL: FavoriteButton / CartSummary
3. API: POST /api/orders
4. E2E: login -> add to cart -> checkout
5. CI: lint -> test -> build -> preview`,
    prompt: "这个项目为什么同时需要 Unit、RTL、API 和 E2E，而不是只保留一种测试？",
    correctLabel: "因为不同层级发现不同风险：函数退化、交互失效、接口契约破裂和真实链路崩坏都需要对应护栏",
    wrongLabels: ["因为测试越多页面运行越快", "因为 Next.js 强制四种测试都必须写"],
    correctExplanation: "完整质量体系是分层防御。小测试快而精，E2E 慢但真实；组合起来才能在成本和信心之间取得平衡。",
    visualizerType: "stage-project-core",
    visualizerTitle: "测试部署综合护城河",
    nodes: ["单测哨兵", "交互哨兵", "接口哨兵", "E2E 巡航", "CI 闸门"],
    sourceTitle: "Next.js Testing",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/testing",
    summary: ["测试体系要按风险分层", "CI 是团队协作的自动裁判", "预览部署把验证从开发扩展到产品和设计"]
  })
];
