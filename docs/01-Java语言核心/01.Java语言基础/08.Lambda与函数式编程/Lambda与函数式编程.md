# Lambda 与函数式编程

## 一、Lambda 表达式

### 1.1 什么是 Lambda？

Lambda 表达式是 JDK 8 引入的特性，允许将函数作为参数传递。

**语法：**
```java
(参数) -> { 方法体 }
```

### 1.2 Lambda 示例

```java
// 传统方式
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda方式
Runnable r2 = () -> System.out.println("Hello");

// 带参数
Comparator<String> comparator = (s1, s2) -> s1.compareTo(s2);

// 多行代码
Consumer<String> consumer = (str) -> {
    System.out.println("Processing: " + str);
    // 更多逻辑...
};
```

---

## 二、函数式接口

### 2.1 什么是函数式接口？

只有一个抽象方法的接口，可以用 Lambda 实现。

```java
@FunctionalInterface
public interface MyFunction {
    int apply(int x, int y);
}
```

### 2.2 常用函数式接口

#### Consumer（消费者）

```java
import java.util.function.Consumer;

// 接收参数，无返回值
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");

// 链式调用
Consumer<String> step1 = s -> System.out.println("Step 1: " + s);
Consumer<String> step2 = s -> System.out.println("Step 2: " + s);
step1.andThen(step2).accept("Data");
```

#### Supplier（提供者）

```java
import java.util.function.Supplier;

// 无参数，有返回值
Supplier<String> supplier = () -> "Hello";
String result = supplier.get();

// 延迟创建对象
Supplier<List<String>> listSupplier = () -> new ArrayList<>();
```

#### Function（函数）

```java
import java.util.function.Function;

// 接收参数，有返回值
Function<String, Integer> lengthFunc = s -> s.length();
Integer length = lengthFunc.apply("Hello");  // 5

// 链式调用
Function<String, String> toUpper = String::toUpperCase;
Function<String, String> addExclaim = s -> s + "!";
String result = toUpper.andThen(addExclaim).apply("hello");  // "HELLO!"
```

#### Predicate（断言）

```java
import java.util.function.Predicate;

// 接收参数，返回boolean
Predicate<String> isEmpty = s -> s.isEmpty();
boolean result = isEmpty.test("");  // true

// 组合
Predicate<String> startsWithA = s -> s.startsWith("A");
Predicate<String> longerThan3 = s -> s.length() > 3;

// 与
Predicate<String> combined = startsWithA.and(longerThan3);

// 或
Predicate<String> orCombined = startsWithA.or(longerThan3);

// 非
Predicate<String> negated = startsWithA.negate();
```

#### UnaryOperator / BinaryOperator

```java
import java.util.function.UnaryOperator;
import java.util.function.BinaryOperator;

// 一元操作
UnaryOperator<Integer> square = x -> x * x;
Integer result = square.apply(5);  // 25

// 二元操作
BinaryOperator<Integer> add = (a, b) -> a + b;
Integer sum = add.apply(3, 4);  // 7
```

---

## 三、方法引用

### 3.1 方法引用类型

```java
// 1. 静态方法引用
Function<String, Integer> func1 = Integer::parseInt;

// 2. 实例方法引用
String str = "Hello";
Supplier<Integer> func2 = str::length;

// 3. 类方法引用
Function<String, Integer> func3 = String::length;

// 4. 构造方法引用
Supplier<List<String>> func4 = ArrayList::new;
Function<Integer, List<String>> func5 = ArrayList::new;
```

### 3.2 实际应用

```java
List<String> names = Arrays.asList("张三", "李四", "王五");

// Lambda
names.forEach(name -> System.out.println(name));

// 方法引用（更简洁）
names.forEach(System.out::println);

// 排序
names.sort(String::compareTo);
```

---

## 四、Stream API

### 4.1 创建 Stream

```java
import java.util.stream.*;

// 从集合
List<String> list = Arrays.asList("A", "B", "C");
Stream<String> stream1 = list.stream();

// 从数组
Stream<String> stream2 = Stream.of("A", "B", "C");

// 从文件
Stream<String> lines = Files.lines(Paths.get("file.txt"));

// 无限流
Stream<Integer> infinite = Stream.iterate(0, n -> n + 1);
Stream<Double> randoms = Stream.generate(Math::random);
```

### 4.2 中间操作

```java
List<String> names = Arrays.asList("张三", "李四", "王五", "赵六");

// filter（过滤）
List<String> filtered = names.stream()
    .filter(name -> name.startsWith("张"))
    .collect(Collectors.toList());

// map（转换）
List<Integer> lengths = names.stream()
    .map(String::length)
    .collect(Collectors.toList());

// flatMap（扁平化）
List<List<String>> nested = Arrays.asList(
    Arrays.asList("A", "B"),
    Arrays.asList("C", "D")
);
List<String> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());  // [A, B, C, D]

// distinct（去重）
List<Integer> unique = Arrays.asList(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .collect(Collectors.toList());  // [1, 2, 3]

// sorted（排序）
List<String> sorted = names.stream()
    .sorted()
    .collect(Collectors.toList());

// limit / skip
List<String> limited = names.stream()
    .limit(2)
    .collect(Collectors.toList());

List<String> skipped = names.stream()
    .skip(1)
    .collect(Collectors.toList());
```

### 4.3 终端操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// forEach
numbers.stream().forEach(System.out::println);

// collect
List<String> list = numbers.stream()
    .map(String::valueOf)
    .collect(Collectors.toList());

Set<String> set = numbers.stream()
    .map(String::valueOf)
    .collect(Collectors.toSet());

// 转Map
Map<Integer, String> map = numbers.stream()
    .collect(Collectors.toMap(
        n -> n,
        n -> "Number" + n
    ));

// reduce
Optional<Integer> sum = numbers.stream()
    .reduce((a, b) -> a + b);

Integer sum2 = numbers.stream()
    .reduce(0, Integer::sum);

// count
long count = numbers.stream().count();

// anyMatch / allMatch / noneMatch
boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0);

boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0);

// findFirst / findAny
Optional<Integer> first = numbers.stream()
    .filter(n -> n > 2)
    .findFirst();

// max / min
Optional<Integer> max = numbers.stream()
    .max(Integer::compareTo);

// toArray
Integer[] array = numbers.stream().toArray(Integer[]::new);
```

### 4.4 Collectors 工具类

```java
import java.util.stream.Collectors;

List<Person> people = getPeople();

// 分组
Map<String, List<Person>> byCity = people.stream()
    .collect(Collectors.groupingBy(Person::getCity));

// 分区
Map<Boolean, List<Person>> byAge = people.stream()
    .collect(Collectors.partitioningBy(p -> p.getAge() >= 18));

// 统计
IntSummaryStatistics stats = people.stream()
    .collect(Collectors.summarizingInt(Person::getAge));

System.out.println(stats.getCount());   // 数量
System.out.println(stats.getSum());     // 总和
System.out.println(stats.getAverage()); // 平均值
System.out.println(stats.getMin());     // 最小值
System.out.println(stats.getMax());     // 最大值

//  joining
String names = people.stream()
    .map(Person::getName)
    .collect(Collectors.joining(", "));

// 映射后收集
Map<String, Integer> nameToAge = people.stream()
    .collect(Collectors.toMap(
        Person::getName,
        Person::getAge,
        (existing, replacement) -> existing  // 冲突处理
    ));
```

---

## 五、Optional 类

### 5.1 创建 Optional

```java
import java.util.Optional;

// 创建
Optional<String> opt1 = Optional.of("Hello");      // 不能为null
Optional<String> opt2 = Optional.ofNullable(null); // 可以为null
Optional<String> opt3 = Optional.empty();          // 空
```

### 5.2 常用方法

```java
Optional<String> opt = Optional.ofNullable(getName());

// 判断
boolean present = opt.isPresent();

// 获取（为空抛异常）
String value = opt.get();

// 如果有值则执行
opt.ifPresent(name -> System.out.println(name));

// 提供默认值
String name = opt.orElse("Unknown");
String name2 = opt.orElseGet(() -> "Default");

// 为空时抛异常
String name3 = opt.orElseThrow(() -> new RuntimeException("值为空"));

// 过滤
Optional<String> filtered = opt.filter(name -> name.length() > 3);

// 转换
Optional<Integer> length = opt.map(String::length);

// 扁平化
Optional<String> city = opt.flatMap(Person::getAddress)
                             .flatMap(Address::getCity);
```

---

## 六、实战案例

### 6.1 数据处理

```java
List<Order> orders = getOrders();

// 统计每个用户的订单总金额
Map<String, Double> userTotalAmount = orders.stream()
    .collect(Collectors.groupingBy(
        Order::getUserId,
        Collectors.summingDouble(Order::getAmount)
    ));

// 找出金额最高的订单
Optional<Order> highestOrder = orders.stream()
    .max(Comparator.comparingDouble(Order::getAmount));

// 获取所有不重复的商品
Set<String> products = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .map(Item::getProductName)
    .collect(Collectors.toSet());
```

### 6.2 并行 Stream

```java
// 并行处理（适合CPU密集型任务）
long count = numbers.parallelStream()
    .filter(n -> isPrime(n))
    .count();

// 注意：并行stream不一定更快，需要测试
```

---

## 总结

本节介绍了 Java 函数式编程：
- ✅ Lambda 表达式
- ✅ 函数式接口（Consumer、Supplier、Function、Predicate）
- ✅ 方法引用
- ✅ Stream API（创建、中间操作、终端操作）
- ✅ Collectors 工具类
- ✅ Optional 类
- ✅ 并行 Stream

函数式编程能让代码更简洁、更易读。
