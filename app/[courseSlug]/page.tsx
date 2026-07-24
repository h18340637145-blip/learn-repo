import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AuthStatus } from "@/components/auth/auth-status";
import { allCourses, courseDomains, getCourseBySlug } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";
import { CourseSlugLearningStudio } from "./course-learning-studio";

type CourseOverviewPageProps = {
  params: Promise<{ courseSlug: string }>;
};

export function generateStaticParams() {
  return allCourses
    .filter((course) => !["nodejs", "nextjs", "frontend-debugging"].includes(course.id))
    .map((course) => ({
      courseSlug: course.slug
    }));
}

export async function generateMetadata({ params }: CourseOverviewPageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);

  if (!course) {
    return {
      title: "课程未找到 — NodePath"
    };
  }

  return {
    title: `${course.title} — NodePath 课程路线`,
    description: course.description
  };
}

export default async function CourseOverviewPage({ params }: CourseOverviewPageProps) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);

  if (!course) notFound();

  const domain = courseDomains.find((item) => item.id === course.domainId);
  const publishedLessons = getLessonsByCourse(course.id);
  const hasPlayableLessons = publishedLessons.length > 0;

  if (hasPlayableLessons) {
    return <CourseSlugLearningStudio courseId={course.id} />;
  }

  return (
    <main className="course-overview-page">
      <header className="course-overview-hero">
        <div className="course-overview-topline">
          <Link className="brand" href="/" aria-label="NodePath 首页">
            <span className="brand-mark">N<span>_</span></span>
            <span>NodePath</span>
          </Link>
          <AuthStatus />
        </div>

        <div className="course-overview-kicker">
          <span>{domain?.title ?? "课程路线"}</span>
          <strong>{course.status === "planned" ? "规划中" : course.status === "preview" ? "样板预览" : "已发布"}</strong>
        </div>
        <h1>{course.title}</h1>
        <p>{course.description}</p>

        <div className="course-overview-actions">
          {hasPlayableLessons ? (
            <Link className="course-overview-primary" href={`/${course.slug}`}>
              进入互动学习 <span>→</span>
            </Link>
          ) : (
            <span className="course-overview-primary disabled">互动题库规划中</span>
          )}
          <Link className="course-overview-secondary" href="/">
            返回课程总览
          </Link>
        </div>
      </header>

      <section className="course-overview-panel" aria-label="运行舱方向">
        <span className="kicker">RUNTIME SURFACES</span>
        <h2>这条路线会使用的可视化运行舱</h2>
        <div className="runtime-surface-list">
          {course.runtimeSurfaces.map((surface) => (
            <span key={surface}>{surface}</span>
          ))}
        </div>
      </section>

      <section className="course-overview-panel" aria-label="阶段规划">
        <span className="kicker">LEARNING STAGES</span>
        <h2>阶段内容规划</h2>
        <div className="overview-stage-grid">
          {course.stages.map((stage) => (
            <article className="overview-stage-card" key={stage.id}>
              <span>{String(stage.number).padStart(2, "0")}</span>
              <h3>{stage.title}</h3>
              <p>{stage.summary}</p>
              <ul>
                {stage.lessons.slice(0, 4).map((lesson) => (
                  <li key={lesson.id}>{lesson.title}</li>
                ))}
              </ul>
              <strong>阶段项目：{stage.project.title}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
