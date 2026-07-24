# 多课程分层学习体验 - 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 实现首页难度筛选 Tab、阶段解锁逻辑、知识点难度标注、学习路径可视化和 Python 阶段 04–10 自动化/脚本课程内容。

**架构：** 在现有多课程注册表基础上扩展 `CourseSpec` 的 `difficultyTiers`，新增阶段解锁纯函数和路径进度计算层；Python 新阶段复用 `lesson-factory` 模式生成标准 `LessonSpec[]`；首页筛选 Tab 为独立 Client Component 包裹。

**技术栈：** Next.js 16 App Router / React 19 / TypeScript / Tailwind CSS v4

---

## 文件清单

### 新建文件

| 文件 | 职责 |
|------|------|
| `lib/curriculum/stage-unlock.ts` | 阶段解锁判定纯函数 |
| `lib/curriculum/path-progress.ts` | 三段路径进度计算纯函数 |
| `lib/curriculum/difficulty-tiers.ts` | 课程难度分层配置与筛选逻辑 |
| `app/_components/difficulty-filter.tsx` | 首页筛选 Tab Client Component |
| `content/lessons/python/stage-04-file-batch.ts` | Python 阶段 04 课程 |
| `content/lessons/python/stage-05-regex-parsing.ts` | Python 阶段 05 课程 |
| `content/lessons/python/stage-06-http-scraping.ts` | Python 阶段 06 课程 |
| `content/lessons/python/stage-07-cli-tools.ts` | Python 阶段 07 课程 |
| `content/lessons/python/stage-08-scheduling.ts` | Python 阶段 08 课程 |
| `content/lessons/python/stage-09-ops-process.ts` | Python 阶段 09 课程 |
| `content/lessons/python/stage-10-automation-pipeline.ts` | Python 阶段 10 课程 |
| `content/lessons/python/python-lesson-factory.ts` | Python 专属课程工厂 |
| `tests/curriculum/stage-unlock.test.ts` | 解锁逻辑测试 |
| `tests/curriculum/path-progress.test.ts` | 路径进度测试 |
| `tests/curriculum/difficulty-tiers.test.ts` | 难度筛选测试 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `lib/curriculum/types.ts` | `LessonSpec.difficulty` 改为 `1 \| 2 \| 3`；`CourseSpec` 新增 `difficultyTiers` |
| `lib/curriculum/view-model.ts` | `RoadmapStage` 新增 `locked` 状态和 `tier` 字段 |
| `lib/curriculum/stage-space.ts` | `StageSpaceNode` 新增 `difficulty` 字段 |
| `content/curriculum-registry.ts` | Python 课程阶段扩展到 10；所有课程新增 `difficultyTiers` |
| `content/lesson-registry.ts` | 注册 Python 阶段 04–10 课程 |
| `content/lessons/lesson-factory.ts` | 默认 difficulty 分配逻辑 |
| `components/learning-space/stage-sidebar.tsx` | 三段分区渲染 + 锁定态 + 路径进度条 |
| `app/page.tsx` | 集成 `DifficultyFilter` 组件 |
| `app/_components/learning-studio.tsx` | 传递解锁状态给 sidebar，锁定阶段拦截答题 |
| `app/globals.css` | 新增筛选 Tab、锁定态和难度星级样式 |

---

## 任务 1：扩展类型定义

**文件：**
- 修改：`lib/curriculum/types.ts`

- [ ] **步骤 1：修改 `LessonSpec.difficulty` 类型**

将 `difficulty: "基础" | "进阶"` 替换为数字难度：

```typescript
difficulty: 1 | 2 | 3;
```

- [ ] **步骤 2：新增 Python 阶段 04–10 的 StageId**

在 `StageId` 类型的 Python 部分追加：

```typescript
| "python-file-batch"
| "python-regex-parsing"
| "python-http-scraping"
| "python-cli-tools"
| "python-scheduling"
| "python-ops-process"
| "python-automation-pipeline"
```

- [ ] **步骤 3：`CourseSpec` 新增 `difficultyTiers`**

```typescript
export type DifficultyTier = "beginner" | "intermediate" | "advanced";

export type CourseSpec = {
  id: CourseId;
  domainId: CourseDomainId;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: CourseStatus;
  runtimeSurfaces: readonly RuntimeSurface[];
  stages: readonly CurriculumStage[];
  difficultyTiers: Record<DifficultyTier, StageId[]>;
};
```

- [ ] **步骤 4：`LessonQuestion.difficulty` 保持兼容**

`LessonQuestion.difficulty` 已经是 `"beginner" | "intermediate" | "advanced"`，保持不变。`LessonSpec.difficulty` 是知识点级别的数字星级，两者共存互不影响。

- [ ] **步骤 5：修复所有 TypeScript 编译错误**

现有课程的 `difficulty: "基础" | "进阶"` 需要全量替换为数字值。在 `lesson-factory.ts` 中统一默认值。

运行：`npx tsc --noEmit 2>&1 | head -50`
逐步修复直到无类型错误。

- [ ] **步骤 6：Commit**

```bash
git add lib/curriculum/types.ts
git commit -m "feat(types): 扩展 difficulty 为数字星级，新增 difficultyTiers 和 Python 阶段 StageId"
```

---

## 任务 2：阶段解锁纯函数

**文件：**
- 创建：`lib/curriculum/stage-unlock.ts`
- 测试：`tests/curriculum/stage-unlock.test.ts`

- [ ] **步骤 1：编写失败的测试**

```typescript
// tests/curriculum/stage-unlock.test.ts
import { describe, it, expect } from "vitest";
import { isStageUnlocked, getUnlockRequirement } from "@/lib/curriculum/stage-unlock";
import type { CurriculumStage } from "@/lib/curriculum/types";
import type { ProgressSnapshot } from "@/lib/progress/types";
import { emptyProgress } from "@/lib/progress/types";

const mockStages: CurriculumStage[] = [
  {
    id: "python-foundations",
    number: 0,
    title: "基础",
    summary: "",
    lessons: Array.from({ length: 8 }, (_, i) => ({
      id: `python-foundations-lesson-${i + 1}`,
      title: `Lesson ${i + 1}`,
      order: i + 1,
      kind: "knowledge" as const,
      status: "published" as const
    })),
    project: { id: "python-foundations-project", title: "Project", order: 9, kind: "stage-project" as const, status: "published" as const }
  },
  {
    id: "python-data-structures",
    number: 1,
    title: "数据结构",
    summary: "",
    lessons: Array.from({ length: 8 }, (_, i) => ({
      id: `python-data-structures-lesson-${i + 1}`,
      title: `Lesson ${i + 1}`,
      order: i + 1,
      kind: "knowledge" as const,
      status: "published" as const
    })),
    project: { id: "python-data-structures-project", title: "Project", order: 9, kind: "stage-project" as const, status: "published" as const }
  }
];

describe("isStageUnlocked", () => {
  it("stage 0 is always unlocked", () => {
    const progress = emptyProgress("python");
    expect(isStageUnlocked(0, progress, mockStages)).toBe(true);
  });

  it("stage 1 is locked when less than 70% of stage 0 lessons completed", () => {
    const progress: ProgressSnapshot = {
      ...emptyProgress("python"),
      completedLessonIds: ["python-foundations-lesson-1", "python-foundations-lesson-2", "python-foundations-lesson-3", "python-foundations-lesson-4", "python-foundations-lesson-5"]
    };
    // 5/8 = 62.5% < 70%
    expect(isStageUnlocked(1, progress, mockStages)).toBe(false);
  });

  it("stage 1 is unlocked when 70% of stage 0 lessons completed", () => {
    const progress: ProgressSnapshot = {
      ...emptyProgress("python"),
      completedLessonIds: ["python-foundations-lesson-1", "python-foundations-lesson-2", "python-foundations-lesson-3", "python-foundations-lesson-4", "python-foundations-lesson-5", "python-foundations-lesson-6"]
    };
    // 6/8 = 75% >= 70%
    expect(isStageUnlocked(1, progress, mockStages)).toBe(true);
  });

  it("stage project completion does not count toward unlock", () => {
    const progress: ProgressSnapshot = {
      ...emptyProgress("python"),
      completedLessonIds: ["python-foundations-lesson-1", "python-foundations-lesson-2", "python-foundations-lesson-3", "python-foundations-lesson-4", "python-foundations-lesson-5"],
      completedProjectIds: ["python-foundations-project"]
    };
    // 5/8 lessons = 62.5%, project doesn't count
    expect(isStageUnlocked(1, progress, mockStages)).toBe(false);
  });
});

describe("getUnlockRequirement", () => {
  it("returns remaining count for locked stage", () => {
    const progress: ProgressSnapshot = {
      ...emptyProgress("python"),
      completedLessonIds: ["python-foundations-lesson-1", "python-foundations-lesson-2"]
    };
    const req = getUnlockRequirement(1, progress, mockStages);
    // need ceil(8 * 0.7) = 6, have 2, remaining = 4
    expect(req).toEqual({ required: 6, completed: 2, remaining: 4 });
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/curriculum/stage-unlock.test.ts`
预期：FAIL，模块不存在

- [ ] **步骤 3：实现解锁函数**

```typescript
// lib/curriculum/stage-unlock.ts
import type { CurriculumStage } from "./types";
import type { ProgressSnapshot } from "../progress/types";

const UNLOCK_THRESHOLD = 0.7;

export function isStageUnlocked(
  stageNumber: number,
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[]
): boolean {
  if (stageNumber <= 0) return true;

  const previousStage = stages.find((s) => s.number === stageNumber - 1);
  if (!previousStage) return true;

  const publishedLessons = previousStage.lessons.filter((l) => l.status === "published");
  if (publishedLessons.length === 0) return true;

  const requiredCount = Math.ceil(publishedLessons.length * UNLOCK_THRESHOLD);
  const completedCount = publishedLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;

  return completedCount >= requiredCount;
}

export type UnlockRequirement = {
  required: number;
  completed: number;
  remaining: number;
};

export function getUnlockRequirement(
  stageNumber: number,
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[]
): UnlockRequirement | null {
  if (stageNumber <= 0) return null;

  const previousStage = stages.find((s) => s.number === stageNumber - 1);
  if (!previousStage) return null;

  const publishedLessons = previousStage.lessons.filter((l) => l.status === "published");
  const required = Math.ceil(publishedLessons.length * UNLOCK_THRESHOLD);
  const completed = publishedLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;

  return { required, completed, remaining: Math.max(0, required - completed) };
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/curriculum/stage-unlock.test.ts`
预期：全部 PASS

- [ ] **步骤 5：Commit**

```bash
git add lib/curriculum/stage-unlock.ts tests/curriculum/stage-unlock.test.ts
git commit -m "feat(unlock): 实现阶段解锁纯函数，70% 知识点门槛"
```

---

## 任务 3：路径进度计算

**文件：**
- 创建：`lib/curriculum/path-progress.ts`
- 测试：`tests/curriculum/path-progress.test.ts`

- [ ] **步骤 1：编写失败的测试**

```typescript
// tests/curriculum/path-progress.test.ts
import { describe, it, expect } from "vitest";
import { buildPathProgress } from "@/lib/curriculum/path-progress";
import type { CurriculumStage, DifficultyTier, StageId } from "@/lib/curriculum/types";
import { emptyProgress } from "@/lib/progress/types";

const mockStages: CurriculumStage[] = Array.from({ length: 4 }, (_, i) => ({
  id: `stage-${i}` as StageId,
  number: i,
  title: `Stage ${i}`,
  summary: "",
  lessons: Array.from({ length: 8 }, (_, j) => ({
    id: `stage-${i}-lesson-${j + 1}`,
    title: `Lesson ${j + 1}`,
    order: j + 1,
    kind: "knowledge" as const,
    status: "published" as const
  })),
  project: { id: `stage-${i}-project`, title: "Project", order: 9, kind: "stage-project" as const, status: "published" as const }
}));

const tiers: Record<DifficultyTier, StageId[]> = {
  beginner: ["stage-0" as StageId, "stage-1" as StageId],
  intermediate: ["stage-2" as StageId],
  advanced: ["stage-3" as StageId]
};

describe("buildPathProgress", () => {
  it("returns 0% for empty progress", () => {
    const result = buildPathProgress(emptyProgress("python"), mockStages, tiers);
    expect(result.beginner).toBe(0);
    expect(result.intermediate).toBe(0);
    expect(result.advanced).toBe(0);
  });

  it("calculates beginner percentage correctly", () => {
    const progress = {
      ...emptyProgress("python"),
      completedLessonIds: Array.from({ length: 8 }, (_, i) => `stage-0-lesson-${i + 1}`)
    };
    // 8 of 16 beginner lessons completed = 50%
    const result = buildPathProgress(progress, mockStages, tiers);
    expect(result.beginner).toBe(50);
  });

  it("includes project completion in percentage", () => {
    const progress = {
      ...emptyProgress("python"),
      completedLessonIds: Array.from({ length: 8 }, (_, i) => `stage-0-lesson-${i + 1}`),
      completedProjectIds: ["stage-0-project"]
    };
    // (8 lessons + 1 project) of (16 lessons + 2 projects) = 9/18 = 50%
    const result = buildPathProgress(progress, mockStages, tiers);
    expect(result.beginner).toBe(50);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/curriculum/path-progress.test.ts`
预期：FAIL

- [ ] **步骤 3：实现路径进度函数**

```typescript
// lib/curriculum/path-progress.ts
import type { CurriculumStage, DifficultyTier, StageId } from "./types";
import type { ProgressSnapshot } from "../progress/types";

export type PathProgress = Record<DifficultyTier, number>;

export function buildPathProgress(
  progress: ProgressSnapshot,
  stages: readonly CurriculumStage[],
  tiers: Record<DifficultyTier, StageId[]>
): PathProgress {
  const completedIds = new Set([...progress.completedLessonIds, ...progress.completedProjectIds]);

  function calcTier(tierStageIds: StageId[]): number {
    const tierStages = stages.filter((s) => tierStageIds.includes(s.id));
    let total = 0;
    let completed = 0;

    for (const stage of tierStages) {
      const publishedItems = [
        ...stage.lessons.filter((l) => l.status === "published"),
        ...(stage.project.status === "published" ? [stage.project] : [])
      ];
      total += publishedItems.length;
      completed += publishedItems.filter((item) => completedIds.has(item.id)).length;
    }

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  return {
    beginner: calcTier(tiers.beginner),
    intermediate: calcTier(tiers.intermediate),
    advanced: calcTier(tiers.advanced)
  };
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/curriculum/path-progress.test.ts`
预期：全部 PASS

- [ ] **步骤 5：Commit**

```bash
git add lib/curriculum/path-progress.ts tests/curriculum/path-progress.test.ts
git commit -m "feat(progress): 实现三段路径进度计算纯函数"
```

---

## 任务 4：难度分层配置与筛选逻辑

**文件：**
- 创建：`lib/curriculum/difficulty-tiers.ts`
- 测试：`tests/curriculum/difficulty-tiers.test.ts`

- [ ] **步骤 1：编写失败的测试**

```typescript
// tests/curriculum/difficulty-tiers.test.ts
import { describe, it, expect } from "vitest";
import { filterCoursesByTier, getDefaultDifficultyTiers } from "@/lib/curriculum/difficulty-tiers";
import type { CourseSpec, DifficultyTier, StageId } from "@/lib/curriculum/types";

describe("getDefaultDifficultyTiers", () => {
  it("assigns stages 0-3 to beginner, 4-7 to intermediate, 8-10 to advanced", () => {
    const stageIds = Array.from({ length: 11 }, (_, i) => `stage-${i}` as StageId);
    const tiers = getDefaultDifficultyTiers(stageIds);
    expect(tiers.beginner).toEqual(stageIds.slice(0, 4));
    expect(tiers.intermediate).toEqual(stageIds.slice(4, 8));
    expect(tiers.advanced).toEqual(stageIds.slice(8, 11));
  });

  it("handles courses with fewer than 4 stages", () => {
    const stageIds = ["s0" as StageId, "s1" as StageId, "s2" as StageId];
    const tiers = getDefaultDifficultyTiers(stageIds);
    expect(tiers.beginner).toEqual(stageIds);
    expect(tiers.intermediate).toEqual([]);
    expect(tiers.advanced).toEqual([]);
  });
});

describe("filterCoursesByTier", () => {
  it("returns all courses for 'all' tier", () => {
    const courses = [{ id: "python" }] as unknown as CourseSpec[];
    expect(filterCoursesByTier(courses, "all")).toEqual(courses);
  });

  it("filters courses that have published stages in the requested tier", () => {
    const course: CourseSpec = {
      id: "python",
      stages: [
        { id: "s0", number: 0, lessons: [{ status: "published" }], project: { status: "published" } },
        { id: "s4", number: 4, lessons: [{ status: "planned" }], project: { status: "planned" } }
      ],
      difficultyTiers: { beginner: ["s0" as StageId], intermediate: ["s4" as StageId], advanced: [] }
    } as unknown as CourseSpec;

    expect(filterCoursesByTier([course], "beginner")).toHaveLength(1);
    expect(filterCoursesByTier([course], "intermediate")).toHaveLength(0);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/curriculum/difficulty-tiers.test.ts`
预期：FAIL

- [ ] **步骤 3：实现筛选逻辑**

```typescript
// lib/curriculum/difficulty-tiers.ts
import type { CourseSpec, DifficultyTier, StageId } from "./types";

export type FilterTier = DifficultyTier | "all";

export function getDefaultDifficultyTiers(
  stageIds: readonly StageId[]
): Record<DifficultyTier, StageId[]> {
  return {
    beginner: stageIds.slice(0, 4) as StageId[],
    intermediate: stageIds.slice(4, 8) as StageId[],
    advanced: stageIds.slice(8) as StageId[]
  };
}

export function filterCoursesByTier(
  courses: readonly CourseSpec[],
  tier: FilterTier
): CourseSpec[] {
  if (tier === "all") return [...courses];

  return courses.filter((course) => {
    const tierStageIds = new Set(course.difficultyTiers[tier]);
    return course.stages.some(
      (stage) =>
        tierStageIds.has(stage.id) &&
        (stage.lessons.some((l) => l.status === "published") || stage.project.status === "published")
    );
  });
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/curriculum/difficulty-tiers.test.ts`
预期：全部 PASS

- [ ] **步骤 5：Commit**

```bash
git add lib/curriculum/difficulty-tiers.ts tests/curriculum/difficulty-tiers.test.ts
git commit -m "feat(tiers): 实现难度分层配置与课程筛选纯函数"
```

---

## 任务 5：修改课程工厂默认难度分配

**文件：**
- 修改：`content/lessons/lesson-factory.ts`

- [ ] **步骤 1：修改 `createLessonSpec` 默认 difficulty 逻辑**

在 `lesson-factory.ts` 中，将 `difficulty` 默认值从字符串改为数字：

```typescript
// 替换原有 difficulty 赋值逻辑
const difficulty = input.difficulty ?? 1;
```

- [ ] **步骤 2：修改所有课程工厂中 difficulty 相关逻辑**

`blueprint-first-stage.ts` 和所有已有工厂中引用 `"基础"` / `"进阶"` 的地方替换为 `1` / `2`。

搜索所有文件：
```bash
grep -rn '"基础"\|"进阶"' content/ lib/ --include="*.ts" | head -30
```

逐一替换。

- [ ] **步骤 3：确保编译通过**

运行：`npx tsc --noEmit`
预期：无错误

- [ ] **步骤 4：Commit**

```bash
git add content/ lib/
git commit -m "refactor(factory): difficulty 字段从中文字符串迁移为数字 1|2|3"
```

---

## 任务 6：Python 课程工厂

**文件：**
- 创建：`content/lessons/python/python-lesson-factory.ts`

- [ ] **步骤 1：创建 Python 专属课程工厂**

```typescript
// content/lessons/python/python-lesson-factory.ts
import { createLessonSpec, type LessonInput } from "../lesson-factory";
import type { LessonSpec, StageId } from "../../../lib/curriculum/types";

export type PythonLessonSeed = {
  id: string;
  stageId: StageId;
  title: string;
  concept: string;
  points: string[];
  memoryHook: string;
  difficulty: 1 | 2 | 3;
  files: { name: string; code: string }[];
  entryFile: string;
  questions: LessonInput["additionalQuestions"];
  execution: LessonInput["execution"];
  summary: string[];
  sourceTitle: string;
  sourceUrl: string;
};

export function createPythonLesson(seed: PythonLessonSeed): LessonSpec {
  return createLessonSpec({
    id: seed.id,
    stageId: seed.stageId,
    eyebrow: "Python 自动化",
    title: seed.title,
    objectives: [`掌握 ${seed.title} 的核心用法`],
    prerequisites: [],
    concept: seed.concept,
    points: seed.points,
    memoryHook: seed.memoryHook,
    difficulty: seed.difficulty,
    nodeVersion: "Python 3.12",
    files: seed.files,
    entryFile: seed.entryFile,
    additionalQuestions: seed.questions,
    execution: seed.execution,
    summary: seed.summary,
    sources: [{ title: seed.sourceTitle, url: seed.sourceUrl }]
  });
}
```

- [ ] **步骤 2：Commit**

```bash
git add content/lessons/python/python-lesson-factory.ts
git commit -m "feat(python): 创建 Python 专属课程工厂"
```

---

## 任务 7：Python 阶段 04 - 文件批处理与路径操作

**文件：**
- 创建：`content/lessons/python/stage-04-file-batch.ts`

- [ ] **步骤 1：实现阶段 04 全部 8 个知识点 + 阶段项目**

每个知识点包含：标题、概念说明、代码案例、≥2 道题（含 prediction + implementation/diagnosis）、authored trace（≥3 帧）、知识总结（≥3 条）、官方来源。

知识点列表：
1. pathlib 路径对象 (difficulty: 1)
2. glob 模式匹配 (difficulty: 1)
3. shutil 文件操作 (difficulty: 1)
4. os.walk 递归遍历 (difficulty: 2)
5. 文件编码与 BOM (difficulty: 2)
6. 临时文件与原子写入 (difficulty: 2)
7. 文件锁与并发安全 (difficulty: 3)
8. 批量操作事务回滚 (difficulty: 3)

阶段项目：CLI 批量重命名工具 (difficulty: 3, ≥3 道题)

完整实现参考 `content/lessons/stage-04-files-streams.ts` 的结构和密度。

- [ ] **步骤 2：验证模块导出**

```bash
npx tsc --noEmit
```

- [ ] **步骤 3：Commit**

```bash
git add content/lessons/python/stage-04-file-batch.ts
git commit -m "feat(python): 阶段 04 文件批处理与路径操作 - 8 知识点 + 项目"
```

---

## 任务 8：Python 阶段 05–07（深入区剩余）

**文件：**
- 创建：`content/lessons/python/stage-05-regex-parsing.ts`
- 创建：`content/lessons/python/stage-06-http-scraping.ts`
- 创建：`content/lessons/python/stage-07-cli-tools.ts`

- [ ] **步骤 1：实现阶段 05 正则表达式与文本解析**

8 知识点 + 阶段项目"日志格式转换器"，按规格中知识点列表实现。

- [ ] **步骤 2：实现阶段 06 HTTP 请求与数据抓取**

8 知识点 + 阶段项目"结构化数据采集脚本"。

- [ ] **步骤 3：实现阶段 07 CLI 工具与参数解析**

8 知识点 + 阶段项目"多功能 CLI 工具箱"。

- [ ] **步骤 4：验证编译**

```bash
npx tsc --noEmit
```

- [ ] **步骤 5：Commit**

```bash
git add content/lessons/python/stage-05-regex-parsing.ts content/lessons/python/stage-06-http-scraping.ts content/lessons/python/stage-07-cli-tools.ts
git commit -m "feat(python): 阶段 05-07 深入区 - 正则/HTTP/CLI 各 8 知识点 + 项目"
```

---

## 任务 9：Python 阶段 08–10（实战区）

**文件：**
- 创建：`content/lessons/python/stage-08-scheduling.ts`
- 创建：`content/lessons/python/stage-09-ops-process.ts`
- 创建：`content/lessons/python/stage-10-automation-pipeline.ts`

- [ ] **步骤 1：实现阶段 08 定时任务与调度**

8 知识点 + 阶段项目"定时监控报警脚本"。

- [ ] **步骤 2：实现阶段 09 系统运维与进程管理**

8 知识点 + 阶段项目"服务健康检查器"。

- [ ] **步骤 3：实现阶段 10 综合自动化项目**

8 知识点 + 阶段项目"自动化部署流水线"。

- [ ] **步骤 4：验证编译**

```bash
npx tsc --noEmit
```

- [ ] **步骤 5：Commit**

```bash
git add content/lessons/python/stage-08-scheduling.ts content/lessons/python/stage-09-ops-process.ts content/lessons/python/stage-10-automation-pipeline.ts
git commit -m "feat(python): 阶段 08-10 实战区 - 调度/运维/自动化各 8 知识点 + 项目"
```

---

## 任务 10：注册 Python 新阶段到课程系统

**文件：**
- 修改：`content/curriculum-registry.ts`
- 修改：`content/lesson-registry.ts`

- [ ] **步骤 1：在 `curriculum-registry.ts` 中扩展 Python 课程阶段**

为 Python 课程添加阶段 04–10 的 `CurriculumStage` 定义，并设置 `difficultyTiers`：

```typescript
difficultyTiers: {
  beginner: ["python-foundations", "python-data-structures", "python-modules-testing", "python-async-services"],
  intermediate: ["python-file-batch", "python-regex-parsing", "python-http-scraping", "python-cli-tools"],
  advanced: ["python-scheduling", "python-ops-process", "python-automation-pipeline"]
}
```

将 Python 课程 `status` 从 `"preview"` 改为 `"published"`。

- [ ] **步骤 2：为所有其他课程添加 `difficultyTiers`**

Node.js、Next.js、前端调试和 7 条蓝图路线都需要新增该字段，使用 `getDefaultDifficultyTiers()` 按阶段编号自动分配。

- [ ] **步骤 3：在 `lesson-registry.ts` 中注册 Python 阶段 04–10**

```typescript
import { pythonStageFourLessons } from "./lessons/python/stage-04-file-batch";
import { pythonStageFiveLessons } from "./lessons/python/stage-05-regex-parsing";
import { pythonStageSixLessons } from "./lessons/python/stage-06-http-scraping";
import { pythonStageSevenLessons } from "./lessons/python/stage-07-cli-tools";
import { pythonStageEightLessons } from "./lessons/python/stage-08-scheduling";
import { pythonStageNineLessons } from "./lessons/python/stage-09-ops-process";
import { pythonStageTenLessons } from "./lessons/python/stage-10-automation-pipeline";
```

在 `getLessonsByCourse("python")` 中聚合新阶段与现有阶段 00–03 的课程。

- [ ] **步骤 4：验证编译和课程校验**

```bash
npx tsc --noEmit
npm run validate:curriculum
```

- [ ] **步骤 5：Commit**

```bash
git add content/curriculum-registry.ts content/lesson-registry.ts
git commit -m "feat(registry): 注册 Python 阶段 04-10，扩展 difficultyTiers 到所有课程"
```

---

## 任务 11：修改 view-model 支持锁定态和难度

**文件：**
- 修改：`lib/curriculum/view-model.ts`
- 修改：`lib/curriculum/stage-space.ts`

- [ ] **步骤 1：`buildRoadmap` 集成解锁逻辑**

```typescript
import { isStageUnlocked, getUnlockRequirement } from "./stage-unlock";

export type RoadmapStage = {
  id: StageId;
  number: number;
  title: string;
  tier: DifficultyTier | null;
  totalLessons: number;
  publishedLessons: number;
  completedLessons: number;
  state: "done" | "active" | "locked" | "planned";
  unlockHint: string | null;
  items: { id: string; title: string; status: "published" | "planned"; difficulty?: 1 | 2 | 3 }[];
};
```

当 `isStageUnlocked()` 返回 `false` 时 `state = "locked"`，并通过 `getUnlockRequirement` 生成 `unlockHint`。

- [ ] **步骤 2：`StageSpaceNode` 新增 difficulty**

在 `stage-space.ts` 中，从 `LessonSpec` 读取 `difficulty` 并传递到 `StageSpaceNode`：

```typescript
export type StageSpaceNode = {
  // ...existing fields
  difficulty: 1 | 2 | 3;
};
```

- [ ] **步骤 3：验证编译**

```bash
npx tsc --noEmit
```

- [ ] **步骤 4：Commit**

```bash
git add lib/curriculum/view-model.ts lib/curriculum/stage-space.ts
git commit -m "feat(viewmodel): 集成阶段解锁态、难度字段到 roadmap 和 stage space"
```

---

## 任务 12：侧边栏三段分区 + 锁定态 + 路径进度

**文件：**
- 修改：`components/learning-space/stage-sidebar.tsx`
- 修改：`app/globals.css`

- [ ] **步骤 1：侧边栏接收 `difficultyTiers` 和 `pathProgress`**

```typescript
import type { DifficultyTier } from "@/lib/curriculum/types";
import type { PathProgress } from "@/lib/curriculum/path-progress";

type StageSidebarProps = {
  stages: readonly RoadmapStage[];
  activeStageId: StageId;
  activeLessonId: string;
  difficultyTiers: Record<DifficultyTier, StageId[]>;
  pathProgress: PathProgress;
  onSelectStage: (stageId: StageId) => void;
  onOpenLesson: (lessonId: string) => void;
};
```

- [ ] **步骤 2：渲染三段分隔符**

在阶段列表中，当遇到新 tier 时插入分隔行：

```tsx
const tierLabels: Record<DifficultyTier, string> = {
  beginner: "🌱 入门",
  intermediate: "🔥 深入",
  advanced: "⚡ 实战"
};
```

- [ ] **步骤 3：锁定态阶段展示**

当 `stage.state === "locked"` 时显示锁图标和 `stage.unlockHint`：

```tsx
{stage.state === "locked" && (
  <span className="stage-entry__lock" aria-label="未解锁">
    🔒 {stage.unlockHint}
  </span>
)}
```

- [ ] **步骤 4：底部路径进度条**

```tsx
<div className="path-progress" aria-label="路径进度">
  {(["beginner", "intermediate", "advanced"] as const).map((tier) => (
    <div key={tier} className="path-progress__bar">
      <span>{tierLabels[tier]}</span>
      <progress value={pathProgress[tier]} max={100} />
      <span>{pathProgress[tier]}%</span>
    </div>
  ))}
</div>
```

- [ ] **步骤 5：知识点难度星级图标**

侧边栏已展开阶段的知识点列表项旁显示星级：

```tsx
const stars = (d: number) => "★".repeat(d) + "☆".repeat(3 - d);
```

- [ ] **步骤 6：添加 CSS 样式**

在 `app/globals.css` 中新增：

```css
.stage-entry.locked { opacity: 0.6; }
.stage-entry__lock { font-size: 0.75rem; color: var(--muted); }
.stage-tier-divider { padding: 0.5rem 1rem; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); border-top: 1px solid var(--border); }
.path-progress { padding: 1rem; border-top: 1px solid var(--border); }
.path-progress__bar { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; }
.path-progress__bar progress { flex: 1; height: 6px; border-radius: 3px; }
.difficulty-stars { font-size: 0.65rem; color: var(--accent); margin-left: 0.25rem; }
```

- [ ] **步骤 7：Commit**

```bash
git add components/learning-space/stage-sidebar.tsx app/globals.css
git commit -m "feat(sidebar): 三段分区渲染、锁定态提示、路径进度条和难度星级"
```

---

## 任务 13：首页筛选 Tab 组件

**文件：**
- 创建：`app/_components/difficulty-filter.tsx`
- 修改：`app/page.tsx`

- [ ] **步骤 1：创建筛选 Tab Client Component**

```tsx
// app/_components/difficulty-filter.tsx
"use client";

import { useState } from "react";
import type { CourseSpec, DifficultyTier } from "@/lib/curriculum/types";
import type { FilterTier } from "@/lib/curriculum/difficulty-tiers";
import { filterCoursesByTier } from "@/lib/curriculum/difficulty-tiers";

type DifficultyFilterProps = {
  courses: CourseSpec[];
  children: (filteredCourses: CourseSpec[], activeTier: FilterTier) => React.ReactNode;
};

const tabs: { tier: FilterTier; label: string; icon: string }[] = [
  { tier: "all", label: "全部", icon: "" },
  { tier: "beginner", label: "入门推荐", icon: "🌱" },
  { tier: "intermediate", label: "进阶挑战", icon: "🔥" },
  { tier: "advanced", label: "实战项目", icon: "⚡" }
];

export function DifficultyFilter({ courses, children }: DifficultyFilterProps) {
  const [activeTier, setActiveTier] = useState<FilterTier>("all");
  const filtered = filterCoursesByTier(courses, activeTier);

  return (
    <>
      <nav className="difficulty-tabs" aria-label="难度筛选">
        {tabs.map(({ tier, label, icon }) => (
          <button
            key={tier}
            className={`difficulty-tab${activeTier === tier ? " active" : ""}`}
            onClick={() => setActiveTier(tier)}
            aria-pressed={activeTier === tier}
            type="button"
          >
            {icon && <span className="difficulty-tab__icon">{icon}</span>}
            {label}
          </button>
        ))}
      </nav>
      {children(filtered, activeTier)}
    </>
  );
}
```

- [ ] **步骤 2：修改 `app/page.tsx` 集成筛选**

首页需要将课程列表传入 `DifficultyFilter`，由 filter 的 render prop 控制渲染。因为首页是 Server Component，需要将课程卡片渲染部分提取到一个 Client Component 包裹中。

把当前 `<section className="course-domain-board">` 的内容包裹在 `DifficultyFilter` 内。

- [ ] **步骤 3：添加筛选 Tab CSS**

```css
.difficulty-tabs { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; flex-wrap: wrap; }
.difficulty-tab { padding: 0.5rem 1.25rem; border-radius: 2rem; border: 1px solid var(--border); background: transparent; color: var(--foreground); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.difficulty-tab.active { background: var(--accent); color: var(--background); border-color: var(--accent); }
.difficulty-tab__icon { margin-right: 0.25rem; }
```

- [ ] **步骤 4：验证页面渲染**

```bash
npm run build
```

- [ ] **步骤 5：Commit**

```bash
git add app/_components/difficulty-filter.tsx app/page.tsx app/globals.css
git commit -m "feat(home): 首页难度筛选 Tab - 入门/进阶/实战/全部"
```

---

## 任务 14：学习工作台集成解锁逻辑

**文件：**
- 修改：`app/_components/learning-studio.tsx`

- [ ] **步骤 1：导入解锁和路径进度模块**

```typescript
import { isStageUnlocked } from "@/lib/curriculum/stage-unlock";
import { buildPathProgress } from "@/lib/curriculum/path-progress";
```

- [ ] **步骤 2：计算解锁状态并传递给侧边栏**

在 roadmap 构建后，为每个 stage 注入锁定状态。当用户点击锁定阶段的知识点时拦截：不允许答题，显示 toast 提示解锁条件。

- [ ] **步骤 3：路径进度传入侧边栏**

从 `CourseConfig` 获取 `difficultyTiers`，调用 `buildPathProgress` 传给 `StageSidebar`。

- [ ] **步骤 4：验证功能**

```bash
npm run build
npm run lint
```

- [ ] **步骤 5：Commit**

```bash
git add app/_components/learning-studio.tsx
git commit -m "feat(studio): 集成阶段解锁拦截和路径进度到学习工作台"
```

---

## 任务 15：端到端验证

- [ ] **步骤 1：运行课程校验**

```bash
npm run validate:curriculum
```

- [ ] **步骤 2：运行全量测试**

```bash
npm test
```

- [ ] **步骤 3：运行 lint**

```bash
npm run lint
```

- [ ] **步骤 4：运行构建**

```bash
npm run build
```

- [ ] **步骤 5：验证 git 状态**

```bash
git diff --check
```

- [ ] **步骤 6：最终 commit（如有遗留修复）**

```bash
git add -A
git commit -m "fix: 端到端验证修复"
```

---

## 自检结果

| 规格需求 | 对应任务 |
|----------|----------|
| 首页筛选 Tab（入门/进阶/实战/全部） | 任务 4, 13 |
| 课程卡保留学院分组 | 任务 13 步骤 2 |
| 阶段解锁（≥70% 知识点） | 任务 2 |
| 路径进度可视化（三段进度条） | 任务 3, 12 |
| 知识点难度星级（1/2/3） | 任务 1, 5, 11, 12 |
| 侧边栏三段分区 + 锁定态 | 任务 11, 12 |
| Python 阶段 04–10 内容 | 任务 6, 7, 8, 9 |
| Python 注册到课程系统 | 任务 10 |
| 所有课程新增 difficultyTiers | 任务 10 步骤 2 |
| 学习工作台解锁拦截 | 任务 14 |
| 端到端验证 | 任务 15 |
