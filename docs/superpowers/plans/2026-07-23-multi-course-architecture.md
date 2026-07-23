# NodePath 多课程架构改造实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将当前仅面向 Node.js / Next.js 的课程模型升级为可承载多学院、多路线的课程架构，同时保持现有 `/nodejs` 与 `/nextjs` 路线完全可用。

**架构：** 本计划只做第二阶段“多课程架构改造”，不实现前端报错调试样板路线。核心策略是先扩展 `CourseSpec` 元数据和注册表能力，再让首页、校验器、课程访问函数消费统一注册表。现有课程数据保持原样，新增字段通过兼容方式补齐，避免重写已发布题库。

**技术栈：** Next.js 16.2.10 App Router、React 19、TypeScript、Node.js `tsx --test`、ESLint。

---

## 规格来源

- `docs/superpowers/specs/2026-07-23-nodepath-programming-learning-blueprint-design.md`
- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARTICHECTURE.md`
- `session-handoff.md`

执行本计划前必须阅读 Next.js 16 本地文档：

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`

## 文件结构

### 修改文件

- `lib/curriculum/types.ts`
  - 增加课程学院、路线、成熟度、运行舱能力等类型。
  - 保持 `CourseId` 兼容现有 `"nodejs" | "nextjs"`，但允许后续新增路线。

- `content/curriculum-registry.ts`
  - 为 Node.js / Next.js 补齐 `domain`、`track`、`routeHref`、`status`、`capabilities` 等元数据。
  - 导出 `courseDomains`、`getCoursesByDomain()`、`getCourseByRouteHref()`。

- `content/lesson-registry.ts`
  - 将 `getLessonsByCourse()` 参数改为通用 `CourseId`。
  - 使用显式 map 管理现有路线，避免后续继续堆三元表达式。

- `lib/curriculum/validate.ts`
  - 增加多课程元数据校验。
  - 保持 Node.js 11 阶段、Next.js 10 阶段的特殊约束。

- `scripts/validate-curriculum.ts`
  - 使用多课程注册表动态汇总课程和题量。
  - 不再硬编码只统计 Node.js 与 Next.js 的题量输出。

- `app/page.tsx`
  - 首页课程卡片改为从 `allCourses` 渲染。
  - 添加学院分组信号，但首屏仍是实际课程入口。

- `docs/PRODUCT.md`
  - 记录 NodePath 正在升级为多学院、多路线学习平台。

- `docs/ARTICHECTURE.md`
  - 记录多课程注册表、课程元数据、首页消费关系。

- `session-handoff.md`
  - 记录本轮架构改造状态和下一步样板路线。

### 新增测试

- `tests/curriculum/multi-course-architecture.test.ts`
  - 覆盖课程领域、路线元数据、route href、按学院分组和 lesson 注册表。

### 可能修改测试

- `tests/curriculum/course-registry.test.ts`
- `tests/curriculum/validate.test.ts`
- `tests/learning-studio/course-routing.test.ts`

只在现有断言与新注册表结构冲突时修改。

---

## 任务 1：阅读框架文档和确认基线

**文件：**
- 读取：`AGENTS.md`
- 读取：`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- 读取：`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- 读取：`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`

- [ ] **步骤 1：阅读项目规则**

运行：

```bash
sed -n '1,220p' AGENTS.md
```

预期：看到 Next.js `16.2.10` 本地文档阅读要求、保留 `app/layout.tsx` Server Component、文档和注释中文、使用 npm、验证命令。

- [ ] **步骤 2：阅读 Next.js 项目结构文档**

运行：

```bash
sed -n '1,220p' node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md
```

预期：确认 App Router 项目结构、`app` 目录约定和文件角色。

- [ ] **步骤 3：阅读 Server / Client Components 文档**

运行：

```bash
sed -n '1,260p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
```

预期：确认首页 `app/page.tsx` 可继续作为 Server Component，互动状态不放入首页。

- [ ] **步骤 4：阅读 Metadata 文档**

运行：

```bash
sed -n '1,220p' node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
```

预期：本计划不需要修改 metadata；若后续误触 `app/layout.tsx`，仍保持 Server Component。

- [ ] **步骤 5：运行当前课程校验作为基线**

运行：

```bash
npm run validate:curriculum
```

预期：命令通过，输出包含 Node.js 与 Next.js 的课程校验摘要。如果失败，先记录失败文本，不要在本任务修复无关问题。

- [ ] **步骤 6：Commit**

本任务只读文件，不需要提交。

---

## 任务 2：为多课程元数据编写失败测试

**文件：**
- 创建：`tests/curriculum/multi-course-architecture.test.ts`
- 读取：`content/curriculum-registry.ts`
- 读取：`content/lesson-registry.ts`

- [ ] **步骤 1：创建失败测试**

创建 `tests/curriculum/multi-course-architecture.test.ts`：

```ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  allCourses,
  courseDomains,
  getCourse,
  getCourseByRouteHref,
  getCoursesByDomain
} from "@/content/curriculum-registry";
import { getLessonsByCourse } from "@/content/lesson-registry";

test("课程注册表暴露多学院元数据", () => {
  assert.ok(courseDomains.length >= 2);
  assert.ok(courseDomains.some((domain) => domain.id === "server"));
  assert.ok(courseDomains.some((domain) => domain.id === "frontend"));

  const nodejs = getCourse("nodejs");
  const nextjs = getCourse("nextjs");

  assert.equal(nodejs.domainId, "server");
  assert.equal(nodejs.trackId, "nodejs");
  assert.equal(nodejs.routeHref, "/nodejs");
  assert.equal(nodejs.status, "published");
  assert.ok(nodejs.capabilities.includes("ConsoleRuntime"));

  assert.equal(nextjs.domainId, "frontend");
  assert.equal(nextjs.trackId, "nextjs");
  assert.equal(nextjs.routeHref, "/nextjs");
  assert.equal(nextjs.status, "published");
  assert.ok(nextjs.capabilities.includes("MicroBrowser"));
});

test("课程可以按学院和路由查询", () => {
  assert.equal(getCourseByRouteHref("/nodejs").id, "nodejs");
  assert.equal(getCourseByRouteHref("/nextjs").id, "nextjs");
  assert.deepEqual(
    getCoursesByDomain("frontend").map((course) => course.id),
    ["nextjs"]
  );
  assert.deepEqual(
    getCoursesByDomain("server").map((course) => course.id),
    ["nodejs"]
  );
});

test("课程 lessons 通过通用 CourseId 查询", () => {
  for (const course of allCourses) {
    const lessons = getLessonsByCourse(course.id);
    assert.ok(lessons.length > 0, `${course.id} 应有已发布案例`);
    assert.ok(lessons.every((lesson) => typeof lesson.id === "string"));
  }
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts
```

预期：FAIL，TypeScript 或运行时报错，原因是 `courseDomains`、`getCourseByRouteHref`、`getCoursesByDomain`、`domainId`、`trackId`、`routeHref`、`status`、`capabilities` 尚未定义。

- [ ] **步骤 3：Commit**

```bash
git add tests/curriculum/multi-course-architecture.test.ts
git commit -m "test: 增加多课程架构注册表测试"
```

---

## 任务 3：扩展课程类型

**文件：**
- 修改：`lib/curriculum/types.ts`
- 测试：`tests/curriculum/multi-course-architecture.test.ts`

- [ ] **步骤 1：扩展类型定义**

在 `lib/curriculum/types.ts` 中替换和新增相关类型。保留现有字符串值，新增宽松扩展能力：

```ts
export type CourseId = "nodejs" | "nextjs" | (string & {});

export type CourseDomainId =
  | "language"
  | "frontend"
  | "network"
  | "server"
  | "android"
  | "ai-app"
  | "ai-agent"
  | "ai-math"
  | (string & {});

export type CourseTrackId = "nodejs" | "nextjs" | (string & {});

export type CourseStatus = "published" | "preview" | "planned";

export type RuntimeCapability =
  | "ConsoleRuntime"
  | "MicroBrowser"
  | "NetworkTrace"
  | "MemoryStack"
  | "RuntimeTimeline"
  | "IncidentHUD"
  | "AndroidSystemTrace"
  | "AgentTrace"
  | "MathGraphLab"
  | "TransformerVisualizer";

export type CourseDomainSpec = {
  id: CourseDomainId;
  title: string;
  description: string;
  order: number;
};
```

将 `CourseSpec` 扩展为：

```ts
export type CourseSpec = {
  id: CourseId;
  domainId: CourseDomainId;
  trackId: CourseTrackId;
  title: string;
  description: string;
  icon: string;
  routeHref: `/${string}`;
  status: CourseStatus;
  capabilities: readonly RuntimeCapability[];
  stages: readonly CurriculumStage[];
};
```

- [ ] **步骤 2：运行多课程测试验证仍失败在注册表**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts
```

预期：FAIL，错误从类型字段缺失推进到注册表导出或对象字段缺失。

- [ ] **步骤 3：运行类型相关测试**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts tests/curriculum/course-registry.test.ts
```

预期：可能 FAIL，因为 `CourseSpec` 新字段还没补齐。失败内容应指向 `content/curriculum-registry.ts`。

- [ ] **步骤 4：Commit**

```bash
git add lib/curriculum/types.ts
git commit -m "feat: 扩展多课程元数据类型"
```

---

## 任务 4：升级课程注册表

**文件：**
- 修改：`content/curriculum-registry.ts`
- 测试：`tests/curriculum/multi-course-architecture.test.ts`

- [ ] **步骤 1：实现多学院注册表**

将 `content/curriculum-registry.ts` 更新为以下结构：

```ts
import type { CourseDomainId, CourseDomainSpec, CourseId, CourseSpec } from "../lib/curriculum/types";
import { curriculum } from "./curriculum";
import { nextjsCurriculum } from "./curriculum-nextjs";

export const courseDomains = [
  {
    id: "language",
    title: "语言基础学院",
    description: "学习 C、C++、Python、Kotlin、Java 等语言的语法、内存、类型系统和工程基础。",
    order: 0
  },
  {
    id: "frontend",
    title: "前端工程学院",
    description: "学习浏览器、React、Next.js、工程化、性能和前端调试。",
    order: 1
  },
  {
    id: "network",
    title: "计算机网络学院",
    description: "学习 HTTP、TCP/IP、DNS、TLS、缓存、跨域和前后端网络故障。",
    order: 2
  },
  {
    id: "server",
    title: "服务器开发学院",
    description: "学习 API、数据库、缓存、队列、鉴权、监控和生产事故处理。",
    order: 3
  },
  {
    id: "android",
    title: "Android 学院",
    description: "学习 App、Framework、Binder、JNI 和 HAL 开发链路。",
    order: 4
  },
  {
    id: "ai-app",
    title: "AI 应用学院",
    description: "学习 RAG、工具调用、多模态应用、Prompt 工程、评测与安全。",
    order: 5
  },
  {
    id: "ai-agent",
    title: "AI Agent 学院",
    description: "学习 Planner、Memory、Tool Use、多 Agent 协作和失败恢复。",
    order: 6
  },
  {
    id: "ai-math",
    title: "AI 数学学院",
    description: "学习线性代数、概率统计、微积分、优化方法和 Transformer 数学基础。",
    order: 7
  }
] as const satisfies readonly CourseDomainSpec[];

export const nodejsCourse = {
  id: "nodejs",
  domainId: "server",
  trackId: "nodejs",
  title: "Node.js",
  description: "从 JavaScript 基础到生产工程，系统建立 Node.js 运行时心智模型。",
  icon: "⬢",
  routeHref: "/nodejs",
  status: "published",
  capabilities: ["ConsoleRuntime", "MicroBrowser", "RuntimeTimeline", "IncidentHUD"],
  stages: curriculum
} as const satisfies CourseSpec;

export const nextjsCourse = {
  id: "nextjs",
  domainId: "frontend",
  trackId: "nextjs",
  title: "Next.js",
  description: "从 App Router 到全栈部署，掌握现代 React 服务端框架。",
  icon: "▲",
  routeHref: "/nextjs",
  status: "published",
  capabilities: ["ConsoleRuntime", "MicroBrowser", "RuntimeTimeline", "IncidentHUD"],
  stages: nextjsCurriculum
} as const satisfies CourseSpec;

export const allCourses = [nodejsCourse, nextjsCourse] as const satisfies readonly CourseSpec[];

export function getCourse(courseId: CourseId): CourseSpec {
  const course = allCourses.find((item) => item.id === courseId);

  if (!course) {
    throw new Error(`未知课程：${courseId}`);
  }

  return course;
}

export function getCoursesByDomain(domainId: CourseDomainId): CourseSpec[] {
  return allCourses.filter((course) => course.domainId === domainId);
}

export function getCourseByRouteHref(routeHref: string): CourseSpec {
  const course = allCourses.find((item) => item.routeHref === routeHref);

  if (!course) {
    throw new Error(`未知课程路由：${routeHref}`);
  }

  return course;
}
```

- [ ] **步骤 2：运行多课程测试**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts
```

预期：可能仍 FAIL，错误集中在 `getLessonsByCourse(course.id)` 参数类型或 lesson registry。

- [ ] **步骤 3：Commit**

```bash
git add content/curriculum-registry.ts
git commit -m "feat: 升级多课程注册表"
```

---

## 任务 5：改造 lesson 注册表的课程访问

**文件：**
- 修改：`content/lesson-registry.ts`
- 测试：`tests/curriculum/multi-course-architecture.test.ts`

- [ ] **步骤 1：改造 `getLessonsByCourse`**

在 `content/lesson-registry.ts` 中更新类型导入：

```ts
import type { CourseId, LessonSpec } from "../lib/curriculum/types";
```

将底部课程访问替换为：

```ts
const lessonsByCourse = {
  nodejs: publishedLessons,
  nextjs: nextjsPublishedLessons
} as const satisfies Partial<Record<CourseId, readonly LessonSpec[]>>;

export function getLessonsByCourse(courseId: CourseId): LessonSpec[] {
  const lessons = lessonsByCourse[courseId];

  if (!lessons) {
    throw new Error(`未知课程案例集合：${courseId}`);
  }

  return [...lessons];
}
```

- [ ] **步骤 2：运行多课程测试**

运行：

```bash
npm test -- tests/curriculum/multi-course-architecture.test.ts
```

预期：PASS。

- [ ] **步骤 3：运行课程注册相关测试**

运行：

```bash
npm test -- tests/curriculum/course-registry.test.ts tests/curriculum/registry.test.ts
```

预期：PASS。若旧测试依赖精确对象字段数量，更新断言为检查关键字段，而不是反对新增元数据。

- [ ] **步骤 4：Commit**

```bash
git add content/lesson-registry.ts tests/curriculum/course-registry.test.ts tests/curriculum/registry.test.ts
git commit -m "feat: 统一课程案例访问入口"
```

---

## 任务 6：增加多课程校验能力

**文件：**
- 修改：`lib/curriculum/validate.ts`
- 修改：`scripts/validate-curriculum.ts`
- 测试：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：为课程元数据写失败测试**

在 `tests/curriculum/validate.test.ts` 增加：

```ts
import { validateCourseRegistry } from "@/lib/curriculum/validate";

test("validateCourseRegistry 校验课程元数据和路由唯一性", () => {
  const errors = validateCourseRegistry([
    {
      id: "nodejs",
      domainId: "server",
      trackId: "nodejs",
      title: "Node.js",
      description: "Node.js course",
      icon: "⬢",
      routeHref: "/nodejs",
      status: "published",
      capabilities: ["ConsoleRuntime"],
      stages: []
    },
    {
      id: "copy",
      domainId: "server",
      trackId: "copy",
      title: "Copy",
      description: "Duplicate route",
      icon: "C",
      routeHref: "/nodejs",
      status: "planned",
      capabilities: ["ConsoleRuntime"],
      stages: []
    }
  ]);

  assert.ok(errors.some((error) => error.includes("路由重复：/nodejs")));
});
```

如果文件没有 `assert` 导入，增加：

```ts
import assert from "node:assert/strict";
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts
```

预期：FAIL，报错 `validateCourseRegistry` 未导出。

- [ ] **步骤 3：实现 `validateCourseRegistry`**

在 `lib/curriculum/validate.ts` 中增加：

```ts
export function validateCourseRegistry(courses: readonly CourseSpec[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const routeHrefs = new Set<string>();

  for (const course of courses) {
    if (ids.has(course.id)) errors.push(`课程 ID 重复：${course.id}`);
    ids.add(course.id);

    if (!course.domainId) errors.push(`课程 ${course.id} 缺少学院 domainId`);
    if (!course.trackId) errors.push(`课程 ${course.id} 缺少路线 trackId`);
    if (!course.routeHref.startsWith("/")) errors.push(`课程 ${course.id} 路由必须以 / 开头`);
    if (routeHrefs.has(course.routeHref)) errors.push(`课程路由重复：${course.routeHref}`);
    routeHrefs.add(course.routeHref);
    if (course.capabilities.length === 0) errors.push(`课程 ${course.id} 至少需要声明一个运行舱能力`);

    errors.push(...validateCourseCatalog(course));
  }

  return errors;
}
```

- [ ] **步骤 4：更新校验脚本**

将 `scripts/validate-curriculum.ts` 的 errors 初始化改为：

```ts
const errors = [
  ...validateCourseRegistry(allCourses),
  ...allCourses.flatMap((course) => getLessonsByCourse(course.id).flatMap(validateLessonSpec))
];
```

导入增加 `validateCourseRegistry`：

```ts
import {
  validateCourseRegistry,
  validateLessonSpec,
  validateQuestionCoverage
} from "../lib/curriculum/validate";
```

将题量统计改为动态：

```ts
const questionSummaries = allCourses.map((course) => {
  const count = getLessonsByCourse(course.id).reduce((total, lesson) => total + lesson.questions.length, 0);
  return `${course.title} ${count} 道题`;
});
```

输出改为：

```ts
console.log(`题库覆盖：${questionSummaries.join("，")}。`);
```

保留 Node.js / Next.js 的 `validateQuestionCoverage` 规则，后续新增路线时再按课程状态配置覆盖标准。

- [ ] **步骤 5：运行校验测试**

运行：

```bash
npm test -- tests/curriculum/validate.test.ts tests/curriculum/multi-course-architecture.test.ts
```

预期：PASS。

- [ ] **步骤 6：运行课程校验脚本**

运行：

```bash
npm run validate:curriculum
```

预期：PASS，输出课程校验通过和动态题库覆盖摘要。

- [ ] **步骤 7：Commit**

```bash
git add lib/curriculum/validate.ts scripts/validate-curriculum.ts tests/curriculum/validate.test.ts
git commit -m "feat: 增加多课程注册校验"
```

---

## 任务 7：首页改为消费课程注册表

**文件：**
- 修改：`app/page.tsx`
- 可能修改：`app/globals.css`
- 测试：`tests/learning-studio/course-routing.test.ts`

- [ ] **步骤 1：检查现有首页测试**

运行：

```bash
sed -n '1,220p' tests/learning-studio/course-routing.test.ts
```

预期：确认测试如何断言 `/nodejs` 和 `/nextjs` 入口。

- [ ] **步骤 2：改造首页课程渲染**

在 `app/page.tsx` 中导入课程注册表：

```tsx
import { allCourses, courseDomains } from "@/content/curriculum-registry";
```

在组件内部创建学院标题查询：

```tsx
const domainTitleById = new Map(courseDomains.map((domain) => [domain.id, domain.title]));
```

将硬编码的两张 `Link` 卡片替换为：

```tsx
{allCourses.map((course) => (
  <Link href={course.routeHref} className="course-card" id={`course-${course.id}`} key={course.id}>
    <span className="course-card__glow" aria-hidden="true" />
    <span className="course-card__icon">{course.icon}</span>
    <span className="course-card__domain">{domainTitleById.get(course.domainId)}</span>
    <h2 className="course-card__title">{course.title}</h2>
    <p className="course-card__desc">{course.description}</p>
    <div className="course-card__stats">
      <span>{course.stages.length} 个阶段</span>
      <span>·</span>
      <span>{course.stages.reduce((total, stage) => total + stage.lessons.length + 1, 0)} 个目录节点</span>
    </div>
    <span className="course-card__cta">开始学习 <span>→</span></span>
  </Link>
))}
```

注意：如果产品仍要求“已发布案例数”而不是“目录节点”，不要在首页硬算发布数量；改为在 `CourseSpec` 增加可选 `publishedCountLabel`，由注册表显式填写 `"99 个案例"` / `"90 个案例"`。

- [ ] **步骤 3：补充样式**

如果页面需要学院标签样式，在 `app/globals.css` 添加小型标签样式：

```css
.course-card__domain {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
```

实际变量名以当前 CSS 为准；若不存在 `--text-muted`，复用已有课程卡片的弱文本颜色变量，不新增一套大主题。

- [ ] **步骤 4：运行路由测试**

运行：

```bash
npm test -- tests/learning-studio/course-routing.test.ts
```

预期：PASS。若测试检查首页源码中的固定中文描述，改为断言 `course-nodejs`、`course-nextjs`、`/nodejs`、`/nextjs` 仍存在。

- [ ] **步骤 5：Commit**

```bash
git add app/page.tsx app/globals.css tests/learning-studio/course-routing.test.ts
git commit -m "feat: 首页使用多课程注册表"
```

---

## 任务 8：同步产品、架构和交接文档

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品文档**

在 `docs/PRODUCT.md` 的 Product Summary 或 Curriculum Roadmap 附近补充：

```md
NodePath 正在从 Node.js / Next.js 双路线原型升级为多学院、多路线编程学习平台。全站课程蓝图将课程组织为语言基础、前端工程、计算机网络、服务器开发、Android、AI 应用、AI Agent 和 AI 数学八个学院；当前实现仍以 Node.js 和 Next.js 为已发布路线，后续通过统一课程模型逐步接入新路线。
```

- [ ] **步骤 2：更新架构文档**

在 `docs/ARTICHECTURE.md` 的 Module Boundaries 或 Snapshot 附近补充：

```md
`content/curriculum-registry.ts` 现在是多学院、多路线课程注册表，负责导出 `courseDomains`、`allCourses`、`getCourse()`、`getCoursesByDomain()` 和 `getCourseByRouteHref()`。现有 Node.js 与 Next.js 路线通过 `CourseSpec` 声明 `domainId`、`trackId`、`routeHref`、`status` 和运行舱能力，首页和校验脚本都从注册表读取课程元数据。
```

- [ ] **步骤 3：更新交接文档**

在 `session-handoff.md` 顶部或当前工作状态处补充：

```md
本轮完成多课程架构改造：课程类型已支持学院、路线、路由和运行舱能力；注册表支持按学院和路由查询；首页改为消费注册表；课程校验器增加多课程元数据校验。下一步建议按蓝图创建 `frontend-debugging` 前端报错调试样板路线。
```

- [ ] **步骤 4：运行文档空白检查**

运行：

```bash
git diff --check
```

预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add docs/PRODUCT.md docs/ARTICHECTURE.md session-handoff.md
git commit -m "docs: 同步多课程架构状态"
```

---

## 任务 9：全量验证

**文件：**
- 验证：全项目

- [ ] **步骤 1：运行课程校验**

运行：

```bash
npm run validate:curriculum
```

预期：PASS，输出包含 Node.js 与 Next.js 的课程校验通过摘要。

- [ ] **步骤 2：运行测试**

运行：

```bash
npm test
```

预期：PASS。

- [ ] **步骤 3：运行 lint**

运行：

```bash
npm run lint
```

预期：PASS。

- [ ] **步骤 4：运行构建**

运行：

```bash
npm run build
```

预期：PASS。若 Turbopack 因本地端口绑定权限失败，按环境权限要求申请提升权限后重跑。

- [ ] **步骤 5：检查 diff 空白**

运行：

```bash
git diff --check
```

预期：PASS。

- [ ] **步骤 6：最终 Commit**

如果任务 9 只有验证没有文件变更，不需要提交。如果验证过程中修复了问题，提交：

```bash
git add <修复过的文件>
git commit -m "fix: 修复多课程架构验证问题"
```

---

## 自检记录

- 规格覆盖度：覆盖蓝图中的第二阶段架构改造，包括类型、注册表、首页、校验器、文档和验证；样板路线被明确排除到后续计划。
- 红旗词扫描：未发现未完成标记或空泛任务描述。
- 类型一致性：统一使用 `CourseDomainId`、`CourseTrackId`、`CourseStatus`、`RuntimeCapability`、`CourseDomainSpec`、`CourseSpec.domainId`、`CourseSpec.trackId`、`CourseSpec.routeHref`、`CourseSpec.capabilities`。
- 范围控制：不实现真实沙箱、不新增课程内容、不改 Supabase 同步逻辑、不重写现有 Node.js / Next.js 题库。
