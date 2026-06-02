# Spring Data JPA数据访问

## 模块导航

### 01-JPA入门
- [01.JPA快速入门](./01-JPA入门/01.JPA快速入门.md) - JPA概念、环境搭建、Repository接口、JPQL查询、分页排序

### 02-实体关系映射
- [01.实体关系映射详解](./02-实体关系映射/01.实体关系映射详解.md) - 一对一、一对多、多对多映射、级联操作、延迟加载

### 03-高级特性
- [01.高级查询与审计](./03-高级特性/01.高级查询与审计.md) - Specification动态查询、QBE、投影、审计功能、乐观锁

---

## 学习路径建议

**第一阶段: 基础入门** (2天)
1. JPA快速入门 - 理解JPA规范和基本CRUD
2. 掌握Repository接口和方法名查询

**第二阶段: 关系映射** (2-3天)
3. 实体关系映射详解 - 一对一、一对多、多对多
4. 理解级联操作和延迟加载

**第三阶段: 高级特性** (1-2天)
5. 高级查询与审计 - Specification、投影、自动审计

---

## 核心知识点

### JPA基础
- JPA vs Hibernate vs Spring Data JPA的关系
- Repository层次结构(CrudRepository → JpaRepository)
- 方法名查询(Query By Method Name)
- JPQL面向对象查询语言
- 分页Pageable和排序Sort

### 实体映射
- @Entity、@Table、@Id、@Column等基本注解
- 主键生成策略(Identity、Sequence、Table、Auto)
- 一对一(@OneToOne)映射
- 一对多(@OneToMany)和多对一(@ManyToOne)映射
- 多对多(@ManyToMany)中间表配置

### 关系管理
- 拥有方(Owner)和被拥有方(Inverse)
- mappedBy属性的使用
- 级联操作(CascadeType)
- 延迟加载(LAZY)vs即时加载(EAGER)
- N+1问题及解决方案(JOIN FETCH、@BatchSize)

### 高级查询
- Specification动态条件构建
- Query By Example示例查询
- 投影(Projection)优化性能
- 原生SQL查询(nativeQuery)

### 审计与事务
- @CreatedDate、@LastModifiedDate自动时间戳
- @CreatedBy、@LastModifiedBy自动记录操作人
- @Transactional事务管理
- 事务传播行为(REQUIRED、REQUIRES_NEW)
- @Version乐观锁并发控制

---

## JPA vs MyBatis-Plus对比

| 特性 | JPA | MyBatis-Plus |
|------|-----|--------------|
| 学习方式 | 面向对象思维 | SQL思维 |
| 复杂查询 | Specification较复杂 | LambdaQueryWrapper简单 |
| 性能优化 | 需要理解N+1问题 | 更直观可控 |
| 跨数据库 | ✅ 优秀 | ⚠️ 一般 |
| 灵活性 | ⚠️ 受限 | ✅ 灵活 |
| 学习曲线 | 陡峭 | 平缓 |
| 适用场景 | 领域驱动设计、复杂关系 | 互联网应用、快速开发 |

**选择建议**:
- **传统企业应用**: JPA(复杂关系、事务要求高)
- **互联网应用**: MyBatis-Plus(性能敏感、快速迭代)
- **混合使用**: 简单操作用MP,复杂聚合用JPA

---

## 常用注解速查

### 实体映射

| 注解 | 说明 | 示例 |
|------|------|------|
| @Entity | 标识实体类 | `@Entity` |
| @Table | 指定表名 | `@Table(name="sys_user")` |
| @Id | 主键 | `@Id` |
| @GeneratedValue | 主键策略 | `@GeneratedValue(strategy=IDENTITY)` |
| @Column | 列属性 | `@Column(name="user_name", length=50)` |
| @Transient | 不映射字段 | `@Transient` |

### 关系映射

| 注解 | 说明 | 示例 |
|------|------|------|
| @OneToOne | 一对一 | `@OneToOne(cascade=ALL)` |
| @OneToMany | 一对多 | `@OneToMany(mappedBy="user")` |
| @ManyToOne | 多对一 | `@ManyToOne(fetch=LAZY)` |
| @ManyToMany | 多对多 | `@ManyToMany` |
| @JoinColumn | 外键列 | `@JoinColumn(name="user_id")` |
| @JoinTable | 中间表 | `@JoinTable(name="user_role")` |

### 审计注解

| 注解 | 说明 |
|------|------|
| @CreatedDate | 创建时间(自动填充) |
| @LastModifiedDate | 更新时间(自动更新) |
| @CreatedBy | 创建人(自动记录) |
| @LastModifiedBy | 更新人(自动记录) |
| @Version | 版本号(乐观锁) |

---

## 常见问题FAQ

### Q1: JPA和MyBatis-Plus选哪个?

**A**: 
- **JPA优势**: 面向对象、跨数据库、适合DDD
- **MP优势**: 学习成本低、性能可控、适合互联网
- **建议**: 团队熟悉SQL选MP,追求规范选JPA

### Q2: 如何解决N+1查询问题?

**A**: 三种方案:
1. **JOIN FETCH**: `@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders")`
2. **@EntityGraph**: `@EntityGraph(attributePaths = {"orders"})`
3. **@BatchSize**: `@OneToMany @BatchSize(size=10)`

### Q3: LazyInitializationException怎么解决?

**A**: 
1. 在Service层用`Hibernate.initialize()`强制加载
2. 使用JOIN FETCH一次性查询
3. 配置OpenEntityManagerInViewFilter(不推荐)

### Q4: 双向关系如何维护一致性?

**A**: 在实体类中添加便捷方法:

```java
public class User {
    private List<Order> orders = new ArrayList<>();
    
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);  // 维护两端
    }
}
```

### Q5: 如何实现软删除?

**A**: 使用@SQLDelete注解:

```java
@Entity
@SQLDelete(sql = "UPDATE user SET deleted = 1 WHERE id = ?")
@Where(clause = "deleted = 0")
public class User {
    private Integer deleted;
}
```

---

## 实战技巧

### 技巧1: 封装通用Repository

```java
@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, ID>, 
                                                JpaSpecificationExecutor<T> {
    // 所有Repository的公共方法
}

public interface UserRepository extends BaseRepository<User, Long> {
    // 用户特有的查询
}
```

### 技巧2: 批量插入优化

```java
@Service
@Transactional
public class UserService {
    
    @PersistenceContext
    private EntityManager em;
    
    public void batchSave(List<User> users) {
        int batchSize = 50;
        for (int i = 0; i < users.size(); i++) {
            em.persist(users.get(i));
            
            if (i % batchSize == 0 && i > 0) {
                em.flush();    // 刷新到数据库
                em.clear();    // 清空一级缓存
            }
        }
    }
}
```

### 技巧3: 动态排序

```java
public Page<User> searchUsers(String keyword, String sortBy, String order, 
                              int page, int size) {
    
    Sort.Direction direction = "desc".equalsIgnoreCase(order) ? 
        Sort.Direction.DESC : Sort.Direction.ASC;
    
    Sort sort = Sort.by(direction, sortBy);
    Pageable pageable = PageRequest.of(page, size, sort);
    
    Specification<User> spec = SpecificationUtil.like("username", keyword);
    
    return userRepository.findAll(spec, pageable);
}
```

---

## 下一步学习

完成Spring Data JPA后,建议继续学习:

1. **综合实战项目** - 博客系统/电商系统(应用JPA或MyBatis-Plus)
2. **Spring Security安全框架** - 认证授权、JWT、RBAC
3. **Spring Cloud微服务** - 服务注册、配置中心、网关

---

## 参考资源

- [Spring Data JPA官方文档](https://spring.io/projects/spring-data-jpa)
- 《Java Persistence with Hibernate》
- 《Pro JPA 2 in Java EE 8》
