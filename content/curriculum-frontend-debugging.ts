import type { CurriculumStage } from "../lib/curriculum/types";

export const frontendDebuggingCurriculum = [
  {
    id: "frontend-debugging-console-stack",
    number: 0,
    title: "浏览器控制台与错误栈",
    summary: "学习从控制台错误、调用栈和业务源码帧定位前端故障第一现场。",
    lessons: [
      {
        id: "frontend-debugging-stack-first-frame",
        title: "读取错误栈的第一现场",
        order: 1,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-error-types",
        title: "区分常见 JavaScript 错误类型",
        order: 2,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-undefined-property",
        title: "定位 undefined 属性访问",
        order: 3,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-promise-rejection",
        title: "识别异步 Promise 报错",
        order: 4,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-source-map",
        title: "从 Source Map 回到源码",
        order: 5,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-console-structure",
        title: "用结构化 console 整理调试信息",
        order: 6,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-data-vs-render",
        title: "判断数据问题还是渲染问题",
        order: 7,
        kind: "knowledge",
        status: "published"
      },
      {
        id: "frontend-debugging-runtime-recovery",
        title: "观察修复后的运行恢复",
        order: 8,
        kind: "knowledge",
        status: "published"
      }
    ],
    project: {
      id: "project-frontend-debugging-product-list",
      title: "修复商品列表白屏事故",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  },
  {
    id: "frontend-debugging-network-requests",
    number: 1,
    title: "Network 请求排障",
    summary: "从请求瀑布流、状态码、Headers、CORS、Cookie、Token 和缓存定位联调故障。",
    lessons: [
      { id: "frontend-debugging-network-requests-lesson-1", title: "请求瀑布流", order: 1, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-2", title: "状态码分层", order: 2, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-3", title: "请求头缺失", order: 3, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-4", title: "响应体解析", order: 4, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-5", title: "CORS 预检失败", order: 5, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-6", title: "Cookie 未携带", order: 6, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-7", title: "Token 过期", order: 7, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-network-requests-lesson-8", title: "缓存误命中", order: 8, kind: "knowledge", status: "published" }
    ],
    project: {
      id: "frontend-debugging-network-requests-project",
      title: "登录接口跨域事故",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  },
  {
    id: "frontend-debugging-react-render",
    number: 2,
    title: "React 渲染问题",
    summary: "定位 state、props、effect、key、memo 和错误边界造成的渲染异常。",
    lessons: [
      { id: "frontend-debugging-react-render-lesson-1", title: "状态未更新", order: 1, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-2", title: "闭包旧值", order: 2, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-3", title: "Effect 无限循环", order: 3, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-4", title: "Key 不稳定", order: 4, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-5", title: "条件渲染空洞", order: 5, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-6", title: "Memo 误用", order: 6, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-7", title: "受控输入异常", order: 7, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-react-render-lesson-8", title: "错误边界恢复", order: 8, kind: "knowledge", status: "published" }
    ],
    project: {
      id: "frontend-debugging-react-render-project",
      title: "修复搜索列表重复渲染",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  },
  {
    id: "frontend-debugging-build-env",
    number: 3,
    title: "构建与环境问题",
    summary: "排查环境变量、构建缓存、依赖版本、Source Map、静态资源和 SSR 边界。",
    lessons: [
      { id: "frontend-debugging-build-env-lesson-1", title: "环境变量缺失", order: 1, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-2", title: "客户端变量前缀", order: 2, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-3", title: "构建产物缓存", order: 3, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-4", title: "依赖版本冲突", order: 4, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-5", title: "Source Map 上传", order: 5, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-6", title: "静态资源路径", order: 6, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-7", title: "SSR 与浏览器 API", order: 7, kind: "knowledge", status: "published" },
      { id: "frontend-debugging-build-env-lesson-8", title: "部署回滚验证", order: 8, kind: "knowledge", status: "published" }
    ],
    project: {
      id: "frontend-debugging-build-env-project",
      title: "修复生产环境配置缺失",
      order: 9,
      kind: "stage-project",
      status: "published"
    }
  }
] as const satisfies readonly CurriculumStage[];
