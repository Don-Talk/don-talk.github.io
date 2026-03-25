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



## 二、PL/SQL 语法基础

> 1. 变量必须先声明再使用
> 2. 赋值用 `:=`
> 3. 字符串用`VARCHAR2`,数字用`NUMBER`
> 4. 推荐用`%TYPE`和`%ROWTYPE`（最安全）
> 5. 打印用`DBMS_OUTPUT.PUT_LINE()`



**开启输出**

```sql
SET SERVEROUTPUT ON;
```

**PL/SQL注释**

```plsql
-- 1. 单行注释（两个减号）

/*
   2. 多行注释
   可以写很多行
*/
BEGIN
  DBMS_OUTPUT.PUT_LINE('注释不影响执行');
END;
/
```

**数据类型（最常用的6种）**

变量必须先指定类型：

| 类型        | 说明                | 例子         |
| ----------- | ------------------- | ------------ |
| NUMBER      | 数字（整数 / 小数） | 100, 8000.50 |
| VARCHAR2(n) | 字符串              | ' 张三'      |
| DATE        | 日期                | SYSDATE      |
| BOOLEAN     | 布尔                | TRUE/FALSE   |
| CHAR(n)     | 固定长度字符串      | 'A'          |
| CLOB        | 大文本              | 长文章       |

**变量定义&赋值**

1. 普通变量

   ```plsql
   DECLARE
   	v_emp_id NUMBER :=101; -- 数字
   	v_name   VARCHAR(20) := '张三'  -- 字符串
   	v_salary NUMBER(10,2);     -- 先不赋值
   BEGIN
   	-- 第二种赋值方式
   	v_salary := 8000;
   	DBMS_OUTPUT.PUT_LINE('ID：'||v_emp_id);
   	DBMS_OUTPUT.PUT_LINE('姓名：'||v_name);
   	DBMS_OUTPUT.PUT_LINE('薪资：'||v_salary);
   ```

2. 常量（固定值不能改）

   用`CONSTANT`关键字

   ```plsql
   DECLARE
   	v_tax CONSTANT NUMBER := 0.1;
   BEGIN
     	DBMS_OUTPUT.PUT_LINE('税率：' ||v_tax);
   END;
     /
   ```

3. 引用型变量

   **是什么？**

   **引用表中某个字段的类型**，让变量和表字段**完全一致**。

   语法：

   ```plsql
   变量名  表名.字段名%TYPE;
   ```

   例子：

   ```plsql
   DECLARE
     -- 变量 v_name 的类型 = emp_test 表 name 字段的类型
     v_name emp_test.name%TYPE;
   BEGIN
     SELECT name INTO v_name FROM emp_test WHERE id=101;
     DBMS_OUTPUT.PUT_LINE('姓名：' || v_name);
   END;
   /
   ```

   多个引用型变量

   ```plsql
   DECLARE
     v_id     emp_test.id%TYPE;
     v_salary emp_test.salary%TYPE;
     v_dept   emp_test.dept%TYPE;
   BEGIN
     SELECT id, salary, dept
     INTO v_id, v_salary, v_dept
     FROM emp_test WHERE name='张三';
   
     DBMS_OUTPUT.PUT_LINE('ID：' || v_id);
     DBMS_OUTPUT.PUT_LINE('薪资：' || v_salary);
     DBMS_OUTPUT.PUT_LINE('部门：' || v_dept);
   END;
   /
   ```

4. 行变量(一整行数据)

   **是什么？** 

   ​	**一次性接收一整行数据**，相当于把**一整条记录**装进一个变量里。

   **语法**

   ```plsql
   变量名  表名%ROWTYPE;
   ```

   例子：

   ```sql
   -- 测试表
   CREATE TABLE emp_test (
       id NUMBER(5) PRIMARY KEY,
       name VARCHAR2(20),
       salary NUMBER(10,2),
       dept VARCHAR2(20)
   );
   ```

   ```plsql
   DECLARE
     -- v_emp 可以装下 emp_test 表的一整行数据
     v_emp emp_test%ROWTYPE;
   BEGIN
     -- 查询整行数据
     SELECT * INTO v_emp FROM emp_test WHERE id=101;
   
     -- 使用方式：变量名.字段名
     DBMS_OUTPUT.PUT_LINE('姓名：' || v_emp.name);
     DBMS_OUTPUT.PUT_LINE('薪资：' || v_emp.salary);
     DBMS_OUTPUT.PUT_LINE('部门：' || v_emp.dept);
   END;
   /
   ```

5. 输出语句（打印内容）

   固定写法：

   ```plsql
   BEGIN
     DBMS_OUTPUT.PUT_LINE('输出内容'); -- 自带换行
     DBMS_OUTPUT.PUT('不换行');
   END;
   /
   ```

   拼接字符串用 `||`：

   ```plsql
   BEGIN
     DBMS_OUTPUT.PUT_LINE('姓名：'||'张三'||' 薪资：'||8000);
   END;
   /
   ```

   

6. 变量作用域（哪里能访问）

   - DELCARE里声明的：整个块都能用
   - BEGIN里声明：只能在当前子程序用

   ```plsql
   DECLARE
     v_global VARCHAR2(20) := '全局变量';
   BEGIN
     DECLARE
       v_local VARCHAR2(20) := '局部变量';
     BEGIN
       DBMS_OUTPUT.PUT_LINE(v_global); -- 能用
       DBMS_OUTPUT.PUT_LINE(v_local);  -- 能用
     END;
     
     -- DBMS_OUTPUT.PUT_LINE(v_local); 报错！外面访问不到
   END;
   /
   ```

7. 系统内置变量（常用）

   ```plsql
   BEGIN
     DBMS_OUTPUT.PUT_LINE('当前时间：'||SYSDATE);
     DBMS_OUTPUT.PUT_LINE('空值处理：'||NVL(NULL, '默认值'));
   END;
   /
   ```

   





## 三、流程控制







## 四、游标（Cursor）







## 五、异常处理（EXCEPTION）



















