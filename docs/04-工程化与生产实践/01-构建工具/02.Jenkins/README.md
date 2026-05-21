# Jenkins CI/CD

> 自动化构建、测试和部署的完整指南

## 📚 模块概述

Jenkins 是最流行的开源 CI/CD 工具，本模块提供从安装部署到高级 Pipeline 开发的完整教程。

## 📖 文档内容

| 主题 | 说明 | 难度 | 行数 |
|------|------|------|------|
| [Jenkins 完全指南](./Jenkins.md) | 安装部署、Pipeline开发、安全配置、最佳实践 | ⭐⭐⭐ | 780 |

## 🎯 学习内容

### 基础部分
- ✅ Ubuntu/Docker 安装部署
- ✅ 初始配置和插件管理
- ✅ 创建第一个 Job
- ✅ 基础概念理解

### 进阶部分
- ✅ Declarative Pipeline 语法
- ✅ Spring Boot 项目 CI/CD
- ✅ 多分支 Pipeline
- ✅ 并行执行策略

### 高级部分
- ✅ 凭证管理和参数化构建
- ✅ 安全配置和权限管理
- ✅ HTTPS 和反向代理
- ✅ 备份和监控

## 💡 实战案例

### 1. Spring Boot 自动化部署
```groovy
pipeline {
    stages {
        stage('Build') { steps { sh 'mvn clean package' } }
        stage('Test') { steps { sh 'mvn test' } }
        stage('Docker Build') { steps { sh 'docker build -t myapp .' } }
        stage('Deploy') { steps { sh './deploy.sh' } }
    }
}
```

### 2. 多环境部署
- 开发环境自动部署
- 测试环境手动触发
- 生产环境审批流程

### 3. 并行测试
```groovy
parallel {
    stage('Unit Tests') { ... }
    stage('Integration Tests') { ... }
    stage('E2E Tests') { ... }
}
```

## 🔧 前置要求

- Linux 基础知识
- Git 版本控制
- Docker（可选）
- Maven/Gradle 构建工具

## 🛠️ 常用命令

```bash
# 启动 Jenkins
sudo systemctl start jenkins

# 查看状态
sudo systemctl status jenkins

# 查看日志
sudo tail -f /var/log/jenkins/jenkins.log

# 获取管理员密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## 📊 统计信息

- **文档数量**: 1个
- **总行数**: 780行
- **代码示例**: 20+ 个
- **预计学习时间**: 1周

## 🎓 学习路径

1. **第一天**：安装部署和初始配置
2. **第二天**：创建 Freestyle Job
3. **第三天**：学习 Pipeline 基础语法
4. **第四天**：实战 Spring Boot 项目
5. **第五天**：高级配置和安全加固
6. **第六天**：监控维护和故障排查
7. **第七天**：最佳实践总结

## 🔗 相关资源

- 📖 官方文档：https://www.jenkins.io/doc/
- 📦 插件中心：https://plugins.jenkins.io/
- 💬 社区论坛：https://community.jenkins.io/
- 🎓 认证考试：Jenkins Certified Engineer

## 🚀 下一步

完成 Jenkins 学习后，可以继续学习：
- [GitLab CI/CD](../GitLab/)
- [GitHub Actions](../GitHub-Actions/)
- [Docker Compose](../../02-版本控制与CICD\ 流水线/)
- [Kubernetes 部署](../../../08-云原生与容器化/)

---

**开始学习**: [Jenkins 完全指南](./Jenkins.md)
