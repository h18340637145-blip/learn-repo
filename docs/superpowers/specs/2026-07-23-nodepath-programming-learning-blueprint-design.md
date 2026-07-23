# NodePath 全站编程学习蓝图设计

## 背景

NodePath 当前已经形成 Node.js 与 Next.js 两条学习路径，核心体验是“概念解释 -> 代码案例 -> 预测或诊断 -> 确定性运行反馈 -> 可视化总结”。后续目标是把它升级为完整的编程学习网站，覆盖编程语言、前端工程、计算机网络、服务器开发、Android、AI 应用、AI Agent、Transformer 与 AI 数学基础。

本设计先确定全站课程蓝图，再约束后续架构改造，最后用一条新增样板路线验证平台能力。当前阶段不实现真实代码沙箱，不新增生产部署，不把 Supabase 进度同步作为本规格的实现范围。

## 目标

- 建立可长期扩展的全站课程分类，而不是在现有 Node.js / Next.js 旁边零散追加路线。
- 保持当前 NodePath 的学习方式：小知识点、真实材料、先预测再解释、运行反馈、视觉因果关系、阶段项目复用。
- 让不同学科拥有适配自身心智模型的运行舱，例如浏览器、网络链路、内存模型、Android 调用链、Agent Trace、数学函数图形。
- 为后续架构改造提供明确的数据模型边界，避免每条新路线都复制一套 UI 和状态逻辑。
- 先选择一条新样板路线，验证多课程模型、调试型题目和可视化反馈是否能稳定复用。

## 非目标

- 不在本阶段实现真实 C/C++/Python/Java/Kotlin 编译运行沙箱。
- 不在本阶段实现真实 Android Framework 或 HAL 运行环境。
- 不在本阶段训练、微调或托管 AI 模型。
- 不在本阶段重写现有 Node.js / Next.js 已发布题库。
- 不引入与课程蓝图无关的认证、计费、社区、内容编辑器或生产部署功能。

## 全站课程分层

NodePath 升级后采用“学院 -> 路线 -> 阶段 -> 知识点 -> 阶段项目”的层级。

```text
CourseDomain    学院，例如 frontend、ai、android
CourseTrack     学习路线，例如 python、network、ai-agent
CourseStage     阶段，例如 React 状态调试
LessonSpec      知识点，例如 useEffect 无限循环
QuestionSpec    题目，例如诊断题、修复题、执行顺序题
RuntimeSpec     运行反馈，例如日志、浏览器预览、网络请求
VisualizerSpec  可视化类型，例如事件循环、网络链路、函数图形
ProjectSpec     阶段项目，例如修复一个登录接口跨域事故
```

当前 Node.js 与 Next.js 应作为 `server` 与 `frontend` 相关路线继续存在，后续逐步迁移到统一模型，不需要一次性重写所有内容。

## 八个学院

### 1. 语言基础学院

覆盖 C、C++、Python、Kotlin、Java。

重点能力：

- 语法、类型、表达式、控制流、函数、模块。
- 内存模型、栈与堆、指针与引用、对象生命周期。
- 标准库、包管理、构建工具、测试工具。
- 并发模型，例如线程、协程、Future、锁、队列。
- 语言间差异，例如值语义、引用语义、垃圾回收、异常处理。

推荐运行舱：

- 调用栈与内存图。
- 变量生命周期动画。
- 编译 / 解释流程。
- 并发调度时间线。

### 2. 前端工程学院

覆盖 HTML、CSS、JavaScript、React、Next.js、浏览器机制、工程化、性能与调试。

重点能力：

- DOM、CSS 布局、事件、浏览器渲染流水线。
- React 状态、渲染、Hooks、组件边界。
- Next.js App Router、Server Components、Client Components、数据获取、Hydration。
- Vite / Next.js 构建、依赖、环境变量、模块解析。
- 丰富的前端报错调试案例。

推荐运行舱：

- Console / MicroBrowser。
- DOM 树与样式盒模型。
- Network 面板。
- React 渲染帧。
- Hydration 差异视图。

### 3. 计算机网络学院

覆盖 TCP/IP、DNS、TLS、HTTP、缓存、跨域、WebSocket、SSE、代理、网关。

重点能力：

- 从 URL 到页面显示的完整链路。
- HTTP 请求响应、状态码、Headers、Cookie、缓存。
- CORS、CSRF、鉴权 Token、Session。
- WebSocket 与 SSE 的连接生命周期。
- 前后端联调中的真实网络故障。

推荐运行舱：

- 请求链路图。
- DNS / TCP / TLS / HTTP 分层时间线。
- Network 瀑布流。
- 客户端、网关、服务端、数据库节点图。

### 4. 服务器开发学院

覆盖 API、数据库、缓存、队列、鉴权、并发、日志、监控、部署、生产事故。

重点能力：

- REST / RPC / GraphQL API 设计。
- 输入校验、错误模型、幂等性、限流、超时、重试。
- 数据库事务、索引、连接池、迁移。
- 缓存一致性、消息队列、后台任务。
- 可观测性、日志、指标、Tracing、事故复盘。

推荐运行舱：

- 服务拓扑图。
- Trace Span 时间线。
- 生产事故 HUD。
- 数据库查询计划简图。

### 5. Android 学院

覆盖 App 开发、Kotlin、Jetpack、Gradle、性能调试、Framework、Binder、HAL、JNI。

重点能力：

- Activity / Fragment / Compose / ViewModel / Lifecycle。
- Gradle、Manifest、资源系统、权限。
- Binder、System Service、AMS/WMS/PMS 等 Framework 调用链。
- JNI、HAL、AIDL、Native Service。
- App 卡顿、ANR、内存泄漏、启动优化。

推荐运行舱：

- App 组件生命周期图。
- Binder 调用链。
- Framework 层级图。
- App -> Framework -> Native -> HAL 的跨层链路。

### 6. AI 应用学院

覆盖 AI 应用开发、RAG、工具调用、函数调用、多模态应用、工作流编排、Prompt 工程、评测与安全。

重点能力：

- Prompt 设计与结构化输出。
- RAG 的索引、召回、重排、上下文组装。
- Function Calling / Tool Use。
- 多模态输入输出。
- 应用评测、回归测试、幻觉控制、权限与安全。

推荐运行舱：

- Prompt -> Model -> Tool -> Response 链路。
- RAG 检索命中文档视图。
- 工具调用参数与结果对照。
- 评测样本对比面板。

### 7. AI Agent 学院

覆盖 Agent 原理、Planner、Memory、Tool Use、多 Agent 协作、任务分解、观察-行动循环、失败恢复。

重点能力：

- Agent 的 Observe -> Think -> Act -> Reflect 循环。
- Planner 与 Executor 分工。
- 短期记忆、长期记忆、检索记忆。
- 工具选择、工具参数构造、错误恢复。
- 多 Agent 协作、冲突解决、上下文压缩。

推荐运行舱：

- Agent Trace 时间线。
- 任务树。
- 工具调用面板。
- Memory 命中与更新视图。

### 8. AI 数学学院

覆盖线性代数、概率统计、微积分、优化方法、信息论、Transformer 数学基础。

重点能力：

- 向量、矩阵、线性变换、特征值。
- 概率分布、期望、方差、贝叶斯思想。
- 导数、梯度、链式法则。
- 损失函数、梯度下降、学习率。
- Embedding、Attention、Softmax、位置编码。

推荐运行舱：

- 函数图像。
- 向量空间和矩阵变换动画。
- 概率分布图。
- 梯度下降路径。
- Attention 权重热力图。

## 统一学习流

所有路线默认遵循同一认知闭环：

```text
概念解释
-> 真实代码、公式、日志、截图或故障材料
-> 预测题 / 诊断题 / 修复题 / 补全题 / 执行顺序题
-> 确定性运行反馈
-> 可视化运行舱
-> 终端、浏览器、网络、数学图形或 Agent Trace
-> 知识总结
-> 阶段项目
```

课程可以根据学科调整材料形态，但不能跳过“做判断”和“看反馈”两个核心环节。数学课程不应只展示公式，需要同时提供概念解释、图形解释、函数变化和小代码实验。

## 题型体系

平台应保留并扩展当前 P1 题型：

- `prediction`：预测运行结果。
- `implementation`：选择正确实现。
- `diagnosis`：定位错误原因。
- `repair`：选择修复方案。
- `completion`：补全关键代码或公式步骤。
- `execution-order`：判断执行顺序。

新增建议题型：

- `trace-debug`：根据运行轨迹定位异常帧。
- `network-debug`：根据请求、响应、Headers、瀑布流判断故障。
- `visual-math`：根据图形、函数、参数变化判断数学含义。
- `agent-debug`：根据 Agent Trace 判断计划、工具、记忆或权限问题。
- `android-stack-debug`：根据日志、调用链或生命周期判断 Android 故障。

新增题型要优先通过通用 `QuestionSpec` 扩展，不要在单个路线里硬编码 UI。

## 可视化运行舱矩阵

| 运行舱 | 适用学院 | 说明 |
| --- | --- | --- |
| ConsoleRuntime | 全部 | 展示确定性日志、错误栈、命令输出 |
| MicroBrowser | 前端、网络、服务器 | 展示 URL、状态码、Headers、HTML/JSON/UI 预览 |
| NetworkTrace | 前端、网络、服务器 | 展示 DNS/TCP/TLS/HTTP、瀑布流、跨域和缓存 |
| MemoryStack | 语言基础、Android | 展示栈、堆、指针、引用、对象生命周期 |
| RuntimeTimeline | 全部 | 展示按帧执行、暂停、拖拽、单帧调阅 |
| IncidentHUD | 服务器、前端、Android | 展示生产故障指标、修复中、恢复状态 |
| AndroidSystemTrace | Android | 展示 App、Framework、Binder、Native、HAL 调用链 |
| AgentTrace | AI 应用、AI Agent | 展示 Planner、Memory、Tool Call、Observation |
| MathGraphLab | AI 数学 | 展示函数图形、向量变换、概率分布、梯度下降 |
| TransformerVisualizer | AI、AI 数学 | 展示 Token、Embedding、Attention、Softmax、上下文流 |

运行舱只消费课程数据和当前运行帧，不直接写进度，不执行不可信代码。

## 架构改造方向

第二阶段应围绕课程模型和注册表改造，而不是先大量写课程内容。

建议步骤：

1. 在 `lib/curriculum/types.ts` 中引入或扩展 `CourseDomain`、`CourseTrack`、`VisualizerSpec`、`RuntimeSpec`。
2. 将 `content/curriculum-registry.ts` 升级为多学院、多路线注册表。
3. 保持现有 `/nodejs` 与 `/nextjs` 可用，新增路线可以先使用动态路由或显式路由，不强制一次性迁移。
4. 把首页课程卡片升级为学院和路线选择，但首屏仍应是实际课程入口，不做营销页。
5. 让 `app/_components/learning-studio.tsx` 继续作为共享学习工作台，新增能力通过配置进入。
6. 将新运行舱作为独立组件接入统一 `VisualizerSpec`，避免在 LearningStudio 中膨胀条件分支。
7. 课程校验器需要支持多路线统计、已发布案例数、阶段项目数量、题型多样性和运行舱引用合法性。

## 样板路线选择

第一条新增样板路线推荐为“前端报错调试路线”。

选择理由：

- 与当前 Next.js 课程、MicroBrowser、Console、TraceTimelineScrubber 能力最接近。
- 能展示 NodePath 与普通文档教程的差异：学习者不是读错误原因，而是看材料、做诊断、修复并观察恢复。
- 前端真实报错案例丰富，适合快速验证新增题型和 Network / Browser 运行舱。
- 不需要真实沙箱也能通过确定性错误材料、日志、网络响应和 UI 预览形成完整体验。

## 前端报错调试路线草案

路线 ID 建议：`frontend-debugging`。

所属学院：`frontend`。

阶段设计：

1. 浏览器控制台与错误栈。
2. JavaScript 运行时错误。
3. DOM 与事件调试。
4. CSS 布局错位。
5. React 状态与渲染错误。
6. Next.js App Router 常见错误。
7. Hydration 与 Server / Client 边界。
8. Network、CORS、Cookie、Auth 调试。
9. 构建、依赖、环境变量错误。
10. 生产监控与事故复盘。

每个阶段默认包含 8 个知识点和 1 个阶段项目。样板阶段可以先发布 1 个阶段，验证数据模型、题型、运行舱和校验器，再扩展完整路线。

## 样板路线第一阶段建议

第一阶段：浏览器控制台与错误栈。

建议知识点：

1. 读取错误栈的第一现场。
2. 区分 SyntaxError、ReferenceError、TypeError。
3. 定位 undefined 属性访问。
4. 识别异步 Promise 报错。
5. 从 Source Map 回到源码。
6. 用 console.table / console.group 整理调试信息。
7. 判断错误是数据问题还是渲染问题。
8. 阶段项目：修复一个商品列表白屏事故。

阶段项目应触发 IncidentHUD，正确修复后显示恢复状态。普通知识点主要使用 ConsoleRuntime、MicroBrowser 和 RuntimeTimeline。

## 验收标准

全站蓝图完成后：

- 文档清楚描述 8 个学院、统一学习流、题型体系、运行舱矩阵和样板路线。
- 后续架构改造能直接从本文档推导实现计划。
- 样板路线具备明确阶段和第一阶段知识点草案。
- 文档不要求立即实现真实代码沙箱、Android 系统环境或 AI 模型训练。

架构改造完成后：

- 现有 Node.js / Next.js 路线仍可运行。
- 首页能表达多学院、多路线结构。
- 课程注册表支持多路线扩展。
- 学习工作台尽量通过配置区分路线，不复制多套 UI。
- 校验命令能覆盖多路线课程合法性。

样板路线完成后：

- 至少发布“前端报错调试路线”的第一阶段。
- 每个已发布知识点具备诊断或修复型互动。
- MicroBrowser、Console、TraceTimelineScrubber、IncidentHUD 至少被样板路线各使用一次。
- `npm run validate:curriculum`、`npm test`、`npm run lint`、`npm run build`、`git diff --check` 可通过。

## 风险与对策

- 风险：一次性扩展太多方向导致课程质量下降。
  对策：先建模型，再做样板路线，每次只扩展一条路线或一个阶段。

- 风险：学习工作台条件分支过多。
  对策：将差异放入 `VisualizerSpec`、`QuestionSpec` 和路线配置，组件只处理通用协议。

- 风险：数学和 AI 内容变成抽象讲义。
  对策：强制每节数学课包含概念、图形、函数或代码实验中的至少三类材料。

- 风险：Android Framework / HAL 缺少真实运行环境。
  对策：前期使用确定性调用链、日志和结构图，真实设备或模拟器训练作为独立后续计划。

- 风险：真实代码执行沙箱影响安全。
  对策：继续保持 authored trace，沙箱执行必须单独设计威胁模型和隔离方案。

## 后续实施顺序

1. 基于本文档创建架构改造计划。
2. 升级课程类型和注册表，保留现有路线兼容。
3. 更新首页课程选择，让学院和路线成为一等入口。
4. 扩展课程校验器，覆盖多路线和新运行舱引用。
5. 创建“前端报错调试路线”第一阶段样板。
6. 根据样板反馈再扩展 Python、网络或 AI Agent 路线。
