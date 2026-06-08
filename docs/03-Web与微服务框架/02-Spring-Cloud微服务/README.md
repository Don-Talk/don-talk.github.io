# Spring Cloud微服务学习路线

## 📚 模块概览

本模块系统讲解Spring Cloud微服务架构核心技术,从服务注册发现到API网关,帮助你构建企业级微服务系统。

```
Spring Boot (单体应用)
    ↓
Spring Cloud (微服务架构)
    ├── 服务注册与发现 (Nacos/Eureka)
    ├── 服务调用 (OpenFeign/Dubbo)
    ├── 配置中心 (Nacos Config)
    ├── API网关 (Spring Cloud Gateway)
    ├── 负载均衡 (Ribbon/LoadBalancer)
    ├── 熔断降级 (Sentinel/Hystrix)
    ├── 消息驱动 (Stream)
    └── 链路追踪 (Sleuth + Zipkin)
```

---

## 🎯 学习路径

### 第一阶段: 微服务基础 (必修)

**前置知识**: Spring Boot、Maven、Docker基础

#### 00-微服务概述
- [01.微服务架构演进](./00-微服务概述/01.微服务架构演进.md) - 架构演进历史、单体/SOA/微服务/云原生
- [02.单体vs微服务对比](./00-微服务概述/02.单体vs微服务对比.md) - 详细对比分析、选型决策树
- [03.服务拆分原则](./00-微服务概述/03.服务拆分原则.md) - DDD领域驱动设计、拆分策略、反模式

#### 01-服务注册与发现
- [01.Nacos注册中心](./01-服务注册与发现/01.Nacos注册中心.md) - Nacos Server搭建、服务注册、服务发现
- [02.服务注册与发现实战](./01-服务注册与发现/02.服务注册与发现实战.md) - 服务提供者/消费者、健康检查
- [03.Eureka对比](./01-服务注册与发现/03.Eureka对比.md) - Eureka vs Nacos选型指南

---

### 第二阶段: 服务通信 (必修)

**前置知识**: 服务注册与发现

#### 03-服务调用
- [01.OpenFeign声明式调用](./02-服务调用/01.OpenFeign声明式调用.md) - Feign接口定义、参数传递
- [02.Feign配置优化](./02-服务调用/02.Feign配置优化.md) - 超时、重试、日志、编码器
- [03.Dubbo整合](./02-服务调用/03.Dubbo整合.md) - Dubbo vs Feign、性能对比

---

### 第三阶段: 配置管理 (必修)

**前置知识**: 服务注册与发现

#### 04-配置中心
- [01.Nacos Config配置中心](./03-配置中心/01.Nacos Config配置中心.md) - 配置管理、动态刷新
- [02.配置动态刷新](./03-配置中心/02.配置动态刷新.md) - @RefreshScope、自动刷新
- [03.配置加密](./03-配置中心/03.配置加密.md) - Jasypt加密敏感配置

---

### 第四阶段: API网关 (必修)

**前置知识**: 服务调用、配置中心

#### 05-API网关
- [01.Spring Cloud Gateway](./04-API网关/01.Spring Cloud Gateway.md) - 网关基础、路由配置
- [02.路由配置实战](./04-API网关/02.路由配置实战.md) - 断言、过滤器、全局过滤器
- [03.限流熔断](./04-API网关/03.限流熔断.md) - Sentinel整合、限流规则
- [04.JWT鉴权](./04-API网关/04.JWT鉴权.md) - 网关统一认证、权限控制

---

### 第五阶段: 容错保护 (进阶)

**前置知识**: API网关

#### 06-负载均衡
- [01.Ribbon负载均衡](./05-负载均衡/01.Ribbon负载均衡.md) - 负载均衡策略、自定义策略
- [02.LoadBalancer客户端](./05-负载均衡/02.LoadBalancer客户端.md) - Spring Cloud LoadBalancer

#### 07-熔断降级
- [01.Sentinel流量控制](./06-熔断降级/01.Sentinel流量控制.md) - 限流算法、QPS限流
- [02.Sentinel熔断降级](./06-熔断降级/02.Sentinel熔断降级.md) - 熔断规则、降级策略
- [03.Sentinel热点参数](./06-熔断降级/03.Sentinel热点参数.md) - 热点参数限流
- [04.Sentinel控制台](./06-熔断降级/04.Sentinel控制台.md) - 控制台配置、规则推送

---

### 第六阶段: 高级特性 (选修)

**前置知识**: 熔断降级

#### 08-消息驱动
- [01.Spring Cloud Stream](./07-消息驱动/01.Spring Cloud Stream.md) - 消息抽象、绑定器
- [02.Kafka整合](./07-消息驱动/02.Kafka整合.md) - Kafka绑定器、消息收发
- [03.RocketMQ整合](./07-消息驱动/03.RocketMQ整合.md) - RocketMQ绑定器

#### 09-链路追踪
- [01.Sleuth链路追踪](./08-链路追踪/01.Sleuth链路追踪.md) - TraceId、SpanId
- [02.Zipkin可视化](./08-链路追踪/02.Zipkin可视化.md) - Zipkin集成、链路分析

---

### 第七阶段: 综合实战 (必修)

**前置知识**: 以上所有模块

#### 10-电商微服务实战
- [01.微服务架构设计](./09-综合实战项目/01.微服务架构设计.md) - 电商系统架构、服务拆分
- [02.用户服务](./09-综合实战项目/02.用户服务.md) - user-service实现
- [03.订单服务](./09-综合实战项目/03.订单服务.md) - order-service实现
- [04.商品服务](./09-综合实战项目/04.商品服务.md) - product-service实现
- [05.网关服务](./09-综合实战项目/05.网关服务.md) - gateway-service实现
- [06.Docker部署](./09-综合实战项目/06.Docker部署.md) - 容器化部署、docker-compose

---

## 🗺️ 知识地图

### 服务治理
- ✅ 微服务架构演进
- ✅ 单体vs微服务对比
- ✅ 服务拆分原则
- ✅ Nacos注册中心
- ✅ 服务注册与发现
- ✅ 健康检查
- ⏳ 服务元数据管理

### 服务通信
- ✅ OpenFeign声明式调用
- ✅ Feign配置优化
- ⏳ Dubbo RPC整合
- ⏳ gRPC整合

### 配置管理
- ✅ Nacos Config配置中心
- ✅ 配置动态刷新
- ✅ 配置加密
- ⏳ 配置版本管理

### API网关
- ✅ Spring Cloud Gateway
- ✅ 路由断言和过滤器
- ✅ 限流熔断
- ✅ JWT统一鉴权

### 容错保护
- ✅ Ribbon负载均衡
- ✅ Sentinel流量控制
- ✅ Sentinel熔断降级
- ⏳ 隔离舱模式

### 可观测性
- ⏳ Sleuth链路追踪
- ⏳ Zipkin可视化
- ⏳ Prometheus监控
- ⏳ Grafana看板

---

## 📖 学习建议

### 初学者路线
1. **先理解概念**: 什么是微服务、为什么要服务拆分
2. **动手实践**: 搭建Nacos Server,注册第一个服务
3. **循序渐进**: 先学服务注册发现,再学服务调用
4. **项目驱动**: 学完基础后做完整的电商微服务项目

### 进阶提升
1. **源码阅读**: 深入理解Nacos、Gateway源码
2. **性能优化**: 学习Feign性能调优、Gateway高并发
3. **生产实践**: 学习灰度发布、蓝绿部署
4. **云原生**: 过渡到Kubernetes + Service Mesh

---

## 🔗 相关资源

### 官方文档
- [Spring Cloud](https://spring.io/projects/spring-cloud)
- [Alibaba Cloud](https://spring-cloud-alibaba-group.github.io/github-pages/hoxton/en-us/)
- [Nacos](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Sentinel](https://sentinelguard.io/zh-cn/)

### 推荐书籍
- 《Spring Cloud微服务实战》
- 《重新定义Spring Cloud实战》
- 《Spring Cloud Alibaba微服务原理与实战》

### 在线教程
- Spring Cloud官方指南: https://spring.io/guides
- Baeldung Spring Cloud教程: https://www.baeldung.com/spring-cloud

---

## 📝 更新日志

- **2026-06-02**: 
  - ✅ 创建Spring Cloud微服务模块
  - ✅ 新增微服务概述模块(架构演进/对比分析/拆分原则)
  - ✅ 完成服务注册与发现(Nacos/Eureka)
  - ✅ 完成服务调用(OpenFeign)
  - ✅ 完成配置中心(Nacos Config)
  - ✅ 完成API网关(Spring Cloud Gateway)
  - ✅ 完成负载均衡(LoadBalancer)
  - ✅ 完成熔断降级(Sentinel)
  - ✅ 完成消息驱动(Stream)
  - ✅ 完成链路追踪(Sleuth + Zipkin)
  - ✅ 完成学习总结与实战项目
  - ⏳ 待补充: Dubbo整合
  - ⏳ 待补充: Kafka/RocketMQ整合
  - ⏳ 待补充: Prometheus监控

---

## 💡 贡献指南

欢迎提交Issue或PR完善本知识库!

**可以贡献的内容**:
- 补充缺失的章节
- 修正错误或不准确的内容
- 添加更多实战案例
- 优化文档结构和表达
