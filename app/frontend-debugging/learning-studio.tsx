"use client";

import { CourseLearningStudio } from "../_components/learning-studio";
import { getCourse } from "@/content/curriculum-registry";
import { frontendDebuggingPublishedLessons } from "@/content/lesson-registry";

export function FrontendDebuggingLearningStudio() {
  const course = getCourse("frontend-debugging");

  return (
    <CourseLearningStudio
      config={{
        courseId: "frontend-debugging",
        courseTitle: "前端报错调试",
        sidebarTitle: "前端调试路线",
        codeLabel: "前端调试案例代码",
        terminalCommand: "npm run dev",
        terminalPrefix: () => "$ npm run dev",
        routeLabel: "前端报错调试",
        curriculum: course.stages,
        publishedLessons: [...frontendDebuggingPublishedLessons],
        finalProjectTitle: "前端故障诊断工作台",
        finalProjectTags: "Console · Stack Trace · Network · Recovery",
        peerCourse: { id: "nextjs", title: "Next.js", href: "/nextjs" },
        switchCourseHref: "/nextjs",
        switchCourseLabel: "切换到 Next.js"
      } as never}
    />
  );
}
