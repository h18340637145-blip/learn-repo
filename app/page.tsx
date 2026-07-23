import Link from "next/link";
import { KnowledgeNetwork } from "@/components/immersive";
import { AuthStatus } from "@/components/auth/auth-status";
import { allCourses } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";

export default function Home() {
  return (
    <div className="course-home">
      <header className="course-hero">
        <div style={{ position: 'absolute', top: '16px', right: '24px' }}>
          <AuthStatus />
        </div>
        <div className="course-hero__brand">
          <span className="brand-mark">N<span>_</span></span>
          <span>NodePath</span>
        </div>
        <h1>可视化编程学习平台</h1>
        <p>通过预测、运行和可视化反馈，建立真正可靠的运行时心智模型。选择你的学习路径，开始旅程。</p>
      </header>

      <section className="course-grid" aria-label="学习路径选择">
        {allCourses.map((course) => (
          <Link
            key={course.id}
            href={`/${course.slug}`}
            className="course-card"
            id={`course-${course.id}`}
          >
            <span className="course-card__glow" aria-hidden="true" />
            <span className="course-card__icon">{course.icon}</span>
            <h2 className="course-card__title">{course.title}</h2>
            <p className="course-card__desc">{course.description}</p>
            <div className="course-card__stats">
              <span>{course.stages.length} 个阶段</span>
              <span>·</span>
              <span>{getLessonsByCourse(course.id).length} 个案例</span>
            </div>
            <span className="course-card__cta">
              {course.status === "preview" ? "预览路线" : "开始学习"} <span>→</span>
            </span>
          </Link>
        ))}
      </section>

      <KnowledgeNetwork />

      <footer className="course-footer">
        <p>先预测，再运行。用可视化建立你的心智模型。</p>
      </footer>
    </div>
  );
}
