# 关系型数据库

> MySQL 和 Oracle 数据库完整教程

## 📚 模块概述

关系型数据库是企业应用中最常用的数据存储方案。本模块包含 MySQL 和 Oracle 两大主流数据库的完整教程。

## 📖 文档内容

### MySQL

MySQL 是最流行的开源关系型数据库，适用于大多数应用场景。

| 主题 | 说明 | 难度 |
|------|------|------|
| [基础操作](./MySQL/01.MySQL基础操作/mysql基础.md) | SQL语法、数据类型、基本CRUD | ⭐⭐ |
| [设计和多表](./MySQL/02.MySQL设计和多表操作/mysql高级.md) | 数据库设计、多表连接查询 | ⭐⭐⭐ |
| [索引与优化](./MySQL/03.MySQL索引与性能优化/mysql索引与优化.md) | 索引原理、执行计划、性能调优 | ⭐⭐⭐⭐ |
| [事务与锁](./MySQL/04.MySQL事务与锁机制/mysql事务与锁.md) | ACID特性、隔离级别、锁机制 | ⭐⭐⭐⭐ |
| [项目实战](./MySQL/08.MySQL项目实战案例/mysql项目实战.md) | 实际项目案例分析 | ⭐⭐⭐⭐ |

**辅助文档：**
- 📋 [学习路线](./MySQL/学习路线.md)
- 🗺️ [知识体系总览](./MySQL/知识体系总览.md)
- 📖 [速查手册](./MySQL/MySQL速查手册.md)
- 📝 [补充说明](./MySQL/补充说明.md)

### Oracle

Oracle 是企业级数据库的领导者，适用于大型企业和复杂业务场景。

#### 核心模块（60+篇文档）

| 模块 | 文档数 | 主要内容 |
|------|--------|---------|
| **架构与原理** | 4篇 | 体系架构、后台进程、内存结构、物理存储 |
| **安装部署** | 5篇 | Linux/Windows安装、DBCA、监听器、网络配置 |
| **SQL查询** | 7篇 | 数据类型、约束、序列、连接、子查询、分析函数 |
| **索引优化** | 7篇 | B-Tree、Bitmap、函数索引、复合索引、执行计划、Hint |
| **存储结构** | 5篇 | 表空间、ASM、SGA/PGA、HugePages、内存调优 |
| **并发控制** | 5篇 | 事务ACID、锁机制、死锁、MVCC、隔离级别 |
| **备份恢复** | 6篇 | RMAN备份/恢复、PITR、Data Guard、Flashback、GoldenGate |
| **性能诊断** | 7篇 | AWR、ASH、ADDM、SQL Trace、等待事件、SQL优化 |
| **安全管理** | 5篇 | 用户权限、VPD、TDE、FGA审计、统一审计 |
| **新特性** | 5篇 | 多租户CDB/PDB、19c新特性、JSON、分区表、物化视图 |
| **PL/SQL** | 4篇 | 基础、进阶、高级、实战项目 |

**其他资源：**
- 🗺️ [完整学习路线图](./Oracle/Oracle完整学习路线图.md)
- 📊 [进度跟踪](./Oracle/进度跟踪.md)
- ✅ [项目完成报告](./Oracle/项目完成报告.md)

**概览文档：**
- 运维自动化脚本集
- 故障案例库
- 认证考试指南
- 版本管理与升级

## 🎯 学习路径

### MySQL 学习路线

#### 初级阶段（1-2周）
1. **基础操作**
   - SQL 基本语法
   - 数据类型选择
   - CRUD 操作
   - 常用函数

2. **数据库设计**
   - 范式理论
   - 表结构设计
   - 多表关系
   - 外键约束

#### 中级阶段（2-3周）
3. **索引优化**
   - B-Tree 索引原理
   - 索引创建策略
   - 执行计划分析
   - 慢查询优化

4. **事务与锁**
   - ACID 特性
   - 隔离级别
   - 锁机制
   - 死锁处理

#### 高级阶段（2-3周）
5. **性能调优**
   - 参数配置优化
   - 查询优化技巧
   - 分库分表策略
   - 高可用架构

### Oracle 学习路线

#### 初级阶段（2-3周）
1. **基础概念**
   - Oracle 体系架构
   - 实例与数据库
   - 用户与权限
   - 基本 SQL

2. **安装配置**
   - Linux 环境安装
   - 数据库创建
   - 监听器配置
   - 网络连接

#### 中级阶段（3-4周）
3. **SQL 高级**
   - 多表连接
   - 子查询
   - 分析函数
   - 层次查询

4. **存储管理**
   - 表空间管理
   - 数据文件
   - ASM 存储
   - 内存结构

#### 高级阶段（4-6周）
5. **性能优化**
   - 索引策略
   - 执行计划
   - AWR 报告分析
   - SQL 调优

6. **高可用**
   - RMAN 备份恢复
   - Data Guard
   - Flashback 技术
   - GoldenGate 同步

## 💡 选型建议

### 选择 MySQL
- ✅ 中小型项目
- ✅ 互联网应用
- ✅ 成本敏感
- ✅ 社区活跃
- ✅ 易于维护

### 选择 Oracle
- ✅ 大型企业应用
- ✅ 金融电信行业
- ✅ 复杂业务逻辑
- ✅ 高可靠性要求
- ✅ 需要官方支持

## 🔧 常用工具

### MySQL 工具
- **MySQL Workbench**：官方管理工具
- **Navicat for MySQL**：功能强大的客户端
- **phpMyAdmin**：Web 管理界面
- **Percona Toolkit**：性能分析工具集
- **pt-query-digest**：慢查询分析

### Oracle 工具
- **SQL Developer**：官方开发工具
- **PL/SQL Developer**：专业 IDE
- **Toad for Oracle**：企业级工具
- **Oracle Enterprise Manager**：管理平台
- **RMAN**：备份恢复工具

## 📊 统计信息

### MySQL
- **核心文档**: 5篇
- **辅助文档**: 4篇
- **预计学习时间**: 2-3个月
- **难度等级**: ⭐⭐ ~ ⭐⭐⭐⭐

### Oracle
- **核心文档**: 60+篇
- **覆盖模块**: 14个
- **预计学习时间**: 4-6个月
- **难度等级**: ⭐⭐ ~ ⭐⭐⭐⭐⭐

## 🎓 最佳实践

### 数据库设计
1. **规范化设计**
   - 遵循第三范式
   - 合理反规范化
   - 命名规范统一

2. **索引策略**
   - 主键必建索引
   - 外键考虑索引
   - 频繁查询字段建索引
   - 避免过度索引

3. **SQL 编写**
   - 避免 SELECT *
   - 使用预编译语句
   - 批量操作优化
   - 分页查询优化

### 性能优化
1. **查询优化**
   - 分析执行计划
   - 避免全表扫描
   - 合理使用索引
   - 减少子查询嵌套

2. **配置优化**
   - 调整内存参数
   - 优化连接池
   - 配置缓冲池
   - 设置超时时间

3. **架构优化**
   - 读写分离
   - 分库分表
   - 缓存层引入
   - 负载均衡

## 🔗 相关资源

### MySQL
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [MySQL GitHub](https://github.com/mysql/mysql-server)
- [Percona Blog](https://www.percona.com/blog/)
- [MySQL 中文网](https://www.mysqlzh.com/)

### Oracle
- [Oracle 官方文档](https://docs.oracle.com/en/database/)
- [Oracle Technology Network](https://www.oracle.com/technetwork/)
- [Ask TOM](https://asktom.oracle.com/)
- [Oracle Base](https://oracle-base.com/)

---

**开始学习**: 
- [MySQL 基础](./MySQL/01.MySQL基础操作/mysql基础.md)
- [Oracle 架构](./Oracle/01-Oracle架构与原理/01.Oracle体系架构概览.md)
