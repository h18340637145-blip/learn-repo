import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsQuickLesson } from "./nextjs-quick-lesson";

export const nextjsStageNineArchitectureAdvancedLessons: LessonSpec[] = [
  createNextjsQuickLesson({
    id: "nextjs-advanced-i18n",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.1 · 高级模式",
    title: "国际化 i18n",
    objectives: ["掌握基于 locale 路由组织多语言页面的基本模式"],
    prerequisites: ["nextjs-routing-dynamic"],
    concept: "国际化不是把页面文案复制三份，而是把语言作为路由和数据选择的一部分。常见做法是使用 `[locale]` 段包住应用，再按 locale 加载对应字典。",
    points: ["locale 可以来自 URL 段、Cookie 或请求头", "字典应在服务端加载，避免客户端包过大", "SEO 需要为多语言页面提供稳定 URL"],
    memoryHook: "语言进路由，字典随端出",
    fileName: "app/[locale]/page.tsx",
    code: `const dictionaries = {
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default)
};

export default async function Home({ params }: { params: { locale: "zh" | "en" } }) {
  const dict = await dictionaries[params.locale]();
  return <h1>{dict.title}</h1>;
}`,
    prompt: "为什么多语言字典更适合按当前 locale 在服务端加载？",
    correctLabel: "避免把所有语言一次性打进客户端包，并让页面 HTML 直接带有正确语言内容",
    wrongLabels: ["因为 JSON 不能在浏览器解析", "因为动态路由不能携带 locale"],
    correctExplanation: "服务端按 locale 加载字典，可以减少客户端无用语言体积，也让搜索引擎和首次渲染拿到正确语言 HTML。",
    visualizerType: "nextjs-routing-tree",
    visualizerTitle: "多语言路由树",
    nodes: ["请求 /zh", "解析 locale", "加载 zh 字典", "渲染 HTML", "输出语言页面"],
    sourceTitle: "Next.js Internationalization",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/routing/internationalization",
    summary: ["i18n 应该进入路由和数据层", "按需加载字典可控制包体积", "多语言 SEO 依赖稳定 URL"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-optimistic",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.2 · 高级模式",
    title: "乐观更新",
    objectives: ["理解 useOptimistic 如何让 Server Action 交互更即时"],
    prerequisites: ["nextjs-data-server-actions"],
    concept: "乐观更新是在服务器确认前先把最可能成功的结果展示给用户。如果后端失败，再回滚或展示错误。这能让点赞、收藏、发送消息等动作拥有几乎零延迟体验。",
    points: ["乐观状态不等于真实数据库状态", "失败时必须有回滚或错误提示", "适合成功率高、可补偿的交互"],
    memoryHook: "先给你看成功，失败再撤兵",
    fileName: "components/like-button.tsx",
    code: `"use client";
import { useOptimistic } from "react";
import { likePost } from "@/app/actions";

export function LikeButton({ count, postId }: { count: number; postId: string }) {
  const [optimisticCount, addOptimistic] = useOptimistic(count, (state) => state + 1);
  return (
    <form action={async () => {
      addOptimistic(undefined);
      await likePost(postId);
    }}>
      <button>点赞 {optimisticCount}</button>
    </form>
  );
}`,
    prompt: "用户点击点赞后，在服务器写库完成前为什么数字能立刻 +1？",
    correctLabel: "因为 useOptimistic 先创建临时 UI 状态，真实写库仍由 Server Action 完成",
    wrongLabels: ["因为数据库一定已经同步成功", "因为浏览器直接修改了生产数据库"],
    correctExplanation: "乐观更新提升的是感知速度，不是省略服务端写入。真正数据仍由 Server Action 落库，失败时需要处理回滚或错误提示。",
    visualizerType: "nextjs-data-flow",
    visualizerTitle: "乐观 UI 双轨流",
    nodes: ["点击按钮", "临时 +1", "Server Action", "数据库确认", "状态收敛"],
    sourceTitle: "React useOptimistic",
    sourceUrl: "https://react.dev/reference/react/useOptimistic",
    summary: ["乐观更新改善交互体感", "真实状态仍来自服务端确认", "失败处理是乐观 UI 的必要配套"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-realtime",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.3 · 高级模式",
    title: "实时订阅",
    objectives: ["理解 Next.js 中实时能力通常如何与外部实时服务协作"],
    prerequisites: ["nextjs-api-streaming"],
    concept: "Next.js 页面负责渲染和路由，实时消息通常交给 WebSocket、SSE、Supabase Realtime、Pusher 等专门通道。关键是把初始数据和后续增量数据分清：Server Component 先给首屏，Client Component 订阅后续变化。",
    points: ["首屏数据适合服务端获取", "实时增量需要客户端订阅", "订阅要在组件卸载时清理"],
    memoryHook: "首屏服务端，增量走长线",
    fileName: "components/live-feed.tsx",
    code: `"use client";
import { useEffect, useState } from "react";

export function LiveFeed({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial);
  useEffect(() => {
    const socket = new WebSocket("wss://example.com/feed");
    socket.onmessage = (event) => setItems((list) => [event.data, ...list]);
    return () => socket.close();
  }, []);
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}`,
    prompt: "为什么实时订阅代码必须放在 Client Component 中？",
    correctLabel: "因为 WebSocket 是浏览器长连接能力，Server Component 不持有用户浏览器生命周期",
    wrongLabels: ["因为 Server Component 不能接收 props", "因为实时数据不能展示在 React 中"],
    correctExplanation: "Server Component 适合生成首屏，浏览器生命周期中的持续连接需要 Client Component 管理，并在卸载时清理连接。",
    visualizerType: "realtime-mesh",
    visualizerTitle: "首屏与实时增量分流",
    nodes: ["服务端首屏", "水合组件", "建立 WebSocket", "接收增量", "关闭连接"],
    sourceTitle: "Next.js Client Components",
    sourceUrl: "https://nextjs.org/docs/app/getting-started/server-and-client-components",
    summary: ["实时系统要区分首屏和增量", "浏览器长连接属于客户端生命周期", "清理订阅能避免内存和连接泄漏"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-edge",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.4 · 高级模式",
    title: "Edge 与 Serverless",
    objectives: ["区分 Edge Runtime 与 Node.js Serverless Runtime 的能力边界"],
    prerequisites: ["nextjs-api-edge-runtime"],
    concept: "Edge Runtime 离用户更近，冷启动轻，适合鉴权、重定向、轻量 A/B、地理判断；但它不是完整 Node.js，不能依赖所有 Node 内置模块和长时间任务。数据库重查询、文件系统、重 CPU 任务更适合 Node.js Runtime。",
    points: ["Edge 适合轻量、低延迟、无状态逻辑", "Node.js Runtime 适合完整依赖和重后端任务", "运行时选择会影响可用 API 和部署位置"],
    memoryHook: "边缘判得快，重活回机房",
    fileName: "app/api/geo/route.ts",
    code: `export const runtime = "edge";

export function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country") ?? "unknown";
  return Response.json({ country });
}`,
    prompt: "这段 Edge Route Handler 最适合做哪类事情？",
    correctLabel: "读取请求头并做轻量地理分流，快速返回小 JSON",
    wrongLabels: ["运行本地 sharp 处理 500MB 图片", "直接读取服务器磁盘上的日志文件"],
    correctExplanation: "Edge Runtime 的优势是近和快，但能力边界更窄。轻量请求判断很合适，重依赖、文件系统和长任务应放回 Node.js Runtime。",
    visualizerType: "nextjs-middleware-chain",
    visualizerTitle: "Edge 近场决策层",
    nodes: ["请求就近进入", "Edge Runtime", "读取请求头", "轻量决策", "快速响应"],
    sourceTitle: "Edge Runtime",
    sourceUrl: "https://nextjs.org/docs/app/api-reference/edge",
    summary: ["Edge 不是完整 Node.js", "低延迟逻辑适合放边缘", "重任务要选择 Node.js Runtime"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-isr-demand",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.5 · 高级模式",
    title: "按需 ISR",
    objectives: ["掌握内容变更后用 tag/path 精确刷新缓存的模式"],
    prerequisites: ["nextjs-data-revalidate"],
    concept: "定时 revalidate 适合周期更新，按需 ISR 适合 CMS 发布后立即刷新。后台发布文章后调用一个受保护的 revalidation 接口，让相关 tag 或 path 失效，下一次请求就拿到新内容。",
    points: ["按需刷新需要鉴权，不能暴露给任何人", "revalidateTag 适合数据标签，revalidatePath 适合路径", "刷新不是重新部署，而是缓存失效"],
    memoryHook: "内容一发布，缓存点名清",
    fileName: "app/api/revalidate/route.ts",
    code: `import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const { tag } = await request.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true, tag });
}`,
    prompt: "为什么 revalidate 接口必须检查 secret？",
    correctLabel: "否则任何人都能刷爆缓存失效接口，制造性能问题甚至内容异常",
    wrongLabels: ["因为 revalidateTag 只能在客户端调用", "因为 tag 名称必须写死在 URL 里"],
    correctExplanation: "按需 ISR 是缓存控制能力，必须保护。只有 CMS 或可信后台能触发刷新，否则缓存层会被恶意请求扰乱。",
    visualizerType: "nextjs-data-flow",
    visualizerTitle: "按需缓存刷新链",
    nodes: ["CMS 发布", "调用受保护接口", "校验 secret", "revalidateTag", "下一次请求取新内容"],
    sourceTitle: "Next.js revalidateTag",
    sourceUrl: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag",
    summary: ["按需 ISR 用于内容发布后即时更新", "刷新接口必须鉴权", "tag 和 path 是两种常见缓存失效粒度"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-compose",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.6 · 高级模式",
    title: "组合模式",
    objectives: ["学会把 Server Component 数据壳与 Client Component 交互岛组合起来"],
    prerequisites: ["nextjs-rendering-sc-vs-cc"],
    concept: "App Router 最迷人的模式之一是“服务端拿数据、客户端管交互”。例如商品页整体是 Server Component，收藏按钮、购物车按钮是小 Client Island。这样既保留首屏性能，又不会把整页都变成客户端包。",
    points: ["默认保持 Server Component", "只把真正需要交互的部分标为 use client", "用 children 或 props 把服务端内容传入客户端外壳"],
    memoryHook: "大壳在服务端，小岛才客户端",
    fileName: "app/products/[id]/page.tsx",
    code: `import { FavoriteButton } from "@/components/favorite-button";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <FavoriteButton productId={product.id} />
    </main>
  );
}`,
    prompt: "为什么不应该为了一个收藏按钮把整个 ProductPage 都改成 Client Component？",
    correctLabel: "因为页面主体可在服务端渲染，只需要把真正有交互的按钮做成客户端小岛",
    wrongLabels: ["因为 Client Component 不能接收 props", "因为 Server Component 不能渲染 HTML"],
    correctExplanation: "组合模式能保持最小客户端边界。页面数据和静态内容留在服务端，只有需要事件处理和状态的按钮进入客户端包。",
    visualizerType: "nextjs-component-boundary",
    visualizerTitle: "服务端壳 + 客户端小岛",
    nodes: ["Server Page", "读取商品", "渲染静态内容", "嵌入交互按钮", "最小客户端包"],
    sourceTitle: "Composition Patterns",
    sourceUrl: "https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components",
    summary: ["组合模式是控制包体积的关键", "客户端边界越小，首屏越轻", "Server 和 Client 组件可以自然嵌套协作"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-monorepo",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.7 · 高级模式",
    title: "Monorepo 架构",
    objectives: ["理解多应用共享 UI、配置和类型的仓库组织方式"],
    prerequisites: ["nextjs-deploy-ci"],
    concept: "当团队同时维护官网、后台、文档站和共享组件库时，Monorepo 能把它们放在一个仓库中统一版本、统一 CI、统一依赖图。Turborepo 等工具会按依赖关系只构建受影响项目。",
    points: ["apps 放应用，packages 放共享库", "workspace:* 让内部包像 npm 包一样被引用", "缓存和依赖图能显著减少重复构建"],
    memoryHook: "多应用一仓管，改哪构哪边",
    fileName: "turbo.json",
    code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    }
  }
}`,
    prompt: "在 Monorepo 中只改了 packages/ui 的 Button，为什么后台和官网可能都需要重新构建？",
    correctLabel: "因为它们依赖共享 UI 包，构建工具会沿依赖图找到受影响应用",
    wrongLabels: ["因为所有应用必须每次全量构建", "因为 workspace 包不能被 Next.js 引用"],
    correctExplanation: "Monorepo 工具会分析依赖图。共享库变更会影响依赖它的应用，但无关应用可以命中缓存或跳过。",
    visualizerType: "nextjs-build-output",
    visualizerTitle: "Monorepo 依赖图构建",
    nodes: ["修改共享包", "分析依赖图", "命中缓存", "重建受影响应用", "输出部署产物"],
    sourceTitle: "Turborepo Monorepos",
    sourceUrl: "https://turbo.build/repo/docs/handbook/what-is-a-monorepo",
    summary: ["Monorepo 适合多应用共享核心资产", "依赖图决定哪些项目受影响", "缓存是大型仓库的性能关键"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-advanced-performance",
    stageId: "nextjs-advanced-patterns",
    eyebrow: "09.8 · 高级模式",
    title: "性能调优实战",
    objectives: ["用 Core Web Vitals、包体积和缓存命中率定位真实性能问题"],
    prerequisites: ["nextjs-style-bundle", "nextjs-rendering-cache"],
    concept: "性能调优不是盲目加动画，而是找到瓶颈：LCP 慢可能是图片或服务端等待；INP 差可能是客户端 JS 太重；TTFB 高可能是缓存失效或后端查询慢。Next.js 提供 Image、Metadata、缓存、动态导入和 bundle 分析等工具。",
    points: ["先测量，再优化", "减少客户端 JS 是 App Router 的核心收益", "缓存命中率和数据查询常决定 TTFB"],
    memoryHook: "先量指标，再砍包体",
    fileName: "next.config.ts",
    code: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }]
  }
};

export default nextConfig;`,
    prompt: "如果页面 INP 很差，最应该先检查什么？",
    correctLabel: "客户端 JS 是否过重、交互处理是否阻塞主线程、是否可以拆分 Client Component",
    wrongLabels: ["只把所有图片改成 PNG", "删除所有 Server Component"],
    correctExplanation: "INP 衡量交互响应。问题通常来自客户端脚本、长任务和事件处理阻塞，而不是简单换图片格式。",
    visualizerType: "diagnostics-tower",
    visualizerTitle: "性能指标诊断塔",
    nodes: ["采集 Web Vitals", "定位瓶颈", "拆分客户端包", "优化缓存/图片", "复测指标"],
    sourceTitle: "Next.js Optimizing",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/optimizing",
    summary: ["性能调优必须以指标为入口", "App Router 的关键收益是减少客户端负担", "优化完成后必须复测"]
  }),

  createNextjsQuickLesson({
    id: "project-nextjs-realtime-dashboard",
    stageId: "nextjs-advanced-patterns",
    kind: "stage-project",
    eyebrow: "阶段项目 09 · 高级模式",
    title: "实时仪表盘",
    difficulty: "进阶",
    objectives: ["综合 i18n、实时订阅、乐观更新、缓存刷新、Edge 和性能调优构建生产级仪表盘"],
    prerequisites: ["nextjs-advanced-realtime", "nextjs-advanced-edge", "nextjs-advanced-isr-demand", "nextjs-advanced-performance"],
    concept: "终局项目是一块运营实时仪表盘：Server Component 渲染首屏指标，Client Component 订阅实时事件，管理员操作使用乐观更新，CMS 发布公告后按需刷新缓存，边缘层做地区分流，最后用性能指标监控页面健康。",
    points: ["首屏、实时和写入是三条不同数据流", "高级模式的难点是组合边界，而不是单个 API", "生产仪表盘必须可观测、可回滚、可扩展"],
    memoryHook: "首屏稳，实时灵，边缘快，指标明",
    fileName: "app/[locale]/dashboard/page.tsx",
    code: `import { Suspense } from "react";
import { LiveFeed } from "@/components/live-feed";
import { MetricsCards } from "./metrics-cards";

export default async function Dashboard({ params }: { params: { locale: string } }) {
  const metrics = await getCachedMetrics();
  const initialEvents = await getRecentEvents();

  return (
    <main>
      <MetricsCards locale={params.locale} metrics={metrics} />
      <Suspense fallback={<p>加载实时事件...</p>}>
        <LiveFeed initial={initialEvents} />
      </Suspense>
    </main>
  );
}`,
    prompt: "这块仪表盘为什么要把首屏指标和实时事件拆成两条流？",
    correctLabel: "首屏指标需要稳定快速渲染，实时事件需要浏览器长连接持续追加，二者生命周期不同",
    wrongLabels: ["因为 Server Component 不能展示列表", "因为实时数据必须每秒重新部署"],
    correctExplanation: "生产级仪表盘要分清首屏渲染、客户端订阅和后台 mutation。把不同生命周期的数据流拆开，才能同时获得性能、实时性和可维护性。",
    visualizerType: "stage-project-core",
    visualizerTitle: "实时仪表盘全链路星舰",
    nodes: ["i18n 路由", "服务端指标首屏", "客户端实时订阅", "乐观管理动作", "按需刷新缓存", "性能监控"],
    sourceTitle: "Next.js App Router",
    sourceUrl: "https://nextjs.org/docs/app",
    summary: ["终局项目把高级模式组合成生产系统", "数据流生命周期决定组件边界", "可观测和性能复测是上线后的核心工作"]
  })
];
