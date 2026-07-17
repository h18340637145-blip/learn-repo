"use client";

import { CourseLearningStudio } from "@/app/_components/learning-studio";
import { getCourse } from "@/content/curriculum-registry";
import { nextjsPublishedLessons } from "@/content/lesson-registry";

export function NextjsLearningStudio() {
  const course = getCourse("nextjs");

  return (
    <CourseLearningStudio
      config={{
        courseId: "nextjs",
        courseTitle: "Next.js",
        sidebarTitle: "Next.js 全栈路线",
        codeLabel: "Next.js 案例代码",
        terminalPrefix: () => "$ next dev",
        curriculum: course.stages,
        publishedLessons: [...nextjsPublishedLessons],
        finalProjectTitle: "实时协作任务平台",
        finalProjectTags: "路由 · 渲染 · 数据获取 · Auth · 部署",
        peerCourse: { id: "nodejs", title: "Node.js", href: "/nodejs" }
      }}
    />
  );
}
