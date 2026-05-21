# Java 新特性

## 一、Java 8 新特性（2014年）

Java 8 是 Java 历史上最重要的版本之一，引入了函数式编程支持。

### 1.1 Lambda 表达式

```java
// 传统方式
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda方式
Runnable r = () -> System.out.println("Hello");

// 带参数
Comparator<String> comparator = (s1, s2) -> s1.compareTo(s2);
```

### 1.2 函数式接口

```java
@FunctionalInterface
public interface MyFunction {
    int apply(int x, int y);
}

// 四大核心函数式接口
Consumer<String> consumer = s -> System.out.println(s);
Supplier<String> supplier = () -> "Hello";
Function<String, Integer> function = s -> s.length();
Predicate<String> predicate = s -> s.isEmpty();
```

### 1.3 Stream API

```java
List<String> names = Arrays.asList("张三", "李四", "王五");

// 过滤、转换、收集
List<String> filtered = names.stream()
    .filter(name -> name.startsWith("张"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 统计
long count = names.stream().count();

// 分组
Map<Character, List<String>> grouped = names.stream()
    .collect(Collectors.groupingBy(name -> name.charAt(0)));
```

### 1.4 Optional 类

```java
Optional<String> optional = Optional.ofNullable(getName());

// 避免空指针
String name = optional.orElse("Unknown");
optional.ifPresent(n -> System.out.println(n));

// 链式调用
String city = Optional.ofNullable(getUser())
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");
```

### 1.5 默认方法

```java
public interface MyInterface {
    void method();
    
    // 默认方法
    default void defaultMethod() {
        System.out.println("默认实现");
    }
    
    // 静态方法
    static void staticMethod() {
        System.out.println("静态方法");
    }
}
```

### 1.6 新的日期时间 API

```java
import java.time.*;

// LocalDate
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1990, 1, 1);

// LocalTime
LocalTime now = LocalTime.now();

// LocalDateTime
LocalDateTime dateTime = LocalDateTime.now();

// Duration & Period
Duration duration = Duration.between(start, end);
Period period = Period.between(date1, date2);

// 格式化
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
String formatted = today.format(formatter);
```

### 1.7 Nashorn JavaScript 引擎

```java
ScriptEngine engine = new ScriptEngineManager()
    .getEngineByName("nashorn");
engine.eval("print('Hello from JavaScript')");
```

---

## 二、Java 9 新特性（2017年）

### 2.1 模块系统（Jigsaw）

```java
// module-info.java
module com.example.mymodule {
    requires java.sql;
    exports com.example.api;
    opens com.example.internal to java.base;
}
```

### 2.2 集合工厂方法

```java
// 不可变集合
List<String> list = List.of("A", "B", "C");
Set<String> set = Set.of("A", "B", "C");
Map<String, Integer> map = Map.of("A", 1, "B", 2);

// 注意：这些集合是不可变的
// list.add("D");  // UnsupportedOperationException
```

### 2.3 私有接口方法

```java
public interface MyInterface {
    private void helperMethod() {
        // 私有方法，只能在接口内部使用
    }
    
    default void defaultMethod() {
        helperMethod();  // 可以调用私有方法
    }
}
```

### 2.4 try-with-resources 改进

```java
// Java 8
try (MyResource resource = new MyResource()) {
    // 使用resource
}

// Java 9 - 可以使用effectively final的变量
MyResource resource = new MyResource();
try (resource) {
    // 使用resource
}
```

### 2.5 Stream API 增强

```java
// takeWhile / dropWhile
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

list.stream()
    .takeWhile(n -> n < 4)
    .forEach(System.out::println);  // 1, 2, 3

list.stream()
    .dropWhile(n -> n < 3)
    .forEach(System.out::println);  // 3, 4, 5

// iterate 重载
Stream.iterate(0, n -> n < 10, n -> n + 1)
    .forEach(System.out::println);  // 0-9
```

### 2.6 Optional 增强

```java
Optional<String> optional = Optional.of("Hello");

// stream
optional.stream()
    .forEach(System.out::println);

// ifPresentOrElse
optional.ifPresentOrElse(
    value -> System.out.println(value),
    () -> System.out.println("Empty")
);

// or
Optional<String> result = optional.or(() -> Optional.of("Default"));
```

---

## 三、Java 10 新特性（2018年）

### 3.1 局部变量类型推断（var）

```java
// 传统方式
String name = "Hello";
List<String> list = new ArrayList<>();

// 使用var
var name = "Hello";
var list = new ArrayList<String>();
var map = new HashMap<String, Integer>();

// 注意事项
// var x;  // 错误：必须初始化
// var x = null;  // 错误：无法推断类型
// var lambda = x -> x + 1;  // 错误：不能用于Lambda
```

### 3.2 不可变集合副本

```java
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");

// 创建不可变副本
List<String> immutable = List.copyOf(list);
```

---

## 四、Java 11 新特性（2018年，LTS）

### 4.1 String 新方法

```java
String str = " Hello World ";

// isBlank
boolean blank = str.isBlank();  // false

// strip
String stripped = str.strip();  // "Hello World"
String strippedLeading = str.stripLeading();
String strippedTrailing = str.stripTrailing();

// lines
str.lines().forEach(System.out::println);

// repeat
String repeated = "Ha".repeat(3);  // "HaHaHa"
```

### 4.2 HttpClient（标准化）

```java
import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com"))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
```

### 4.3 Lambda 参数 var

```java
// 可以使用var声明Lambda参数
Consumer<String> consumer = (var s) -> System.out.println(s);

// 主要用于添加注解
BiFunction<String, String, String> func = 
    (@Nonnull var s1, @Nullable var s2) -> s1 + s2;
```

### 4.4 单文件源代码运行

```bash
# 直接运行.java文件，无需编译
java HelloWorld.java
```

---

## 五、Java 12 新特性（2019年）

### 5.1 Switch 表达式（预览）

```java
// 传统switch
int result;
switch (day) {
    case MONDAY:
    case FRIDAY:
        result = 6;
        break;
    case TUESDAY:
        result = 7;
        break;
    default:
        result = 8;
}

// Switch表达式
int result = switch (day) {
    case MONDAY, FRIDAY -> 6;
    case TUESDAY -> 7;
    default -> 8;
};

// 使用yield返回值
String result = switch (day) {
    case MONDAY -> {
        yield "星期一";
    }
    default -> "其他";
};
```

### 5.2 文本块（预览）

```java
// 传统方式
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello</p>\n" +
              "    </body>\n" +
              "</html>";

// 文本块（Java 15正式）
String html = """
    <html>
        <body>
            <p>Hello</p>
        </body>
    </html>
    """;
```

---

## 六、Java 13 新特性（2019年）

### 6.1 文本块增强（预览）

```java
// 控制换行和缩进
String text = """
    Line 1
    Line 2 \
    Line 3
    """;
// 结果："Line 1\nLine 2 Line 3\n"

// 转义序列
String json = """
    {
        "name": "John",
        "age": 30
    }
    """;
```

---

## 七、Java 14 新特性（2020年）

### 7.1 Record 类（预览）

```java
// 传统方式
public class Person {
    private final String name;
    private final int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
    
    // equals, hashCode, toString需要手动实现
}

// Record方式
public record Person(String name, int age) {
    // 自动生成构造方法、getter、equals、hashCode、toString
    
    // 可以添加自定义方法
    public boolean isAdult() {
        return age >= 18;
    }
}

// 使用
Person person = new Person("张三", 20);
System.out.println(person.name());  // getter是name()而不是getName()
System.out.println(person.age());
```

### 7.2 Pattern Matching for instanceof（预览）

```java
// 传统方式
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str.length());
}

// 模式匹配
if (obj instanceof String str) {
    System.out.println(str.length());  // 直接使用str
}

// 复杂判断
if (obj instanceof String str && str.length() > 5) {
    System.out.println(str.toUpperCase());
}
```

### 7.3 Switch 表达式（正式）

```java
// Java 14正式引入
String result = switch (day) {
    case MONDAY, FRIDAY -> "工作日";
    case SATURDAY, SUNDAY -> "周末";
    default -> "其他";
};
```

---

## 八、Java 15 新特性（2020年）

### 8.1 文本块（正式）

```java
String html = """
    <html>
        <body>
            <p>Hello, World!</p>
        </body>
    </html>
    """;

String json = """
    {
        "name": "John",
        "age": 30,
        "city": "New York"
    }
    """;
```

### 8.2 Record 类（第二次预览）

```java
// 紧凑构造方法
public record Person(String name, int age) {
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数");
        }
    }
}
```

### 8.3 Sealed Classes（预览）

```java
// 密封类：限制哪些类可以继承
public sealed class Shape 
    permits Circle, Rectangle, Triangle {
    // ...
}

// 子类必须是final、sealed或non-sealed
public final class Circle extends Shape {
    private double radius;
}

public non-sealed class Rectangle extends Shape {
    private double width, height;
}
```

---

## 九、Java 16 新特性（2021年）

### 9.1 Record 类（正式）

```java
// 正式成为语言特性
public record Point(int x, int y) {
    // 自动获得：
    // - 构造方法
    // - getter方法（x(), y()）
    // - equals()
    // - hashCode()
    // - toString()
}
```

### 9.2 Pattern Matching for instanceof（正式）

```java
// 正式成为语言特性
public String format(Object obj) {
    if (obj instanceof String str) {
        return "String: " + str;
    } else if (obj instanceof Integer num) {
        return "Integer: " + num;
    }
    return "Unknown";
}
```

### 9.3 新的 Vector API（孵化）

```java
//  SIMD操作
import jdk.incubator.vector.*;

var species = IntVector.SPECIES_256;
var vector = IntVector.fromArray(species, array, 0);
var result = vector.add(vector);
```

---

## 十、Java 17 新特性（2021年，LTS）

### 10.1 Sealed Classes（正式）

```java
// 正式成为语言特性
public sealed interface Expr 
    permits ConstantExpr, PlusExpr, TimesExpr, NegExpr {
}

public final class ConstantExpr implements Expr {
    private final int value;
}

public non-sealed class PlusExpr implements Expr {
    private final Expr left, right;
}
```

### 10.2 Pattern Matching for switch（预览）

```java
// 增强的switch模式匹配
static String format(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l -> String.format("long %d", l);
        case Double d -> String.format("double %f", d);
        case String s -> String.format("String %s", s);
        default -> obj.toString();
    };
}

// null处理
static void test(String s) {
    switch (s) {
        case null -> System.out.println("null");
        case "" -> System.out.println("empty");
        default -> System.out.println(s);
    }
}
```

### 10.3 新的 HTTP Client（正式）

```java
import java.net.http.*;

// 异步请求
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"key\":\"value\"}"))
    .build();

CompletableFuture<HttpResponse<String>> future = 
    client.sendAsync(request, HttpResponse.BodyHandlers.ofString());

future.thenApply(HttpResponse::body)
      .thenAccept(System.out::println);
```

---

## 十一、Java 18-20 新特性

### 11.1 Java 18（2022年）

#### UTF-8 编码默认

```java
// Java 18开始，默认字符编码为UTF-8
// 无需再设置 -Dfile.encoding=UTF-8
```

#### 简单 Web 服务器

```bash
# 启动静态文件服务器
jwebserver -d /path/to/files -p 8080
```

### 11.2 Java 19（2022年）

#### 虚拟线程（预览）

```java
// 轻量级线程，适合高并发场景
Thread virtualThread = Thread.ofVirtual()
    .name("virtual-thread-")
    .start(() -> {
        System.out.println("Running in virtual thread");
    });

virtualThread.join();

// 大量虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}
```

### 11.3 Java 20（2023年）

#### Scoped Values（预览）

```java
// 替代ThreadLocal，更高效
static final ScopedValue<String> USER = ScopedValue.newInstance();

ScopedValue.where(USER, "john").call(() -> {
    String user = USER.get();  // "john"
    // ...
});
```

---

## 十二、Java 21 新特性（2023年，LTS）

### 12.1 虚拟线程（正式）

```java
// 正式成为语言特性
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        // 高并发任务
        return doSomething();
    });
}

// 性能对比
// 平台线程：约几千个
// 虚拟线程：可达数百万个
```

### 12.2 Sequenced Collections（正式）

```java
// 有序的集合接口
SequencedCollection<String> list = new ArrayList<>();
list.addFirst("First");
list.addLast("Last");

String first = list.getFirst();
String last = list.getLast();

// 反向遍历
for (var item : list.reversed()) {
    System.out.println(item);
}

// SequencedSet, SequencedMap同理
```

### 12.3 Record Patterns（正式）

```java
// 解构Record
record Point(int x, int y) {}

void printPoint(Object obj) {
    if (obj instanceof Point(int x, int y)) {
        System.out.println("x=" + x + ", y=" + y);
    }
}

// switch中使用
switch (obj) {
    case Point(int x, int y) when x > 0 -> System.out.println("第一象限");
    case Point(int x, int y) -> System.out.println("其他");
}
```

### 12.4 Pattern Matching for switch（正式）

```java
// 正式成为语言特性
static String format(Object obj) {
    return switch (obj) {
        case null -> "null";
        case Integer i -> String.format("int %d", i);
        case Long l -> String.format("long %d", l);
        case String s -> String.format("String %s", s);
        case Point(int x, int y) -> String.format("Point(%d, %d)", x, y);
        default -> obj.toString();
    };
}
```

### 12.5 String Templates（预览）

```java
// 字符串模板
String name = "World";
String message = STR."Hello, \{name}!";  // "Hello, World!"

// 多行模板
String json = STR."""
    {
        "name": "\{name}",
        "age": \{age}
    }
    """;
```

---

## 十三、未来特性（Java 22+）

### 13.1 未命名模式和变量（预览）

```java
// 忽略不需要的值
record Point(int x, int y, int z) {}

if (obj instanceof Point(int x, _, _)) {
    // 只关心x坐标
    System.out.println(x);
}
```

### 13.2 结构化并发（孵化）

```java
// 简化多线程编程
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<String> user = scope.fork(() -> findUser());
    Future<Integer> order = scope.fork(() -> fetchOrder());
    
    scope.join();
    scope.throwIfFailed();
    
    // 使用结果
    process(user.resultNow(), order.resultNow());
}
```

---

## 十四、版本对比总结

| 版本 | 类型 | 重要特性 | LTS |
|------|------|---------|-----|
| Java 8 | 重大更新 | Lambda、Stream、Optional | ✅ |
| Java 9 | 常规更新 | 模块系统、集合工厂 | ❌ |
| Java 10 | 常规更新 | var类型推断 | ❌ |
| Java 11 | LTS | String新方法、HttpClient | ✅ |
| Java 12-16 | 常规更新 | Record、Switch表达式、模式匹配 | ❌ |
| Java 17 | LTS | Sealed Classes、增强模式匹配 | ✅ |
| Java 18-20 | 常规更新 | 虚拟线程（预览） | ❌ |
| Java 21 | LTS | 虚拟线程、Sequenced Collections | ✅ |

---

## 十五、迁移建议

### 从 Java 8 升级到 Java 11/17

1. **兼容性检查**
   ```bash
   # 检查代码兼容性
   javac -source 8 -target 8 YourCode.java
   ```

2. **移除废弃API**
   - javax.xml.bind（JAXB）
   - javax.annotation
   - CORBA模块

3. **利用新特性**
   - 用 var 简化代码
   - 用 Record 替代数据类
   - 用 Pattern Matching 简化类型判断
   - 用 Switch 表达式替代传统switch

4. **性能优化**
   - 使用虚拟线程提升并发性能
   - 使用 ZGC/G1 GC 优化垃圾回收

---

## 总结

Java 持续演进，每个版本都带来新特性：
- ✅ Java 8：函数式编程革命
- ✅ Java 11：长期支持，生产就绪
- ✅ Java 17：现代Java标准
- ✅ Java 21：最新LTS，虚拟线程

建议至少升级到 Java 11 或 Java 17（LTS版本），以获得更好的性能和开发体验。
