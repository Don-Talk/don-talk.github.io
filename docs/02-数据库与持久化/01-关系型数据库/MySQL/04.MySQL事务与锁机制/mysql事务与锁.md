## MySQL事务与锁机制

**学习目标:**
> * 理解事务的ACID特性
> * 掌握事务隔离级别及并发问题
> * 理解MySQL锁机制(行锁、表锁、间隙锁)
> * 了解MVCC多版本并发控制原理
> * 能够分析和解决死锁问题

---

## 1. 事务概述

### 1.1 什么是事务?

事务(Transaction)是数据库操作的最小工作单元,是作为单个逻辑工作单元执行的一系列操作。这些操作要么全部成功,要么全部失败。

**生活中的例子:**

银行转账就是一个典型的事务场景:
```
张三给李四转账1000元:
1. 从张三账户扣除1000元
2. 给李四账户增加1000元
```

这两个操作必须同时成功或同时失败:
- ✅ 如果都成功: 转账完成
- ❌ 如果第1步成功,第2步失败: 需要回滚,把钱退还给张三
- ❌ 如果第1步失败: 直接终止,不执行第2步

### 1.2 事务的ACID特性

事务具有四个核心特性,简称ACID:

**1. 原子性(Atomicity)**
- 事务是一个不可分割的工作单位
- 事务中的操作要么都发生,要么都不发生
- 通过**Undo Log(回滚日志)**实现

**2. 一致性(Consistency)**
- 事务前后数据的完整性必须保持一致
- 转账前总金额10000,转账后总金额还是10000
- 这是事务的最终目标,其他三个特性都是为了保证一致性

**3. 隔离性(Isolation)**
- 多个用户并发访问数据库时,一个用户的事务不能被其他用户的事务干扰
- 多个并发事务之间要相互隔离
- 通过**锁机制**和**MVCC**实现

**4. 持久性(Durability)**
- 一个事务一旦被提交,它对数据库中数据的改变就是永久性的
- 即使数据库发生故障也不应该对其有任何影响
- 通过**Redo Log(重做日志)**实现

<img src="assets/image-acid-properties.png" alt="ACID特性示意图" />

---

## 2. 事务操作

### 2.1 事务的基本语法

```sql
-- 开启事务
START TRANSACTION;  -- 或者 BEGIN;

-- 执行SQL操作
UPDATE account SET balance = balance - 1000 WHERE name = '张三';
UPDATE account SET balance = balance + 1000 WHERE name = '李四';

-- 提交事务(所有操作生效)
COMMIT;

-- 或者回滚事务(所有操作撤销)
ROLLBACK;
```

### 2.2 自动提交

MySQL默认是**自动提交(auto-commit)**模式,每条SQL语句都是一个独立的事务。

```sql
-- 查看自动提交状态
SELECT @@autocommit;  -- 1表示开启,0表示关闭

-- 关闭自动提交
SET autocommit = 0;

-- 开启自动提交
SET autocommit = 1;
```

**示例对比:**

```sql
-- 自动提交模式(默认)
UPDATE account SET balance = 9000 WHERE name = '张三';  -- 立即生效,无法回滚

-- 手动事务模式
SET autocommit = 0;
UPDATE account SET balance = 9000 WHERE name = '张三';  -- 未提交,可以回滚
ROLLBACK;  -- 数据恢复原状
```

### 2.3 保存点(Savepoint)

保存点允许在事务中设置中间点,可以部分回滚。

```sql
START TRANSACTION;

UPDATE account SET balance = balance - 1000 WHERE name = '张三';
SAVEPOINT step1;  -- 设置保存点

UPDATE account SET balance = balance + 1000 WHERE name = '李四';
SAVEPOINT step2;  -- 设置保存点

-- 回滚到step1,step2的操作会被撤销,但step1之前的操作保留
ROLLBACK TO step1;

-- 或者提交整个事务
COMMIT;
```

### 2.4 实战案例: 转账操作

```sql
-- 创建账户表
CREATE TABLE account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    UNIQUE INDEX idx_name (name)
);

-- 插入测试数据
INSERT INTO account (name, balance) VALUES ('张三', 10000), ('李四', 5000);

-- 转账存储过程
DELIMITER $$
CREATE PROCEDURE transfer(
    IN from_name VARCHAR(50),
    IN to_name VARCHAR(50),
    IN amount DECIMAL(10, 2)
)
BEGIN
    -- 声明异常处理变量
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- 发生异常时回滚
        ROLLBACK;
        RESIGNAL;  -- 重新抛出异常
    END;
    
    -- 开启事务
    START TRANSACTION;
    
    -- 检查余额是否充足
    IF (SELECT balance FROM account WHERE name = from_name) < amount THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '余额不足';
    END IF;
    
    -- 扣款
    UPDATE account SET balance = balance - amount WHERE name = from_name;
    
    -- 收款
    UPDATE account SET balance = balance + amount WHERE name = to_name;
    
    -- 提交事务
    COMMIT;
END$$
DELIMITER ;

-- 调用存储过程
CALL transfer('张三', '李四', 1000);

-- 查询结果
SELECT * FROM account;
```

---

## 3. 并发问题

当多个事务同时执行时,如果没有正确的隔离机制,会产生以下并发问题:

### 3.1 脏读(Dirty Read)

**定义:** 一个事务读取到了另一个事务**未提交**的数据。

**场景演示:**

| 时间 | 事务A | 事务B |
|------|-------|-------|
| T1 | `START TRANSACTION;` | |
| T2 | | `START TRANSACTION;` |
| T3 | `UPDATE account SET balance = 9000 WHERE name = '张三';` | |
| T4 | | `SELECT balance FROM account WHERE name = '张三';` ← 读到9000(脏数据) |
| T5 | `ROLLBACK;` ← 回滚,余额恢复10000 | |
| T6 | | `SELECT balance FROM account WHERE name = '张三';` ← 读到10000 |

事务B在T4时刻读到的9000是**脏数据**,因为事务A最终回滚了。

**危害:** 基于脏数据做出的决策可能是错误的。

### 3.2 不可重复读(Non-Repeatable Read)

**定义:** 在同一个事务中,多次读取同一数据,返回的结果不同。

**场景演示:**

| 时间 | 事务A | 事务B |
|------|-------|-------|
| T1 | `START TRANSACTION;` | |
| T2 | `SELECT balance FROM account WHERE name = '张三';` ← 读到10000 | |
| T3 | | `START TRANSACTION;` |
| T4 | | `UPDATE account SET balance = 9000 WHERE name = '张三';` |
| T5 | | `COMMIT;` |
| T6 | `SELECT balance FROM account WHERE name = '张三';` ← 读到9000 | |

事务A在T2和T6两次读取同一条记录,结果不一样(10000 → 9000)。

**危害:** 在一个事务内,同样的查询得到不同的结果,导致逻辑错误。

### 3.3 幻读(Phantom Read)

**定义:** 在同一个事务中,多次查询符合某个条件的记录,返回的记录数不同。

**场景演示:**

| 时间 | 事务A | 事务B |
|------|-------|-------|
| T1 | `START TRANSACTION;` | |
| T2 | `SELECT * FROM account WHERE balance > 8000;` ← 返回1条(张三) | |
| T3 | | `START TRANSACTION;` |
| T4 | | `INSERT INTO account (name, balance) VALUES ('王五', 9500);` |
| T5 | | `COMMIT;` |
| T6 | `SELECT * FROM account WHERE balance > 8000;` ← 返回2条(张三、王五) | |

事务A在T2和T6两次查询,记录数从1条变成了2条,好像出现了"幻影"。

**危害:** 批量操作时可能遗漏或重复处理数据。

### 3.4 三类问题对比

| 并发问题 | 描述 | 关键点 |
|---------|------|--------|
| **脏读** | 读到未提交的数据 | 读的是**未提交**的修改 |
| **不可重复读** | 同一事务多次读取结果不同 | 重点是**UPDATE/DELETE** |
| **幻读** | 同一事务多次查询记录数不同 | 重点是**INSERT** |

> 💡 **记忆技巧:**
> - 脏读: 读了"脏"数据(未提交)
> - 不可重复读: 同样的查询,结果"不可重复"
> - 幻读: 记录像"幻影"一样突然出现或消失

---

## 4. 事务隔离级别

为了解决上述并发问题,SQL标准定义了四种事务隔离级别。

### 4.1 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|---------|------|-----------|------|------|
| **READ UNCOMMITTED**(读未提交) | ❌ 可能出现 | ❌ 可能出现 | ❌ 可能出现 | ⭐⭐⭐⭐⭐ 最高 |
| **READ COMMITTED**(读已提交) | ✅ 避免 | ❌ 可能出现 | ❌ 可能出现 | ⭐⭐⭐⭐ |
| **REPEATABLE READ**(可重复读) | ✅ 避免 | ✅ 避免 | ❌ 可能出现* | ⭐⭐⭐ |
| **SERIALIZABLE**(串行化) | ✅ 避免 | ✅ 避免 | ✅ 避免 | ⭐ 最低 |

> *注: MySQL的InnoDB引擎在REPEATABLE READ级别下通过MVCC和间隙锁已经基本解决了幻读问题。

**MySQL默认隔离级别:** `REPEATABLE READ`

### 4.2 查看和设置隔离级别

```sql
-- 查看当前会话的隔离级别
SELECT @@transaction_isolation;  -- MySQL 8.0+
-- 或者
SELECT @@tx_isolation;  -- MySQL 5.7

-- 查看全局隔离级别
SELECT @@global.transaction_isolation;

-- 设置当前会话的隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 设置全局隔离级别
SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

也可以在配置文件中设置:
```ini
# my.cnf 或 my.ini
[mysqld]
transaction-isolation = REPEATABLE-READ
```

### 4.3 各隔离级别详解

#### 4.3.1 READ UNCOMMITTED(读未提交)

**特点:**
- 最低的隔离级别
- 允许读取尚未提交的数据变更
- 会产生脏读、不可重复读、幻读

**使用场景:** 
- 几乎不使用,除非对数据一致性要求极低且追求极致性能

**示例:**
```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- 事务A
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE name = '张三';
-- 此时事务B可以读到9000,即使事务A还没提交

-- 事务B
START TRANSACTION;
SELECT balance FROM account WHERE name = '张三';  -- 读到9000(脏数据)
```

#### 4.3.2 READ COMMITTED(读已提交)

**特点:**
- 只能读取已经提交的数据
- 避免了脏读
- 会出现不可重复读和幻读
- **Oracle、SQL Server的默认隔离级别**

**实现原理:** 
- 每次读取数据时都会生成一个新的ReadView(快照)

**示例:**
```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 事务A
START TRANSACTION;
SELECT balance FROM account WHERE name = '张三';  -- 读到10000
-- 等待...
SELECT balance FROM account WHERE name = '张三';  -- 可能读到9000(如果事务B已提交)

-- 事务B(在事务A两次查询之间执行)
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE name = '张三';
COMMIT;
```

**使用场景:**
- 大多数业务场景
- 对一致性要求不是特别高的系统

#### 4.3.3 REPEATABLE READ(可重复读)

**特点:**
- **MySQL的默认隔离级别**
- 确保在同一事务中多次读取同样记录的结果是一致的
- 避免了脏读和不可重复读
- 理论上会出现幻读,但InnoDB通过MVCC+间隙锁基本解决

**实现原理:**
- 事务启动时生成一个ReadView(快照),整个事务期间都使用这个快照
- 配合间隙锁(Gap Lock)防止幻读

**示例:**
```sql
-- MySQL默认就是这个级别,无需设置

-- 事务A
START TRANSACTION;
SELECT balance FROM account WHERE name = '张三';  -- 读到10000
-- 等待...
SELECT balance FROM account WHERE name = '张三';  -- 还是10000(即使事务B已提交)

-- 事务B(在事务A两次查询之间执行)
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE name = '张三';
COMMIT;
```

**使用场景:**
- 需要保证事务内数据一致性的场景
- 报表统计、数据分析等

#### 4.3.4 SERIALIZABLE(串行化)

**特点:**
- 最高的隔离级别
- 强制事务串行执行,完全避免并发问题
- 性能最差,大量超时和锁竞争

**实现原理:**
- 在每个读取的数据行上添加共享锁
- 其他事务不能修改这些数据,直到当前事务结束

**示例:**
```sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 事务A
START TRANSACTION;
SELECT * FROM account WHERE name = '张三';  -- 加共享锁

-- 事务B
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE name = '张三';  -- 阻塞,等待事务A结束
```

**使用场景:**
- 对数据一致性要求极高的场景
- 金融系统的核心交易
- 一般不建议使用,可以通过其他方式优化

### 4.4 隔离级别选择建议

| 场景 | 推荐隔离级别 | 原因 |
|------|------------|------|
| 普通Web应用 | READ COMMITTED | 性能好,满足大部分需求 |
| 金融系统 | REPEATABLE READ | 保证事务内数据一致性 |
| 数据统计分析 | REPEATABLE READ | 避免统计过程中数据变化 |
| 高并发场景 | READ COMMITTED | 减少锁竞争,提高吞吐量 |
| 极端一致性要求 | SERIALIZABLE | 牺牲性能换取绝对一致性 |

> 💡 **实际建议:** 
> - 大部分场景使用默认的`REPEATABLE READ`即可
> - 如果并发压力大,可以考虑`READ COMMITTED`
> - 尽量避免使用`SERIALIZABLE`

---

## 5. MySQL锁机制

锁是数据库实现隔离性的核心手段,用于控制并发访问。

### 5.1 锁的分类

#### 按粒度分类

**1. 全局锁(Global Lock)**
- 锁定整个数据库实例
- 命令: `FLUSH TABLES WITH READ LOCK;`
- 使用场景: 全库备份

**2. 表级锁(Table Lock)**
- 锁定整张表
- 开销小,加锁快
- 并发度低,容易冲突
- MyISAM存储引擎只支持表锁

**3. 行级锁(Row Lock)**
- 锁定特定的行
- 开销大,加锁慢
- 并发度高
- InnoDB存储引擎支持行锁

#### 按性质分类

**1. 共享锁(Shared Lock, S锁)**
- 也叫读锁
- 多个事务可以同时持有
- 持有S锁的事务可以读数据,但不能修改
- 其他事务可以继续获取S锁,但不能获取X锁

**2. 排他锁(Exclusive Lock, X锁)**
- 也叫写锁
- 只允许一个事务持有
- 持有X锁的事务可以读和写
- 其他事务不能获取任何锁(S锁或X锁)

**兼容性矩阵:**

|  | S锁 | X锁 |
|---|-----|-----|
| **S锁** | ✅ 兼容 | ❌ 冲突 |
| **X锁** | ❌ 冲突 | ❌ 冲突 |

#### 按算法分类(InnoDB)

**1. 记录锁(Record Lock)**
- 锁定索引中的一条记录

**2. 间隙锁(Gap Lock)**
- 锁定索引记录之间的间隙
- 防止其他事务在间隙中插入数据

**3. 临键锁(Next-Key Lock)**
- 记录锁 + 间隙锁
- 锁定一个范围,包括记录本身和前面的间隙
- 默认算法,用于解决幻读问题

### 5.2 InnoDB行锁详解

InnoDB的行锁是通过**锁定索引**实现的,如果SQL没有使用索引,会退化为表锁。

#### 5.2.1 记录锁(Record Lock)

锁定单个索引记录。

```sql
-- 假设id是主键
-- 事务A
START TRANSACTION;
SELECT * FROM account WHERE id = 1 FOR UPDATE;  -- 加排他锁

-- 事务B
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE id = 1;  -- 阻塞,等待事务A释放锁
```

#### 5.2.2 间隙锁(Gap Lock)

锁定索引记录之间的间隙,防止插入。

```sql
-- 假设account表有数据: id = 1, 3, 5, 7

-- 事务A
START TRANSACTION;
SELECT * FROM account WHERE id = 3 FOR UPDATE;
-- 不仅锁定id=3这条记录,还会锁定(1,3)和(3,5)两个间隙

-- 事务B
INSERT INTO account (id, name, balance) VALUES (2, '王五', 1000);  -- 阻塞
INSERT INTO account (id, name, balance) VALUES (4, '赵六', 1000);  -- 阻塞
```

**间隙锁的作用:**
- 防止其他事务在间隙中插入数据
- 解决幻读问题

#### 5.2.3 临键锁(Next-Key Lock)

记录锁 + 间隙锁,锁定一个左开右闭的区间。

```sql
-- 假设account表有数据: id = 1, 3, 5, 7

-- 事务A
START TRANSACTION;
SELECT * FROM account WHERE id >= 3 AND id <= 5 FOR UPDATE;
-- 锁定的范围: (1, 7], 即:
-- - 间隙 (1, 3)
-- - 记录 3
-- - 间隙 (3, 5)
-- - 记录 5
-- - 间隙 (5, 7)

-- 事务B
INSERT INTO account (id, name, balance) VALUES (2, '王五', 1000);  -- 阻塞
INSERT INTO account (id, name, balance) VALUES (4, '赵六', 1000);  -- 阻塞
INSERT INTO account (id, name, balance) VALUES (6, '孙七', 1000);  -- 阻塞
UPDATE account SET balance = 8000 WHERE id = 3;  -- 阻塞
UPDATE account SET balance = 8000 WHERE id = 5;  -- 阻塞
```

### 5.3 表锁

#### 5.3.1 显式表锁

```sql
-- 加读锁
LOCK TABLES account READ;

-- 加写锁
LOCK TABLES account WRITE;

-- 释放锁
UNLOCK TABLES;
```

**特点:**
- 读锁: 其他事务可以读,但不能写
- 写锁: 其他事务不能读也不能写

#### 5.3.2 隐式表锁

某些操作会自动升级为表锁:
- ALTER TABLE
- LOCK TABLES
- 没有索引的UPDATE/DELETE

```sql
-- 如果status字段没有索引,这个UPDATE会锁全表
UPDATE account SET status = 1 WHERE status = 0;
```

### 5.4 意向锁(Intention Lock)

意向锁是**表级锁**,用于表明事务稍后要获取哪种类型的行锁。

**类型:**
- **意向共享锁(IS):** 事务打算给数据行加S锁
- **意向排他锁(IX):** 事务打算给数据行加X锁

**作用:**
- 提高加锁效率,不需要逐行检查
- 如果一个事务想加表锁,只需检查是否有其他事务持有不相容的意向锁

**兼容性矩阵:**

|  | IS | IX | S | X |
|---|----|----|---|---|
| **IS** | ✅ | ✅ | ✅ | ❌ |
| **IX** | ✅ | ✅ | ❌ | ❌ |
| **S** | ✅ | ❌ | ✅ | ❌ |
| **X** | ❌ | ❌ | ❌ | ❌ |

**工作流程:**
```
事务A要对某行加X锁:
1. 先获取表的IX锁
2. 再获取该行的X锁

事务B要对全表加S锁:
1. 检查表上是否有IX锁 → 发现有,冲突!
2. 等待事务A释放
```

### 5.5 锁监控与排查

#### 5.5.1 查看锁信息

```sql
-- 查看正在等待锁的事务
SELECT * FROM information_schema.innodb_lock_waits;

-- 查看锁信息(MySQL 8.0+)
SELECT * FROM performance_schema.data_locks;

-- 查看事务信息
SELECT * FROM information_schema.innodb_trx;

-- 查看进程列表
SHOW FULL PROCESSLIST;
```

#### 5.5.2 查找锁等待

```sql
-- 查询哪些事务在等待锁,哪些事务持有锁
SELECT 
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
```

#### 5.5.3 杀死阻塞的事务

```sql
-- 找到阻塞的线程ID后,可以杀死它
KILL thread_id;
```

---

## 6. 死锁(Deadlock)

### 6.1 什么是死锁?

死锁是指两个或多个事务在执行过程中,因争夺资源而造成的一种**互相等待**的现象。

**经典场景:**

| 时间 | 事务A | 事务B |
|------|-------|-------|
| T1 | 锁定id=1的行 | |
| T2 | | 锁定id=2的行 |
| T3 | 请求锁定id=2的行 → 等待 | |
| T4 | | 请求锁定id=1的行 → 等待 |
| T5 | **死锁!** | **死锁!** |

事务A等待事务B释放id=2的锁,事务B等待事务A释放id=1的锁,形成循环等待。

### 6.2 死锁产生的四个必要条件

1. **互斥条件:** 资源一次只能被一个事务使用
2. **占有并等待:** 事务持有资源的同时等待其他资源
3. **不可剥夺:** 已获得的资源在使用完之前不能被剥夺
4. **循环等待:** 存在一个事务等待环

### 6.3 死锁示例

```sql
-- 准备数据
CREATE TABLE test_lock (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO test_lock VALUES (1, 'A'), (2, 'B');

-- 事务A
START TRANSACTION;
UPDATE test_lock SET name = 'A1' WHERE id = 1;  -- 锁定id=1
-- 等待...
UPDATE test_lock SET name = 'B1' WHERE id = 2;  -- 等待事务B释放id=2

-- 事务B(在事务A执行第一条UPDATE后执行)
START TRANSACTION;
UPDATE test_lock SET name = 'B2' WHERE id = 2;  -- 锁定id=2
UPDATE test_lock SET name = 'A2' WHERE id = 1;  -- 等待事务A释放id=1

-- 结果: InnoDB检测到死锁,会回滚其中一个事务
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
```

### 6.4 死锁检测与处理

**InnoDB的死锁检测机制:**
- 主动检测: 通过wait-for graph算法检测循环等待
- 超时机制: `innodb_lock_wait_timeout`(默认50秒)

**查看死锁日志:**
```sql
SHOW ENGINE INNODB STATUS\G
```

输出中会有类似这样的信息:
```
------------------------
LATEST DETECTED DEADLOCK
------------------------
*** (1) TRANSACTION:
TRANSACTION 12345, ACTIVE 10 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1136, 1 row lock(s)
MySQL thread id 10, OS thread handle 1234, query id 5678 localhost root updating
UPDATE test_lock SET name = 'B1' WHERE id = 2

*** (2) TRANSACTION:
TRANSACTION 12346, ACTIVE 8 sec starting index read
mysql tables in use 1, locked 1
2 lock struct(s), heap size 1136, 1 row lock(s)
MySQL thread id 11, OS thread handle 5678, query id 9012 localhost root updating
UPDATE test_lock SET name = 'A2' WHERE id = 1

*** WE ROLL BACK TRANSACTION (2)
```

### 6.5 避免死锁的最佳实践

**1. 固定顺序访问资源**
```sql
-- ❌ 容易导致死锁
-- 事务A: 先更新id=1,再更新id=2
-- 事务B: 先更新id=2,再更新id=1

-- ✅ 统一按id从小到大访问
-- 事务A和事务B都: 先更新id=1,再更新id=2
```

**2. 一次性申请所有需要的锁**
```sql
-- 在事务开始时就把所有需要的数据都锁定
START TRANSACTION;
SELECT * FROM test_lock WHERE id IN (1, 2) FOR UPDATE;
-- 然后进行更新操作
UPDATE test_lock SET name = 'A1' WHERE id = 1;
UPDATE test_lock SET name = 'B1' WHERE id = 2;
COMMIT;
```

**3. 降低隔离级别**
- 使用`READ COMMITTED`可以减少锁的范围

**4. 合理设计索引**
- 确保查询能使用索引,避免锁升级

**5. 设置合理的超时时间**
```sql
-- 设置锁等待超时时间为10秒
SET innodb_lock_wait_timeout = 10;
```

**6. 重试机制**
```java
// Java代码示例
int maxRetries = 3;
for (int i = 0; i < maxRetries; i++) {
    try {
        // 执行事务
        transaction.execute();
        break;
    } catch (DeadlockLoserDataAccessException e) {
        if (i == maxRetries - 1) {
            throw e;
        }
        // 等待一段时间后重试
        Thread.sleep(100 * (i + 1));
    }
}
```

---

## 7. MVCC多版本并发控制

### 7.1 什么是MVCC?

MVCC(Multi-Version Concurrency Control)是一种并发控制机制,通过保存数据的多个版本,使得读写操作不会相互阻塞。

**核心思想:**
- 读操作读取快照数据,不加锁
- 写操作创建新版本数据
- 不同事务可以看到不同版本的数据

**优势:**
- 读写不冲突,提高并发性能
- 实现非阻塞读

### 7.2 MVCC的实现原理

InnoDB通过以下三个组件实现MVCC:

**1. 隐藏列**
每行记录都有两个隐藏列:
- `DB_TRX_ID`: 最近修改该行记录的事务ID
- `DB_ROLL_PTR`: 回滚指针,指向undo log中的历史版本

**2. Undo Log(回滚日志)**
- 记录数据的历史版本
- 形成版本链

**3. ReadView(读视图)**
- 事务启动时生成的快照
- 包含当前活跃事务列表

<img src="assets/image-mvcc-version-chain.png" alt="MVCC版本链示意图" />

### 7.3 ReadView的可见性判断

当事务读取数据时,会通过ReadView判断哪个版本的数据是可见的。

**ReadView包含:**
- `m_ids`: 创建ReadView时当前系统中活跃的事务ID列表
- `min_trx_id`: m_ids中的最小值
- `max_trx_id`: 创建ReadView时系统分配给下一个事务的ID
- `creator_trx_id`: 创建ReadView的事务ID

**可见性判断规则:**

对于版本链中的每个版本,从最新到最旧依次判断:

1. 如果`DB_TRX_ID == creator_trx_id`,说明是当前事务修改的,**可见**
2. 如果`DB_TRX_ID < min_trx_id`,说明事务已经提交,**可见**
3. 如果`DB_TRX_ID >= max_trx_id`,说明事务还未启动,**不可见**
4. 如果`DB_TRX_ID`在`m_ids`中,说明事务还未提交,**不可见**
5. 如果`DB_TRX_ID`不在`m_ids`中,说明事务已经提交,**可见**

### 7.4 RC和RR级别的差异

**READ COMMITTED(读已提交):**
- 每次SELECT都会生成新的ReadView
- 可以读到其他事务已提交的数据

**REPEATABLE READ(可重复读):**
- 只在第一次SELECT时生成ReadView
- 整个事务期间都使用同一个ReadView
- 保证可重复读

**示例对比:**

```sql
-- 初始数据: id=1, balance=10000

-- ===== RC级别 =====
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 事务A
START TRANSACTION;
SELECT balance FROM account WHERE id = 1;  -- 读到10000,生成ReadView1

-- 事务B
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE id = 1;
COMMIT;

-- 事务A
SELECT balance FROM account WHERE id = 1;  -- 读到9000,生成新的ReadView2

-- ===== RR级别 =====
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 事务A
START TRANSACTION;
SELECT balance FROM account WHERE id = 1;  -- 读到10000,生成ReadView

-- 事务B
START TRANSACTION;
UPDATE account SET balance = 9000 WHERE id = 1;
COMMIT;

-- 事务A
SELECT balance FROM account WHERE id = 1;  -- 还是10000,复用ReadView
```

### 7.5 MVCC与当前读

**快照读(Snapshot Read):**
- 普通的SELECT语句
- 读取快照数据,不加锁
- 使用MVCC

```sql
SELECT * FROM account WHERE id = 1;  -- 快照读
```

**当前读(Current Read):**
- SELECT ... FOR UPDATE
- SELECT ... LOCK IN SHARE MODE
- UPDATE、DELETE、INSERT
- 读取最新版本数据,加锁

```sql
SELECT * FROM account WHERE id = 1 FOR UPDATE;  -- 当前读,加X锁
UPDATE account SET balance = 9000 WHERE id = 1;  -- 当前读,加X锁
```

---

## 8. 实战案例分析

### 8.1 案例1: 库存扣减

**场景:** 电商秒杀场景,多个用户同时购买同一商品。

**问题:** 如何保证库存不会超卖?

**方案1: 悲观锁(使用FOR UPDATE)**
```sql
START TRANSACTION;

-- 查询库存并加锁
SELECT stock FROM product WHERE id = 1 FOR UPDATE;

-- 检查库存
IF stock > 0 THEN
    -- 扣减库存
    UPDATE product SET stock = stock - 1 WHERE id = 1;
    -- 创建订单
    INSERT INTO orders (product_id, user_id) VALUES (1, 100);
    COMMIT;
ELSE
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '库存不足';
END IF;
```

**优点:** 简单可靠
**缺点:** 并发度低,大量事务等待

**方案2: 乐观锁(使用版本号)**
```sql
-- 添加version字段
ALTER TABLE product ADD COLUMN version INT DEFAULT 0;

-- 扣减库存
UPDATE product 
SET stock = stock - 1, version = version + 1 
WHERE id = 1 AND stock > 0 AND version = #{oldVersion};

-- 检查影响行数
-- 如果影响行数为0,说明版本已变化,需要重试
```

**优点:** 并发度高
**缺点:** 高冲突时需要频繁重试

**方案3: Redis预扣减 + 异步同步**
```
1. 将库存加载到Redis
2. 用户在Redis中扣减库存(DECR命令,原子操作)
3. 扣减成功后,异步创建订单并同步到MySQL
```

**优点:** 性能极高
**缺点:** 架构复杂,需要考虑数据一致性

### 8.2 案例2: 账户余额更新

**场景:** 用户充值、消费时更新账户余额。

**问题:** 如何保证余额计算的准确性?

**错误做法:**
```sql
-- ❌ 先查询,再计算,再更新(存在竞态条件)
SELECT balance FROM account WHERE id = 1;  -- 读到10000
-- 应用层计算: 10000 + 500 = 10500
UPDATE account SET balance = 10500 WHERE id = 1;
-- 如果另一个事务也在这期间更新了余额,就会丢失更新
```

**正确做法:**
```sql
-- ✅ 使用数据库层面的原子操作
UPDATE account SET balance = balance + 500 WHERE id = 1;

-- 或者使用事务 + 悲观锁
START TRANSACTION;
SELECT balance FROM account WHERE id = 1 FOR UPDATE;
-- 应用层计算
UPDATE account SET balance = #{newBalance} WHERE id = 1;
COMMIT;
```

### 8.3 案例3: 批量数据处理

**场景:** 定时任务批量处理订单。

**问题:** 如何避免重复处理和长时间锁表?

**解决方案:**
```sql
-- 使用分页 + 乐观锁
SET @batch_size = 100;
SET @last_id = 0;

WHILE TRUE DO
    START TRANSACTION;
    
    -- 获取一批待处理的订单
    SELECT id FROM orders 
    WHERE status = 0 AND id > @last_id 
    ORDER BY id 
    LIMIT @batch_size 
    FOR UPDATE SKIP LOCKED;  -- 跳过已被锁定的行
    
    -- 如果没有数据,退出循环
    IF ROW_COUNT() = 0 THEN
        COMMIT;
        BREAK;
    END IF;
    
    -- 处理订单
    UPDATE orders SET status = 1 WHERE id IN (...);
    
    -- 记录最后一个ID
    SET @last_id = MAX(id);
    
    COMMIT;
    
    -- 短暂休眠,减少负载
    DO SLEEP(0.1);
END WHILE;
```

**关键点:**
- `FOR UPDATE SKIP LOCKED`: 跳过已被锁定的行,避免等待
- 分批处理: 每批100条,减少锁持有时间
- 记录进度: 从中断处继续

---

## 9. 总结

### 核心要点回顾

1. **事务ACID:** 原子性、一致性、隔离性、持久性
2. **并发问题:** 脏读、不可重复读、幻读
3. **隔离级别:** RU、RC、RR、SERIALIZABLE,MySQL默认RR
4. **锁类型:** 共享锁、排他锁、间隙锁、临键锁
5. **死锁:** 循环等待,需要检测和预防
6. **MVCC:** 多版本并发控制,实现非阻塞读

### 最佳实践

✅ **推荐做法:**
- 尽量缩短事务 duration,快速提交
- 避免在事务中进行网络请求、文件IO等耗时操作
- 合理设计索引,避免锁升级
- 使用乐观锁提高并发性能
- 设置合理的锁超时时间

❌ **避免做法:**
- 长事务,长时间持有锁
- 在事务中等待用户输入
- 大事务一次性处理大量数据
- 忽略死锁异常,不做重试

### 学习路线

1. **入门:** 掌握事务基本操作和ACID
2. **进阶:** 理解隔离级别和并发问题
3. **深入:** 学习锁机制和MVCC原理
4. **实战:** 分析和解决实际项目中的并发问题

---

**练习题:**

1. 解释什么是脏读、不可重复读、幻读,并举例说明
2. MySQL默认的事务隔离级别是什么?它能解决哪些并发问题?
3. 什么情况下会发生死锁?如何避免?
4. MVCC是如何实现非阻塞读的?RC和RR级别有什么区别?
5. 设计一个高并发场景下的库存扣减方案,说明优缺点
