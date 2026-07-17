# NodePath 基础训练营实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 NodePath 中上线 `00 基础训练营`，补齐 Node.js 基础语法、基础题库和一个命令行文件统计器阶段项目。

**架构：** 继续使用现有 `CurriculumStage`、`LessonSpec`、authored trace 和阶段空间 UI。新增 `content/lessons/stage-00-foundations.ts`，并把课程目录、注册表、校验逻辑从 10 阶段扩展为 `00 + 01–10` 共 11 阶段。

**技术栈：** Next.js 16 App Router、TypeScript、Node 内置测试、现有 authored trace 可视化系统。

---

## 文件职责

- 创建 `content/lessons/stage-00-foundations.ts`：定义 8 个基础知识点和 1 个阶段项目。
- 修改 `lib/curriculum/types.ts`：加入 `foundations` 阶段 ID。
- 修改 `content/curriculum.ts`：加入基础阶段目录和 published ID。
- 修改 `content/lesson-registry.ts`：注册基础训练营课程。
- 修改 `lib/curriculum/validate.ts`：支持 `00 + 01–10` 的 11 阶段目录。
- 修改 `tests/curriculum/catalog.test.ts`、`tests/curriculum/registry.test.ts`、`tests/curriculum/validate.test.ts`：红绿覆盖新阶段。
- 修改 `docs/PRODUCT.md`、`docs/ARTICHECTURE.md`、`session-handoff.md`：同步产品定位、架构与交接状态。

## 任务 1：红灯测试基础训练营目录和注册表

**文件：**
- 修改：`tests/curriculum/catalog.test.ts`
- 修改：`tests/curriculum/registry.test.ts`
- 修改：`tests/curriculum/validate.test.ts`

- [ ] **步骤 1：编写失败的目录测试**

更新断言为：

```ts
test("课程目录包含 00 基础训练营和 10 个正式阶段", () => {
  assert.equal(curriculum.length, 11);
  assert.equal(curriculum[0].id, "foundations");
  assert.equal(curriculum[0].number, 0);
  assert.equal(curriculum[0].lessons.length, 8);
  assert.equal(curriculum.flatMap((stage) => stage.lessons).length, 88);
  assert.equal(curriculum.filter((stage) => stage.project.kind === "stage-project").length, 11);
  assert.deepEqual(validateCatalog(curriculum), []);
});
```

- [ ] **步骤 2：编写失败的注册表测试**

在 `tests/curriculum/registry.test.ts` 增加 `stageZeroFoundationIds`，并把 expected 列表放到正式阶段之前：

```ts
const stageZeroFoundationIds = [
  "foundations-node-javascript",
  "foundations-types-typeof",
  "foundations-collections",
  "foundations-functions",
  "foundations-branches-loops",
  "foundations-try-catch",
  "foundations-console-debug",
  "foundations-process-files",
  "project-cli-file-inspector"
];
```

预期已发布案例数量更新为 `92`。

- [ ] **步骤 3：运行测试验证失败**

运行：

```bash
npx tsx --test tests/curriculum/catalog.test.ts tests/curriculum/registry.test.ts tests/curriculum/validate.test.ts
```

预期：失败，错误包含目录数量仍为 10、缺少 `foundations` 或发布数量不是 92。

## 任务 2：实现基础阶段类型、目录和校验

**文件：**
- 修改：`lib/curriculum/types.ts`
- 修改：`lib/curriculum/validate.ts`
- 修改：`content/curriculum.ts`

- [ ] **步骤 1：扩展 StageId**

在 `StageId` 中加入：

```ts
| "foundations"
```

- [ ] **步骤 2：扩展课程目录**

在 `publishedIds` 中加入 9 个基础 ID，并在 `curriculum` 最前面加入：

```ts
stage("foundations", 0, "基础训练营", "补齐 Node.js 入门语法", [
  ["foundations-node-javascript", "Node.js 与 JavaScript 的关系"],
  ["foundations-types-typeof", "变量、类型与 typeof"],
  ["foundations-collections", "字符串、数组与对象"],
  ["foundations-functions", "函数、参数与返回值"],
  ["foundations-branches-loops", "条件判断与循环"],
  ["foundations-try-catch", "错误处理 try/catch"],
  ["foundations-console-debug", "console 与调试输出"],
  ["foundations-process-files", "process、路径与文件读取入门"]
], ["project-cli-file-inspector", "命令行文件统计器"])
```

- [ ] **步骤 3：修改校验编号规则**

`validateCatalog()` 应要求 11 阶段，且 `stages[index].number === index`，从 0 开始校验。

- [ ] **步骤 4：运行目录测试**

运行任务 1 的测试命令。预期：目录相关测试通过，注册表仍因缺少课程实现失败。

## 任务 3：实现基础训练营课程数据

**文件：**
- 创建：`content/lessons/stage-00-foundations.ts`
- 修改：`content/lesson-registry.ts`

- [ ] **步骤 1：创建课程文件**

创建 `stageZeroFoundationsLessons: LessonSpec[]`，包含 8 个 knowledge 和 1 个 stage-project。每课必须包含：

- 真实、短小的 Node.js 代码样例。
- 1 道 `prediction` 或 `diagnosis` 题。
- 3 个选项，每个选项有定向反馈。
- 至少 3 个 authored trace frames。
- 至少 3 条 summary。
- 至少 1 个官方来源。

- [ ] **步骤 2：注册课程**

在 `content/lesson-registry.ts` 导入：

```ts
import { stageZeroFoundationsLessons } from "./lessons/stage-00-foundations";
```

并把它放到 `publishedLessons` 数组最前面。

- [ ] **步骤 3：运行注册表测试**

运行：

```bash
npx tsx --test tests/curriculum/registry.test.ts tests/curriculum/validate.test.ts
```

预期：基础课程全部通过规格校验，发布数量为 92。

## 任务 4：同步产品、架构和交接文档

**文件：**
- 修改：`docs/PRODUCT.md`
- 修改：`docs/ARTICHECTURE.md`
- 修改：`session-handoff.md`

- [ ] **步骤 1：更新产品定位**

把“主要学习者已经掌握 JavaScript 基础语法”改成“既服务 JavaScript 基础较弱的新手，也服务希望系统掌握 Node.js 的学习者”。

- [ ] **步骤 2：更新课程数量**

把 10 阶段、80 知识点、10 项目、83 案例更新为 11 阶段、88 知识点、11 项目、92 案例，并列出 `00 基础训练营`。

- [ ] **步骤 3：更新架构文档**

在模块边界中加入 `content/lessons/stage-00-foundations.ts`，说明 `validateCatalog` 支持 `00 + 01–10`。

- [ ] **步骤 4：更新交接文档**

记录基础训练营上线、验证命令和当前分支状态。

## 任务 5：完整验证与浏览器验收

**文件：**
- 不新增文件。

- [ ] **步骤 1：运行课程校验**

```bash
npm run validate:curriculum
```

预期：输出 `课程校验通过：11 个阶段，92 个已发布案例。`

- [ ] **步骤 2：运行完整测试**

```bash
npm test
```

预期：全部测试通过。

- [ ] **步骤 3：运行 lint、build 和 diff 检查**

```bash
npm run lint
npm run build
git diff --check
```

预期：全部 exit 0。`npm run build` 可能需要外部权限，因为 Turbopack 会绑定本地端口。

- [ ] **步骤 4：浏览器验收**

打开或刷新 `http://localhost:3000/`，确认左侧出现 `00 基础训练营`，可以进入第一课，答对后 authored trace 和终端日志正常展示。

## 自检

- 规格覆盖度：覆盖课程结构、题库、可视化、目录、测试、文档和浏览器验收。
- 占位符扫描：无 TODO、待定或空泛步骤。
- 类型一致性：新增阶段统一使用 `foundations`，课程 ID 与测试 ID 一致。
