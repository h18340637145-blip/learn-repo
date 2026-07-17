import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageThreeDataFetchingLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-data-server-fetch",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.1 · 数据获取",
    title: "Server Component fetch",
    objectives: ["掌握在 Server Component 中使用原生 fetch 抓取数据", "理解服务端获取数据的好处"],
    prerequisites: ["nextjs-rendering-ssr"],
    concept: "在 App Router 中，Next.js 扩展了原生的 `fetch` API，允许每个请求配置自己的缓存和验证规则。由于 Server Components 运行在后端，你可以直接使用 `async/await` 安全地连接数据库或获取私密接口数据，而不用暴露 API 密钥。",
    points: ["Server Components 支持顶层 async/await", "直接在组件体内调用 fetch API", "无需像以前一样使用 getServerSideProps"],
    memoryHook: "组件直接 await，数据到手",
    files: [{ name: "app/page.tsx", code: `export default async function Page() {
  // 1. 获取数据的操作在服务器端进行
  const res = await fetch('https://api.example.com/data');
  // 2. Next.js 会处理错误和边界
  if (!res.ok) throw new Error('拉取失败');
  
  const data = await res.json();
  
  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </main>
  );
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在客户端（浏览器）的网络面板（Network Tab）中，你能看到对 `https://api.example.com/data` 发出的请求吗？",
      options: [
        { id: "a", label: "能，因为这是一个 AJAX 请求", detail: "普通的 fetch 行为", feedback: "这是传统 React SPA (Client Component) 的行为。" },
        { id: "b", label: "不能，因为请求是在 Node.js 服务端发出的，浏览器收到的只是拼装好的 HTML", detail: "服务端网络行为", feedback: "正确：浏览器的网络面板只能看到浏览器发往 Next.js 服务器的文档请求，看不到 Next.js 背后的 API 调用。" },
        { id: "c", label: "能看到请求但看不到具体数据", detail: "半隐藏状态", feedback: "不仅看不到数据，连请求本身都不会出现在客户端。" }
      ],
      answerId: "b",
      correctExplanation: "将数据获取逻辑转移到服务器端有巨大优势：不仅可以安全地存储 API Token 等机密信息（不泄露给客户端打包），还能降低客户端的 JS 负担。页面渲染好了直接呈现，消除客户端瀑布流加载请求的问题。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "数据获取链路", nodes: ["浏览器", "Next.js Node", "API Server", "组装数据", "返回 HTML"] },
      lanes: ["Client Request", "Server Fetch", "Response"],
      frames: [
        { activeLane: 0, laneValues: ["访问页面", "等待", "等待"], log: ["浏览器请求 / 页面"], note: "用户访问触发处理流程", delayMs: 400 },
        { activeLane: 1, laneValues: ["等待", "执行底层 API 请求", "等待"], log: ["Node.js 发起 fetch 到 api.example.com"], note: "这段网络交互发生在此数据中心后台", delayMs: 800 },
        { activeLane: 2, laneValues: ["展示界面", "完成", "完成组装"], log: ["返回给浏览器的只有纯文本 HTML"], note: "没有暴露任何上游数据接口给前台", delayMs: 800 }
      ]
    },
    sources: [{ title: "Fetching Data on the Server with fetch", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#fetching-data-on-the-server-with-fetch" }],
    summary: ["彻底拥抱 async Server Components", "提高了安全性并减少了客户端打包体积", "后端的网络环境往往比用户的手机 5G 更加稳定和快速"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-cache",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.2 · 数据获取",
    title: "请求缓存与去重 (Memoization)",
    objectives: ["了解 Next.js 如何自动处理同一个页面组件树中的重复 fetch 请求"],
    prerequisites: ["nextjs-data-server-fetch"],
    concept: "在一个复杂的 React 组件树中，如果你在头部 `Navbar` 组件和侧边栏 `Sidebar` 组件里都调用了获取用户信息的 `fetch('api/user')`，在普通的 Node.js 应用里会发出两次真实的 HTTP 请求。但在 Next.js 中，它自动对一次渲染生命周期内 URL 和参数相同的 `fetch` 进行了缓存去重（Memoization）。",
    points: ["同一次请求上下文中，相同 fetch 自动只执行一次", "消除了将数据在多层组件之间手动通过 Props 透传的麻烦", "这个机制是基于 React 的 cache 功能"],
    memoryHook: "重复调用不要怕，底层去重是一把",
    files: [{ name: "app/layout.tsx", code: `import { getUser } from './api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default async function Layout({ children }: any) {
  // 在顶层 Layout 里抓取了一次用户数据
  const user = await getUser();
  return (
    <div>
      <Navbar /> {/* 没有把 user 用 props 传下去 */}
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}` }, { name: "app/Navbar.tsx", code: `import { getUser } from './api';

export default async function Navbar() {
  // 底部直接调用！不需要从 Layout 传 Props
  const user = await getUser(); 
  return <nav>欢迎你，{user.name}</nav>
}` }, { name: "app/api.ts", code: `export async function getUser() {
  // 假设这会真实发起网络请求
  const res = await fetch('https://api.example.com/user/me');
  return res.json();
}` }],
    entryFile: "app/layout.tsx",
    answer: {
      type: "prediction",
      prompt: "在渲染这个页面的单次访问过程中，`https://api.example.com/user/me` 实际上会被网络请求打中几次？",
      options: [
        { id: "a", label: "2 次，因为有 2 个组件调用了", detail: "普通 Node 环境表现", feedback: "Next.js 会自动优化掉重复请求。" },
        { id: "b", label: "1 次，后续的调用会直接复用第一次的返回结果", detail: "请求去重（Memoization）", feedback: "正确：在同一次页面渲染的生命周期中，参数相同的 fetch 会被缓存。" },
        { id: "c", label: "0 次，如果被缓存的话", detail: "因为缓存", feedback: "这取决于是否之前有外部路由缓存，但在这单次生命周期内至少要抓取 1 次。" }
      ],
      answerId: "b",
      correctExplanation: "过去在 React 开发中，最让人头疼的就是“钻取属性（Prop Drilling）”——为了少发请求，你不得不在顶层把数据抓到手，然后一层一层传给子孙组件。通过 Fetch Memoization 机制，Next.js 赋予了你在任何组件内部随处调用获取数据 API 的自由，而不用担心性能浪费。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "请求去重", nodes: ["Layout", "API 请求", "缓存存入", "Navbar", "命中缓存"] },
      lanes: ["顶层解析", "底层请求拦截", "同级解析"],
      frames: [
        { activeLane: 0, laneValues: ["渲染 Layout 时调用 getUser", "等待", "等待"], log: ["未命中请求级缓存", "发出真实的外部网络请求"], note: "首次网络开销", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "保存 Request Promise", "等待"], log: ["拿到结果，缓存到本次 Render 上下文中"], note: "在服务端构建起短暂的内存映射", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "Navbar 调用 getUser"], log: ["发现是同样的 Fetch URL 和参数", "拦截掉网络发送，瞬间返回缓存对象"], note: "省下网络时间，实现 Props-Free 架构", delayMs: 800 }
      ]
    },
    sources: [{ title: "Request Memoization", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#request-memoization" }],
    summary: ["一次 Render 期间自动对相同 Fetch URL 去重", "让多层级的组件架构彻底告别 Prop Drilling", "极大地简化了应用状态设计"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-revalidate",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.3 · 数据获取",
    title: "重新验证 revalidatePath 与 revalidateTag",
    objectives: ["了解如何利用 API 主动让特定的 Next.js 数据缓存过期"],
    prerequisites: ["nextjs-rendering-isr"],
    concept: "我们之前学过基于时间（如 `revalidate: 60`）自动更新页面的方式。但在实际应用中（如发表了一篇新博客），你希望页面立即更新，而不是干等 60 秒。Next.js 提供了两种按需清除缓存（On-demand Revalidation）的方法：清除特定 URL 路径的 `revalidatePath`，或清除带有指定标签 fetch 请求的 `revalidateTag`。",
    points: ["revalidatePath('/blog') 清除该路由上的缓存", "给 fetch 增加 { next: { tags: ['posts'] } } 并用 revalidateTag 清除", "常用于 CMS Webhook 或者表单提交成功后的动作"],
    memoryHook: "有变动，主动拍掉旧缓存",
    files: [{ name: "app/api/webhook/route.ts", code: `import { revalidateTag } from 'next/cache';

// 这个 API 端点供后台管理系统调用（Webhook）
export async function POST(request: Request) {
  const data = await request.json();
  
  if (data.event === 'post.created') {
    // 强制把所有带有 'collection' 标签的缓存都作废
    revalidateTag('collection');
    return Response.json({ message: '缓存已刷新' });
  }
  
  return Response.json({ error: '无效请求' }, { status: 400 });
}` }, { name: "app/page.tsx", code: `export default async function Page() {
  // 给这个请求打上标签 'collection'
  const res = await fetch('https://api.cms.com/posts', { 
    next: { tags: ['collection'] } 
  });
  const data = await res.json();
  return <div>{data.title}</div>;
}` }],
    entryFile: "app/api/webhook/route.ts",
    answer: {
      type: "prediction",
      prompt: "在 CMS 系统发布了一篇文章并触发了该 Webhook（发送了 POST 请求）之后，下一个访问 `/` 页面的用户会发生什么？",
      options: [
        { id: "a", label: "收到旧缓存，并在后台异步启动更新（Stale-While-Revalidate）", detail: "这属于按时间策略", feedback: "这是 Time-based revalidation 的行为，但这里是 On-demand 的硬清除。" },
        { id: "b", label: "旧缓存已被立即作废，该请求会触发最新的 Fetch 抓取并生成新的页面给用户", detail: "按需让缓存失效", feedback: "正确：`revalidateTag` 会让底层的数据层缓存立刻过期。" },
        { id: "c", label: "服务器崩溃，因为缓存找不到数据", detail: "没有降级预案", feedback: "找不到缓存会退化成正常的首次请求去拿最新数据。" }
      ],
      answerId: "b",
      correctExplanation: "按需（On-demand）验证机制让你能精准外科手术式地控制数据的时效性。你在数据消费的地方（page.tsx）打个 Tag；然后在数据变更的发生地（Route Handler 中），使用该 Tag 呼叫框架去“爆破”对应的静态文件。这确保了用户能立马看到刚才自己点赞或者新发布的动态。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "缓存重建流", nodes: ["CMS Webhook", "调用 revalidateTag", "清洗 Cache", "新用户访问", "获取新鲜数据"] },
      lanes: ["触发失效", "底层清除", "重新构建"],
      frames: [
        { activeLane: 0, laneValues: ["接收 POST 请求", "等待", "等待"], log: ["来自 CMS 系统，告知有一篇新文章"], note: "外界事件通知系统有变化发生", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行 revalidateTag('collection')", "等待"], log: ["寻找关联了此 tag 的缓存实体", "将它们在底层存储中标记为失效"], note: "立刻干预数据存储的状态", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "新流量涌入"], log: ["用户访问首页，发现无可用 Cache", "触发全新真实请求，渲染生成包含新文章的网页流"], note: "新旧交替在瞬时内完美达成", delayMs: 800 }
      ]
    },
    sources: [{ title: "On-demand Revalidation", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation" }],
    summary: ["精准按需失效策略", "配合 tag 使用实现夸页面的多处数据统一刷新", "最适合用在增删改查表单响应和后台 Webhook 中"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-server-actions",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.4 · 数据获取",
    title: "Server Actions 基础",
    objectives: ["学习使用 Server Actions 处理表单提交和数据变更"],
    prerequisites: ["nextjs-foundations-server-components"],
    concept: "过去在 React 中提交表单，你需要写 onClick、prevent default、提取状态、发起 fetch 到 API 路由。Next.js 引入了 Server Actions 功能。通过在服务端函数里添加 `'use server'` 指令，你可以直接将这个函数绑定给表单的 `action` 属性！不需要写中间 API 端点，浏览器在提交时会自动向服务端发出请求执行该函数。",
    points: ["在异步函数顶部使用 'use server' 定义", "可以被传递给客户端组件进行调用", "免去了创建专门 API 路由进行数据处理的麻烦"],
    memoryHook: "use server 一声明，表单直连数据库",
    files: [{ name: "app/form/page.tsx", code: `import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export default function CommentForm() {
  // 定义一个内联 Server Action
  async function createComment(formData: FormData) {
    'use server'
    // 这里的代码直接跑在 Node.js 服务端，绝对安全
    const text = formData.get('comment');
    await db.comment.create({ text });
    
    // 操作完之后，清除当前页面的缓存以便看到新评论
    revalidatePath('/form');
  }

  return (
    <form action={createComment}>
      <input type="text" name="comment" required />
      <button type="submit">提交评论</button>
    </form>
  )
}` }],
    entryFile: "app/form/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果客户端禁用 JavaScript 并且点击提交，这段表单还能工作吗？",
      options: [
        { id: "a", label: "不能，完全无法交互", detail: "因为它是 React 写的应用", feedback: "这是 Server Actions 最强大的特性之一：向后兼容。" },
        { id: "b", label: "能工作，因为使用的是原生 HTML form action 提交", detail: "增强渐进式支持", feedback: "正确：Server Actions 甚至支持在水合之前或者无 JS 环境下提交！" },
        { id: "c", label: "报错 500", detail: "因为框架不识别原生请求", feedback: "框架底层自动处理原生表单与 AJAX 请求的路由转换。" }
      ],
      answerId: "b",
      correctExplanation: "由于使用了原生 `<form action={...}>`，Next.js 的打包工具会自动把它转换成对当前 URL 的一个特殊的 POST 请求（并在请求体附加内部标识符以匹配到你的那个 Action 函数）。这是一种极其优雅、回归 Web 本质的 API 定义模式。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "Server Action 运行逻辑", nodes: ["表单提交", "RPC 网络呼叫", "运行 Server 逻辑", "数据持久化", "清除缓存"] },
      lanes: ["触发请求", "执行后台", "刷新页面"],
      frames: [
        { activeLane: 0, laneValues: ["点击提交", "等待", "等待"], log: ["自动收集 input 的值封装进 FormData", "发送隐藏的 POST 请求至服务器"], note: "无需手动写一堆提取 e.target.value 的代码", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行 createComment", "等待"], log: ["安全连接 DB", "完成评论新增记录"], note: "这里不会有任何安全泄露的风险", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "触发再验"], log: ["调用 revalidatePath", "服务器重新流式下发附带最新数据的页面碎片"], note: "用户侧平滑更新，无整页刷新感", delayMs: 800 }
      ]
    },
    sources: [{ title: "Server Actions and Mutations", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations" }],
    summary: ["颠覆性地简化了全栈开发心智负担", "消除了海量中间层样板代码 (API routes)", "天生具备强大的渐进增强能力"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-form-status",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.5 · 数据获取",
    title: "useFormStatus 与表单状态",
    objectives: ["学习如何在提交 Server Action 时展示 UI 的加载状态"],
    prerequisites: ["nextjs-data-server-actions"],
    concept: "在使用 Server Action 提交数据时，由于函数在服务器上运行，客户端需要知道提交何时开始、何时结束，以便禁用按钮或显示加载旋转图标。React 提供了 `useFormStatus` Hook（只能在 Client Component 中使用）。它可以获取**离它最近的外层 `<form>`** 的提交状态。",
    points: ["useFormStatus() 必须在一个由 <form> 包裹的组件内部使用", "返回 pending 属性标识是否正在提交", "这必须用于 Client Component"],
    memoryHook: "剥离按钮，用 Hook 取提交状态",
    files: [{ name: "app/SubmitButton.tsx", code: `'use client'
import { useFormStatus } from 'react-dom'
 
export function SubmitButton() {
  // 从外层隐式 Context 中读到提交状态
  const { pending } = useFormStatus();
 
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '确认发布'}
    </button>
  )
}` }, { name: "app/page.tsx", code: `import { SubmitButton } from './SubmitButton'
import { submitAction } from './actions'

export default function Page() {
  return (
    <form action={submitAction}>
      <input type="text" name="title" />
      {/* 必须作为子组件拆分出来，以便能使用 Hook */}
      <SubmitButton />
    </form>
  )
}` }],
    entryFile: "app/SubmitButton.tsx",
    answer: {
      type: "prediction",
      prompt: "为什么不直接在包含 `<form>` 的外层 `Page` 组件里调用 `useFormStatus`？",
      options: [
        { id: "a", label: "因为 Page 是服务端组件，不支持所有的 Hook", detail: "不能使用状态 Hook", feedback: "即便你给 Page 标了 'use client'，也不能在那里用这个 Hook。" },
        { id: "b", label: "因为它只能读取**包裹着自己**的 form 状态，不能读自己渲染出的 form", detail: "上下文层级问题", feedback: "正确：React 的工作原理使得 Hook 只能查找到其父级上下文的内容。它不知道同一组件返回的下层结构状态。" },
        { id: "c", label: "因为为了性能分离代码", detail: "拆分优化", feedback: "不是性能原因，是底层 React 架构约束。" }
      ],
      answerId: "b",
      correctExplanation: "这常常是新手困惑点。`useFormStatus` 其实类似 `useContext` 的查找机制，它往上寻找最近的 `<form>` 的状态。因此，它只能放入一个“放在 form 里面”的独立的组件（如本例抽取的 `SubmitButton`）里使用，而不能放在渲染 `<form>` 标签的同级块级代码里。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "表单状态拦截", nodes: ["用户点击", "form pending = true", "SubmitButton 响应", "后端 Action 执行", "pending = false 回退"] },
      lanes: ["按钮点击", "状态更新", "后端响应"],
      frames: [
        { activeLane: 0, laneValues: ["点击确认发布", "等待", "等待"], log: ["触发 form 原生提交事件处理"], note: "拦截机制介入开启网络传输", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "挂起 pending=true", "等待"], log: ["按钮文字变为“提交中...”，并切换到 disabled 状态"], note: "完全防重点击控制完成", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "Action 结束"], log: ["服务器处理结束，网络关闭", "挂起解除，重新变成“确认发布”"], note: "UI 恢复可交互的原始状态", delayMs: 800 }
      ]
    },
    sources: [{ title: "useFormStatus", url: "https://react.dev/reference/react-dom/hooks/useFormStatus" }],
    summary: ["通过 hook 精准管理按钮级别的防重点及反馈", "必须包裹在一个作为 Client Component 的下属组件之中使用", "让表单的用户体验如丝般顺滑"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-action-state",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.6 · 数据获取",
    title: "使用 useActionState 传递复杂结果",
    objectives: ["利用 useActionState 在表单和服务器端 Action 间传递双向信息（如验证报错）"],
    prerequisites: ["nextjs-data-server-actions"],
    concept: "（早期名为 `useFormState`）如果你在使用 Server Action 时想向页面传回执行结果，如表单校验失败的具体文字：“密码长度不足 8 位”，就可以依靠这个 Hook。它不仅包裹了 `Action` 函数，还提供了一个带有响应状态的变量和一个能绑定到 `form` 的处理函数。",
    points: ["接受一个状态和一个 Action 并将其连接起来", "返回一个数组 `[state, formAction]`", "Server Action 此时可以返回任何 JS 对象，它将成为新的 state"],
    memoryHook: "Action 带状态，报错不抓瞎",
    files: [{ name: "app/actions.ts", code: `'use server'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email');
  if (email !== 'admin@admin.com') {
    // 校验失败，返回一个新的状态对象给客户端
    return { error: '邮箱不正确，禁止访问' };
  }
  return { success: '登录通过' };
}` }, { name: "app/page.tsx", code: `'use client'
import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const initialState = { error: '', success: '' };
  const [state, formAction] = useActionState(loginAction, initialState);
  
  return (
    <form action={formAction}>
      <input type="text" name="email" />
      <button type="submit">登 录</button>
      {/* 实时展示来着服务端的判断回执 */}
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">{state.success}</p>}
    </form>
  )
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在使用了 `useActionState` 之后，`loginAction` 的参数发生了什么变化？",
      options: [
        { id: "a", label: "没变化，仍然只接收一个 formData", detail: "原样传递", feedback: "如果你仔细看 actions.ts，会发现它的签名变了。" },
        { id: "b", label: "第一个参数变成了 `prevState`，接收上一次表单的状态；第二个才是 formData", detail: "状态传递", feedback: "正确：这是该 Hook 的约束，这让 Action 能够了解以前页面处在什么状态，从而决定怎么变。" },
        { id: "c", label: "参数变成了事件 event 对象", detail: "回到了传统的处理函数", feedback: "它仍然是 Server Action 数据格式，不用 e.preventDefault 那些操作。" }
      ],
      answerId: "b",
      correctExplanation: "当你决定把表单反馈环路交给 `useActionState` 来托管时，它会在后台为你维护一个通信轨道。每当表单提交触发，它把 `(当前组件的上一轮状态, 用户输入的新表单数据)` 组装在一起发送给远端服务器。服务端执行完返回的那个 JS 对象，就会直接变成客户端界面上的 `state` 进行再次渲染。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "双向状态握手", nodes: ["组件发起", "封装前状态", "执行后校验", "返回新对象", "组件重新挂载"] },
      lanes: ["前台打包", "后台验证", "状态反射"],
      frames: [
        { activeLane: 0, laneValues: ["点击登录", "等待", "等待"], log: ["传送 Payload: prevState='', email='xxx'"], note: "初始状态与当前表单输入被一并送走", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行逻辑", "等待"], log: ["发现邮箱错误", "return { error: '邮箱不正确...' }"], note: "服务端利用其安全环境执行权限核查", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "状态刷新"], log: ["通过 Hook 更新 React 组件 State", "红色报错文字被渲染呈现"], note: "无刷新的一体化数据变更体验完美闭环", delayMs: 800 }
      ]
    },
    sources: [{ title: "useActionState", url: "https://react.dev/reference/react/useActionState" }],
    summary: ["让无脑提交的 Action 获得了感知状态和通讯回执的能力", "它是服务端逻辑安全校验表单并在失败时警告用户的桥梁", "参数签名必须包含 prev state"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-parallel-loading",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.7 · 数据获取",
    title: "并行数据加载策略",
    objectives: ["学会消除顺序依赖，利用 Promise.all 榨干服务端获取数据的速度极限"],
    prerequisites: ["nextjs-data-server-fetch"],
    concept: "在普通的服务端代码中写多个 `await`，会导致后面的请求必须等待前面的完成。这叫做串行阻塞（Waterfall）。在 Next.js Server Components 里，只要两个请求互不相干，就必须让他们并行发车以将延迟降低到最长请求的那一次上。",
    points: ["不连续的 await 会导致瀑布流", "使用 Promise.all 等待多个异步请求", "在不需要立刻 await 时可以利用变量先启动异步流程"],
    memoryHook: "无依赖者不开列队，Promise.all 并肩行",
    files: [{ name: "app/dashboard/page.tsx", code: `export default async function Dashboard() {
  // 不好的做法 (Waterfall): 
  // const user = await fetch('/api/user');
  // const posts = await fetch('/api/posts');
  // 上面这一共需要耗费 user_time + posts_time
  
  // 最佳实践 (Parallel):
  const userPromise = fetch('https://api.example.com/user').then(r => r.json());
  const postsPromise = fetch('https://api.example.com/posts').then(r => r.json());

  // 这行等待两者并发完成，只需要耗费 Max(user_time, posts_time)
  const [user, posts] = await Promise.all([userPromise, postsPromise]);

  return <div>你好 {user.name}，你共有 {posts.length} 篇文章。</div>;
}` }],
    entryFile: "app/dashboard/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果拉取 User 需要 3秒，拉取 Posts 需要 2秒，按照最佳实践方案页面的服务端响应时间瓶颈约为？",
      options: [
        { id: "a", label: "5 秒，这是总和", detail: "线性相加", feedback: "这是串行瀑布流带来的恶果。" },
        { id: "b", label: "3 秒", detail: "木桶原理的最长板", feedback: "正确：它们是并发启动的，只需等那个最慢的任务结束，总流程即可结束。" },
        { id: "c", label: "2 秒", detail: "最短板决胜", feedback: "你还需要依赖 user 数据渲染 <div>，因此没法在 2 秒时就输出 HTML。" }
      ],
      answerId: "b",
      correctExplanation: "因为 Server Component 特别的异步编写习惯，开发者最容易不自觉地连续写好几个 `await` 造成极其严重的性能倒退（Waterfall）。时刻记住：如果 B 请求不需要 A 请求的返回结果（比如传参数）作为前提条件，你必须想办法在不 await 的情况下利用 JS 将其并发启动。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "网络并发策略", nodes: ["调用触发", "启动 Request1", "启动 Request2", "Promise.all 等待", "汇合渲染"] },
      lanes: ["触发同步启动", "各自网络长轮询", "最终集结"],
      frames: [
        { activeLane: 0, laneValues: ["建立两个 fetch promise 变量", "等待", "等待"], log: ["不再立即 await", "双双飞向不同的 API 提供端"], note: "指令发车无阻塞", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "Posts 提早返回", "等待"], log: ["第 2 秒: Posts 数据到达", "由于未达 Promise.all 释放条件，继续等"], note: "最快的小队已就位，进入休眠", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "全员到齐放行"], log: ["第 3 秒: User 数据到达", "数组解构，并立刻组装为 React 节点返回"], note: "总耗时仅取决于那块最难啃的骨头", delayMs: 800 }
      ]
    },
    sources: [{ title: "Parallel Data Fetching", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching" }],
    summary: ["不要为互相独立的数据查询留下串行隐患", "通过预先开启 Promise 或直接使用 Promise.all 重塑流", "大幅缩减数据密集的监控和详情界面的后端生成耗时"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-data-error-handling",
    stageId: "nextjs-data-fetching",
    kind: "knowledge",
    eyebrow: "03.8 · 数据获取",
    title: "数据获取错误处理策略",
    objectives: ["识别服务端错误产生的影响，并应用全局与局部的降级策略"],
    prerequisites: ["nextjs-routing-error", "nextjs-data-server-fetch"],
    concept: "我们都知道可以在代码里写 `try/catch`。但在 Next.js 大规模全栈架构中，如果因为外部 API 不可用或超时而没有处理异常，整个页面渲染将被阻断并抛给路由错误边界。理想的做法是混合局部捕获和利用 Error.tsx 提供备选信息，甚至尝试恢复重连。",
    points: ["不要无防备地抛出顶层未捕获错误", "对非关键区块，局部 try/catch 并展示 null，不影响核心界面", "遇到致死级错误再交给 error.tsx 全面接管"],
    memoryHook: "有备无患防空投",
    files: [{ name: "app/page.tsx", code: `import { Suspense } from 'react';

// 获取主业务数据（必须有）
async function getCoreData() {
  const res = await fetch('https://api.core.com');
  if (!res.ok) throw new Error("无法加载核心服务"); // 阻断流程，交给 error.tsx
  return res.json();
}

// 获取周边数据（比如广告，不应该影响大局）
async function getAdBanner() {
  try {
    const res = await fetch('https://api.ads.com');
    return res.json();
  } catch (error) {
    return null; // 静默消化错误
  }
}

export default async function Page() {
  const core = await getCoreData();
  const ad = await getAdBanner(); // 即便这里错了也不妨碍核心运转
  
  return (
    <main>
      <h1>{core.title}</h1>
      {ad ? <div className="ad">{ad.content}</div> : <p>暂无广告位展示</p>}
    </main>
  );
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果此时广告服务 `api.ads.com` 挂了并响应了超时 504 错误，用户看到的界面状态是什么？",
      options: [
        { id: "a", label: "进入 error.tsx 并要求用户重试", detail: "全部垮塌", feedback: "这是没有使用内部局部捕获的糟糕做法。" },
        { id: "b", label: "核心内容正常显示，底部的广告位位置显示了 '暂无广告位展示'", detail: "完美降级", feedback: "正确：因为你做了保护性捕获，把 Error 转化为了一种友好的无内容状态呈现。" },
        { id: "c", label: "返回一个部分崩溃的红色屏幕", detail: "开发模式常见状态", feedback: "这正是我们在生产环境极力规避的。" }
      ],
      answerId: "b",
      correctExplanation: "分布式开发讲求弹性：一个模块出了问题绝不能拖死整艘飞船。在这段代码里，开发者巧妙地界定了优先级：业务数据是致死问题，应该直接中断让外层去处理；而广告只是添头，利用普通的 `try...catch` 让它自身“静默熄火并安全着陆”是成熟的工程表现。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "安全断路器模式", nodes: ["同步核心请求", "异步周边请求", "捕获降级处理", "容错渲染流出", "体验保障"] },
      lanes: ["正常主干", "支线崩溃", "合并降级"],
      frames: [
        { activeLane: 0, laneValues: ["核心 API 并发访问正常", "等待", "等待"], log: ["Core Data 100% Ok", "Ads API 返回网络超时"], note: "外围组件出现了危机", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "捕获并抑制恐慌", "等待"], log: ["内部 try..catch 截留 Error", "返回 null 交差"], note: "危机解除，不再向上向外冒泡给系统", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "渲染弹性内容"], log: ["页面接受了残缺的属性依然顽强完成了 React 渲染", "最终向外平稳输出了可观看的界面"], note: "最佳的用户体感，他们甚至不知道系统出现了微小宕机", delayMs: 800 }
      ]
    },
    sources: [{ title: "Error Handling", url: "https://nextjs.org/docs/app/building-your-application/routing/error-handling" }],
    summary: ["并非所有的服务超时都应该毁灭视图", "学会分级处理 Server 级异常，给无关紧要者留有退路", "结合 React 原生边界实现立体防御体系"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-task-crud",
    stageId: "nextjs-data-fetching",
    kind: "stage-project",
    eyebrow: "阶段项目 03 · 数据获取",
    title: "企业级任务管理器 CRUD",
    difficulty: "进阶",
    objectives: ["无缝集成数据的读（Fetch）与写（Actions）", "组合应用缓存验证技术保障数据的高精度与一致性"],
    prerequisites: ["nextjs-data-server-fetch", "nextjs-data-cache", "nextjs-data-revalidate", "nextjs-data-server-actions", "nextjs-data-form-status", "nextjs-data-action-state"],
    concept: "这个阶段项目带你穿插所有知识搭建一个典型的后台列表增删改查。使用 `fetch` 结合标签进行查询；通过抽离出来的 `SubmitButton` 读取提交状态；将添加与删除函数通过 `'use server'` 定义为动作，并在其末尾借助 `revalidateTag` 和 `revalidatePath` 执行大清盘。最终实现一个流畅无比，甚至关闭 JS 都可以正常提交表单的全栈产品！",
    points: ["以流、缓存和操作三大基石取代过往一切繁琐的 Axios/Redux 配置", "深入利用 Next 强化的原生 web 属性设计组件", "无 JS 落盘降级保证极高可用性"],
    memoryHook: "查缓存清，动作状态走",
    files: [{ name: "app/actions.ts", code: `'use server';
import { revalidatePath } from 'next/cache';
import db from './db'; // 假设提供数据库交互

export async function addTask(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  
  if (title.length < 3) return { error: '标题过短，任务作废！' };
  
  // 保存数据库
  await db.tasks.create({ title });
  
  // 操作成功，爆破清理主界面的静态缓存以重新读库
  revalidatePath('/tasks');
  
  return { success: '已进入军火库列表' };
}` }, { name: "app/tasks/page.tsx", code: `import db from '../db';
import TaskForm from './TaskForm';

export default async function TaskList() {
  // 服务端拉取展示
  const tasks = await db.tasks.getAll();
  
  return (
    <div className="container">
      <h1>项目军火库面板</h1>
      <ul>
        {tasks.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
      <hr />
      <TaskForm />
    </div>
  )
}` }, { name: "app/tasks/TaskForm.tsx", code: `'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addTask } from '../actions';

function AddButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? '投递中...' : '新任务部署'}</button>
}

export default function TaskForm() {
  const [state, formAction] = useActionState(addTask, {});
  
  return (
    <form action={formAction}>
      <input type="text" name="title" />
      <AddButton />
      {state?.error && <p className="alert">{state.error}</p>}
    </form>
  )
}` }],
    entryFile: "app/tasks/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个结构中，从提交“过短标题”到看到报警弹出的这段时间内，有发生整个网页浏览器的白屏大刷新动作吗？有通过复杂的自定义中间件路由发接口吗？",
      options: [
        { id: "a", label: "发生了整体的 POST 跳转刷新，体验类似于传统 PHP", detail: "退化理解", feedback: "虽然使用了 form 标签，但 Next.js 在客户端使用 JS 接管了它进行原生路由拦截平滑处理。" },
        { id: "b", label: "在拥有 JS 的环境下，没有任何全屏闪烁和自定义 fetch/axios 接口编写，仅仅是前后端变量状态神奇地隔空打通并且完成了校验展示", detail: "Next App 终极理念", feedback: "正确：这种 RPC 式透明传输和原生 HTML 的融合，是目前全栈领域最先进的心智模型。" },
        { id: "c", label: "用专门的 /api/add 接口完成了跳转响应", detail: "脱离机制", feedback: "不再有单独设立的 API 终点暴露在外部了。" }
      ],
      answerId: "b",
      correctExplanation: "你在这个项目中看到的是未来 web 的常态：没有冗长的 Redux、不要 axios、没有额外的 API 文件夹和接口路径拼接。`addTask` 作为跑在后端的方法，直接以 props / binding 的形式甩到了客户端。Next.js 的构建器和 React 生态帮你把一切网络传输细节全部吃掉，实现真正的“全栈一体式开发”。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "全栈全链路互动图", nodes: ["展现", "无感注入", "Server 运行", "DB 核准", "缓存擦除"] },
      lanes: ["展示列表并监听", "拦截请求发送状态", "接受回应改变 UI"],
      frames: [
        { activeLane: 0, laneValues: ["渲染包含已有军火的页面", "等待", "等待"], log: ["首次请求在服务端执行并渲染好呈现，带有 TaskForm 并建立隐式连接池"], note: "初态已呈现给用户观看和操作", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "非法数据投递被截断", "等待"], log: ["按钮被状态拦截进入 Loading", "服务端收信并迅速打回：error=标题过短"], note: "极速的通信和鉴定流程闭环", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "无缝恢复状态"], log: ["Hook 将收到信息，重置 Loading 按钮", "并在屏幕上打上红色弹窗警示"], note: "客户端 UI 并未崩坏或跳离，一切平滑自然", delayMs: 800 }
      ]
    },
    sources: [{ title: "Forms and Mutations", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations" }],
    summary: ["Server Actions 加 React 最新并发 Hook 的组合拳堪称恐怖", "一切状态流动和前后端交互完全依赖平台基础设施，零手工样板代码", "让专注点真正回归到业务规则和逻辑模型构建之上"]
  })
];
