# NodePath 沉浸式学习体验设计

## 背景

NodePath 当前已经具备「概念讲解 → 代码案例 → 选择题预测 → authored trace 可视化运行 → 终端日志 → 知识总结」的核心学习闭环。用户希望进一步提高学习系统的吸引力，让学习者更愿意连续学习、更沉浸、更有探索欲。

本设计基于用户确认的 A+B 方向：

- A：Runtime Cockpit（运行时驾驶舱）。
- B：Knowledge Nebula（知识星云）。

最终体验定位为：

> 常态强沉浸，关键时刻极致反馈。

## 目标

让 NodePath 从「深色开发者学习工具」升级为「进入 Node.js 运行时空间的沉浸式学习舱」。

完成后应让学习者感受到：

- 自己正在驾驶一艘探索 Node.js 运行时的飞船。
- 每个知识点都是星云中的一个节点，学完会被点亮。
- 答对、运行、完成阶段项目都有可感知的能量反馈。
- 页面更有空间感、粒子感和游戏化吸引力，但代码与题目仍然清晰可读。

## 非目标

本次不做以下事情：

- 不引入 Three.js 或 WebGL 3D 引擎。
- 不重写课程内容系统。
- 不改变当前答题和 authored trace 执行逻辑。
- 不做用户账号、排行榜、社交系统。
- 不为了炫酷牺牲代码阅读、键盘可用性和低性能设备体验。

## 体验原则

### 1. 学习优先

视觉效果服务于学习节奏：

- 概念阅读时保持安静。
- 答题时增强聚焦。
- 运行时强化因果流动。
- 完成时释放奖励反馈。

代码区不能出现大幅抖动、强烈闪烁或低对比遮挡。

### 2. 常态强沉浸

页面常态应该有明显空间氛围：

- 深空背景。
- 低速粒子漂浮。
- 柔和星云光晕。
- 透视网格或仪表舱边框。
- 卡片玻璃质感与微光描边。

这些效果应持续存在，但不抢焦点。

### 3. 关键时刻极致反馈

以下动作允许更强动效：

- 选择正确答案。
- authored trace 开始运行。
- authored trace 运行完成。
- 阶段项目完成。
- 阶段全部完成。

这些反馈可以包含能量流、粒子脉冲、星体点亮、能量环扩散和完成面板升起。

### 4. 可降级

必须支持 `prefers-reduced-motion`：

- 禁用持续粒子漂浮。
- 禁用大幅位移和循环动画。
- 保留颜色、层级和静态空间感。

低端设备上应能退化为静态背景和轻量 CSS 光效。

## 整体设计

### Runtime Cockpit：运行时驾驶舱

将页面主框架包装成驾驶舱：

- 顶栏是任务控制台。
- 侧边栏是星域导航和学习雷达。
- 主学习区是当前任务窗口。
- Runtime Visualizer 是运行时反应堆。
- Terminal 是飞船控制台日志。

拟新增视觉元素：

- `app-shell` 增加深空径向光与驾驶舱透视网格。
- 顶栏增加 `mission-control` 状态语言，例如「SYNC」「ENERGY」「NODE SIGNAL」。
- 当前课程标题区域增加能量扫描线。
- 面板边缘加入低强度内发光。
- 正确答案后，绿色能量流从答案卡片进入 Runtime Visualizer。

### Knowledge Nebula：知识星云

将学习进度从线性列表升级为星云感：

- 每个阶段是一片星域。
- 每个知识点是一颗星体。
- 已发布课程为微亮星点。
- 已完成课程为高亮星点。
- 当前课程为脉冲星。
- 阶段项目为更大的核心星体。

首版可以不完全替换侧边栏列表，而是在侧边栏顶部或路线区域增加一个「星云进度层」：

- 总进度显示为星云能量环。
- 当前阶段显示为星域名。
- 完成课程时触发星体点亮动画。

### Moment Effects：关键时刻效果

按学习状态绑定视觉反馈：

| 状态 | 视觉反馈 |
| --- | --- |
| `idle` | 背景低速漂浮，当前课程星体微光 |
| `wrong` | 答案区域轻微红色扰动，粒子短暂熄灭 |
| `running` | Runtime Visualizer 出现能量流，当前 lane 更立体 |
| `success` | 终端显示 `exit 0` 后，能量环扩散，知识星体点亮 |

完成阶段项目时额外触发：

- 星域能量环扩散。
- 阶段核心星体点亮。
- 总进度条短暂增强。

## 组件设计

### `ImmersiveBackdrop`

职责：

- 渲染全局粒子、星云和深空背景。
- 根据学习状态调整粒子强度。
- 响应 `prefers-reduced-motion`。

建议实现：

- 使用 `<canvas>` 绘制轻量粒子。
- 不引入第三方 3D 库。
- 粒子数量根据窗口大小限制。
- `idle` 粒子低速漂浮。
- `running` 增加轻微流向。
- `success` 触发一次扩散脉冲。

输入：

```ts
type ImmersiveBackdropProps = {
  status: "idle" | "running" | "wrong" | "success";
  progressPercent: number;
};
```

### `NebulaProgress`

职责：

- 将总学习进度表达成知识星云。
- 展示阶段星域、当前课程星体和完成状态。
- 保留现有路线列表，不破坏可读性。

建议实现：

- 使用 HTML + CSS 渲染 10 个阶段星域。
- 每个阶段显示完成比例。
- 当前阶段有脉冲光晕。
- 完成阶段项目后显示核心星体点亮。

输入：

```ts
type NebulaProgressProps = {
  stages: RoadmapStage[];
  activeStageId: string;
  progressPercent: number;
};
```

### `EnergyRunway`

职责：

- 连接「答题区域」与「Runtime Visualizer」。
- 正确回答后显示能量流，提示学习者进入运行观察。

建议实现：

- 使用 CSS pseudo-element 或轻量 div。
- `running` 时出现流动线。
- `success` 时淡出并触发完成光环。

输入：

```ts
type EnergyRunwayProps = {
  status: "idle" | "running" | "wrong" | "success";
};
```

### `CompletionBurst`

职责：

- 成功完成课程或阶段项目时给出短暂奖励反馈。
- 不遮挡总结卡片的主要内容。

建议实现：

- 课程完成：小型能量环。
- 阶段项目完成：更大的星域点亮。
- reduced motion 下改为静态高亮。

输入：

```ts
type CompletionBurstProps = {
  visible: boolean;
  variant: "lesson" | "project";
};
```

## 状态与数据流

沿用现有状态：

```text
idle -> wrong
idle -> running -> success
```

视觉层只读取状态，不改变学习逻辑：

```text
LearningStudio
  -> status
  -> progressPercent
  -> lesson.stageId
  -> lesson.kind
  -> ImmersiveBackdrop
  -> NebulaProgress
  -> EnergyRunway
  -> CompletionBurst
```

视觉组件不得直接写入进度仓储，也不得触发课程切换。

## 样式系统

新增设计 token：

```css
--cyan: #6ee7ff;
--violet: #7c5cff;
--nebula: rgba(124, 92, 255, 0.18);
--glass: rgba(13, 17, 23, 0.68);
--glow-green: 0 0 32px rgba(159, 232, 112, 0.28);
--glow-cyan: 0 0 32px rgba(110, 231, 255, 0.22);
```

新增视觉层级：

- `.space-backdrop`
- `.space-canvas`
- `.cockpit-grid`
- `.nebula-progress`
- `.energy-runway`
- `.completion-burst`

需要注意：

- 背景层必须 `pointer-events: none`。
- z-index 不得覆盖按钮、链接和代码滚动区域。
- 移动端减少粒子和装饰层，优先保持内容宽度。

## 响应式与可访问性

桌面端：

- 保留完整粒子背景。
- 显示 NebulaProgress。
- Runtime Visualizer 增强立体感。

平板端：

- 降低粒子数量。
- 星云进度压缩为水平能量条。

移动端：

- 关闭或弱化 canvas 粒子。
- 保留静态星云背景。
- 不增加横向滚动。

可访问性：

- 支持 `prefers-reduced-motion`。
- 按钮焦点样式不能被发光效果淹没。
- 代码对比度不得降低。
- 动效不使用高频闪烁。

## 测试策略

新增或更新测试：

- `ImmersiveBackdrop` 在 reduced motion 场景下不启动持续动画。
- `NebulaProgress` 正确渲染阶段数量和当前阶段。
- `EnergyRunway` 根据 `status` 输出对应状态类名。
- `CompletionBurst` 根据 `variant` 渲染课程或项目完成反馈。

保留全量验证：

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

视觉验收：

- 桌面宽度下背景、驾驶舱和星云层可见。
- 代码区滚动和复制仍然可用。
- 答错、答对、运行中、完成 4 个状态都有不同视觉反馈。
- 移动端无水平页面溢出。
- reduced motion 下没有持续移动粒子。

## 文档更新

实现完成后更新：

- `docs/PRODUCT.md`：增加沉浸式学习体验说明。
- `docs/ARTICHECTURE.md`：记录视觉组件边界和状态流。
- `session-handoff.md`：记录视觉体验实现状态和验证结果。

## 验收标准

- 学习页面明显具备空间感、粒子感和驾驶舱氛围。
- 学习者完成一次正确答题时，可以看到「答案 → 运行 → 总结」的能量流动。
- 课程完成反馈足够强，阶段项目完成反馈更强。
- 代码、题目、总结的可读性不下降。
- 不引入新的后端依赖或 WebGL 依赖。
- 所有自动化验证命令通过。
