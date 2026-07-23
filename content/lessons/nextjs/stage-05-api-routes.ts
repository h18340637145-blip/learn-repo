import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageFiveApiRoutesLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-api-route-handler",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.1 · API 路由",
    title: "Route Handler 基础",
    objectives: ["了解如何在 Next.js 目录下通过 route.ts 构建后端接口"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "虽然我们可以用 Server Components 和 Server Actions，但有时候你必须提供一个传统的 REST API 接口（例如给手机 App 用，或者响应外部的 Webhook）。在 App Router 中，只要你在目录下创建一个叫 `route.ts` 的文件，这个路径就变成了一个 API 端点。你可以直接导出 `GET`, `POST`, `PUT`, `DELETE` 等标准的 HTTP 方法名称的函数。",
    points: ["使用 route.ts 文件名来标识 API 端点", "导出大写的标准 HTTP 方法函数", "在同一个文件夹下，page.tsx 和 route.ts 不能同时存在"],
    memoryHook: "创建 route 文件，变身后端接口",
    files: [{ name: "app/api/hello/route.ts", code: `// 这个文件暴露在 /api/hello 路径
export async function GET() {
  // 直接返回一个 Response 对象即可
  return Response.json({
    message: '你好，这里是后端服务接口！',
    timestamp: Date.now()
  });
}` }],
    entryFile: "app/api/hello/route.ts",
    answer: {
      type: "prediction",
      prompt: "如果我们在外部使用 `fetch('http://localhost:3000/api/hello')` 请求该地址，会发生什么？",
      options: [
        { id: "a", label: "返回一个包含这些文字的 HTML 页面", detail: "被当成网页渲染", feedback: "route.ts 明确了这是一个数据接口，不生成 HTML。" },
        { id: "b", label: "返回一个带着 `application/json` 头的纯 JSON 数据对象", detail: "标准接口响应", feedback: "正确：这让 Next.js 直接具备了取代传统 Express 或 Koa 后端框架的能力。" },
        { id: "c", label: "需要先配置额外的路由映射字典才能访问", detail: "因为没注册", feedback: "Next.js 是基于文件系统路由的，放进目录即代表了注册。" }
      ],
      answerId: "b",
      correctExplanation: "利用 `route.ts` 结合文件系统，你获得了零配置创建微服务的特权。这种一体化的结构让你不再需要两套独立的代码库（前端一套 Vue/React，后端一套 Node/Go），你在处理前台功能的同时，顺手就能暴露出标准的给其他设备系统对接的 API 格式。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "API 响应系统", nodes: ["接收请求", "路由寻址", "运行 HTTP 方法", "封转 Response", "传回给客户端"] },
      lanes: ["匹配路由", "运行脚本", "传回结果"],
      frames: [
        { activeLane: 0, laneValues: ["外部发送 GET /api/hello 请求", "等待", "等待"], log: ["请求打到 Next 服务器"], note: "探寻映射关系", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "定位并执行对应的大写方法", "等待"], log: ["寻获 route.ts 内的导出函数 GET() 并启动执行"], note: "进行实际的逻辑和查询处理", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "利用底层原生 API 返回"], log: ["返回由原生 Response.json() 封装的标准报文头和正文"], note: "无任何花里胡哨的额外载荷", delayMs: 800 }
      ]
    },
    sources: [{ title: "Route Handlers", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers" }],
    summary: ["以极低的门槛编写传统 RESTful API 后台服务", "与标准的 Web Request 和 Response API 全面兼容", "实现了前端页面和后方中台服务物理与逻辑上的同构统一"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-request-response",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.2 · API 路由",
    title: "NextRequest 与 NextResponse",
    objectives: ["熟悉 Next.js 对标准 Web API 的强力扩展对象"],
    prerequisites: ["nextjs-api-route-handler"],
    concept: "虽然你可以使用浏览器标准的 `Request` 和 `Response`，但 Next.js 贴心地提供了扩展版：`NextRequest` 和 `NextResponse`。这些加强版对象自带了极为方便的辅助方法，例如你不再需要苦哈哈地去按字符串解析 URL 中的 Query 参数或者手打 Set-Cookie 字符串，它们直接提供了诸如 `req.nextUrl.searchParams` 和 `res.cookies.set()` 等便捷 API。",
    points: ["极大地优化了传统 Web 标准中晦涩的底层处理代码", "提取 Search Query 参数和设置 Cookie 变得像读取普通对象一样轻巧", "常用于 POST 数据读取和响应处理中"],
    memoryHook: "带个 Next 前缀，解析参数不累",
    files: [{ name: "app/api/search/route.ts", code: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 利用扩展对象自带的方法极其轻巧地剥离查询参数:
  // 例如有人访问 /api/search?q=nextjs&sort=asc
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  // 假装去数据库搜东西
  const results = \`你搜索了关键词：\${query}\`;

  // 返回时同样使用 NextResponse 的简便方式
  const res = NextResponse.json({ results });
  
  // 顺带利用其语法糖发配一个跨站跟踪 Cookie
  res.cookies.set('last_search', String(query));
  
  return res;
}` }],
    entryFile: "app/api/search/route.ts",
    answer: {
      type: "prediction",
      prompt: "在这个例子中，为什么不直接使用 `req.url`（返回一个字符串比如 `http://localhost/api/search?q=...`）自己去进行截取和匹配？",
      options: [
        { id: "a", label: "因为那是被框架禁止访问的非法属性", detail: "强制封锁", feedback: "你依然可以访问原生属性，但完全没必要自己给自己找不痛快。" },
        { id: "b", label: "为了利用内置的 `nextUrl` 结构化对象，它已经替你把所有的查询字符串甚至路径解析好了，省去了极其繁琐的正则表达式或者原生 URL 库重装解析过程", detail: "高级封装糖", feedback: "正确：这种开箱即用且经过重度优化的原生对象正是 Next API 设计的核心亮点。" },
        { id: "c", label: "因为它能自动绕开跨域和安全审计", detail: "安全机制", feedback: "这和安全防护是两码事，纯粹是为了开发体验（DX）。" }
      ],
      answerId: "b",
      correctExplanation: "现代 Web 框架的一大职责就是让你“少写废代码”。原生的 Web 标准固然通用，但在处理提取 URL 参数或进行 Cookie 操作时总让人感觉啰嗦。`NextRequest` 就是在这个标准上包了一层精美的糖衣。它既保持了和底层 Fetch API 的兼容性，又满足了各种高频实用的操作要求。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "强化对象处理链", nodes: ["到达网关", "底层封套强化", "提取 query", "拼装备注响应体", "赋予加强 Header 返回"] },
      lanes: ["原生转化", "利用糖衣提参", "返回和种下追踪标"],
      frames: [
        { activeLane: 0, laneValues: ["传入包含一串长尾参数的 GET 请求", "等待", "等待"], log: ["收到繁杂的请求原始字符串", "实例化转化为强大的 NextRequest 对象实体"], note: "封装准备动作", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用扩展的 nextUrl", "等待"], log: ["只用一行代码精确提纯出了 'nextjs' 这个查询关键字符串"], note: "规避了传统解析代码的冗长", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "利用 NextResponse 结束"], log: ["不仅仅发出了搜寻结果，顺带轻松地向客户端浏览器塞进了一枚特殊的 Cookie 烙印"], note: "连发带打极其利落", delayMs: 800 }
      ]
    },
    sources: [{ title: "NextRequest", url: "https://nextjs.org/docs/app/api-reference/functions/next-request" }],
    summary: ["极简、极其有威力的对于官方标准 Fetch 的拓展实现", "消除日常枯燥低级的数据拆解重组工作", "是你构建强力复杂中台级微服务的贴心助手"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-dynamic-routes",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.3 · API 路由",
    title: "动态 API 路由与参数",
    objectives: ["学会建立动态变量接收式的接口路径"],
    prerequisites: ["nextjs-api-request-response"],
    concept: "如同我们前面的页面路由中使用了 `[slug]` 一样。对于 API 路由来说，利用中括号语法依然可以接住任何发送过来的变量！这让你极其容易写出类似 `/api/users/123/posts/456` 这种极其具有深层业务含义的 REST 接口体系。而在处理函数中，它们会被规规矩矩地整理进 `context.params` 这个对象里供你拿取。",
    points: ["利用带有中括号命名的多层嵌套结构构建多维灵活 API", "通过函数的第二个入参获取这些参数列表", "同页面系统完全一致的底层心智模型，学会一次吃遍全家"],
    memoryHook: "方括号造路由，动态参数随心接",
    files: [{ name: "app/api/category/[categoryId]/items/[itemId]/route.ts", code: `import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest, 
  // 重点：通过这第二个上下文参数，可以精准抓取到所有上级目录里的动态变量
  { params }: { params: Promise<{ categoryId: string, itemId: string }> }
) {
  const { categoryId, itemId } = await params;
  
  // 从请求体中提取传来的修改数据 (比如 { newStatus: "sold" })
  const body = await request.json();
  
  // ...进行数据库更新操作
  return NextResponse.json({ 
    message: '商品信息更新成功',
    targetCategory: categoryId,
    targetItem: itemId,
    newData: body.newStatus
  });
}` }],
    entryFile: "app/api/category/[categoryId]/items/[itemId]/route.ts",
    answer: {
      type: "prediction",
      prompt: "如果一个外部系统向 `/api/category/electronics/items/macbook-pro` 发送了 PUT 请求，在终端接口里 `itemId` 获得的值是什么？",
      options: [
        { id: "a", label: "undefined，因为这是很深的层级提取不到", detail: "深度丢失", feedback: "Next.js 会搜集整个路径链路上的所有括号里的值。" },
        { id: "b", label: "值为字符串 'macbook-pro'", detail: "完美对应获取", feedback: "正确：路径按照文件夹名 `[itemId]` 的指引严丝合缝地把变量解构了出来交给了你。" },
        { id: "c", label: "会因为 URL 不是规范数字而报错", detail: "类型检测", feedback: "提取出来的默认皆是通配字符串，无论它是不是数字都可以畅通无阻。" }
      ],
      answerId: "b",
      correctExplanation: "构建优雅接口（RESTful）的一大标志就是依靠资源路径层级而非庞杂的请求后缀（如 `?cat=x&item=y`）来标识目标。在传统的 Express 开发中你可能需要写很长的一串正则表达式去匹配。但在 Next 中这成了极其视觉化、层级严密的一串文件夹目录堆砌，且通过天然合并的 params 使得代码干净通透。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "多维路径剥析", nodes: ["长链请求到达", "逐级目录匹配", "摘出挂载点变量", "进入 PUT", "组合输出"] },
      lanes: ["分解与路由", "深度执行层", "返程报告"],
      frames: [
        { activeLane: 0, laneValues: ["传入 /api/category/e/items/m", "等待", "等待"], log: ["框架按照目录深度进行拆解拦截", "摘取 categoryId = 'e', itemId = 'm'"], note: "高度复杂的树状识别体系", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "执行修改动作", "等待"], log: ["提取外部传来的 json 正文", "配合取到的双重 ID 精准去数据库中做定点爆破修改"], note: "利用取得的凭证办理核心业务", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "传出回执报文"], log: ["回应: '商品更新成功', 带上原路返回的参数以供二次核查"], note: "一套成熟标准的企业级后端逻辑", delayMs: 800 }
      ]
    },
    sources: [{ title: "Dynamic Route Segments", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments" }],
    summary: ["同页面系统使用一样毫无学习负担的中括号系统构建动态路径层级", "可以极其直观和无限深层地编织复杂业务依赖链路", "利用第二个包裹参数对象精妙接收"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-middleware",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.4 · API 路由",
    title: "利用 Middleware 构建 API 全局关卡",
    objectives: ["了解如何运用中间件为所有或者成批的后端端点建立防线和预处理"],
    prerequisites: ["nextjs-api-route-handler"],
    concept: "在一个拥有大量 API 的系统里，你绝不会想在每一个 `route.ts` 里面都写上一段重复的诸如“检查是不是合法管理员再放行”的冗长验证代码。这时候你在根目录设立一个统揽大局的 `middleware.ts` 关口，并告诉它凡是发向 `/api/admin/*` 的流量都必须从我这过堂审问。这是一种极其具有宏观控制力的企业级设计。",
    points: ["能够极其霸道且前置地截断向危险地带延伸的不法流量", "拥有在进入具体业务逻辑前强行塞入鉴权或者限流标示的能力", "因为在极轻的边缘沙盒环境里运行，所以它不能连慢速常规数据库，通常通过 JWT/Header 判定"],
    memoryHook: "路见不平一声吼，匹配规则统统走",
    files: [{ name: "middleware.ts", code: `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // 我们只关心尝试向机密地带请求的家伙们
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    
    // 如果他没有带着那枚特权通行证（特殊 Token）
    const token = request.headers.get('Authorization');
    if (token !== 'Bearer SECRET_BOSS_CODE') {
      // 那么根本不需要浪费一点后方 API 的精力，直接在此把他一脚踢飞
      return NextResponse.json(
        { error: '你无权探视此地！' }, 
        { status: 401 }
      )
    }
  }
  
  // 对于合法者或者走其他路的人，放行
  return NextResponse.next()
}` }],
    entryFile: "middleware.ts",
    answer: {
      type: "prediction",
      prompt: "如果一个没有任何认证的坏人试图用高并发攻击敲打你的 `/api/admin/delete-database` 接口。在这个中间件的掩护下，你的核心服务端系统（以及跑在那上面的那个接口逻辑代码）会遭受到严重的计算阻塞和崩溃吗？",
      options: [
        { id: "a", label: "会，因为请求始终会打穿到真正的处理函数里去", detail: "理解不透彻", feedback: "中间件的一大功能就是阻止它们过去。" },
        { id: "b", label: "完全不会。这批恶意的请求连 Next.js 的路由门槛甚至底座处理都还没碰到，就被极速的边缘中间件用极低的代价瞬间弹开并且拒绝了", detail: "边缘无情护城墙", feedback: "正确：这种分离解耦的设计起到了巨大的性能保护和统战收拢作用。" },
        { id: "c", label: "会，因为返回 401 也算一种严重的系统故障消耗", detail: "响应误解", feedback: "边缘环境下吐回一句 401 JSON 基本是零开销的操作。" }
      ],
      answerId: "b",
      correctExplanation: "全局关卡（Middleware）和局部逻辑分离是大型系统能抗住风浪的关键底线。中间件并不负责那些具体的诸如“在某行记录上改个名字”这种细节，它是看大门的保镖。这极大净化了内部 API 的书写环境：因为身处在深层的文件们知道，凡是能通过中间件溜达进来的流量，必定是“好人”，从而免去了无数的 `if-else` 防御检查代码。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "安全防浪墙拦截图", nodes: ["危险流量", "撞击 Edge 中间件", "执行头部核查", "触发惩戒拦截", "内部安然无恙"] },
      lanes: ["外围发起攻击", "防浪堤判定", "中心化安全保护"],
      frames: [
        { activeLane: 0, laneValues: ["海量无授权 GET /api/admin/xxx", "等待", "等待"], log: ["试图冲击高耗能机密区域，试图拖垮系统算力"], note: "极其常见的网络非法踩点", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "中间件瞬间识别无票据", "等待"], log: ["轻量且无阻的 Edge 脚本立刻做出判断并下令阻断", "直接产生一批 401 报错给请求者打回去"], note: "根本不消耗 Node.js 服务器一丝一毫的珍贵渲染进程", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "后方毫无波澜"], log: ["深处的 route.ts 以及连接数据库的进程连请求的影子都没看到，安然照旧处理正常用户"], note: "这就是极具分化防守策略的企业级架构风采", delayMs: 800 }
      ]
    },
    sources: [{ title: "Middleware", url: "https://nextjs.org/docs/app/building-your-application/routing/middleware" }],
    summary: ["彻底解除了在每一个端点内部重复编写安保和预过滤代码的烦恼", "跑在隔离且极其轻量的异地环境中，不与主应用争夺大算力", "是统筹国际化重定向、全局鉴权以及 A/B 测试的极其强大而恐怖的利器"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-rewrite-redirect",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.5 · API 路由",
    title: "重写（Rewrite）与重定向（Redirect）",
    objectives: ["利用重写技巧解决前端常见的跨域调用以及旧系统改造隐流操作"],
    prerequisites: ["nextjs-api-middleware"],
    concept: "我们都知道把用户跳转走（Redirect），但有一个更加可怕和有用的暗黑魔法叫“重写（Rewrite）”。这往往用在 `next.config.js` 或者 Middleware 中。它的功能是：用户的浏览器看见的依然是 `网址A` 没有跳动改变，但在 Next 服务器底下，它悄悄地把请求打包发送给了 `外部另外的一台机器或者另外一个地址B`。它是完美的掩护所，更是干翻跨域 CORS 和重构老系统最好的桥梁。",
    points: ["Redirect 更改了用户地址栏，属于明面上将人送走", "Rewrite 则是“偷梁换柱”，表面不改色，暗地里向其他目标服务器抽血", "经常用于解决前端直接向别家接口索要数据导致浏览器爆发 CORS (跨域) 拦截错误的问题"],
    memoryHook: "跳是正大光明，写是暗度陈仓",
    files: [{ name: "next.config.js", code: `module.exports = {
  async rewrites() {
    return [
      {
        // 凡是前端代码试图请求 /api/v1/weather 开头的数据时...
        source: '/api/v1/weather/:path*',
        // 实际上 Next 会像个隐形代理一样，替你去向真正的外部气象局地址索要！
        destination: 'https://api.real-weather-corp.com/v1/:path*'
      }
    ]
  }
}` }, { name: "app/page.tsx", code: `'use client';

export default function App() {
  const fetchWeather = async () => {
    // 前端只会以为它请求的是自家的同域端口，完全不会触发浏览器跨域警报！
    const res = await fetch('/api/v1/weather/shanghai');
    const data = await res.json();
    console.log(data);
  }
  return <button onClick={fetchWeather}>获取最新天气</button>
}` }],
    entryFile: "next.config.js",
    answer: {
      type: "prediction",
      prompt: "如果这段前端代码直接去 `fetch('https://api.real-weather-corp.com/v1/shanghai')` 而不使用这层 Rewrite 代理通道。极大概率在浏览器会遭到什么样的灾难？",
      options: [
        { id: "a", label: "能正常运行，因为浏览器是非常开放随和的，不管你在哪拿数据都行", detail: "理想化误判", feedback: "这是新人的错觉，现代浏览器为了防黑客设置了严苛的防御网。" },
        { id: "b", label: "浏览器立刻在控制台爆出一连串红色的由于 CORS 协议（同源跨域政策）引发的阻断报警，并且强行掐断获取数据的路线", detail: "惨绝人寰的跨域墙", feedback: "正确：这种事让所有的初级前端都头疼不已。利用 Rewrite 这种伪装代理是最完美简单的解药。" },
        { id: "c", label: "由于跨域太远，导致拿回来的数据产生丢包破损", detail: "网络玄学", feedback: "这不是丢包，是硬性被安全政策直接截杀。" }
      ],
      answerId: "b",
      correctExplanation: "安全法则（CORS）严格限制一个域名下的脚本不能去肆意扒取另一家域名下的数据。但它防的是“浏览器端”发起动作，如果你是通过你自己的那一台（Next.js）“服务器”去向另一家服务器要数据，这就完全合规且没有任何拦截。Rewrite 机制就是造了一个这样的幻影同伴：前端舒舒服服地向同域名的自己人要数据；Next 接到请求后在后台飞速中转一下替你去真正的地方搬砖并送回来。神不知鬼不觉。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "Rewrite 隐秘穿梭网络", nodes: ["浏览器发起", "Next.js 拦截截流", "伪装成服务器发起", "获取真正宝藏", "原路秘密返回"] },
      lanes: ["前台虚假请求", "后台中转隐秘偷换", "远程目标回应"],
      frames: [
        { activeLane: 0, laneValues: ["安全无虑地调用同域 /api/weather", "等待", "等待"], log: ["浏览器未触发任何跨域警报并且顺利送出需求"], note: "从浏览器的角度看，一切都极其遵纪守法", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "匹配 Config 规则并触发代理接力", "等待"], log: ["Next 服务器察觉匹配", "由它亲自发起请求奔向真正的遥远气象局机房"], note: "服务器与服务器之间通讯是没有那见鬼的 CORS 墙的", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "带回战利品并交付"], log: ["拿到异国他乡的数据", "原路以同域的身份递回给不知情的前端"], note: "完美、高大上的系统重构与通讯黑魔法", delayMs: 800 }
      ]
    },
    sources: [{ title: "Rewrites", url: "https://nextjs.org/docs/app/api-reference/next-config-js/rewrites" }],
    summary: ["极高明地化解困扰了无数人的 CORS（跨域）难题", "在重构旧系统时可以让新老接口做到平滑过渡对前端完全隐形化", "赋予了 Next.js 作为一层反向网关代理核心系统来吞吐调度网络层面的能力"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-cors",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.6 · API 路由",
    title: "CORS (跨源资源共享) 处理",
    objectives: ["学会当你确实想把自己的 API 暴露给其他外部网站合法调用时的解锁方法"],
    prerequisites: ["nextjs-api-rewrite-redirect"],
    concept: "刚刚我们学了用 Rewrite 躲避外部 CORS。但如果角色互换：假如你是造福群众的公共数据源，你真心实意地希望别的域名的网站通过前端能直接通过 AJAX 来调取你的 Next.js API 呢？那就必须要在你自己的 `route.ts` 响应里加上一连串带有魔力的通行证 Header（如 `Access-Control-Allow-Origin`）去告诉他们的浏览器：“这哥们我罩了，放心让他拿吧”。",
    points: ["利用 NextResponse 手工追加特定的许可标头", "可以设立白名单只让指定的伙伴域名畅通无阻", "支持预检（Preflight） OPTIONS 方法响应"],
    memoryHook: "附带绿卡 Header，跨域畅通无阻",
    files: [{ name: "app/api/public-stats/route.ts", code: `export async function GET(request: Request) {
  // 这是你大发善心打算分给全网看的公共接口
  const data = { users: 15432, runningStatus: 'All Green' };
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      // 魔法钥匙：向那个调用此接口的浏览器发放赦免金牌！
      'Access-Control-Allow-Origin': '*', // '*' 代表允许全地球任何人跨域来调取
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 这是个高级货：处理带有试探性质的复杂跨域预检请求
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}` }],
    entryFile: "app/api/public-stats/route.ts",
    answer: {
      type: "prediction",
      prompt: "在这个强力通行证加持下，如果在别人家的网页（如 `https://xiaoming.com`）中执行这段 `fetch('https://你的网站.com/api/public-stats')` 脚本。这套体系是怎么运作而打通任督二脉的？",
      options: [
        { id: "a", label: "小明的浏览器发现跨域立刻阻断并且报错抛出了屏幕", detail: "旧日支配者", feedback: "这是没有加这段绿卡代码之前的黑暗年代。" },
        { id: "b", label: "小明的浏览器先发送并看到回应里带了 `Allow-Origin: *` 这个放行证书，便乖乖地把收缴的数据退还给了小明的 JS 脚本供其展示呈现", detail: "合法解禁", feedback: "正确：这种有秩序和契约保障的互通机制才是互联网资源共享开放协议的基石与典范。" },
        { id: "c", label: "只有在经过小明自己再写一个 Rewrite 才行", detail: "多此一举", feedback: "既然服务端已经放开了枷锁，前端只需最平常不过的原生呼叫即可。" }
      ],
      answerId: "b",
      correctExplanation: "CORS 这个防卫机制很有趣：它的确能阻断拿到结果，但那是由**调用方浏览器**根据安全规则强行把结果拦截掉不给 JS 用。所以当你（服务器）在回应头中注入了那一段特许诏书，相当于给拿货回来的浏览器下达了最高指令：“没关系，是我自己自愿把东西送给跨域的这位兄弟的”，浏览器才会安心放行将其呈上。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "CORS 通行证校验阵列", nodes: ["外来浏览器试探", "获取回应并审计", "检视出赦免头", "解除警报防线", "连通交货"] },
      lanes: ["异域探索请求", "携带证书原路折返", "边防哨所解封"],
      frames: [
        { activeLane: 0, laneValues: ["跨域的前端应用发送获取动作", "等待", "等待"], log: ["浏览器察觉到调用目标是非同源地带"], note: "触发高警备安全护盾协议运作", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "服务端携带特赦令回应", "等待"], log: ["不仅有饱满的 payload 数据", "还附赠了耀眼的 Access-Control-Allow-Origin: * 金色标头"], note: "数据打包回传抵达边境", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "核查通过解封"], log: ["浏览器边防审查这段头文，确认其匹配后", "将其数据完美移交给正在焦急等待的 JS 代码进行呈现"], note: "完成了和谐安全的系统级别交互沟通", delayMs: 800 }
      ]
    },
    sources: [{ title: "CORS", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers#cors" }],
    summary: ["让 Next 系统拥有向整个互联网外部生态极其开放大度提供赋能的心胸", "手动操控极低层级的通信准则，打造真正的开放型 Open-API 中心枢纽", "学会预检和多策略白名单匹配才是真正的高阶架构师体现"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-streaming",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.7 · API 路由",
    title: "流式 API 响应构建",
    objectives: ["掌握利用标准大杀器 ReadableStream 吐出像 ChatGPT 一样的打字机长流效果"],
    prerequisites: ["nextjs-api-request-response"],
    concept: "你是否好奇 ChatGPT 为什么不需要等好几十秒的思考计算，就能立刻一字一句地把答案“源源不断地”推送到你屏幕上？这就是流式传输。在 Next.js 的 API 中，你可以使用 Web 原生的 `ReadableStream`。你不必去等一个巨大的 AI 文本生成完或者上百兆的文件组装完毕，你可以将加工好的“小碎块”通过这个连接通道无间断、一波又一波地向着客户端发射出去。",
    points: ["突破传统后端那种“必须一揽子收集完整数据后再统一发送”的死板行为和极高内存负荷", "使用流管道能在第一毫秒就把最先得到的只言片语送到前线阵地去改善留存", "完美支持 OpenAI 等大模型调用桥接和转发"],
    memoryHook: "不憋大招分段打，细水长流体验佳",
    files: [{ name: "app/api/chat/route.ts", code: `export async function GET() {
  const encoder = new TextEncoder();
  
  // 建立一个能够源源不断往里灌水然后再通往外界的水管（流对象）
  const customStream = new ReadableStream({
    async start(controller) {
      // 模拟一个思考需要很长时间的大语言模型 AI，吐词非常慢
      const words = ["这", "就", "是", "高阶", "流", "式", "输", "出", "的", "魅", "力", "！"];
      
      for (const word of words) {
        await new Promise((r) => setTimeout(r, 400)); // 故意拖慢每一个字的蹦出时间
        // 有货就塞进流管子里发射
        controller.enqueue(encoder.encode(word));
      }
      
      // 所有字挤压完毕，光荣闭闸关闭大门
      controller.close();
    },
  });

  // 直接将这根水管当做数据正文丢回给浏览器接驳
  return new Response(customStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}` }],
    entryFile: "app/api/chat/route.ts",
    answer: {
      type: "prediction",
      prompt: "如果这段代码不用 `ReadableStream` 而是用传统字符串拼凑的方法去把 12 个字用一个巨大的 `delay 5000 毫秒` 后再发出去。两者在客户端浏览器展现的体感会有什么致命的区别？",
      options: [
        { id: "a", label: "没啥区别，总归都要等差不多那么长时间", detail: "时间总量论", feedback: "虽然总耗时相同，但用户的心理感受是截然不同的。" },
        { id: "b", label: "前者在 0.4 秒的时候用户就看到了第一个字并在屏幕上滚动，而后者会让用户盯着白板苦等发呆整整快 5 秒以为网站死机了然后突然一坨糊脸", detail: "渐进式安抚感", feedback: "正确：极其平滑优雅的 TTFB (首字节触达) 呈现方案是留住急性子用户的定海神针。" },
        { id: "c", label: "流传输会丢失掉大量的内容不安全", detail: "玄学抛弃论", feedback: "流是标准的网络分发协议，和丢包毫无关系。" }
      ],
      answerId: "b",
      correctExplanation: "传统的 Response 响应就像是一次性“打包大甩卖”。你必须要把车厢装满了（所有循环执行完）才能发动卡车送货。而 Stream 就像是一条高效永不停止的“传送带”。你在车间里哪怕只做好了第一个螺丝钉，你也能把它扔上带子瞬间送出去被消费。这不仅造就了诸如大模型打字机这种震撼交互，同时也使得后端处理那种极其巨大的几十个 G 的视频读取分发变得可能（不会引发内存超载）。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "无尽喷发涌流传送流", nodes: ["打开流阀门", "生产细微破片", "压入队列管流", "推过网线到达", "即刻前端展示并循环"] },
      lanes: ["服务端碎步产出", "网络通道传输", "前端渐进组装"],
      frames: [
        { activeLane: 0, laneValues: ["引擎开始转动并建立挂起长通道连接", "等待", "等待"], log: ["400ms: 将'这'转码成二进制比特塞进管子推走", "800ms: 塞入'就'并推走"], note: "服务端进入了漫长的劳作但不断释放价值", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "通过长保活连绵不断穿梭网线", "等待"], log: ["网络层不再进行截断，将这串微小的封包陆续抵达终点"], note: "网络利用率达到了极高平滑的分摊水平", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "前端屏幕字字生花"], log: ["用户屏幕：这... 就... 是... 高阶..."], note: "用户目不转睛被吸引，彻底忘记了背后长达几秒的宏观等待流", delayMs: 800 }
      ]
    },
    sources: [{ title: "Streaming", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming" }],
    summary: ["让你能轻易实现诸如 ChatGPT 般的超级魔幻打字出货体验与巨型报表导出体系", "利用标准的系统级底层 Web 标准大幅拓宽了单次响应能应对的极限瓶颈", "降低了内存拥堵引发 OOM 崩溃的高爆雷风险区域"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-api-edge-runtime",
    stageId: "nextjs-api-routes",
    kind: "knowledge",
    eyebrow: "05.8 · API 路由",
    title: "Edge Runtime (边缘运行时)",
    objectives: ["明晰边缘沙盒环境为什么如此快并且理解它的局限"],
    prerequisites: ["nextjs-api-route-handler"],
    concept: "在默认情况下，Next.js 的路由代码在传统且沉重的 Node.js 环境中跑，它需要冷启动时间并且通常集中部署在某个固定地点的机房。而通过极其简明的一句 `export const runtime = 'edge'`，你就可以指令框架把你这个路由的代码编译并发送到部署在“距离用户物理位置最近的”全球边缘化微型沙盒节点网络上去。这让它的启动跟响应快得犹如闪电。",
    points: ["利用更精简快速的 V8 Isolate 沙盒架构来替代臃肿庞大的全量 Node 环境层级", "可以极其变态般地把数据路由接口的迟滞（Latency）干掉好几倍并消灭冷启动痛苦", "因为剥离了赘肉，它没法去访问类似原生 `fs` 文件系统等大量老旧的传统 Node.js 底层类库"],
    memoryHook: "切边缘环境，轻装上阵光速飞",
    files: [{ name: "app/api/geolocation/route.ts", code: `import { NextResponse } from 'next/server';

// 就是这拥有无尽神力的短短一行魔法口诀！
export const runtime = 'edge';

export function GET(request: Request) {
  // 因为这是跑在 Edge 边缘节点上，它本身就能感知到用户是从哪来的！
  // Vercel Edge 提供特殊的标头来告诉我们地理方位
  const country = request.headers.get('x-vercel-ip-country') || '未知外星人';
  
  return NextResponse.json({
    message: \`你好，来自 \${country} 的旅客。\`,
    note: '你刚刚连接的是距离你家最近的几公里外的一台小巧服务器'
  });
}` }],
    entryFile: "app/api/geolocation/route.ts",
    answer: {
      type: "prediction",
      prompt: "在这个被标记了 `runtime = 'edge'` 的接口内部。如果我现在试图在最上面写一行 `import fs from 'fs'` 并企图在下面使用 `fs.readFileSync` 读个系统硬盘文件，会发生什么悲剧？",
      options: [
        { id: "a", label: "能正常运行读出文件", detail: "大杂烩环境", feedback: "Edge 是被阉割提纯后的轻量体系，绝不支持沉重原生操作库。" },
        { id: "b", label: "会在构建或者运行层面产生爆炸性的阻断错误，提示你在这块环境里根本找不到也不允许使用这个 Node.js 特有核心模块", detail: "生态断代防线", feedback: "正确：欲带王冠必承其重，想要光速就必须抛弃累赘。" },
        { id: "c", label: "会自动帮你把文件读成流发回来", detail: "智能包庇", feedback: "系统连底层 fs 相关的权限都没，不可能有流产出。" }
      ],
      answerId: "b",
      correctExplanation: "所谓的 Edge（边缘计算）就是将一套仅仅包含标准 Web API（如 Fetch, Crypto, URL 等）的极微型迷你执行引擎，分散部署到了世界各地数以百计的 CDN 机房内。因为它实在太小了所以根本不需要花好几秒去“冷启动”唤醒它。为了达到这种变态级别的起飞效率，它残忍地砍掉了过去庞杂的整个原生 Node.js 内置生态库支持（这也是为什么要你慎重使用的原因）。"
    },
    execution: {
      visualizer: { type: "nextjs-middleware-chain", title: "边缘算力极速响应体系", nodes: ["用户发出请求", "拦截就近节点", "V8 Isolate 唤醒", "精简代码急速运转", "零毫秒折返抛送"] },
      lanes: ["用户端", "本地州府 CDN 节点", "远端核心母星机房"],
      frames: [
        { activeLane: 0, laneValues: ["位于地球偏远区域的一个访问者发出请求", "等待", "等待"], log: ["请求电波通过光缆试图搜寻路由中转"], note: "这要在以前，可能要横跨太平洋去寻找纽约的部署主机", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "就近 5公里外的小型边缘基站截获了需求", "等待"], log: ["发现该接口为 edge runtime", "立刻在极小的内存区无需冷启光速运行那段代码获取区域特征并瞬间返回报文"], note: "完美化解了网络长途跋涉产生的几百毫秒长延迟灾害", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "被彻底闲置无视"], log: ["母星服务器：什么？有人发过请求吗？完全没到我这儿！"], note: "替核心重型应用层挡掉和处理了极其巨量的轻量边缘算力请求", delayMs: 800 }
      ]
    },
    sources: [{ title: "Edge Runtime", url: "https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes" }],
    summary: ["将轻量运算代码发配到围绕在访客周身的全球就近边缘区网络中予以光速迎击", "抛弃庞大 Node 内置模块后换来的是极其惊艳的无冷启起飞表现", "用在微型接口、区域判定和极高频防抖小逻辑处理是绝顶的最佳实践方案"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-api-gateway",
    stageId: "nextjs-api-routes",
    kind: "stage-project",
    eyebrow: "阶段项目 05 · API 路由",
    title: "企业级高并发 REST 网关枢纽",
    difficulty: "进阶",
    objectives: ["大融合地展现通过 Next 构建极其专业且防弹级别的高级后方重型枢纽系统的能力"],
    prerequisites: ["nextjs-api-route-handler", "nextjs-api-request-response", "nextjs-api-dynamic-routes", "nextjs-api-middleware", "nextjs-api-rewrite-redirect", "nextjs-api-cors", "nextjs-api-streaming", "nextjs-api-edge-runtime"],
    concept: "我们将在一个庞大的结构中，彻底展示 Next.js 这个并非只是前端框架的怪物的重火力实力。我们将架设起带有多重动态鉴权防御并被部署到极速边缘网络层（Edge）的入口检查中间件；针对通过检查的人提供了一个将外部远古天气老平台包裹并通过流式喷涌（Streaming）转译成极具未来感接口的转换服务；并在向外暴漏时优雅地戴上了跨域免检金牌的王冠（CORS）。",
    points: ["将一个看似只配画页面的前端系统华丽扭转成为高耸坚不可摧的底层基座分发中台系统", "全面发挥极具压制力与优雅语法特性的加强版扩展 API 集大成", "兼顾安全、高速响应以及同外部陈旧系统和谐桥接的立体三维打击能力"],
    memoryHook: "防波堤接管一切流，中台枢纽舍我其谁",
    steps: [
      {
        id: "step-1",
        title: "步骤 1：利用 Middleware 实现边缘拦截",
        context: "我们利用 Next.js Middleware 在边缘网络层架设一道凶残的安检，快速拦截不符合条件的请求，保护后方 API。",
        files: [
          { name: "middleware.ts", code: `import { NextRequest, NextResponse } from 'next/server'\n\nexport const config = { matcher: '/api/v2/:path*' }\n\nexport function middleware(req: NextRequest) {\n  // 这是把守外门的第一道凶残安检\n  const isPremium = req.headers.get('x-premium-tier');\n  if (!isPremium) {\n    return NextResponse.json({ error: '穷鬼退散！充值会员解锁高速中转。' }, { status: 403 })\n  }\n  return NextResponse.next();\n}` }
        ],
        entryFile: "middleware.ts",
        question: {
          id: "project-nextjs-api-gateway-step1",
          type: "prediction",
          prompt: "当一个没有 `x-premium-tier` 请求头的非特权请求访问 `/api/v2/transform/1` 时，它会穿透 Middleware 到达实际的 Route Handler 吗？",
          options: [
            { id: "a", label: "会的，Middleware 只能重定向，不能直接返回 JSON", detail: "错误认知", feedback: "Middleware 支持直接返回 Response，包括 JSON。" },
            { id: "b", label: "不会，它会在边缘节点直接收到 403 响应，极大地节省了后方核心服务器的算力", detail: "边缘拦截优势", feedback: "正确：高屋建瓴般的层级过滤阻隔完美挡住了非法穿透。" }
          ],
          answerId: "b",
          correctExplanation: "边缘防御网雷达迅速将异常数据包剔除击飞，极其稳固地保护了后方繁重的重算力模块基座。"
        }
      },
      {
        id: "step-2",
        title: "步骤 2：流式响应与跨域处理",
        context: "针对通过检查的人提供了一个将外部老平台包裹并通过流式喷涌（Streaming）转译成极具未来感接口的转换服务；并在向外暴露时优雅地戴上了跨域免检金牌的王冠（CORS）。",
        files: [
          { name: "app/api/v2/transform/[serviceId]/route.ts", code: `import { NextRequest } from 'next/server';\n\nexport const runtime = 'edge'; // 采用边缘提速起飞特性\n\nexport async function POST(\n  req: NextRequest, \n  { params }: { params: Promise<{ serviceId: string }> }\n) {\n  const { serviceId } = await params;\n  \n  // CORS 特赦头部信息包块\n  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };\n  \n  if(serviceId !== 'weather-legacy') {\n    return new Response('服务不可查明', { status: 404, headers: corsHeaders });\n  }\n\n  // 开始运用流技术，把慢速查询转化并切碎成源源不断快速向外涌出的水管呈现给终端用户\n  const encoder = new TextEncoder();\n  const stream = new ReadableStream({\n    async start(controller) {\n      controller.enqueue(encoder.encode('正在启动深空卫星连线...\\n'));\n      await new Promise(r => setTimeout(r, 1000));\n      controller.enqueue(encoder.encode('连线确立，读取到温度指标为 36°C，极端酷热警报...\\n'));\n      controller.close();\n    }\n  });\n\n  return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });\n}` }
        ],
        entryFile: "app/api/v2/transform/[serviceId]/route.ts",
        question: {
          id: "project-nextjs-api-gateway-step2",
          type: "transfer",
          prompt: "在 `Route Handler` 中我们使用了 `ReadableStream`。如果在没有流的情况下等待慢速外部服务，会有什么缺点？",
          options: [
            { id: "a", label: "请求会在外部服务完全返回前一直挂起，可能导致客户端请求超时或体验极差", detail: "阻塞等待", feedback: "正确：流媒体特性防止了系统在提取缓慢大对象时因长时阻塞引发体验灾难。" },
            { id: "b", label: "Next.js 会自动将它变成流，没什么区别", detail: "错误认知", feedback: "必须手动返回流（如 ReadableStream）才能实现流式响应。" }
          ],
          answerId: "a",
          correctExplanation: "不仅做到了分层剥离处理、异构数据转换还一并在 Edge 最前端化解了高并冲击，这就是现代网关的中台枢纽能力。"
        }
      }
    ],
    sources: [{ title: "Routing: Route Handlers", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers" }],
    summary: ["颠覆性地重新用极简哲学定义了如何开发安全强健高可用的后端网关基建", "把以前极其分散甚至分化成好几门独立课程的东西打包成了一个完美融洽的文件箱体系", "这为你进军具备极高架构素养和中台大局视野铺就了康庄坦途"]
  })
];
