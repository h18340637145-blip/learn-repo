import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageTwoRenderingLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-rendering-ssr",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.1 · 渲染模式",
    title: "服务端渲染 SSR",
    objectives: ["理解在每次请求时动态生成 HTML 的 SSR 原理"],
    prerequisites: ["nextjs-foundations-server-components"],
    concept: "Server-Side Rendering (SSR) 意味着页面的 HTML 是在用户每次请求时、在服务器上动态生成的。Next.js 默认的 Server Components 支持这种模式。当数据时刻在变，或你需要访问请求头（如 cookies）时，SSR 是首选。",
    points: ["请求到达服务器时开始构建页面结构", "可提供个性化的实时数据和出色的 SEO", "对服务器计算资源和时间消耗最大"],
    memoryHook: "请求一来就渲染",
    files: [{ name: "app/dashboard/page.tsx", code: `import { headers } from 'next/headers';

export default async function Dashboard() {
  // 因为使用了 headers，Next.js 会在每次请求时进行 SSR
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  
  // 模拟从数据库获取实时数据
  const data = await fetch('https://api.example.com/live', { cache: 'no-store' }).then(r => r.json());

  return (
    <div>
      <h1>你的实时数据: {data.value}</h1>
      <p>设备: {userAgent}</p>
    </div>
  );
}` }],
    entryFile: "app/dashboard/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果两个不同的用户（分别用 Chrome 和 Safari）同时请求 `/dashboard`，会发生什么？",
      options: [
        { id: "a", label: "返回编译时写死的同一个静态 HTML", detail: "因为 Next.js 默认生成静态站点", feedback: "由于使用了 headers() 和禁用缓存的 fetch，这个页面不能静态生成。" },
        { id: "b", label: "服务器针对每个请求分别计算，返回不同的 HTML 内容", detail: "动态 SSR 渲染", feedback: "正确：因为这是动态渲染（SSR），每个用户的 User-Agent 不同，服务器会实时拼装出两份独立的 HTML。" },
        { id: "c", label: "服务器把请求代理给浏览器客户端进行渲染", detail: "CSR 行为", feedback: "这是传统的 React SPA 行为，但在 Next.js Server Components 下，渲染动作发生在服务端。" }
      ],
      answerId: "b",
      correctExplanation: "当你使用了像 `headers()` 或 `cookies()` 这种强依赖于单个具体 Request 对象的动态函数时，Next.js 知道该页面无法被提前静态生成。于是它会退化为 SSR 模式——为每一次独立的访问，实时动态地“现做”一份 HTML 返回。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "SSR 渲染管线", nodes: ["请求到达", "拉取数据", "Server 渲染", "序列化 Payload", "客户端展示"] },
      lanes: ["接收请求", "服务端渲染", "响应 HTML"],
      frames: [
        { activeLane: 0, laneValues: ["GET /dashboard", "等待", "等待"], log: ["Chrome 浏览器发起请求"], note: "服务器必须等待请求到来才能开始", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "获取动态数据和请求头", "等待"], log: ["提取 User-Agent", "Fetch live data..."], note: "执行耗时的服务端渲染逻辑", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "响应定制 HTML"], log: ["生成包含 Chrome UA 和实时数据的 HTML 结构流"], note: "用户获得首屏内容", delayMs: 800 }
      ]
    },
    sources: [{ title: "Server Rendering", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" }],
    summary: ["SSR 在每个请求发生时实时动态渲染 HTML", "使用 headers/cookies 等动态函数会强制开启 SSR 模式", "能提供最佳的新鲜数据展示能力"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-ssg",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.2 · 渲染模式",
    title: "静态生成 SSG",
    objectives: ["了解在构建时预渲染页面的性能优势"],
    prerequisites: ["nextjs-rendering-ssr"],
    concept: "Static Site Generation (SSG) 意味着页面的 HTML 和数据在构建时（`next build`）就被提前计算并生成。之后无论是多少次请求，服务器只需要极速返回早已准备好的静态文件。这种模式的响应速度最快，并且极度节省服务器开销。",
    points: ["内容在 npm run build 时被生成", "可以通过 CDN 分发到全球边缘节点", "非常适合博客文章、营销页面和帮助文档"],
    memoryHook: "构建打包，一劳永逸",
    files: [{ name: "app/about/page.tsx", code: `export default async function About() {
  // 没有任何动态函数，fetch 默认会被缓存（静态化）
  const response = await fetch('https://api.cms.com/about-us');
  const content = await response.json();
  
  return (
    <article>
      <h1>关于我们</h1>
      <p>{content.story}</p>
    </article>
  );
}` }],
    entryFile: "app/about/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在执行完 `next build` 将项目部署上线后，如果在 CMS 系统里修改了 `about-us` 的文案，用户刷新页面会看到新内容吗？",
      options: [
        { id: "a", label: "会，因为每次刷新都会触发 fetch", detail: "误以为是 CSR", feedback: "注意：因为是 SSG，页面的 HTML 是构建时固定的。" },
        { id: "b", label: "不会，页面内容被锁定在了最后一次构建时的状态", detail: "静态预渲染", feedback: "正确：SSG 把页面像照片一样“定格”在编译完成的那一刻。除非重新触发构建，否则数据不会改变。" },
        { id: "c", label: "报错 404", detail: "因为缓存过期", feedback: "静态资源不会自动失效。" }
      ],
      answerId: "b",
      correctExplanation: "SSG（静态渲染）的核心理念是：将能够提前做好的计算量前置到 Build（构建阶段）。因为代码里没有任何依赖具体用户请求的信息（比如请求头、搜索参数），Next.js 智能地把它固化成了一个 `.html` 文件。好处是极致的加载速度，代价则是内容的实时性降低。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "SSG 渲染管线", nodes: ["构建阶段", "静态资源化", "推送到 CDN", "用户请求", "直接返回"] },
      lanes: ["构建打包", "CDN 缓存", "用户访问"],
      frames: [
        { activeLane: 0, laneValues: ["执行 next build", "等待", "等待"], log: ["Fetch API", "生成 about.html"], note: "内容在部署期间被提前拉取和编译", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "部署到边缘 CDN 节点", "等待"], log: ["缓存 HTML 文件"], note: "静态文件被分发至全球", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "极速响应"], log: ["用户访问直接命中 CDN 并返回"], note: "无任何服务器计算负担", delayMs: 800 }
      ]
    },
    sources: [{ title: "Static Rendering", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default" }],
    summary: ["在构建时完成数据抓取和 HTML 渲染", "是最快、成本最低的渲染方式", "缺乏处理高度动态个人化数据的能力"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-isr",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.3 · 渲染模式",
    title: "增量静态再生 ISR",
    objectives: ["掌握如何在不重新构建整个站点的情况下，定期更新静态页面"],
    prerequisites: ["nextjs-rendering-ssg"],
    concept: "Incremental Static Regeneration (ISR) 结合了 SSG 的速度和 SSR 的新鲜度。它允许你的静态页面在后台“定期重新生成”。你可以设置一个有效时间（revalidate），当缓存过期并且有新请求到来时，Next.js 会在后台默默重新获取数据并生成新的 HTML，后续的用户就能看到新页面了。",
    points: ["基于时间或事件使缓存页面失效（Revalidate）", "发生重构时，当前请求仍然返回旧缓存（不会阻塞）", "非常适合电商产品页（如商品库存、价格）"],
    memoryHook: "定时打卡，后台换血",
    files: [{ name: "app/product/[id]/page.tsx", code: `// 设置该页面的重新验证时间为 60 秒
export const revalidate = 60;

export default async function ProductPage({ params }: any) {
  // 这部分代码每 60 秒后，当有请求时会在后台执行一次
  const res = await fetch(\`https://api.store.com/item/\${params.id}\`);
  const product = await res.json();
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>当前价格: {product.price}</p>
    </div>
  );
}` }],
    entryFile: "app/product/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "页面缓存刚过期（例如在第 65 秒），用户 A 访问了该页面。他会看到什么？",
      options: [
        { id: "a", label: "加载中...，页面阻塞直到后台拉取到新数据再渲染给他", detail: "像 SSR 一样阻塞", feedback: "这是传统的缓存失效机制（Cache Stampede），ISR 不会这么做。" },
        { id: "b", label: "依然看到旧版本的页面（Stale-While-Revalidate）", detail: "后台默默更新", feedback: "正确：用户 A 立刻获得了旧的静态缓存（体验极佳），与此同时，服务器在后台重新生成新页面。" },
        { id: "c", label: "页面报错", detail: "缓存已清除", feedback: "ISR 的机制保证了永远有可用的页面版本提供。" }
      ],
      answerId: "b",
      correctExplanation: "ISR 采用了 SWR (Stale-While-Revalidate) 策略。过期后的**第一次**访问，系统依然会瞬时返回旧的缓存文件以保证速度；但这次访问是一次“触发器”，它指示服务器在后台异步运行该组件拉取新数据。等下一位用户 B 来访问时，他就会看到全新的 HTML 页面了。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "ISR 渲染管线", nodes: ["陈旧缓存", "请求到来", "返回旧数据", "后台 Revalidate", "更新缓存"] },
      lanes: ["触发访问", "响应状态", "后台运作"],
      frames: [
        { activeLane: 0, laneValues: ["过期后请求", "等待", "等待"], log: ["收到页面访问请求，发现缓存超期 5s"], note: "时间标记已超 60 秒", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "立即返回 Stale 缓存", "等待"], log: ["返回就绪的旧 HTML"], note: "保证访客的极速体验", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "异步重构"], log: ["后台执行 fetch", "生成并覆盖旧 HTML"], note: "下一个访客将命中新的静态文件", delayMs: 800 }
      ]
    },
    sources: [{ title: "Time-based Revalidation", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#time-based-revalidation" }],
    summary: ["兼得静态的性能与动态的数据 freshness", "利用过期后第一次访问触发异步后台更新", "可避免高峰期数据库请求的“雪崩”现象"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-streaming",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.4 · 渲染模式",
    title: "Streaming 流式渲染",
    objectives: ["了解流式响应如何提升 TTFB 和 FCP 性能"],
    prerequisites: ["nextjs-rendering-ssr"],
    concept: "在传统 SSR 中，服务器必须等所有数据获取完毕，生成完整的 HTML 后，才能把响应发给浏览器。这意味着一个慢速的数据库查询会阻塞整个页面的加载。而 Streaming SSR 允许你将 HTML 分解成多个小块（Chunks），服务器准备好哪块就立刻向浏览器流式推送哪块。",
    points: ["HTML 像水流一样逐块发往浏览器", "减少了 TTFB (首字节到达时间)", "Next.js 中借助 loading.tsx 或 Suspense 自动实现"],
    memoryHook: "切分积木，边下边拼",
    files: [{ name: "app/page.tsx", code: `import { Suspense } from 'react';
import SlowComponent from './SlowComponent';

export default function Home() {
  return (
    <main>
      <h1>极速加载的页面外壳</h1>
      {/* 这一部分会被延迟处理并流式推送到前端 */}
      <Suspense fallback={<p>数据拉取中，请稍候...</p>}>
        <SlowComponent />
      </Suspense>
    </main>
  );
}` }, { name: "app/SlowComponent.tsx", code: `export default async function SlowComponent() {
  // 假设这需要非常长的时间
  await new Promise(resolve => setTimeout(resolve, 5000));
  return <div>经过 5 秒查询得出的核心数据</div>;
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "当用户请求上述页面时，前 5 秒浏览器处于什么状态？",
      options: [
        { id: "a", label: "浏览器的 Tab 标签在转圈，屏幕一片空白", detail: "因为服务器在 await", feedback: "这是没有使用 Suspense 时的传统 SSR 行为。" },
        { id: "b", label: "页面显示了 `<h1>极速加载的页面外壳</h1>` 和 `数据拉取中，请稍候...`", detail: "首屏瞬间渲染", feedback: "正确：外壳和 Suspense fallback 率先流式返回给浏览器并渲染。" },
        { id: "c", label: "渲染一半的内容并且发生报错", detail: "流被切断", feedback: "这是正常的流式传输机制，不会报错。" }
      ],
      answerId: "b",
      correctExplanation: "利用 React 的 `Suspense` 边界，Next.js 会立刻先将 `Suspense` 外面的结构，以及里面的 `fallback` 转化成 HTML 流式发送给客户端。此时，底层的 HTTP 连接并不会关闭。5 秒后，当服务端完成内部请求，它会把 `<SlowComponent />` 生成的最终片段追加到同一个流中，替换掉之前的 fallback。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "Streaming 流渲染", nodes: ["请求到达", "响应 Shell", "发送 Fallback", "完成耗时计算", "推送最终区块"] },
      lanes: ["传输 Chunk 1", "挂起连接", "传输 Chunk 2"],
      frames: [
        { activeLane: 0, laneValues: ["发送初始 HTML", "等待", "等待"], log: ["推送 Navbar 和 <p>数据拉取中...</p>"], note: "瞬间响应，极大提升感知性能", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "等待 5000ms", "等待"], log: ["服务器在后台执行 SlowComponent"], note: "HTTP 管道处于长连接开启状态", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "推送注入脚本"], log: ["推送 <div>核心数据</div>", "发送内部 JS 将其无缝填入指定位置"], note: "流关闭，页面组装完整", delayMs: 800 }
      ]
    },
    sources: [{ title: "Routing: Loading UI and Streaming", url: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming" }],
    summary: ["打破了传统 SSR 等待最慢数据的魔咒", "通过 React Suspense 声明流的分界线", "渐进式呈现大大优化了核心 Web 性能指标 (CWV)"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-suspense",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.5 · 渲染模式",
    title: "Suspense 的粒度控制",
    objectives: ["深入理解如何在复杂布局中精细切割 Suspense 边界"],
    prerequisites: ["nextjs-rendering-streaming"],
    concept: "在上节课中我们了解了 Streaming。在实际场景中，一个仪表盘可能有三个依赖不同慢速 API 的图表区块。如果你只在最外层使用一个大的 Suspense（或 `loading.tsx`），那么页面依然要等待最慢的那个图表加载完才能一起呈现内容。最佳实践是将 Suspense 下放到尽可能小的颗粒度。",
    points: ["不要用一个大的 loading 包裹所有内容", "为每个独立的异步组件包裹单独的 Suspense", "组件可以彼此独立地通过网络“流”过来"],
    memoryHook: "化整为零，各自排队",
    files: [{ name: "app/dashboard/page.tsx", code: `import { Suspense } from 'react';
import WeatherWidget from './WeatherWidget'; // 需要 1 秒
import StockWidget from './StockWidget'; // 需要 4 秒

export default function Dashboard() {
  return (
    <div className="grid">
      <Suspense fallback={<div className="skeleton">获取天气...</div>}>
        <WeatherWidget />
      </Suspense>
      
      <Suspense fallback={<div className="skeleton">分析股市...</div>}>
        <StockWidget />
      </Suspense>
    </div>
  );
}` }],
    entryFile: "app/dashboard/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在第 2 秒时，这个仪表盘的显示状态是什么？",
      options: [
        { id: "a", label: "两个模块都还在显示 Skeleton 加载状态", detail: "因为组件树未完全解析", feedback: "Suspense 边界是彼此独立的。" },
        { id: "b", label: "WeatherWidget 显示了真实天气，StockWidget 依然在显示骨架屏", detail: "各自独立解析与流传输", feedback: "正确：1秒后天气数据就绪流向浏览器被渲染；股市模块继续等待自己的数据。" },
        { id: "c", label: "什么都不显示", detail: "报错", feedback: "代码逻辑无误，它是合法的流式并发。" }
      ],
      answerId: "b",
      correctExplanation: "通过将 Suspense 下沉到具体的业务组件层级，你创造了多条并行的渲染通道。Next.js 的服务端会在完成 `WeatherWidget` 后立刻推给前端，而不需要去等 `StockWidget` 的 4 秒计算，使得数据较轻的模块能够极速亮起。"
    },
    execution: {
      visualizer: { type: "nextjs-component-boundary", title: "组件层级渲染", nodes: ["Root", "WeatherBoundary", "Weather", "StockBoundary", "Stock"] },
      lanes: ["外壳就绪", "区块 A 抵达", "区块 B 抵达"],
      frames: [
        { activeLane: 0, laneValues: ["流传输 HTML 结构", "等待", "等待"], log: ["推送布局外壳，以及两个 fallback"], note: "0 秒: 两个骨架屏呈现", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "Weather 渲染", "等待"], log: ["1s: 推送 Weather 真实 HTML"], note: "1 秒: 局部块替换为真实天气数据", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "Stock 渲染"], log: ["4s: 推送 Stock 真实 HTML"], note: "4 秒: 最后一个图表亮起，整体结束", delayMs: 800 }
      ]
    },
    sources: [{ title: "Streaming with Suspense", url: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#streaming-with-suspense" }],
    summary: ["不要只在一个顶层 layout 放入整体 Loading", "将 Suspense 包裹在具体的慢速数据获取组件外", "允许多个慢速操作相互不阻塞地在前端浮现"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-sc-vs-cc",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.6 · 渲染模式",
    title: "Server 与 Client 组件边界",
    objectives: ["明确划分服务端逻辑与客户端交互的界线"],
    prerequisites: ["nextjs-foundations-server-components"],
    concept: "在 App Router 中，并非所有东西都得是服务端组件。凡是涉及到 onClick 点击事件、useState 状态、useContext 或者调用浏览器 API (如 window) 的地方，你都必须将其声明为客户端组件（在文件顶部写上 `'use client'`）。这创建了一道网络边界：边界以上的代码不打包，边界以下的代码通过 JS bundle 传给浏览器。",
    points: ["默认都是 Server Components", "用 'use client' 打开向下的互动树", "Client 组件可以嵌套 Server 组件（通过 children 模式）"],
    memoryHook: "有交互加 use client，数据获取留服务端",
    files: [{ name: "app/page.tsx", code: `import LikeButton from './LikeButton';

export default async function Page() {
  const data = await fetch('https://api.db.com/post');
  const post = await data.json();
  
  return (
    <article>
      <h1>{post.title}</h1>
      {/* 导入一个带交互的独立子组件 */}
      <LikeButton initialLikes={post.likes} />
    </article>
  );
}` }, { name: "app/LikeButton.tsx", code: `'use client';
import { useState } from 'react';

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes(l => l + 1)}>👍 {likes}</button>;
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果不小心把 `'use client'` 从 `LikeButton.tsx` 的顶部去掉了，会发生什么？",
      options: [
        { id: "a", label: "正常运行，因为 React 自动识别 onClick 并进行转化", detail: "框架智能编译", feedback: "Next.js 并不会自动猜测组件意图，这会导致明确的报错。" },
        { id: "b", label: "构建报错，提示你不可以在 Server Component 中使用 useState 和 onClick", detail: "违反渲染规则", feedback: "正确：服务端没有浏览器环境对象和合成事件系统，直接写会有编译级别的阻断。" },
        { id: "c", label: "按钮正常显示，但点击毫无反应", detail: "静默失败", feedback: "Next.js 会在开发环境中就抛出显著的异常页面。" }
      ],
      answerId: "b",
      correctExplanation: "服务器生成 HTML 时不需要也不具备事件处理与交互状态能力。通过在树的某个分支顶部标明 `'use client'`，你等同于在告诉打包器（Webpack/Turbopack）：'嘿，把这个文件以及它引用的所有东西，都打包成一份 JS 传给浏览器去执行水合（Hydration）'。"
    },
    execution: {
      visualizer: { type: "nextjs-component-boundary", title: "组件交织渲染模型", nodes: ["Server Node", "Network Boundary", "Client Leaf", "JS Bundle", "Browser Execute"] },
      lanes: ["服务端执行", "构建分割", "客户端挂载"],
      frames: [
        { activeLane: 0, laneValues: ["渲染 <Page>", "等待", "等待"], log: ["服务端获取 API 数据，渲染 <h1>"], note: "所有重量级操作在安全的服务端执行", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "触及 'use client'", "等待"], log: ["发现 LikeButton 声明了交互需求", "打包进 client.chunk.js"], note: "识别并分离出需要在浏览器处理的部分", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "水合事件"], log: ["浏览器下载 chunk", "将 onClick 事件挂载到已有的 HTML 按钮上"], note: "实现互动能力，达到最极致的性能优化", delayMs: 800 }
      ]
    },
    sources: [{ title: "Client Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/client-components" }],
    summary: ["默认状态总是保持为 Server Components", "只在真正需要浏览器互动、动画或状态管理时开启 'use client'", "减小了发送到移动设备的 JavaScript 体积"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-partial",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.7 · 渲染模式",
    title: "部分预渲染 PPR (实验性)",
    objectives: ["了解未来架构 PPR 是如何同时合并静态和动态渲染的"],
    prerequisites: ["nextjs-rendering-suspense", "nextjs-rendering-sc-vs-cc"],
    concept: "Partial Prerendering (PPR) 是一项突破性技术。以前一个路由要么是全静态的，要么因为你加了一个 `cookies()` 就整个变成了 SSR。借助 PPR，Next.js 在构建时预先生成页面的大部分（静态外壳），并把被 `Suspense` 包裹的动态部分（如购物车状态、用户凭证等）留出“洞”。用户访问时瞬间获得静态外壳，随后动态数据被 SSR 流入填补这些洞。",
    points: ["打破了路由级别的静态/动态互斥论", "静态骨架屏可以在全球 CDN 边缘节点极速返回", "动态内容通过流式追加"],
    memoryHook: "凿洞填装，一半静一半动",
    files: [{ name: "next.config.js", code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};
module.exports = nextConfig;` }, { name: "app/product/[id]/page.tsx", code: `import { Suspense } from 'react';
import { cookies } from 'next/headers';

async function DynamicCart() {
  const session = (await cookies()).get('session_id');
  return <div>购物车数量: {session ? 3 : 0}</div>;
}

export default function Product({ params }: any) {
  // 这里的商品基础信息可以在 Build 阶段被静态化
  return (
    <main>
      <h1>商品详情: {params.id}</h1>
      
      {/* 由于依赖 cookies，这块会被抠出一个"洞"，运行时流式获取 */}
      <Suspense fallback={<div>加载购物车...</div>}>
        <DynamicCart />
      </Suspense>
    </main>
  );
}` }],
    entryFile: "app/product/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在启用了 PPR 后，用户首次请求该产品页面的感受是什么？",
      options: [
        { id: "a", label: "服务器会停顿，直到读取了 cookies 并计算完毕，再一并返回全部内容", detail: "普通 SSR 表现", feedback: "PPR 改善了这种阻塞现象。" },
        { id: "b", label: "瞬间（从CDN）收到包含标题和骨架屏的静态 HTML，随后动态获取到的购物车数据才流入页面", detail: "PPR 的核心优势", feedback: "正确：页面外壳由于不依赖请求头被完美地固化成了 SSG 放入 CDN；而内部则使用了流式 SSR。" },
        { id: "c", label: "会遇到编译错误，因为同一个文件里混写了静态和动态", detail: "兼容性报错", feedback: "PPR 的目的就是合法化并利用好这种混写结构。" }
      ],
      answerId: "b",
      correctExplanation: "过去 Next.js 是在“整个页面”层级决定渲染模式，一旦遇到 `cookies()` 或 `searchParams` 就会令整个页面沦为慢速的 SSR。借助 PPR 实验特性，Next.js 的编译器聪明地利用 `<Suspense>` 作为切割刀，把静态外壳切下来放进 CDN，把动态肉馅留给服务端按需生成。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "PPR 渲染管线", nodes: ["构建阶段", "切割静态壳", "CDN 返回", "SSR 动态洞", "流式缝合"] },
      lanes: ["构建时解析", "网络边界交付", "运行时流式填装"],
      frames: [
        { activeLane: 0, laneValues: ["扫描源码树", "等待", "等待"], log: ["发现 cookies()", "利用 Suspense 边界提取出一个带洞的静态 Shell"], note: "构建时只执行非动态部分", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "CDN 极速命中", "等待"], log: ["用户访问", "立刻返回静态商品介绍与购物车 Loading 提示"], note: "无服务器冷启动和延迟", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "并行流式推送"], log: ["Node.js 服务端实时运行 DynamicCart", "将小段结果推过 HTTP 线缆填补在页面里"], note: "最先进的全栈架构模式", delayMs: 800 }
      ]
    },
    sources: [{ title: "Partial Prerendering (PPR)", url: "https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering" }],
    summary: ["融合 SSG 和 SSR 在同一个页面的不同层级", "利用 React Suspense 来声明动态“空洞”", "提供了世界上最激进的高性能页面架构方案"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-rendering-cache",
    stageId: "nextjs-rendering",
    kind: "knowledge",
    eyebrow: "02.8 · 渲染模式",
    title: "渲染缓存与 Full Route Cache",
    objectives: ["理解 Next.js 极度激进的四级缓存架构中的路由层缓存"],
    prerequisites: ["nextjs-rendering-ssg"],
    concept: "Next.js 拥有非常激进的多层缓存机制。其中【Full Route Cache】指的是框架会将那些没有任何动态输入（未读取动态参数、未使用 cookies）的页面，在底层自动缓存它的 HTML 和 React 序列化载荷（RSC Payload）。这意味着很多看起来像 SSR 的页面，实际上已经被底层静态化了。",
    points: ["不依赖请求特定数据的路由默认会被自动缓存（SSG 效果）", "当重新部署项目或按需调用 revalidatePath 时失效", "在开发环境 (next dev) 默认不开启，只有 build 后生效"],
    memoryHook: "无动态依赖，自动全页缓存",
    files: [{ name: "app/info/page.tsx", code: `export default function InfoPage() {
  // 注意：我们这里没有调用 cookies(), 没有使用 params
  // 甚至没有进行任何需要每次刷新的 fetch
  return (
    <article>
      <h1>系统静态信息</h1>
      <p>这段文字属于硬编码，不依赖数据库查询。</p>
      <p>编译时间标记: {new Date().toISOString()}</p>
    </article>
  );
}` }],
    entryFile: "app/info/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在生产环境（`next build && next start`）下，用户多次强制刷新这个 `/info` 页面，打印出的 `编译时间标记` 会如何变化？",
      options: [
        { id: "a", label: "每次刷新时间都会变", detail: "因为有 Date.now()", feedback: "在纯 Node.js 或普通 SSR 中是这样，但在 Next.js 生产环境表现不同。" },
        { id: "b", label: "时间保持不变，锁定在服务器构建或第一次生成时的时间", detail: "命中全路由缓存", feedback: "正确：因为页面未声明它是动态的，它被 Full Route Cache 捕获了。" },
        { id: "c", label: "取决于浏览器本地是否有该页面的缓存", detail: "客户端行为", feedback: "这是服务端的缓存机制，与浏览器端的缓存控制无关。" }
      ],
      answerId: "b",
      correctExplanation: "这经常让新手感到困惑：我明明写了一个动态执行的 JS 语句（如 Date.now 甚至 Math.random），为什么线上刷新页面数字不跳动了？这是因为 Next.js 在判断一个路由没有明确的动态约束时，会极其激进地应用 Full Route Cache。你的页面在构建时运行了一次并生成了静态资产，之后的访问都会直接复用这个结果。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "Next.js 缓存层级", nodes: ["构建页面", "缓存未命中", "存入 Route Cache", "多次请求拦截", "复用静态产物"] },
      lanes: ["生成阶段", "初始访问", "后续高并发访问"],
      frames: [
        { activeLane: 0, laneValues: ["扫描路由类型", "等待", "等待"], log: ["发现无动态函数依赖", "标记该路由可供静态缓存"], note: "Next.js 的静态分析能力", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "初次渲染并存盘", "等待"], log: ["执行 new Date()", "将生成的 HTML 和 RSC payload 写入磁盘/内存缓存"], note: "第一次计算代价被支付", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "命中缓存截断后续逻辑"], log: ["大量请求涌入", "不再执行组件 JS 代码", "直接返回缓存中的静态载荷"], note: "极大地保护了服务器性能", delayMs: 800 }
      ]
    },
    sources: [{ title: "Full Route Cache", url: "https://nextjs.org/docs/app/building-your-application/caching#full-route-cache" }],
    summary: ["静态路由会自动进入 Full Route Cache", "极大地提升了常规页面的交付吞吐量", "理解这一机制是调试“为什么页面数据不更新”的关键"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-news-aggregator",
    stageId: "nextjs-rendering",
    kind: "stage-project",
    eyebrow: "阶段项目 02 · 渲染模式",
    title: "多维新闻聚合器",
    difficulty: "进阶",
    objectives: ["整合 Next.js 的多种渲染模式到同一个综合项目中", "掌握在真实应用场景下选择合适的渲染边界"],
    prerequisites: ["nextjs-rendering-ssr", "nextjs-rendering-ssg", "nextjs-rendering-isr", "nextjs-rendering-suspense", "nextjs-rendering-sc-vs-cc"],
    concept: "在这个项目中，你将负责架构一个新闻阅读系统。不同类型的数据对新鲜度和加载速度有着不同的要求：静态的站点主导航页适合用 SSG 以达到秒开；热门新闻榜单适合使用 ISR（例如 10分钟更新一次）；而依赖用户鉴权的“我的订阅”区则必须使用 SSR，并利用 Suspense 配合流式传送进行体验优化。",
    points: ["根据业务诉求配置模块的不同缓存/渲染策略", "在服务器组件中进行数据聚合和权限过滤", "剥离纯交互功能（如收藏按钮）到客户端组件"],
    memoryHook: "动静结合，快慢分层",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：利用 Suspense 分离快慢数据",
        context: "首页混合了静态数据和个人定制的慢速数据，使用 Suspense 将个人数据剥离成流式传送，确保不阻塞主导航。",
        files: [
          { name: "app/page.tsx", code: `import { Suspense } from 'react';\nimport { cookies } from 'next/headers';\nimport TopNewsList from './components/TopNewsList';\nimport PersonalFeed from './components/PersonalFeed';\n\n// 首页：综合利用多种模式\nexport default function NewsAggregator() {\n  return (\n    <div className="layout-grid">\n      <header>今日全球头条</header>\n      \n      {/* 热门新闻：使用子组件内部的 fetch(url, { next: { revalidate: 600 } }) ISR */}\n      <section className="col-left">\n        <TopNewsList /> \n      </section>\n\n      {/* 个性化新闻：依赖动态 cookies，使用 SSR 配合 Suspense 加载 */}\n      <section className="col-right">\n        <Suspense fallback={<div className="pulse-skeleton">分析兴趣流...</div>}>\n          <PersonalFeed />\n        </Suspense>\n      </section>\n    </div>\n  )\n}` }
        ],
        entryFile: "app/page.tsx",
        question: {
          id: "project-nextjs-news-aggregator-step1",
          type: "prediction",
          prompt: "如果在没有 Suspense 的情况下直接渲染 `<PersonalFeed />`，首页加载体验会受到什么影响？",
          options: [
            { id: "a", label: "会被慢速的个人数据接口完全阻塞，直到全部计算完毕才会展现整个网页", detail: "单体阻塞", feedback: "正确：SSR 默认是单体阻塞的，引入 Suspense 可以将其转化为分块流式渲染，避免最慢的部分拖累最快的部分。" },
            { id: "b", label: "Next.js 会自动优化它，体验没有区别", detail: "错误认知", feedback: "Next.js 不会自动给每个组件加 Suspense边界，如果未提供边界，则必须等待全页面加载。" }
          ],
          answerId: "a",
          correctExplanation: "Suspense 的使用打破了单体阻塞，实现了流式渲染。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：服务端挂载客户端交互",
        context: "在后推来的个性化内容中，依然可以无缝包含 Client Component。",
        files: [
          { name: "app/components/PersonalFeed.tsx", code: `import { cookies } from 'next/headers';\nimport FavoriteButton from './FavoriteButton'; // 这个是 Client Component\n\nexport default async function PersonalFeed() {\n  const token = (await cookies()).get('auth');\n  if (!token) return <p>请登录以查看专属推荐。</p>;\n\n  // 模拟耗时的大数据推荐接口\n  const feed = await fetchPrivateData(token.value);\n  \n  return (\n    <ul>\n      {feed.map(item => (\n        <li key={item.id}>\n          {item.title} <FavoriteButton itemId={item.id} />\n        </li>\n      ))}\n    </ul>\n  );\n}` }
        ],
        entryFile: "app/components/PersonalFeed.tsx",
        question: {
          id: "project-nextjs-news-aggregator-step2",
          type: "transfer",
          prompt: "在未登录访客（无 cookies）和已登录用户（有 cookies）访问该页面时，渲染管线是如何表现的？",
          options: [
            { id: "a", label: "PersonalFeed 会在浏览器发起网络请求获取数据", detail: "CSR 理解误区", feedback: "代码在 `PersonalFeed` 内直接使用了 await fetchPrivateData，这仍然是发生在服务端的 SSR。" },
            { id: "b", label: "页面首屏将瞬间利用缓存和快速的头条数据吐出界面和骨架屏；随后对于登录用户，服务器在后台计算推荐内容并流式推给客户端的 `PersonalFeed`", detail: "分层分块传送机制", feedback: "正确：这种设计完美榨取了所有模式的优点，动静分离，各司其职。" }
          ],
          answerId: "b",
          correctExplanation: "这个架构完美展现了 Next.js 的高阶应用哲学。整个应用的初次握手响应不被个性化慢接口阻塞。而复杂的权限和大数据查询被隔离在了 `PersonalFeed` 这个服务端组件的“洞”里，随后悄然抵达浏览器，并在它里面挂载好包含纯交互逻辑的（Client Component）`FavoriteButton`。"
        }
      }
    ],
    sources: [{ title: "Rendering in Next.js", url: "https://nextjs.org/docs/app/building-your-application/rendering" }],
    summary: ["不同页面/不同区块按需选取合适的渲染模式", "利用 React 边界组件化解长耗时查询对体验的拖累", "区分状态承载者（服务端代码）和动作发起者（客户端组件）"]
  })
];
