import type { CourseDomainId, CourseId, CourseSpec } from "../lib/curriculum/types";
import { curriculum } from "./curriculum";
import { frontendDebuggingCurriculum } from "./curriculum-frontend-debugging";
import { nextjsCurriculum } from "./curriculum-nextjs";

const defaultRuntimeSurfaces = ["console", "micro-browser", "runtime-timeline", "incident-hud"] as const;

export const courseDomains = [
  { id: "language", title: "编程语言" },
  { id: "frontend", title: "前端工程" },
  { id: "network", title: "网络协议" },
  { id: "server", title: "服务端工程" },
  { id: "android", title: "Android 系统" },
  { id: "ai-application", title: "AI 应用" },
  { id: "ai-agent", title: "AI Agent" },
  { id: "ai-math", title: "AI 数学" }
] as const satisfies readonly { id: CourseDomainId; title: string }[];

export const nodejsCourse = {
  id: "nodejs",
  domainId: "server",
  slug: "nodejs",
  title: "Node.js",
  description: "从 JavaScript 基础到生产工程，系统建立 Node.js 运行时心智模型。",
  icon: "⬢",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: curriculum
} as const satisfies CourseSpec;

export const nextjsCourse = {
  id: "nextjs",
  domainId: "frontend",
  slug: "nextjs",
  title: "Next.js",
  description: "从 App Router 到全栈部署，掌握现代 React 服务端框架。",
  icon: "▲",
  status: "published",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: nextjsCurriculum
} as const satisfies CourseSpec;

export const frontendDebuggingCourse = {
  id: "frontend-debugging",
  domainId: "frontend",
  slug: "frontend-debugging",
  title: "前端报错调试",
  description: "从控制台、错误栈、Network 和恢复验证中训练真实前端故障定位能力。",
  icon: "⌁",
  status: "preview",
  runtimeSurfaces: defaultRuntimeSurfaces,
  stages: frontendDebuggingCurriculum
} as const satisfies CourseSpec;

export const allCourses = [
  nodejsCourse,
  nextjsCourse,
  frontendDebuggingCourse
] as const satisfies readonly CourseSpec[];

export function getCourse(courseId: CourseId): CourseSpec {
  const course = allCourses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`未知课程：${courseId}`);
  }

  return course;
}

export function getCoursesByDomain(domainId: CourseDomainId): CourseSpec[] {
  return allCourses.filter((course) => course.domainId === domainId);
}
