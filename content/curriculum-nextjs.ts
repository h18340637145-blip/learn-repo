import type { CatalogLesson, CurriculumStage, StageId } from "../lib/curriculum/types";

const publishedIds = new Set([
  "nextjs-foundations-what-is-nextjs",
  "nextjs-foundations-app-router",
  "nextjs-foundations-pages",
  "nextjs-foundations-layouts",
  "nextjs-foundations-server-components",
  "nextjs-foundations-client-components",
  "nextjs-foundations-navigation",
  "nextjs-foundations-config",
  "project-nextjs-homepage"
]);

const lesson = (id: string, title: string, order: number): CatalogLesson => ({
  id,
  title,
  order,
  kind: "knowledge",
  status: publishedIds.has(id) ? "published" : "planned"
});

const project = (id: string, title: string): CatalogLesson => ({
  id,
  title,
  order: 9,
  kind: "stage-project",
  status: publishedIds.has(id) ? "published" : "planned"
});

const stage = (
  id: StageId,
  number: number,
  title: string,
  summary: string,
  entries: readonly [string, string][],
  projectEntry: readonly [string, string]
): CurriculumStage => ({
  id,
  number,
  title,
  summary,
  lessons: entries.map(([lessonId, lessonTitle], index) => lesson(lessonId, lessonTitle, index + 1)),
  project: project(projectEntry[0], projectEntry[1])
});

export const nextjsCurriculum = [
  stage("nextjs-foundations", 0, "Next.js 基础", "认识 React 全栈框架", [
    ["nextjs-foundations-what-is-nextjs", "Next.js 是什么"],
    ["nextjs-foundations-app-router", "App Router 目录结构"],
    ["nextjs-foundations-pages", "页面与路由"],
    ["nextjs-foundations-layouts", "布局与嵌套"],
    ["nextjs-foundations-server-components", "Server Components"],
    ["nextjs-foundations-client-components", "Client Components"],
    ["nextjs-foundations-navigation", "导航与 Link"],
    ["nextjs-foundations-config", "next.config 与环境变量"]
  ], ["project-nextjs-homepage", "个人主页"]),
  stage("nextjs-routing", 1, "路由系统", "掌握文件系统路由", [
    ["nextjs-routing-dynamic", "动态路由 [slug]"],
    ["nextjs-routing-groups", "路由组 (group)"],
    ["nextjs-routing-parallel", "并行路由 @slot"],
    ["nextjs-routing-intercepting", "拦截路由"],
    ["nextjs-routing-loading", "loading.tsx 加载状态"],
    ["nextjs-routing-error", "error.tsx 错误边界"],
    ["nextjs-routing-not-found", "not-found.tsx"],
    ["nextjs-routing-middleware", "middleware.ts 路由中间件"]
  ], ["project-nextjs-blog-nav", "多层博客导航"]),
  stage("nextjs-rendering", 2, "渲染模式", "理解 SSR/SSG/ISR", [
    ["nextjs-rendering-ssr", "服务端渲染 SSR"],
    ["nextjs-rendering-ssg", "静态生成 SSG"],
    ["nextjs-rendering-isr", "增量静态再生 ISR"],
    ["nextjs-rendering-streaming", "Streaming SSR"],
    ["nextjs-rendering-suspense", "Suspense 边界"],
    ["nextjs-rendering-sc-vs-cc", "Server 与 Client 组件边界"],
    ["nextjs-rendering-partial", "部分预渲染 PPR"],
    ["nextjs-rendering-cache", "渲染缓存策略"]
  ], ["project-nextjs-news-aggregator", "新闻聚合器"]),
  stage("nextjs-data-fetching", 3, "数据获取", "服务端数据流", [
    ["nextjs-data-server-fetch", "Server Component fetch"],
    ["nextjs-data-cache", "请求缓存与去重"],
    ["nextjs-data-revalidate", "revalidatePath 与 revalidateTag"],
    ["nextjs-data-server-actions", "Server Actions"],
    ["nextjs-data-form-status", "useFormStatus 与表单状态"],
    ["nextjs-data-action-state", "useActionState"],
    ["nextjs-data-parallel-loading", "并行数据加载"],
    ["nextjs-data-error-handling", "数据获取错误处理"]
  ], ["project-nextjs-task-crud", "任务管理 CRUD"]),
  stage("nextjs-styling-optimization", 4, "样式与优化", "构建高性能页面", [
    ["nextjs-style-css-modules", "CSS Modules"],
    ["nextjs-style-tailwind", "Tailwind CSS 集成"],
    ["nextjs-style-font", "next/font 字体优化"],
    ["nextjs-style-image", "next/image 图片优化"],
    ["nextjs-style-link", "next/link 预取优化"],
    ["nextjs-style-metadata", "Metadata API"],
    ["nextjs-style-og-image", "Open Graph 动态图片"],
    ["nextjs-style-bundle", "Bundle 分析与优化"]
  ], ["project-nextjs-portfolio", "作品集网站"]),
  stage("nextjs-api-routes", 5, "API 路由与中间件", "构建后端接口", [
    ["nextjs-api-route-handler", "Route Handler 基础"],
    ["nextjs-api-request-response", "NextRequest 与 NextResponse"],
    ["nextjs-api-dynamic-routes", "动态 API 路由"],
    ["nextjs-api-middleware", "中间件处理链"],
    ["nextjs-api-rewrite-redirect", "重写与重定向"],
    ["nextjs-api-cors", "CORS 跨域处理"],
    ["nextjs-api-streaming", "流式响应"],
    ["nextjs-api-edge-runtime", "Edge Runtime"]
  ], ["project-nextjs-api-gateway", "REST API 网关"]),
  stage("nextjs-auth-middleware", 6, "认证与会话", "保护应用路由", [
    ["nextjs-auth-concepts", "认证基础概念"],
    ["nextjs-auth-nextauth", "Auth.js 集成"],
    ["nextjs-auth-jwt-session", "JWT 与 Session"],
    ["nextjs-auth-protected-routes", "保护路由"],
    ["nextjs-auth-middleware-guard", "中间件鉴权"],
    ["nextjs-auth-rbac", "基于角色的访问控制"],
    ["nextjs-auth-oauth", "OAuth 社交登录"],
    ["nextjs-auth-security", "安全最佳实践"]
  ], ["project-nextjs-login-system", "用户登录系统"]),
  stage("nextjs-database", 7, "数据库与 ORM", "全栈数据持久化", [
    ["nextjs-db-prisma-setup", "Prisma 初始化"],
    ["nextjs-db-schema-migration", "Schema 与迁移"],
    ["nextjs-db-crud-operations", "CRUD 操作"],
    ["nextjs-db-server-actions-db", "Server Actions + 数据库"],
    ["nextjs-db-transactions", "事务处理"],
    ["nextjs-db-connection-pool", "连接池管理"],
    ["nextjs-db-drizzle", "Drizzle ORM 对比"],
    ["nextjs-db-seed-data", "数据填充与测试"]
  ], ["project-nextjs-guestbook", "全栈留言板"]),
  stage("nextjs-testing-deployment", 8, "测试与部署", "保障质量与上线", [
    ["nextjs-test-unit", "组件单元测试"],
    ["nextjs-test-rtl", "React Testing Library"],
    ["nextjs-test-e2e", "Playwright E2E 测试"],
    ["nextjs-test-api", "API 路由测试"],
    ["nextjs-deploy-vercel", "Vercel 部署"],
    ["nextjs-deploy-env", "环境变量管理"],
    ["nextjs-deploy-preview", "Preview 部署"],
    ["nextjs-deploy-ci", "CI/CD 流水线"]
  ], ["project-nextjs-test-suite", "自动化测试套件"]),
  stage("nextjs-advanced-patterns", 9, "高级模式", "生产级应用架构", [
    ["nextjs-advanced-i18n", "国际化 i18n"],
    ["nextjs-advanced-optimistic", "乐观更新"],
    ["nextjs-advanced-realtime", "实时订阅"],
    ["nextjs-advanced-edge", "Edge 与 Serverless"],
    ["nextjs-advanced-isr-demand", "按需 ISR"],
    ["nextjs-advanced-compose", "组合模式"],
    ["nextjs-advanced-monorepo", "Monorepo 架构"],
    ["nextjs-advanced-performance", "性能调优实战"]
  ], ["project-nextjs-realtime-dashboard", "实时仪表盘"])
] as const satisfies readonly CurriculumStage[];
