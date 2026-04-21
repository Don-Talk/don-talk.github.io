## MySQL索引与性能优化

**学习目标:**
> * 理解索引的工作原理和数据结构
> * 掌握索引的创建、查看和删除操作
> * 了解索引失效的常见场景
> * 学会使用EXPLAIN分析SQL性能
> * 掌握查询优化的实用技巧

---

## 1. 索引概述

### 1.1 什么是索引?

索引(Index)是帮助MySQL高效获取数据的数据结构。我们可以把索引理解为书籍的目录,通过目录可以快速定位到需要的内容,而不需要逐页翻阅。

**没有索引的情况:**
```sql
-- 假设user表有100万条数据,查询姓名为"张三"的用户
SELECT * FROM user WHERE name = '张三';
```
如果没有索引,MySQL需要进行**全表扫描**,逐行检查100万条数据,效率极低。

**有索引的情况:**
```sql
-- 为name字段添加索引后
CREATE INDEX idx_name ON user(name);
SELECT * FROM user WHERE name = '张三';
```
有了索引,MySQL可以通过索引快速定位到"张三"这条记录,可能只需要几次磁盘I/O就能找到。

### 1.2 索引的优缺点

**优点:**
- ✅ 大大提高数据检索速度,减少磁盘I/O
- ✅ 加速表与表之间的连接操作
- ✅ 在使用ORDER BY和GROUP BY时可以显著减少排序时间

**缺点:**
- ❌ 索引本身也需要占用存储空间
- ❌ 对数据进行增删改时,索引也需要维护,降低写操作性能
- ❌ 过多的索引会导致优化器选择困难

> 💡 **经验法则:** 索引不是越多越好,要根据实际查询需求合理创建。

---

## 2. 索引底层原理

### 2.1 B+树数据结构

MySQL的InnoDB存储引擎默认使用**B+树**作为索引的数据结构。

**为什么选择B+树而不是其他结构?**

| 数据结构 | 优点 | 缺点 |
|---------|------|------|
| 哈希表 | 等值查询快O(1) | 不支持范围查询、排序 |
| 二叉搜索树 | 支持范围查询 | 树可能退化成链表,高度不稳定 |
| 平衡二叉树(AVL) | 树高度稳定 | 每次插入删除可能需要大量旋转 |
| **B+树** | **矮胖,磁盘I/O少;支持范围查询;叶子节点形成链表** | **实现相对复杂** |

**B+树的特点:**
1. **非叶子节点只存储键值信息**,不存储数据,这样可以容纳更多索引项,降低树的高度
2. **所有数据都存储在叶子节点**,并且叶子节点之间通过指针连接形成双向链表
3. **树的高度通常为2-3层**,即使是千万级数据,查询也只需要2-3次磁盘I/O

<img src="assets/image-btree-structure.png" alt="B+树结构示意图" />

**举例说明:**
假设一个三层B+树:
- 根节点可以存储1000个索引项
- 每个中间节点可以存储1000个索引项  
- 每个叶子节点可以存储100条数据

那么这棵树可以存储: `1000 × 1000 × 100 = 1亿` 条数据!

而查询任意一条数据,最多只需要**3次磁盘I/O**(根节点→中间节点→叶子节点)。

### 2.2 聚簇索引与非聚簇索引

**聚簇索引(Clustered Index):**
- InnoDB的主键索引就是聚簇索引
- **叶子节点存储整行数据**
- 一张表只能有一个聚簇索引
- 数据按照主键顺序存储

**非聚簇索引(Secondary Index):**
- 也叫辅助索引、二级索引
- **叶子节点存储主键值**,需要通过主键再查询完整数据(回表)
- 一张表可以有多个非聚簇索引

<img src="assets/image-clustered-vs-secondary.png" alt="聚簇索引vs非聚簇索引" />

**覆盖索引(Covering Index):**
如果查询的列都在索引中,就不需要回表查询,这种情况称为覆盖索引,性能最优。

```sql
-- 假设在(name, age)上建立了联合索引
SELECT name, age FROM user WHERE name = '张三';  -- ✅ 覆盖索引,不需要回表
SELECT name, age, email FROM user WHERE name = '张三';  -- ❌ 需要回表查询email
```

---

## 3. 索引分类

### 3.1 按功能分类

**1. 主键索引(PRIMARY KEY)**
- 特殊的唯一索引,不允许NULL值
- 一张表只能有一个主键索引
- 创建表时自动创建

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- 主键索引
    name VARCHAR(50),
    age INT
);
```

**2. 唯一索引(UNIQUE)**
- 索引列的值必须唯一,允许NULL值
- 可以有多个唯一索引

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE,  -- 唯一索引
    email VARCHAR(100) UNIQUE
);

-- 或者单独创建
CREATE UNIQUE INDEX idx_phone ON user(phone);
```

**3. 普通索引(INDEX/KEY)**
- 最基本的索引,没有任何限制
- 可以加速查询

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    age INT,
    INDEX idx_name (name)  -- 普通索引
);

-- 或者单独创建
CREATE INDEX idx_age ON user(age);
```

**4. 全文索引(FULLTEXT)**
- 用于全文搜索,适用于CHAR、VARCHAR、TEXT类型
- MyISAM和InnoDB(InnoDB从MySQL 5.6开始支持)都支持

```sql
CREATE TABLE article (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    FULLTEXT INDEX ft_content (content)
);

-- 使用全文索引查询
SELECT * FROM article WHERE MATCH(content) AGAINST('MySQL索引');
```

**5. 空间索引(SPATIAL)**
- 用于地理空间数据类型,如GEOMETRY
- 较少使用

### 3.2 按字段数量分类

**单列索引:**
- 索引只包含一个字段

```sql
CREATE INDEX idx_name ON user(name);
```

**联合索引(复合索引):**
- 索引包含多个字段
- 遵循**最左前缀原则**

```sql
-- 创建联合索引
CREATE INDEX idx_name_age ON user(name, age, city);

-- ✅ 可以使用索引
SELECT * FROM user WHERE name = '张三';
SELECT * FROM user WHERE name = '张三' AND age = 25;
SELECT * FROM user WHERE name = '张三' AND age = 25 AND city = '北京';

-- ❌ 不能使用索引(违反最左前缀原则)
SELECT * FROM user WHERE age = 25;
SELECT * FROM user WHERE city = '北京';
SELECT * FROM user WHERE age = 25 AND city = '北京';

-- ⚠️ 部分使用索引
SELECT * FROM user WHERE name = '张三' AND city = '北京';  
-- 只使用了name字段索引,city字段无法使用
```

**最左前缀原则图解:**
```
联合索引: (name, age, city)

相当于创建了三个索引:
- (name)
- (name, age)  
- (name, age, city)

查询条件必须从最左边开始匹配
```

---

## 4. 索引操作

### 4.1 创建索引

**方式一: 创建表时创建索引**

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    age INT,
    email VARCHAR(100),
    phone VARCHAR(20),
    
    -- 创建普通索引
    INDEX idx_name (name),
    
    -- 创建唯一索引
    UNIQUE INDEX idx_email (email),
    
    -- 创建联合索引
    INDEX idx_age_city (age, city)
);
```

**方式二: 已有表上创建索引**

```sql
-- 创建普通索引
CREATE INDEX idx_name ON user(name);

-- 创建唯一索引
CREATE UNIQUE INDEX idx_phone ON user(phone);

-- 创建联合索引
CREATE INDEX idx_name_age ON user(name, age);

-- 使用ALTER TABLE创建索引
ALTER TABLE user ADD INDEX idx_email(email);
ALTER TABLE user ADD UNIQUE INDEX idx_phone(phone);
```

### 4.2 查看索引

```sql
-- 查看表的所有索引
SHOW INDEX FROM user;

-- 或者
SHOW KEYS FROM user;
```

输出结果说明:
- `Key_name`: 索引名称
- `Column_name`: 索引列名
- `Non_unique`: 是否唯一(0表示唯一,1表示非唯一)
- `Seq_in_index`: 列在索引中的位置
- `Cardinality`: 索引中唯一值的估计数量

### 4.3 删除索引

```sql
-- 方式一
DROP INDEX idx_name ON user;

-- 方式二
ALTER TABLE user DROP INDEX idx_name;

-- 删除主键索引(需要先去掉AUTO_INCREMENT)
ALTER TABLE user MODIFY id INT;
ALTER TABLE user DROP PRIMARY KEY;
```

### 4.4 修改索引

MySQL不支持直接修改索引,需要先删除再重新创建。

```sql
-- 修改索引: 先删除,再创建
DROP INDEX idx_name ON user;
CREATE INDEX idx_name ON user(name, age);
```

---

## 5. 索引失效场景

即使创建了索引,在某些情况下索引也会失效,导致全表扫描。以下是常见的索引失效场景:

### 5.1 违反最左前缀原则

```sql
-- 联合索引: idx_name_age_city (name, age, city)

-- ❌ 索引失效
SELECT * FROM user WHERE age = 25 AND city = '北京';

-- ✅ 索引有效
SELECT * FROM user WHERE name = '张三' AND age = 25;
```

### 5.2 在索引列上进行计算或函数操作

```sql
-- 假设有索引 idx_age (age)

-- ❌ 索引失效
SELECT * FROM user WHERE age + 1 = 26;
SELECT * FROM user WHERE YEAR(birthday) = 1995;
SELECT * FROM user WHERE LEFT(name, 2) = '张';

-- ✅ 索引有效
SELECT * FROM user WHERE age = 25;
SELECT * FROM user WHERE birthday >= '1995-01-01' AND birthday < '1996-01-01';
SELECT * FROM user WHERE name LIKE '张%';
```

### 5.3 使用不等于(!=或<>)

```sql
-- 假设有索引 idx_age (age)

-- ❌ 索引失效(大部分情况)
SELECT * FROM user WHERE age != 25;
SELECT * FROM user WHERE age <> 25;

-- ✅ 索引有效
SELECT * FROM user WHERE age > 25;
```

> 注意: 不等于是否使用索引取决于数据分布,如果符合条件的数据很少,优化器可能仍会使用索引。

### 5.4 IS NULL 和 IS NOT NULL

```sql
-- 假设有索引 idx_age (age)

-- ⚠️ IS NULL 可能使用索引(取决于数据分布)
SELECT * FROM user WHERE age IS NULL;

-- ❌ IS NOT NULL 通常索引失效
SELECT * FROM user WHERE age IS NOT NULL;
```

### 5.5 LIKE以通配符开头

```sql
-- 假设有索引 idx_name (name)

-- ❌ 索引失效
SELECT * FROM user WHERE name LIKE '%三';
SELECT * FROM user WHERE name LIKE '%三%';

-- ✅ 索引有效
SELECT * FROM user WHERE name LIKE '张%';

-- ✅ 使用覆盖索引可以避免回表
SELECT name FROM user WHERE name LIKE '%三%';  -- 覆盖索引
```

### 5.6 字符串不加引号

```sql
-- 假设phone是VARCHAR类型,有索引

-- ❌ 索引失效(发生隐式类型转换)
SELECT * FROM user WHERE phone = 13800138000;

-- ✅ 索引有效
SELECT * FROM user WHERE phone = '13800138000';
```

### 5.7 OR连接的条件

```sql
-- 假设name有索引,但没有索引

-- ❌ 索引失效(如果OR中有一个条件没有索引,则全部失效)
SELECT * FROM user WHERE name = '张三' OR age = 25;

-- ✅ 索引有效(两个条件都有索引)
SELECT * FROM user WHERE name = '张三' OR email = 'zhangsan@test.com';
```

### 5.8 数据类型的隐式转换

```sql
-- 假设user_id是VARCHAR类型

-- ❌ 索引失效
SELECT * FROM user WHERE user_id = 123;  -- 数字

-- ✅ 索引有效
SELECT * FROM user WHERE user_id = '123';  -- 字符串
```

### 5.9 ORDER BY导致的索引失效

```sql
-- 联合索引 idx_name_age (name, age)

-- ❌ 索引失效(排序方向不一致)
SELECT * FROM user ORDER BY name ASC, age DESC;

-- ✅ 索引有效
SELECT * FROM user ORDER BY name ASC, age ASC;

-- ❌ 索引失效(跳跃排序)
SELECT * FROM user ORDER BY age;

-- ✅ 索引有效
SELECT * FROM user ORDER BY name;
SELECT * FROM user ORDER BY name, age;
```

---

## 6. SQL性能分析 - EXPLAIN

### 6.1 EXPLAIN基本用法

EXPLAIN命令可以模拟优化器执行SQL语句,帮助我们分析查询性能。

```sql
EXPLAIN SELECT * FROM user WHERE name = '张三';
```

输出结果关键字段说明:

| 字段 | 说明 |
|------|------|
| id | 查询标识符,数字越大优先级越高 |
| select_type | 查询类型(SIMPLE、PRIMARY、SUBQUERY等) |
| table | 访问的表名 |
| type | **访问类型(重要)**,性能从好到差 |
| possible_keys | 可能使用的索引 |
| key | **实际使用的索引** |
| key_len | 使用的索引长度 |
| ref | 显示索引的哪一列被使用 |
| rows | **预估需要扫描的行数** |
| Extra | 额外信息 |

### 6.2 type字段详解(重要)

type字段表示访问类型,性能从高到低:

```
system > const > eq_ref > ref > range > index > ALL
```

**1. system(最优)**
- 表只有一行记录(系统表)
- 这是const类型的特例

**2. const**
- 通过主键或唯一索引一次就找到
- 通常是比较主键或唯一索引的等值查询

```sql
EXPLAIN SELECT * FROM user WHERE id = 1;
-- type: const
```

**3. eq_ref**
- 唯一性索引扫描,对于每个索引键,表中只有一条记录与之匹配
- 常见于主键或唯一索引的多表连接

```sql
EXPLAIN SELECT * FROM emp e JOIN dept d ON e.dept_id = d.id;
-- dept表的type可能是eq_ref
```

**4. ref**
- 非唯一性索引扫描,返回匹配某个单独值的所有行
- 常见于普通索引的等值查询

```sql
EXPLAIN SELECT * FROM user WHERE name = '张三';
-- 如果name是普通索引,type为ref
```

**5. range**
- 索引范围扫描,常见于between、>、<、in等操作

```sql
EXPLAIN SELECT * FROM user WHERE age BETWEEN 20 AND 30;
EXPLAIN SELECT * FROM user WHERE id IN (1, 2, 3);
-- type: range
```

**6. index**
- 全索引扫描,只遍历索引树
- 比ALL快,因为索引文件通常比数据文件小

```sql
EXPLAIN SELECT name FROM user;
-- 如果只查询索引列,type可能是index
```

**7. ALL(最差)**
- 全表扫描,需要优化!

```sql
EXPLAIN SELECT * FROM user WHERE age = 25;
-- 如果age没有索引,type为ALL
```

### 6.3 Extra字段详解

Extra字段提供额外的执行信息,常见值:

**✅ 好的信号:**
- `Using index`: 使用覆盖索引,性能很好
- `Using where`: 使用了WHERE过滤
- `Using index condition`: 使用了索引下推优化

**❌ 不好的信号:**
- `Using filesort`: 需要额外的排序操作,无法利用索引排序
- `Using temporary`: 使用了临时表,常见于GROUP BY、DISTINCT
- `Using join buffer`: 使用了连接缓存,说明连接条件没有使用索引

### 6.4 实战案例分析

**案例1: 分析慢查询**

```sql
-- 创建测试表
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50),
    user_id INT,
    amount DECIMAL(10, 2),
    create_time DATETIME,
    status TINYINT,
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
);

-- 插入10万条测试数据(省略)

-- 分析查询
EXPLAIN SELECT * FROM orders 
WHERE user_id = 100 
AND create_time > '2024-01-01'
ORDER BY create_time DESC;
```

分析结果:
- 如果type为range,说明使用了索引范围扫描
- 如果Extra出现Using filesort,说明排序没有用到索引
- 可以考虑创建联合索引: `INDEX idx_user_time (user_id, create_time)`

**案例2: 优化分页查询**

```sql
-- 深分页问题
EXPLAIN SELECT * FROM orders LIMIT 100000, 10;
-- type: ALL, 需要扫描100010行

-- 优化方案1: 使用子查询
EXPLAIN SELECT * FROM orders 
WHERE id > (SELECT id FROM orders LIMIT 100000, 1) 
LIMIT 10;

-- 优化方案2: 记录上次查询的最大id
SELECT * FROM orders WHERE id > 100000 LIMIT 10;
```

---

## 7. 查询优化技巧

### 7.1 选择合适的字段类型

```sql
-- ❌ 不好: 使用过大的数据类型
CREATE TABLE user (
    id BIGINT,  -- 如果数据量不大,用INT即可
    age TINYINT UNSIGNED,  -- ✅ 年龄0-255,TINYINT足够
    status ENUM('active', 'inactive')  -- ✅ 枚举类型更节省空间
);
```

**字段类型选择原则:**
- 越小越好:TINYINT < SMALLINT < MEDIUMINT < INT < BIGINT
- 越简单越好:能用数字就不用字符串
- 避免NULL:使用NOT NULL DEFAULT 0或空字符串

### 7.2 避免SELECT *

```sql
-- ❌ 不好: 查询所有字段
SELECT * FROM user WHERE id = 1;

-- ✅ 好: 只查询需要的字段
SELECT id, name, age FROM user WHERE id = 1;
```

**原因:**
- 减少网络传输
- 可能使用覆盖索引
- 表结构变化时不影响代码

### 7.3 优化LIKE查询

```sql
-- ❌ 索引失效
SELECT * FROM user WHERE name LIKE '%张%';

-- ✅ 使用前缀匹配
SELECT * FROM user WHERE name LIKE '张%';

-- ✅ 使用全文索引
SELECT * FROM article WHERE MATCH(content) AGAINST('MySQL');

-- ✅ 使用搜索引擎(Elasticsearch)处理复杂搜索
```

### 7.4 优化分页查询

```sql
-- ❌ 深分页性能差
SELECT * FROM orders LIMIT 100000, 10;

-- ✅ 方案1: 使用游标分页
SELECT * FROM orders WHERE id > 100000 LIMIT 10;

-- ✅ 方案2: 延迟关联
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders LIMIT 100000, 10) tmp
ON o.id = tmp.id;
```

### 7.5 优化JOIN查询

```sql
-- ❌ 大表JOIN大表
SELECT * FROM orders o 
JOIN users u ON o.user_id = u.id
WHERE o.create_time > '2024-01-01';

-- ✅ 优化方案:
-- 1. 确保连接字段有索引
-- 2. 小表驱动大表
-- 3. 先过滤再JOIN
SELECT o.*, u.name 
FROM (SELECT * FROM orders WHERE create_time > '2024-01-01') o
JOIN users u ON o.user_id = u.id;
```

### 7.6 使用批量操作

```sql
-- ❌ 逐条插入
INSERT INTO user (name, age) VALUES ('张三', 25);
INSERT INTO user (name, age) VALUES ('李四', 26);
INSERT INTO user (name, age) VALUES ('王五', 27);

-- ✅ 批量插入
INSERT INTO user (name, age) VALUES 
('张三', 25),
('李四', 26),
('王五', 27);
```

### 7.7 合理使用索引提示

```sql
-- 强制使用某个索引
SELECT * FROM user FORCE INDEX(idx_name) WHERE name = '张三';

-- 忽略某个索引
SELECT * FROM user IGNORE INDEX(idx_age) WHERE age = 25;

-- 建议使用某个索引
SELECT * FROM user USE INDEX(idx_name) WHERE name = '张三';
```

> ⚠️ 索引提示要谨慎使用,让优化器自己选择通常更好。

### 7.8 避免在WHERE子句中使用函数

```sql
-- ❌ 索引失效
SELECT * FROM user WHERE YEAR(create_time) = 2024;

-- ✅ 改写为范围查询
SELECT * FROM user 
WHERE create_time >= '2024-01-01' 
AND create_time < '2025-01-01';
```

---

## 8. 索引最佳实践

### 8.1 什么时候应该创建索引?

✅ **适合创建索引的场景:**
1. 频繁出现在WHERE、ORDER BY、GROUP BY中的字段
2. 作为JOIN连接条件的字段
3. 区分度高的字段(Cardinality高)
4. 频繁查询且数据量大的表

### 8.2 什么时候不应该创建索引?

❌ **不适合创建索引的场景:**
1. 数据量小的表(几千条以内)
2. 区分度低的字段(如性别、状态)
3. 频繁更新的字段
4. 很少用于查询的字段
5. TEXT、BLOB等大文本字段(可以创建前缀索引)

### 8.3 索引设计原则

**1. 最左前缀原则**
```sql
-- 联合索引 (a, b, c)
-- 可以使用的查询:
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3

-- 不能使用的查询:
WHERE b = 2
WHERE c = 3
WHERE b = 2 AND c = 3
```

**2. 索引列不能参与计算**
```sql
-- ❌ 索引失效
WHERE age + 1 = 26

-- ✅ 索引有效
WHERE age = 25
```

**3. 尽量选择区分度高的列**
```sql
-- 区分度 = COUNT(DISTINCT column) / COUNT(*)
-- 区分度越接近1越好

-- 性别字段区分度低(只有男/女),不适合单独建索引
-- 身份证号区分度高,适合建索引
```

**4. 使用前缀索引减少索引大小**
```sql
-- 对于长字符串,可以只索引前N个字符
CREATE INDEX idx_name_prefix ON user(name(10));

-- 查看合适的前缀长度
SELECT 
    COUNT(DISTINCT LEFT(name, 5)) / COUNT(*) AS ratio_5,
    COUNT(DISTINCT LEFT(name, 10)) / COUNT(*) AS ratio_10,
    COUNT(DISTINCT LEFT(name, 20)) / COUNT(*) AS ratio_20
FROM user;
```

**5. 避免冗余索引**
```sql
-- ❌ 冗余索引
INDEX idx_a (a),
INDEX idx_a_b (a, b)  -- 包含了idx_a的功能

-- ✅ 保留联合索引即可
INDEX idx_a_b (a, b)
```

### 8.4 索引监控与维护

**查看未使用的索引:**
```sql
-- MySQL 5.7+
SELECT * FROM sys.schema_unused_indexes;
```

**查看索引使用情况:**
```sql
SHOW STATUS LIKE 'Handler_read%';
```
- `Handler_read_key`: 通过索引读取的次数(越高越好)
- `Handler_read_rnd_next`: 全表扫描次数(越低越好)

**定期分析和优化表:**
```sql
-- 更新索引统计信息
ANALYZE TABLE user;

-- 优化表(整理碎片)
OPTIMIZE TABLE user;
```

---

## 9. 实战演练

### 9.1 场景: 电商订单查询优化

**需求:**
- 查询某用户的订单列表
- 按创建时间倒序排列
- 支持分页

**初始设计:**
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50),
    user_id INT,
    amount DECIMAL(10, 2),
    status TINYINT,
    create_time DATETIME,
    INDEX idx_user_id (user_id)
);

-- 查询语句
SELECT * FROM orders 
WHERE user_id = 100 
ORDER BY create_time DESC 
LIMIT 0, 10;
```

**问题分析:**
```sql
EXPLAIN SELECT * FROM orders 
WHERE user_id = 100 
ORDER BY create_time DESC 
LIMIT 0, 10;
```

可能的结果:
- type: ref (使用了idx_user_id)
- Extra: Using filesort (需要额外排序)

**优化方案:**
```sql
-- 创建联合索引
ALTER TABLE orders ADD INDEX idx_user_time (user_id, create_time);

-- 再次分析
EXPLAIN SELECT * FROM orders 
WHERE user_id = 100 
ORDER BY create_time DESC 
LIMIT 0, 10;
```

优化后:
- type: ref
- Extra: Using index condition (不再需要filesort)

### 9.2 场景: 模糊查询优化

**需求:**
- 商品名称模糊搜索
- 支持前后模糊匹配

**方案对比:**

**方案1: LIKE(简单但性能一般)**
```sql
SELECT * FROM products WHERE name LIKE '%手机%';
-- 索引失效,全表扫描
```

**方案2: 全文索引(推荐)**
```sql
ALTER TABLE products ADD FULLTEXT INDEX ft_name (name);

SELECT * FROM products 
WHERE MATCH(name) AGAINST('手机' IN BOOLEAN MODE);
```

**方案3: Elasticsearch(大数据量推荐)**
- 适合海量数据的复杂搜索
- 支持分词、相关性排序等高级功能

---

## 10. 总结

### 核心要点回顾

1. **索引原理**: B+树结构,降低磁盘I/O
2. **索引类型**: 主键、唯一、普通、联合、全文索引
3. **最左前缀原则**: 联合索引从左到右匹配
4. **索引失效**: 函数运算、类型转换、LIKE '%xx'等
5. **性能分析**: 熟练使用EXPLAIN分析SQL
6. **优化技巧**: 避免SELECT *、批量操作、合理使用索引

### 学习建议

1. **理论结合实践**: 在自己的数据库中创建索引并测试
2. **养成习惯**: 写SQL前先思考是否需要索引
3. **持续监控**: 定期检查慢查询日志
4. **循序渐进**: 先掌握基础索引,再学习高级优化

### 下一步学习

- MySQL事务与锁机制
- MySQL存储引擎深入
- MySQL主从复制与读写分离
- 分库分表策略

---

**练习题:**

1. 创建一个用户表,包含id、姓名、手机号、邮箱、年龄、城市字段,并创建合适的索引
2. 使用EXPLAIN分析以下查询,并说明是否使用了索引:
   ```sql
   SELECT * FROM user WHERE phone = '13800138000';
   SELECT * FROM user WHERE age > 25 ORDER BY name;
   SELECT name, age FROM user WHERE city = '北京';
   ```
3. 有一个订单表,经常按用户ID和订单时间查询,如何设计索引?
4. 列举5种索引失效的场景,并给出优化方案
