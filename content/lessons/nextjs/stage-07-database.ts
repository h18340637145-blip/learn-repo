import type { LessonSpec } from "../../../lib/curriculum/types";
import { createNextjsQuickLesson } from "./nextjs-quick-lesson";
import { createNextjsLessonSpec } from "./nextjs-lesson-factory";

export const nextjsStageSevenDatabaseLessons: LessonSpec[] = [
  createNextjsLessonSpec({
    id: "nextjs-db-prisma-setup",
    stageId: "nextjs-database",
    kind: "knowledge",
    eyebrow: "07.1 · 数据库与 ORM",
    title: "Prisma 初始化与架构",
    objectives: ["了解 Prisma ORM 是什么以及如何与 Next.js 结合以获得端到端的类型安全"],
    prerequisites: ["nextjs-foundations-app-router"],
    concept: "虽然你可以直接写原生 SQL 去连数据库，但在现代全栈 TypeScript 项目中，大家更偏爱 ORM（对象关系映射）库。Prisma 是目前 Next.js 生态中最主流的选择。你只需要用它特有的清爽语法（`schema.prisma`）写出数据库里有什么表，它就能极其智能地为你**自动生成极其详尽、完美的 TS 类型代码和可供 Next 后端随心调用的查询客户端。**",
    points: ["依靠单一事实来源 schema.prisma 进行模型建立", "它会根据你的模型自动为你下放一整个包含各种查询方法的智能 PrismaClient", "与 Server Components 结合堪称绝配（在服务端查完直接喂给组件即可）"],
    memoryHook: "写模型生代码，全栈类型一把抓",
    files: [{ name: "prisma/schema.prisma", code: `// 极简的模型描述语言，看着就像写 JSON 一样舒服
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // 或者 mysql, sqlite 等
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]   // 极其优雅的关联关系，一查全都有
  createdAt DateTime @default(now())
}

model Post {
  id       Int     @id @default(autoincrement())
  title    String
  authorId String
  author   User    @relation(fields: [authorId], references: [id])
}` }, { name: "lib/db.ts", code: `import { PrismaClient } from '@prisma/client'

// 这是一种解决在开发模式下 Next.js 热更新导致反复连爆数据库连接池的高级技巧
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma` }],
    entryFile: "lib/db.ts",
    answer: {
      type: "prediction",
      prompt: "在这个结构下，如果我在 Next.js 的服务端组件里执行了 `const user = await prisma.user.findUnique(...)`，在 VS Code 开发环境中 `user.email` 会有代码自动提示和标红报错的防呆保护机制吗？",
      options: [
        { id: "a", label: "不会，数据库数据返回的都是 any (未知对象) 类型", detail: "旧时代的隐患", feedback: "那是老旧的轻量或者低劣框架的恶习。" },
        { id: "b", label: "会，而且它的提示是基于你 `schema.prisma` 里写的模型百分之百生成并对齐的，极度精准", detail: "终极同构神教", feedback: "正确：这种称之为“端到端类型安全（End-to-End Type Safety）”的特性是这套组合拳制霸前沿技术栈的终极原因。" },
        { id: "c", label: "你需要自己手动去手写一份 `interface User { ... }` 对应上它才会生效", detail: "麻烦的重复劳作", feedback: "Prisma 强大的引擎会替你把这份最折磨人的劳务全包了。" }
      ],
      answerId: "b",
      correctExplanation: "这是开发体验（DX）的史诗级跨越：你只在一处定义（`schema.prisma`），只要敲下一个回车生成代码。在后续无数次重构、查库和往前端传数据的千丝万缕的代码调用链路中，所有的数据仿佛都穿上了极其刚硬的安全防弹衣！你打错任何一个诸如 `user.emial` 的小错误，编译器连保存运行的机会都不会给你，当面就会直接飘红呵斥你改正，将 Bug 的发现时机提早到了“敲击键盘”的那一毫秒！"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "无缝同构打通系统图", nodes: ["编写 Prisma 纲领", "引擎生成魔法客户端", "Server组件唤起代码提示", "完美传递", "安全展示 UI"] },
      lanes: ["统一规格化定制", "TS 类型强制化注入", "开发体验极爽呈现"],
      frames: [
        { activeLane: 0, laneValues: ["利用简单直白的语言勾勒出 User 和 Post 的从属关系", "等待", "等待"], log: ["Prisma 进行深度扫掠，提取模型实体并理解内部嵌套的那些暗含联结"], note: "它是凌驾于枯燥难读且极容易写出大问题的原生 SQL 之上的高级思维艺术品", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用其在本地环境为你独家定做智能辅助包", "等待"], log: ["向你的 node_modules 里默默埋进了一份长达上万行却极其严密的包含 .d.ts 声明的工具类客户端库"], note: "这全是机器替你打的黑工，极其牢固没有差错", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "爽到灵魂深处的编码体验"], log: ["当你敲下那一个点 . 的时候，极其丝滑智能的提示栏弹了出来准确显示所有的列元素表！"], note: "杜绝了运行时才发现未定义异常的灾难，体验到了工程的纯粹与美丽", delayMs: 800 }
      ]
    },
    sources: [{ title: "Prisma", url: "https://www.prisma.io/nextjs" }],
    summary: ["一次书写，终身受用：打造坚若磐石般的跨组件通讯模型护甲", "利用强大的代码生成能力消弭了最让人恶心的手动比对重复维护痛苦", "极其完美融入 Next.js 深邃广阔的服务端架构体系和高并发基建中"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-db-crud-operations",
    stageId: "nextjs-database",
    kind: "knowledge",
    eyebrow: "07.3 · 数据库与 ORM",
    title: "CRUD 及其高级关联查询",
    objectives: ["熟悉在 Next.js 服务端逻辑中如何丝滑畅快地调动和获取各种复杂关系层级数据"],
    prerequisites: ["nextjs-db-prisma-setup"],
    concept: "我们最常见的问题是如何通过外键联表。原生 SQL 中写 `JOIN` 时常让人头皮发麻。但在 Next+Prisma 里，由于我们之前通过 `schema.prisma` 绑定好了 `author` 和 `posts` 的所属关系。我们可以直接像嵌套读对象一样，用短短一行代码在取人的同时把这个人写的帖子全顺带取回来（通过 `include`），并直接返回给 React 页面组件进行极其无脑的嵌套 map 渲染！",
    points: ["极其扁平与舒适的 JS 对象链式调用法替代大篇幅晦涩的连表查找代码", "include 机制实现一次查库带出多级复杂关系网", "其天然返还的 Promise 和 Server Components 构成完美搭配"],
    memoryHook: "一个点查全家，联表就像翻书抓",
    files: [{ name: "app/users/[id]/page.tsx", code: `import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function UserProfile({ params }: { params: { id: string } }) {
  // 瞧瞧这行极其优美的取数艺术代码！
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      posts: {
        where: { published: true }, // 连带出来的帖子还可以单独附带次级的过滤条件！
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) notFound(); // Next 内置救火方法：直接抛出无页面警告并跳转去 404！

  return (
    <main>
      <h1>{user.name} 的主页</h1>
      <h2>已发布的牛逼文章列表：</h2>
      <ul>
        {user.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}` }],
    entryFile: "app/users/[id]/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在传统的客户端请求（例如 Axios 时代），我们可能需要发一次请求去拿 User 信息，再根据这个 `userId` 发第二次请求去拿所属的 `posts` 列表。而在这段 Next.js 代码中，在完成最终页面的构建渲染期间，我们向外部真实的物理数据库主机发起过几次底层的查表问询网络连线？",
      options: [
        { id: "a", label: "2 次，先找人再找文", detail: "因为结构上是拆分开展示的", feedback: "虽然可以拆，但这里特意利用了强大的关联查询聚合了它们。" },
        { id: "b", label: "由于使用了 `include`，底层的 ORM 引擎将其智能编译和整合化作了只有唯一 1 次的高效单条 SQL 指令查库！", detail: "高度浓缩提取法", feedback: "正确：极大程度降低了连接数过剩以及网络延迟（N+1 查询噩梦）的发生概率。" },
        { id: "c", label: "0 次，因为它在构建阶段就把人查完了", detail: "时空错乱", feedback: "这依赖于你的路由动态参数，必须是在运行时查库。" }
      ],
      answerId: "b",
      correctExplanation: "全栈开发在很大程度上就是“跟数据折腾斗争”。Next.js 鼓励你在极其靠近数据的服务器中心把这些琐碎的事情“毕其功于一役”。而 Prisma 在底层极其巧妙地把这段带有 `include` 的优美 JS 对象树结构，转译成了极高深复杂的单行或高度优化的 `LEFT JOIN` 的 SQL 底层原生密语投射进物理数据库中。这种把极度粗重苦累的技术黑盒，用轻盈易懂的前端语法展现出来的做法，就是工程上最高的审美。"
    },
    execution: {
      visualizer: { type: "nextjs-data-flow", title: "嵌套提取并直出组合呈现法", nodes: ["接收页面匹配器", "启动 Prisma 查询树", "ORM转译并射发黑盒底层通讯", "拿到深邃庞大的大对象", "嵌套直灌 React"] },
      lanes: ["需求生成区", "底层翻译投射去机房", "前端享受成品"],
      frames: [
        { activeLane: 0, laneValues: ["传入对于小明(id: 1)主页的极度好奇探视", "等待", "等待"], log: ["代码生成并抛出一条带有嵌套条件的 findUnique JS 请求块"], note: "非常直观且人脑极其容易理解阅读的代码", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "利用其在背地的强力引擎拼装", "等待"], log: ["将其极速转译为一条极度繁琐的包含了 WHERE 和 LEFT OUTER JOIN 以及各种联表限定词的 SQL 长语句，抛入深海！"], note: "利用引擎替人类包办这极其容易拼错而且难以优化的粗活", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "接盘回执"], log: ["取回一个结构精美完美对齐的深层对象，React 直接 .posts.map 开花展示！"], note: "整个世界豁然开朗而且没出丝毫 Bug", delayMs: 800 }
      ]
    },
    sources: [{ title: "Prisma Queries", url: "https://www.prisma.io/docs/concepts/components/prisma-client/crud" }],
    summary: ["消除恶劣的客户端二次连线造成的网络雪崩效应并强力收紧防备黑客抓口", "利用极其容易懂且能完美对应 React 组件树层级观念的心智手法写数据连表获取", "其天生自带异常抛出的拦截体制并利用 Next 原生 404 函数兜底使得体验极佳"]
  }),

  createNextjsLessonSpec({
    id: "nextjs-db-server-actions-db",
    stageId: "nextjs-database",
    kind: "knowledge",
    eyebrow: "07.4 · 数据库与 ORM",
    title: "Server Actions + 数据库 (Mutation)",
    objectives: ["全栈融会贯通：掌握从页面收集表单到利用动作将其永久刻入真实库表的全流程闭环"],
    prerequisites: ["nextjs-data-server-actions", "nextjs-db-crud-operations"],
    concept: "读数据很简单（通过 Server Components 直接渲染）。但“写”数据怎么处理？将 Next.js 这个黑魔法——`Server Actions` 与 Prisma `create` 相结合，你不需要写任何独立的 API 端点代码。直接在页面的按钮上挂一个跑在服务器上的变更函数！这就是未来全栈应用标准的最速更新写法，简单到甚至有些让人怀疑这到底是不是合法的。",
    points: ["在 actions 中利用 'use server' 定义函数", "在内获取表单信息并在利用 prisma.table.create 或者 update 永久变动底层资料", "操作一旦完成立刻通过 revalidatePath 让包含查询的旧页面刷新，把新数据弹回前台展示！"],
    memoryHook: "Action 进，DB 存，擦缓存，秒更新",
    files: [{ name: "app/actions.ts", code: `'use server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// 你不再需要苦哈哈去写个 fetch('/api/xxx') 接口了！
export async function createPost(formData: FormData) {
  // 利用原生语法极其便利地收集提取输入狂值
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // 这句指令将在千里之外的异地机房深处永久改写物理磁盘资料！
  await prisma.post.create({
    data: {
      title,
      content,
      authorId: 'user_xyz123' // 假装这是从上面的 auth() 拿出来的当前操作人
    }
  })
  
  // 神之一手：利用大屠杀指令逼迫包含列表的页面的那个老缓存作废并且在极快的时间内重新向库里询问要来那个包含了刚才加入新元素的列表呈现并退回用户眼前。
  revalidatePath('/posts')
}` }, { name: "app/posts/page.tsx", code: `import { createPost } from '../actions'
import { prisma } from '@/lib/db'

export default async function PostsPage() {
  const posts = await prisma.post.findMany() // 负责从库里拿来呈现
  
  return (
    <main>
      <form action={createPost}>
        <input name="title" placeholder="输入炫酷的标题..." />
        <input name="content" placeholder="尽情施展才华吧..." />
        <button type="submit">一键发射至数据库！</button>
      </form>
      
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </main>
  )
}` }],
    entryFile: "app/actions.ts",
    answer: {
      type: "prediction",
      prompt: "如果我点击了“一键发射至数据库！”按钮，在极其极其短暂的时间内，Next 这一整套机器系统在底子底下跑完了哪几个绝密的连续流程才使得你最终在下面那个带有 `ul` 标签的列表区域看到了新的内容出现？",
      options: [
        { id: "a", label: "只是把东西直接在前端的那个 ul 里面写死加塞展示了，压根没去后端走一圈以提高体验", detail: "纯前端欺诈自嗨模式", feedback: "一旦刷新这个假列表就会原形毕露，但 Server Action 是来真的。" },
        { id: "b", label: "把表单资料在后台隐秘打成特殊报文送到远端 -> 远端执行 Prisma 存库成功 -> 执行清掉这个列表的缓存指令 -> 强迫列表区块再次利用 findMany() 跑一遍真查询 -> 顺着刚才还没关的返回通道将那个最新的带着新条目的列表局部补发给浏览器强行替换替换渲染上去！", detail: "极度暴力的双向渗透穿插全垒打", feedback: "正确：这便是 Next 引以为傲的 RPC 化无缝衔接神迹！" },
        { id: "c", label: "跳转到了一个写着成功的小页面并且又跳回来了重新完全整页重载一次", detail: "远古的传统大换血跳转", feedback: "这不但极慢还会引发明显的闪屏。" }
      ],
      answerId: "b",
      correctExplanation: "这种在 Next 里面叫做“Mutation（变异提交）”的过程展现了全栈结合的最强统治力：数据双向无缝且极速流转。传统架构里，这个操作横跨了起码三个单独的工种甚至三座城市：(前端写请求 -> 中台接应验毒并转换 -> 数据库去进行存取)。现在你不仅在同一个编辑器文件视图内就统合并且写完了这三步极其凶险的内容，更可怖的是利用了 `revalidatePath` 形成的一套瞬间完成的超级局部破防替死鬼刷新操作。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "无缝全垒打入库刷新体系", nodes: ["输入引发特殊发送", "远端截留并调用 ORM", "落子成定局存库", "擦除缓存板并牵出查询重新获取", "夹带私货顺流逆传回并直接拼装局部 UI"] },
      lanes: ["前沿侦查发起点", "深处暗室数据操刀", "雷霆回击闭环"],
      frames: [
        { activeLane: 0, laneValues: ["按下发射并且触发其挂载在暗处的黑盒", "等待", "等待"], log: ["无任何刷新跳转现象发生的静默后台封包发送流程动作启动"], note: "这是 React 对表单特有截持带来的魔术", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "ORM 将数据永久压死在硬盘内并且爆破缓存", "等待"], log: ["Prisma 落锤成定音，并抛出 revalidatePath '/posts'"], note: "利用对缓存控制的霸权进行清盘动作", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "裹挟最新成果物火速前线报道"], log: ["原本那个 page.tsx 在后台被迫重跑渲染出带有新数据的 HTML 并且通过响应长道怼回给前端替换呈现！"], note: "完成一套连招行云流水快得不可思议", delayMs: 800 }
      ]
    },
    sources: [{ title: "Mutating Data", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations" }],
    summary: ["颠覆式的数据落盘模式：扔掉恶心晦涩又需要反复拉齐对账的三方 API 网关系统", "将存与取和强力的刷新闭环统合在一线之间", "让开发者可以把极其充裕的海量心力投身到构筑伟大业务上而不是写基础架构接口。"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-db-schema-migration",
    stageId: "nextjs-database",
    eyebrow: "07.2 · 数据库与 ORM",
    title: "Schema 与迁移",
    objectives: ["理解 schema 变更如何安全演进到真实数据库结构"],
    prerequisites: ["nextjs-db-prisma-setup"],
    concept: "数据库 schema 不是随手改表。团队协作时必须把模型变更记录成 migration 文件，经过代码审查和部署流水线执行，才能让本地、预览、生产环境的表结构保持一致。",
    points: ["schema.prisma 是应用层模型的单一事实来源", "migration 文件记录从旧结构到新结构的可复现步骤", "生产环境迁移要避免破坏性删列和长事务锁表"],
    memoryHook: "模型先落卷，迁移再改库",
    fileName: "prisma/schema.prisma",
    code: `model Post {
  id        Int      @id @default(autoincrement())
  title     String
  slug      String   @unique
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}`,
    prompt: "给 Post 新增唯一 slug 字段后，为什么不能只改 TypeScript 类型而不生成 migration？",
    correctLabel: "因为真实数据库表并不会自动长出 slug 列，迁移文件才会把结构变化同步到数据库",
    wrongLabels: ["因为 TypeScript 类型会在运行时自动创建列", "因为 Next.js 只支持静态 JSON 数据"],
    correctExplanation: "ORM 类型只约束代码，真实库表需要 migration 才能改变。否则服务端代码访问 post.slug 时，数据库仍然没有对应列，会在运行时失败。",
    visualizerType: "nextjs-data-flow",
    visualizerTitle: "Schema 迁移同步流",
    nodes: ["修改模型", "生成 migration", "审查 SQL", "部署执行", "代码与库表对齐"],
    sourceTitle: "Prisma Migrate",
    sourceUrl: "https://www.prisma.io/docs/orm/prisma-migrate",
    summary: ["迁移是数据库结构演进的版本控制", "类型生成不能替代真实库表变更", "生产迁移要考虑锁表、回滚和兼容窗口"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-db-transactions",
    stageId: "nextjs-database",
    eyebrow: "07.5 · 数据库与 ORM",
    title: "事务处理",
    objectives: ["掌握多步写入必须全部成功或全部回滚的场景"],
    prerequisites: ["nextjs-db-server-actions-db"],
    concept: "转账、下单、扣库存这类操作不能只成功一半。事务把多条数据库写入包成一个原子动作：任何一步失败，前面已经写入的内容都要回滚，避免出现扣钱成功但订单没创建的灾难。",
    points: ["事务保证原子性，一组写入要么全成要么全退", "Server Action 中的 mutation 常需要事务保护", "事务内部不要执行过慢外部 HTTP 调用，避免长期占锁"],
    memoryHook: "多步同生死，失败全撤回",
    fileName: "app/actions/checkout.ts",
    code: `"use server";
import { prisma } from "@/lib/db";

export async function checkout(userId: string, sku: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { sku },
      data: { stock: { decrement: 1 } }
    });
    if (product.stock < 0) throw new Error("库存不足");
    return tx.order.create({ data: { userId, sku } });
  });
}`,
    prompt: "如果库存扣减成功后创建订单失败，事务应该让数据库处于什么状态？",
    correctLabel: "扣库存也回滚，订单和库存保持像从未执行过一样一致",
    wrongLabels: ["库存保持已扣，稍后人工补订单", "数据库会自动把失败订单展示给用户"],
    correctExplanation: "事务的价值就是防止半成功。只要事务函数抛错，内部所有写入都会撤销，业务状态不会裂成两半。",
    visualizerType: "nextjs-data-flow",
    visualizerTitle: "事务原子提交舱",
    nodes: ["开始事务", "扣减库存", "创建订单", "失败回滚", "一致状态"],
    sourceTitle: "Prisma Transactions",
    sourceUrl: "https://www.prisma.io/docs/orm/prisma-client/queries/transactions",
    summary: ["事务用于保护多步写入的一致性", "失败必须回滚已完成步骤", "长事务会影响并发，需要控制事务内工作量"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-db-connection-pool",
    stageId: "nextjs-database",
    eyebrow: "07.6 · 数据库与 ORM",
    title: "连接池管理",
    objectives: ["理解 Serverless 与本地热更新环境中数据库连接暴涨的原因"],
    prerequisites: ["nextjs-db-prisma-setup"],
    concept: "Next.js 开发模式会频繁热更新模块，Serverless 部署会按请求扩容函数实例。如果每次都 new PrismaClient，数据库连接数会像粒子爆炸一样增长。解决方式是本地复用 globalThis，生产使用连接池、Data Proxy 或数据库平台的 pooler。",
    points: ["本地热更新需要复用 PrismaClient", "Serverless 高并发会放大连接数", "生产环境要使用连接池或云数据库 pooler"],
    memoryHook: "客户端别乱生，连接池来控兵",
    fileName: "lib/db.ts",
    code: `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}`,
    prompt: "为什么开发环境要把 PrismaClient 放到 globalThis 上复用？",
    correctLabel: "避免 Next.js 热更新重新加载模块时不断创建新连接，把数据库连接池打爆",
    wrongLabels: ["为了让客户端浏览器直接连接数据库", "为了绕开 TypeScript 类型检查"],
    correctExplanation: "热更新会重新执行模块顶层代码。如果每次都创建新的 PrismaClient，旧连接未释放时新连接继续累积，很容易耗尽数据库连接上限。",
    visualizerType: "diagnostics-tower",
    visualizerTitle: "连接池压力监控塔",
    nodes: ["热更新触发", "模块重新执行", "复用全局客户端", "连接数稳定", "数据库可用"],
    sourceTitle: "Prisma with Next.js",
    sourceUrl: "https://www.prisma.io/docs/guides/nextjs",
    summary: ["连接池是生产稳定性的底座", "本地热更新需要额外防重建", "Serverless 应结合 pooler 或平台代理"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-db-drizzle",
    stageId: "nextjs-database",
    eyebrow: "07.7 · 数据库与 ORM",
    title: "Drizzle ORM 对比",
    objectives: ["理解 Prisma 与 Drizzle 在类型生成、查询风格和运行时重量上的取舍"],
    prerequisites: ["nextjs-db-crud-operations"],
    concept: "Drizzle 更贴近 SQL，schema 用 TypeScript 编写，查询结果类型也由 TS 推导；Prisma 更偏声明式模型与强大客户端生成。Next.js 项目选择 ORM 时要看团队偏好、运行环境、迁移方式和对 SQL 可控性的要求。",
    points: ["Prisma 开发体验强，客户端生成能力完整", "Drizzle 更轻，更贴近 SQL，适合想掌控查询的人", "两者都应只在服务端代码中访问数据库"],
    memoryHook: "Prisma 像自动挡，Drizzle 像手动挡",
    fileName: "lib/posts.ts",
    code: `import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPost(slug: string) {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}`,
    prompt: "Drizzle 这段查询最明显的心智特点是什么？",
    correctLabel: "它用 TypeScript 函数组装出接近 SQL 的 select/from/where 链路，同时保留类型推导",
    wrongLabels: ["它会把数据库查询发送到浏览器执行", "它完全不需要 schema 或迁移"],
    correctExplanation: "Drizzle 的优势是轻量且 SQL 心智清晰。你仍然在服务端执行查询，也仍然需要 schema 和迁移，只是写法更贴近 SQL。",
    visualizerType: "nextjs-data-flow",
    visualizerTitle: "轻量 SQL 查询组装流",
    nodes: ["TS Schema", "select 链", "where 条件", "数据库执行", "类型化结果"],
    sourceTitle: "Drizzle ORM",
    sourceUrl: "https://orm.drizzle.team/docs/overview",
    summary: ["ORM 选择要看团队查询心智", "Drizzle 更轻且更贴近 SQL", "数据库访问依旧属于服务端边界"]
  }),

  createNextjsQuickLesson({
    id: "nextjs-db-seed-data",
    stageId: "nextjs-database",
    eyebrow: "07.8 · 数据库与 ORM",
    title: "数据填充与测试",
    objectives: ["学会用 seed 脚本准备开发、测试和演示数据"],
    prerequisites: ["nextjs-db-schema-migration"],
    concept: "没有稳定测试数据，页面和 E2E 测试就会像在雾里开车。Seed 脚本负责把开发库或测试库恢复到可预测状态，例如固定创建管理员、示例文章和权限角色。",
    points: ["seed 脚本应可重复执行", "测试库和生产库必须隔离", "E2E 测试依赖稳定的初始数据"],
    memoryHook: "先撒种，再演练",
    fileName: "prisma/seed.ts",
    code: `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.user.upsert({
  where: { email: "admin@nodepath.dev" },
  update: { role: "admin" },
  create: {
    email: "admin@nodepath.dev",
    name: "NodePath Admin",
    role: "admin"
  }
});

await prisma.$disconnect();`,
    prompt: "为什么 seed 脚本里常用 upsert 而不是无脑 create？",
    correctLabel: "因为 upsert 可重复执行：存在就更新，不存在才创建，避免第二次运行因唯一键冲突失败",
    wrongLabels: ["因为 create 只能在浏览器里调用", "因为 upsert 会自动备份生产数据库"],
    correctExplanation: "Seed 的核心是可重复、可预测。upsert 可以让脚本多次运行仍得到同样结果，尤其适合 CI 测试前重建数据。",
    visualizerType: "quality-shield",
    visualizerTitle: "测试数据播种流程",
    nodes: ["清理或连接测试库", "执行 seed", "固定账号生成", "E2E 登录", "断言稳定"],
    sourceTitle: "Prisma Seeding",
    sourceUrl: "https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding",
    summary: ["Seed 让测试和演示可重复", "测试库必须和生产库隔离", "upsert 是避免重复运行失败的常见技巧"]
  }),

  createNextjsLessonSpec({
    id: "project-nextjs-guestbook",
    stageId: "nextjs-database",
    kind: "stage-project",
    eyebrow: "阶段项目 07 · 数据库与 ORM",
    title: "高可用全栈实时留言板",
    difficulty: "进阶",
    objectives: ["聚合鉴权与 ORM 操作，落地拥有完整极深远链路流转并带有绝强防爆机制体系的核心系统"],
    prerequisites: ["nextjs-db-prisma-setup", "nextjs-db-crud-operations", "nextjs-db-server-actions-db", "nextjs-auth-middleware-guard"],
    concept: "这个绝顶挑战需要你运用所有的火力来建设一个抗造的“留言板”。利用 Prisma 建立起带有外键属于（User - Message）关联关系并生成类型。你在表单中使用利用了防重复连击以及 `useActionState` 向下探路拿错误报告状态的究极增强版 `Server Action` ；在深入后台准备向 `Prisma` 落子前，必须抽出防弹衣 `auth()` 来确保其拥有合法登录证件，方可利用 `prisma.create` 砸入数据库；最后利用全局刷新让所有的看客一齐看到这条震撼的新宣言。",
    points: ["不依赖那些陈旧庞大的独立鉴权外包服务和拼接请求，利用 Server + Edge 无缝拼合原生方案", "彻底实现并且洞悉从你敲击键盘那一刻，数据到底是在网线上经历了怎样的生死磨难最终落在千丝万缕表结构内的", "体会强类型端到端绑定下，代码编写过程中由于高度提示所带来的巨大满足和信心。"],
    memoryHook: "有权写库防连击，一统类型爽翻天",
    files: [{ name: "schema.prisma", code: `model User {
  id       String    @id @default(cuid())
  email    String    @unique
  messages Message[] // 牵连着留言表
}
model Message {
  id       Int    @id @default(autoincrement())
  body     String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}` }, { name: "app/actions.ts", code: `'use server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function addMessage(prevState: any, formData: FormData) {
  // 1. 无情排查
  const session = await auth();
  if (!session) return { error: '滚开！禁止未认证游客乱涂乱画！' };
  
  const text = formData.get('message') as string;
  if (text.length < 5) return { error: '发言不能短于 5 个字符，显得你没文化。' };

  // 2. 利用强类型连通数据库进行深海核弹投放操作！
  await prisma.message.create({
    data: {
      body: text,
      authorId: session.user.id // 拿我们验出来的合法特权来操作落定
    }
  });

  // 3. 通杀清场！
  revalidatePath('/guestbook');
  return { success: '您极具哲理的言论已刻入史册。' };
}` }, { name: "app/guestbook/page.tsx", code: `import { prisma } from '@/lib/db';
import BoardForm from './BoardForm'; // 这是一个包含了 useFormStatus 防抖处理机制并利用 useActionState 绑定了上面 addMessage 的那个 Client Component。

export default async function Guestbook() {
  // 联合查询！一次性不仅拿出来话，更把它主人的名号和邮箱也勾了出来！
  const msgs = await prisma.message.findMany({
    include: { author: true },
    orderBy: { id: 'desc' }
  });

  return (
    <div className="mx-auto max-w-2xl mt-10">
      <h1 className="text-3xl font-black mb-8">极客神殿留言墙</h1>
      <BoardForm />
      <hr className="my-8" />
      <div className="space-y-4">
        {msgs.map(m => (
          <div key={m.id} className="p-4 rounded-lg bg-slate-800 shadow-xl border border-slate-700">
            <span className="font-bold text-cyan-400">{m.author.email}：</span>
            <p className="mt-2 text-slate-300">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}` }],
    entryFile: "app/guestbook/page.tsx",
    answer: {
      type: "prediction",
      prompt: "在这个结构中，如果我们不使用那句带有 `include: { author: true }` 的魔力 Prisma 参数。只单独拿回 `msgs` 对象并在下面尝试极其嚣张地强行去点和取用 `m.author.email` 渲染到屏幕上的话。会发生什么？",
      options: [
        { id: "a", label: "代码会在浏览器上跑出空指针崩溃直接抛出不可饶恕的红屏", detail: "延后到死", feedback: "这是最差开发体验才会发生的事情，Next+Prisma 会用防弹衣在第一秒就阻止这种事情。" },
        { id: "b", label: "由于你忘了取它的根，甚至还在 VS Code 开发期间那条 `m.author.email` 代码下边就会被强行标注极其刺目的红线直接拦截告诉你：“你并没有在查询的时候取回这段子信息，我根本不认识它！”进而强迫你在发布构建之前打补丁修复！", detail: "类型锁喉保平安", feedback: "正确：这种端到端的类型推导（因为你的查询没有带 include，那么生成的返回值类型里根本就不会有那个对象块存在）是极其逆天的高阶开发者生产力神器。" },
        { id: "c", label: "会向数据库发出一连串的附带小查询去慢慢把它补齐回来", detail: "性能极其低下", feedback: "这不仅拖慢速度更导致灾难般的 N+1 网络震荡，系统严禁此行为自动发生。" }
      ],
      answerId: "b",
      correctExplanation: "利用了 Prisma 这套智能解析查阅机制之后。数据库不再是一个冰冷黑暗一无所知的藏污纳垢箱！它直接跨越千里被映射投影成为了你手头上摸得着看得到的带有类型约束的 JS 变量实体。一旦你改动、忘记或者多填少写了，编译器立马就能结合 TypeScript 给你死死咬住并且发出严厉的纠正。这种开发阶段的神圣安全感，是你这辈子一旦用了就再也回不去那黑暗的原生 SQL 和残缺 JS 开发模式中的不二法宝。"
    },
    execution: {
      visualizer: { type: "stage-project-core", title: "三位一体高阶全栈链路", nodes: ["输入提交且防连击挂起", "后端防线层层验证把守过滤", "通过强类型连通数据库安全落盘", "反拉引爆并查携连体复合结构返回", "前端安全享用并呈现无暇结果"] },
      lanes: ["操作触媒点", "中军帐查验及部署深井", "重装出击并呈送展台"],
      frames: [
        { activeLane: 0, laneValues: ["一位登录并有着绝妙想法的访客输入极其精彩的一段箴言并且按下送出！", "等待", "等待"], log: ["按钮闪过拦截判定变为灰色的 Loading...状态防打断挂起！并且静默开始打包送向高墙之后。"], note: "从这一刻起，你的一切用户体验已被完美保障", delayMs: 400 },
        { activeLane: 1, laneValues: ["完成", "遭遇层层盘查直至到达数据库机房中控台前！", "等待"], log: ["遭遇 auth 盘问（通过！）-> 遭遇长度质检判定（通过！）-> 最后携带着特质并经过了严苛类型审查校验打包完的规范 Payload 顺利交送进了包含 create() 的大管子里砸向机房底层"], note: "完美、凶狠、极具压迫感且天衣无缝的安防部署策略防住了可能带来的灭顶之灾。", delayMs: 800 },
        { activeLane: 2, laneValues: ["完成", "完成", "裹挟带有海量复合资料的信息冲回并在前端优雅开花"], log: ["成功存库并且引发重查核反应链带出来附送着作者尊姓大名的完美结构，通过前端利用组件剥离无缝组装并且极快地用其更新掉了方才那一栏灰色的 loading 圈块并在屏幕上展演出了胜利果实。"], note: "不仅防线密如蛛网而且动作快如闪电无拖泥带水，一代工业大牛工程就此完工。", delayMs: 800 }
      ]
    },
    sources: [{ title: "Prisma with Next.js", url: "https://www.prisma.io/nextjs" }],
    summary: ["一次完美统合前后端大杀器的大阅兵！展示并让你能够拥有亲手打造一款极其健壮且逻辑闭合的高复杂网状系统的实战手腕", "将复杂的联合查表和关联数据的抓取展示用一段极其易读优雅的对象拼装手段替代，消解了大量晦涩的技术包袱", "彻底地拥有了一套能在当下或者未来开发任何带有极多用户行为并包含密室或者金库级别项目安全和功能交互的心法能力。"]
  })
];
