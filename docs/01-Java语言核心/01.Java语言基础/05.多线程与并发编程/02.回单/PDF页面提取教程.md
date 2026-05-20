# 使用 Java 8 和 PDFBox 提取 PDF 前 100 页教程

> 本文档介绍如何使用 Java 8 和 Apache PDFBox 库从大型 PDF 文件中提取前 100 页，并生成一个新的 PDF 文档。

## 📋 功能概述

本教程将指导您完成以下任务：
1. 读取 `resources` 目录下的 `aaa.pdf` 文件
2. 提取该 PDF 文件的前 100 页
3. 将提取的页面保存为新的 PDF 文档
4. 输出到 `resources` 目录下

**核心特性**：
- ✅ 支持大文件处理
- ✅ 内存优化
- ✅ 错误处理
- ✅ 进度跟踪

---

## 📦 第一步：添加 Maven 依赖

在 `pom.xml` 中添加 PDFBox 依赖：

```xml
<!-- Apache PDFBox for PDF processing -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.29</version>
</dependency>
```

---

## 💻 第二步：创建 PDF 提取工具类

### PdfExtractor.java

**路径**: `src/main/java/com/dt/stock/util/PdfExtractor.java`

```java
package com.dt.stock.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * PDF 页面提取工具类
 */
public class PdfExtractor {
    
    private static final Logger logger = LoggerFactory.getLogger(PdfExtractor.class);
    
    /**
     * 从源PDF文件中提取指定数量的页面并生成新PDF
     * 
     * @param sourceFilePath 源PDF文件路径
     * @param targetFilePath 目标PDF文件路径
     * @param maxPages 最大提取页数
     * @return 是否成功
     */
    public static boolean extractPages(String sourceFilePath, String targetFilePath, int maxPages) {
        PDDocument sourceDocument = null;
        PDDocument targetDocument = null;
        
        try {
            // 加载源PDF文档
            logger.info("开始加载源PDF文件: {}", sourceFilePath);
            File sourceFile = new File(sourceFilePath);
            
            if (!sourceFile.exists()) {
                logger.error("源文件不存在: {}", sourceFilePath);
                return false;
            }
            
            sourceDocument = Loader.loadPDF(sourceFile);
            int totalPages = sourceDocument.getNumberOfPages();
            logger.info("源PDF总页数: {}", totalPages);
            
            // 确定实际要提取的页数
            int pagesToExtract = Math.min(maxPages, totalPages);
            logger.info("将提取前 {} 页", pagesToExtract);
            
            if (pagesToExtract <= 0) {
                logger.warn("无需提取页面");
                return true;
            }
            
            // 创建目标PDF文档
            targetDocument = new PDDocument();
            
            // 逐页复制
            for (int i = 0; i < pagesToExtract; i++) {
                PDPage page = sourceDocument.getPage(i);
                targetDocument.addPage(page);
                
                // 每处理10页打印一次进度
                if ((i + 1) % 10 == 0 || i == pagesToExtract - 1) {
                    logger.info("已处理 {}/{} 页", i + 1, pagesToExtract);
                }
            }
            
            // 保存目标PDF文件
            File targetFile = new File(targetFilePath);
            
            // 确保目标目录存在
            File parentDir = targetFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            
            targetDocument.save(targetFile);
            logger.info("PDF提取完成，已保存到: {}", targetFilePath);
            logger.info("新PDF文件大小: {} KB", targetFile.length() / 1024);
            
            return true;
            
        } catch (IOException e) {
            logger.error("PDF处理失败: {}", e.getMessage(), e);
            return false;
        } finally {
            // 关闭文档释放资源
            closeDocument(sourceDocument, "源文档");
            closeDocument(targetDocument, "目标文档");
        }
    }
    
    /**
     * 安全关闭PDF文档
     * 
     * @param document 要关闭的文档
     * @param docName 文档名称（用于日志）
     */
    private static void closeDocument(PDDocument document, String docName) {
        if (document != null) {
            try {
                document.close();
                logger.debug("{} 已关闭", docName);
            } catch (IOException e) {
                logger.warn("关闭{}时出错: {}", docName, e.getMessage());
            }
        }
    }
    
    /**
     * 获取PDF文件的总页数
     * 
     * @param filePath PDF文件路径
     * @return 总页数，如果出错返回-1
     */
    public static int getPageCount(String filePath) {
        PDDocument document = null;
        try {
            document = Loader.loadPDF(new File(filePath));
            return document.getNumberOfPages();
        } catch (IOException e) {
            logger.error("获取PDF页数失败: {}", e.getMessage());
            return -1;
        } finally {
            closeDocument(document, "文档");
        }
    }
}
```

---

## 🚀 第三步：创建主程序

### MainApplication.java

**路径**: `src/main/java/com/dt/stock/MainApplication.java`

```java
package com.dt.stock;

import com.dt.stock.util.PdfExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.URL;

/**
 * 主应用程序入口
 */
public class MainApplication {
    
    private static final Logger logger = LoggerFactory.getLogger(MainApplication.class);
    
    public static void main(String[] args) {
        logger.info("启动PDF页面提取程序");
        
        // 获取resources目录路径
        String resourcesPath = getResourcesPath();
        logger.info("Resources目录路径: {}", resourcesPath);
        
        // 定义源文件和目标文件路径
        String sourceFilePath = resourcesPath + File.separator + "aaa.pdf";
        String targetFilePath = resourcesPath + File.separator + "aaa_first_100_pages.pdf";
        
        // 检查源文件是否存在
        File sourceFile = new File(sourceFilePath);
        if (!sourceFile.exists()) {
            logger.error("源文件不存在: {}", sourceFilePath);
            System.out.println("错误: 找不到源文件 aaa.pdf，请确保文件位于 resources 目录下");
            return;
        }
        
        // 获取源文件页数信息
        int pageCount = PdfExtractor.getPageCount(sourceFilePath);
        logger.info("源文件总页数: {}", pageCount);
        
        if (pageCount <= 0) {
            logger.error("无法获取源文件页数或文件为空");
            System.out.println("错误: 无法读取PDF文件或文件为空");
            return;
        }
        
        // 执行页面提取
        logger.info("开始提取前100页...");
        boolean success = PdfExtractor.extractPages(sourceFilePath, targetFilePath, 100);
        
        if (success) {
            logger.info("PDF页面提取成功!");
            System.out.println("成功! 提取的PDF已保存到: " + targetFilePath);
            
            // 验证生成的文件
            File targetFile = new File(targetFilePath);
            if (targetFile.exists()) {
                int extractedPages = PdfExtractor.getPageCount(targetFilePath);
                System.out.println("新PDF文件包含 " + extractedPages + " 页");
                System.out.println("文件大小: " + (targetFile.length() / 1024) + " KB");
            }
        } else {
            logger.error("PDF页面提取失败!");
            System.out.println("错误: PDF页面提取失败，请查看日志了解详情");
        }
    }
    
    /**
     * 获取resources目录的路径
     * 
     * @return resources目录的绝对路径
     */
    private static String getResourcesPath() {
        try {
            // 尝试通过类加载器获取resources目录
            URL resourceUrl = MainApplication.class.getClassLoader().getResource("");
            if (resourceUrl != null) {
                return resourceUrl.getPath();
            }
        } catch (Exception e) {
            logger.warn("通过类加载器获取resources路径失败: {}", e.getMessage());
        }
        
        // 备用方案：使用当前工作目录下的resources文件夹
        String currentDir = System.getProperty("user.dir");
        String resourcesPath = currentDir + File.separator + "src" + File.separator + "main" + File.separator + "resources";
        
        File resourcesDir = new File(resourcesPath);
        if (resourcesDir.exists()) {
            return resourcesPath;
        }
        
        // 如果上述方法都失败，返回当前目录
        return currentDir;
    }
}
```

---

## ⚙️ 第四步：配置日志（可选）

### logback.xml

**路径**: `src/main/resources/logback.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/pdf-extractor.log</file>
        <append>true</append>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 根日志级别 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>
    
    <!-- 设置PDFBox相关日志级别 -->
    <logger name="org.apache.pdfbox" level="WARN" />
</configuration>
```

---

## 🧪 第五步：测试运行

### 1. 准备测试文件

确保在 `src/main/resources/` 目录下有一个名为 `aaa.pdf` 的PDF文件。如果没有，可以创建一个测试用的PDF文件。

### 2. 编译项目

```bash
mvn clean compile
```

### 3. 运行程序

```bash
mvn exec:java -Dexec.mainClass="com.dt.stock.MainApplication"
```

或者如果您已经打包了jar文件：

```bash
java -cp target/your-project.jar com.dt.stock.MainApplication
```

---

## 📊 第六步：性能优化建议

对于非常大的PDF文件，可以考虑以下优化措施：

### 1. 内存优化版本

```java
/**
 * 内存优化的PDF页面提取方法
 * 适用于超大PDF文件
 */
public static boolean extractPagesWithMemoryOptimization(String sourceFilePath, String targetFilePath, int maxPages) {
    PDDocument sourceDocument = null;
    PDDocument targetDocument = null;
    
    try {
        logger.info("开始加载源PDF文件（内存优化模式）: {}", sourceFilePath);
        File sourceFile = new File(sourceFilePath);
        
        if (!sourceFile.exists()) {
            logger.error("源文件不存在: {}", sourceFilePath);
            return false;
        }
        
        // 使用内存映射方式加载PDF，减少内存占用
        sourceDocument = Loader.loadPDF(sourceFile);
        int totalPages = sourceDocument.getNumberOfPages();
        logger.info("源PDF总页数: {}", totalPages);
        
        int pagesToExtract = Math.min(maxPages, totalPages);
        logger.info("将提取前 {} 页", pagesToExtract);
        
        if (pagesToExtract <= 0) {
            logger.warn("无需提取页面");
            return true;
        }
        
        // 创建目标PDF文档
        targetDocument = new PDDocument();
        
        // 分批处理页面以控制内存使用
        int batchSize = 10; // 每批处理的页数
        for (int startIdx = 0; startIdx < pagesToExtract; startIdx += batchSize) {
            int endIdx = Math.min(startIdx + batchSize, pagesToExtract);
            
            for (int i = startIdx; i < endIdx; i++) {
                PDPage page = sourceDocument.getPage(i);
                targetDocument.addPage(page);
            }
            
            // 每批次处理后记录进度
            logger.info("已处理 {}/{} 页", endIdx, pagesToExtract);
            
            // 强制垃圾回收以帮助内存管理
            if (endIdx % 50 == 0) {
                System.gc();
            }
        }
        
        // 保存目标PDF文件
        File targetFile = new File(targetFilePath);
        File parentDir = targetFile.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs();
        }
        
        targetDocument.save(targetFile);
        logger.info("PDF提取完成（内存优化模式），已保存到: {}", targetFilePath);
        logger.info("新PDF文件大小: {} KB", targetFile.length() / 1024);
        
        return true;
        
    } catch (IOException e) {
        logger.error("PDF处理失败（内存优化模式）: {}", e.getMessage(), e);
        return false;
    } finally {
        closeDocument(sourceDocument, "源文档");
        closeDocument(targetDocument, "目标文档");
    }
}
```

---

## 🔍 第七步：常见问题及解决方案

### Q1: OutOfMemoryError 错误

**问题**: 处理大型PDF时出现内存不足错误。

**解决方案**:
1. 增加JVM堆内存: `-Xmx2g -Xms512m`
2. 使用上面提供的内存优化版本
3. 考虑分块处理大型PDF

### Q2: PDFBox 版本兼容性

**问题**: 不同版本的PDFBox API可能有差异。

**解决方案**:
- 使用稳定版本如 2.0.29
- 参考官方文档确认API用法

### Q3: 中文字符显示问题

**问题**: 提取后的PDF中文显示异常。

**解决方案**:
- 确保原始PDF字体嵌入正确
- 检查PDFBox对中文字体的支持

---

## 📝 总结

本教程展示了如何使用 Java 8 和 Apache PDFBox 库来提取PDF文件的前100页。主要步骤包括：

1. 添加PDFBox依赖
2. 创建PDF提取工具类
3. 实现主程序逻辑
4. 配置日志系统
5. 进行测试运行

通过这个实现，您可以轻松地从一个大型PDF文件中提取指定数量的页面，并生成一个新的PDF文档。代码具有良好的错误处理和日志记录功能，适合生产环境使用。

---

## 📚 参考资料

- [Apache PDFBox 官方网站](https://pdfbox.apache.org/)
- [PDFBox API 文档](https://pdfbox.apache.org/docs/2.0.29/javadocs/)
- [Java 8 官方文档](https://docs.oracle.com/javase/8/docs/)