import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageOneRoutingLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-routing-dynamic",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.1 · 路由系统",
    title: "动态路由 [slug]",
    objectives: ["掌握如何在 Next.js 中创建动态路由", "理解 params 对象的使用"],
    prerequisites: ["nextjs-foundations-pages"],
    concept: "在应用中，你通常需要根据动态数据（如文章 ID 或分类名）来渲染页面。在 App Router 中，你可以用方括号将文件夹命名为动态段（如 `[id]` 或 `[slug]`）。",
    points: ["方括号定义动态参数", "参数通过组件的 props.params 暴露", "Next.js 15+ 中 params 变为 Promise"],
    memoryHook: "方括号抓取 URL 段",
    files: [{ name: "app/blog/[slug]/page.tsx", code: `export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <h1>正在阅读文章: {slug}</h1>;
}` }],
    entryFile: "app/blog/[slug]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果访问 /blog/nextjs-routing，页面的标题是什么？",
      options: [
        { id: "a", label: "正在阅读文章: [slug]", detail: "字面量", feedback: "动态参数会被解析替换。" },
        { id: "b", label: "正在阅读文章: nextjs-routing", detail: "参数被注入", feedback: "正确：URL 路径 `nextjs-routing` 匹配了 `[slug]` 段，并在页面中提取渲染。" },
        { id: "c", label: "返回 404", detail: "没有具体文件夹", feedback: "动态路由可以匹配任意这一层级的路径。" }
      ],
      answerId: "b",
      correctExplanation: "动态路由的核心是把 URL 中特定的部分提取为变量。使用 `[slug]` 定义的文件夹会捕获该路径段，并通过 `params` 对象传递给页面，使得单个页面组件能够渲染无数条动态数据内容。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "blog/", "[slug]/", "page.tsx", "HTML"] },
      lanes: ["请求路径", "路由匹配", "组件渲染"],
      frames: [
        { activeLane: 0, laneValues: ["GET /blog/nextjs-routing", "等待", "等待"], log: ["浏览器发起请求..."], note: "请求到达 Next.js", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "匹配 [slug]", "等待"], log: ["解析 params: { slug: 'nextjs-routing' }"], note: "动态段捕获了值", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "渲染完毕"], log: ["将参数传递给 page.tsx 并渲染 HTML"], note: "页面成功展示动态内容", delayMs: 800 }
      ]
    },
    sources: [{ title: "Dynamic Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes" }],
    summary: ["使用 [folderName] 语法创建动态路由", "可以在任意嵌套层级使用动态段", "支持 [...catchAll] 等更复杂的匹配模式"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-groups",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.2 · 路由系统",
    title: "路由组 (Route Groups)",
    objectives: ["学习如何在不影响 URL 结构的情况下组织文件", "掌握创建独立的根布局"],
    prerequisites: ["nextjs-foundations-layouts"],
    concept: "有时候你想在 `app` 目录中整理文件结构，但不想改变应用的 URL 路径。你可以使用小括号将文件夹包裹起来创建路由组，例如 `(marketing)`。路由组内的文件夹不会包含在最终的 URL 路径中。",
    points: ["圆括号 (folderName) 创建路由组", "不会影响 URL 路径结构", "常用于分离有不同布局（layout.tsx）的页面区段"],
    memoryHook: "小括号分组，URL 隐形",
    files: [{ name: "app/(shop)/shoes/page.tsx", code: `export default function ShoesPage() {
  return <h1>鞋子列表</h1>;
}` }],
    entryFile: "app/(shop)/shoes/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个结构下，用户应该访问哪个 URL 来查看 ShoesPage？",
      options: [
        { id: "a", label: "/(shop)/shoes", detail: "按物理路径", feedback: "路由组名称不会出现在 URL 中。" },
        { id: "b", label: "/shoes", detail: "忽略括号", feedback: "正确：路由组 `(shop)` 在 URL 解析时被忽略，所以路径直接是 `/shoes`。" },
        { id: "c", label: "/shop/shoes", detail: "只忽略括号符号", feedback: "整个 `(shop)` 文件夹都会在 URL 中被忽略。" }
      ],
      answerId: "b",
      correctExplanation: "路由组的主要作用是**逻辑分组和应用不同的共享布局**。通过将文件夹放在 `(group)` 中，你可以在不破坏对外 URL 的前提下，让营销页面、后台页面各自拥有一套独立的 `layout.tsx`。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "(shop)/", "shoes/", "page.tsx", "HTML"] },
      lanes: ["请求 URL", "路由忽略组", "返回页面"],
      frames: [
        { activeLane: 0, laneValues: ["GET /shoes", "等待", "等待"], log: ["收到 /shoes 路径请求"], note: "尝试匹配路由", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "跳过 (shop) 目录", "等待"], log: ["发现 (shop) 是路由组，穿透匹配其内部目录"], note: "Next.js 将 /shoes 映射到了 app/(shop)/shoes", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "渲染页面"], log: ["渲染 shoes/page.tsx"], note: "页面正常显示", delayMs: 800 }
      ]
    },
    sources: [{ title: "Route Groups", url: "https://nextjs.org/docs/app/building-your-application/routing/route-groups" }],
    summary: ["路由组用于组织项目结构", "路由组允许创建多个同级别的根布局", "组名用圆括号包裹并且在 URL 中透明"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-parallel",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.3 · 路由系统",
    title: "并行路由 (@slot)",
    objectives: ["了解如何同时或有条件地渲染多个页面"],
    prerequisites: ["nextjs-routing-groups"],
    concept: "并行路由允许你在同一个布局中渲染多个视图。通过使用 `@folder` 约定来定义一个“插槽”（Slot）。布局组件（layout.tsx）可以将这些插槽作为独立的 props 接收并同时渲染它们。常用于构建仪表盘、侧边栏和复杂的模态框。",
    points: ["使用 @folder 定义命名插槽", "插槽作为 props 传递给同级的 layout.tsx", "各个插槽可以拥有独立的加载和错误状态"],
    memoryHook: "@符号插槽，布局并行",
    files: [{ name: "app/layout.tsx", code: `export default function RootLayout({
  children,
  analytics, // 对应 @analytics 插槽
  team,      // 对应 @team 插槽
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <html>
      <body>
        <main>{children}</main>
        <aside>{analytics}</aside>
        <aside>{team}</aside>
      </body>
    </html>
  );
}` }],
    entryFile: "app/layout.tsx",
    answer: {
      type: "prediction",
      prompt: "如果我们在 app 目录下创建了 `@analytics/page.tsx` 和 `@team/page.tsx`，这两个页面的内容如何展示？",
      options: [
        { id: "a", label: "它们是不同的 URL，一次只能看一个", detail: "像普通的路由", feedback: "并行路由是用来在同一个 URL 下同时展示的。" },
        { id: "b", label: "它们会作为 analytics 和 team props 注入到 layout 中并同时渲染", detail: "并行插槽渲染", feedback: "正确：插槽内的页面会作为同名的 props 自动传递给同级的 layout 并可以一起呈现。" },
        { id: "c", label: "它们会覆盖 children 插槽", detail: "替换主内容", feedback: "不会覆盖，它们是和 children 平行的额外内容区。" }
      ],
      answerId: "b",
      correctExplanation: "并行路由的核心是将一个大页面解构为多个独立的子区域。不仅使得 `layout.tsx` 结构更清晰，而且每一个 `@slot` 内部还可以拥有自己的 `loading.tsx` 或 `error.tsx`，从而实现高度局部化的状态管理。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["Root", "children", "@analytics", "@team", "Render"] },
      lanes: ["匹配插槽", "并行解析", "合并布局"],
      frames: [
        { activeLane: 0, laneValues: ["加载根路由", "等待", "等待"], log: ["发现 3 个并行的子树: children, @analytics, @team"], note: "准备加载所有区域", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "并发执行渲染", "等待"], log: ["渲染 children...", "渲染 @analytics...", "渲染 @team..."], note: "三个区域同时进行数据获取和渲染", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "布局合成"], log: ["将三个结果作为 props 注入 RootLayout"], note: "页面完整呈现，局部加载互不干扰", delayMs: 800 }
      ]
    },
    sources: [{ title: "Parallel Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/parallel-routes" }],
    summary: ["@folder 约定用于创建命名插槽", "适合构建高度动态、分治的界面组合（如 Dashboard）", "提升不同区块间的独立加载与异常隔离能力"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-intercepting",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.4 · 路由系统",
    title: "拦截路由 ((..))",
    objectives: ["理解拦截路由在改变上下文时保持 URL 不变的模式"],
    prerequisites: ["nextjs-routing-parallel"],
    concept: "拦截路由可以在不离开当前上下文的情况下，加载另一个应用内的路由。例如在瀑布流图片列表里点击一张图片，你想以弹窗（Modal）的形式展示它，同时将 URL 更新为图片的专属链接。但如果用户复制了这个链接直接打开或刷新页面，他们应该看到完整的独立图片页面。",
    points: ["使用 (.)，(..)，(...) 匹配拦截层级", "常与并行路由结合实现路由级别的 Modal", "支持软导航拦截和硬导航回退"],
    memoryHook: "括号点点，拦截路由做弹窗",
    files: [{ name: "app/feed/(..)photo/[id]/page.tsx", code: `import Modal from '../../components/Modal';

export default function InterceptedPhoto({ params }: any) {
  // 当从 /feed 跳转到 /photo/[id] 时，这个组件会作为弹窗被拦截渲染
  return (
    <Modal>
      <h1>拦截到的照片弹窗: {params.id}</h1>
    </Modal>
  );
}` }],
    entryFile: "app/feed/(..)photo/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果用户直接在浏览器地址栏输入 `/photo/123` 并按下回车（硬导航），会看到拦截弹窗吗？",
      options: [
        { id: "a", label: "会，因为有拦截路由存在", detail: "始终拦截", feedback: "拦截路由仅在 Next.js 的客户端软路由跳转中生效。" },
        { id: "b", label: "不会，会渲染原始的独立的 /photo/[id]/page.tsx", detail: "硬导航触发完全刷新", feedback: "正确：硬刷新或直接访问时，Next.js 会渲染被拦截的原始页面，确保链接的可分享性。" },
        { id: "c", label: "会报错 404", detail: "找不到路径", feedback: "只要定义了标准的 `/photo/[id]`，就不会 404。" }
      ],
      answerId: "b",
      correctExplanation: "拦截路由的魔力在于“上下文感知”。当你通过 `<Link>` 正常点击过去时，Next.js 知道你从哪来，因此用 `(..)` 捕获请求并将其渲染在当前页面的弹窗槽位里。而当页面被刷新或直接访问时，脱离了原先的上下文，它会回退为渲染一个完整的独立页面。这完美解决了传统的弹窗组件与 URL 状态不同步的问题。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["/feed", "点击 Link", "拦截匹配", "渲染 Modal", "URL 更新"] },
      lanes: ["触发导航", "软硬判断", "执行渲染"],
      frames: [
        { activeLane: 0, laneValues: ["点击图片 Link", "等待", "等待"], log: ["Next.js 拦截到客户端导航去往 /photo/123"], note: "这属于软导航 (Soft Navigation)", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "匹配到 (..)photo", "等待"], log: ["当前位于 /feed，符合 (..) 层级拦截条件"], note: "寻找拦截路由定义", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "并行插入弹窗"], log: ["在 @modal 槽位中渲染弹窗，并更新浏览器 URL"], note: "展示弹窗且 URL 发生了变化，但底层页面没有销毁", delayMs: 800 }
      ]
    },
    sources: [{ title: "Intercepting Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes" }],
    summary: ["(..) 语法类似于目录遍历，用于向上匹配路由片段", "实现可分享、可刷新、并且用户体验极佳的 URL 绑定模态框", "硬导航访问时回退到原始路由"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-loading",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.5 · 路由系统",
    title: "loading.tsx 加载状态",
    objectives: ["学会使用 loading.tsx 提升数据获取时的用户体验"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "在应用中，服务端组件可能会花费时间来获取数据。与其让用户点击链接后看着毫无反应的页面等待，Next.js 允许你放置一个 `loading.tsx` 文件。它会自动把同级的 `page.tsx` 包裹在 React Suspense 边界中，在数据准备好之前，立即显示加载骨架屏。",
    points: ["特殊的 loading.tsx 文件会自动生成 Suspense 边界", "在同一文件夹内的布局（layout）下方挂载", "页面和子布局在加载时被替换为 Loading UI"],
    memoryHook: "放入 loading，瞬间响应加载态",
    files: [{ name: "app/dashboard/loading.tsx", code: `export default function Loading() {
  return <div className="skeleton-spinner">数据加载中...</div>;
}` }, { name: "app/dashboard/page.tsx", code: `export default async function Dashboard() {
  // 模拟缓慢的数据库查询
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return <h1>仪表盘数据已就绪</h1>;
}` }],
    entryFile: "app/dashboard/loading.tsx",
    answer: {
      type: "prediction",
      prompt: "在等待 `Dashboard` 页面 3 秒钟的查询时，用户在浏览器中会看到什么？",
      options: [
        { id: "a", label: "页面完全空白或者冻结在上一页，直到数据返回", detail: "阻塞渲染", feedback: "这是没有 loading.tsx 时的表现。" },
        { id: "b", label: "立即看到 '数据加载中...'，3秒后被替换为 '仪表盘数据已就绪'", detail: "Suspense 立即降级", feedback: "正确：`loading.tsx` 被用来渲染 Suspense fallback 状态。" },
        { id: "c", label: "看到上一个页面的内容，URL 不会改变", detail: "直到新页面准备好", feedback: "URL 会立即改变，并显示 Loading 状态。" }
      ],
      answerId: "b",
      correctExplanation: "当你创建 `loading.tsx` 时，Next.js 会在后台自动将它编译为一个包裹着子组件的 `<Suspense fallback={<Loading />}>`。这确保了用户界面的高度响应性：即使后端的 DB 查询需要很久，前台也会毫无延迟地给出反馈骨架。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["导航触发", "显示 Loading", "Suspense Boundary", "获取数据", "替换内容"] },
      lanes: ["触发导航", "Suspense 挂载", "数据完成"],
      frames: [
        { activeLane: 0, laneValues: ["访问 /dashboard", "等待", "等待"], log: ["识别到 loading.tsx，创建 Suspense"], note: "建立加载边界", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "渲染 loading UI", "等待"], log: ["输出 HTML: 数据加载中...", "并行开始 Dashboard 的数据 Fetch"], note: "用户立即看到反馈", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "Stream 内容"], log: ["Promise resolve", "流式发送 Dashboard 真实 HTML 替换 Loading"], note: "数据到达，自动展示页面", delayMs: 800 }
      ]
    },
    sources: [{ title: "Loading UI and Streaming", url: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming" }],
    summary: ["提供即时的加载反馈提升 UX", "基于 React Suspense 构建", "同级的 Layout 组件会在加载期间保持可交互"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-error",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.6 · 路由系统",
    title: "error.tsx 错误边界",
    objectives: ["掌握如何使用 error.tsx 捕获并处理运行时错误"],
    prerequisites: ["nextjs-routing-loading"],
    concept: "如果你的服务端组件或客户端组件在渲染过程中抛出错误，你可以放置一个 `error.tsx` 来接管页面展示。它会在该目录下创建一个 React Error Boundary，捕获所有发生在其内部的意外异常，防止整个应用崩溃。需要注意的是，`error.tsx` 本身必须是客户端组件（`'use client'`）。",
    points: ["处理未被捕获的运行时错误", "必须包含 'use client' 指令", "提供一个 reset 函数可以尝试恢复（重新渲染）"],
    memoryHook: "错误边界护城河",
    files: [{ name: "app/dashboard/error.tsx", code: `'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 可以将错误上报给 Sentry 等平台
    console.error("捕获到错误:", error);
  }, [error]);

  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  );
}` }],
    entryFile: "app/dashboard/error.tsx",
    answer: {
      type: "prediction",
      prompt: "为什么 `error.tsx` 强制要求必须是客户端组件（使用 `'use client'`）？",
      options: [
        { id: "a", label: "因为它需要使用 console.log", detail: "服务器不能打印日志", feedback: "服务端可以打印日志。这不是根本原因。" },
        { id: "b", label: "因为它需要响应用户的点击（如重试按钮）并捕获客户端抛出的错误", detail: "交互与生命周期依赖", feedback: "正确：错误恢复通常需要用户交互（reset 按钮），而且它也需要捕获在客户端发生的水合错误。" },
        { id: "c", label: "为了让错误信息不泄露给服务端", detail: "安全隔离", feedback: "实际上错误信息是由服务端捕获并转交客户端呈现的。" }
      ],
      answerId: "b",
      correctExplanation: "Error Boundary 在 React 中依靠生命周期或 Hook 机制工作，且通常包含用来尝试恢复的交互元素（例如上面的 `onClick={() => reset()}`）。因此，Next.js 强制约定 `error.tsx` 必须被标记为 Client Component。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["page.tsx", "Throw Error", "Error Boundary", "渲染 error.tsx", "重试恢复"] },
      lanes: ["执行组件", "捕获错误", "触发回退"],
      frames: [
        { activeLane: 0, laneValues: ["渲染 /dashboard", "等待", "等待"], log: ["抛出 Error('数据库连接失败')"], note: "页面内部发生异常", delayMs: 400 },
        { activeLane: 1, laneValues: ["停止渲染", "寻找 error.tsx", "等待"], log: ["冒泡至 app/dashboard/error.tsx 边界"], note: "拦截到错误，防止应用彻底崩溃", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "展示备用 UI"], log: ["展示 '出错了！' 并且传递 reset 方法"], note: "展示友好的降级界面等待用户操作", delayMs: 800 }
      ]
    },
    sources: [{ title: "Error Handling", url: "https://nextjs.org/docs/app/building-your-application/routing/error-handling" }],
    summary: ["创建组件层级的 React 错误边界", "必须是 'use client' 客户端组件", "包含重置机制尝试恢复局部状态"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-not-found",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.7 · 路由系统",
    title: "not-found.tsx 页面",
    objectives: ["了解如何自定义 404 页面和触发未找到状态"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "当路由系统匹配不到任何路径时，或者你在服务端组件中主动调用了 `notFound()` 函数时，Next.js 会渲染 `not-found.tsx` 组件。这是一个非常适合展示友好 404 界面并提供返回首页链接的地方。",
    points: ["可以覆盖默认的 Next.js 404 界面", "通过引入 `import { notFound } from 'next/navigation'` 主动触发", "不接收任何特定的 props"],
    memoryHook: "调用 notFound() 跳转 404",
    files: [{ name: "app/post/[id]/page.tsx", code: `import { notFound } from 'next/navigation';

export default async function PostPage({ params }: any) {
  const post = await db.find(params.id);
  
  if (!post) {
    // 如果数据库里没这篇文章，主动抛出未找到状态
    notFound(); 
  }
  
  return <h1>{post.title}</h1>;
}` }, { name: "app/post/[id]/not-found.tsx", code: `export default function NotFound() {
  return <h2>哎呀，找不到这篇帖子！</h2>;
}` }],
    entryFile: "app/post/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在 `PostPage` 中调用 `notFound()` 后，代码执行流会怎样变化？",
      options: [
        { id: "a", label: "继续执行后面的 return 渲染页面", detail: "作为一个普通函数", feedback: "调用 `notFound()` 会立即中断组件的渲染。" },
        { id: "b", label: "抛出一个特殊的异常，立即中止渲染，并渲染最近的 not-found.tsx", detail: "抛出异常中断控制流", feedback: "正确：`notFound()` 本质上抛出了一个 Next.js 内部错误，触发了 404 回退机制。" },
        { id: "c", label: "重定向到主页", detail: "因为没有找到数据", feedback: "它不会重定向 URL，只会原地渲染 `not-found.tsx` 的内容。" }
      ],
      answerId: "b",
      correctExplanation: "在 Next.js Server Components 中，控制流函数（如 `notFound()` 甚至 `redirect()`）底层都是依靠在 JavaScript 中抛出特殊的 Error 对象来阻断后续代码执行的。因此 `notFound()` 下方的 `return <h1>...` 永远不会执行，页面会直接被渲染层替换为对应的 404 UI。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["获取数据", "校验空值", "notFound()", "中断流", "渲染 404 UI"] },
      lanes: ["执行查询", "触发异常", "回退渲染"],
      frames: [
        { activeLane: 0, laneValues: ["db.find(id)", "等待", "等待"], log: ["数据库返回 null"], note: "数据不存在", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行 notFound()", "等待"], log: ["抛出 NEXT_NOT_FOUND 异常"], note: "代码执行被特殊错误掐断", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "降级到 not-found"], log: ["在视图层展示 '哎呀，找不到这篇帖子！'"], note: "URL 不变，返回 404 HTTP 状态码与备用界面", delayMs: 800 }
      ]
    },
    sources: [{ title: "notFound", url: "https://nextjs.org/docs/app/api-reference/functions/not-found" }],
    summary: ["自定义各层级的 404 界面", "配合 notFound() 函数处理缺失的数据", "底层利用了异常抛出机制中断渲染流"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-routing-middleware",
    stageId: "nextjs-routing",
    kind: "knowledge",
    eyebrow: "01.8 · 路由系统",
    title: "middleware.ts 路由中间件",
    objectives: ["学习如何在请求到达页面之前拦截和重定向流量"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "Middleware（中间件）允许你在请求完成之前运行代码。这在路由级别发生，让你能根据传入的请求重写、重定向、修改请求/响应头，或者直接响应。它在根目录下名为 `middleware.ts`。由于它运行在 Edge Runtime 边缘环境，极其轻量和快速，非常适合做国际化路由重定向或初级鉴权。",
    points: ["全局执行在所有路由和 API 之前", "支持通过 matcher 配置过滤路径", "运行在 Edge 环境（不能使用全部 Node.js API）"],
    memoryHook: "入口守卫中间件",
    files: [{ name: "middleware.ts", code: `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // 如果用户访问 /about，我们将他们重定向到首页
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// 仅在 /about 路径上触发
export const config = {
  matcher: '/about/:path*',
}` }],
    entryFile: "middleware.ts",
    answer: {
      type: "prediction",
      prompt: "在这个配置下，如果用户访问 `/about/team`，Next.js 服务器的第一个反应是什么？",
      options: [
        { id: "a", label: "加载 /about 目录下的 page.tsx 组件", detail: "正常路由流程", feedback: "中间件的执行早于任何页面或路由处理器。" },
        { id: "b", label: "执行 middleware.ts，判断匹配后立即返回 307 重定向响应给浏览器", detail: "Edge 拦截", feedback: "正确：请求在边缘层面被截获，页面代码完全没有触碰就会被重定向到 `/`。" },
        { id: "c", label: "在浏览器端用 JavaScript 执行重定向", detail: "客户端路由拦截", feedback: "Middleware 是在服务端（Edge）运行的。" }
      ],
      answerId: "b",
      correctExplanation: "中间件位于应用的“最前线”。它的强大之处在于能够在请求还没有接触到路由、布局或页面组件之前，就在边缘环境通过快速分析并作出响应。通过返回 `NextResponse.redirect`，它可以在极短的时间内引导浏览器重定向，减少不必要的资源消耗。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "Next.js 请求处理链", nodes: ["边缘网络", "Middleware", "Next.js Router", "Server Component"] },
      lanes: ["接收请求", "边缘中间件", "路由/响应"],
      frames: [
        { activeLane: 0, laneValues: ["传入 /about/team", "等待", "等待"], log: ["Request 到达 Vercel 边缘网络"], note: "还未进入 Next.js 核心路由", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行 matcher", "等待"], log: ["路径匹配 /about/:path*，触发 Middleware 代码"], note: "执行边缘环境的中间件逻辑", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "拦截重定向"], log: ["跳过后端渲染，直接返回 307 Temporary Redirect 给客户端"], note: "安全、高效的前置控制层", delayMs: 800 }
      ]
    },
    sources: [{ title: "Middleware", url: "https://nextjs.org/docs/app/building-your-application/routing/middleware" }],
    summary: ["请求进入 Next.js 之前的第一道防线", "极度适用于路由国际化重定向和验证会话 Token", "基于快速的 Web API 边缘环境，不支持 Node.js 核心模块"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-blog-nav",
    stageId: "nextjs-routing",
    kind: "stage-project",
    eyebrow: "阶段项目 01 · 路由系统",
    title: "多层博客导航系统",
    difficulty: "进阶",
    objectives: ["将基础路由概念整合应用", "构建具有侧边栏并行渲染及拦截弹窗结构的真实博客模式"],
    prerequisites: ["nextjs-routing-dynamic", "nextjs-routing-parallel", "nextjs-routing-intercepting"],
    concept: "在这个项目中，你将构建一个现代的博客架构。使用路由组 `(blog)` 分离文章内容区的布局；使用并行路由 `@sidebar` 提供并排显示的最热文章列表；并且使用 `(..)` 拦截路由来实现“点击作者头像出现个人信息弹窗”的高级交互效果。",
    points: ["混合应用各种约定式路由文件", "处理插槽和拦截嵌套", "体验基于文件系统管理复杂视图的优雅"],
    memoryHook: "路由百宝箱，全家桶组合",
    files: [{ name: "app/(blog)/layout.tsx", code: `// 博客文章专用的共享布局
export default function BlogLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode
  sidebar: React.ReactNode // @sidebar 插槽
}) {
  return (
    <div className="flex gap-4">
      <main className="flex-1">{children}</main>
      <aside className="w-64">{sidebar}</aside>
    </div>
  )
}` }, { name: "app/(blog)/post/[id]/page.tsx", code: `import Link from 'next/link';

export default async function PostPage({ params }: any) {
  // 点击作者将触发拦截路由显示弹窗
  return (
    <article>
      <h1>文章标题 {params.id}</h1>
      <Link href="/author/alex">查看作者 (会弹窗)</Link>
    </article>
  )
}` }, { name: "app/(blog)/@sidebar/page.tsx", code: `export default function Sidebar() {
  return <div>推荐文章列表...</div>
}` }, { name: "app/(blog)/(..)author/[id]/page.tsx", code: `// 拦截路由弹窗
export default function AuthorModal({ params }: any) {
  return <div className="modal">拦截渲染: 作者 {params.id} 简介</div>
}` }],
    entryFile: "app/(blog)/post/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个复杂的路由架构中，当用户在文章详情页 (`/post/1`) 点击「查看作者」链接后，发生了哪些组合的路由机制？",
      options: [
        { id: "a", label: "页面完全跳转去渲染了一个全屏的 author 页面", detail: "普通跳转", feedback: "由于定义了拦截路由，软导航行为被接管了。" },
        { id: "b", label: "保留了 BlogLayout 及其并行加载的 @sidebar，然后用 (..)author 弹窗覆盖在前面", detail: "组合机制", feedback: "正确：布局复用、并行插槽保持不动，拦截路由机制将弹窗无缝插入了当前的上下文中。" },
        { id: "c", label: "触发了 error.tsx", detail: "结构太复杂导致渲染冲突", feedback: "Next.js 路由架构正是为了处理这种复杂组合而设计的。" }
      ],
      answerId: "b",
      correctExplanation: "这就是 Next.js App Router 的真正威力：你通过组合多个文件约定，完成了传统 SPA 需要大量状态管理和复杂路由配置才能做到的事情。`layout` 和并行 `@slot` 锁定了外围 UI 状态，`[id]` 处理动态数据，`(...)` 完美地补齐了高级的视觉交互层（Modal）。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "多层架构解析", nodes: ["构建 Layout", "并行挂载", "动态捕获", "路由拦截", "合并呈现"] },
      lanes: ["组合布局", "软导航拦截", "局部更新"],
      frames: [
        { activeLane: 0, laneValues: ["访问 /post/1", "等待", "等待"], log: ["组装 BlogLayout", "挂载 children(文章)", "挂载 @sidebar(推荐)"], note: "初始页面加载出丰富的并行区", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "点击作者链接", "等待"], log: ["由于客户端路由，拦截层 (..) 启动"], note: "用户尝试访问 /author/alex", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "弹窗注入"], log: ["主内容与侧边栏保持不动", "弹出 AuthorModal 层", "更新浏览器 URL 至 /author/alex"], note: "利用 Next.js 原生路由完美实现复杂前端交互", delayMs: 800 }
      ]
    },
    sources: [{ title: "Building your application: Routing", url: "https://nextjs.org/docs/app/building-your-application/routing" }],
    summary: ["Next.js 路由是一套正交的积木系统", "并行路由与布局搭配解决多区块管理", "拦截路由解决了传统 SPA 的 URL 与弹窗同步难题"]
  })
];
