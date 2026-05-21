# IO 与 NIO

## 一、IO 概述

### 1.1 什么是 IO？

IO（Input/Output）是 Java 中用于处理输入输出的机制，主要用于：
- 文件读写
- 网络通信
- 控制台输入输出

### 1.2 IO 分类

```
按流向分：
├── 输入流（InputStream / Reader）
└── 输出流（OutputStream / Writer）

按数据类型分：
├── 字节流（处理二进制数据）
│   ├── InputStream
│   └── OutputStream
│
└── 字符流（处理文本数据）
    ├── Reader
    └── Writer

按功能分：
├── 节点流（直接操作数据源）
└── 处理流（包装节点流，提供额外功能）
```

---

## 二、File 类

### 2.1 创建 File 对象

```java
import java.io.File;

// 方式1：绝对路径
File file1 = new File("D:/test/hello.txt");

// 方式2：相对路径
File file2 = new File("hello.txt");

// 方式3：父路径 + 子路径
File file3 = new File("D:/test", "hello.txt");

// 方式4：父目录 + 子路径
File parent = new File("D:/test");
File file4 = new File(parent, "hello.txt");
```

### 2.2 常用方法

```java
File file = new File("D:/test/hello.txt");

// 判断
boolean exists = file.exists();        // 是否存在
boolean isFile = file.isFile();        // 是否是文件
boolean isDir = file.isDirectory();    // 是否是目录
boolean canRead = file.canRead();      // 是否可读
boolean canWrite = file.canWrite();    // 是否可写

// 获取信息
String name = file.getName();          // 文件名
String path = file.getPath();          // 路径
String absolutePath = file.getAbsolutePath();  // 绝对路径
long size = file.length();             // 文件大小（字节）
long lastModified = file.lastModified(); // 最后修改时间

// 创建和删除
boolean created = file.createNewFile(); // 创建文件
boolean deleted = file.delete();        // 删除文件或空目录

// 目录操作
File dir = new File("D:/test/subdir");
boolean mkdirResult = dir.mkdir();      // 创建单级目录
boolean mkdirsResult = dir.mkdirs();    // 创建多级目录

// 列出目录内容
File directory = new File("D:/test");
String[] files = directory.list();      // 文件名数组
File[] fileArray = directory.listFiles(); // File对象数组

// 过滤
File[] txtFiles = directory.listFiles((dir, name) -> {
    return name.endsWith(".txt");
});
```

### 2.3 遍历目录

```java
public void listFiles(File dir, String indent) {
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            System.out.println(indent + file.getName());
            if (file.isDirectory()) {
                listFiles(file, indent + "  ");
            }
        }
    }
}

// 使用
listFiles(new File("D:/test"), "");
```

---

## 三、字节流

### 3.1 FileInputStream

```java
import java.io.FileInputStream;
import java.io.IOException;

// 方式1：逐个字节读取
try (FileInputStream fis = new FileInputStream("hello.txt")) {
    int data;
    while ((data = fis.read()) != -1) {
        System.out.print((char) data);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// 方式2：批量读取（推荐）
try (FileInputStream fis = new FileInputStream("hello.txt")) {
    byte[] buffer = new byte[1024];
    int len;
    while ((len = fis.read(buffer)) != -1) {
        System.out.print(new String(buffer, 0, len));
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

### 3.2 FileOutputStream

```java
import java.io.FileOutputStream;

// 写入数据
try (FileOutputStream fos = new FileOutputStream("output.txt")) {
    String content = "Hello, World!";
    fos.write(content.getBytes());
} catch (IOException e) {
    e.printStackTrace();
}

// 追加模式
try (FileOutputStream fos = new FileOutputStream("output.txt", true)) {
    fos.write("\nNew Line".getBytes());
} catch (IOException e) {
    e.printStackTrace();
}
```

### 3.3 文件复制

```java
public void copyFile(String source, String dest) throws IOException {
    try (FileInputStream fis = new FileInputStream(source);
         FileOutputStream fos = new FileOutputStream(dest)) {
        
        byte[] buffer = new byte[1024];
        int len;
        while ((len = fis.read(buffer)) != -1) {
            fos.write(buffer, 0, len);
        }
    }
}
```

---

## 四、字符流

### 4.1 FileReader

```java
import java.io.FileReader;
import java.io.IOException;

// 读取文本文件
try (FileReader fr = new FileReader("hello.txt")) {
    char[] buffer = new char[1024];
    int len;
    while ((len = fr.read(buffer)) != -1) {
        System.out.print(new String(buffer, 0, len));
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

### 4.2 FileWriter

```java
import java.io.FileWriter;

// 写入文本文件
try (FileWriter fw = new FileWriter("output.txt")) {
    fw.write("Hello, World!\n");
    fw.write("你好，世界！");
} catch (IOException e) {
    e.printStackTrace();
}

// 追加模式
try (FileWriter fw = new FileWriter("output.txt", true)) {
    fw.write("\n追加内容");
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 五、缓冲流

### 5.1 为什么需要缓冲流？

缓冲流通过内部缓冲区减少 IO 次数，提高性能。

### 5.2 BufferedInputStream / BufferedOutputStream

```java
import java.io.*;

// 缓冲字节流
try (BufferedInputStream bis = new BufferedInputStream(
        new FileInputStream("input.txt"));
     BufferedOutputStream bos = new BufferedOutputStream(
        new FileOutputStream("output.txt"))) {
    
    byte[] buffer = new byte[1024];
    int len;
    while ((len = bis.read(buffer)) != -1) {
        bos.write(buffer, 0, len);
    }
    bos.flush();  // 刷新缓冲区
} catch (IOException e) {
    e.printStackTrace();
}
```

### 5.3 BufferedReader / BufferedWriter

```java
import java.io.*;

// 缓冲字符流
try (BufferedReader br = new BufferedReader(
        new FileReader("input.txt"));
     BufferedWriter bw = new BufferedWriter(
        new FileWriter("output.txt"))) {
    
    String line;
    while ((line = br.readLine()) != null) {
        bw.write(line);
        bw.newLine();  // 换行
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

### 5.4 PrintWriter

```java
import java.io.PrintWriter;

// 格式化输出
try (PrintWriter pw = new PrintWriter("output.txt")) {
    pw.println("Hello, World!");
    pw.printf("姓名：%s, 年龄：%d\n", "张三", 20);
    pw.print(123);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 六、转换流

### 6.1 InputStreamReader / OutputStreamWriter

```java
import java.io.*;

// 指定编码读取
try (InputStreamReader isr = new InputStreamReader(
        new FileInputStream("input.txt"), "UTF-8");
     BufferedReader br = new BufferedReader(isr)) {
    
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// 指定编码写入
try (OutputStreamWriter osw = new OutputStreamWriter(
        new FileOutputStream("output.txt"), "UTF-8");
     BufferedWriter bw = new BufferedWriter(osw)) {
    
    bw.write("你好，世界！");
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 七、对象流

### 7.1 序列化与反序列化

```java
import java.io.*;

// 可序列化的类
public class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String name;
    private transient int age;  // transient字段不会被序列化
    
    // 构造方法、getter、setter省略
}

// 序列化（对象 → 字节）
public void serialize(Person person, String file) throws IOException {
    try (ObjectOutputStream oos = new ObjectOutputStream(
            new FileOutputStream(file))) {
        oos.writeObject(person);
    }
}

// 反序列化（字节 → 对象）
public Person deserialize(String file) throws IOException, ClassNotFoundException {
    try (ObjectInputStream ois = new ObjectInputStream(
            new FileInputStream(file))) {
        return (Person) ois.readObject();
    }
}
```

### 7.2 注意事项

- 类必须实现 `Serializable` 接口
- 建议定义 `serialVersionUID`
- `transient` 修饰的字段不会被序列化
- 静态字段不会被序列化

---

## 八、NIO（New IO）

### 8.1 NIO 核心组件

```
NIO 三大核心：
├── Buffer（缓冲区）- 存储数据
├── Channel（通道）- 数据传输
└── Selector（选择器）- 多路复用
```

### 8.2 Buffer

```java
import java.nio.ByteBuffer;

// 创建缓冲区
ByteBuffer buffer = ByteBuffer.allocate(1024);

// 写入数据
buffer.put("Hello".getBytes());

// 切换为读模式
buffer.flip();

// 读取数据
byte[] bytes = new byte[buffer.remaining()];
buffer.get(bytes);
System.out.println(new String(bytes));

// 清空缓冲区
buffer.clear();

// 重要属性
int capacity = buffer.capacity();   // 容量
int position = buffer.position();   // 当前位置
int limit = buffer.limit();         // 限制
int remaining = buffer.remaining(); // 剩余空间
```

#### Buffer 类型

- ByteBuffer
- CharBuffer
- ShortBuffer
- IntBuffer
- LongBuffer
- FloatBuffer
- DoubleBuffer

### 8.3 Channel

```java
import java.nio.channels.FileChannel;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

// FileChannel
try (FileChannel channel = FileChannel.open(
        Paths.get("file.txt"),
        StandardOpenOption.READ)) {
    
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    int bytesRead = channel.read(buffer);
    
    buffer.flip();
    byte[] bytes = new byte[buffer.remaining()];
    buffer.get(bytes);
    System.out.println(new String(bytes));
} catch (IOException e) {
    e.printStackTrace();
}

// 文件复制（NIO方式）
try (FileChannel source = FileChannel.open(
        Paths.get("source.txt"), StandardOpenOption.READ);
     FileChannel dest = FileChannel.open(
        Paths.get("dest.txt"), 
        StandardOpenOption.CREATE,
        StandardOpenOption.WRITE)) {
    
    source.transferTo(0, source.size(), dest);
} catch (IOException e) {
    e.printStackTrace();
}
```

#### Channel 类型

- FileChannel（文件通道）
- SocketChannel（TCP通道）
- ServerSocketChannel（服务器TCP通道）
- DatagramChannel（UDP通道）

### 8.4 Selector（多路复用）

```java
import java.net.InetSocketAddress;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.util.Iterator;

// 非阻塞服务器示例
public class NIOServer {
    public void start() throws IOException {
        // 创建通道
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.configureBlocking(false);  // 非阻塞
        serverChannel.bind(new InetSocketAddress(8080));
        
        // 创建选择器
        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);
        
        System.out.println("服务器启动，监听端口：8080");
        
        while (true) {
            // 选择就绪的通道
            selector.select();
            
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();
                
                if (key.isAcceptable()) {
                    // 接受连接
                    handleAccept(key, selector);
                } else if (key.isReadable()) {
                    // 读取数据
                    handleRead(key);
                }
            }
        }
    }
    
    private void handleAccept(SelectionKey key, Selector selector) 
            throws IOException {
        ServerSocketChannel serverChannel = 
            (ServerSocketChannel) key.channel();
        // 处理新连接...
    }
    
    private void handleRead(SelectionKey key) throws IOException {
        // 读取数据...
    }
}
```

---

## 九、NIO.2（JDK 7+）

### 9.1 Path 和 Files

```java
import java.nio.file.*;
import java.io.IOException;

// 创建 Path
Path path = Paths.get("D:/test/hello.txt");
Path path2 = Path.of("D:/test", "hello.txt");  // JDK 11+

// 文件操作
Files.createFile(path);              // 创建文件
Files.createDirectory(path);         // 创建目录
Files.createDirectories(path);       // 创建多级目录
Files.delete(path);                  // 删除文件或目录
Files.copy(source, dest);            // 复制文件
Files.move(source, dest);            // 移动/重命名

// 读取文件
byte[] bytes = Files.readAllBytes(path);
List<String> lines = Files.readAllLines(path);

// 写入文件
Files.write(path, "Hello".getBytes());
Files.write(path, lines, StandardOpenOption.APPEND);

// 判断
boolean exists = Files.exists(path);
boolean isRegularFile = Files.isRegularFile(path);
boolean isDirectory = Files.isDirectory(path);

// 获取属性
long size = Files.size(path);
FileTime lastModified = Files.getLastModifiedTime(path);
```

### 9.2 遍历目录

```java
// 简单遍历
try (DirectoryStream<Path> stream = Files.newDirectoryStream(
        Paths.get("D:/test"))) {
    for (Path entry : stream) {
        System.out.println(entry.getFileName());
    }
} catch (IOException e) {
    e.printStackTrace();
}

// 递归遍历
Files.walkFileTree(Paths.get("D:/test"), new SimpleFileVisitor<Path>() {
    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
            throws IOException {
        System.out.println(file);
        return FileVisitResult.CONTINUE;
    }
});
```

### 9.3 文件监控

```java
import java.nio.file.WatchService;
import java.nio.file.WatchEvent;

// 监控目录变化
WatchService watchService = FileSystems.getDefault().newWatchService();
Path path = Paths.get("D:/test");
path.register(watchService, 
    StandardWatchEventKinds.ENTRY_CREATE,
    StandardWatchEventKinds.ENTRY_DELETE,
    StandardWatchEventKinds.ENTRY_MODIFY);

while (true) {
    WatchKey key = watchService.take();
    for (WatchEvent<?> event : key.pollEvents()) {
        System.out.println("事件类型：" + event.kind());
        System.out.println("文件名：" + event.context());
    }
    key.reset();
}
```

---

## 十、IO vs NIO

| 对比项 | IO | NIO |
|--------|----|-----|
| 面向 | 流（Stream） | 缓冲区（Buffer） |
| 阻塞 | 阻塞 IO | 可选择非阻塞 |
| 线程模型 | 每个连接一个线程 | 单个线程管理多个连接 |
| 性能 | 低并发下较好 | 高并发下更好 |
| 适用场景 | 简单文件操作 | 高并发网络编程 |
| API复杂度 | 简单 | 复杂 |

---

## 十一、实战案例

### 11.1 文件工具类

```java
public class FileUtils {
    
    // 读取文件内容为字符串
    public static String readFileToString(String filePath) throws IOException {
        return new String(Files.readAllBytes(Paths.get(filePath)));
    }
    
    // 写入字符串到文件
    public static void writeStringToFile(String filePath, String content) 
            throws IOException {
        Files.write(Paths.get(filePath), content.getBytes());
    }
    
    // 复制文件
    public static void copyFile(String source, String dest) throws IOException {
        Files.copy(Paths.get(source), Paths.get(dest), 
            StandardCopyOption.REPLACE_EXISTING);
    }
    
    // 删除目录及其内容
    public static void deleteDirectory(Path directory) throws IOException {
        Files.walkFileTree(directory, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
                    throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }
            
            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) 
                    throws IOException {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
```

### 11.2 CSV 文件读写

```java
// 读取CSV
public List<List<String>> readCSV(String filePath) throws IOException {
    List<List<String>> records = new ArrayList<>();
    
    try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
        String line;
        while ((line = br.readLine()) != null) {
            String[] values = line.split(",");
            records.add(Arrays.asList(values));
        }
    }
    
    return records;
}

// 写入CSV
public void writeCSV(String filePath, List<List<String>> records) 
        throws IOException {
    try (PrintWriter pw = new PrintWriter(new FileWriter(filePath))) {
        for (List<String> record : records) {
            pw.println(String.join(",", record));
        }
    }
}
```

---

## 总结

本节详细介绍了 Java IO 和 NIO：
- ✅ File 类
- ✅ 字节流（InputStream/OutputStream）
- ✅ 字符流（Reader/Writer）
- ✅ 缓冲流
- ✅ 转换流
- ✅ 对象流（序列化）
- ✅ NIO 核心（Buffer、Channel、Selector）
- ✅ NIO.2（Path、Files）
- ✅ IO vs NIO 对比

掌握 IO 和 NIO 是进行文件操作和网络编程的基础。
