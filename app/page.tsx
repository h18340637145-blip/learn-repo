import Link from "next/link";
import { KnowledgeNetwork } from "@/components/immersive";

export default function Home() {
  return (
    <div className="course-home">
      <header className="course-hero">
        <div className="course-hero__brand">
          <span className="brand-mark">N<span>_</span></span>
          <span>NodePath</span>
        </div>
        <h1>可视化编程学习平台</h1>
        <p>通过预测、运行和可视化反馈，建立真正可靠的运行时心智模型。选择你的学习路径，开始旅程。</p>
      </header>

      <section className="course-grid" aria-label="学习路径选择">
        <Link href="/nodejs" className="course-card" id="course-nodejs">
          <span className="course-card__glow" aria-hidden="true" />
          <span className="course-card__icon">⬢</span>
          <h2 className="course-card__title">Node.js</h2>
          <p className="course-card__desc">
            从运行时原理到生产工程，系统掌握 Node.js 全栈开发。涵盖模块、异步、HTTP、进程、实时通信、测试与诊断。
          </p>
          <div className="course-card__stats">
            <span>11 个阶段</span>
            <span>·</span>
            <span>92 个案例</span>
          </div>
          <span className="course-card__cta">开始学习 <span>→</span></span>
        </Link>

        <Link href="/nextjs" className="course-card" id="course-nextjs">
          <span className="course-card__glow" aria-hidden="true" />
          <span className="course-card__icon">▲</span>
          <h2 className="course-card__title">Next.js</h2>
          <p className="course-card__desc">
            从 App Router 到全栈部署，掌握 React 服务端框架。涵盖路由、渲染模式、数据获取、认证、数据库与高级模式。
          </p>
          <div className="course-card__stats">
            <span>10 个阶段</span>
            <span>·</span>
            <span>90 个案例</span>
          </div>
          <span className="course-card__cta">开始学习 <span>→</span></span>
        </Link>
      </section>

      <KnowledgeNetwork />

      <footer className="course-footer">
        <p>先预测，再运行。用可视化建立你的心智模型。</p>
      </footer>
    </div>
  );
}
