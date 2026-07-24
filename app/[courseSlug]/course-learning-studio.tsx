"use client";

import { CourseLearningStudio } from "@/app/_components/learning-studio";
import { getCourse } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";
import type { CourseId } from "@/lib/curriculum/types";

const terminalPrefixes: Partial<Record<CourseId, (entryFile: string) => string>> = {
  python: (entryFile) => `$ python ${entryFile}`,
  network: () => "$ browser network trace",
  "server-engineering": () => "$ curl /api/tasks",
  android: () => "$ adb logcat NodePath:D",
  "ai-application": () => "$ ai-app trace",
  "ai-agent": () => "$ agent run --trace",
  "ai-math": () => "$ math-lab run"
};

const finalProjectTitles: Partial<Record<CourseId, string>> = {
  python: "Python 自动化数据工具箱",
  network: "全链路网络诊断台",
  "server-engineering": "生产级任务服务",
  android: "Android 系统启动诊断器",
  "ai-application": "可信知识库问答系统",
  "ai-agent": "可审查 Agent 工作流",
  "ai-math": "Transformer 数学实验室"
};

const finalProjectTags: Partial<Record<CourseId, string>> = {
  python: "语法 · 数据结构 · 模块 · 异步",
  network: "DNS · TCP · TLS · HTTP · 缓存",
  "server-engineering": "API · 数据库 · 队列 · 观测",
  android: "Lifecycle · Binder · Native · HAL",
  "ai-application": "Prompt · RAG · Tool · Eval",
  "ai-agent": "Observe · Plan · Act · Reflect",
  "ai-math": "Vector · Matrix · Attention · Optimization"
};

export function CourseSlugLearningStudio({ courseId }: { courseId: CourseId }) {
  const course = getCourse(courseId);
  const publishedLessons = getLessonsByCourse(courseId);

  return (
    <CourseLearningStudio
      config={{
        courseId,
        courseTitle: course.title,
        sidebarTitle: `${course.title} 学习路线`,
        codeLabel: `${course.title} 案例代码`,
        terminalPrefix: terminalPrefixes[courseId] ?? (() => "$ nodepath run"),
        curriculum: course.stages,
        publishedLessons,
        finalProjectTitle: finalProjectTitles[courseId] ?? `${course.title} 综合项目`,
        finalProjectTags: finalProjectTags[courseId] ?? "Concept · Trace · Project",
        peerCourse: { id: "nodejs", title: "Node.js", href: "/nodejs" }
      }}
    />
  );
}
