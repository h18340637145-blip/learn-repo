# NodePath P1 题型 UI 与大规模题库铺开设计

## 目标

本轮目标是把 NodePath 从“以预测题为主的可视化学习网站”升级为“多题型训练营”。系统需要支持 P1 题型 UI，并把 `diagnosis`、`repair`、`completion`、`execution-order` 大规模铺到现有 Node.js 与 Next.js 已发布课程中。

这不是试点。本轮完成后，学习者在绝大多数已发布知识点中都应该看到至少一道新的 P1 训练题，阶段项目也应变成多步决策项目。

## 当前上下文

当前项目已经具备：

- Node.js 92 个已发布案例。
- Next.js 90 个已发布案例。
- 共 182 个已发布 playable cases。
- 单课多题流程。
- `QuestionOptions` 统一题目组件。
- `implementation` 代码题卡片。
- authored trace 确定性运行模型。
- 3D / fallback 运行舱。
- 题型枚举和基础校验已扩展到 P1 / P2 类型。

当前主要缺口：

- `diagnosis`、`repair`、`completion`、`execution-order` 还没有专属 UI 表达。
- 大多数课程仍只有 prediction 主题。
- 阶段项目还不像连续项目挑战。
- 题库覆盖率校验还没有约束“每课多题”和“阶段题型多样性”。

## 范围

### 本轮包含

1. 新增 P1 题型 UI：
   - `diagnosis`: 错误诊断题。
   - `repair`: 代码修复题。
   - `completion`: 代码补全题。
   - `execution-order`: 执行顺序题。
2. 大规模补充题库：
   - Node.js 已发布知识点至少新增 1 道 P1 题。
   - Next.js 已发布知识点至少新增 1 道 P1 题。
   - 每个已发布阶段项目至少新增 2 道项目决策题。
3. 增加覆盖率校验：
   - 每个已发布知识点至少 2 道题。
   - 每个已发布阶段至少覆盖 3 种题型。
   - 每个阶段项目至少 3 道题。
4. 保持当前安全边界：
   - 不执行学习者提交的任意代码。
   - 所有运行反馈继续使用 authored trace。
5. 更新文档：
   - `docs/PRODUCT.md`
   - `docs/ARTICHECTURE.md`
   - `session-handoff.md`

### 本轮不包含

- Supabase 登录、跨设备同步、错题本和复习系统。
- 拖拽排序题；`execution-order` 先使用单选顺序方案。
- 任意代码沙箱执行。
- 阶段 04 未发布课程内容补齐；阶段 04 只覆盖已发布的 Stream 背压和 CLI 日志分析器。
- 课程后台管理或题目 CMS。

## 题型设计

### `diagnosis`

用于训练根据错误代码、日志或现象判断根本原因。

推荐展示结构：

```text
现象 / 错误日志
代码材料
原因选项
反馈与深度解析
```

适合主题：

- Node.js 错误处理。
- HTTP 状态码和 Header。
- API 参数校验。
- 安全配置。
- Next.js Server / Client Component 边界。
- Middleware、Auth、数据库连接错误。

### `repair`

用于训练选择正确修复方案。

推荐展示结构：

```text
错误代码
修复目标
多个代码方案卡片
高亮差异行
反馈与修复后运行路径
```

适合主题：

- Stream 背压处理。
- HTTP 响应结束。
- Promise 错误传播。
- Worker 消息传递。
- Next.js 路由文件结构。
- Server Action / Route Handler 修复。

### `completion`

用于训练上下文理解和关键 API 使用。

推荐展示结构：

```text
带缺口代码
目标结果
补全片段选项
插入后预览
反馈与执行说明
```

本轮不做输入框，只做选择式补全，符合移动端优先原则。

适合主题：

- Node.js `fs`、`path`、`http` API。
- EventEmitter 监听器。
- Test Runner 断言。
- Next.js `page.tsx`、`layout.tsx`、`route.ts`、`generateMetadata`。

### `execution-order`

用于训练同步 / 异步 / 请求链路的顺序推演。

推荐展示结构：

```text
代码或流程材料
多个顺序方案
选择后按顺序播放 authored trace
终端输出与顺序总结
```

本轮先用单选方案，后续再升级为点击排序或拖拽排序。

适合主题：

- Event Loop。
- Promise、nextTick、setTimeout、setImmediate。
- HTTP 请求响应链。
- Next.js 渲染、Hydration、缓存再验证。

## 数据模型策略

当前 `LessonQuestion` 已有字段可以覆盖大部分需求：

- `type`
- `prompt`
- `options`
- `options.code`
- `options.language`
- `options.diffLines`
- `correctExplanation`
- `difficulty`
- `estimatedSeconds`

本轮新增少量可选材料字段，避免把题干材料硬塞进 `prompt`：

```ts
type LessonQuestion = {
  materialTitle?: string;
  materialCode?: string;
  materialLanguage?: CodeLanguage;
  expectedOutput?: string;
  orderItems?: string[];
}
```

字段含义：

- `materialTitle`: 材料标题，如“错误日志”“待补全代码”。
- `materialCode`: 题干主代码或日志。
- `materialLanguage`: 材料语言。
- `expectedOutput`: 目标输出、目标行为或修复目标。
- `orderItems`: 执行顺序题的步骤候选，用于 UI 展示和后续排序题升级。

兼容原则：

- 旧题缺少这些字段不报错。
- `repair` 和 `completion` 可以复用 `options.code`。
- `execution-order` 如果没有 `orderItems`，仍可退化为普通文本选项。

## 题库组织

为避免直接把 200+ 道新题写进原课程文件导致文件过大，本轮新增题库补丁层：

```text
content/questions/nodejs-p1-question-bank.ts
content/questions/nextjs-p1-question-bank.ts
content/questions/apply-question-bank.ts
```

职责：

- `nodejs-p1-question-bank.ts`: Node.js 课程 P1 题库。
- `nextjs-p1-question-bank.ts`: Next.js 课程 P1 题库。
- `apply-question-bank.ts`: 将题库按 `lessonId` 挂载到已有 `LessonSpec.questions` 后面。

挂载方式：

```ts
const enhancedLessons = applyQuestionBank(baseLessons, nodejsP1QuestionBank);
```

设计原则：

- 原课程文件继续负责主讲解、主代码、主 authored trace。
- P1 题库文件负责追加训练题。
- 题库补丁必须通过校验，不能引用不存在的课程 ID。
- 同一个题目 ID 全局唯一。

## 覆盖策略

### Node.js

覆盖范围：

- 阶段 00 基础训练营：8 个知识点 + 1 个阶段项目。
- 阶段 01 运行时与命令行：8 个知识点 + 1 个阶段项目。
- 阶段 02 模块、包与 TypeScript：8 个知识点 + 1 个阶段项目。
- 阶段 03 异步运行时与事件：8 个知识点 + 1 个阶段项目。
- 阶段 04：只覆盖已发布的 Stream 背压和 CLI 日志分析器。
- 阶段 05 HTTP 基础：8 个知识点 + 1 个阶段项目。
- 阶段 06 API 与服务设计：8 个知识点 + 1 个阶段项目。
- 阶段 07 进程与并发：8 个知识点 + 1 个阶段项目。
- 阶段 08 实时通信：8 个知识点 + 1 个阶段项目。
- 阶段 09 测试与安全：8 个知识点 + 1 个阶段项目。
- 阶段 10 诊断与生产工程：8 个知识点 + 1 个阶段项目。

题型分配建议：

- 基础语法：`completion`、`repair`。
- 运行时 / CLI：`diagnosis`、`execution-order`。
- 模块和包：`diagnosis`、`repair`。
- 异步：`execution-order`、`repair`。
- Stream / HTTP：`repair`、`diagnosis`。
- API / 安全：`diagnosis`、`repair`。
- 并发 / 实时：`execution-order`、`diagnosis`。
- 测试 / 生产：`diagnosis`、`completion`。

### Next.js

覆盖范围：

- 10 个阶段全部覆盖。
- 每阶段 8 个知识点和 1 个阶段项目。

题型分配建议：

- 基础 / App Router：`completion`、`repair`。
- 路由：`completion`、`diagnosis`。
- 渲染：`diagnosis`、`execution-order`。
- 数据获取：`repair`、`execution-order`。
- 样式优化：`diagnosis`、`best-practice`，其中本轮 P1 优先 `diagnosis`。
- API / Middleware：`repair`、`diagnosis`。
- Auth / Database：`diagnosis`、`repair`。
- Testing / Deployment：`completion`、`diagnosis`。
- 高级模式：`execution-order`、`diagnosis`。

## UI 架构

继续复用 `QuestionOptions`，内部根据题型委派：

```text
QuestionOptions
├── TextQuestionOptions
│   ├── prediction
│   ├── diagnosis
│   └── best-practice
├── CodeQuestionOptions
│   ├── implementation
│   ├── repair
│   └── completion
└── OrderQuestionOptions
    └── execution-order
```

`LearningStudio` 保持单课多题流程不变。

新增材料展示组件：

```text
QuestionMaterial
  -> materialTitle
  -> materialCode
  -> expectedOutput
  -> orderItems
```

移动端规则：

- 不要求输入大段代码。
- 代码选项可横向滚动。
- 顺序题选项保持单列。
- 材料代码块默认限制高度，允许展开。
- 反馈区纵向排列。

## 校验规则

在 `lib/curriculum/validate.ts` 增加以下校验：

- `repair` 题至少 2 个代码选项。
- `completion` 题至少 2 个代码选项。
- `execution-order` 题至少 2 个顺序方案，若提供 `orderItems`，数组至少 3 项。
- P1 题必须包含 `difficulty` 和 `estimatedSeconds`。
- 题目 ID 在同一课程内不能重复。
- 题库补丁不能引用不存在的课程 ID。

新增覆盖率校验函数：

```ts
validateQuestionCoverage(lessons, options)
```

用于测试：

- 已发布知识点至少 2 道题。
- 已发布阶段项目至少 3 道题。
- 每个已发布阶段至少 3 种题型。

阶段 04 特例：

- 只检查已发布案例，不要求 planned 课程。

## 运行与可视化

本轮不新增运行沙箱。

P1 题答对后的运行逻辑：

- 如果该题不是最后一道必答题：显示解析，等待进入下一题。
- 如果该题是最后一道必答题：播放该课程现有 authored trace。

可视化文案映射：

- `diagnosis`: 突出“异常节点 / 根因定位”。
- `repair`: 突出“错误路径 -> 修复路径”。
- `completion`: 突出“缺口填充 -> 执行链点亮”。
- `execution-order`: 突出“顺序逐帧播放”。

实际 3D 场景仍由 `execution.visualizer` 决定，不把题型和 3D 细节强耦合。

## 测试计划

新增或扩展测试：

- `tests/curriculum/question-bank.test.ts`
  - 题库补丁能挂载到存在的课程。
  - 题目 ID 不重复。
  - Node.js / Next.js 题库覆盖率达标。
- `tests/curriculum/validate.test.ts`
  - P1 题型缺少必需结构时报错。
- `tests/learning-studio/question-options.test.tsx`
  - diagnosis 渲染材料和原因选项。
  - repair 渲染修复代码选项。
  - completion 渲染目标输出和补全选项。
  - execution-order 渲染顺序方案。
- `tests/visualizers/styles.test.ts`
  - P1 题型移动端样式存在。
- 现有测试全部保持通过。

最终验证：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

## 交付标准

完成后必须满足：

- Node.js 已发布知识点至少 2 道题。
- Next.js 已发布知识点至少 2 道题。
- 每个已发布阶段项目至少 3 道题。
- 每个已发布阶段至少 3 种题型。
- `diagnosis`、`repair`、`completion`、`execution-order` 都有专属 UI 表达。
- 所有新增题都提供定向反馈和正确解析。
- 移动端不需要输入大段代码。
- authored trace 安全边界不变。
- 文档同步更新。

## 风险与控制

### 风险：一次新增题量太大，内容质量下降

控制：

- 使用题库补丁文件集中管理。
- 用覆盖率测试防止漏阶段。
- 用题型校验防止空泛题。
- 每道题都必须有定向反馈。

### 风险：原课程文件继续膨胀

控制：

- 新题进入 `content/questions/*`。
- 原课程文件不继续承载所有新增训练题。

### 风险：单课题量过重

控制：

- 普通知识点本轮目标是原 prediction + 1 道 P1。
- 阶段项目才增加更多连续决策题。

### 风险：P1 UI 过早复杂化

控制：

- execution-order 先做单选顺序方案。
- completion 先做选择式补全，不做输入框。
- repair 复用代码选项卡片，不做复杂 diff 编辑器。

## 后续演进

本轮完成后，下一步可以选择：

1. 建立错题本、作答记录和复习入口。
2. 将 `execution-order` 升级为点击排序。
3. 将阶段项目升级为真正的多步骤项目状态机。
4. 接入 Supabase 进行跨设备进度、错题和学习记录同步。
