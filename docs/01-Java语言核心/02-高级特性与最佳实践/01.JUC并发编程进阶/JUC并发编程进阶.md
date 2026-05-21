# JUC 并发编程进阶

## 一、JUC 概述

JUC（java.util.concurrent）是 Java 5 引入的并发工具包，提供了比传统 synchronized 更灵活、更高效的并发控制机制。

**核心组件：**
- 原子类（Atomic）
- 锁（Lock）
- 同步工具类（CountDownLatch、CyclicBarrier、Semaphore）
- 线程池（Executor）
- 并发容器（ConcurrentHashMap、CopyOnWriteArrayList）
- CompletableFuture

---

## 二、原子类深入

### 2.1 CAS 原理

CAS（Compare-And-Swap）是无锁算法的核心。

```java
public class AtomicInteger {
    private volatile int value;
    
    public final int incrementAndGet() {
        for (;;) {
            int current = get();
            int next = current + 1;
            // CAS操作：如果value等于current，则更新为next
            if (compareAndSet(current, next))
                return next;
        }
    }
}
```

**ABA 问题：**
```java
// 线程1：读取值A
// 线程2：将A改为B，再改回A
// 线程1：CAS成功，但值已被修改过

// 解决方案：使用 AtomicStampedReference（带版本号）
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(1, 0);
int[] stampHolder = new int[1];
Integer value = ref.get(stampHolder);
ref.compareAndSet(value, newValue, stampHolder[0], stampHolder[0] + 1);
```

### 2.2 LongAdder（高并发优化）

```java
import java.util.concurrent.atomic.LongAdder;

LongAdder adder = new LongAdder();

// 高并发下性能优于 AtomicLong
executorService.submit(() -> {
    adder.increment();
});

long sum = adder.sum();
```

**原理：** 分段累加，减少竞争

---

## 三、Lock 体系深入

### 3.1 ReentrantLock 源码分析

```java
import java.util.concurrent.locks.ReentrantLock;

ReentrantLock lock = new ReentrantLock(true); // 公平锁

lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

**公平锁 vs 非公平锁：**
- 公平锁：按请求顺序获取锁
- 非公平锁：允许插队，性能更好（默认）

### 3.2 ReadWriteLock

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

ReadWriteLock rwLock = new ReentrantReadWriteLock();

// 读锁（共享）
rwLock.readLock().lock();
try {
    // 读操作
} finally {
    rwLock.readLock().unlock();
}

// 写锁（独占）
rwLock.writeLock().lock();
try {
    // 写操作
} finally {
    rwLock.writeLock().unlock();
}
```

**适用场景：** 读多写少

### 3.3 StampedLock（JDK 8+）

```java
import java.util.concurrent.locks.StampedLock;

StampedLock lock = new StampedLock();

// 乐观读
long stamp = lock.tryOptimisticRead();
double currentX = x, currentY = y;
if (!lock.validate(stamp)) {
    // 升级为悲观读
    stamp = lock.readLock();
    try {
        currentX = x;
        currentY = y;
    } finally {
        lock.unlockRead(stamp);
    }
}

// 写锁
stamp = lock.writeLock();
try {
    x = newX;
    y = newY;
} finally {
    lock.unlockWrite(stamp);
}
```

**优势：** 性能优于 ReadWriteLock

---

## 四、同步工具类深入

### 4.1 CountDownLatch 源码分析

```java
import java.util.concurrent.CountDownLatch;

CountDownLatch latch = new CountDownLatch(3);

// 工作线程
new Thread(() -> {
    doWork();
    latch.countDown();
}).start();

// 主线程等待
latch.await();
System.out.println("所有任务完成");
```

**实现原理：** AQS（AbstractQueuedSynchronizer）

### 4.2 CyclicBarrier（可重用）

```java
import java.util.concurrent.CyclicBarrier;

CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程到达屏障");
});

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        doWork();
        try {
            barrier.await();  // 等待其他线程
        } catch (Exception e) {
            e.printStackTrace();
        }
        doNextWork();
    }).start();
}
```

**vs CountDownLatch：**
- CountDownLatch：一次性，不能重置
- CyclicBarrier：可重复使用

### 4.3 Semaphore（信号量）

```java
import java.util.concurrent.Semaphore;

Semaphore semaphore = new Semaphore(5);  // 允许5个并发

for (int i = 0; i < 20; i++) {
    new Thread(() -> {
        try {
            semaphore.acquire();  // 获取许可
            doWork();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            semaphore.release();  // 释放许可
        }
    }).start();
}
```

**应用场景：** 限流、资源池

### 4.4 Exchanger（数据交换）

```java
import java.util.concurrent.Exchanger;

Exchanger<String> exchanger = new Exchanger<>();

new Thread(() -> {
    try {
        String data = "Data from Thread A";
        String received = exchanger.exchange(data);
        System.out.println("A收到: " + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();

new Thread(() -> {
    try {
        String data = "Data from Thread B";
        String received = exchanger.exchange(data);
        System.out.println("B收到: " + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();
```

---

## 五、线程池深入

### 5.1 ThreadPoolExecutor 参数详解

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,              // corePoolSize：核心线程数
    8,              // maximumPoolSize：最大线程数
    60L,            // keepAliveTime：空闲线程存活时间
    TimeUnit.SECONDS, // 时间单位
    new LinkedBlockingQueue<>(100), // workQueue：工作队列
    Executors.defaultThreadFactory(), // threadFactory：线程工厂
    new ThreadPoolExecutor.CallerRunsPolicy() // handler：拒绝策略
);
```

**工作流程：**
1. 任务提交 → 核心线程执行
2. 核心线程满 → 放入队列
3. 队列满 → 创建非核心线程
4. 达到最大线程数 → 执行拒绝策略

### 5.2 拒绝策略

```java
// 1. AbortPolicy（默认）：抛出异常
new ThreadPoolExecutor.AbortPolicy();

// 2. CallerRunsPolicy：调用者线程执行
new ThreadPoolExecutor.CallerRunsPolicy();

// 3. DiscardPolicy：丢弃任务
new ThreadPoolExecutor.DiscardPolicy();

// 4. DiscardOldestPolicy：丢弃最旧任务
new ThreadPoolExecutor.DiscardOldestPolicy();

// 5. 自定义策略
new ThreadPoolExecutor((r, executor) -> {
    log.warn("任务被拒绝: {}", r);
    // 可以记录到数据库、消息队列等
});
```

### 5.3 监控线程池

```java
ThreadPoolExecutor executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(10);

// 定期监控
ScheduledExecutorService monitor = Executors.newScheduledThreadPool(1);
monitor.scheduleAtFixedRate(() -> {
    System.out.println("活跃线程数: " + executor.getActiveCount());
    System.out.println("队列大小: " + executor.getQueue().size());
    System.out.println("完成任务数: " + executor.getCompletedTaskCount());
    System.out.println("总任务数: " + executor.getTaskCount());
}, 0, 1, TimeUnit.MINUTES);
```

### 5.4 动态调整线程池

```java
// 运行时调整参数
executor.setCorePoolSize(8);
executor.setMaximumPoolSize(16);
executor.setKeepAliveTime(30, TimeUnit.SECONDS);
```

---

## 六、并发容器深入

### 6.1 ConcurrentHashMap 源码分析

#### JDK 7：分段锁

```
Segment[0] → HashEntry[]
Segment[1] → HashEntry[]
...
Segment[15] → HashEntry[]
```

#### JDK 8：CAS + synchronized

```
Node[] table
  ↓
Node → Node → Node（链表/红黑树）
```

**关键优化：**
- 锁粒度更细（只锁桶头节点）
- 链表转红黑树（阈值8）
- 读写分离

### 6.2 CopyOnWriteArrayList

```java
import java.util.concurrent.CopyOnWriteArrayList;

CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// 写时复制
list.add("item");  // 复制整个数组

// 适合读多写少
list.forEach(item -> {
    // 迭代过程中可以安全修改
});
```

**缺点：** 内存占用大，写操作慢

### 6.3 ConcurrentLinkedQueue

```java
import java.util.concurrent.ConcurrentLinkedQueue;

ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();

// 无锁队列（CAS实现）
queue.offer("item");
String item = queue.poll();
```

**适用场景：** 高并发队列

---

## 七、CompletableFuture 深入

### 7.1 基本用法

```java
import java.util.concurrent.CompletableFuture;

// 异步执行
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return fetchData();
});

// 链式调用
future.thenApply(result -> process(result))
      .thenAccept(processed -> System.out.println(processed))
      .exceptionally(ex -> {
          log.error("错误", ex);
          return "默认值";
      });
```

### 7.2 组合多个 Future

```java
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    return service1.getData();
});

CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
    return service2.getData();
});

// 等待所有完成
CompletableFuture<Void> all = CompletableFuture.allOf(future1, future2);

// 组合结果
CompletableFuture<String> combined = future1.thenCombine(future2, 
    (result1, result2) -> result1 + result2);

// 任一完成
CompletableFuture<Object> any = CompletableFuture.anyOf(future1, future2);
```

### 7.3 实战案例：并行查询

```java
public UserProfile getUserProfile(Long userId) {
    CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> 
        userService.getUser(userId));
    
    CompletableFuture<Order> orderFuture = CompletableFuture.supplyAsync(() -> 
        orderService.getRecentOrder(userId));
    
    CompletableFuture<Address> addressFuture = CompletableFuture.supplyAsync(() -> 
        addressService.getAddress(userId));
    
    // 等待所有完成并组合结果
    return CompletableFuture.allOf(userFuture, orderFuture, addressFuture)
        .thenApply(v -> {
            UserProfile profile = new UserProfile();
            profile.setUser(userFuture.join());
            profile.setRecentOrder(orderFuture.join());
            profile.setAddress(addressFuture.join());
            return profile;
        })
        .join();
}
```

---

## 八、AQS 原理

### 8.1 AQS 核心概念

AQS（AbstractQueuedSynchronizer）是 JUC 的基础框架。

**核心组件：**
- state：同步状态
- CLH队列：等待队列
- Node：队列节点

### 8.2 自定义同步器

```java
public class OneShotLatch {
    private final Sync sync = new Sync();
    
    public void signal() {
        sync.releaseShared(0);
    }
    
    public void await() throws InterruptedException {
        sync.acquireSharedInterruptibly(0);
    }
    
    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected int tryAcquireShared(int arg) {
            return getState() == 1 ? 1 : -1;
        }
        
        @Override
        protected boolean tryReleaseShared(int arg) {
            setState(1);
            return true;
        }
    }
}
```

---

## 九、性能优化技巧

### 9.1 减少锁竞争

```java
// 不好：粗粒度锁
public synchronized void process() {
    step1();
    step2();
    step3();
}

// 好：细粒度锁
public void process() {
    synchronized(lock1) {
        step1();
    }
    synchronized(lock2) {
        step2();
    }
    synchronized(lock3) {
        step3();
    }
}
```

### 9.2 使用局部变量

```java
// 不好：共享变量
private StringBuilder sb = new StringBuilder();

public void append(String text) {
    synchronized(this) {
        sb.append(text);
    }
}

// 好：局部变量
public String buildString(List<String> items) {
    StringBuilder sb = new StringBuilder();  // 线程安全
    for (String item : items) {
        sb.append(item);
    }
    return sb.toString();
}
```

### 9.3 避免伪共享

```java
import sun.misc.Contended;

public class PaddedAtomicLong {
    @Contended
    private volatile long value;
    
    public long get() { return value; }
    public void set(long v) { value = v; }
}
```

---

## 十、常见问题与解决方案

### 10.1 死锁检测

```java
ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
long[] deadlockedThreads = threadMXBean.findDeadlockedThreads();

if (deadlockedThreads != null) {
    for (long threadId : deadlockedThreads) {
        ThreadInfo info = threadMXBean.getThreadInfo(threadId);
        log.error("死锁线程: {}", info.getThreadName());
    }
}
```

### 10.2 线程泄漏排查

```java
// 监控线程数
ThreadGroup threadGroup = Thread.currentThread().getThreadGroup();
while (threadGroup.getParent() != null) {
    threadGroup = threadGroup.getParent();
}

Thread[] threads = new Thread[threadGroup.activeCount()];
threadGroup.enumerate(threads);

for (Thread thread : threads) {
    if (thread != null) {
        System.out.println(thread.getName() + ": " + thread.getState());
    }
}
```

---

## 总结

JUC 并发编程进阶要点：
- ✅ CAS 原理与 ABA 问题
- ✅ Lock 体系（ReentrantLock、ReadWriteLock、StampedLock）
- ✅ 同步工具类（CountDownLatch、CyclicBarrier、Semaphore）
- ✅ 线程池深入（参数、监控、动态调整）
- ✅ 并发容器（ConcurrentHashMap、CopyOnWriteArrayList）
- ✅ CompletableFuture 异步编程
- ✅ AQS 原理
- ✅ 性能优化技巧

掌握这些高级特性，能编写出高性能、高并发的 Java 应用。
