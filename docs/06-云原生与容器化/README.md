---
title: 云原生与容器化
index: true
icon: cloud
category:
  - 云原生
  - DevOps
tag:
  - Docker
  - Kubernetes
  - 容器化
---

# 云原生与容器化

> Docker、Kubernetes 和云原生技术的完整实践指南

## 📚 模块概述

本模块涵盖了云原生和容器化技术的核心内容，包括：
- **Docker**：容器化技术基础
- **Docker Compose**：多容器应用编排
- **Kubernetes**：容器编排平台（待补充）
- **云原生生态**：Service Mesh、Serverless 等

## 🗂️ 目录结构

### 01-Docker & Compose

#### Docker
| 主题 | 说明 | 难度 |
|------|------|------|
| [Docker笔记](./01-Docker\ \&\ Compose/01.docker/docker笔记.md) | Docker 核心概念和使用 | ⭐⭐⭐ |
| [工作笔记](./01-Docker\ \&\ Compose/01.docker/工作笔记.txt) | 实际工作中的经验总结 | ⭐⭐ |

**配套资源**：
- `imgs/`：25张示意图
- `资料/mysql/`：MySQL Docker 配置示例

---

## 🎯 学习路径

### 📘 初级阶段（2周）

**目标**：掌握 Docker 基础使用

1. **Docker 基础**
   - 容器概念
   - 镜像管理
   - 容器操作

2. **Dockerfile**
   - 编写规范
   - 最佳实践
   - 多阶段构建

### 📗 中级阶段（1个月）

**目标**：掌握容器编排和网络存储

3. **Docker Compose**
   - 服务编排
   - 网络配置
   - 数据卷管理

4. **Docker 网络**
   - 桥接网络
   - 覆盖网络
   - 端口映射

### 📙 高级阶段（2-3个月）

**目标**：掌握 Kubernetes 和云原生架构

5. **Kubernetes 基础**
   - Pod、Deployment、Service
   - 配置管理
   - 存储卷

6. **Kubernetes 进阶**
   - Helm 包管理
   - Ingress 控制器
   - 自动扩缩容

7. **云原生生态**
   - Service Mesh（Istio）
   - CI/CD 集成
   - 监控日志

---

## 💡 学习建议

### 1. 动手实践

- 每个命令都要亲自执行
- 从简单容器开始
- 逐步增加复杂度

### 2. 理解原理

- 不仅会用，还要理解底层原理
- 了解容器与虚拟机的区别
- 掌握 Linux 命名空间和控制组

### 3. 最佳实践

- 遵循 Docker 官方最佳实践
- 优化镜像大小
- 注意安全性

### 4. 生态整合

- 将容器技术与 CI/CD 结合
- 学习 Kubernetes 生态
- 关注云原生发展趋势

---

## 🛠️ 常用工具

### 容器运行时
- **Docker**：最流行的容器引擎
- **containerd**：CNCF 容器运行时
- **Podman**：无守护进程容器引擎

### 容器编排
- **Docker Compose**：本地开发编排
- **Kubernetes**：生产级容器编排
- **Swarm**：Docker 原生编排

### 镜像仓库
- **Docker Hub**：公共镜像仓库
- **Harbor**：企业级镜像仓库
- **阿里云 ACR**：阿里云容器镜像

### 辅助工具
- **Portainer**：Docker 可视化管理
- **Lens**：Kubernetes IDE
- **k9s**：Kubernetes 终端 UI

---

## 📊 容器化演进

```
物理机部署
    ↓
虚拟机部署
    ↓
容器化部署
    ↓
容器编排 (K8s)
    ↓
服务网格 (Service Mesh)
    ↓
Serverless
```

---

## 🔧 常用命令速查

### Docker 基础
```bash
# 镜像操作
docker pull <image>
docker images
docker rmi <image>

# 容器操作
docker run -d --name <name> <image>
docker ps
docker stop <container>
docker rm <container>

# 查看日志
docker logs -f <container>

# 进入容器
docker exec -it <container> /bin/bash
```

### Docker Compose
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart
```

---

## 📝 文档规范

所有文档遵循统一的编写规范：
- 清晰的步骤说明
- 完整的配置文件
- 常见问题解答
- 故障排查指南

---

## 🔄 持续更新

本模块会持续更新，包括：
- Docker 新版本特性
- Kubernetes 最佳实践
- 云原生生态发展
- 实战案例分享

---

**下一步**：从 Docker 基础开始你的容器化之旅吧！🚀
