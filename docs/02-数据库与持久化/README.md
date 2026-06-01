# 02-数据库与持久化

> 关系型数据库、NoSQL 数据库和 ORM 框架的完整知识体系

## 📚 模块概述

本模块系统性地整理了数据库相关的核心技术，包括：
- **关系型数据库**：MySQL、Oracle
- **NoSQL 数据库**：Redis、MongoDB
- **ORM 框架**：MyBatis、Hibernate、MyBatis-Plus

## 🗂️ 目录结构

### 01-关系型数据库

#### MySQL
| 主题 | 说明 | 难度 |
|------|------|------|
| [基础操作](./01-关系型数据库/MySQL/01.MySQL基础操作/mysql基础.md) | SQL语法、数据类型、基本操作 | ⭐⭐ |
| [设计和多表](./01-关系型数据库/MySQL/02.MySQL设计和多表操作/mysql高级.md) | 数据库设计、多表查询 | ⭐⭐⭐ |
| [索引与优化](./01-关系型数据库/MySQL/03.MySQL索引与性能优化/mysql索引与优化.md) | 索引原理、执行计划、性能调优 | ⭐⭐⭐⭐ |
| [事务与锁](./01-关系型数据库/MySQL/04.MySQL事务与锁机制/mysql事务与锁.md) | ACID、隔离级别、锁机制 | ⭐⭐⭐⭐ |
| [项目实战](./01-关系型数据库/MySQL/08.MySQL项目实战案例/mysql项目实战.md) | 实际项目案例 | ⭐⭐⭐⭐ |

**辅助文档：**
- [学习路线](./01-关系型数据库/MySQL/学习路线.md)
- [知识体系总览](./01-关系型数据库/MySQL/知识体系总览.md)
- [速查手册](./01-关系型数据库/MySQL/MySQL速查手册.md)

#### Oracle
| 模块 | 文档数量 | 说明 |
|------|---------|------|
| 架构与原理 | 4篇 | 体系架构、后台进程、内存结构 |
| 安装部署 | 5篇 | Linux/Windows安装、监听配置 |
| SQL查询 | 7篇 | 数据类型、约束、连接、子查询 |
| 索引优化 | 7篇 | B-Tree、Bitmap、执行计划 |
| 存储结构 | 5篇 | 表空间、ASM、内存管理 |
| 并发控制 | 5篇 | 事务、锁、MVCC |
| 备份恢复 | 6篇 | RMAN、Data Guard、Flashback |
| 性能诊断 | 7篇 | AWR、ASH、SQL优化 |
| 安全管理 | 5篇 | 权限、VPD、TDE、审计 |
| 新特性 | 5篇 | 多租户、JSON、分区表 |
| PL/SQL | 4篇 | 基础、进阶、高级、实战 |

**总计**: 60+ 篇文档，覆盖 Oracle 全部核心知识

### 02-NoSQL 数据库

#### Redis
| 主题 | 说明 | 难度 |
|------|------|------|
| [Redis基础](./02-NoSQL\ 数据库/Redis/01.Redis基础/Redis基础.md) | 数据结构、命令、持久化 | ⭐⭐ |
| [高可用](./02-NoSQL\ 数据库/Redis/02.Redis高可用/Redis高可用.md) | 主从复制、哨兵、集群 | ⭐⭐⭐ |
| [缓存设计](./02-NoSQL\ 数据库/Redis/03.缓存设计/缓存设计.md) | 缓存策略、穿透、雪崩 | ⭐⭐⭐ |

#### MongoDB
| 主题 | 说明 | 难度 |
|------|------|------|
| [入门教程](./02-NoSQL\ 数据库/MongoDB/01.MongoDB入门（一）/MongoDB安装及入门（一）.md) | 安装、基本概念、CRUD | ⭐⭐ |

### 03-ORM 框架

#### MyBatis
| 序号 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01 | [入门基础](./03-ORM\ 框架/01-MyBatis/01.MyBatis入门基础.md) | 环境搭建、基本配置 | ⭐⭐ |
| 02 | [核心配置](./03-ORM\ 框架/01-MyBatis/02.MyBatis核心配置详解.md) | 配置文件详解 | ⭐⭐ |
| 03 | [Mapper XML](./03-ORM\ 框架/01-MyBatis/03.MyBatis-Mapper-XML映射文件.md) | SQL映射文件 | ⭐⭐⭐ |
| 04 | [接口绑定](./03-ORM\ 框架/01-MyBatis/04.MyBatis接口绑定与注解开发.md) | Mapper接口、注解 | ⭐⭐⭐ |
| 05 | [高级映射](./03-ORM\ 框架/01-MyBatis/05.MyBatis高级映射关系.md) | 一对一、一对多 | ⭐⭐⭐ |
| 06 | [动态SQL](./03-ORM\ 框架/01-MyBatis/06.MyBatis动态SQL实战.md) | if、choose、foreach | ⭐⭐⭐ |
| 07 | [Spring Boot集成](./03-ORM\ 框架/01-MyBatis/07.MyBatis与Spring-Boot集成.md) | 整合配置 | ⭐⭐⭐ |
| 08 | [性能优化](./03-ORM\ 框架/01-MyBatis/08.MyBatis性能优化与最佳实践.md) | 缓存、懒加载 | ⭐⭐⭐⭐ |
| 09 | [实战案例](./03-ORM\ 框架/01-MyBatis/09.MyBatis实战项目案例.md) | 完整项目 | ⭐⭐⭐⭐ |
| 10 | [MyBatis-Plus](./03-ORM\ 框架/01-MyBatis/10.MyBatis-Plus快速上手.md) | 快速入门 | ⭐⭐ |

#### Hibernate
| 序号 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01-05 | 基础到高级查询 | 配置、映射、HQL、Criteria | ⭐⭐-⭐⭐⭐ |
| 06-10 | 关联映射到高级特性 | 事务、缓存、性能优化 | ⭐⭐⭐-⭐⭐⭐⭐ |
| 11-13 | 集成与实战 | Spring Boot集成、项目案例 | ⭐⭐⭐⭐ |

**总计**: 13篇文档

#### MyBatis-Plus
| 序号 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01-05 | 基础功能 | CRUD、Wrapper、分页、自动填充 | ⭐⭐-⭐⭐⭐ |
| 06-10 | 高级功能 | 乐观锁、逻辑删除、插件扩展 | ⭐⭐⭐ |
| 11-13 | 集成与实战 | Spring Boot、性能调优、完整项目 | ⭐⭐⭐⭐ |

**总计**: 13篇文档

---

## 🎯 学习路径

### 📘 初级阶段（1个月）

**目标**：掌握基本的数据库操作和 ORM 使用

1. **MySQL 基础**
   - SQL 语法
   - 基本查询
   - 多表连接

2. **Redis 基础**
   - 五大数据结构
   - 常用命令
   - 持久化机制

3. **MyBatis 入门**
   - 环境搭建
   - 基本 CRUD
   - 动态 SQL

### 📗 中级阶段（2个月）

**目标**：深入理解数据库原理和性能优化

4. **MySQL 进阶**
   - 索引优化
   - 事务与锁
   - 执行计划分析

5. **Redis 高级**
   - 主从复制
   - 哨兵模式
   - 缓存设计

6. **MyBatis 高级**
   - 高级映射
   - 缓存机制
   - 性能优化

### 📙 高级阶段（2-3个月）

**目标**：掌握企业级数据库架构和调优

7. **Oracle 深入学习**
   - 体系架构
   - 性能诊断
   - 备份恢复

8. **分布式数据库**
   - 分库分表
   - 读写分离
   - 数据一致性

9. **ORM 框架对比**
   - MyBatis vs Hibernate
   - 选型建议
   - 最佳实践

---

## 💡 学习建议

### 1. 理论与实践结合

- 📖 阅读文档理解概念
- 💻 动手编写 SQL 和代码
- 🔍 使用工具观察执行计划

### 2. 循序渐进

- 先掌握 MySQL 基础
- 再学习性能优化
- 最后研究高级特性

### 3. 项目驱动

- 从小项目开始练习
- 逐步增加复杂度
- 关注性能指标

### 4. 持续更新

- 跟踪数据库新版本
- 学习业界最佳实践
- 参与技术社区

---

## 🛠️ 常用工具

### 数据库管理工具
- **MySQL Workbench**：MySQL 官方工具
- **Navicat**：通用数据库管理
- **DBeaver**：开源跨平台
- **DataGrip**：JetBrains 出品

### 监控诊断工具
- **pt-query-digest**：慢查询分析
- **Percona Toolkit**：MySQL 工具集
- **Redis Desktop Manager**：Redis 可视化
- **AWR报告**：Oracle 性能分析

### ORM 开发工具
- **MyBatis Generator**：代码生成
- **MyBatis-Plus Generator**：增强版生成器
- **Hibernate Tools**：Hibernate 工具

---

## 📊 统计信息

### 文档规模
- **模块数量**: 3个
- **数据库类型**: 4种（MySQL、Oracle、Redis、MongoDB）
- **ORM 框架**: 3种（MyBatis、Hibernate、MyBatis-Plus）
- **文档总数**: 100+ 篇

### 内容规模
- **MySQL**: 5篇核心 + 辅助文档
- **Oracle**: 60+ 篇完整教程
- **Redis**: 3篇核心教程
- **MongoDB**: 1篇入门教程
- **MyBatis**: 10篇完整教程
- **Hibernate**: 13篇完整教程
- **MyBatis-Plus**: 13篇完整教程

### 学习投入
- **预计学习时间**: 5-6个月
- **难度等级**: ⭐⭐ ~ ⭐⭐⭐⭐
- **适合人群**: 初级 → 高级

---

## 🔗 相关模块

- **前置模块**: [01-Java语言核心](../01-Java语言核心/)
- **后续模块**: 
  - [03-Web与微服务框架](../03-Web与微服务框架/)
  - [05-分布式系统与架构](../05-分布式系统与架构/)

---

## 📞 资源链接

### 官方文档
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Oracle 官方文档](https://docs.oracle.com/en/database/)
- [Redis 官方文档](https://redis.io/documentation)
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/)
- [Hibernate 官方文档](https://hibernate.org/orm/)
- [MyBatis-Plus 官方文档](https://baomidou.com/)

### 学习资源
- SQLZoo：在线 SQL 练习
- LeetCode Database：数据库面试题
- GitHub Awesome SQL：SQL 资源汇总

---

**开始学习**: [MySQL 基础](./01-关系型数据库/MySQL/01.MySQL基础操作/mysql基础.md)
