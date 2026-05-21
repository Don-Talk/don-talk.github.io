# ORM 框架

> MyBatis、Hibernate、MyBatis-Plus 完整教程

## 📚 模块概述

ORM（Object-Relational Mapping）对象关系映射框架，用于简化数据库操作。

## 📖 文档内容

### MyBatis（10篇）

| 序号 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01 | [入门基础](./01-MyBatis/01.MyBatis入门基础.md) | 环境搭建、基本配置 | ⭐⭐ |
| 02 | [核心配置](./01-MyBatis/02.MyBatis核心配置详解.md) | 配置文件详解 | ⭐⭐ |
| 03 | [Mapper XML](./01-MyBatis/03.MyBatis-Mapper-XML映射文件.md) | SQL映射文件 | ⭐⭐⭐ |
| 04 | [接口绑定](./01-MyBatis/04.MyBatis接口绑定与注解开发.md) | Mapper接口、注解 | ⭐⭐⭐ |
| 05 | [高级映射](./01-MyBatis/05.MyBatis高级映射关系.md) | 一对一、一对多 | ⭐⭐⭐ |
| 06 | [动态SQL](./01-MyBatis/06.MyBatis动态SQL实战.md) | if、choose、foreach | ⭐⭐⭐ |
| 07 | [Spring Boot集成](./01-MyBatis/07.MyBatis与Spring-Boot集成.md) | 整合配置 | ⭐⭐⭐ |
| 08 | [性能优化](./01-MyBatis/08.MyBatis性能优化与最佳实践.md) | 缓存、懒加载 | ⭐⭐⭐⭐ |
| 09 | [实战案例](./01-MyBatis/09.MyBatis实战项目案例.md) | 完整项目 | ⭐⭐⭐⭐ |
| 10 | [MyBatis-Plus](./01-MyBatis/10.MyBatis-Plus快速上手.md) | 快速入门 | ⭐⭐ |

### Hibernate（13篇）

| 范围 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01-05 | 基础到查询 | 配置、映射、HQL、Criteria | ⭐⭐-⭐⭐⭐ |
| 06-10 | 关联到高级 | 事务、缓存、性能优化 | ⭐⭐⭐-⭐⭐⭐⭐ |
| 11-13 | 集成实战 | Spring Boot、项目案例 | ⭐⭐⭐⭐ |

### MyBatis-Plus（13篇）

| 范围 | 主题 | 说明 | 难度 |
|------|------|------|------|
| 01-05 | 基础功能 | CRUD、Wrapper、分页、自动填充 | ⭐⭐-⭐⭐⭐ |
| 06-10 | 高级功能 | 乐观锁、逻辑删除、插件扩展 | ⭐⭐⭐ |
| 11-13 | 集成实战 | Spring Boot、性能调优、完整项目 | ⭐⭐⭐⭐ |

## 🎯 学习路径

### 推荐学习顺序

1. **MyBatis**（必学）
   - 国内最流行的 ORM 框架
   - 灵活、轻量、易上手
   - 适合大多数项目

2. **MyBatis-Plus**（强烈推荐）
   - MyBatis 的增强工具
   - 简化 CRUD 操作
   - 提高开发效率

3. **Hibernate**（选学）
   - 全自动 ORM 框架
   - 适合复杂业务场景
   - 国外项目使用较多

### MyBatis 学习路线

#### 第一阶段：基础（1周）
- 环境搭建
- 基本 CRUD
- 配置文件
- Mapper XML

#### 第二阶段：进阶（1周）
- 动态 SQL
- 高级映射
- 接口绑定
- 注解开发

#### 第三阶段：高级（1周）
- 缓存机制
- 性能优化
- Spring Boot 集成
- 实战项目

### MyBatis-Plus 学习路线

#### 快速上手（3-5天）
- 通用 CRUD
- 条件构造器
- 分页插件
- 代码生成器

## 💡 框架对比

| 特性 | MyBatis | Hibernate | MyBatis-Plus |
|------|---------|-----------|--------------|
| 学习曲线 | 平缓 | 陡峭 | 平缓 |
| SQL控制 | 完全控制 | 自动生成 | 完全控制+增强 |
| 性能 | 高 | 中 | 高 |
| 灵活性 | 高 | 中 | 高 |
| 社区活跃度 | 高 | 中 | 非常高 |
| 适用场景 | 大部分项目 | 复杂业务 | 快速开发 |

## 🔧 常用工具

### MyBatis
- **MyBatis Generator**：代码生成器
- **MyBatis Log Plugin**：日志插件
- **Free MyBatis Tool**：IDEA 插件

### MyBatis-Plus
- **MP Generator**：代码生成器
- **MyBatisX**：IDEA 插件
- **Dynamic DataSource**：多数据源

### Hibernate
- **Hibernate Tools**：官方工具
- **JPA Buddy**：IDEA 插件

## 📊 统计信息

- **框架数量**: 3种
- **文档总数**: 36篇
  - MyBatis: 10篇
  - Hibernate: 13篇
  - MyBatis-Plus: 13篇
- **预计学习时间**: 1个月
- **难度等级**: ⭐⭐ ~ ⭐⭐⭐⭐

## 🎓 最佳实践

### 1. 框架选型建议

**选择 MyBatis/MyBatis-Plus：**
- ✅ 需要精细控制 SQL
- ✅ 追求高性能
- ✅ 团队熟悉 SQL
- ✅ 快速开发需求

**选择 Hibernate：**
- ✅ 复杂对象关系映射
- ✅ 跨数据库兼容
- ✅ 团队熟悉 JPA
- ✅ 国际化项目

### 2. 性能优化要点

- 合理使用缓存
- 避免 N+1 查询问题
- 批量操作优化
- 懒加载策略
- SQL 语句优化

### 3. 开发规范

- 统一命名规范
- 合理使用注解 vs XML
- 事务管理
- 异常处理
- 日志记录

## 🔗 相关资源

### 官方文档
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/)
- [MyBatis-Plus 官方文档](https://baomidou.com/)
- [Hibernate 官方文档](https://hibernate.org/orm/)

### 学习资源
- MyBatis GitHub: https://github.com/mybatis/mybatis-3
- MyBatis-Plus GitHub: https://github.com/baomidou/mybatis-plus
- Hibernate GitHub: https://github.com/hibernate/hibernate-orm

### 社区
- MyBatis 中文社区
- Stack Overflow
- SegmentFault

---

**开始学习**: [MyBatis 入门基础](./01-MyBatis/01.MyBatis入门基础.md)
