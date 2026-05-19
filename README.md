# DonTalk 的个人博客

🎉 欢迎来到我的个人技术博客！

## 📖 关于本站

这是一个基于 **VuePress 3** + **VuePress Theme Hope** 构建的现代化个人博客网站。

**在线访问**: https://dontalk.github.io

## ✨ 特性

- 🚀 **现代化设计**：基于 VuePress 3 和 Vite，快速且美观
- 📱 **响应式布局**：完美支持 PC 和移动端
- 🔍 **全文搜索**：快速定位所需内容
- 🏷️ **标签分类**：清晰的知识体系结构
- 🌙 **主题切换**：支持亮色/暗色模式
- 🔄 **自动部署**：推送到 GitHub 自动构建发布

## 📂 内容分类

本站包含 17 个主要技术分类：

- 💻 Java语言核心（基础、集合、并发、JVM）
- 🗄️ 数据库与持久化（MySQL、Redis、MongoDB、**MyBatis、Hibernate**）
- 🌐 Web与微服务框架（Spring Boot、Spring Cloud）
- ⚙️ 工程化与生产实践（CI/CD、Docker、K8s）
- 🏗️ 分布式系统与架构（微服务、消息队列）
- ⚡ 性能优化与调优
- 🔒 安全与合规
- ☁️ 云原生与容器化
- 🤖 AI 与智能应用（Spring AI、LangChain4j）
- 等等...

### 🆕 最新内容

#### MyBatis 完整教程（2026-05-19）

✅ **10 篇系统化教程**，从入门到实战：

1. [MyBatis 入门基础](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/01.MyBatis入门基础.md) - 环境搭建、核心组件
2. [MyBatis 核心配置详解](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/02.MyBatis核心配置详解.md) - 配置解析、数据源
3. [MyBatis Mapper XML 映射文件](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/03.MyBatis-Mapper-XML映射文件.md) - CRUD、动态 SQL
4. [MyBatis 接口绑定与注解开发](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/04.MyBatis接口绑定与注解开发.md) - 动态代理、注解
5. [MyBatis 高级映射关系](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/05.MyBatis高级映射关系.md) - 关联查询、缓存
6. [MyBatis 动态 SQL 实战](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/06.MyBatis动态SQL实战.md) - 条件查询、批量操作
7. [MyBatis 与 Spring Boot 集成](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/07.MyBatis与Spring-Boot集成.md) - 快速集成、事务管理
8. [MyBatis 性能优化与最佳实践](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/08.MyBatis性能优化与最佳实践.md) - SQL 优化、缓存策略
9. [MyBatis 实战项目案例](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/09.MyBatis实战项目案例.md) - 用户管理、订单系统
10. [MyBatis-Plus 快速上手](docs/02-数据库与持久化/03-ORM%20框架/01-MyBatis/10.MyBatis-Plus快速上手.md) - 增强工具、代码生成器

📌 **特点**：即拷即用、循序渐进、实战导向、最佳实践

## 🚀 快速开始

### 环境要求

- Node.js >= 18.19.0 (推荐使用 20.x LTS)
- npm >= 8

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 构建静态网站
npm run docs:build
```

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

## 📝 文章结构

所有技术文章位于 `docs/` 目录下，按主题分类组织：

```
docs/
├── 01-Java语言核心/
├── 02-数据库与持久化/
├── 03-Web与微服务框架/
├── ...
└── 17-AI 与智能应用/
```

原始笔记备份在 `my-notes/` 目录。

## 🔧 自定义配置

编辑 `docs/.vuepress/config.ts` 可以修改网站配置。

## 📦 部署

本站通过 GitHub Actions 自动部署到 GitHub Pages。

推送代码到 main 分支即可触发自动部署：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

## 📄 许可证

MIT License | Copyright © 2026 DonTalk

---

**注意**：首次运行前请确保 Node.js 版本符合要求，详见 [DEPLOY.md](./DEPLOY.md)