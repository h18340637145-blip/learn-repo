# P1 题型与交互开发规范 (Question & Interaction Spec)

> **所属主文档**：[P1 阶段开发总纲](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/P1-DEVELOPMENT-GUIDE.md)  
> **适用模块**：`lib/curriculum/types.ts` / `content/questions/*` / `app/_components/question-options.tsx`  

---

## 1. 题型规范总览

P1 阶段的核心目标是从单一的选择题（`prediction`）全面升级到多维度的**认知与判断题型**。

| 题型标识 (`type`) | 认知目标 | 输入材料 | 用户交互 | 针对误区 |
| :--- | :--- | :--- | :--- | :--- |
| `prediction` | 推演运行逻辑 | 场景代码 | 单选输出结果 | 混淆同步/异步或语法细节 |
| `implementation` | 目标反推实现 | 效果或需求 | 选择完整代码卡片 | 误用不适当 API 或语法 |
| `diagnosis` | 定位根本原因 | 报错日志/错误代码 | 选择错误因果说明 | 混淆现象与根本原因 |
| `repair` | 修复已知 Bug | 缺陷代码片段 | 选择最佳修复 Diff | 修复方案引入新副作用 |
| `completion` | 补全关键代码 | 带 `___` 缺口代码 | 点击填入关键片段 | 不熟悉模式或语法参数 |
| `execution-order` | 队列与时序理解 | 多段异步任务代码 | 拖拽/点击排序执行顺序 | 不懂 Event Loop / 微任务优先级 |

---

## 2. 数据 Schema 定义 (TypeScript Interface)

```typescript
// lib/curriculum/types.ts

export type QuestionType =
  | "prediction"
  | "implementation"
  | "diagnosis"
  | "repair"
  | "completion"
  | "execution-order"
  | "best-practice";

export interface QuestionOption {
  id: string;
  text: string;
  code?: string;           // 代码方案或代码片段
  codeLanguage?: string;   // 语言标识: typescript / javascript / json
  diffHighlight?: number[];// 强调差异行号 [1, 3]
  feedback: string;        // 选此项时的定向解释
  isCorrect: boolean;
}

export interface LessonQuestion {
  id: string;
  type: QuestionType;
  prompt: string;          // 题干说明
  
  // P1 扩展材料字段
  materialTitle?: string;  // 材料标题 (如 "终端报错日志")
  materialCode?: string;   // 材料代码/日志内容
  materialLanguage?: string;
  expectedOutput?: string; // 期望输出
  orderItems?: Array<{     // 适用于 execution-order 题型
    id: string;
    label: string;
    code?: string;
  }>;

  options: QuestionOption[];
  explanation: string;     // 答对后的综合原理剖析
}
```

---

## 3. UI 组件与交互规则 (`QuestionOptions.tsx`)

### 3.1 代码方案卡片 (Implementation / Repair)
- **差异行高亮**：若 `option.diffHighlight` 存在，应用 `bg-emerald-500/10 border-l-2 border-emerald-500` 样式，让学习者能一眼看出选项间的核心区别。
- **折叠/展开机制**：选项代码超过 6 行时，默认只展示前 4 行并提示“展开完整代码”，减少移动端屏高占用。
- **横向滚动**：代码卡片内部配置 `overflow-x-auto font-mono text-xs`，保证在手机窄屏上代码不换行乱序。

### 3.2 诊断题 UI (Diagnosis)
- **材料区呈现**：以深红/暗色面板渲染 `materialCode`，附带警告图标 ⚠️ 与模拟终端 Console 样貌，营造真实调试现场。
- **因果归因选项**：选项文字需明确区分“直接表现”与“根本原因”。

### 3.3 执行顺序题 UI (Execution Order)
- **节点选择与排序**：用户按预期运行顺序依次点击选项编号 [1] -> [2] -> [3]。
- **重置功能**：提供“重置排序”按钮，防止误触后无法更改。

---

## 4. 定向反馈 (Option-Specific Feedback) 编写指导

在 P1 阶段，**每一个错误选项都必须附带针对性的解释**，绝不能使用“选项 A 不正确”等套话。

```text
Bad ❌:  "错误！setTimeout 不会立即执行。"
Good ✅: "选错了。setTimeout 即使设为 0ms，回调函数也会被放入 Macrotask 队列，因此会在当前同步代码和 Microtask (Promise) 执行完毕后才触发。"
```

---

## 5. 验收标准 Checklists

- [ ] 所有 P1 题型在手机宽度（375px - 430px）下无横向溢出。
- [ ] 选择任一错误选项均能弹出专属定向反馈，且允许重新选择。
- [ ] 答对题目后，反馈框高亮并提供“进入下一题”或“播放运行过程”过渡按钮。
