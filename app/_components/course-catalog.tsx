"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  filterCoursesByTier,
  type FilterTier
} from "@/lib/curriculum/difficulty-tiers";
import type { CourseSpec } from "@/lib/curriculum/types";

export type CourseCatalogItem = {
  course: CourseSpec;
  availability: {
    stageSummary: string;
    caseSummary: string;
    nextActionLabel: string;
  };
};

export type DomainGroup = {
  id: string;
  title: string;
  items: CourseCatalogItem[];
};

const TIER_TABS: { id: FilterTier; label: string; hint: string }[] = [
  { id: "all", label: "全部", hint: "浏览所有课程" },
  { id: "beginner", label: "入门推荐", hint: "从零构建心智模型" },
  { id: "intermediate", label: "进阶挑战", hint: "掌握运行边界" },
  { id: "advanced", label: "实战项目", hint: "面向真实场景" }
];

export function CourseCatalog({ domains }: { domains: DomainGroup[] }) {
  const [tier, setTier] = useState<FilterTier>("all");

  const visibleDomains = useMemo(() => {
    if (tier === "all") return domains;
    return domains
      .map((domain) => {
        const filteredCourses = filterCoursesByTier(
          domain.items.map((item) => item.course),
          tier
        );
        const keepIds = new Set(filteredCourses.map((c) => c.id));
        return {
          ...domain,
          items: domain.items.filter((item) => keepIds.has(item.course.id))
        };
      })
      .filter((domain) => domain.items.length > 0);
  }, [domains, tier]);

  return (
    <>
      <div className="difficulty-filter" role="tablist" aria-label="按难度筛选课程">
        {TIER_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={tier === tab.id}
            className={`difficulty-filter__tab${tier === tab.id ? " active" : ""}`}
            onClick={() => setTier(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tab.hint}</small>
          </button>
        ))}
      </div>

      <section className="course-domain-board" aria-label="学院与学习路线">
        {visibleDomains.length === 0 ? (
          <p className="difficulty-filter__empty">该难度暂无已发布课程内容，敬请期待。</p>
        ) : (
          visibleDomains.map((domain) => (
            <section
              className="course-domain-section"
              key={domain.id}
              aria-label={`${domain.title}路线`}
            >
              <div className="course-domain-heading">
                <span className="kicker">ACADEMY</span>
                <h2>{domain.title}</h2>
              </div>
              <div className="course-grid">
                {domain.items.map(({ course, availability }) => {
                  const statusLabel =
                    course.status === "planned"
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
          ))
        )}
      </section>
    </>
  );
}
