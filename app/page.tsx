import Link from "next/link";
import { KnowledgeNetwork } from "@/components/immersive";
import { AuthStatus } from "@/components/auth/auth-status";
import { courseDomains, getCoursesByDomain } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";
import { buildCourseAvailability } from "@/lib/curriculum/course-availability";

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

      <section className="course-domain-board" aria-label="学院与学习路线">
        {courseDomains.map((domain) => {
          const courses = getCoursesByDomain(domain.id);

          if (courses.length === 0) return null;

          return (
            <section className="course-domain-section" key={domain.id} aria-label={`${domain.title}路线`}>
              <div className="course-domain-heading">
                <span className="kicker">ACADEMY</span>
                <h2>{domain.title}</h2>
              </div>
              <div className="course-grid">
                {courses.map((course) => {
                  const availability = buildCourseAvailability(course, getLessonsByCourse(course.id));
                  const statusLabel = course.status === "planned"
                    ? "路线规划"
                    : course.status === "preview"
                      ? "样板预览"
                      : "已发布";

                  return (
                    <Link
                      key={course.id}
                      href={`/${course.slug}`}
                      className={`course-card course-card--${course.status}`}
                      id={`course-${course.id}`}
                    >
                      <span className="course-card__glow" aria-hidden="true" />
                      <span className="course-card__status">{statusLabel}</span>
                      <span className="course-card__icon">{course.icon}</span>
                      <h3 className="course-card__title">{course.title}</h3>
                      <p className="course-card__desc">{course.description}</p>
                      <div className="course-card__stats">
                        <span aria-label="已开放阶段">{availability.stageSummary}</span>
                        <span>·</span>
                        <span aria-label="可玩案例">{availability.caseSummary}</span>
                      </div>
                      <span className="course-card__cta" aria-label="继续学习">
                        {availability.nextActionLabel} <span>→</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <KnowledgeNetwork />

      <footer className="course-footer">
        <p>先预测，再运行。用可视化建立你的心智模型。</p>
      </footer>
    </div>
  );
}
