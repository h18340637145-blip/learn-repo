"use client";

import { CourseLearningStudio } from "@/app/_components/learning-studio";
import { getCourse } from "@/content/curriculum-registry";
import { publishedLessons } from "@/content/lesson-registry";

export function NodejsLearningStudio() {
  const course = getCourse("nodejs");

  return (
    <CourseLearningStudio
      config={{
        courseId: "nodejs",
        courseTitle: "Node.js",
        sidebarTitle: "Node.js 全栈路线",
        codeLabel: "Node.js 案例代码",
        terminalPrefix: (entryFile) => `$ node ${entryFile}`,
        curriculum: course.stages,
        publishedLessons: [...publishedLessons],
        finalProjectTitle: "实时协作任务平台",
        finalProjectTags: "API · 数据流 · 鉴权 · 测试 · 部署",
        peerCourse: { id: "nextjs", title: "Next.js", href: "/nextjs" }
      }}
    />
  );
}
