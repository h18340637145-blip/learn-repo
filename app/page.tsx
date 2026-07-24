import { KnowledgeNetwork } from "@/components/immersive";
import { AuthStatus } from "@/components/auth/auth-status";
import { CourseCatalog, type DomainGroup } from "@/app/_components/course-catalog";
import { courseDomains, getCoursesByDomain } from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";
import { buildCourseAvailability } from "@/lib/curriculum/course-availability";

export default function Home() {
  const domains: DomainGroup[] = courseDomains
    .map((domain) => {
      const courses = getCoursesByDomain(domain.id);
      const items = courses.map((course) => ({
        course,
        availability: buildCourseAvailability(course, getLessonsByCourse(course.id))
      }));
      return { id: domain.id, title: domain.title, items };
    })
    .filter((domain) => domain.items.length > 0);

  return (
    <div className="course-home">
      <header className="course-hero">
        <div style={{ position: "absolute", top: "16px", right: "24px" }}>
          <AuthStatus />
        </div>
        <div className="course-hero__brand">
          <span className="brand-mark">
            N<span>_</span>
          </span>
          <span>NodePath</span>
        </div>
        <h1>可视化编程学习平台</h1>
        <p>通过预测、运行和可视化反馈，建立真正可靠的运行时心智模型。选择你的学习路径，开始旅程。</p>
      </header>

      <CourseCatalog domains={domains} />

      <KnowledgeNetwork />

      <footer className="course-footer">
        <p>先预测，再运行。用可视化建立你的心智模型。</p>
      </footer>
    </div>
  );
}
