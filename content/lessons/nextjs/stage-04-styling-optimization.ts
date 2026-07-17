import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageFourStylingOptimizationLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-style-css-modules",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.1 · 样式与优化",
    title: "CSS Modules",
    objectives: ["了解 Next.js 内置的 CSS Modules 支持及其工作原理"],
    prerequisites: ["nextjs-foundations-pages"],
    concept: "CSS Modules 是 Next.js 原生支持的一种样式解决方案。通过使用 `.module.css` 后缀命名你的 CSS 文件，它会自动为你的所有 CSS 类名生成唯一的哈希标识符。这意味着你可以在不同组件中安全地使用相同的类名（如 `.button` 或 `.container`），而完全不用担心全局样式冲突。",
    points: ["文件名必须以 .module.css 结尾", "导入为 JavaScript 对象，属性名为类名", "构建时自动生成形如 `Component_button__abc12` 的唯一类名"],
    memoryHook: "带上 module.css，类名自隔离",
    files: [{ name: "app/Button.module.css", code: `.error {
  color: white;
  background-color: red;
}
.error:hover {
  background-color: darkred;
}` }, { name: "app/Button.tsx", code: `import styles from './Button.module.css';

export default function Button() {
  // 注意，这里的 className 是对象的属性调用
  return <button className={styles.error}>删除项目</button>;
}` }],
    entryFile: "app/Button.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个例子中，渲染出的 `<button>` 在浏览器 DOM 中实际的 `class` 属性最可能是怎样的？",
      options: [
        { id: "a", label: "class=\"error\"", detail: "原样输出", feedback: "这是普通全局 CSS 的行为，会导致冲突。" },
        { id: "b", label: "class=\"Button_error__x7Yz2\"", detail: "哈希生成的唯一类名", feedback: "正确：CSS Modules 自动转换了名称以确保全局唯一。" },
        { id: "c", label: "没有 class 属性，而是变成了内联样式 style=\"color:white...\"", detail: "内联化", feedback: "不是内联，Next.js 会抽离出专门的 CSS 文件。" }
      ],
      answerId: "b",
      correctExplanation: "当你导入 `styles` 对象并访问 `styles.error` 时，打包工具会在背后生成一段由文件名、原始类名和哈希字符串组成的独特名称。这既保留了 CSS 强大的预处理和级联特性，又完美解决了传统项目中永远让人头疼的“命名冲突”难题。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "CSS 打包流程", nodes: ["编写模块", "Webpack 解析", "哈希重命名", "导出 JS 对象", "生成物理 CSS 文件"] },
      lanes: ["解析 CSS", "构建产物", "页面注入"],
      frames: [
        { activeLane: 0, laneValues: ["发现 .module.css 引用", "等待", "等待"], log: ["提取类名 .error", "计算组件和文件哈希串"], note: "构建过程中识别样式规则", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "生成两份资产", "等待"], log: ["生成虚拟映射表 { error: 'Button_error__x7Yz2' } 给 JS 侧使用", "把转换过的真实 CSS 内容投入统一提取池"], note: "JS 代码能借此关联到正确的类名", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "网页呈现"], log: ["独立 CSS 文件被页面 <link> 引用", "React 组件成功映射出加密类名"], note: "完美、安全的样式呈现", delayMs: 800 }
      ]
    },
    sources: [{ title: "CSS Modules", url: "https://nextjs.org/docs/app/building-your-application/styling/css-modules" }],
    summary: ["彻底终结大规模应用中的 CSS 全局污染", "与组件生命周期完美解耦，无需特殊的 Runtime 负担", "Next.js 开箱即用，无需配置 Webpack/Turbopack"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-tailwind",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.2 · 样式与优化",
    title: "Tailwind CSS 集成",
    objectives: ["理解在 Next.js 中首推 Tailwind CSS 作为样式方案的优势"],
    prerequisites: ["nextjs-foundations-pages"],
    concept: "Next.js 官方极其推崇 Tailwind CSS（一种原子化 Utility-First 的样式框架）。它与 Server Components 的结合堪称完美：你不需要在客户端传输巨大的 CSS-in-JS 运行时库；Tailwind 的编译器会在构建时扫描你的所有 TSX 代码，仅提取你实际使用过的类名生成极小体积的全局 CSS 文件。",
    points: ["不依赖 JavaScript 运行时解析样式", "产出的 CSS 文件体积极小（通常只需数 KB）", "天然契合 React 的组件化思想和共置（Colocation）理念"],
    memoryHook: "扫描提取，无痛极速写样式",
    files: [{ name: "tailwind.config.js", code: `module.exports = {
  content: [
    // 告诉 Tailwind 去这些文件里扫描寻找类名
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}` }, { name: "app/page.tsx", code: `export default function AlertBox() {
  return (
    // 使用 Tailwind 实用类进行组合
    <div className="p-4 rounded-lg bg-blue-100 text-blue-900 shadow-md flex items-center justify-between hover:bg-blue-200 transition-colors">
      <span>这是一条系统通知消息。</span>
      <button className="px-3 py-1 bg-white rounded font-bold text-sm">
        知道了
      </button>
    </div>
  );
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "为什么在 Next.js 14+（Server Components 时代）推荐使用 Tailwind 或 CSS Modules，而不是像 styled-components 或 emotion 这样的库？",
      options: [
        { id: "a", label: "因为 Next.js 是由 Tailwind 的作者开发的", detail: "偏好原因", feedback: "不是这个原因。它们是独立的公司。" },
        { id: "b", label: "因为那些 CSS-in-JS 库需要在运行时（浏览器里）注入和计算样式，它们天然地与预渲染的 Server Component 环境冲突", detail: "架构与运行时阻抗", feedback: "正确：Server Components 要求零客户端打包，所以必须用构建时就能抽取出静态 `.css` 文件的样式方案。" },
        { id: "c", label: "因为它们不够美观", detail: "审美原因", feedback: "库之间并没有审美高下之分，这纯粹是架构机制所限。" }
      ],
      answerId: "b",
      correctExplanation: "在 App Router 中，大量代码根本不会发往浏览器。这就导致那些依赖浏览器运行 JS 才能动态算出并插入 `<style>` 标签的框架（传统的 CSS-in-JS）水土不服。Tailwind 和 CSS Modules 则在 Node.js 构建阶段就把所有样式抽成了干净利落的静态文件，是 Server Components 的绝配。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "Tailwind 扫描萃取器", nodes: ["编写 HTML", "内容扫描", "清除未使用类", "生成微型 CSS", "发送给浏览器"] },
      lanes: ["源码定义", "构建萃取", "最终产物"],
      frames: [
        { activeLane: 0, laneValues: ["发现写着 'p-4 bg-blue-100' 的页面文件", "等待", "等待"], log: ["组件层级堆砌出大量简写类"], note: "利用原子类组合千变万化的 UI", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "触发 PostCSS 分析与裁剪", "等待"], log: ["匹配 tailwind.config 中的路径进行文本层面的 regex 搜索", "过滤掉成千上万没用到过的预设类"], note: "构建过程中做大瘦身", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "极简出炉"], log: ["抛出一份极其干练的物理 CSS 文件"], note: "用户手机不必下载一堆用不到的废物 CSS，打开网页速度极快", delayMs: 800 }
      ]
    },
    sources: [{ title: "Tailwind CSS", url: "https://nextjs.org/docs/app/building-your-application/styling/tailwind-css" }],
    summary: ["零运行时负担，不增加 JS Bundle 哪怕一字节", "按需扫描、智能瘦身", "是当前 React 现代前端工程最主流、效率最高的排版组合方案"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-font",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.3 · 样式与优化",
    title: "next/font 字体优化",
    objectives: ["理解内置字体优化机制如何解决 CLS 与加载阻塞问题"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "通常加载网页自定义字体会有两个严重的问题：1. 浏览器需要先读取 CSS 再发网络请求加载字体，拖慢首屏。 2. 字体加载完后页面文字会突然变样或者抖动（CLS）。`next/font` 是系统自带的一个神奇工具。它会在构建时自动把 Google Fonts 等字体文件下载下来，随项目一起作为静态文件分发，并注入预处理机制来完美防抖。",
    points: ["构建阶段自动下载网络字体，无隐私和跨域请求顾虑", "支持 size-adjust 技术，计算后备字体比例消除 CLS 跳跃", "所有请求在自我服务器（或 CDN）就近发出"],
    memoryHook: "本地打包装字体，绝不抖动防闪烁",
    files: [{ name: "app/layout.tsx", code: `import { Inter } from 'next/font/google';

// 声明需要使用的字体集和子集
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 只需要在 body 上挂载它提供的 className，整个应用就全部应用上了
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}` }],
    entryFile: "app/layout.tsx",
    answer: {
      type: "prediction",
      prompt: "部署后的页面运行时，浏览器还会向 `fonts.googleapis.com` 发起网络请求吗？",
      options: [
        { id: "a", label: "会，因为这是一个 Google Font API 接口调用", detail: "传统 Web 引入方式", feedback: "这正是 `next/font` 要解决的痛点。" },
        { id: "b", label: "不会，字体文件在 Next 构建时已被下好，并从同域名的服务器返回", detail: "内化和静态资源化", feedback: "正确：这种“本地化”极大地提升了加载稳定性与首字节性能。" },
        { id: "c", label: "看用户的网络情况，如果 Google 访问慢才切换本地", detail: "降级后备", feedback: "它强制 100% 走你自己的网络资源。" }
      ],
      answerId: "b",
      correctExplanation: "利用 `next/font`，一切关于字体下载的任务都被转移到了你的 `npm run build` 打包时期。Next.js 的编译器会帮你把这些远程字体抓取过来变成内部的 public 静态资源。这样一做，用户就不必在访问你的主域外还要等待额外的 DNS 解析去连谷歌的服务器了。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "内置字体优化", nodes: ["编译阶段", "抓取字体", "注入 CSS 调优", "发布为自有资源", "防抖渲染"] },
      lanes: ["远程截留", "字体对齐计算", "下放浏览器"],
      frames: [
        { activeLane: 0, laneValues: ["发现 Inter 字体导入", "等待", "等待"], log: ["截取原本要写在前端的外部请求链路，放入服务器打包过程"], note: "避免了跨域消耗", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用数学算出宽幅防抖 CSS", "等待"], log: ["自动植入 @font-face 声明并且加入特殊的 size-adjust 后备调参指令"], note: "保证系统默认字体即使先展示，和最终字体的占位面积极度接近", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "无缝衔接"], log: ["无任何网络瀑布链堵塞，排版一锤定音"], note: "用户将感受到没有任何文字跳跃的纵滑体验", delayMs: 800 }
      ]
    },
    sources: [{ title: "Font Optimization", url: "https://nextjs.org/docs/app/building-your-application/optimizing/fonts" }],
    summary: ["用本地代下策略彻底抹杀了第三方请求的安全和速度隐患", "深度介入了 CSS 层面实现了极其高阶的文字无缝替代策略（防 CLS 跳动）", "不仅支持 Google Fonts 还支持本地导入字体文件同样享受待遇"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-image",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.4 · 样式与优化",
    title: "next/image 图片优化",
    objectives: ["掌握内置 Image 组件带来的全自动压缩和响应式切图优势"],
    prerequisites: ["nextjs-foundations-pages"],
    concept: "图片常常占据一个网页 70% 以上的流量体积。如果你在 Next.js 里直接用原生的 `<img>` 标签，就浪费了一个巨大的性能提升机会。`<Image>` 组件是原生的增强版：它会自动提供懒加载，防止布局抖动，并且（最重要的是）它会自动在服务端把图片转换为体积更小、更现代的 WebP 或 AVIF 格式，并根据访问设备的屏幕大小剪裁输出适当的分辨率。",
    points: ["自动格式转换（如 WebP）与响应式裁剪", "必须强制声明 width 和 height 以防布局位移 (CLS)", "不在视口内的图片自动延迟（Lazy）加载"],
    memoryHook: "自动裁剪转 WebP，防抖懒加载齐飞",
    files: [{ name: "app/hero.tsx", code: `import Image from 'next/image'
// 导入本地图片，Next.js 会在构建时探测出它的真实宽高
import profilePic from '../public/me.jpg'

export default function Hero() {
  return (
    <div>
      {/* 对于本地图片，width 和 height 会自动推断，不用手写！ */}
      <Image
        src={profilePic}
        alt="我的个人头像"
        placeholder="blur" // 独占绝活：极速生成的马赛克模糊占位符！
      />
      
      {/* 外部图片网络图片则必须声明尺寸以防网页跳变 */}
      <Image 
        src="https://images.unsplash.com/xxx"
        alt="美丽的风景"
        width={800}
        height={600}
      />
    </div>
  )
}` }],
    entryFile: "app/hero.tsx",
    answer: {
      type: "prediction",
      prompt: "如果一个手机用户访问你的网页，而你原始的图片高达 4K 分辨率（4000x3000），使用 `<Image>` 组件后发给他的图片是什么样的？",
      options: [
        { id: "a", label: "照样下载 4K 图片，只是利用 CSS 把宽拉小到手机屏幕尺寸", detail: "原生的 <img> 表现", feedback: "这极大浪费了流量，Next.js 不会这么笨。" },
        { id: "b", label: "Next 图像优化 API 会在请求时实时根据他的手机宽度截出一张小尺寸、可能转成 WebP 的图返回", detail: "按需响应式分发", feedback: "正确：图片不仅被无损压缩格式，尺寸也针对设备进行了缩容。" },
        { id: "c", label: "因为太大了直接压缩成模糊的占位符交差", detail: "牺牲体验", feedback: "依然会传递清晰图片，只是体积尺寸合理化了。" }
      ],
      answerId: "b",
      correctExplanation: "传统的网页不管你用电脑看还是手机看，图片资源都是那一张。`next/image` 接管了这一切：只要你的图片路过了它的自动优化中间件（默认开启的 API 接口 `/_next/image`），它就会动态帮你识别浏览器的屏幕参数，动态裁切、转格式、加缓存，这是所有前端梦寐以求的傻瓜式巅峰体验！"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "Image 优化引擎", nodes: ["原图源", "请求到来", "判断参数", "处理与转换", "下发小图缓存"] },
      lanes: ["大图托管", "动态中转站", "设备接收"],
      frames: [
        { activeLane: 0, laneValues: ["存在一张 5MB jpg 源文件", "等待", "等待"], log: ["源文件躺在某个外部云盘或者本地 public 文件夹中"], note: "不经处理直接下发会导致网站体验噩梦", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "中间层拦截参数", "等待"], log: ["检测到访问者屏幕 maxWidth 居于 640px 以下，且浏览器支持 webp"], note: "Next 内部的 Sharp 处理器开足马力进行裁切和转码", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "吐出新文件"], log: ["最终下发了一张仅 30KB 的精制图片并存进缓存以备后用"], note: "用微弱的服务端 CPU 算力置换了海量的用户宽带等待体验", delayMs: 800 }
      ]
    },
    sources: [{ title: "Image Optimization", url: "https://nextjs.org/docs/app/building-your-application/optimizing/images" }],
    summary: ["默认防范一切布局跳变导致的核心性能掉分", "用本地处理器动态缩小大图并应用最前卫文件格式", "支持独门的占位符和智能懒加载"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-link",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.5 · 样式与优化",
    title: "next/link 预取优化",
    objectives: ["探究在 Next.js 中用特有的 Link 替代 a 标签的底层逻辑"],
    prerequisites: ["nextjs-foundations-pages"],
    concept: "在传统网页中，点击 `<a href=\"..\">` 会销毁当前页面，并请求全套新文件，体验卡顿。而由于 Next.js 结合了服务端渲染和 SPA。我们必须使用原生的 `<Link>` 组件。它最大的杀手锏是**后台预取（Prefetching）**：当带链接的文字出现在用户屏幕的可视区域时，Next.js 会在后台默默帮你把新页面的布局和部分代码下载好。等你真正点击时，页面就会瞬间（SPA式）切换，快如闪电。",
    points: ["永远用 `<Link href=\"/\">` 替代 `<a href=\"/\">`", "元素进入视口时自动预加载后台数据资源", "无整页重绘实现极其丝滑的客户端路由体验"],
    memoryHook: "只要你看见，我就预先下",
    files: [{ name: "app/navbar.tsx", code: `import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      {/* 这个就是魔法发生的组件 */}
      <Link href="/about" className="font-bold">
        关于我们
      </Link>
      
      {/* 这种普通 a 标签会导致极其恶劣的硬刷新，别用！ */}
      {/* <a href="/about">不好</a> */}
    </nav>
  );
}` }],
    entryFile: "app/navbar.tsx",
    answer: {
      type: "prediction",
      prompt: "如果用户滚轮滑动向下，把一个处于屏幕底部的 `<Link href=\"/dashboard\">` 滚入了他的视线（视口）范围内，哪怕他此时根本没有用鼠标去悬浮或者点击它，浏览器底层在干什么？",
      options: [
        { id: "a", label: "什么也不干，为了节省流量", detail: "传统的被动策略", feedback: "对于默认开启预取的组件，它更激进。" },
        { id: "b", label: "Next.js 注入的脚本已经默默发起了发往后台的请求，提前把 Dashboard 的数据取回并存在了内存中", detail: "激进预判抓取", feedback: "正确：这种预判视线并悄悄下载的技术是 Next 带来“瞬间翻页”魔术的核心。" },
        { id: "c", label: "会抛出渲染异常，因为不在首屏", detail: "懒加载误用", feedback: "这是无损性能的前沿应用。" }
      ],
      answerId: "b",
      correctExplanation: "预取（Prefetch）逻辑使得 Next.js 总是先用户一步思考问题。当用户的视线刚刚落在 `Link` 文字之上，连脑子都还没决定是否要点下去的那零点几秒之间；Next.js 的内部路由嗅探脚本已经向服务器打出了密电码，索要并组装好了那份要跳转的数据。因此当你的指尖触碰鼠标按键，页面在几毫秒内就切过去了。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "Prefetching 策略", nodes: ["渲染页面", "监视滚动交汇", "触发低优先级请求", "缓存页面 Payload", "瞬间零秒跳转"] },
      lanes: ["滚动事件", "后台静默下载", "激活重演"],
      frames: [
        { activeLane: 0, laneValues: ["页面包含一堆 Link 并被卷轴滚至呈现区", "等待", "等待"], log: ["Intersection Observer 发现链接出现在视野中"], note: "利用浏览器新特性探知视线所及范围", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用闲时资源下载信息", "等待"], log: ["浏览器底部发起一份请求 fetch('/about') 的 React Payload数据", "并且塞进前端内存 Router Cache 中备用"], note: "神不知鬼不觉的“抢跑”准备工作完毕", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "实现瞬间穿越"], log: ["用户实际按下鼠标一刹那", "不发任何网络请求直接拿已就位的数据替换 DOM"], note: "让用户体验丝滑连贯的 App 级沉浸感", delayMs: 800 }
      ]
    },
    sources: [{ title: "Linking and Navigating", url: "https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#1-prefetching" }],
    summary: ["拦截浏览器的暴力换页，实行 React 层面温柔软替换", "视口探测机制实现了极其无赖又强大的前置拉取", "是提升项目整体丝滑质感的决定性小组件"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-metadata",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.6 · 样式与优化",
    title: "Metadata API (SEO)",
    objectives: ["掌握在 App Router 中极简但却极其强大的 SEO 设置法门"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "过去要设置复杂的 `<title>` 和 `<meta>` 标签你可能需要引入 `next/head` 并像普通组件一样在页面各处乱插。在 App Router 里，Next.js 提供了一套更加工程化和干净的 Metadata API。你只需要在任意的 `page.tsx` 或 `layout.tsx` 里面导出一个名为 `metadata` 的常量对象（静态）或者 `generateMetadata` 函数（动态），构建工具会自动将其转化为标准 `<head>` 中的属性，供搜索引擎爬取。",
    points: ["export const metadata = {} 实现静态标题", "export async function generateMetadata() 基于异步数据拼装动态描述", "子层路由的定义会自动继承或者优雅覆盖外层父级布局的定义"],
    memoryHook: "导出一个名，头签自动生",
    files: [{ name: "app/layout.tsx", code: `import { Metadata } from 'next';

export const metadata: Metadata = {
  // 这套极其智能的标题模版能让你之后的子页面少写很多累赘后缀
  title: {
    template: '%s | NodePath 极客工场',
    default: 'NodePath 极客工场 - 全栈布道师',
  },
  description: '全网首屈一指的硬核编程实验站。',
};

export default function RootLayout({ children }: any) {
  return <html><body>{children}</body></html>;
}` }, { name: "app/blog/[slug]/page.tsx", code: `import { Metadata } from 'next';

// 这是一个极其关键的高级动态生成函数
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  // 返回的对象将被用来拼装 SEO 数据
  return {
    title: post.title, 
    // 上面会自动被模板抓去拼接成: "文章标题 | NodePath 极客工场"
    description: post.summary
  };
}

export default function Page() {
  return <article>内容区块...</article>
}` }],
    entryFile: "app/blog/[slug]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "如果一个页面中既有 `layout.tsx` 配置的默认全局 description，然后它的下级子 `page.tsx` 里面又通过 generateMetadata 返回了一个新的 description。最终浏览器收到的 `<head>` 里是哪个描述？",
      options: [
        { id: "a", label: "报错了，因为声明冲突了", detail: "严格检查", feedback: "这是合理的需求，Next.js 内置了解决合并的逻辑。" },
        { id: "b", label: "只有最深层的（最近的一层）page.tsx 里的描述会覆盖并生效输出", detail: "就近覆盖", feedback: "正确：这种“向里就近、向外继承”的树形覆盖原则非常利于分层架构设计。" },
        { id: "c", label: "把两句话用逗号拼接在一起输出", detail: "字符串拼装", feedback: "这不仅毫无意义，而且对 SEO 的收录逻辑是毁灭性的。" }
      ],
      answerId: "b",
      correctExplanation: "Metadata API 的设计是一棵继承树。它不仅完全顺应了你的布局（Layout）结构，还提供了诸如 `%s` 模板拼接这种极其人性的辅助功能。并且，当你在 `generateMetadata` 和主渲染组件中抓取同样的数据（如 `fetchPost`）时，凭借前面学过的去重（Memoization）机制，数据只会被拉一次并复用，不用担心导致两次网络开销。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "元数据聚合生成", nodes: ["布局探寻", "基础设定", "内层动态改写", "模板拼装", "投递到头部"] },
      lanes: ["全局基座", "动态覆盖", "渲染生成"],
      frames: [
        { activeLane: 0, laneValues: ["解析 RootLayout", "等待", "等待"], log: ["提取出默认模板和描述骨架"], note: "保证应用永远不至于处于裸奔无 SEO 状态", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "进入特定 [slug] 页面执行", "等待"], log: ["运行 generateMetadata 发起异步数据库查询", "提取出具体业务所用文字取代了父类的 description 槽位"], note: "满足精细化索引需要", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "构建完成"], log: ["最终在向浏览器发送的流中率先注入 <title>xxx | NodePath 极客工场</title>"], note: "这让爬虫机器人在不解析 JS 的情况下就完美懂了你", delayMs: 800 }
      ]
    },
    sources: [{ title: "Metadata", url: "https://nextjs.org/docs/app/building-your-application/optimizing/metadata" }],
    summary: ["极其精简、基于对象的路由界别 SEO 定义法", "自动应用组件间继承和模板覆盖规则", "完美利用 Fetch 去重机制完成同页面数据共用"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-og-image",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.7 · 样式与优化",
    title: "动态 Open Graph (OG) 图片生成",
    objectives: ["学会使用 @vercel/og 在边缘层极速且自动化生成个性化分享图片"],
    prerequisites: ["nextjs-style-metadata"],
    concept: "你在社交媒体（Twitter，微信等）分享一个网页链接时，下面自动出现的那张展示卡片，就是读取自 OG Image。手动画每一篇文章的宣传图是不现实的。Next.js 引入了 `@vercel/og` 库。利用一种特殊的 `ImageResponse` 返回件，让你竟然能**用写 React HTML/Tailwind 代码的语法，在边缘服务器上瞬间画出一张图片**！",
    points: ["约定文件名为 opengraph-image.tsx 将自动生效为 OG 图", "在服务端将 React 和 Tailwind CSS 转写成图片二进制流", "利用 Edge 边缘网络保证图片渲染只需十几毫秒"],
    memoryHook: "用写网页的手感画图片",
    files: [{ name: "app/blog/[slug]/opengraph-image.tsx", code: `import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 这不是一个普通的页面，它专门拦截推特爬虫抓图的动作！
export default async function Image({ params }: any) {
  const post = await fetchPost(params.slug); // 抓取要绘制的文字
  
  return new ImageResponse(
    (
      // 你在这儿用极其舒服的 JSX 语法来安排画面的元素！
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(to right, #0f172a, #1e293b)',
          color: 'white',
          padding: '80px',
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 'bold' }}>
          {post.title}
        </h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}` }],
    entryFile: "app/blog/[slug]/opengraph-image.tsx",
    answer: {
      type: "prediction",
      prompt: "对于爬虫或者终端用户访问这个 `opengraph-image.tsx` 的路由实体时，它收到的是什么类型的返回格式？",
      options: [
        { id: "a", label: "一段普通的 HTML 文本字符串被附加上了 CSS", detail: "因为长得像 React", feedback: "返回结果已经被彻底变质转换了。" },
        { id: "b", label: "一张完完整整的二进制 `image/png` 格式的图片数据流", detail: "实质物化", feedback: "正确：Vercel 巧妙的 Satori 引擎将底层的 React 虚拟 DOM 实打实地变成了一张标准的图片。" },
        { id: "c", label: "是一个 Canvas JS 画布执行脚本", detail: "前端绘制机制", feedback: "爬虫不执行复杂的 JS，因此它必定是已经成型的静态图片体。" }
      ],
      answerId: "b",
      correctExplanation: "这不仅解决了前端长期以来的痛点（海报动态生成一直是个难题，之前靠无头浏览器截图太笨重缓慢）。得益于 Satori 的底层翻译技术，结合 Next.js 极快的 Edge 环境调度，你只用极其熟悉的排版技术，就能做到百万级动态页面的分享图千人千面、极速成型。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "OG Image 动态图床", nodes: ["社交平台分享", "抓取 OG 链接", "触发 Edge 绘图", "Satori 转换逻辑", "PNG 输出返回"] },
      lanes: ["推特机器人爬取", "中间层瞬间排版", "输出呈现"],
      frames: [
        { activeLane: 0, laneValues: ["机器人顺藤摸瓜访问 OG 链接", "等待", "等待"], log: ["发现特殊的文件约定：opengraph-image.tsx"], note: "探测到了动态绘图的入口程序", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用 React 语法构建骨架参数", "等待"], log: ["Satori 引擎根据你写入的 HTML/CSS 开始光栅化", "将文字内容、排版比例锁定并翻译"], note: "一切工作均发生在边缘服务器的高速进程中", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "发送结果流"], log: ["转化成标准的 buffer: image/png 并随 Response 输出"], note: "一张带有标题的独一无二海报就这么轻巧降生了", delayMs: 800 }
      ]
    },
    sources: [{ title: "Metadata Files: opengraph-image and twitter-image", url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image" }],
    summary: ["前所未有的工程体验：使用 UI 组件心智制作矢量分享图", "极大程度丰富了所有包含独立状态和数据的动态页面的社交可传播性", "运行于边缘计算层面，快、省、安全"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-style-bundle",
    stageId: "nextjs-styling-optimization",
    kind: "knowledge",
    eyebrow: "04.8 · 样式与优化",
    title: "Bundle 分析与第三方包体积优化",
    objectives: ["学会在部署前控制和诊断应用臃肿问题，应用懒加载方案"],
    prerequisites: ["nextjs-rendering-sc-vs-cc"],
    concept: "即便你运用了以上所有技术，如果不小心在 Client Component 里引入了一个庞大的第三方库（比如一整个 `lodash` 或者巨型图表库），你的浏览器首屏速度照样会完蛋。使用 `@next/bundle-analyzer` 插件可以以可视化的形式检视你哪块包超标了，并且利用 `next/dynamic`（动态导入工具）来强制这些无关紧要的巨大块脱离主进程并在需要时再“懒加载”进来。",
    points: ["Server Component 中的库体积不计入浏览器下载开销，仅有 Client 才会", "通过可视化图谱精准拔除巨大的无用依赖", "利用 next/dynamic() 切割包并在交互时才去加载它"],
    memoryHook: "切大块，懒加载，体积轻",
    files: [{ name: "next.config.js", code: `const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})` }, { name: "app/chart.tsx", code: `'use client';
import dynamic from 'next/dynamic';

// 图表库通常极其庞大 (比如 500kb+)
// 如果不这么做，用户进网页必须先下完 500kb 才能看到内容
const HeavyChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart), 
  { 
    ssr: false, // 纯前端依赖的东西往往不能 SSR
    loading: () => <p>加载重量级图表中...</p> 
  }
);

export default function Analytics() {
  return <HeavyChart data={[...]} />
}` }],
    entryFile: "app/chart.tsx",
    answer: {
      type: "prediction",
      prompt: "对于使用了 `dynamic(..., {ssr: false})` 的这个巨大图表组件，它在 Next.js 服务端生成 HTML 的阶段会做些什么？",
      options: [
        { id: "a", label: "照样在服务端把它渲染出来并生成巨大的 HTML 树", detail: "因为默认是服务端框架", feedback: "ssr: false 参数阻断了这一行为。" },
        { id: "b", label: "服务器直接无视它并跳过，只向外层输出我们在 loading 方法里返回的骨架提示，等浏览器上线后才加载庞大的 JS 进行真正渲染", detail: "精准剥离挂载点", feedback: "正确：这种切片式加载是挽救巨型模块影响主首屏的核心操作。" },
        { id: "c", label: "报错，因为必须等包下载完", detail: "死锁", feedback: "它利用了 JS 的 Promise 异步模块导入，极其稳妥地延后了资源获取动作。" }
      ],
      answerId: "b",
      correctExplanation: "不是所有的 UI 都有资格参加决定生死体验的“首屏加载争夺战”。当通过 `bundle-analyzer` 诊断出元凶后，使用 `next/dynamic` 并关闭 SSR 就是一种壮士断腕。它相当于告诉系统：这是次级信息，并且极其沉重。主线部队（外层框架、核心文字、轻量组件）不用等它先飞过去；到了那边浏览器再去慢慢通过后勤补给下载这个巨大的库。"
    },
    execution: {
      visualizer: { type: "nextjs-build-output", title: "Bundle 拆解流水线", nodes: ["构建扫描", "识别动态断点", "独立 Chunk 包", "主线极速发送", "按需补给加载"] },
      lanes: ["分离包裹", "首发呈现", "后置挂载"],
      frames: [
        { activeLane: 0, laneValues: ["发现 dynamic() 与 import()", "等待", "等待"], log: ["Webpack/Turbopack 注意到分包标识", "把 recharts 剥离出核心的主 app.js 文件", "将其打包成为单独的 chunk_520.js (500kb)"], note: "保证大头兵不会拖累主力部队", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "服务端快速返回带孔外壳", "等待"], log: ["向外呈现出轻量化极致的小体积包和加载提示语：加载重量级图表中..."], note: "页面 0.1s 闪电开启", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "异步水合补充"], log: ["浏览器独立闲时下载巨大的 chunk", "下载完毕执行挂载覆盖原先的提示语"], note: "体积再大也不影响用户看到网页的第一眼体验", delayMs: 800 }
      ]
    },
    sources: [{ title: "Lazy Loading", url: "https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading" }],
    summary: ["大体积且非刚需首屏模块的免死金牌", "依靠独立生成 chunk 的逻辑实现多线加载互不干扰", "利用仪表盘直观审视打包情况来控制发胖问题"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-portfolio",
    stageId: "nextjs-styling-optimization",
    kind: "stage-project",
    eyebrow: "阶段项目 04 · 样式与优化",
    title: "高分创意作品集网站",
    difficulty: "进阶",
    objectives: ["综上全部性能和样式组件，打造 Google Lighthouse 检测能拿到满分的极客秀板"],
    prerequisites: ["nextjs-style-tailwind", "nextjs-style-font", "nextjs-style-image", "nextjs-style-link", "nextjs-style-metadata", "nextjs-style-og-image", "nextjs-style-bundle"],
    concept: "个人作品展示网站，是前端证明自己水平最好的试金石。它必须：好看、酷炫、极其顺滑、SEO 爆炸、加载飞快。在这个项目中，你将利用 Tailwind 打磨精妙的排版；使用本地 `next/font` 提升格调；给那些高清设计稿截图用上自带优化和懒加载的 `<Image>`；同时别忘了铺上 `metadata` 以及在边缘用 Satori 自动画好一张你在 Twitter 转发时的超大超酷的动态 OG 宣传头图！",
    points: ["不放过任何一个影响 CWV （核心网站指标）细节的极致压榨", "大量利用在构建期间就替你把活干好的无感内置组件工具", "这套组合拳是所有面向 C 端用户的门户应用的必备准则"],
    memoryHook: "全套武装上，跑分一定旺",
    files: [{ name: "app/layout.tsx", code: `import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css'; // 里面是 Tailwind 的引入

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Alex 的高维空间 | 前端魔法师',
  description: '带你领略艺术与代码交织的最前沿实践案例展示区',
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="zh-CN" className={outfit.className}>
      <body className="bg-slate-900 text-slate-100 antialiased selection:bg-cyan-400 selection:text-black">
        {children}
      </body>
    </html>
  )
}` }, { name: "app/page.tsx", code: `import Image from 'next/image';
import Link from 'next/link';
import coverArt from '../public/showcase-1.png';

export default function Portfolio() {
  return (
    <main className="container mx-auto p-12">
      <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-8">
        重塑想象力的边界
      </h1>
      
      <div className="group relative overflow-hidden rounded-2xl shadow-2xl transition-transform hover:-translate-y-2">
        <Image 
          src={coverArt} 
          alt="我的最高杰作：全息操作台"
          placeholder="blur" 
          priority // 首图非常重要，加入优先级标签让它直接加载不要懒惰！
          className="object-cover w-full h-[500px]"
        />
        <div className="absolute bottom-0 w-full p-6 bg-black/60 backdrop-blur-md">
          <Link href="/project/hologram" className="text-xl font-bold hover:text-cyan-300">
            探究实现原理 &rarr;
          </Link>
        </div>
      </div>
    </main>
  )
}` }],
    entryFile: "app/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在 `<Image>` 组件中加入 `priority` 这个属性有什么至关重要的作用？",
      options: [
        { id: "a", label: "这会迫使浏览器忽略图片的格式并以原图形式高清晰加载出来", detail: "放弃优化保真理", feedback: "Next 一定会保持优化，这不是 priority 的功能。" },
        { id: "b", label: "它会撤销掉懒加载机制（Lazy Loading），并为主图注入一个预加载的资源提示（Preload Link），以此来争夺最高的最先加载权力", detail: "破例机制与资源争夺", feedback: "正确：因为它是首屏最大的内容点 (LCP)，如果不给特权依然慢慢懒加载的话会导致核心跑分变低。" },
        { id: "c", label: "它会强制图片在 Node.js 服务端变成二进制流传递出去", detail: "SSR 解析法", feedback: "图片依然是通过外链地址获取的物理资源。" }
      ],
      answerId: "b",
      correctExplanation: "做性能优化讲求有放有收。普通的下面图片确实应该“能多懒加载就多懒”。但是在这个首屏，由于最主要的焦点就是那张 `coverArt` 展示图。如果不加以 `priority` 进行提权，由于 React 和 JS 的解析存在天然的时差，这张图片就会较晚出现从而严重拖累网页性能中极其重要的一环：最大内容绘制时间 (LCP)。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "Lighthouse 打分全景", nodes: ["构建聚合", "极简传输", "快速骨架显现", "主图神速就位", "后台预加载连接"] },
      lanes: ["请求接收并首发", "优先资源火速下放", "平稳后续扩展"],
      frames: [
        { activeLane: 0, laneValues: ["访问首页", "等待", "等待"], log: ["返回由 Tailwind 压缩到极致且带着 Google 防抖字体的轻薄 HTML"], note: "无任何臃肿，FCP (首次内容绘制) 表现极佳", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "发现 Preload与Priority", "等待"], log: ["浏览器被特别告知优先下载经过了优化的那张巨大首图"], note: "主次分明，LCP 分数完美保底", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "后续平稳游玩体验"], log: ["后台开始为那条悬浮在主屏的 Link 进行静默后台下载组件"], note: "整套系统运转顺畅，最终各项分数均呈现一片健康的绿色", delayMs: 800 }
      ]
    },
    sources: [{ title: "Optimizing", url: "https://nextjs.org/docs/app/building-your-application/optimizing" }],
    summary: ["极其周全地武装了所有的前端资产（CSS、字体、图片）以追求最高性能和评分", "将本就十分烦琐费脑的前端优化工作利用约定组件黑盒化处理掉了", "能显著改善开发者生活质量和公司项目产出质量的一套强力体系"]
  })
];
