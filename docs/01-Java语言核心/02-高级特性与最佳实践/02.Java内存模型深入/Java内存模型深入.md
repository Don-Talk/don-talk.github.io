# Java 内存模型深入

## 一、JMM 概述

### 1.1 什么是 JMM？

JMM（Java Memory Model）定义了 Java 程序中各种变量（线程共享变量）的访问规则，以及在 JVM 中将变量存储到内存和从内存中读取变量的底层细节。

**核心问题：**
- 可见性：一个线程修改了变量，其他线程何时能看到？
- 原子性：操作是否不可分割？
- 有序性：指令重排序的规则是什么？

---

## 二、硬件内存架构

### 2.1 CPU 缓存模型

```
CPU Core 1    CPU Core 2    CPU Core 3
┌─────────┐  ┌─────────┐  ┌─────────┐
│ L1 Cache│  │ L1 Cache│  │ L1 Cache│
│ L2 Cache│  │ L2 Cache│  │ L2 Cache│
└────┬────┘  └────┬────┘  └────┬────┘
     └────────────┼────────────┘
                  ↓
          ┌───────────────┐
          │   L3 Cache    │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │  Main Memory  │
          └───────────────┘
```

### 2.2 缓存一致性协议（MESI）

- **M（Modified）**：已修改，与主存不一致
- **E（Exclusive）**：独占，与主存一致
- **S（Shared）**：共享，多核缓存相同数据
- **I（Invalid）**：无效

---

## 三、JMM 抽象结构

### 3.1 工作内存 vs 主内存

```
线程1                    主内存                  线程2
┌──────────┐                                 ┌──────────┐
│工作内存   │ ← copy →  ┌──────────┐  ← copy → │工作内存   │
│          │            │          │            │          │
│ 副本A=0  │            │  A=0     │            │ 副本A=0  │
└──────────┘            └──────────┘            └──────────┘
     ↓                        ↑                       ↓
 修改A=1                 刷新A=1                 使用A=?
```

**8种原子操作：**
1. lock：锁定主内存变量
2. unlock：解锁主内存变量
3. read：读取主内存到工作内存
4. load：载入工作内存副本
5. use：使用工作内存变量
6. assign：赋值给工作内存变量
7. store：存储工作内存到主内存
8. write：写入主内存变量

---

## 四、volatile 深入

### 4.1 volatile 保证什么？

✅ **可见性**：一个线程修改，其他线程立即可见
✅ **有序性**：禁止指令重排序
❌ **原子性**：不保证复合操作的原子性

### 4.2 内存屏障

```java
volatile int flag = 0;

// 写操作
flag = 1;
StoreStore屏障  // 防止上面的写操作重排序
StoreLoad屏障   // 防止下面的读操作重排序

// 读操作
int x = flag;
LoadLoad屏障   // 防止下面的读操作重排序
LoadStore屏障  // 防止下面的写操作重排序
```

### 4.3 happens-before 规则

1. **程序顺序规则**：单线程内，前面的操作 happens-before 后面的操作
2. **监视器锁规则**：unlock happens-before 后续的 lock
3. **volatile 规则**：写 volatile 变量 happens-before 后续读该变量
4. **传递性**：A happens-before B，B happens-before C，则 A happens-before C
5. **线程启动规则**：Thread.start() happens-before 线程内的操作
6. **线程终止规则**：线程内操作 happens-before Thread.join()

### 4.4 双重检查锁定（DCL）

```java
public class Singleton {
    private static volatile Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {              // 第一次检查（不加锁）
            synchronized (Singleton.class) {
                if (instance == null) {      // 第二次检查（加锁）
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**为什么需要 volatile？**
- 防止指令重排序导致返回未初始化完成的对象
- `new Singleton()` 分为三步：
  1. 分配内存
  2. 初始化对象
  3. 指向引用
  
  如果没有 volatile，步骤2和3可能重排序，导致其他线程拿到未初始化的对象。

---

## 五、synchronized 深入

### 5.1 synchronized 实现原理

#### JDK 6 之前：重量级锁

```
monitor enter → 操作系统 Mutex Lock → 用户态↔内核态切换
```

#### JDK 6+：锁升级

```
无锁 → 偏向锁 → 轻量级锁 → 重量级锁
```

### 5.2 锁升级过程

#### 1. 偏向锁

```
Mark Word 结构：
| Thread ID | Epoch | Age | 1 | 01 |  （偏向锁标志）
```

**适用场景：** 只有一个线程访问同步块

#### 2. 轻量级锁（自旋锁）

```
Mark Word 结构：
| Stack Pointer | 00 |  （轻量级锁标志）
```

**适用场景：** 多线程交替执行，无竞争

#### 3. 重量级锁

```
Mark Word 结构：
| Monitor Pointer | 10 |  （重量级锁标志）
```

**适用场景：** 高竞争场景

### 5.3 锁优化技术

#### 自旋锁

```java
// 自适应自旋
while (!CAS(lock, expected, new)) {
    // 空转，不阻塞
    // JDK 6+ 会根据上次自旋时间动态调整
}
```

#### 锁消除

```java
public void method() {
    StringBuffer sb = new StringBuffer();  // 局部变量，不会逃逸
    sb.append("a");
    sb.append("b");
    // JIT 编译器会消除锁
}
```

#### 锁粗化

```java
// 不好：细粒度锁
for (int i = 0; i < 1000; i++) {
    synchronized(this) {
        doSomething();
    }
}

// 好：锁粗化
synchronized(this) {
    for (int i = 0; i < 1000; i++) {
        doSomething();
    }
}
```

---

## 六、final 内存语义

### 6.1 final 保证可见性

```java
public class FinalExample {
    final int x;
    int y;
    
    public FinalExample() {
        x = 1;  // final字段
        y = 2;  // 普通字段
    }
}

// 线程1
FinalExample obj = new FinalExample();

// 线程2
int a = obj.x;  // 保证看到1
int b = obj.y;  // 可能看到0（默认值）
```

**原因：** final 字段在构造方法中写入后，会插入 StoreStore 屏障。

---

## 七、happens-before 实战

### 7.1 常见并发 Bug

#### Bug 1：缺少同步

```java
// 错误示例
private boolean ready = false;
private int data = 0;

// 线程1
data = 42;
ready = true;

// 线程2
while (!ready) {
    Thread.sleep(1);
}
System.out.println(data);  // 可能输出0
```

**修复：**
```java
private volatile boolean ready = false;
private int data = 0;
```

#### Bug 2：双重检查锁定缺少 volatile

```java
// 错误示例（JDK 5之前）
private static Singleton instance;

public static Singleton getInstance() {
    if (instance == null) {
        synchronized (Singleton.class) {
            if (instance == null) {
                instance = new Singleton();  // 可能重排序
            }
        }
    }
    return instance;
}
```

**修复：** 添加 volatile

---

## 八、JSR-133 内存模型规范

### 8.1 JMM 保证

1. **安全性保证**
   - 正确的同步程序不会出现数据竞争
   - 执行结果符合 sequentially consistent

2. **性能保证**
   - 允许编译器和处理器优化
   - 只要不影响单线程执行结果

### 8.2 内存模型测试工具

#### jcstress（Java Concurrency Stress）

```xml
<dependency>
    <groupId>org.openjdk.jcstress</groupId>
    <artifactId>jcstress-core</artifactId>
    <version>0.15</version>
</dependency>
```

```java
@JCStressTest
@Outcome(id = "1", expect = Expect.ACCEPTABLE, desc = "ok")
@Outcome(id = "0", expect = Expect.FORBIDDEN, desc = "danger")
@State
public class VolatileTest {
    volatile int x = 0;
    
    @Actor
    public void actor1() {
        x = 1;
    }
    
    @Actor
    public void actor2(IntResult2 r) {
        r.r1 = x;
    }
}
```

---

## 九、伪共享（False Sharing）

### 9.1 什么是伪共享？

多个线程修改同一缓存行上的不同变量，导致缓存行频繁失效。

```
Cache Line (64 bytes)
┌────────┬────────┬────────┬────────┐
│ var1   │ var2   │ var3   │ var4   │
│线程1写 │线程2写 │线程3写 │线程4写 │
└────────┴────────┴────────┴────────┘
     ↓ 缓存行失效，所有线程都要重新加载
```

### 9.2 解决方案：缓存行填充

```java
public class PaddedLong {
    protected long p1, p2, p3, p4, p5, p6, p7;  // 填充
    protected volatile long value;
    protected long p9, p10, p11, p12, p13, p14, p15;  // 填充
}
```

**JDK 8+：** 使用 `@Contended` 注解

```java
import sun.misc.Contended;

public class ContendedLong {
    @Contended
    protected volatile long value;
}
```

---

## 十、性能优化最佳实践

### 10.1 选择合适的同步机制

| 场景 | 推荐方案 |
|------|---------|
| 简单同步 | synchronized |
| 读写分离 | ReadWriteLock / StampedLock |
| 原子操作 | Atomic类 |
| 高并发计数 | LongAdder |
| 异步编程 | CompletableFuture |
| 线程安全集合 | ConcurrentHashMap |

### 10.2 减少锁粒度

```java
// 不好：大锁
public class BadExample {
    private final Object lock = new Object();
    
    public void method1() {
        synchronized(lock) {
            // 大量代码
        }
    }
    
    public void method2() {
        synchronized(lock) {
            // 大量代码
        }
    }
}

// 好：细粒度锁
public class GoodExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    public void method1() {
        synchronized(lock1) {
            // 只保护必要代码
        }
    }
    
    public void method2() {
        synchronized(lock2) {
            // 只保护必要代码
        }
    }
}
```

### 10.3 使用 ThreadLocal

```java
// 线程隔离，避免同步
private static final ThreadLocal<SimpleDateFormat> dateFormat = 
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

public String format(Date date) {
    return dateFormat.get().format(date);
}
```

**注意内存泄漏：**
```java
try {
    // 使用ThreadLocal
} finally {
    threadLocal.remove();  // 必须清理
}
```

### 10.4 避免死锁

```java
// 固定锁顺序
public void transfer(Account from, Account to, double amount) {
    Account first = from.getId() < to.getId() ? from : to;
    Account second = from.getId() < to.getId() ? to : from;
    
    synchronized(first) {
        synchronized(second) {
            // 转账逻辑
        }
    }
}
```

---

## 十一、调试与诊断

### 11.1 jstack 分析线程

```bash
# 查看线程堆栈
jstack <pid>

# 查找死锁
jstack <pid> | grep -A 10 "Found one Java-level deadlock"
```

### 11.2 JVisualVM 监控

```bash
# 启动JVisualVM
jvisualvm

# 功能：
# - 线程监控
# - CPU profiling
# - Heap dump
# - Thread dump
```

### 11.3 Arthas 在线诊断

```bash
# 安装Arthas
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar

# 常用命令
thread          # 查看线程
thread -b       # 查找死锁
monitor         # 监控方法调用
watch           # 观察方法参数和返回值
```

---

## 十二、总结

### 核心要点

1. **JMM 三大特性**
   - 可见性：volatile、synchronized、final
   - 原子性：Atomic类、synchronized、Lock
   - 有序性：volatile、happens-before

2. **锁优化**
   - 锁升级：偏向锁 → 轻量级锁 → 重量级锁
   - 锁消除、锁粗化、自旋锁

3. **性能优化**
   - 减少锁粒度
   - 使用并发容器
   - 避免伪共享
   - 合理使用 ThreadLocal

4. **调试工具**
   - jstack、JVisualVM、Arthas
   - jcstress 压力测试

### 学习建议

1. **理论基础**：理解 JMM、happens-before
2. **源码阅读**：AQS、ConcurrentHashMap
3. **实践练习**：编写并发程序，排查问题
4. **工具使用**：掌握诊断工具

掌握 Java 内存模型是成为高级 Java 工程师的必经之路！
