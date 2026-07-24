import type { LessonSpec } from "../../../lib/curriculum/types";
import { createServerLesson, createServerStageProject } from "./server-engineering-lesson-factory";

const eyebrow = "微服务与服务网格";

const knowledgeLessons: LessonSpec[] = [
  createServerLesson({
    id: "server-microservices-service-decomposition",
    stageId: "server-microservices",
    order: 1,
    eyebrowStage: eyebrow,
    title: "服务拆分原则",
    concept: "微服务按业务能力（bounded context）拆分，让每个服务拥有独立的领域模型与数据库。跨服务共享表或双向依赖是最常见的反模式，会把分布式系统退化成分布式单体。",
    points: ["按 bounded context 划边界", "服务独立拥有数据存储", "避免共享库/共享表"],
    memoryHook: "边界看领域，数据不共享",
    fileName: "decompose-service.ts",
    code: `// 反模式：Order 服务直接读 User 服务的表
// await db.query("SELECT * FROM users WHERE id = ?", [userId]);

// 正确：通过 User 服务提供的 API/事件契约获取
export async function loadUserSnapshot(userId: string) {
  const res = await fetch(\`http://user-service/internal/users/\${userId}\`, {
    headers: { "x-caller": "order-service" }
  });
  if (!res.ok) throw new Error(\`user-service \${res.status}\`);
  return (await res.json()) as { id: string; tier: "vip" | "std" };
}

export async function createOrder(userId: string, sku: string) {
  const user = await loadUserSnapshot(userId);
  const discount = user.tier === "vip" ? 0.9 : 1;
  return { orderId: crypto.randomUUID(), userId, sku, discount };
}`,
    prompt: "订单服务需要用户等级来计算折扣，最符合微服务原则的做法是？",
    correct: "通过 User 服务对外暴露的接口获取用户快照，不直连它的数据库",
    wrong: "为了性能，让订单服务直接读 User 服务的 users 表",
    output: "{ orderId: '...', userId: 'u_88', sku: 'SKU-1', discount: 0.9 }",
    lanes: ["解析请求", "调用 User 服务", "生成订单"],
    laneValues: ["userId=u_88", "GET /users/u_88", "discount=0.9"],
    log: ["接收 createOrder", "调用 user-service", "返回 orderId"],
    summary: ["bounded context 决定服务边界", "数据私有是微服务的第一原则", "共享表会退化为分布式单体"],
    sourceTitle: "Microservices Pattern: Decompose by Business Capability",
    sourceUrl: "https://microservices.io/patterns/microservices.html"
  }),
  createServerLesson({
    id: "server-microservices-inter-service-communication",
    stageId: "server-microservices",
    order: 2,
    eyebrowStage: eyebrow,
    title: "服务间通信选型",
    concept: "REST 适合对外与低频调用，gRPC 用 Protobuf 与 HTTP/2 适合内部高频强类型调用，GraphQL Federation 适合聚合多服务字段给前端。选型看流量特征与消费方类型，不是越新越好。",
    points: ["REST=简单/浏览器友好", "gRPC=强类型/低延迟内部调用", "GraphQL Federation=聚合读"],
    memoryHook: "对外 REST，内部 gRPC，聚合 GraphQL",
    fileName: "grpc-client.ts",
    code: `import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const def = loadSync("order.proto", { keepCase: true, defaults: true });
const proto = loadPackageDefinition(def) as any;

const client = new proto.order.OrderService(
  "order-service:50051",
  credentials.createInsecure()
);

export function getOrder(orderId: string) {
  return new Promise<{ id: string; total: number }>((resolve, reject) => {
    client.GetOrder({ id: orderId }, (err: Error | null, resp: any) => {
      if (err) return reject(err);
      resolve(resp);
    });
  });
}

const order = await getOrder("o_1024");
console.log(order);`,
    prompt: "内部两个高频调用的核心服务应该优先选哪种通信方式？",
    correct: "gRPC：基于 HTTP/2 + Protobuf，强类型且延迟低，适合服务间高频调用",
    wrong: "GraphQL：一个 endpoint 就能查所有字段，最省事",
    output: "{ id: 'o_1024', total: 199 }",
    lanes: ["加载 proto", "建立 gRPC 通道", "调用 GetOrder"],
    laneValues: ["order.proto", "order-service:50051", "resp={id,total}"],
    log: ["加载 order.proto", "创建 gRPC client", "GetOrder 返回"],
    summary: ["REST/gRPC/GraphQL 各有场景", "选型看流量与消费方", "内部高频强类型优先 gRPC"],
    sourceTitle: "gRPC Node.js Quickstart",
    sourceUrl: "https://grpc.io/docs/languages/node/quickstart/"
  }),
  createServerLesson({
    id: "server-microservices-service-discovery",
    stageId: "server-microservices",
    order: 3,
    eyebrowStage: eyebrow,
    title: "服务发现",
    concept: "服务发现让调用方不再硬编码 IP:port。Consul/etcd 提供 KV+健康检查，Kubernetes 则通过 Service + DNS 内建发现能力：`order-service.default.svc.cluster.local` 由 kube-proxy 负载均衡到健康 Pod。",
    points: ["硬编码 IP 是脆弱耦合", "K8s Service 提供 DNS+LB", "健康检查决定摘除时机"],
    memoryHook: "别记 IP，记服务名",
    fileName: "service-discovery.ts",
    code: `// K8s 中调用另一个服务，域名由 kube-dns 解析
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL
  ?? "http://order-service.default.svc.cluster.local:8080";

export async function listOrders(userId: string) {
  const res = await fetch(\`\${ORDER_SERVICE_URL}/orders?userId=\${userId}\`, {
    signal: AbortSignal.timeout(2000)
  });
  if (!res.ok) throw new Error(\`upstream \${res.status}\`);
  return (await res.json()) as { orders: unknown[] };
}

// 对应的 K8s Service 声明（片段）：
// apiVersion: v1
// kind: Service
// metadata: { name: order-service }
// spec: { selector: { app: order }, ports: [{ port: 8080 }] }`,
    prompt: "K8s 中一个服务如何找到另一个服务的地址？",
    correct: "通过 Service 名的集群 DNS 解析，由 kube-proxy 负载均衡到健康 Pod",
    wrong: "在配置文件里写死所有 Pod 的 IP:port 列表，重启时手动更新",
    output: "{ orders: [{ id: 'o_1' }, { id: 'o_2' }] }",
    lanes: ["解析 Service DNS", "kube-proxy 路由", "命中健康 Pod"],
    laneValues: ["order-service.svc", "iptables/ipvs", "Pod=10.0.1.7"],
    log: ["解析 order-service DNS", "kube-proxy 选中 Pod", "返回 orders"],
    summary: ["硬编码 IP 会跟随实例频繁失效", "K8s Service+DNS 是最省事的发现方案", "健康检查决定实例可见性"],
    sourceTitle: "Kubernetes Services & Networking",
    sourceUrl: "https://kubernetes.io/docs/concepts/services-networking/service/"
  }),
  createServerLesson({
    id: "server-microservices-api-gateway",
    stageId: "server-microservices",
    order: 4,
    eyebrowStage: eyebrow,
    title: "API Gateway 模式",
    concept: "API Gateway 是所有外部流量的统一入口，集中承担鉴权、限流、路由聚合、协议转换等横切能力，让后端服务专注领域逻辑。常见选型：Kong、APISIX、Envoy Gateway、云厂商托管网关。",
    points: ["统一入口收敛横切关注点", "路由/鉴权/限流集中管理", "后端服务无需重复实现"],
    memoryHook: "网关做横切，服务做领域",
    fileName: "api-gateway.ts",
    code: `import express from "express";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";

const gateway = express();

// 1) 鉴权
gateway.use((req, res, next) => {
  const token = req.header("authorization");
  if (!token) return res.status(401).json({ error: "unauthorized" });
  next();
});

// 2) 限流：每分钟 60 次
gateway.use(rateLimit({ windowMs: 60_000, max: 60 }));

// 3) 路由到后端服务
gateway.use("/api/orders", createProxyMiddleware({
  target: "http://order-service:8080",
  changeOrigin: true,
  pathRewrite: { "^/api/orders": "/orders" }
}));

gateway.use("/api/users", createProxyMiddleware({
  target: "http://user-service:8080",
  changeOrigin: true
}));

gateway.listen(8000, () => console.log("gateway on :8000"));`,
    prompt: "10 个后端微服务都需要限流和鉴权，最合理的落地位置是？",
    correct: "在 API Gateway 统一实现鉴权+限流，避免每个服务重复造轮子",
    wrong: "每个后端服务各自实现一套鉴权和限流，反正代码可以复制",
    output: "gateway on :8000",
    lanes: ["入口鉴权", "限流", "路由后端"],
    laneValues: ["JWT 校验", "60 req/min", "→ order-service"],
    log: ["请求到达 :8000", "鉴权+限流通过", "转发到 order-service"],
    summary: ["Gateway 是横切能力的收敛点", "鉴权/限流/路由集中管理", "服务专注领域逻辑"],
    sourceTitle: "Microservices Pattern: API Gateway",
    sourceUrl: "https://microservices.io/patterns/apigateway.html"
  }),
  createServerLesson({
    id: "server-microservices-service-mesh",
    stageId: "server-microservices",
    order: 5,
    eyebrowStage: eyebrow,
    title: "Sidecar 与 Service Mesh",
    concept: "Service Mesh 用 Sidecar（如 Envoy）拦截所有出入流量，把重试、mTLS、熔断、流量切分等能力从应用代码下沉到基础设施。Istio 提供控制面，Envoy 是数据面，业务代码零改造即可获得治理能力。",
    points: ["Sidecar 拦截入出流量", "治理能力下沉到基础设施", "Istio=控制面/Envoy=数据面"],
    memoryHook: "边车挡流量，控制面下策略",
    fileName: "istio-vs.yaml",
    code: `# Istio VirtualService：把 10% 流量切到 v2 做金丝雀
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service
spec:
  hosts: ["order-service"]
  http:
    - route:
        - destination:
            host: order-service
            subset: v1
          weight: 90
        - destination:
            host: order-service
            subset: v2
          weight: 10
      retries:
        attempts: 3
        perTryTimeout: 500ms
      timeout: 2s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: order-service
spec:
  host: order-service
  subsets:
    - name: v1
      labels: { version: v1 }
    - name: v2
      labels: { version: v2 }`,
    prompt: "想给所有内部服务加上 mTLS 与重试策略，代价最小的方案是？",
    correct: "接入 Service Mesh（Istio+Envoy），治理能力由 Sidecar 承担，业务无侵入",
    wrong: "让每个服务的开发团队分别在代码里实现 mTLS 与重试",
    output: "VirtualService/DestinationRule 配置生效，v2 承接 10% 流量",
    lanes: ["Sidecar 注入", "控制面下发", "数据面执行"],
    laneValues: ["Envoy 边车", "Istio 推送 VS", "10%→v2"],
    log: ["Pod 注入 Envoy", "Istio 下发 VirtualService", "Envoy 按权重转发"],
    summary: ["Sidecar 让治理与业务解耦", "Istio 是控制面，Envoy 是数据面", "灰度/重试/mTLS 声明式配置"],
    sourceTitle: "Istio Traffic Management",
    sourceUrl: "https://istio.io/latest/docs/concepts/traffic-management/"
  }),
  createServerLesson({
    id: "server-microservices-distributed-tracing",
    stageId: "server-microservices",
    order: 6,
    eyebrowStage: eyebrow,
    title: "分布式追踪",
    concept: "OpenTelemetry 提供跨语言的 trace/metric/log 采集标准，通过 W3C `traceparent` 头在服务间传播上下文。每个服务生成 Span 并共享 traceId，就能在 Jaeger/Tempo 中还原完整调用链。",
    points: ["W3C traceparent 传播上下文", "每个服务生成 Span", "traceId 串起全链路"],
    memoryHook: "traceId 走全链，Span 记单跳",
    fileName: "otel-tracing.ts",
    code: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { trace } from "@opentelemetry/api";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: "http://otel-collector:4318/v1/traces" }),
  instrumentations: [getNodeAutoInstrumentations()]
});
await sdk.start();

const tracer = trace.getTracer("order-service");

export async function createOrder(userId: string) {
  return tracer.startActiveSpan("createOrder", async (span) => {
    span.setAttribute("user.id", userId);
    try {
      // 出站 HTTP 会自动注入 traceparent 头
      const inv = await fetch("http://inventory-service/reserve", {
        method: "POST",
        body: JSON.stringify({ userId })
      });
      return { ok: inv.ok, traceId: span.spanContext().traceId };
    } finally {
      span.end();
    }
  });
}`,
    prompt: "服务 A 调用服务 B，如何让两侧的 Span 归到同一条 trace？",
    correct: "A 在出站请求注入 W3C traceparent 头，B 从头部解析并作为父 Span",
    wrong: "每个服务生成自己的 traceId，靠时间戳在存储侧拼接",
    output: "traceId=4bf92f... span=createOrder 上报到 otel-collector",
    lanes: ["生成 Span", "传播 traceparent", "上报 Collector"],
    laneValues: ["startActiveSpan", "→ inventory-service", "OTLP /v1/traces"],
    log: ["创建 Span createOrder", "注入 traceparent", "Collector 收到 span"],
    summary: ["OpenTelemetry 是跨语言标准", "traceparent 是链路串联的关键", "自动 instrumentation 覆盖主流库"],
    sourceTitle: "OpenTelemetry JavaScript",
    sourceUrl: "https://opentelemetry.io/docs/languages/js/"
  }),
  createServerLesson({
    id: "server-microservices-circuit-breaker",
    stageId: "server-microservices",
    order: 7,
    eyebrowStage: eyebrow,
    title: "熔断与超时预算",
    concept: "下游依赖不稳定时，Circuit Breaker 在错误率超阈值后短路请求，避免线程/连接被打满形成雪崩。同时每个调用都要有超时上限，且下游的超时应小于上游，形成层级化的超时预算。",
    points: ["错误率超阈值→熔断打开", "超时是必配非可选", "超时预算逐层递减"],
    memoryHook: "熔断防雪崩，超时防等死",
    fileName: "circuit-breaker.ts",
    code: `import CircuitBreaker from "opossum";

async function callInventory(sku: string) {
  const res = await fetch(\`http://inventory-service/stock/\${sku}\`, {
    signal: AbortSignal.timeout(500) // 下游超时 500ms
  });
  if (!res.ok) throw new Error(\`upstream \${res.status}\`);
  return res.json();
}

const breaker = new CircuitBreaker(callInventory, {
  timeout: 800,           // 单次调用 800ms 后视为失败
  errorThresholdPercentage: 50, // 错误率 >50% 触发熔断
  resetTimeout: 10_000    // 10s 后进入半开
});

breaker.fallback(() => ({ stock: 0, degraded: true }));
breaker.on("open", () => console.warn("circuit OPEN"));

export async function checkStock(sku: string) {
  return breaker.fire(sku);
}`,
    prompt: "上游 API 网关超时 2s，中间服务调用下游库存服务时的超时应该怎么设？",
    correct: "严格小于 2s，比如 500ms，为重试与业务处理预留时间预算",
    wrong: "跟上游对齐设 2s，充分利用超时时间",
    output: "circuit OPEN 后返回 { stock: 0, degraded: true }",
    lanes: ["调用下游", "熔断器统计", "超阈值降级"],
    laneValues: ["fetch /stock/SKU", "错误率 60%", "fallback stock=0"],
    log: ["调用 inventory-service", "错误率突破 50%", "熔断打开→降级"],
    summary: ["熔断避免故障扩散", "超时是硬性契约", "预算逐层递减留出重试空间"],
    sourceTitle: "Microservices Pattern: Circuit Breaker",
    sourceUrl: "https://microservices.io/patterns/reliability/circuit-breaker.html"
  }),
  createServerLesson({
    id: "server-microservices-versioning-compat",
    stageId: "server-microservices",
    order: 8,
    eyebrowStage: eyebrow,
    title: "版本演进与向后兼容",
    concept: "微服务独立发布使得客户端与服务端节奏不同步。API 演进必须遵循向后兼容：新增字段不 required、废弃字段先标记再下线、破坏性变更走 `/v2` 并与 `/v1` 并存一段兼容期。",
    points: ["新增字段不设 required", "废弃走 deprecation 通告", "破坏性变更用新版本号"],
    memoryHook: "只加不改，改就换版",
    fileName: "api-versioning.ts",
    code: `import express from "express";
const app = express();

// v1：保留兼容，但在响应头提示 deprecation
app.get("/v1/orders/:id", (req, res) => {
  res.setHeader("Deprecation", "true");
  res.setHeader("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
  res.setHeader("Link", '</v2/orders/'+ req.params.id +'>; rel="successor-version"');
  res.json({ id: req.params.id, total: 199 });
});

// v2：新增 items 明细，字段可选便于旧客户端过渡
app.get("/v2/orders/:id", (req, res) => {
  res.json({
    id: req.params.id,
    total: 199,
    currency: "CNY",
    items: [{ sku: "SKU-1", qty: 1, price: 199 }]
  });
});

app.listen(8080);`,
    prompt: "订单响应需要新增 currency 字段，最安全的做法是？",
    correct: "在 v1 响应里新增可选 currency 字段，旧客户端忽略即可，保持向后兼容",
    wrong: "直接把返回结构改成必带 currency 的新格式，让客户端立即适配",
    output: "GET /v1/orders/o_1 → Deprecation: true, Sunset: 2026-12-31",
    lanes: ["v1 兼容", "标记 deprecation", "v2 并行"],
    laneValues: ["/v1 返回旧结构", "Sunset 头", "/v2 返回 items"],
    log: ["请求命中 /v1", "响应头 Deprecation=true", "客户端渐进迁移 /v2"],
    summary: ["向后兼容是微服务的基础契约", "废弃走标准 Deprecation/Sunset 头", "破坏性变更请显式换版本"],
    sourceTitle: "Microservices Pattern: API Versioning",
    sourceUrl: "https://microservices.io/patterns/index.html"
  })
];

const project = createServerStageProject({
  id: "server-microservices-project",
  stageId: "server-microservices",
  eyebrowStage: eyebrow,
  title: "构建可观测的微服务通信链路",
  brief: "把 API Gateway、服务发现、gRPC 调用、OpenTelemetry 追踪与熔断串起来：外部请求进网关 → 网关鉴权限流 → 转发到订单服务 → gRPC 调库存服务 → 全链路 Span 上报，任何一跳失败都能在 trace 中定位。",
  concept: "串联本阶段知识：网关做横切、服务发现解耦地址、gRPC 承载内部高频调用、OpenTelemetry 贯穿 traceId、熔断保护下游，最终形成一个可观测、可降级的微服务片段。",
  points: ["Gateway 统一入口鉴权限流", "gRPC/HTTP 内部调用带 traceparent", "熔断+超时保证故障隔离"],
    memoryHook: "入口统一，链路可见，故障可隔",
    fileName: "microservice-chain.ts",
    code: `import express from "express";
import { trace, context, propagation } from "@opentelemetry/api";
import CircuitBreaker from "opossum";

const app = express();
const tracer = trace.getTracer("order-service");

async function callInventory(sku: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  // 把当前 trace context 注入到出站请求
  propagation.inject(context.active(), headers);
  const res = await fetch(\`http://inventory-service.default.svc.cluster.local/reserve\`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sku }),
    signal: AbortSignal.timeout(500)
  });
  if (!res.ok) throw new Error(\`inventory \${res.status}\`);
  return res.json();
}

const breaker = new CircuitBreaker(callInventory, {
  timeout: 800,
  errorThresholdPercentage: 50,
  resetTimeout: 10_000
});
breaker.fallback(() => ({ reserved: false, degraded: true }));

// 网关已完成鉴权/限流，这里只关心业务
app.post("/orders", express.json(), async (req, res) => {
  await tracer.startActiveSpan("POST /orders", async (span) => {
    span.setAttribute("user.id", req.body.userId);
    try {
      const inv = await breaker.fire(req.body.sku);
      res.json({
        orderId: crypto.randomUUID(),
        reserved: inv.reserved !== false,
        traceId: span.spanContext().traceId
      });
    } catch (err) {
      span.recordException(err as Error);
      res.status(502).json({ error: "inventory unavailable" });
    } finally {
      span.end();
    }
  });
});

app.listen(8080, () => console.log("order-service on :8080"));`,
    prompt: "微服务链路上线后，如何验证一次真实请求走通了整条链？",
    correct: "拿一次请求的 traceId，在 Jaeger 中确认 gateway→order→inventory 三层 Span 都在，且延迟与状态符合预期",
    wrong: "只看订单服务返回 200 就当作通过，不需要看下游 Span",
    correctFeedback: "正确：分布式系统的正确性证据来自完整 trace，而不是单点 200。",
    wrongFeedback: "错误：200 只能证明本服务处理成功，下游可能已经降级或熔断，必须看全链路 trace。",
    additionalWrong: {
      label: "只在业务代码里 console.log 每一步请求，就能替代 OpenTelemetry",
      feedback: "错误：分散日志无法跨服务串联 traceId，也没有标准化的 Span 树，排障效率远不如 OpenTelemetry。"
    },
    lanes: ["Gateway 入口", "订单服务处理", "库存服务调用"],
    laneValues: ["鉴权+限流", "startSpan POST /orders", "gRPC/HTTP + 熔断"],
    log: ["网关放行请求", "订单服务开 Span", "调用库存服务并注入 traceparent"],
    summary: ["网关+服务发现+追踪+熔断是微服务基本盘", "traceparent 是链路串联的合同", "熔断降级保证局部故障不扩散"],
    sourceTitle: "OpenTelemetry JavaScript",
    sourceUrl: "https://opentelemetry.io/docs/languages/js/"
});

export const serverEngineeringStageFourMicroservicesLessons: LessonSpec[] = [...knowledgeLessons, project];
