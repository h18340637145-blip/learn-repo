import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageZeroFoundationsLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-foundations-what-is-nextjs",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.1 · Next.js 基础",
    title: "Next.js 是什么",
    objectives: ["理解 Next.js 的全栈 React 框架定位"],
    prerequisites: [],
    concept: "Next.js 是基于 React 的全栈框架。它扩展了 React，提供了基于文件系统的路由、服务端渲染（SSR）和静态生成（SSG），让你能构建兼具 SEO 与交互体验的全栈应用。现在最推荐使用的是 App Router 架构。",
    points: ["React 提供 UI 库，Next.js 提供应用级框架", "默认采用 Server Components，代码在服务端运行", "包含路由、数据获取、样式和优化的开箱即用方案"],
    memoryHook: "React 的全栈超集",
    files: [{ name: "page.tsx", code: `// 这个组件运行在服务端
export default function Page() {
  const message = "Hello from Server!";
  console.log("这会在服务器终端打印，浏览器控制台看不到");
  
  return (
    <main>
      <h1>{message}</h1>
      <p>这是 Next.js 渲染的页面。</p>
    </main>
  );
}` }],
    entryFile: "page.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个 Next.js 页面中，`console.log` 的输出会显示在哪里？",
      options: [
        { id: "a", label: "浏览器的开发者工具控制台", detail: "像普通 React 一样", feedback: "Next.js 默认是 Server Components，这段代码不会发送到浏览器端执行。" },
        { id: "b", label: "运行 Next.js 的服务端终端", detail: "因为是 Server Component", feedback: "正确：在 App Router 中，默认组件都在服务端运行，日志也会打印在服务端。" },
        { id: "c", label: "两边都会显示", detail: "因为同构渲染", feedback: "传统的 Pages Router 下部分情况可能是这样，但在 App Router 的 Server Components 下，代码仅在服务端运行。" }
      ],
      answerId: "b",
      correctExplanation: "Next.js App Router 默认使用 Server Components。这意味着组件的代码（包括 console.log）只在服务端执行，然后将渲染好的 HTML 发送给浏览器，所以日志只能在服务端终端看到。"
    },
    additionalQuestions: [{
      id: "nextjs-foundations-what-is-nextjs-implementation",
      type: "implementation",
      prompt: "如果你需要在这个组件中使用只在浏览器才有的 `window` 对象，哪种实现方式是正确的？",
      options: [
        {
          id: "a",
          label: "在文件顶部添加 'use client' 指令",
          detail: "将组件转换为 Client Component",
          feedback: "正确：'use client' 告诉 Next.js 该组件及其导入的组件需要在客户端渲染，这样就可以安全使用 window 对象了。",
          language: "tsx",
          diffLines: [1, 2],
          code: `'use client';

export default function Page() {
  const message = typeof window !== 'undefined' ? "Hello Client!" : "Hello Server!";
  return (
    <main>
      <h1>{message}</h1>
      <p>这是 Next.js 渲染的页面。</p>
    </main>
  );
}`
        },
        {
          id: "b",
          label: "直接在组件内使用 window",
          detail: "不改变组件类型",
          feedback: "Server Component 在服务端执行，服务端没有 window 对象，直接使用会报错 window is not defined。",
          language: "tsx",
          diffLines: [3],
          code: `// 这个组件运行在服务端
export default function Page() {
  const width = window.innerWidth;
  return (
    <main>
      <h1>Width: {width}</h1>
    </main>
  );
}`
        },
        {
          id: "c",
          label: "在 useEffect 中使用但不加 'use client'",
          detail: "使用 Hook 解决",
          feedback: "Server Component 不支持使用如 useEffect、useState 等 React hooks，会抛出错误。",
          language: "tsx",
          diffLines: [3],
          code: `import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    console.log(window.innerWidth);
  }, []);
  return <main><h1>Page</h1></main>;
}`
        }
      ],
      answerId: "a",
      correctExplanation: "App Router 中默认是 Server Component，要使用浏览器 API 或 React hooks，必须在文件开头声明 'use client'，将其变为 Client Component。",
      difficulty: "beginner",
      estimatedSeconds: 80,
    }],
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "Next.js 渲染管线", nodes: ["源码", "编译", "Server Component", "HTML", "Hydration"] },
      lanes: ["源码解析", "服务端渲染", "响应 HTML"],
      frames: [
        { activeLane: 0, laneValues: ["page.tsx", "等待", "等待"], log: ["Next.js 启动 dev server"], note: "Next.js 开始处理页面请求", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行 Server Component", "等待"], log: ["这会在服务器终端打印，浏览器控制台看不到"], note: "组件在服务端运行，打印日志", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "返回静态 HTML"], log: ["发送 HTML 响应"], note: "生成 HTML 并返回给浏览器，浏览器控制台无此日志", delayMs: 800 }
      ]
    },
    sources: [{ title: "What is Next.js?", url: "https://nextjs.org/docs" }],
    summary: ["Next.js 是生产级的 React 框架", "App Router 默认组件在服务端运行", "减少了客户端 JavaScript 的体积"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-app-router",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.2 · Next.js 基础",
    title: "App Router 目录结构",
    objectives: ["掌握 app 目录下的特殊文件约定"],
    prerequisites: ["nextjs-foundations-what-is-nextjs"],
    concept: "Next.js 的路由是由文件系统决定的。在 `app` 目录下，文件夹名称定义了路由的路径。但仅仅有文件夹还不够，只有当文件夹内包含 `page.tsx`（或 `route.ts`）时，这个路由才会被公开访问。其他特殊文件如 `layout.tsx`、`loading.tsx` 则负责不同的 UI 边界。",
    points: ["文件夹定义路由段（Route Segments）", "page.tsx 使得路由公开可访问", "可以安全地在 app 目录并置组件和文件，只要不是特殊的 page.tsx 等文件"],
    memoryHook: "文件夹定路径，page 定可见",
    files: [{ name: "app/dashboard/page.tsx", code: `// 路径: /dashboard
import DashboardStats from './stats-component';

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>
      <DashboardStats />
    </div>
  );
}` }, { name: "app/dashboard/stats-component.tsx", code: `// 这是一个普通组件文件，不是路由文件
export default function DashboardStats() {
  return <div className="stats">流量: 10k</div>;
}` }],
    entryFile: "app/dashboard/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果用户在浏览器中访问 `/dashboard/stats-component`，会看到什么？",
      options: [
        { id: "a", label: "显示 DashboardStats 组件的内容", detail: "因为文件在这个路径下", feedback: "错误。Next.js 的 App Router 只有包含 page.tsx 才是一个可访问的路由。" },
        { id: "b", label: "404 Not Found 页面", detail: "因为没有对应的 page.tsx", feedback: "正确：文件夹结构定义了路由，但 `stats-component.tsx` 只是普通文件，不是特殊的路由文件，所以不会暴露为网页。" },
        { id: "c", label: "500 Server Error", detail: "因为组件没有默认导出", feedback: "并不是服务器错误，而是路由根本不存在。" }
      ],
      answerId: "b",
      correctExplanation: "在 App Router 中，你可以安全地将组件、样式文件等直接放在路由文件夹中（称为 Colocation）。只有命名为 `page.tsx`、`route.ts` 等约定的文件才会被 Next.js 作为路由终点暴露出来。"
    },
    additionalQuestions: [{
      id: "nextjs-foundations-app-router-implementation",
      type: "implementation",
      prompt: "要发布 `/dashboard/settings` 页面，哪组文件结构是正确的？",
      options: [
        {
          id: "a",
          label: "在路由段内放置 page.tsx",
          detail: "文件夹负责路径，page.tsx 负责公开页面",
          feedback: "正确：`app/dashboard/settings/page.tsx` 会公开 `/dashboard/settings` 路由。",
          language: "tsx",
          diffLines: [1, 2, 3],
          code: `// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <h1>Settings</h1>;
}`,
        },
        {
          id: "b",
          label: "只创建普通组件文件",
          detail: "组件不会自动成为路由",
          feedback: "普通组件可以被 page.tsx 引用，但自身不会变成可访问页面。",
          language: "tsx",
          diffLines: [1],
          code: `// app/dashboard/settings.tsx
export default function Settings() {
  return <h1>Settings</h1>;
}`,
        },
        {
          id: "c",
          label: "把页面写在 lib 目录",
          detail: "脱离 app 路由树",
          feedback: "`lib` 适合工具函数和服务端模块，不参与 App Router 的路由匹配。",
          language: "tsx",
          diffLines: [1],
          code: `// lib/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <h1>Settings</h1>;
}`,
        },
      ],
      answerId: "a",
      correctExplanation: "App Router 根据 app 目录下的路由段匹配 URL；只有特殊文件 `page.tsx` 才会把这个路由段公开给浏览器访问。",
      difficulty: "beginner",
      estimatedSeconds: 100,
    }],
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "layout", "page", "loading", "error"] },
      lanes: ["请求匹配", "查找文件", "响应结果"],
      frames: [
        { activeLane: 0, laneValues: ["GET /dashboard/stats-component", "等待", "等待"], log: ["接收请求 /dashboard/stats-component"], note: "用户尝试访问路径", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "检查页面文件", "等待"], log: ["未找到 /dashboard/stats-component/page.tsx"], note: "Next.js 寻找对应的 page.tsx", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "404 Not Found"], log: ["返回 404 状态"], note: "由于没有 page.tsx，即使存在普通同名组件也无法访问", delayMs: 800 }
      ]
    },
    sources: [{ title: "Project Structure", url: "https://nextjs.org/docs/app/getting-started/project-structure" }],
    summary: ["文件夹映射到 URL 路径", "只有 page.tsx 会把路由公开", "可以放心地将组件就近存放在相关路由目录下"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-pages",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.3 · Next.js 基础",
    title: "页面与动态路由",
    objectives: ["了解如何创建动态路由"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "当你不知道确切的段名，想从动态数据创建路由时，可以使用动态路由（Dynamic Routes）。通过将文件夹名称用方括号括起来创建，例如 `[id]` 或 `[slug]`。页面的 `params` 属性中会包含这个动态片段的值。",
    points: ["方括号 `[folderName]` 定义动态段", "页面组件可以通过 props.params 访问该段的值", "常用于博客文章、商品详情等"],
    memoryHook: "方括号抓取 URL 参数",
    files: [{ name: "app/blog/[slug]/page.tsx", code: `export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  
  return (
    <article>
      <h1>阅读文章: {slug}</h1>
    </article>
  );
}` }],
    entryFile: "app/blog/[slug]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果访问 `/blog/hello-world`，页面上 `<h1>` 标签渲染的内容是什么？",
      options: [
        { id: "a", label: "阅读文章: [slug]", detail: "字面量输出", feedback: "不会输出字面量，动态参数会被解析。" },
        { id: "b", label: "阅读文章: hello-world", detail: "参数注入", feedback: "正确：URL 中的 'hello-world' 被提取为 `slug` 属性，并在组件中渲染。" },
        { id: "c", label: "发生运行时错误", detail: "slug 未定义", feedback: "params 中会提供解析好的属性。" }
      ],
      answerId: "b",
      correctExplanation: "动态路由通过方括号 `[slug]` 捕获 URL 的对应部分。在 Next.js 15+ 中，`params` 是一个 Promise，等待解析后会得到 `{ slug: 'hello-world' }`，你可以将其展示在页面上。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "layout", "page", "loading", "error"] },
      lanes: ["请求匹配", "提取参数", "组件渲染"],
      frames: [
        { activeLane: 0, laneValues: ["GET /blog/hello-world", "等待", "等待"], log: ["匹配路由: app/blog/[slug]/page.tsx"], note: "方括号路由匹配了任意的 slug 路径", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "params = {slug: 'hello-world'}", "等待"], log: ["提取路径参数"], note: "从 URL 中提取变量传递给 params", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "渲染 HTML"], log: ["生成 <h1>阅读文章: hello-world</h1>"], note: "组件使用该参数生成内容", delayMs: 800 }
      ]
    },
    sources: [{ title: "Dynamic Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes" }],
    summary: ["使用 [param] 命名文件夹定义动态路由", "通过 await params 访问路由参数", "是构建详情页的基础模式"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-layouts",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.4 · Next.js 基础",
    title: "布局与嵌套",
    objectives: ["掌握布局文件的工作原理及状态保持"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "布局（`layout.tsx`）是多个页面共享的 UI。它会包裹对应的页面或子布局。重要的是，当用户在属于同一个布局的路由间导航时，布局组件**不会被重新挂载**，这意味着它保持着交互状态、不重新渲染，也不会丢失数据。",
    points: ["layout.tsx 接收 children 并渲染子页面", "根目录必须有 layout.tsx（Root Layout）", "导航时局部渲染，布局状态持久化"],
    memoryHook: "布局包页面，导航不刷新",
    files: [{ name: "app/dashboard/layout.tsx", code: `export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <nav>固定导航栏</nav>
      {/* 变化的子页面在这里渲染 */}
      <div className="content">{children}</div>
    </section>
  );
}` }],
    entryFile: "app/dashboard/layout.tsx",
    answer: {
      type: "prediction",
      prompt: "用户从 `/dashboard/settings` 跳转到 `/dashboard/profile` 时，`DashboardLayout` 中的导航栏会发生什么？",
      options: [
        { id: "a", label: "重新执行渲染，状态清空", detail: "因为 URL 变了", feedback: "错误。这也是 Next.js App Router 布局系统设计的核心优势之一：它不会重绘。" },
        { id: "b", label: "保持原样，不会重新渲染", detail: "因为它们共享此布局", feedback: "正确：布局组件保持原有的 DOM 和状态，只有 `children` 属性对应的内部页面发生替换。" },
        { id: "c", label: "整个网页进行硬刷新", detail: "浏览器行为", feedback: "Next.js 使用单页应用风格的客户端路由，不会硬刷新整个页面。" }
      ],
      answerId: "b",
      correctExplanation: "共享布局是 Next.js 中非常重要的特性。在发生客户端导航时，只重新渲染发生变化的子页面片段（Partial Rendering），而其外部包裹的布局将保留状态和 DOM。这使得页面切换既快又平滑。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "layout", "page", "loading", "error"] },
      lanes: ["页面切换", "对比树", "DOM 更新"],
      frames: [
        { activeLane: 0, laneValues: ["-> /dashboard/profile", "等待", "等待"], log: ["触发客户端路由跳转"], note: "用户发起导航", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "发现共享 layout", "等待"], log: ["DashboardLayout 无变化"], note: "Next.js 知道这个布局无需更新", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "仅替换 children"], log: ["渲染 Profile 页面", "保留旧的 Nav 状态"], note: "局部更新带来了优秀的性能体验", delayMs: 800 }
      ]
    },
    sources: [{ title: "Layouts", url: "https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates" }],
    summary: ["布局文件通过 children 嵌套子路由", "同层级路由跳转时，布局维持状态", "减少不必要的数据抓取和渲染损耗"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-server-components",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.5 · Next.js 基础",
    title: "Server Components 详解",
    objectives: ["理解 RSC 的优势和使用场景"],
    prerequisites: ["nextjs-foundations-what-is-nextjs"],
    concept: "React Server Components (RSC) 是 App Router 的默认组件。它们在服务端运行并渲染。这允许你把数据获取放在组件内部直接进行，而不需要暴露 API，同时也意味着组件依赖的大型库不会被打包发送到用户的浏览器里。",
    points: ["组件默认就是 RSC", "支持 async/await 直接获取数据", "不能使用 useState 或 onClick 等交互特性"],
    memoryHook: "服务端运行，无 JS 包袱",
    files: [{ name: "app/users/page.tsx", code: `import db from '@/lib/db'; // 敏感的数据库连接模块

// 可以直接使用 async
export default async function UsersPage() {
  // 在服务端直接查库，没有 API 接口开销
  const users = await db.query('SELECT * FROM users');

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}` }],
    entryFile: "app/users/page.tsx",
    answer: {
      type: "prediction",
      prompt: "这段代码中的 `import db from '@/lib/db'`，会把数据库连接库打包发送到用户的浏览器吗？",
      options: [
        { id: "a", label: "会，因为在文件中 import 了", detail: "打包工具的默认行为", feedback: "在传统单页应用 (SPA) 中是这样，但在 Server Component 中不同。" },
        { id: "b", label: "不会，打包后只包含渲染好的 HTML 结构", detail: "代码留在服务端", feedback: "正确：Server Component 只在服务器上执行，打包发送给浏览器的仅是没有 `db` 库残留的 UI 描述和 HTML。" },
        { id: "c", label: "会在浏览器端报错", detail: "因为浏览器连不上数据库", feedback: "代码根本不会在浏览器中执行，而是服务器执行完再将结果传给浏览器。" }
      ],
      answerId: "b",
      correctExplanation: "这是 Server Components 的杀手级特性：你可以使用任意服务端环境的库（比如数据库驱动、文件系统访问、大型处理库等），而这部分代码**永远不会**进入客户端的 JS Bundle 中。这极大地减小了客户端代码体积并增强了安全性。"
    },
    execution: {
      visualizer: { type: "nextjs-render-pipeline", title: "Next.js 渲染管线", nodes: ["源码", "编译", "Server Component", "HTML", "Hydration"] },
      lanes: ["服务端执行", "Bundle 剥离", "客户端接收"],
      frames: [
        { activeLane: 0, laneValues: ["await db.query", "等待", "等待"], log: ["连接数据库获取 user 数据"], note: "组件在服务端像 Node 脚本一样运行", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "丢弃 db 依赖", "等待"], log: ["剔除仅服务端使用的 import"], note: "构建工具知道这是一个 RSC", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "纯 HTML 列表"], log: ["浏览器加载零 JS"], note: "最终用户只收到了渲染好的 <ul> 数据，极速呈现", delayMs: 800 }
      ]
    },
    sources: [{ title: "Server Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" }],
    summary: ["默认组件只在服务器运行", "天然支持异步数据获取", "保持客户端 JS 极度轻量"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-client-components",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.6 · Next.js 基础",
    title: "Client Components 与指令",
    objectives: ["了解如何添加交互性"],
    prerequisites: ["nextjs-foundations-server-components"],
    concept: "当页面需要响应用户事件（如 `onClick`）、使用 React 状态（`useState`）或生命周期钩子时，你需要用到 Client Components。通过在文件的最顶部添加 `'use client'` 指令，告诉 Next.js 这部分代码以及它的所有导入也需要在浏览器端执行。但注意，Client Components 依然会在服务端进行预渲染（SSR）。",
    points: ["文件顶部声明 `'use client'`", "允许使用浏览器 API、状态和事件处理器", "尽量把 Client Components 放在渲染树的叶子节点，保持 RSC 优势"],
    memoryHook: "有交互就用 use client",
    files: [{ name: "app/components/Counter.tsx", code: `'use client'; // 告诉打包器，它需要发送到浏览器

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      已点击 {count} 次
    </button>
  );
}` }],
    entryFile: "app/components/Counter.tsx",
    answer: {
      type: "prediction",
      prompt: "如果不加 `'use client'` 会发生什么？",
      options: [
        { id: "a", label: "正常运行，但状态不会更新", detail: "组件变成静态的", feedback: "不是变成静态的，而是会直接报错。" },
        { id: "b", label: "报错：useState / onClick 只能在 Client Component 中使用", detail: "RSC 不支持交互", feedback: "正确：默认是 Server Component，而 Server Component 运行完生命周期就结束了，不支持状态和事件处理器。" },
        { id: "c", label: "会导致整个项目回退到 SPA 模式", detail: "降级渲染", feedback: "Next.js 会直接抛出构建或运行时错误提示你使用 'use client'，不会自动静默降级。" }
      ],
      answerId: "b",
      correctExplanation: "Server Components 不能使用诸如 `useState`、`useEffect` 或者传递 `onClick` 等函数。当你需要交互性时，必须显式地用 `'use client'` 划定边界，跨越这条边界后的代码都会打包给浏览器以实现交互（Hydration）。"
    },
    execution: {
      visualizer: { type: "nextjs-component-boundary", title: "Server/Client 组件边界", nodes: ["Server", "Boundary", "Client", "Hydration", "Interactive"] },
      lanes: ["SSR 预渲染", "客户端 Hydration", "用户交互"],
      frames: [
        { activeLane: 0, laneValues: ["生成静态 Button", "等待", "等待"], log: ["服务端输出 <button>已点击 0 次</button>"], note: "虽然是 Client Component，初始依然会在服务端渲染出 HTML", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "下载 JS 并水合", "等待"], log: ["浏览器加载 React 和组件 JS"], note: "浏览器开始为页面附加事件处理器", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "更新 count"], log: ["onClick 触发，执行 setCount"], note: "组件变成可交互的，状态在客户端变化", delayMs: 800 }
      ]
    },
    sources: [{ title: "Client Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/client-components" }],
    summary: ["'use client' 声明交互边界", "Client Component 也有 SSR 初始渲染过程", "用于状态、事件与浏览器 API"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-navigation",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.7 · Next.js 基础",
    title: "导航与预取",
    objectives: ["使用 <Link> 组件实现极速路由切换"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "在 Next.js 中，你不应该使用普通的 HTML `<a>` 标签进行内部导航。通过使用 `next/link` 提供的 `<Link>` 组件，Next.js 会在后台拦截导航事件，进行客户端无刷新路由（SPA 风格跳转）。更神奇的是，只要 `<Link>` 出现在视口中，Next.js 就会**自动在后台预取（prefetch）**对应页面的代码和数据。",
    points: ["使用 next/link 的 Link 组件", "实现无刷新页面跳转（客户端路由）", "默认在视口可见时自动 prefetch，页面瞬间加载"],
    memoryHook: "内部跳转全用 Link",
    files: [{ name: "app/page.tsx", code: `import Link from 'next/link';

export default function Home() {
  return (
    <nav>
      {/* 错误做法：引发整个页面硬刷新 */}
      <a href="/about">About (HTML a)</a>

      {/* 正确做法：客户端路由且自动预取 */}
      <Link href="/about">About (Next Link)</Link>
    </nav>
  );
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "当用户将页面滚动，使得 `<Link href=\"/about\">` 出现在屏幕可视区域内时，后台会发生什么行为？",
      options: [
        { id: "a", label: "什么也不发生，等待用户点击", detail: "节省带宽", feedback: "Next.js 的设计哲学是尽可能提供极速体验，默认有智能预取机制。" },
        { id: "b", label: "自动在后台发起请求，预加载 /about 的数据", detail: "Prefetch 机制", feedback: "正确：Next.js 会观察视口内的 Link，并在空闲时提前把目标路由的代码和服务器组件载荷（RSC Payload）取回来。" },
        { id: "c", label: "立刻静默导航到 /about 页面", detail: "自动跳转", feedback: "预加载是为了让点击后瞬间展现，绝不会在用户未点击时强行跳转页面。" }
      ],
      answerId: "b",
      correctExplanation: "`<Link>` 组件结合了 React 的客户端路由和 Next.js 强大的路由预取能力（Prefetching）。由于页面代码和数据在用户点击前已经被下载到浏览器，最终页面跳转几乎是瞬间完成的，这就是 Next.js 应用感觉极快的原因。"
    },
    execution: {
      visualizer: { type: "nextjs-routing-tree", title: "文件系统路由树", nodes: ["app/", "layout", "page", "loading", "error"] },
      lanes: ["视口可见", "后台预取", "用户点击"],
      frames: [
        { activeLane: 0, laneValues: ["Link 进入屏幕", "等待", "等待"], log: ["Intersection Observer 触发"], note: "Next.js 注意到了 Link", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "Fetch /about", "等待"], log: ["后台下载 about 页面片段缓存"], note: "数据准备就绪，用户甚至还没点击", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "瞬间呈现"], log: ["从缓存读取直接渲染页面"], note: "无网络延迟，客户端路由立刻更新视图", delayMs: 800 }
      ]
    },
    sources: [{ title: "Linking and Navigating", url: "https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating" }],
    summary: ["内部导航必须使用 Link 组件", "自带可视区域自动预取优化", "提供单页应用的无刷新极速体验"]
  }),
  createNextjsLessonSpec({
    id: "nextjs-foundations-config",
    stageId: "nextjs-foundations",
    kind: "knowledge",
    eyebrow: "00.8 · Next.js 基础",
    title: "环境变量边界",
    objectives: ["了解服务端和客户端环境的变量安全约定"],
    prerequisites: ["nextjs-foundations-what-is-nextjs"],
    concept: "安全是框架的核心设计。在 `.env` 中定义的所有环境变量默认只对 Node.js（也就是 Server Components 或 API 路由）可见，从而保护你的数据库密码或 API 密钥。如果某个环境变量真的需要被打包并发送给浏览器（比如打点上报的 Token），你必须显式地以 `NEXT_PUBLIC_` 为前缀命名它。",
    points: ["普通变量如 `DB_PASS` 仅在服务端可用", "使用 `NEXT_PUBLIC_` 前缀暴露给浏览器", "客户端组件强行读取普通变量会得到 undefined"],
    memoryHook: "有 PUBLIC 才过界",
    files: [{ name: ".env", code: `DB_PASSWORD=super-secret-123
NEXT_PUBLIC_ANALYTICS_ID=analytics-999` }, { name: "app/client-page.tsx", code: `'use client'; // 这是客户端组件

export default function Page() {
  const dbPass = process.env.DB_PASSWORD;
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  
  return (
    <div>
      <p>数据库: {dbPass}</p>
      <p>统计ID: {analyticsId}</p>
    </div>
  );
}` }],
    entryFile: "app/client-page.tsx",
    answer: {
      type: "prediction",
      prompt: "在浏览器中访问这个页面，`数据库: ` 后面会显示什么内容？",
      options: [
        { id: "a", label: "super-secret-123", detail: "读取了 .env 文件", feedback: "如果这种事发生，应用的密钥就全泄漏给用户浏览器了，这是巨大的安全漏洞。" },
        { id: "b", label: "空（undefined）", detail: "被框架剥离", feedback: "正确：因为是在 'use client' 组件里，且变量名没有 NEXT_PUBLIC_ 前缀，构建时 Next.js 会将其替换为空，保护密钥。" },
        { id: "c", label: "导致构建失败报错", detail: "因为不安全的引用", feedback: "它不会导致报错，只是安全地变成 undefined。这有时会导致初学者迷惑，但保证了安全。" }
      ],
      answerId: "b",
      correctExplanation: "在构建过程中，Next.js 会把代码中所有的 `process.env.NEXT_PUBLIC_XXX` 替换成具体的字符串（比如 `analytics-999`），而对于没有该前缀的变量，如果出现在 Client Components 中，只会默默地变成 `undefined`，确保敏感凭据绝不流出服务器。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "构建优化输出", nodes: ["CSS", "Font", "Image", "Bundle", "Score"] },
      lanes: ["读取 .env", "客户端代码构建", "浏览器运行"],
      frames: [
        { activeLane: 0, laneValues: ["加载环境变量", "等待", "等待"], log: ["载入 DB_PASSWORD", "载入 NEXT_PUBLIC_ANALYTICS_ID"], note: "Node.js 启动时加载了所有变量", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "内联 PUBLIC 变量", "等待"], log: ["替换 NEXT_PUBLIC_ANALYTICS_ID", "剔除 DB_PASSWORD"], note: "构建工具打包 Client Component", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "渲染结果"], log: ["显示 统计ID: analytics-999", "显示 数据库: undefined"], note: "确保密钥不会泄露", delayMs: 800 }
      ]
    },
    sources: [{ title: "Environment Variables", url: "https://nextjs.org/docs/app/building-your-application/configuring/environment-variables" }],
    summary: ["无前缀变量是服务器私有的", "NEXT_PUBLIC_ 显式公开变量", "框架级保障防止配置泄露"]
  }),
  createNextjsLessonSpec({
    id: "project-nextjs-homepage",
    stageId: "nextjs-foundations",
    kind: "stage-project",
    eyebrow: "阶段项目 00 · 基础训练",
    title: "多页个人主页",
    durationMinutes: 15,
    difficulty: "进阶",
    objectives: ["综合应用路由、布局、Server/Client 概念"],
    prerequisites: ["nextjs-foundations-navigation"],
    concept: "我们将构建一个带有共享导航栏的个人主页应用，包含服务端获取数据的博客列表，以及客户端交互的主题切换按钮。",
    points: ["利用 layout.tsx 创建全站共享的头部导航", "利用 Server Component 在页面直接获取数据", "利用 Client Component 实现交互"],
    memoryHook: "路由定结构，组件分职能",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：构建共享导航布局",
        context: "Next.js App Router 允许在 layout.tsx 中定义共享 UI，比如导航栏，它会在所有页面中保持不卸载。",
        files: [
          { name: "app/layout.tsx", code: `import Link from 'next/link';\nimport ThemeToggle from './ThemeToggle';\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="zh-CN">\n      <body>\n        <nav>\n          <Link href="/">首页</Link>\n          <Link href="/blog">博客</Link>\n          <ThemeToggle />\n        </nav>\n        <main>{children}</main>\n      </body>\n    </html>\n  );\n}` },
          { name: "app/ThemeToggle.tsx", code: `'use client';\nimport { useState } from 'react';\n\nexport default function ThemeToggle() {\n  const [theme, setTheme] = useState('light');\n  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>;\n}` }
        ],
        entryFile: "app/layout.tsx",
        question: {
          id: "project-nextjs-homepage-step1",
          type: "prediction",
          prompt: "在 `layout.tsx` 中导入的 `ThemeToggle` 组件，由于其首行写了 `'use client'`，这会导致什么结果？",
          options: [
            { id: "a", label: "整个 layout.tsx 也会被迫变成客户端组件", detail: "错误传染链", feedback: "Server Component 能够导入和渲染 Client Component，而不会被其感染。" },
            { id: "b", label: "只有 ThemeToggle 的交互逻辑会打包并发送给浏览器", detail: "精确隔离", feedback: "正确：'use client' 是一条边界，它之后的组件逻辑会被打包给客户端，而外部的 layout 依然在服务端渲染。" }
          ],
          answerId: "b",
          correctExplanation: "只有 `ThemeToggle` 声明了 `'use client'`，其交互逻辑需要打包给客户端；而 `layout.tsx` 作为 Server Component，只以最终生成的 HTML 结构发送给客户端。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：在页面中获取数据",
        context: "接下来我们实现 /blog 页面。由于页面默认是 Server Component，它可以直接进行后端数据获取，并且不需要打包给浏览器。",
        files: [
          { name: "app/blog/page.tsx", code: `// 这是一个 Server Component\nexport default async function BlogIndex() {\n  // 模拟在服务端获取数据库日志\n  console.log('在服务端请求博客列表数据...');\n  const posts = [{ id: 1, title: "学习 Next.js" }];\n  \n  return (\n    <div>\n      <h1>我的博客</h1>\n      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>\n    </div>\n  );\n}` }
        ],
        entryFile: "app/blog/page.tsx",
        question: {
          id: "project-nextjs-homepage-step2",
          type: "transfer",
          prompt: "当用户在浏览器中访问 `/blog` 时，这个页面的代码会被发送给浏览器吗？",
          options: [
            { id: "a", label: "是的，作为完整的 React 组件代码发送", detail: "传统 SPA 思维", feedback: "Next.js App Router 不是传统 SPA，Server Component 代码不会发给客户端。" },
            { id: "b", label: "不，只有渲染后的 HTML 和静态内容会被发送", detail: "零 JS 载荷", feedback: "正确：Server Component 绝不会将自己的代码打包给客户端，有效减少了 JS 体积。" }
          ],
          answerId: "b",
          correctExplanation: "综合项目演示了 Next.js 的架构范式：大部分外围骨架（Layout）和数据获取（BlogIndex）保持在服务端进行，保持零 JS 体积。"
        }
      }
    ],
    sources: [{ title: "Next.js Fundamentals", url: "https://nextjs.org/docs" }],
    summary: ["Next.js 融合了不同职责的组件模型", "服务端组件构建数据繁重的骨架", "客户端组件点缀局部交互体验"]
  })
];
