import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsQuickLesson } from "./nextjs-quick-lesson";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageSixAuthMiddlewareLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-auth-concepts",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.1 · 认证与会话",
    title: "认证基础概念",
    objectives: ["理解现代 Web 认证的两种核心机制：Session 与 JWT"],
    prerequisites: ["nextjs-api-route-handler"],
    concept: "在实现登录前，必须理解认证（Authentication，证明你是谁）和授权（Authorization，证明你能做什么）。Next.js 主要是无状态的。这意味着我们保存用户登录状态通常有两条路：1. 基于数据库的 Session（安全但需查库）；2. 基于加密签名的 JWT（JSON Web Token，自包含信息，不用查库但难以强制注销）。这两种方式最终都依赖 HTTP Cookie 将凭证存在浏览器中。",
    points: ["Session ID 是一把钥匙，需要去后端的锁库（数据库）里开保险箱核对信息", "JWT 就是一张盖了防伪钢印的通行证，后端拿到直接看钢印，不需要查库", "Next.js 因为边缘计算的兴起，越来越倾向于使用 JWT 策略"],
    memoryHook: "查库选 Session，自证用 JWT",
    files: [{ name: "concept.ts", code: `// Session 模式（需要数据库介入）
const sessionId = cookies().get('session_id');
// 必须网络调用或者查库才能知道是谁
const user = await db.sessions.find(sessionId);

// ----------------------------------------

// JWT 模式（无状态，纯计算）
const token = cookies().get('jwt_token');
// 纯 CPU 解密计算，极快，可以在边缘节点直接跑
const user = verifyAndDecode(token, '我的绝密加密盐');` }],
    entryFile: "concept.ts",
    answer: {
      type: "prediction",
      prompt: "为什么在 Next.js 的 Edge Middleware (边缘中间件) 中，通常只推荐使用 JWT 而不是 Session 来进行登录检查？",
      options: [
        { id: "a", label: "因为边缘节点不能读写 Cookie", detail: "能力限制", feedback: "边缘节点完全可以操作 Cookie。" },
        { id: "b", label: "因为 JWT 加密更强，不会被黑客攻破", detail: "安全性误解", feedback: "两者都有各自的安全风险防范措施，核心不是加密强度的差异。" },
        { id: "c", label: "因为在极轻量的边缘节点往往无法直连传统的数据库（如 MySQL），JWT 仅靠 CPU 解密即可验证，完美契合无状态边缘环境", detail: "架构匹配度", feedback: "正确：这种去中心化的验票机制是现代全球分布式应用首选的认证基石。" }
      ],
      answerId: "c",
      correctExplanation: "认证方案的选择往往决定了整个系统的拓扑结构。如果你用了 Session，每次请求都要回母星机房查库，这就彻底葬送了边缘节点“就近极速处理”的优势。而 JWT 把所有不敏感但必要的信息（如：用户ID、角色级别）用不可伪造的签名盖章后塞给了客户端保存。当请求到达全球任意一个 CDN 节点时，该节点凭自身的解密算法瞬间就能验明正身。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "两种验票模型对比", nodes: ["请求附带凭证", "中央校验系统", "查库/解密验证", "返回身份对象", "通行放行"] },
      lanes: ["请求投递", "服务器解构", "确权完成"],
      frames: [
        { activeLane: 0, laneValues: ["访问私密路由", "等待", "等待"], log: ["浏览器发送附带着名为 session_cookie 或者 jwt_cookie 的请求包"], note: "携带身份入场", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "两种流派分道扬镳", "等待"], log: ["Session 流派：挂起，建立网络连接跨州去寻找数据库核实"], note: "速度慢、有阻塞风险", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "JWT 瞬间核对完毕", "放行"], log: ["JWT 流派：就地执行加密算法解扣，核实签名一致性，通过！"], note: "无阻塞零数据库消耗快速验证", delayMs: 800 }
      ]
    },
    sources: [{ title: "Authentication", url: "https://nextjs.org/docs/app/building-your-application/authentication" }],
    summary: ["深刻理解认证状态的存贮归属对于大后端系统架构的决定性影响", "JWT 带来了极大的解耦和高速，但也附带了诸如无法立刻全网踢人下线的劣势", "Next.js 因为强烈拥抱 Edge 计算所以生态天平偏向于无状态 JWT"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-auth-nextauth",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.2 · 认证与会话",
    title: "Auth.js (NextAuth) 快速集成",
    objectives: ["了解如何利用业界事实标准的认证库快速搭建繁杂体系"],
    prerequisites: ["nextjs-auth-concepts"],
    concept: "自己手写 Cookie 种植、哈希密码比对、防伪造和各种社交平台登录极其折磨人而且容易出严重安全漏洞。`Auth.js`（也就是著名的 NextAuth.js 5.0 版本）接管了这一切。只需要新建一个 `auth.ts` 配置文件，你就拥有了一套拥有极高防御级别且全栈互通的身份网关。",
    points: ["统一所有的认证策略（Credentials, GitHub, Google 等）为一套简单的 Providers 数组配置", "它会自动在内部帮你建立好对应的登录、登出、回调等近十个 API 接口", "全自动化的 JWT 下发和安全刷新生命周期管理"],
    memoryHook: "引入 Auth.js，配置几行全搞定",
    files: [{ name: "auth.ts", code: `import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

// 这几行极其简短的代码就是整个庞大安全系统的心脏大闸
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      // 这些密钥必须放在不可见的 .env 环境变量文件中
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      // 供传统的账号密码登录使用，你在这里写查库比对逻辑
      async authorize(credentials) {
         return null; // 这里暂且略过
      }
    })
  ],
  // 将策略指定为 JWT 以获取最高边缘性能
  session: { strategy: 'jwt' } 
});` }],
    entryFile: "auth.ts",
    answer: {
      type: "prediction",
      prompt: "为什么我们需要把这个配置文件独立提取成一个名为 `auth.ts` 的根文件导出那 4 个极其重要的常量（`handlers, signIn, signOut, auth`），而不是随便写在用到的页面里？",
      options: [
        { id: "a", label: "为了让代码好看，遵循所谓的最佳实践模式", detail: "装饰论", feedback: "它的作用远比单纯的代码美化要深刻和核心得多。" },
        { id: "b", label: "因为 Next.js 是全栈混合，你既要在 Server Component、API 端点使用提取器（auth），又要在客户端组件、中间件（Middleware）或者表单动作（Action）里复用登入/出动作（signIn/signOut），这必须是一个全局唯一基座", detail: "全链路枢纽", feedback: "正确：这 4 个核心函数是打通 Next 前中后方防御的万能钥匙。" },
        { id: "c", label: "因为它强制规定了只能这么写，否则报错", detail: "刻板规定", feedback: "它是故意设计成供各个环节抽取的共享核心模块。" }
      ],
      answerId: "b",
      correctExplanation: "在这个极简的模块封装背后，NextAuth 极其巧妙地隐藏了海量的通信细节。导出的 `handlers` 被安置进了 Next 的 API 路由里负责应对全世界发来的 OAuth 回调和表单请求；而 `auth` 函数则变成了你在任何想要获取用户资料的服务器组件内部随传随到的探针。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "Auth 核心接线板", nodes: ["构建提供商", "生成隐秘接口", "签发加固 JWT", "向各环境暴漏调用句柄", "安全收敛"] },
      lanes: ["装配基础策略", "工厂化输出 API", "赋能给宿主全域"],
      frames: [
        { activeLane: 0, laneValues: ["登记了 GitHub 和 账号密码两种方式", "等待", "等待"], log: ["挂载了密钥对和查库校验准则函数"], note: "引擎准备就绪并封固在内存中", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用 handlers 拦截注入 /api/auth/*", "等待"], log: ["自动衍生出了诸如 /api/auth/signin, /api/auth/callback/github 等大量合法接驳口"], note: "你一行额外的路由处理代码都不用写", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "向 Server 组件输出探针"], log: ["你在 page.tsx 中只需呼叫 await auth() 就能无痛安全查阅身份"], note: "极大地抽象并净化了你在应对安全编程时的心智负担", delayMs: 800 }
      ]
    },
    sources: [{ title: "NextAuth.js", url: "https://authjs.dev/getting-started/installation?framework=next.js" }],
    summary: ["这是所有 Next.js 从零到一构建含权后台避不开的首选基础设施", "通过导出 4 个万金油函数搞定从前台 UI 到深层后端的一切阻断逻辑", "极速支持包含 OAuth 和无密码 Magic Link 在内的一切现代潮流验身方案"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-auth-protected-routes",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.4 · 认证与会话",
    title: "在 Server 组件中保护路由",
    objectives: ["学会在普通的页面和动作中利用 auth() 极简完成鉴权与隔离"],
    prerequisites: ["nextjs-auth-nextauth", "nextjs-foundations-server-components"],
    concept: "如何防止没有买票的人看到你网站里珍贵的加密内容？在传统 React (SPA) 中，你在客户端发请求后等待接口响应 401 再去跳转（会出现极其讨厌的页面闪烁）。而在 Next.js 中，最无懈可击的做法是直接在 Server Component 里调用 `await auth()`，如果为空（null），在页面生成前就强行把他踹（`redirect`）回登录界面，连一个字节的 HTML 都不会暴露！",
    points: ["Server Component 中的页面保护是绝对安全不可绕过的，因为代码根本不会发送给浏览器", "利用 next/navigation 提供的 redirect 函数进行极其暴力的瞬间放逐转移", "彻底避免了客户端渲染时代鉴权引发的 Loading 闪烁和隐私外泄问题"],
    memoryHook: "服务端前排查票，没票休想看一秒",
    files: [{ name: "app/dashboard/page.tsx", code: `import { redirect } from 'next/navigation';
import { auth } from '@/auth'; // 就是我们刚刚暴露出的那个万能探针！

export default async function DashboardPage() {
  // 这行代码跑在深不可测的 Node.js 后方保险柜里
  const session = await auth();
  
  // 没有抓到这名访客的有效通行印记
  if (!session?.user) {
    // 这是一种极其暴力的内部重定向抛出机制，
    // 它甚至不属于普通的 return HTML，而是会终止此函数继续往下运行。
    redirect('/login?callbackUrl=/dashboard');
  }

  // 只有拥有特权的人，才能让程序走入以下禁区获取敏感数据
  return (
    <main>
      <h1>欢迎回来长官：{session.user.name}</h1>
      <p>这是你的最高机密图纸...</p>
    </main>
  );
}` }],
    entryFile: "app/dashboard/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果一个狡猾的黑客禁用了浏览器所有的 JavaScript 并且试图强行请求 `/dashboard`，他能在浏览器的审查元素源码里看到任何关于“最高机密图纸”的文字残留吗？",
      options: [
        { id: "a", label: "能看到一部分，因为 React 需要把结构传过来再用 JS 隐藏", detail: "客户端鉴权的漏勺", feedback: "在 Next Server Component 中，不存在这种事情。" },
        { id: "b", label: "绝对不可能。系统在服务端运行到 redirect 时就直接切断并向黑客抛回了一个 HTTP 307 跳转头，那些图纸代码连被编译的机会都没有", detail: "物理级隔绝", feedback: "正确：这种基于服务端组件的渲染拦截是从物理网线上斩断了数据下行的可能。" },
        { id: "c", label: "看他手速快不快，快的话能截屏截到", detail: "闪烁漏判", feedback: "这不是前端组件的 conditional rendering (条件渲染)，它是后端的强制 HTTP 改道。" }
      ],
      answerId: "b",
      correctExplanation: "过去我们花费了海量的精力去写高阶组件（HOC）或者全局 Context 来做权限包裹组件。而且由于渲染发生在客户端，如果不慎把机密数据一并打包到了 JS Chunk 中，黑客可以直接扒光所有的底裤。而在 Next 服务端组件鉴权模式中，前端页面和后端数据被彻底融合在了一起。你过不了我的安检，我就从根本上拒绝组装这台机器。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "服务端拦截机制", nodes: ["拦截器运作", "解析 Cookie 标记", "发现异常为空", "抛出 Redirect", "强行扭转请求车头"] },
      lanes: ["前台闯入请求", "后台深度审计", "抛弃或者下发"],
      frames: [
        { activeLane: 0, laneValues: ["未登录访客访问 /dashboard", "等待", "等待"], log: ["携带着空空如也的 Cookie 发送了访问命令"], note: "试图越权的非法突袭", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "auth() 执行核心侦测", "等待"], log: ["发现其无法提供有效的 JWT 证件", "触发异常状态跳出"], note: "立即拔除网线连接终止所有下流处理", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "抛射回执弹"], log: ["以一个极其简短的 307 跳转包砸向浏览器", "浏览器乖乖地被扭送回 /login 页面去接受拷问登记"], note: "未造成任何机密字节泄露，防守动作完美无缺", delayMs: 800 }
      ]
    },
    sources: [{ title: "Protecting Routes", url: "https://nextjs.org/docs/app/building-your-application/authentication#protecting-routes" }],
    summary: ["将脆弱多漏洞的前端校验升级为物理防弹级别的后台屏障拦截", "利用最符合直觉的 `if (!session) redirect()` 语句替换掉海量冗长无趣的封装包库", "这也是 Server Components 在保护高密级系统时展现出的极其恐怖的天生护城墙优势"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-auth-middleware-guard",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.5 · 认证与会话",
    title: "Middleware 全局鉴权守卫",
    objectives: ["学会在中间件层面一次性框定千军万马，不再逐个页面点名"],
    prerequisites: ["nextjs-auth-nextauth", "nextjs-api-middleware"],
    concept: "在上节课，我们学会了在单个 `page.tsx` 里防御。但如果你的整个应用有 500 个后台管理页面，你是不是要在 500 个文件里重复写 500 遍 `await auth()` 呢？这简直是谋杀！最佳实践是将 NextAuth 注入到我们在第五部分学到的那个强大的 `middleware.ts` 关卡中，利用路由匹配规则实现“一处设卡，万夫莫开”。",
    points: ["将验证剥离出具体的业务组件，集中收拢到网关层面", "即便你忘了在新加的机密页面里写防守代码，中间件也能为你兜底不漏一人", "与 NextAuth 的原生适配融合极为流畅简易"],
    memoryHook: "大门上锁保平安，不用每个房门关",
    files: [{ name: "middleware.ts", code: `import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 用 Auth.js 特有的高阶语法包住原生的中间件！
export default auth((req) => {
  // req.auth 对象此时已经被强力解析出里面的用户数据了
  const isLoggedIn = !!req.auth;
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");
  
  // 核心战略防线：如果试图访问机密区域但没有票据
  if (isDashboardRoute && !isLoggedIn) {
    // 利用我们刚学的 Request 对象极简操控能力强行转移其路径
    const newUrl = new URL("/login", req.nextUrl.origin);
    // 顺便把那个他本来想去的地方记录下来方便登录后跳回去
    newUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(newUrl);
  }
  
  return NextResponse.next();
});

// 使用这行配置，确保这个中间件只管事特定的前缀路由，而不去干扰比如图片、静态CSS或者公共的博客展示页，极大节约算力。
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};` }],
    entryFile: "middleware.ts",
    answer: {
      type: "prediction",
      prompt: "在这种设计模式下，如果一个刚来公司的实习生新建了一个机密的 `/dashboard/salary-report` 页面但是忘了在里面写任何一句鉴权代码，这个页面会被外人看到吗？",
      options: [
        { id: "a", label: "会被看到，因为他没在组件里布防", detail: "漏防论", feedback: "全局守卫的意义就在于容错和兜底。" },
        { id: "b", label: "不会被看到，因为所有以 `/dashboard` 开头的路径在抵达那个页面前，都已经在边缘中间件这一层被一刀切地截杀过滤掉了", detail: "大网捕鱼", feedback: "正确：这种设计极大地抵御了人为失误带来的系统性安全事故。" },
        { id: "c", label: "会抛出框架层面的系统级编译报错，迫使他加上防线", detail: "强行检查", feedback: "框架并不知道什么是工资表，它只能依赖你的中间件逻辑。" }
      ],
      answerId: "b",
      correctExplanation: "将权限判定上推（Hoist）到 Middleware 层是架构设计的至高美学。它实现了完美的关注点分离（Separation of Concerns）：业务开发人员只管把页面画好看，系统架构师在最外层把守大门。这种机制不仅更加稳固不容易遗漏，而且因为运行在 Edge 层级，它能够在离用户最近的节点瞬间把黑客弹回，极大节约了中心服务器去渲染组件的无畏消耗。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "护城河统揽全局图", nodes: ["配置泛指拦截", "拦截未知机密页", "Edge JWT 核验", "验明正身失败", "弹射偏转"] },
      lanes: ["全局扫描设定", "大面积网罗", "轻量弹射"],
      frames: [
        { activeLane: 0, laneValues: ["建立了一道圈养所有 /dashboard/* 的铁网", "等待", "等待"], log: ["不再依赖零散分布的单点哨兵体制", "形成了坚壁清野的城防策略"], note: "从架构宏观层面杜绝了人为纰漏", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "实习生新建的无防备文件被访问", "等待"], log: ["发现这玩意儿的路径命中了防御网", "中间件立即开始高速运转执行判别动作"], note: "无论里面藏得有多深，路由层是避不开的死穴", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "行使一刀切特权"], log: ["管你里面业务逻辑是什么，没买票连大门都进不来！"], note: "安防动作极度前置化，将隐患扼杀在摇篮里", delayMs: 800 }
      ]
    },
    sources: [{ title: "Protecting Routes with Middleware", url: "https://nextjs.org/docs/app/building-your-application/authentication#protecting-routes-with-middleware" }],
    summary: ["一次写就，万千文件受益的终极拦截利器", "完全消弭了在大型团队协作中极其容易产生的散点鉴权漏网之鱼风险", "借助 Auth.js 提供的高阶包装器使得拦截过滤代码如同诗般简明通达"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-auth-jwt-session",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.3 · 认证与会话",
    title: "JWT 与 Session 的解密",
    objectives: ["探究在调用 auth() 之后提取出来的信息包含什么，以及如何对数据进行扩展"],
    prerequisites: ["nextjs-auth-nextauth"],
    concept: "你可能会疑惑：`await auth()` 拿到的一串对象里怎么只有名字、邮箱这些可怜巴巴的基础信息？如果我的业务需要验证他的 `role: 'admin'` 级别呢？这就涉及到了 Auth.js 的回调机制扩展（Callbacks）。我们必须介入它生成 JWT 和组装 Session 的钩子里，把自己额外查询到的身份或者等级强行塞进那一串签名里去！",
    points: ["默认下 Auth.js 出于极简安全考虑只下发极少的无害公共信息", "通过 jwt 回调拦截签发过程，把自定义属挂载进令牌包内", "再通过 session 回调把令牌包里的东西提取出来暴露给全站各个页面使用"],
    memoryHook: "钩子里加料，令牌满地跑",
    files: [{ name: "auth.ts", code: `import NextAuth from 'next-auth';
// 省略提供商配置...

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [ /* ... */ ],
  callbacks: {
    // 钩子 1：这发生在用户刚输完密码核实通过，准备签发加密小本本的瞬间
    async jwt({ token, user }) {
      if (user) {
        // user 对象是查库得来的（可能包含了你在库里的自定义角色字段）
        // 把它强行烙印在这个签发完毕后不可更改的 token 体里
        token.role = user.role; 
      }
      return token; // 返回的这个东西会被加密成字符串存入 Cookie
    },
    
    // 钩子 2：这发生在你任何一次页面里使用 await auth() 或者 useSession() 获取数据时
    async session({ session, token }) {
      if (session.user) {
        // 把上面那张通行证里的特有信息提取出来，赋予给可以暴露给前端看的对象
        session.user.role = token.role; 
      }
      return session; // 你拿到这就是这个丰满厚实的对象了！
    }
  }
});` }],
    entryFile: "auth.ts",
    answer: {
      type: "prediction",
      prompt: "在这番改装之后，如果这个用户以后在整个网站里随便闲逛（不重新登录），服务器还有必要每一次都去连接查询真实的数据库表以判定他是不是 'admin' 吗？",
      options: [
        { id: "a", label: "有必要，因为要保证绝对的实时安全，万一他半路被降职了呢", detail: "查库执念", feedback: "这是 Session 的做法。在 JWT 策略下，我们不查库。" },
        { id: "b", label: "不需要了，因为 `role` 已经被加密死死地打入了存在他自己浏览器里的 Cookie 印章中，只要证书还没过期，他就是永远的 admin，根本不耗费一丁点服务器查询算力", detail: "无状态高并发秘诀", feedback: "正确：把状态甩给客户端储存并利用加密算法核对其防伪造，这就是 JWT 的极速奥义。" },
        { id: "c", label: "他必须每去一个新页面重新输一次密码确认", detail: "无稽之谈", feedback: "这是认证的噩梦。" }
      ],
      answerId: "b",
      correctExplanation: "这段代码极其深刻地揭示了现代无状态认证的核心：用信息冗余替代连接查询。你把判定业务所需的最少关键信息（如ID、Role）封死在信封里。它的好处是系统承载力呈现数量级起飞；但代价是，如果这个恶劣的管理员被老板开除了，除非这个 JWT 到期，否则你极难阻止他继续行凶（这也是很多系统会用黑名单辅佐或者改回传统 Session 策略的原因，两者皆有利弊需要权衡）。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "扩展加料签发流", nodes: ["初始核对通过", "触发 JWT 回调夹带私货", "封口加密投送", "页面需要验明正身", "解码解包出完整信息"] },
      lanes: ["认证网关深处", "加密与寄送", "全局业务消费"],
      frames: [
        { activeLane: 0, laneValues: ["发现登录者的账户拥有超管字段", "等待", "等待"], log: ["开始触发 NextAuth 隐蔽的 jwt hook 方法"], note: "拦截了流水线", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "将 role 烙印并滚轴加密成极长散列", "等待"], log: ["把生成的长串 eyJ... 塞进 Response-Cookie 交给浏览器的保险柜里锁死"], note: "完成了身份凭证的离线化打包和分发", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "利用 session hook 重塑出信息给业务层"], log: ["任何一次 auth() 呼叫", "在不惊动数据库分毫的情况下迅速根据那长串字符复原出他那尊贵的 admin 字段"], note: "极大满足了各路页面对权限等级探寻的需求", delayMs: 800 }
      ]
    },
    sources: [{ title: "Extending the session", url: "https://authjs.dev/guides/basics/role-based-access-control" }],
    summary: ["打通认证模块中由于出于保护隐私而过于克制的底层限制", "完美演绎了一段如何运用回调双端劫持数据加工再暴露的黑魔法", "将极其复杂的自证权流转体系封装化解于短短两段逻辑钩子内"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-auth-rbac",
    stageId: "nextjs-auth-middleware",
    kind: "knowledge",
    eyebrow: "06.6 · 认证与会话",
    title: "基于角色的访问控制 (RBAC)",
    objectives: ["综合利用上面所学，实现不同权限人员对应不同版块展现的硬隔离体系"],
    prerequisites: ["nextjs-auth-jwt-session", "nextjs-auth-middleware-guard"],
    concept: "我们拿到带 `role` 的通行证了！接下来就是要实施真正的阶级壁垒（RBAC, Role-Based Access Control）：管理员可以进入管理后台，普通员工可以进仪表盘，而无权限的人连一个字节的秘密也不能看。这种逻辑既可以在 Middleware 里全盘拦截，也可以在特定的 Server Action 写入动作里进行精微地防爆破斩首判定。",
    points: ["将粗粒度的路由拦截（有没有登录）精细化到不同等级人员的分流判定（是不是管理员）", "不要仅仅在页面拦截，最核心的增删改 API (Server Actions) 更是必须加入同等级别的验证，防抓包直接调", "这是每一个 SaaS 级别软件极其重要的保命心智底座"],
    memoryHook: "有票进门，看座入席",
    files: [{ name: "middleware.ts", code: `import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // 提取出我们上一课千辛万苦加在里面的角色信息
  const role = req.auth?.user?.role;
  const isLoggedIn = !!role;

  // 1. 如果去老板专属后花园，不是 admin 直接踹走！
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.rewrite(new URL('/403', req.nextUrl)); // 抛给一个你无权访问页面
  }
  
  // 2. 如果去普通员工的仪表盘，不是 user（或者更好）也踹走！
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});` }, { name: "app/actions.ts", code: `'use server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function deleteSystemData() {
  // 极其关键的深水区反制：
  // 防止有人绕过了页面的屏蔽，通过抓包接口来尝试发动针对删除核心动作的攻击！
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('极其恶劣的越权行径被拦截系统扑灭！');
  }
  
  // 确保了万无一失后，放行极高危动作
  await db.dropEverything();
}` }],
    entryFile: "app/actions.ts",
    answer: {
      type: "prediction",
      prompt: "为什么在 `deleteSystemData` 这个内部 Action 函数中，还要死心眼地再查一遍 `role !== 'admin'` 呢？反正他要是不在 `admin` 界面他也看不到这个触发按钮，在 Middleware 里也被挡在外面了呀？",
      options: [
        { id: "a", label: "这叫瞎操心，完全可以删掉", detail: "过于信任前端组件", feedback: "这是前端开发最容易犯的安全漏洞天坑。" },
        { id: "b", label: "因为坏人只要知道了这个接口的发送格式，完全可以使用 Postman 等工具直接跨过页面拦截发起攻击，这就是所谓的“绕开门禁从地下室下毒”", detail: "防接口直刷越权", feedback: "正确：记住这句安全界名言：绝对不要相信任何来自前端（包含按钮有无或者路由中间件）传来的状态，最后把关必定要在动作执行点当面点算。" },
        { id: "c", label: "为了让代码显得很规范并且赚取外包公司的代码行数钱", detail: "无稽之谈", feedback: "这不仅是为了安全，这是合规审计的底线要求。" }
      ],
      answerId: "b",
      correctExplanation: "系统防御永远是“洋葱模型（纵深防御）”。Middleware 拦截管的是“观感层”（你能不能看到这个页面大门）；而在执行最血腥破坏动作的 Server Action 里再写一遍甚至多遍更加细密的校验，这管的是“物理层”（你到底能不能按下起爆按钮）。两者配合使用缺一不可，只有这样才能构筑出一个企业高防级的数据密室体系。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "纵深双轨防御塔", nodes: ["表层拦截扫描", "识别出低等权限强闯", "将其打回老家", "底层高危接口遭受绕路暗杀", "接口处执行断头台斩杀抛弃"] },
      lanes: ["页面拦截线", "越级强攻探测", "最底核心守卫"],
      frames: [
        { activeLane: 0, laneValues: ["普通职员试图偷偷去访问老板页面", "等待", "等待"], log: ["中间件网关：不好意思你的凭证只能去普通座位"], note: "利用重写使其迷失在 403 的荒漠中", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用技术抓包工具找出核心删库请求地址进行投毒发射", "等待"], log: ["这枚毒弹以极高速度掠过了中间件甚至未触发其雷达预警"], note: "最恐怖的越权穿透打击", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "触底核爆级拦截"], log: ["Server Action 拔出最后一道保险 auth()进行当面盘问，发现凭证不匹配并直接将其执行进程碾碎！"], note: "极其漂亮的防身反杀操作", delayMs: 800 }
      ]
    },
    sources: [{ title: "Role-Based Access Control", url: "https://nextjs.org/docs/app/building-your-application/authentication#role-based-access-control" }],
    summary: ["这是一堂深刻的血肉安全课：必须构建立体包裹的前端防护以及最纵深的深水核查", "让分身级别的业务层和网管中心相互配合进行精密的漏斗筛选机制", "将你的前端心智彻底拉升至系统级别防御设计思维体系的层面"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-auth-oauth",
    stageId: "nextjs-auth-middleware",
    eyebrow: "06.7 · 认证与会话",
    title: "OAuth 社交登录回调流",
    objectives: ["理解 GitHub/Google 登录如何通过 callback URL 回到 Next.js 应用"],
    prerequisites: ["nextjs-auth-nextauth"],
    concept: "OAuth 的核心不是把第三方密码交给你，而是让用户去第三方授权页确认身份；授权成功后，第三方把一次性 code 带回你的 callback URL，Auth.js 再在服务端用 client secret 换取用户资料并建立本应用自己的 session。",
    points: ["callback URL 必须与第三方后台登记值一致", "client secret 只能留在服务端环境变量中", "OAuth provider 返回的 profile 需要映射成应用自己的用户模型"],
    memoryHook: "外站验身份，回调换门票",
    fileName: "auth.ts",
    code: `import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.githubLogin = profile?.login;
      }
      return token;
    }
  }
});`,
    prompt: "用户点击 GitHub 登录后，GitHub 返回到 `/api/auth/callback/github?code=...`，哪一步必须发生在服务端？",
    correctLabel: "用 client secret 和 code 换取第三方用户资料，并签发本应用自己的 session",
    wrongLabels: ["把 GitHub 密码存进浏览器 localStorage", "让客户端直接读取 AUTH_GITHUB_SECRET 再换 token"],
    correctExplanation: "OAuth 的秘密交换必须发生在服务端。浏览器只负责跳转与携带一次性 code；Auth.js 的 route handler 在后端拿 secret 完成换票，再创建本应用 session。",
    visualizerType: "nextjs-middleware-chain",
    visualizerTitle: "OAuth 回调换票链路",
    nodes: ["点击登录", "跳转 GitHub", "带 code 回调", "服务端换 token", "签发本地 session"],
    sourceTitle: "Auth.js OAuth Providers",
    sourceUrl: "https://authjs.dev/getting-started/authentication/oauth",
    summary: ["OAuth 是外部身份确认，不是共享密码", "callback URL 是第三方和本应用之间的正式接驳口", "client secret 绝不能进入客户端包"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-auth-security",
    stageId: "nextjs-auth-middleware",
    eyebrow: "06.8 · 认证与会话",
    title: "认证安全最佳实践",
    objectives: ["掌握 Cookie、CSRF、重定向和服务端校验的关键安全边界"],
    prerequisites: ["nextjs-auth-oauth", "nextjs-auth-rbac"],
    concept: "认证系统最怕“看起来登录了”但关键动作没有二次校验。安全实践包括：使用 httpOnly / secure / sameSite Cookie；登录后只允许跳转到同站 callbackUrl；所有写入动作在 Server Action 或 Route Handler 中重新读取 session。",
    points: ["httpOnly Cookie 防止前端脚本直接偷 token", "callbackUrl 要做同源校验，避免开放重定向", "高危 mutation 必须在服务端重新 auth()"],
    memoryHook: "票藏后端柜，跳转看同源",
    fileName: "app/actions/delete-account.ts",
    code: `"use server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function deleteAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const confirmation = formData.get("confirm");
  if (confirmation !== "DELETE") {
    return { error: "需要明确确认删除" };
  }

  // 真实项目这里还要校验 CSRF/二次确认/审计日志
  await db.user.delete({ where: { id: session.user.id } });
  redirect("/goodbye");
}`,
    prompt: "为什么删除账号这种 Server Action 不能只依赖页面上“隐藏按钮”的前端逻辑？",
    correctLabel: "因为攻击者可以绕过 UI 直接提交请求，服务端动作入口必须重新 auth() 并校验关键字段",
    wrongLabels: ["因为 Server Action 不能读取 session", "因为隐藏按钮会让页面 SEO 变差"],
    correctExplanation: "UI 只负责引导，不能成为安全边界。真正的安全门必须放在执行 mutation 的服务端函数里，并对身份、来源和确认字段做最终校验。",
    visualizerType: "quality-shield",
    visualizerTitle: "认证纵深防护层",
    nodes: ["浏览器表单", "Cookie 限制", "服务端 auth", "危险动作确认", "审计与跳转"],
    sourceTitle: "Next.js Authentication",
    sourceUrl: "https://nextjs.org/docs/app/building-your-application/authentication",
    summary: ["认证安全依赖服务端最终校验", "Cookie 属性是防泄露和防跨站的重要基础", "高危操作应具备确认、审计和安全跳转"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-login-system",
    stageId: "nextjs-auth-middleware",
    kind: "stage-project",
    eyebrow: "阶段项目 06 · 认证与会话",
    title: "企业中台多态权限控制系统",
    difficulty: "进阶",
    objectives: ["以最高极客水准整合无死角全栈防卫拦截体系，落地认证实战项目"],
    prerequisites: ["nextjs-auth-concepts", "nextjs-auth-nextauth", "nextjs-auth-protected-routes", "nextjs-auth-middleware-guard", "nextjs-auth-jwt-session", "nextjs-auth-rbac"],
    concept: "这个挑战将要求你融会贯通 Auth.js。你将编写一份极其干净的核心 `auth.ts`，利用它签发扩展过特定员工角色的特权 JWT；通过架设在中枢地带的泛指通配符 Middleware，为 10 几个秘密的路由群组统一安装过滤筛网；并且在你那个极速利用 Server Action 与后端并行的超级提交表单函数最开头处，加上防直接跨站轰炸的强力截杀指令！这是一套在当今互联网上可卖上极好价格的标准中台骨架体系方案！",
    points: ["不依赖那些陈旧庞大的独立鉴权外包服务，利用 Server + Edge 无缝拼合原生方案", "享受无需手写几十行令人恶心的 Cookie 拆包签发防伪的爽快", "打透了所有 Web 数据流中可能遭遇到截胡窜改窃听的最核心知识网络区"],
    memoryHook: "防微杜渐铸高台，多维阻拦显风采",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：核心认证配置与边缘拦截",
        context: "首先配置 Auth.js 的核心工厂，并在 Middleware 中加入大范围的路由拦截防波堤，确保未登录用户无法轻易进入受保护区域。",
        files: [
          { name: "auth.ts", code: `import NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nimport { getUserByEmail } from './db';\n\n// 这是整个心脏起搏器\nexport const { handlers, signIn, signOut, auth } = NextAuth({\n  providers: [\n    Credentials({\n      async authorize(c) {\n        // ...执行库内查验\n        const user = await getUserByEmail(c.email);\n        if(!user || user.password !== c.password) return null;\n        // 给它加上烙印\n        return { id: user.id, name: user.name, role: user.department }; \n      }\n    })\n  ],\n  callbacks: {\n    async jwt({ token, user }) { if(user) token.role = user.role; return token; },\n    async session({ session, token }) { session.user.role = token.role; return session; }\n  },\n  pages: { signIn: '/login' } // 指明踢回来的门在哪儿\n});` },
          { name: "middleware.ts", code: `import { auth } from "@/auth";\nimport { NextResponse } from "next/server";\n\nexport default auth((req) => {\n  // 这是把守重型要塞的外层城墙守卫\n  const isProtected = req.nextUrl.pathname.startsWith("/app");\n  if (isProtected && !req.auth) {\n    return NextResponse.redirect(new URL("/login", req.nextUrl));\n  }\n});\nexport const config = { matcher: ['/((?!api|_next/static|_next/image).*)'] };` }
        ],
        entryFile: "middleware.ts",
        question: {
          id: "project-nextjs-login-system-step1",
          type: "prediction",
          prompt: "在 Middleware 的 config 中使用了 `matcher: ['/((?!api|_next/static|_next/image).*)']` 的目的是什么？",
          options: [
            { id: "a", label: "为了让所有这些路径强制跳转到 /login", detail: "相反效果", feedback: "正则表达式里的 `?!` 意味着排除这些路径。" },
            { id: "b", label: "排除静态资源和 API 路由，防止 Middleware 被这些高频的无谓请求反复触发而浪费算力", detail: "性能优化", feedback: "正确：Middleware 应避免不必要地拦截静态资源和底层 API 接口，这极大减少了运行开销。" }
          ],
          answerId: "b",
          correctExplanation: "泛指的匹配可以保障安全网的覆盖率，而通过黑名单排除掉高频、不涉及用户直接权限的资源是保障 Middleware 高速运转的关键。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：Server Action 最终权限守卫",
        context: "在执行任何极高权限操作之前，即便页面没有拦截住请求，我们也必须在修改操作的源头进行最终的权限比对，形成纵深防御体系。",
        files: [
          { name: "app/app/dashboard/actions.ts", code: `'use server';\nimport { auth } from '@/auth';\nimport { revalidatePath } from 'next/cache';\n\nexport async function processTopSecretData() {\n  // 这是核心保险箱门锁的最后一道防线\n  const session = await auth();\n  if (!session || session.user.role !== 'ceo') {\n    return { error: '越权警报触发：已锁定并在后台记录非法攻击 IP！' };\n  }\n  \n  // ...执行不可挽回的高度机密处理操作...\n  revalidatePath('/app/dashboard');\n  return { success: '总裁您好，操作已安全执行。' };\n}` }
        ],
        entryFile: "app/app/dashboard/actions.ts",
        question: {
          id: "project-nextjs-login-system-step2",
          type: "transfer",
          prompt: "假设由于中间件里一个愚蠢的程序员失误把 `startsWith` 写成了错误的拼写，导致外层防波堤大开。黑客直接发起了带有触发 `processTopSecretData` 指令的请求。请问公司的机密在这个时候被毁了吗？",
          options: [
            { id: "a", label: "肯定毁了，因为中间件这个大门破了", detail: "单层防御心态", feedback: "中间件只是最外层的减震器，真正的防弹衣在内层。" },
            { id: "b", label: "完全不会，因为这套架构中最深的那一层 Server Action 鉴权依然无情且精准地判定了他没有 'ceo' 权限，从物理层断绝了所有非法指令的执行", detail: "冗余设计的降维救世", feedback: "正确：在核心基建设计上，防范内鬼与失误是最重要的议题，多点复用鉴权形成深度防御。" }
          ],
          answerId: "b",
          correctExplanation: "你眼前的这个项目，展示了利用最新的 Next 服务端思维颠覆单点防御的全过程。通过灵活多变的万能 `auth()` 钩子，我们将鉴权布防到了战舰的每一个水密舱里面。一层破，第二层自动补位。"
        }
      }
    ],
    sources: [{ title: "Authentication", url: "https://nextjs.org/docs/app/building-your-application/authentication" }],
    summary: ["一次完美展示利用重叠式架构防御系统故障以及防备无死角暗器攻击的高分实操", "运用 Next.js 极高自由穿插前后端的特性将 Auth 这个最为抽象繁杂的能力化成了手到擒来的小挂件", "帮助开发者突破被框架限制心智只能做切图匠的囚笼进而转型为真正的方案设计师"]
  })
];
