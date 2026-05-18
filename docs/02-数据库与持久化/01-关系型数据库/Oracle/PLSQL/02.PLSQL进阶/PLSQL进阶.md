# PL/SQL高级

## 一、PL/SQL 高级对象

### 1.存储过程（PROCEDURE）

存储过程是存储在数据库中的命名PL/SQL块，可以接受参数并执行特定任务。

#### 基本语法
```sql
CREATE [OR REPLACE] PROCEDURE procedure_name (
    parameter1 [IN | OUT | IN OUT] datatype,
    parameter2 [IN | OUT | IN OUT] datatype,
    ...
) IS
    -- 声明部分
BEGIN
    -- 执行部分
EXCEPTION
    -- 异常处理部分
END procedure_name;
```

#### 示例：创建存储过程
```sql
-- 创建存储过程：更新员工工资
CREATE OR REPLACE PROCEDURE update_salary (
    p_emp_id IN NUMBER,
    p_raise_percent IN NUMBER
) IS
    v_current_salary NUMBER;
BEGIN
    -- 获取当前工资
    SELECT salary INTO v_current_salary 
    FROM employees 
    WHERE employee_id = p_emp_id;
    
    -- 更新工资
    UPDATE employees 
    SET salary = salary * (1 + p_raise_percent / 100)
    WHERE employee_id = p_emp_id;
    
    -- 记录日志
    INSERT INTO salary_log (emp_id, old_salary, new_salary, change_date)
    VALUES (p_emp_id, v_current_salary, v_current_salary * (1 + p_raise_percent / 100), SYSDATE);
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('员工 ' || p_emp_id || ' 的工资已更新');
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('未找到员工ID: ' || p_emp_id);
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('错误: ' || SQLERRM);
END update_salary;
```

#### 调用存储过程
```sql
-- 方法1：使用EXECUTE命令
EXECUTE update_salary(101, 10);

-- 方法2：在PL/SQL块中调用
BEGIN
    update_salary(101, 10);
END;
```

### 2.函数（FUNCTION）

函数是返回值的PL/SQL程序单元，可以在SQL语句中使用。

#### 基本语法
```sql
CREATE [OR REPLACE] FUNCTION function_name (
    parameter1 [IN | OUT | IN OUT] datatype,
    parameter2 [IN | OUT | IN OUT] datatype,
    ...
) RETURN return_datatype IS
    -- 声明部分
BEGIN
    -- 执行部分
    RETURN value;
EXCEPTION
    -- 异常处理部分
END function_name;
```

#### 示例：创建函数
```sql
-- 创建函数：计算员工年薪
CREATE OR REPLACE FUNCTION calculate_annual_salary (
    p_emp_id IN NUMBER
) RETURN NUMBER IS
    v_monthly_salary NUMBER;
    v_commission_pct NUMBER;
    v_annual_salary NUMBER;
BEGIN
    SELECT salary, NVL(commission_pct, 0)
    INTO v_monthly_salary, v_commission_pct
    FROM employees
    WHERE employee_id = p_emp_id;
    
    -- 计算年薪（包括佣金）
    v_annual_salary := v_monthly_salary * 12 * (1 + v_commission_pct);
    
    RETURN v_annual_salary;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, '计算年薪时出错: ' || SQLERRM);
END calculate_annual_salary;
```

#### 调用函数
```sql
-- 在SQL语句中使用
SELECT employee_id, first_name, calculate_annual_salary(employee_id) as annual_salary
FROM employees;

-- 在PL/SQL块中调用
DECLARE
    v_annual_sal NUMBER;
BEGIN
    v_annual_sal := calculate_annual_salary(101);
    DBMS_OUTPUT.PUT_LINE('年薪: ' || v_annual_sal);
END;
```

### 3.触发器（TRIGGER）

触发器是在特定事件发生时自动执行的PL/SQL代码块。

#### 基本语法
```sql
CREATE [OR REPLACE] TRIGGER trigger_name
BEFORE | AFTER | INSTEAD OF
INSERT | UPDATE | DELETE ON table_name
[FOR EACH ROW]
[WHEN condition]
BEGIN
    -- 触发器逻辑
END trigger_name;
```

#### 示例：创建触发器
```sql
-- 创建审计触发器：记录员工表的变更
CREATE OR REPLACE TRIGGER emp_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO emp_audit_log (emp_id, action, action_date, user_name)
        VALUES (:NEW.employee_id, 'INSERT', SYSDATE, USER);
    ELSIF UPDATING THEN
        INSERT INTO emp_audit_log (emp_id, action, action_date, user_name, old_salary, new_salary)
        VALUES (:OLD.employee_id, 'UPDATE', SYSDATE, USER, :OLD.salary, :NEW.salary);
    ELSIF DELETING THEN
        INSERT INTO emp_audit_log (emp_id, action, action_date, user_name)
        VALUES (:OLD.employee_id, 'DELETE', SYSDATE, USER);
    END IF;
END emp_audit_trigger;
```

#### 触发器类型
- **行级触发器**：对每一行数据都执行一次（使用 FOR EACH ROW）
- **语句级触发器**：对整个SQL语句只执行一次
- **BEFORE触发器**：在事件发生前执行
- **AFTER触发器**：在事件发生后执行
- **INSTEAD OF触发器**：替代原操作执行（常用于视图）

### 4.包（PACKAGE）

包是将相关的过程、函数、变量、游标等组织在一起的数据库对象。

#### 包规范（Package Specification）
```sql
CREATE OR REPLACE PACKAGE emp_package IS
    -- 公共常量
    CONSTANT max_raise_percent NUMBER := 50;
    
    -- 公共变量
    g_company_name VARCHAR2(100) := 'ABC Company';
    
    -- 公共过程
    PROCEDURE hire_employee (
        p_name VARCHAR2,
        p_salary NUMBER,
        p_dept_id NUMBER
    );
    
    -- 公共函数
    FUNCTION get_emp_count(p_dept_id NUMBER) RETURN NUMBER;
    
END emp_package;
```

#### 包体（Package Body）
```sql
CREATE OR REPLACE PACKAGE BODY emp_package IS
    -- 私有变量
    v_log_prefix VARCHAR2(20) := 'EMP_PKG: ';
    
    -- 私有函数
    FUNCTION validate_salary(p_salary NUMBER) RETURN BOOLEAN IS
    BEGIN
        RETURN p_salary > 0 AND p_salary < 1000000;
    END validate_salary;
    
    -- 实现公共过程
    PROCEDURE hire_employee (
        p_name VARCHAR2,
        p_salary NUMBER,
        p_dept_id NUMBER
    ) IS
    BEGIN
        IF NOT validate_salary(p_salary) THEN
            RAISE_APPLICATION_ERROR(-20001, '无效的工资值');
        END IF;
        
        INSERT INTO employees (employee_id, first_name, salary, department_id, hire_date)
        VALUES (employees_seq.NEXTVAL, p_name, p_salary, p_dept_id, SYSDATE);
        
        DBMS_OUTPUT.PUT_LINE(v_log_prefix || '员工 ' || p_name || ' 已雇佣');
    END hire_employee;
    
    -- 实现公共函数
    FUNCTION get_emp_count(p_dept_id NUMBER) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM employees
        WHERE department_id = p_dept_id;
        
        RETURN v_count;
    END get_emp_count;
    
END emp_package;
```

#### 使用包
```sql
-- 调用包中的过程
BEGIN
    emp_package.hire_employee('张三', 8000, 10);
END;

-- 调用包中的函数
DECLARE
    v_count NUMBER;
BEGIN
    v_count := emp_package.get_emp_count(10);
    DBMS_OUTPUT.PUT_LINE('部门10的员工数: ' || v_count);
END;

-- 访问包变量
BEGIN
    DBMS_OUTPUT.PUT_LINE('公司名称: ' || emp_package.g_company_name);
END;
```

### 5.序列（SEQUENCE）

序列是生成唯一整数的数据库对象，常用于主键生成。

#### 创建序列
```sql
-- 基本序列
CREATE SEQUENCE emp_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- 带缓存的序列（提高性能）
CREATE SEQUENCE order_seq
START WITH 1000
INCREMENT BY 1
MAXVALUE 9999999
CACHE 20
CYCLE;
```

#### 使用序列
```sql
-- 获取下一个值
SELECT emp_seq.NEXTVAL FROM dual;

-- 获取当前值
SELECT emp_seq.CURRVAL FROM dual;

-- 在INSERT中使用
INSERT INTO employees (employee_id, first_name, salary)
VALUES (emp_seq.NEXTVAL, '李四', 7500);
```

#### 修改和删除序列
```sql
-- 修改序列
ALTER SEQUENCE emp_seq
INCREMENT BY 2
MAXVALUE 10000
CACHE 10;

-- 删除序列
DROP SEQUENCE emp_seq;
```

## 二、复合数据类型

### **1.记录表（RECORD）**

记录是一种复合数据类型，可以包含多个不同数据类型的字段。

#### 定义记录类型
```sql
-- 方法1：基于表结构定义
DECLARE
    TYPE emp_record_type IS RECORD (
        emp_id employees.employee_id%TYPE,
        emp_name employees.first_name%TYPE,
        emp_salary employees.salary%TYPE,
        hire_date employees.hire_date%TYPE
    );
    
    emp_rec emp_record_type;
BEGIN
    -- 使用记录
    SELECT employee_id, first_name, salary, hire_date
    INTO emp_rec
    FROM employees
    WHERE employee_id = 101;
    
    DBMS_OUTPUT.PUT_LINE('员工: ' || emp_rec.emp_name);
    DBMS_OUTPUT.PUT_LINE('工资: ' || emp_rec.emp_salary);
END;

-- 方法2：基于%ROWTYPE定义
DECLARE
    emp_rec employees%ROWTYPE;
BEGIN
    SELECT * INTO emp_rec
    FROM employees
    WHERE employee_id = 101;
    
    DBMS_OUTPUT.PUT_LINE('员工: ' || emp_rec.first_name);
END;
```

### **2.嵌套表（TABLE）**

嵌套表是可变的数组，可以存储多个相同类型的元素。

#### 定义和使用嵌套表
```sql
DECLARE
    -- 定义嵌套表类型
    TYPE name_table_type IS TABLE OF VARCHAR2(100)
    INDEX BY PLS_INTEGER;
    
    -- 声明嵌套表变量
    names name_table_type;
    
    TYPE emp_table_type IS TABLE OF employees%ROWTYPE
    INDEX BY PLS_INTEGER;
    
    emps emp_table_type;
BEGIN
    -- 初始化并赋值
    names(1) := '张三';
    names(2) := '李四';
    names(3) := '王五';
    
    -- 遍历嵌套表
    FOR i IN 1..names.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('姓名: ' || names(i));
    END LOOP;
    
    -- 从查询结果填充嵌套表
    SELECT * BULK COLLECT INTO emps
    FROM employees
    WHERE department_id = 10;
    
    -- 处理结果
    FOR i IN 1..emps.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('员工: ' || emps(i).first_name);
    END LOOP;
END;
```

### **3.数组（VARRAY）**

VARRAY是固定大小的有序集合。

#### 定义和使用VARRAY
```sql
DECLARE
    -- 定义VARRAY类型（最大5个元素）
    TYPE phone_array_type IS VARRAY(5) OF VARCHAR2(20);
    
    -- 声明VARRAY变量
    phones phone_array_type;
BEGIN
    -- 初始化VARRAY
    phones := phone_array_type('13800138000', '13900139000', '13700137000');
    
    -- 访问元素
    FOR i IN 1..phones.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('电话 ' || i || ': ' || phones(i));
    END LOOP;
    
    -- 扩展VARRAY
    phones.EXTEND;
    phones(4) := '13600136000';
    
    DBMS_OUTPUT.PUT_LINE('总共有 ' || phones.COUNT || ' 个电话号码');
END;
```

### **4.集合方法：EXISTS、COUNT、FIRST、LAST、DELETE**

#### 常用集合方法
```sql
DECLARE
    TYPE num_table_type IS TABLE OF NUMBER
    INDEX BY PLS_INTEGER;
    
    nums num_table_type;
BEGIN
    -- 初始化集合
    nums(1) := 10;
    nums(3) := 30;
    nums(5) := 50;
    
    -- EXISTS: 检查元素是否存在
    IF nums.EXISTS(1) THEN
        DBMS_OUTPUT.PUT_LINE('元素1存在: ' || nums(1));
    END IF;
    
    IF NOT nums.EXISTS(2) THEN
        DBMS_OUTPUT.PUT_LINE('元素2不存在');
    END IF;
    
    -- COUNT: 返回元素数量
    DBMS_OUTPUT.PUT_LINE('元素总数: ' || nums.COUNT);
    
    -- FIRST: 返回第一个元素的索引
    DBMS_OUTPUT.PUT_LINE('第一个索引: ' || nums.FIRST);
    
    -- LAST: 返回最后一个元素的索引
    DBMS_OUTPUT.PUT_LINE('最后一个索引: ' || nums.LAST);
    
    -- NEXT: 返回下一个元素的索引
    IF nums.NEXT(1) IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('1的下一个索引: ' || nums.NEXT(1));
    END IF;
    
    -- PRIOR: 返回前一个元素的索引
    IF nums.PRIOR(3) IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('3的前一个索引: ' || nums.PRIOR(3));
    END IF;
    
    -- DELETE: 删除元素
    nums.DELETE(3);  -- 删除索引为3的元素
    DBMS_OUTPUT.PUT_LINE('删除后元素数: ' || nums.COUNT);
    
    nums.DELETE(1, 3);  -- 删除索引1到3之间的所有元素
    
    -- EXTEND: 扩展集合
    nums.EXTEND;  -- 添加一个空元素
    nums.EXTEND(3);  -- 添加3个空元素
    nums.EXTEND(2, 1);  -- 添加2个与索引1相同的元素
END;
```

## 三、动态 SQL

动态SQL允许在运行时构建和执行SQL语句。

### **EXECUTE IMMEDIATE**

#### 基本用法
```sql
DECLARE
    v_sql VARCHAR2(1000);
    v_emp_id NUMBER := 101;
    v_new_salary NUMBER := 8000;
BEGIN
    -- 动态UPDATE语句
    v_sql := 'UPDATE employees SET salary = :1 WHERE employee_id = :2';
    EXECUTE IMMEDIATE v_sql USING v_new_salary, v_emp_id;
    
    DBMS_OUTPUT.PUT_LINE('更新了 ' || SQL%ROWCOUNT || ' 行');
    COMMIT;
END;
```

### **动态拼接 SQL 字符串**

```sql
DECLARE
    v_sql VARCHAR2(1000);
    v_table_name VARCHAR2(30) := 'employees';
    v_condition VARCHAR2(100) := 'department_id = 10';
    v_count NUMBER;
BEGIN
    -- 动态构建查询
    v_sql := 'SELECT COUNT(*) FROM ' || v_table_name || ' WHERE ' || v_condition;
    
    -- 执行动态SQL并获取结果
    EXECUTE IMMEDIATE v_sql INTO v_count;
    
    DBMS_OUTPUT.PUT_LINE('符合条件的记录数: ' || v_count);
END;
```

### **动态传参、接收返回值**

```sql
DECLARE
    v_sql VARCHAR2(1000);
    v_emp_id NUMBER := 101;
    v_emp_name VARCHAR2(100);
    v_emp_salary NUMBER;
BEGIN
    -- 动态SELECT语句，接收返回值
    v_sql := 'SELECT first_name, salary FROM employees WHERE employee_id = :1';
    
    EXECUTE IMMEDIATE v_sql INTO v_emp_name, v_emp_salary USING v_emp_id;
    
    DBMS_OUTPUT.PUT_LINE('员工姓名: ' || v_emp_name);
    DBMS_OUTPUT.PUT_LINE('员工工资: ' || v_emp_salary);
END;
```

### **动态游标**

```sql
DECLARE
    TYPE ref_cursor_type IS REF CURSOR;
    v_cursor ref_cursor_type;
    v_sql VARCHAR2(1000);
    v_emp_id employees.employee_id%TYPE;
    v_emp_name employees.first_name%TYPE;
    v_emp_salary employees.salary%TYPE;
BEGIN
    -- 动态构建查询
    v_sql := 'SELECT employee_id, first_name, salary FROM employees WHERE department_id = :1 ORDER BY salary DESC';
    
    -- 打开动态游标
    OPEN v_cursor FOR v_sql USING 10;
    
    -- 循环获取数据
    LOOP
        FETCH v_cursor INTO v_emp_id, v_emp_name, v_emp_salary;
        EXIT WHEN v_cursor%NOTFOUND;
        
        DBMS_OUTPUT.PUT_LINE('ID: ' || v_emp_id || ', 姓名: ' || v_emp_name || ', 工资: ' || v_emp_salary);
    END LOOP;
    
    -- 关闭游标
    CLOSE v_cursor;
END;
```

### **动态DDL语句**

```sql
DECLARE
    v_table_name VARCHAR2(30) := 'temp_employees';
    v_sql VARCHAR2(1000);
BEGIN
    -- 动态创建表
    v_sql := 'CREATE TABLE ' || v_table_name || ' (
        id NUMBER PRIMARY KEY,
        name VARCHAR2(100),
        created_date DATE DEFAULT SYSDATE
    )';
    
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('表 ' || v_table_name || ' 创建成功');
    
    -- 动态插入数据
    v_sql := 'INSERT INTO ' || v_table_name || ' (id, name) VALUES (:1, :2)';
    EXECUTE IMMEDIATE v_sql USING 1, '测试用户';
    
    COMMIT;
    
    -- 动态删除表
    v_sql := 'DROP TABLE ' || v_table_name;
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('表 ' || v_table_name || ' 已删除');
END;
```

### **批量动态SQL（FORALL）**

```sql
DECLARE
    TYPE emp_id_table_type IS TABLE OF employees.employee_id%TYPE
    INDEX BY PLS_INTEGER;
    
    TYPE emp_salary_table_type IS TABLE OF employees.salary%TYPE
    INDEX BY PLS_INTEGER;
    
    v_emp_ids emp_id_table_type;
    v_new_salaries emp_salary_table_type;
    v_sql VARCHAR2(1000);
BEGIN
    -- 准备数据
    v_emp_ids(1) := 101;
    v_emp_ids(2) := 102;
    v_emp_ids(3) := 103;
    
    v_new_salaries(1) := 8000;
    v_new_salaries(2) := 9000;
    v_new_salaries(3) := 10000;
    
    -- 批量更新
    FORALL i IN 1..v_emp_ids.COUNT
        UPDATE employees 
        SET salary = v_new_salaries(i)
        WHERE employee_id = v_emp_ids(i);
    
    DBMS_OUTPUT.PUT_LINE('批量更新了 ' || SQL%ROWCOUNT || ' 条记录');
    COMMIT;
END;
```

## 四、异常处理进阶

### **自定义异常**

```sql
DECLARE
    -- 定义自定义异常
    e_invalid_salary EXCEPTION;
    e_employee_not_found EXCEPTION;
    
    PRAGMA EXCEPTION_INIT(e_employee_not_found, -20001);
    
    v_emp_id NUMBER := 999;
    v_salary NUMBER;
BEGIN
    SELECT salary INTO v_salary
    FROM employees
    WHERE employee_id = v_emp_id;
    
    IF v_salary < 0 THEN
        RAISE e_invalid_salary;
    END IF;
    
    DBMS_OUTPUT.PUT_LINE('工资: ' || v_salary);
    
EXCEPTION
    WHEN e_invalid_salary THEN
        DBMS_OUTPUT.PUT_LINE('错误: 工资不能为负数');
    WHEN e_employee_not_found THEN
        DBMS_OUTPUT.PUT_LINE('错误: 未找到员工ID ' || v_emp_id);
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('错误: 没有找到数据');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('未知错误: ' || SQLERRM);
END;
```

### **异常传播和处理**

```sql
CREATE OR REPLACE PROCEDURE process_employee(p_emp_id NUMBER) IS
    v_salary NUMBER;
    e_high_salary EXCEPTION;
BEGIN
    SELECT salary INTO v_salary
    FROM employees
    WHERE employee_id = p_emp_id;
    
    IF v_salary > 50000 THEN
        RAISE e_high_salary;
    END IF;
    
    DBMS_OUTPUT.PUT_LINE('处理员工: ' || p_emp_id);
    
EXCEPTION
    WHEN e_high_salary THEN
        DBMS_OUTPUT.PUT_LINE('警告: 员工 ' || p_emp_id || ' 工资过高');
        -- 可以选择重新抛出异常
        RAISE;
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('员工 ' || p_emp_id || ' 不存在');
        -- 不重新抛出，继续执行
END process_employee;
```

## 五、性能优化技巧

### **批量处理**

```sql
-- 使用BULK COLLECT提高查询性能
DECLARE
    TYPE emp_table_type IS TABLE OF employees%ROWTYPE;
    v_emps emp_table_type;
BEGIN
    -- 批量获取数据
    SELECT * BULK COLLECT INTO v_emps
    FROM employees
    WHERE department_id = 10;
    
    -- 批量处理
    FOR i IN 1..v_emps.COUNT LOOP
        -- 处理每个员工记录
        DBMS_OUTPUT.PUT_LINE('处理员工: ' || v_emps(i).first_name);
    END LOOP;
END;

-- 使用FORALL提高DML性能
DECLARE
    TYPE emp_id_table_type IS TABLE OF NUMBER;
    v_emp_ids emp_id_table_type := emp_id_table_type(101, 102, 103);
BEGIN
    FORALL i IN 1..v_emp_ids.COUNT
        UPDATE employees 
        SET last_access_date = SYSDATE
        WHERE employee_id = v_emp_ids(i);
END;
```

### **游标优化**

```sql
-- 使用显式游标代替隐式游标
DECLARE
    CURSOR emp_cursor IS
        SELECT employee_id, first_name, salary
        FROM employees
        WHERE department_id = 10;
    
    v_emp_id employees.employee_id%TYPE;
    v_emp_name employees.first_name%TYPE;
    v_emp_salary employees.salary%TYPE;
BEGIN
    OPEN emp_cursor;
    
    LOOP
        FETCH emp_cursor INTO v_emp_id, v_emp_name, v_emp_salary;
        EXIT WHEN emp_cursor%NOTFOUND;
        
        -- 处理数据
        DBMS_OUTPUT.PUT_LINE(v_emp_name || ': ' || v_emp_salary);
    END LOOP;
    
    CLOSE emp_cursor;
END;
```

这个完整的PL/SQL进阶文档涵盖了Oracle PL/SQL的核心高级特性，包括存储过程、函数、触发器、包、序列等高级对象，复合数据类型的使用，动态SQL的各种应用场景，以及异常处理和性能优化技巧。这些内容对于开发复杂的Oracle数据库应用程序非常重要。





















