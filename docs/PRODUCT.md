# NodePath Product Harness

## Product Summary

NodePath 是一个面向 Node.js 的可视化学习网站。它用“先预测、再运行、最后总结”的方式帮助学习者建立运行时心智模型，而不是只阅读概念说明。

首屏应始终是可操作的学习工作台，不是营销落地页。

## Target Learner

主要学习者已经掌握 JavaScript 基础语法，希望系统理解 Node.js 在真实程序中的行为：模块、包、异步队列、文件、流、HTTP、进程、实时通信、测试、安全和生产诊断。

体验优化目标：

- 小知识点。
- 具体代码。
- 先预测再解释。
- 可视化运行过程。
- 终端日志反馈。
- 错误选项提供定向反馈。
- 阶段项目复用前面知识。

## Current Experience

当前应用是单页交互式学习原型，名称为 NodePath。

已实现体验：

- 左侧概念面板。
- 右侧代码样例。
- 下方选择题预测。
- 正确答案触发 authored trace 可视化运行。
- 终端面板打印预设日志结果。
- 成功后展示知识点总结。
- 侧边栏展示 10 阶段课程路线。
- 已完成课程保存到浏览器本地进度。

当前已发布案例：29 个。

- 阶段 01：运行时与命令行的 8 个知识点和阶段项目“CLI 系统信息探测器”。
- 阶段 02：模块、包与 TypeScript 的 8 个知识点和阶段项目“依赖与配置检查器”。
- 阶段 03：异步运行时与事件的 8 个知识点和阶段项目“并发任务调度器”。
- Stream 背压。
- 阶段项目：CLI 日志分析器。

当前目录已包含 10 个阶段、80 个计划知识点和 10 个阶段项目。阶段 01–03 已全部发布；阶段 04 保留 Stream 背压和 CLI 日志分析器两个可玩案例；其余目录项状态为 `planned`，表示内容尚未发布。

阶段 01–03 的内容边界来自 Node.js 官方 Learn 和 API 文档，覆盖 Getting Started、Command Line、Modules、Packages、TypeScript、Asynchronous Work、Events、Timers 和 Process 等主题。

## Learning Flow

每个知识点遵循：

```text
Concept -> Code Case -> Prediction -> Correct Answer -> Runtime Visualizer -> Summary
```

每个阶段项目遵循同一交互模式，但会组合前面知识：

```text
Project Brief -> Incomplete Code -> Choice -> Simulated Run -> Visual Result -> Knowledge Summary
```

全部阶段项目完成后，学习者应进入中大型最终项目：实时协作任务平台，覆盖 API、数据流、实时通信、鉴权、测试、诊断和部署等主题。

## Curriculum Roadmap

课程主线为 10 个必修阶段：

1. 运行时与命令行。
2. 模块、包与 TypeScript。
3. 异步运行时与事件。
4. 文件、Buffer 与 Stream。
5. HTTP 基础。
6. API 与服务设计。
7. 进程与并发。
8. 实时通信。
9. 测试与安全。
10. 诊断与生产工程。

每个阶段包含 8 个知识点和 1 个阶段项目。当前阶段已发布阶段 01–03 的完整学习闭环和阶段 04 的 2 个案例，后续内容应继续基于官方 Node.js 学习文档补齐阶段 04–10 的题库、可视化和项目。

## Runtime Model

普通课程当前使用 authored trace：课程内容提供可信代码样例、预设运行帧和日志，浏览器只播放这些确定性帧。

真实 Node.js 编译或沙箱执行不在当前阶段。后续项目沙箱必须作为独立计划设计，不能在 Next.js 进程里运行学习者提交的任意代码。

## Progress

当前进度保存在浏览器 `localStorage` 中：

- 完成知识点后记录 `completedLessonIds`。
- 完成阶段项目后记录 `completedProjectIds`。
- 刷新页面后会恢复进度。
- 清理站点数据会清除进度。

Supabase 登录、跨设备同步和严格跨阶段解锁属于后续计划。

## Product Principles

- 让学习者始终处在“做”的循环里。
- 用视觉因果关系替代长篇概念堆叠。
- 错误答案要有帮助，而不是惩罚。
- 每课都应该留下一个可记忆规则。
- 阶段项目必须显式复用前面概念。
- UI 应该适合反复学习：信息密度足够，但视觉保持克制。

## Success Criteria

短期：

- 课程目录可校验，已发布案例可完整运行。
- 错误选项能给出当前题目的定向反馈。
- 完成进度能在刷新后恢复。
- `npm run validate:curriculum`、`npm test`、`npm run lint`、`npm run build` 可通过。

中期：

- 阶段 04–10 的剩余知识点和阶段项目逐步补齐。
- 题库覆盖 prediction、diagnosis、transfer 三类问题。
- 增加更多可视化类型，尤其是模块图、事件循环、Stream/HTTP 流程和并发图。

长期：

- 安全的项目沙箱。
- 更丰富的项目输出，包括日志、图表和小型渲染结果。
- 最终项目覆盖大多数 Node.js 学习知识点。
