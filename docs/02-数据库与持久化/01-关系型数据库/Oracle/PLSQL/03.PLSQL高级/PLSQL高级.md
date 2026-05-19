# PL/SQL高级

## 事务控制

在PL/SQL中，事务控制是确保数据一致性和完整性的关键机制。

### COMMIT - 提交事务

`COMMIT`语句用于永久保存当前事务所做的所有更改。

```sql
BEGIN
    -- 执行一些DML操作
    UPDATE employees SET salary = salary * 1.1 WHERE department_id = 10;
    INSERT INTO audit_log VALUES (USER, SYSDATE, 'Salary update for dept 10');
    
    -- 提交事务，使更改永久生效
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        -- 如果发生错误，回滚事务
        ROLLBACK;
        RAISE;
END;
```

### ROLLBACK - 回滚事务

`ROLLBACK`语句用于撤销当前事务所做的所有更改。

```sql
DECLARE
    v_count NUMBER;
BEGIN
    DELETE FROM temp_table WHERE created_date < SYSDATE - 30;
    v_count := SQL%ROWCOUNT;
    
    IF v_count > 1000 THEN
        -- 如果删除的记录太多，回滚
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Too many records deleted, operation rolled back');
    ELSE
        COMMIT;
        DBMS_OUTPUT.PUT_LINE(v_count || ' records deleted successfully');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
```

### SAVEPOINT - 设置保存点

`SAVEPOINT`允许在事务内部设置标记，可以回滚到特定的保存点而不是整个事务。

```sql
BEGIN
    -- 第一个操作
    UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
    SAVEPOINT after_first_update;
    
    -- 第二个操作
    UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
    SAVEPOINT after_second_update;
    
    -- 第三个操作
    INSERT INTO transactions VALUES (1, 2, 100, SYSDATE);
    
    -- 如果第三个操作有问题，可以只回滚到第二个保存点
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK TO SAVEPOINT after_second_update;
            DBMS_OUTPUT.PUT_LINE('Transaction already exists, rolled back to second savepoint');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
END;
```

### 自动事务控制

PL/SQL块本身不构成事务边界，事务由应用程序或客户端工具控制。

```sql
-- 在存储过程中通常不包含COMMIT/ROLLBACK
CREATE OR REPLACE PROCEDURE transfer_funds(
    p_from_account NUMBER,
    p_to_account NUMBER,
    p_amount NUMBER
) AS
BEGIN
    -- 扣款
    UPDATE accounts SET balance = balance - p_amount 
    WHERE account_id = p_from_account;
    
    -- 存款
    UPDATE accounts SET balance = balance + p_amount 
    WHERE account_id = p_to_account;
    
    -- 记录交易
    INSERT INTO transactions VALUES (p_from_account, p_to_account, p_amount, SYSDATE);
    
    -- 注意：这里没有COMMIT，由调用者决定何时提交
EXCEPTION
    WHEN OTHERS THEN
        -- 异常时也不ROLLBACK，让调用者处理
        RAISE;
END;
```

## 批量操作 BULK COLLECT + FORALL

批量操作可以显著提升大量数据处理的速度，减少上下文切换开销。

### BULK COLLECT - 批量收集

`BULK COLLECT`用于一次性将多行数据加载到集合中。

```sql
DECLARE
    TYPE emp_table_type IS TABLE OF employees%ROWTYPE INDEX BY PLS_INTEGER;
    v_employees emp_table_type;
    
    TYPE name_table_type IS TABLE OF VARCHAR2(100) INDEX BY PLS_INTEGER;
    v_names name_table_type;
BEGIN
    -- 批量收集所有员工信息
    SELECT * BULK COLLECT INTO v_employees 
    FROM employees 
    WHERE department_id = 10;
    
    -- 批量收集特定列
    SELECT first_name || ' ' || last_name BULK COLLECT INTO v_names
    FROM employees
    WHERE department_id = 10;
    
    -- 处理收集的数据
    FOR i IN 1..v_employees.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_names(i) || ': ' || v_employees(i).salary);
    END LOOP;
END;
```

### LIMIT子句控制批量大小

对于大数据集，使用LIMIT子句分批处理以避免内存溢出。

```sql
DECLARE
    TYPE emp_table_type IS TABLE OF employees%ROWTYPE INDEX BY PLS_INTEGER;
    v_employees emp_table_type;
    
    CURSOR emp_cursor IS
        SELECT * FROM employees WHERE department_id = 10;
    
    v_batch_size CONSTANT PLS_INTEGER := 100;
BEGIN
    OPEN emp_cursor;
    
    LOOP
        -- 每次获取100条记录
        FETCH emp_cursor BULK COLLECT INTO v_employees LIMIT v_batch_size;
        
        -- 处理这批数据
        FOR i IN 1..v_employees.COUNT LOOP
            -- 处理每条记录
            NULL; -- 实际业务逻辑
        END LOOP;
        
        -- 如果没有更多数据，退出循环
        EXIT WHEN v_employees.COUNT = 0;
    END LOOP;
    
    CLOSE emp_cursor;
END;
```

### FORALL - 批量绑定

`FORALL`用于批量执行DML语句，显著提高性能。

```sql
DECLARE
    TYPE id_table_type IS TABLE OF employees.employee_id%TYPE INDEX BY PLS_INTEGER;
    TYPE salary_table_type IS TABLE OF employees.salary%TYPE INDEX BY PLS_INTEGER;
    
    v_ids id_table_type;
    v_salaries salary_table_type;
BEGIN
    -- 首先收集需要更新的数据
    SELECT employee_id, salary * 1.1
    BULK COLLECT INTO v_ids, v_salaries
    FROM employees
    WHERE department_id = 10;
    
    -- 使用FORALL批量更新
    FORALL i IN 1..v_ids.COUNT
        UPDATE employees 
        SET salary = v_salaries(i)
        WHERE employee_id = v_ids(i);
    
    COMMIT;
END;
```

### BULK COLLECT与FORALL结合使用

```sql
CREATE OR REPLACE PROCEDURE bulk_salary_update(p_department_id NUMBER) AS
    TYPE emp_rec_type IS RECORD (
        emp_id employees.employee_id%TYPE,
        new_salary employees.salary%TYPE
    );
    
    TYPE emp_table_type IS TABLE OF emp_rec_type INDEX BY PLS_INTEGER;
    v_employees emp_table_type;
    
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    v_start_time := SYSTIMESTAMP;
    
    -- 批量收集需要更新的员工
    SELECT employee_id, salary * 1.1
    BULK COLLECT INTO v_employees
    FROM employees
    WHERE department_id = p_department_id;
    
    -- 批量更新
    IF v_employees.COUNT > 0 THEN
        FORALL i IN 1..v_employees.COUNT
            UPDATE employees 
            SET salary = v_employees(i).new_salary,
                last_updated = SYSDATE
            WHERE employee_id = v_employees(i).emp_id;
        
        COMMIT;
    END IF;
    
    v_end_time := SYSTIMESTAMP;
    DBMS_OUTPUT.PUT_LINE('Updated ' || v_employees.COUNT || ' employees in ' || 
                        EXTRACT(SECOND FROM (v_end_time - v_start_time)) || ' seconds');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
```

### 性能对比示例

```sql
-- 传统方式（慢）
DECLARE
    CURSOR emp_cursor IS
        SELECT employee_id FROM employees WHERE department_id = 10;
BEGIN
    FOR emp_rec IN emp_cursor LOOP
        UPDATE employees SET salary = salary * 1.1 
        WHERE employee_id = emp_rec.employee_id;
    END LOOP;
    COMMIT;
END;

-- 批量方式（快）
DECLARE
    TYPE id_table_type IS TABLE OF employees.employee_id%TYPE INDEX BY PLS_INTEGER;
    v_ids id_table_type;
BEGIN
    SELECT employee_id BULK COLLECT INTO v_ids
    FROM employees WHERE department_id = 10;
    
    FORALL i IN 1..v_ids.COUNT
        UPDATE employees SET salary = salary * 1.1 
        WHERE employee_id = v_ids(i);
    
    COMMIT;
END;
```

## 视图、索引在 PL/SQL 中的使用

### 在PL/SQL中使用视图

视图可以简化复杂查询，提高代码可读性。

```sql
-- 创建视图
CREATE OR REPLACE VIEW emp_dept_view AS
SELECT e.employee_id,
       e.first_name,
       e.last_name,
       e.salary,
       d.department_name,
       l.city,
       l.state_province
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN locations l ON d.location_id = l.location_id;

-- 在PL/SQL中使用视图
DECLARE
    TYPE emp_dept_table_type IS TABLE OF emp_dept_view%ROWTYPE INDEX BY PLS_INTEGER;
    v_emp_depts emp_dept_table_type;
BEGIN
    -- 从视图中批量收集数据
    SELECT * BULK COLLECT INTO v_emp_depts
    FROM emp_dept_view
    WHERE department_name = 'IT';
    
    -- 处理数据
    FOR i IN 1..v_emp_depts.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_emp_depts(i).first_name || ' ' || 
                           v_emp_depts(i).last_name || ' - ' || 
                           v_emp_depts(i).city);
    END LOOP;
END;
```

### 动态SQL中使用视图

```sql
CREATE OR REPLACE PROCEDURE get_dept_summary(p_department_name VARCHAR2) AS
    v_sql VARCHAR2(1000);
    v_count NUMBER;
    v_avg_salary NUMBER;
BEGIN
    v_sql := 'SELECT COUNT(*), AVG(salary) FROM emp_dept_view WHERE department_name = :1';
    
    EXECUTE IMMEDIATE v_sql INTO v_count, v_avg_salary USING p_department_name;
    
    DBMS_OUTPUT.PUT_LINE('Department: ' || p_department_name);
    DBMS_OUTPUT.PUT_LINE('Employee Count: ' || v_count);
    DBMS_OUTPUT.PUT_LINE('Average Salary: ' || ROUND(v_avg_salary, 2));
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No employees found in department: ' || p_department_name);
END;
```

### 索引优化PL/SQL性能

合理使用索引可以显著提升PL/SQL程序的性能。

```sql
-- 为常用查询条件创建索引
CREATE INDEX idx_emp_dept_salary ON employees(department_id, salary);
CREATE INDEX idx_emp_last_name ON employees(last_name);

-- 在PL/SQL中利用索引
DECLARE
    v_employee employees%ROWTYPE;
BEGIN
    -- 这个查询会使用idx_emp_last_name索引
    SELECT * INTO v_employee
    FROM employees
    WHERE last_name = 'Smith';
    
    DBMS_OUTPUT.PUT_LINE('Found employee: ' || v_employee.first_name);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Employee not found');
END;
```

### 函数基于索引(Function-Based Indexes)

```sql
-- 创建函数基于索引
CREATE INDEX idx_emp_upper_name ON employees(UPPER(last_name));

-- 在PL/SQL中使用时能利用索引
DECLARE
    v_count NUMBER;
BEGIN
    -- 这个查询会使用idx_emp_upper_name索引
    SELECT COUNT(*) INTO v_count
    FROM employees
    WHERE UPPER(last_name) = 'SMITH';
    
    DBMS_OUTPUT.PUT_LINE('Found ' || v_count || ' employees with last name SMITH');
END;
```

### 检查索引使用情况

```sql
-- 查看表的索引信息
SELECT index_name, column_name, column_position
FROM user_ind_columns
WHERE table_name = 'EMPLOYEES'
ORDER BY index_name, column_position;

-- 分析索引效率
SELECT index_name, blevel, leaf_blocks, distinct_keys
FROM user_indexes
WHERE table_name = 'EMPLOYEES';
```

## 调用 Java / 外部程序

Oracle数据库支持在PL/SQL中调用Java代码和外部程序。

### 在PL/SQL中调用Java

#### 1. 加载Java类到数据库

```java
// Java源代码
public class StringHelper {
    public static String reverseString(String input) {
        if (input == null) return null;
        return new StringBuilder(input).reverse().toString();
    }
    
    public static int calculateChecksum(String input) {
        if (input == null) return 0;
        int checksum = 0;
        for (char c : input.toCharArray()) {
            checksum += c;
        }
        return checksum;
    }
}
```

#### 2. 在数据库中创建Java源

```sql
-- 方法一：直接创建Java源
CREATE OR REPLACE AND COMPILE JAVA SOURCE NAMED "StringHelper" AS
public class StringHelper {
    public static String reverseString(String input) {
        if (input == null) return null;
        return new StringBuilder(input).reverse().toString();
    }
    
    public static int calculateChecksum(String input) {
        if (input == null) return 0;
        int checksum = 0;
        for (char c : input.toCharArray()) {
            checksum += c;
        }
        return checksum;
    }
}
/

-- 方法二：从文件加载
-- loadjava -user username/password@database StringHelper.class
```

#### 3. 创建PL/SQL包装器

```sql
-- 创建函数包装器
CREATE OR REPLACE FUNCTION reverse_string(p_input VARCHAR2) RETURN VARCHAR2 AS
LANGUAGE JAVA NAME 'StringHelper.reverseString(java.lang.String) return java.lang.String';
/

CREATE OR REPLACE FUNCTION calculate_checksum(p_input VARCHAR2) RETURN NUMBER AS
LANGUAGE JAVA NAME 'StringHelper.calculateChecksum(java.lang.String) return int';
/
```

#### 4. 在PL/SQL中使用Java函数

```sql
DECLARE
    v_original VARCHAR2(100) := 'Hello World';
    v_reversed VARCHAR2(100);
    v_checksum NUMBER;
BEGIN
    -- 调用Java函数
    v_reversed := reverse_string(v_original);
    v_checksum := calculate_checksum(v_original);
    
    DBMS_OUTPUT.PUT_LINE('Original: ' || v_original);
    DBMS_OUTPUT.PUT_LINE('Reversed: ' || v_reversed);
    DBMS_OUTPUT.PUT_LINE('Checksum: ' || v_checksum);
END;
```

### 调用外部程序

#### 1. 使用DBMS_SCHEDULER调用外部脚本

```sql
-- 创建外部作业
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name => 'run_external_script',
        job_type => 'EXECUTABLE',
        job_action => '/bin/bash',
        number_of_arguments => 1,
        start_date => SYSTIMESTAMP,
        repeat_interval => 'FREQ=DAILY;BYHOUR=2;BYMINUTE=0',
        enabled => FALSE
    );
    
    DBMS_SCHEDULER.SET_JOB_ARGUMENT_VALUE(
        job_name => 'run_external_script',
        argument_position => 1,
        argument_value => '/path/to/script.sh'
    );
    
    DBMS_SCHEDULER.ENABLE('run_external_script');
END;
/
```

#### 2. 使用UTL_HTTP调用Web服务

```sql
CREATE OR REPLACE FUNCTION call_web_service(p_url VARCHAR2) RETURN VARCHAR2 AS
    l_http_request UTL_HTTP.req;
    l_http_response UTL_HTTP.resp;
    l_response_text VARCHAR2(32767);
BEGIN
    -- 发起HTTP请求
    l_http_request := UTL_HTTP.begin_request(p_url);
    UTL_HTTP.set_header(l_http_request, 'User-Agent', 'Mozilla/4.0');
    
    -- 获取响应
    l_http_response := UTL_HTTP.get_response(l_http_request);
    UTL_HTTP.read_text(l_http_response, l_response_text, 32767);
    UTL_HTTP.end_response(l_http_response);
    
    RETURN l_response_text;
EXCEPTION
    WHEN UTL_HTTP.end_of_body THEN
        UTL_HTTP.end_response(l_http_response);
        RETURN l_response_text;
    WHEN OTHERS THEN
        UTL_HTTP.end_response(l_http_response);
        RAISE;
END;
/

-- 使用示例
DECLARE
    v_response VARCHAR2(32767);
BEGIN
    v_response := call_web_service('http://api.example.com/data');
    DBMS_OUTPUT.PUT_LINE('Response: ' || SUBSTR(v_response, 1, 200));
END;
```

#### 3. 使用DBMS_PIPE进行进程间通信

```sql
-- 发送消息到管道
CREATE OR REPLACE PROCEDURE send_message(p_message VARCHAR2) AS
    l_status NUMBER;
BEGIN
    l_status := DBMS_PIPE.pack_message(p_message);
    l_status := DBMS_PIPE.send_message('MY_PIPE');
END;
/

-- 从管道接收消息
CREATE OR REPLACE PROCEDURE receive_message(p_timeout NUMBER DEFAULT 5) AS
    l_status NUMBER;
    l_message VARCHAR2(4000);
BEGIN
    l_status := DBMS_PIPE.receive_message('MY_PIPE', p_timeout);
    IF l_status = 0 THEN
        DBMS_PIPE.unpack_message(l_message);
        DBMS_OUTPUT.PUT_LINE('Received: ' || l_message);
    ELSE
        DBMS_OUTPUT.PUT_LINE('No message received or timeout');
    END IF;
END;
/
```

### 安全考虑

#### 1. Java权限管理

```sql
-- 授予Java权限
BEGIN
    DBMS_JAVA.GRANT_PERMISSION(
        grantee => 'SCOTT',
        permission_type => 'SYS:java.io.FilePermission',
        permission_name => '/tmp/*',
        permission_actions => 'read,write'
    );
END;
/
```

#### 2. 网络访问控制

```sql
-- 配置ACL以允许网络访问
BEGIN
    DBMS_NETWORK_ACL_ADMIN.CREATE_ACL(
        acl => 'web_services.xml',
        description => 'Allow web service calls',
        principal => 'SCOTT',
        is_grant => TRUE,
        privilege => 'connect'
    );
    
    DBMS_NETWORK_ACL_ADMIN.ADD_PRIVILEGE(
        acl => 'web_services.xml',
        principal => 'SCOTT',
        is_grant => TRUE,
        privilege => 'resolve'
    );
    
    DBMS_NETWORK_ACL_ADMIN.ASSIGN_ACL(
        acl => 'web_services.xml',
        host => 'api.example.com'
    );
END;
/
```

## 总结

本章介绍了PL/SQL的高级特性：

1. **事务控制**：掌握COMMIT、ROLLBACK、SAVEPOINT的使用，确保数据一致性
2. **批量操作**：使用BULK COLLECT和FORALL显著提升大数据处理性能
3. **视图和索引**：合理利用视图简化代码，通过索引优化查询性能
4. **外部集成**：能够调用Java程序和外部系统，扩展PL/SQL功能

这些高级特性在实际开发中非常重要，特别是在处理大规模数据和复杂业务逻辑时。