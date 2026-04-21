# MySQL 速查手册

> 常用语法、命令和技巧的快速参考

---

## 📑 目录

- [数据类型](#数据类型)
- [DDL语句](#ddl语句)
- [DML语句](#dml语句)
- [DQL语句](#dql语句)
- [索引操作](#索引操作)
- [事务控制](#事务控制)
- [用户权限](#用户权限)
- [系统管理](#系统管理)
- [性能优化](#性能优化)
- [常用函数](#常用函数)

---

## 数据类型

### 数值类型

| 类型 | 大小 | 范围 | 用途 |
|------|------|------|------|
| TINYINT | 1字节 | -128~127 | 年龄、状态 |
| SMALLINT | 2字节 | -32768~32767 | 较小整数 |
| MEDIUMINT | 3字节 | -8388608~8388607 | 中等整数 |
| INT | 4字节 | -21亿~21亿 | 常用整数 |
| BIGINT | 8字节 | 极大整数 | ID、时间戳 |
| FLOAT | 4字节 | 单精度浮点 | 近似小数 |
| DOUBLE | 8字节 | 双精度浮点 | 近似小数 |
| DECIMAL(M,D) | 可变 | 精确小数 | 金额 |

### 字符串类型

| 类型 | 说明 | 最大长度 | 用途 |
|------|------|---------|------|
| CHAR(N) | 定长 | 255字符 | 手机号、身份证 |
| VARCHAR(N) | 变长 | 65535字节 | 姓名、邮箱 |
| TINYTEXT | 文本 | 255字节 | 短文本 |
| TEXT | 文本 | 64KB | 文章内容 |
| MEDIUMTEXT | 文本 | 16MB | 中等文本 |
| LONGTEXT | 文本 | 4GB | 大文本 |

### 日期时间类型

| 类型 | 格式 | 范围 | 用途 |
|------|------|------|------|
| DATE | YYYY-MM-DD | 1000-01-01 ~ 9999-12-31 | 生日 |
| TIME | HH:MM:SS | -838:59:59 ~ 838:59:59 | 时长 |
| YEAR | YYYY | 1901 ~ 2155 | 年份 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 1000 ~ 9999 | 创建时间 |
| TIMESTAMP | YYYY-MM-DD HH:MM:SS | 1970 ~ 2038 | 更新时间 |

---

## DDL语句

### 数据库操作

```sql
-- 创建数据库
CREATE DATABASE [IF NOT EXISTS] db_name 
    [CHARACTER SET utf8mb4] 
    [COLLATE utf8mb4_unicode_ci];

-- 删除数据库
DROP DATABASE [IF EXISTS] db_name;

-- 使用数据库
USE db_name;

-- 查看所有数据库
SHOW DATABASES;

-- 查看当前数据库
SELECT DATABASE();
```

### 表操作

```sql
-- 创建表
CREATE TABLE table_name (
    column1 datatype constraints,
    column2 datatype constraints,
    ...
    [CONSTRAINT constraint_name] PRIMARY KEY (column),
    [CONSTRAINT constraint_name] FOREIGN KEY (column) REFERENCES ref_table(ref_column),
    [INDEX|UNIQUE INDEX] index_name (column)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 示例
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    age TINYINT UNSIGNED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_age (age)
);

-- 删除表
DROP TABLE [IF EXISTS] table_name;

-- 清空表(保留结构)
TRUNCATE TABLE table_name;

-- 修改表名
ALTER TABLE old_name RENAME TO new_name;

-- 添加列
ALTER TABLE table_name ADD COLUMN column_name datatype [constraints];

-- 删除列
ALTER TABLE table_name DROP COLUMN column_name;

-- 修改列
ALTER TABLE table_name MODIFY COLUMN column_name new_datatype;
ALTER TABLE table_name CHANGE COLUMN old_name new_name new_datatype;

-- 查看表结构
DESC table_name;
DESCRIBE table_name;
SHOW COLUMNS FROM table_name;

-- 查看所有表
SHOW TABLES;

-- 查看建表语句
SHOW CREATE TABLE table_name;
```

---

## DML语句

### INSERT

```sql
-- 插入单条
INSERT INTO table_name (col1, col2) VALUES (val1, val2);

-- 插入多条
INSERT INTO table_name (col1, col2) VALUES 
    (val1, val2),
    (val3, val4),
    (val5, val6);

-- 插入所有列
INSERT INTO table_name VALUES (val1, val2, val3);

-- 存在则更新
INSERT INTO table_name (id, name) VALUES (1, '张三')
ON DUPLICATE KEY UPDATE name = '张三';

-- 从查询结果插入
INSERT INTO table_name (col1, col2)
SELECT col1, col2 FROM another_table WHERE condition;
```

### UPDATE

```sql
-- 更新数据
UPDATE table_name 
SET col1 = val1, col2 = val2 
WHERE condition;

-- 示例
UPDATE users 
SET age = 26, updated_at = NOW() 
WHERE id = 1;

-- 多表更新
UPDATE table1 t1
INNER JOIN table2 t2 ON t1.id = t2.ref_id
SET t1.col1 = t2.col2
WHERE condition;
```

### DELETE

```sql
-- 删除数据
DELETE FROM table_name WHERE condition;

-- 示例
DELETE FROM users WHERE id = 1;

-- 清空表(比DELETE快,重置自增ID)
TRUNCATE TABLE table_name;

-- 多表删除
DELETE t1 FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.ref_id
WHERE condition;
```

---

## DQL语句

### SELECT基础

```sql
-- 基本查询
SELECT column1, column2 FROM table_name;

-- 查询所有列
SELECT * FROM table_name;

-- 去重
SELECT DISTINCT column FROM table_name;

-- 别名
SELECT column AS alias FROM table_name;
SELECT column alias FROM table_name;  -- AS可省略

-- 条件查询
SELECT * FROM table_name 
WHERE condition;

-- 常用条件运算符
-- =, !=, <>, >, <, >=, <=
-- BETWEEN ... AND ...
-- IN (val1, val2, ...)
-- LIKE 'pattern'  (%任意字符, _单个字符)
-- IS NULL, IS NOT NULL
-- AND, OR, NOT
```

### ORDER BY

```sql
-- 排序
SELECT * FROM table_name 
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC];

-- 示例
SELECT * FROM users 
ORDER BY age DESC, created_at ASC;
```

### LIMIT

```sql
-- 限制返回行数
SELECT * FROM table_name LIMIT n;

-- 分页(跳过m行,返回n行)
SELECT * FROM table_name LIMIT m, n;
SELECT * FROM table_name LIMIT n OFFSET m;

-- 示例: 第3页,每页10条
SELECT * FROM users LIMIT 20, 10;
```

### 聚合函数

```sql
-- COUNT: 计数
SELECT COUNT(*) FROM table_name;
SELECT COUNT(column) FROM table_name;  -- 不计NULL

-- SUM: 求和
SELECT SUM(column) FROM table_name;

-- AVG: 平均值
SELECT AVG(column) FROM table_name;

-- MAX: 最大值
SELECT MAX(column) FROM table_name;

-- MIN: 最小值
SELECT MIN(column) FROM table_name;
```

### GROUP BY

```sql
-- 分组查询
SELECT column, AGG_FUNC(column) 
FROM table_name 
GROUP BY column;

-- 示例
SELECT department, COUNT(*), AVG(salary) 
FROM employees 
GROUP BY department;

-- HAVING: 分组后过滤
SELECT department, AVG(salary) 
FROM employees 
GROUP BY department 
HAVING AVG(salary) > 5000;
```

### JOIN

```sql
-- INNER JOIN (内连接)
SELECT * FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.ref_id;

-- LEFT JOIN (左外连接)
SELECT * FROM table1 t1
LEFT JOIN table2 t2 ON t1.id = t2.ref_id;

-- RIGHT JOIN (右外连接)
SELECT * FROM table1 t1
RIGHT JOIN table2 t2 ON t1.id = t2.ref_id;

-- CROSS JOIN (交叉连接)
SELECT * FROM table1 t1
CROSS JOIN table2 t2;

-- 多表JOIN
SELECT * FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.ref_id
INNER JOIN table3 t3 ON t2.id = t3.ref_id;
```

### 子查询

```sql
-- WHERE中的子查询
SELECT * FROM table_name 
WHERE column IN (SELECT column FROM another_table);

-- FROM中的子查询
SELECT * FROM (
    SELECT column FROM table_name WHERE condition
) AS subquery;

-- EXISTS子查询
SELECT * FROM table1 t1
WHERE EXISTS (
    SELECT 1 FROM table2 t2 WHERE t2.ref_id = t1.id
);
```

### UNION

```sql
-- 合并结果集(去重)
SELECT column FROM table1
UNION
SELECT column FROM table2;

-- 合并结果集(不去重)
SELECT column FROM table1
UNION ALL
SELECT column FROM table2;
```

---

## 索引操作

### 创建索引

```sql
-- 创建普通索引
CREATE INDEX index_name ON table_name (column);

-- 创建唯一索引
CREATE UNIQUE INDEX index_name ON table_name (column);

-- 创建联合索引
CREATE INDEX index_name ON table_name (col1, col2, col3);

-- 创建前缀索引
CREATE INDEX index_name ON table_name (column(10));

-- 创建全文索引
CREATE FULLTEXT INDEX index_name ON table_name (column);

-- 建表时创建索引
CREATE TABLE table_name (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    INDEX idx_name (name),
    UNIQUE INDEX idx_email (email)
);

-- ALTER TABLE添加索引
ALTER TABLE table_name ADD INDEX index_name (column);
ALTER TABLE table_name ADD UNIQUE INDEX index_name (column);
ALTER TABLE table_name ADD PRIMARY KEY (column);
```

### 查看索引

```sql
-- 查看表的所有索引
SHOW INDEX FROM table_name;
SHOW KEYS FROM table_name;
```

### 删除索引

```sql
-- 删除索引
DROP INDEX index_name ON table_name;

-- ALTER TABLE删除索引
ALTER TABLE table_name DROP INDEX index_name;

-- 删除主键
ALTER TABLE table_name DROP PRIMARY KEY;
```

---

## 事务控制

### 基本事务

```sql
-- 开启事务
START TRANSACTION;
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 设置保存点
SAVEPOINT savepoint_name;

-- 回滚到保存点
ROLLBACK TO savepoint_name;

-- 释放保存点
RELEASE SAVEPOINT savepoint_name;
```

### 隔离级别

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL 
    READ UNCOMMITTED | 
    READ COMMITTED | 
    REPEATABLE READ | 
    SERIALIZABLE;

-- 设置全局隔离级别
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### 自动提交

```sql
-- 查看自动提交状态
SELECT @@autocommit;

-- 关闭自动提交
SET autocommit = 0;

-- 开启自动提交
SET autocommit = 1;
```

---

## 用户权限

### 用户管理

```sql
-- 创建用户
CREATE USER 'username'@'host' IDENTIFIED BY 'password';

-- 示例
CREATE USER 'test'@'localhost' IDENTIFIED BY '123456';
CREATE USER 'test'@'%' IDENTIFIED BY '123456';  -- 允许任意主机

-- 删除用户
DROP USER 'username'@'host';

-- 修改密码
ALTER USER 'username'@'host' IDENTIFIED BY 'new_password';
SET PASSWORD FOR 'username'@'host' = PASSWORD('new_password');

-- 查看所有用户
SELECT user, host FROM mysql.user;
```

### 权限管理

```sql
-- 授权
GRANT privilege_type ON database.table TO 'username'@'host';

-- 示例
GRANT ALL PRIVILEGES ON mydb.* TO 'test'@'localhost';
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'test'@'localhost';
GRANT SELECT ON *.* TO 'readonly'@'%';

-- 撤销权限
REVOKE privilege_type ON database.table FROM 'username'@'host';

-- 查看用户权限
SHOW GRANTS FOR 'username'@'host';

-- 刷新权限
FLUSH PRIVILEGES;
```

**常用权限:**
- `ALL PRIVILEGES`: 所有权限
- `SELECT`: 查询
- `INSERT`: 插入
- `UPDATE`: 更新
- `DELETE`: 删除
- `CREATE`: 创建
- `DROP`: 删除
- `ALTER`: 修改
- `INDEX`: 索引
- `EXECUTE`: 执行存储过程

---

## 系统管理

### 变量配置

```sql
-- 查看系统变量
SHOW VARIABLES;
SHOW VARIABLES LIKE 'pattern';

-- 查看会话变量
SELECT @@variable_name;

-- 设置会话变量
SET variable_name = value;
SET SESSION variable_name = value;

-- 设置全局变量
SET GLOBAL variable_name = value;
```

### 进程管理

```sql
-- 查看当前进程
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- 杀死进程
KILL process_id;
```

### 状态信息

```sql
-- 查看服务器状态
SHOW STATUS;
SHOW STATUS LIKE 'pattern';

-- 常用状态
SHOW STATUS LIKE 'Threads_connected';    -- 当前连接数
SHOW STATUS LIKE 'Queries';              -- 查询总数
SHOW STATUS LIKE 'Slow_queries';         -- 慢查询数
SHOW STATUS LIKE 'Uptime';               -- 运行时间(秒)
```

### 日志管理

```sql
-- 查看日志配置
SHOW VARIABLES LIKE '%log%';

-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/path/to/slow.log';
SET GLOBAL long_query_time = 2;

-- 刷新日志
FLUSH LOGS;
```

---

## 性能优化

### EXPLAIN分析

```sql
-- 分析查询执行计划
EXPLAIN SELECT * FROM table_name WHERE condition;
EXPLAIN FORMAT=JSON SELECT * FROM table_name;  -- JSON格式

-- 关键字段说明
-- id: 查询标识
-- select_type: 查询类型
-- table: 访问的表
-- type: 访问类型(system > const > eq_ref > ref > range > index > ALL)
-- possible_keys: 可能使用的索引
-- key: 实际使用的索引
-- key_len: 索引长度
-- rows: 预估扫描行数
-- Extra: 额外信息
```

### 表维护

```sql
-- 分析表(更新索引统计信息)
ANALYZE TABLE table_name;

-- 检查表
CHECK TABLE table_name;

-- 优化表(整理碎片)
OPTIMIZE TABLE table_name;

-- 修复表
REPAIR TABLE table_name;
```

### 缓存管理

```sql
-- 查看查询缓存
SHOW VARIABLES LIKE 'query_cache%';

-- 清除查询缓存
RESET QUERY CACHE;

-- 清除所有缓存
FLUSH TABLES;
```

---

## 常用函数

### 字符串函数

```sql
-- 长度
LENGTH(str)          -- 字节长度
CHAR_LENGTH(str)     -- 字符长度

-- 大小写转换
UPPER(str)           -- 转大写
LOWER(str)           -- 转小写

-- 截取
SUBSTRING(str, start, length)
LEFT(str, n)         -- 左边n个字符
RIGHT(str, n)        -- 右边n个字符

-- 拼接
CONCAT(str1, str2, ...)
CONCAT_WS(separator, str1, str2, ...)

-- 替换
REPLACE(str, from, to)

-- 去除空格
TRIM(str)
LTRIM(str)           -- 去左空格
RTRIM(str)           -- 去右空格

-- 查找位置
LOCATE(substr, str)
INSTR(str, substr)

-- 重复
REPEAT(str, count)

-- 反转
REVERSE(str)
```

### 数值函数

```sql
-- 绝对值
ABS(x)

-- 取整
CEIL(x)              -- 向上取整
FLOOR(x)             -- 向下取整
ROUND(x, d)          -- 四舍五入

-- 随机数
RAND()               -- 0-1之间的随机数

-- 最大值/最小值
GREATEST(val1, val2, ...)
LEAST(val1, val2, ...)

-- 幂运算
POW(x, y)            -- x的y次方
SQRT(x)              -- 平方根

-- 取模
MOD(x, y)
```

### 日期时间函数

```sql
-- 当前时间
NOW()                -- 当前日期时间
CURDATE()            -- 当前日期
CURTIME()            -- 当前时间
SYSDATE()            -- 当前日期时间

-- 提取部分
YEAR(date)
MONTH(date)
DAY(date)
HOUR(time)
MINUTE(time)
SECOND(time)
DAYOFWEEK(date)      -- 星期几(1-7)
DAYNAME(date)        -- 星期名称

-- 格式化
DATE_FORMAT(date, format)
-- %Y: 四位年份  %y: 两位年份
-- %m: 月份(01-12)  %c: 月份(1-12)
-- %d: 日(01-31)  %e: 日(1-31)
-- %H: 小时(00-23)  %h: 小时(01-12)
-- %i: 分钟(00-59)
-- %s: 秒(00-59)

-- 计算
DATEDIFF(date1, date2)     -- 相差天数
TIMEDIFF(time1, time2)     -- 相差时间
DATE_ADD(date, INTERVAL expr unit)
DATE_SUB(date, INTERVAL expr unit)

-- 示例
SELECT DATE_ADD(NOW(), INTERVAL 7 DAY);     -- 7天后
SELECT DATE_SUB(NOW(), INTERVAL 1 MONTH);   -- 1个月前
```

### 条件函数

```sql
-- IF函数
IF(condition, true_val, false_val)

-- IFNULL函数
IFNULL(expr, default_val)

-- NULLIF函数
NULLIF(expr1, expr2)  -- 如果相等返回NULL,否则返回expr1

-- CASE表达式
CASE 
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END

-- 示例
SELECT 
    name,
    CASE 
        WHEN score >= 90 THEN '优秀'
        WHEN score >= 80 THEN '良好'
        WHEN score >= 60 THEN '及格'
        ELSE '不及格'
    END AS grade
FROM students;
```

### 其他函数

```sql
-- UUID
UUID()                 -- 生成UUID

-- 加密
MD5(str)               -- MD5加密
SHA1(str)              -- SHA1加密
SHA2(str, hash_length) -- SHA2加密

-- 类型转换
CAST(expr AS type)
CONVERT(expr, type)

-- 分组聚合
GROUP_CONCAT(column SEPARATOR ',')  -- 将多行合并为一行
```

---

## 🔖 常用技巧

### 批量操作

```sql
-- 批量插入(比逐条插入快10倍以上)
INSERT INTO table_name (col1, col2) VALUES 
    (val1, val2),
    (val3, val4),
    ...
    (valN, valN);

-- 批量更新
UPDATE table_name 
SET col1 = CASE id
    WHEN 1 THEN 'value1'
    WHEN 2 THEN 'value2'
    WHEN 3 THEN 'value3'
END
WHERE id IN (1, 2, 3);
```

### 分页优化

```sql
-- 传统分页(深分页慢)
SELECT * FROM table_name LIMIT 100000, 10;

-- 优化方案1: 使用游标
SELECT * FROM table_name WHERE id > 100000 LIMIT 10;

-- 优化方案2: 延迟关联
SELECT t.* FROM table_name t
INNER JOIN (SELECT id FROM table_name LIMIT 100000, 10) tmp 
ON t.id = tmp.id;
```

### 随机查询

```sql
-- 慢: ORDER BY RAND()
SELECT * FROM table_name ORDER BY RAND() LIMIT 1;

-- 快: 使用随机ID
SELECT * FROM table_name 
WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM table_name)))
ORDER BY id ASC 
LIMIT 1;
```

### 排名查询

```sql
-- MySQL 8.0+ 窗口函数
SELECT *, 
    RANK() OVER (ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num
FROM students;

-- MySQL 5.7及以下
SELECT s1.*, 
    (SELECT COUNT(DISTINCT s2.score) 
     FROM students s2 
     WHERE s2.score > s1.score) + 1 AS rank
FROM students s1
ORDER BY rank;
```

---

## 📌 注意事项

1. **SQL注入防护**: 永远不要拼接SQL,使用预编译语句
2. **避免SELECT ***: 只查询需要的字段
3. **合理使用索引**: 过多索引影响写性能
4. **事务要简短**: 尽快提交,避免长事务
5. **定期维护**: ANALYZE TABLE更新统计信息
6. **备份数据**: 定期备份,防止数据丢失
7. **监控慢查询**: 开启慢查询日志,及时优化

---

*本手册持续更新中...*
