# PLsql基础

## 一、PL/SQL 基础认知

> - PLSQL = Oracle 专用编程语言
> - 程序结构 = 声明→ 执行 → 异常
> - 能干普通SQL干不了的事情（判断、循环、批量处理）

**什么是 PL/SQL？**

一句话定义：PL/SQL是Oracle数据库专用的编程语言，把SQL(查询)+过程化逻辑（判断/循环）合二为一。

- PL = Procedural Language
- SQL = 数据库查询语言
- 合起来：既能写查询，又能写程序逻辑



**和普通SQL的区别？**

- 普通 SQL：只能单条执行（查、增、删、改）
- PL/SQL：**可以写一整套逻辑**（判断工资高低、循环处理数据、出错自动处理）



**能干嘛？**

- 批量处理数据
- 写复杂业务逻辑
- 存储过程、函数、触发器
- 数据迁移、数据清洗
- 自动化任务



**PL/SQL三大特点**

- 只在Oracle里运行
- 执行速度极快（一次性发送给数据库，减少网络交互）
- 结构化、安全、可复用



**PL/SQL最核心结构：块（Block）**

所有PL/SQL程序，都由块组成。

一个标准块 = 4部分：

```plaintext
DECLARE      声明区(变量、常量、游标)
BEGIN   	 执行区（写逻辑、SQL）
EXCEPTION	 异常区（出错了怎么办）
END;		 结束
```

最简单的PL/SQL块（可直接运行）

```plsql
BEGIN
	DBMS_OUTPUT.PUT_LINE('Hello PL/SQL');
END;
/
```

完整标准块（带声明 + 执行 + 异常）

```plsql
DECLARE
  -- 声明变量
  v_name VARCHAR2(20) := '张三';
BEGIN
  -- 执行逻辑
  DBMS_OUTPUT.PUT_LINE('姓名：' || v_name);

  -- 模拟错误
  RAISE ZERO_DIVIDE;

EXCEPTION
  -- 异常处理
  WHEN ZERO_DIVIDE THEN
    DBMS_OUTPUT.PUT_LINE('错误：不能除以0');
END;
/
```

运行结果：

```plaintext
姓名：张三
错误：不能除以0
```



**PL/SQL运行环境**

可以用这些工具运行 PL/SQL：

- PL/SQL Developer（最常用）
- SQL Developer（Oracle 官方免费）
- DBeaver
- Toad

注意：运行前必须开启输出：

```sql
SET SERVEROUTPUT ON;
```



**为什么要学 PL/SQL？**

- 企业 Oracle 开发**必须会**
- 金融、银行、电信核心系统全用它
- 处理大批量数据比普通 SQL 快 10~100 倍
- 面试必考、工作必用









- 过程化 + SQL 结合的语言
- 只能在 Oracle 里运行

**PL/SQL 程序结构**

- 块结构：`DECLARE` → `BEGIN` → `EXCEPTION` → `END`

**运行环境**

- SQL Developer、PL/SQL Developer、DBeaver

**优点**

- 执行快、减少网络交互、可复用、安全



## 二、PL/SQL 语法基础

变量与常量

注释

输出语句







## 三、流程控制







## 四、游标（Cursor）







## 五、异常处理（EXCEPTION）



















