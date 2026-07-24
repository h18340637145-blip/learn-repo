# 多课程分层学习体验设计规格

日期：2026-07-24  
状态：已批准  
范围：首页导航改版 + 学习体验升级 + Python 路线扩展

---

## 1. 首页导航改版

### 1.1 筛选 Tab

首页顶部新增水平筛选栏，包含四个 Tab：

- **入门推荐**：筛选所有课程阶段 00–03 的内容
- **进阶挑战**：筛选阶段 04–07
- **实战项目**：筛选阶段 08–10
- **全部**（默认）：展示完整课程卡

筛选为纯前端行为，不涉及服务端请求。

### 1.2 课程卡增强

- 显示当前筛选 Tab 对应的进度百分比
- 显示课程难度范围标签（如 ★☆☆ ~ ★★★）
- 未解锁区段的课程卡显示锁定提示和解锁条件

### 1.3 数据模型

`CourseSpec` 新增：

```typescript
difficultyTiers: {
  beginner: StageId[];      // 阶段 00–03
  intermediate: StageId[];  // 阶段 04–07
  advanced: StageId[];      // 阶段 08–10
}
```

首页筛选逻辑纯函数：

```typescript
filterCoursesByTier(courses: CourseSpec[], tier: DifficultyTier, progress: ProgressSnapshot[]) → CourseCardViewModel[]
```

### 1.4 保留学院分组

Tab 筛选后，课程卡仍按学院 (CourseDomainId) 分组排列，保持当前 `courseDomains` 结构不变。

---

## 2. 学习体验升级

### 2.1 阶段解锁逻辑

**规则：** 完成阶段 N 中 ≥ 70% 知识点即可解锁阶段 N+1。

```typescript
function isStageUnlocked(
  stageNumber: number,
  progress: ProgressSnapshot,
  curriculum: CurriculumStage[]
): boolean;
// 阶段 0 始终解锁
// 阶段 N+1 解锁条件：阶段 N 已完成知识点数 ≥ ⌈总知识点数 × 0.7⌉
```

**UI 表现：**
- 未解锁阶段在侧边栏和星图中显示锁定图标
- 点击锁定阶段展示"还需完成 X 个知识点"提示
- 解锁瞬间触发 `AchievementUnlock` 反馈
- 锁定阶段可查看预告内容但不能答题

**阶段项目不强制**：阶段项目完成不影响下一阶段解锁判断。

### 2.2 知识点难度标注

`LessonSpec` 新增字段：

```typescript
difficulty: 1 | 2 | 3;  // 1=★☆☆, 2=★★☆, 3=★★★
```

**默认分配规则**（课程工厂自动应用）：
- 阶段内前 3 个知识点：difficulty = 1
- 阶段内中间 3 个知识点：difficulty = 2
- 阶段内最后 2 个知识点：difficulty = 3
- 阶段项目：difficulty = 3

**UI 展示：**
- 侧边栏知识点名称旁显示星级图标
- 阶段星图节点用颜色区分难度（绿/橙/红）
- 阶段星图节点大小随难度递增

### 2.3 学习路径可视化

侧边栏阶段列表按三段分隔：

```text
═══ 入门 ═══
阶段 00 ... ✅
阶段 01 ... 🔵
═══ 深入 ═══
阶段 04 ... 🔒
═══ 实战 ═══
阶段 08 ... 🔒

── 路径进度 ──
入门 ████░░ 60%
深入 ░░░░░░  0%
实战 ░░░░░░  0%
```

新增纯函数：

```typescript
function buildPathProgress(
  progress: ProgressSnapshot,
  curriculum: CurriculumStage[],
  tiers: CourseSpec['difficultyTiers']
): { beginner: number; intermediate: number; advanced: number };
// 返回每段完成百分比 (0–100)
```

### 2.4 数据流

```text
ProgressSnapshot + Curriculum + LessonSpecs
  → isStageUnlocked() 判定每阶段状态
  → buildPathProgress() 计算三段进度
  → StageSidebar 渲染分区 + 锁定态 + 路径进度条
  → StageSpaceMap 节点显示难度颜色/大小
  → HomePage 筛选 Tab 显示对应进度
```

---

## 3. Python 路线扩展（阶段 04–10）

### 3.1 方向：自动化/脚本

| 阶段 | 区段 | 标题 | 阶段项目 |
|------|------|------|----------|
| 04 | 深入 | 文件批处理与路径操作 | CLI 批量重命名工具 |
| 05 | 深入 | 正则表达式与文本解析 | 日志格式转换器 |
| 06 | 深入 | HTTP 请求与数据抓取 | 结构化数据采集脚本 |
| 07 | 深入 | CLI 工具与参数解析 | 多功能 CLI 工具箱 |
| 08 | 实战 | 定时任务与调度 | 定时监控报警脚本 |
| 09 | 实战 | 系统运维与进程管理 | 服务健康检查器 |
| 10 | 实战 | 综合自动化项目 | 自动化部署流水线 |

### 3.2 每阶段结构

- 8 个知识点 + 1 个阶段项目
- 知识点至少 2 道题，阶段项目至少 3 道题
- 题型覆盖 prediction、implementation、diagnosis、repair（每阶段 ≥ 3 种）
- 每个知识点配 authored trace（≥ 3 帧）

### 3.3 阶段 04 知识点明细

1. pathlib 路径对象 ★☆☆
2. glob 模式匹配 ★☆☆
3. shutil 文件操作 ★☆☆
4. os.walk 递归遍历 ★★☆
5. 文件编码与 BOM ★★☆
6. 临时文件与原子写入 ★★☆
7. 文件锁与并发安全 ★★★
8. 批量操作事务回滚 ★★★

### 3.4 实现路径

- 新增 `content/lessons/python/` 目录，每阶段独立文件（`stage-04-file-batch.ts` 等）
- 复用 `lesson-factory.ts` 模式生成标准 `LessonSpec[]`
- `content/curriculum-registry.ts` 中 Python 课程的已发布阶段范围扩展至 10
- `content/lesson-registry.ts` 中 `getLessonsByCourse('python')` 聚合新阶段
- authored trace 展示 Python 脚本执行流程（文件操作、网络请求、进程调度）

### 3.5 Python 阶段 05–10 知识点大纲

**阶段 05：正则表达式与文本解析**
1. re 模块基础 ★☆☆
2. 分组与命名捕获 ★☆☆
3. 贪婪与非贪婪匹配 ★☆☆
4. 多行与 DOTALL 模式 ★★☆
5. re.sub 替换与回调 ★★☆
6. 结构化文本提取 ★★☆
7. 大文件逐行解析 ★★★
8. 解析器组合与容错 ★★★

**阶段 06：HTTP 请求与数据抓取**
1. urllib 与 requests 基础 ★☆☆
2. 请求头与会话管理 ★☆☆
3. JSON/表单提交与响应处理 ★☆☆
4. 重试与超时策略 ★★☆
5. 分页与翻页抓取 ★★☆
6. BeautifulSoup 与 CSS 选择器 ★★☆
7. 反爬对策与 robots.txt ★★★
8. 异步并发抓取 ★★★

**阶段 07：CLI 工具与参数解析**
1. argparse 基础 ★☆☆
2. 子命令与互斥参数 ★☆☆
3. click 框架入门 ★☆☆
4. 输入验证与错误提示 ★★☆
5. 交互式提示与进度条 ★★☆
6. 配置文件与环境变量 ★★☆
7. 插件架构与动态加载 ★★★
8. 打包分发与入口点 ★★★

**阶段 08：定时任务与调度**
1. time 与 datetime 处理 ★☆☆
2. schedule 库定时执行 ★☆☆
3. cron 表达式与系统 crontab ★☆☆
4. APScheduler 调度器 ★★☆
5. 任务持久化与恢复 ★★☆
6. 并发任务与线程池 ★★☆
7. 失败重试与死信队列 ★★★
8. 监控告警与日志聚合 ★★★

**阶段 09：系统运维与进程管理**
1. subprocess 与管道 ★☆☆
2. psutil 系统监控 ★☆☆
3. signal 信号处理 ★☆☆
4. 守护进程与 PID 文件 ★★☆
5. systemd 单元与服务管理 ★★☆
6. 日志轮转与归档 ★★☆
7. 资源限制与 OOM 防护 ★★★
8. 故障自愈与优雅退出 ★★★

**阶段 10：综合自动化项目**
1. 项目结构与配置管理 ★☆☆
2. 多环境变量与密钥管理 ★☆☆
3. SSH 远程执行（paramiko/fabric）★★☆
4. 文件同步与增量传输 ★★☆
5. 构建流水线编排 ★★☆
6. 健康检查与回滚策略 ★★★
7. 通知集成（邮件/Webhook）★★★
8. 端到端流水线测试 ★★★

---

## 4. 技术约束

- 首页保持 Server Component，筛选 Tab 通过独立 Client Component 包裹
- 解锁逻辑为纯函数，不依赖服务端状态（基于 localStorage 进度）
- 难度字段向后兼容：未标注 difficulty 的旧课程默认 difficulty = 1
- Python 课程不执行真实 Python 代码，仍使用 authored trace
- 所有新增课程通过 `npm run validate:curriculum` 校验

## 5. 不在范围内

- Supabase 用户系统（单独迭代）
- 真实代码沙箱执行
- 其他蓝图路线扩展（本轮只做 Python）
- 付费/会员体系
