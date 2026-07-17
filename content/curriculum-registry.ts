import type { CourseId, CourseSpec } from "../lib/curriculum/types";
import { curriculum } from "./curriculum";
import { nextjsCurriculum } from "./curriculum-nextjs";

export const nodejsCourse = {
  id: "nodejs",
  title: "Node.js",
  description: "从 JavaScript 基础到生产工程，系统建立 Node.js 运行时心智模型。",
  icon: "⬢",
  stages: curriculum
} as const satisfies CourseSpec;

export const nextjsCourse = {
  id: "nextjs",
  title: "Next.js",
  description: "从 App Router 到全栈部署，掌握现代 React 服务端框架。",
  icon: "▲",
  stages: nextjsCurriculum
} as const satisfies CourseSpec;

export const allCourses = [nodejsCourse, nextjsCourse] as const satisfies readonly CourseSpec[];

export function getCourse(courseId: CourseId): CourseSpec {
  const course = allCourses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`未知课程：${courseId}`);
  }

  return course;
}
