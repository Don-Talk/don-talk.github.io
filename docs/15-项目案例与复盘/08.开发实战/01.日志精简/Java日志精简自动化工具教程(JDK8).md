# Java日志精简自动化工具教程（JDK8）

## 概述

本教程提供一套基于Java(JDK8)的日志精简自动化工具，可以直接集成到现有Java项目中，帮助识别和优化不规范的日志代码。

**环境要求：**
- JDK 8+
- Maven 3.x（可选，用于项目管理）

---

## 功能模块说明

本工具包含 **8个核心功能模块**，覆盖日志优化的全流程：

### 📊 1. 日志问题扫描器 (LogIssueScanner)
**功能：** 扫描Java源代码，识别不规范的日志写法

**检测能力：**
- ✅ 字符串拼接日志（性能问题）
- ✅ 堆栈信息滥用（日志量过大）
- ✅ printStackTrace使用（不规范）
- ✅ 循环内打印日志（日志膨胀）
- ✅ 大对象打印（内存和性能问题）

**适用场景：** 代码审查、CI/CD集成、定期质量检查

---

### 📈 2. 日志文件分析器 (LogFileAnalyzer)
**功能：** 分析现有日志文件的体积和分布情况

**分析维度：**
- 📁 日志文件总数和总大小
- 🏆 Top 20最大日志文件
- 📦 按模块统计日志量占比
- 📅 文件修改时间分布

**适用场景：** 找出日志量最大的模块，针对性优化

---

### ⚙️ 3. 配置检查器 (LogConfigChecker)
**功能：** 检查logback.xml/log4j2.xml配置文件

**检查项：**
- 🔍 Root日志级别是否过高（DEBUG/TRACE）
- 🔍 框架包（Spring、MyBatis）是否开启DEBUG
- 🔍 是否使用异步Appender
- 🔍 日志滚动策略是否合理

**适用场景：** 生产环境配置审查、配置优化

---

### 🛠️ 4. 批量修复工具 (BatchLogFixer)
**功能：** 自动修复常见的日志问题

**修复能力：**
- 🔧 字符串拼接 → 参数化日志
- 🔧 printStackTrace → log.error()
- 🔧 业务异常堆栈 → 仅记录消息
- 🔧 自动创建备份，支持预览模式

**适用场景：** 批量修复历史代码问题

**⚠️ 注意：** 使用前务必备份代码，建议先用预览模式确认

---

### ⏰ 5. 定时任务检测器 (ScheduledTaskDetector) ⭐核心功能
**功能：** 专门检测定时任务中的日志问题（财务系统日志过多的主要原因）

**检测内容：**
- 🕒 所有@Scheduled注解的定时任务
- 📊 每个任务的执行频率和日志数量
- 💰 预估每日产生的日志量
- ⚠️ 循环内日志、堆栈打印等问题

**输出报告：**
- 按预估日志量排序的任务列表
- 针对性的优化建议

**适用场景：** 高频定时任务优化、日志量源头治理

---

### 🚀 6. 增量扫描器 (IncrementalScanner)
**功能：** 只扫描变更的文件，提高扫描效率

**工作原理：**
- 💾 使用MD5缓存文件哈希
- 🔄 对比缓存，只扫描变更文件
- 📝 自动管理缓存文件

**性能提升：**
- 首次扫描：全量扫描
- 后续扫描：速度提升80%+

**适用场景：** CI/CD集成、日常代码检查

---

### 📄 7. 报告生成器 (ReportGenerator)
**功能：** 支持多种格式的报告输出

**支持格式：**
- 📃 TXT格式：详细文本报告
- 🌐 HTML格式：美观的网页报告
- 📋 JSON格式：便于程序处理

**适用场景：** 团队分享、归档记录、自动化处理

---

### 📝 8. 白名单配置
**功能：** 排除不需要扫描的文件或目录

**典型用途：**
- 排除测试代码（test/**）
- 排除生成代码（target/**、build/**）
- 排除第三方库（vendor/**、lib/**）
- 排除特定包

**适用场景：** 提高扫描效率，聚焦业务代码

---

## 功能使用说明

### 快速开始

#### 步骤1：编译打包

```bash
# 进入项目目录
cd log-refactor-tool

# 使用Maven编译打包
mvn clean package

# 生成的jar包位于 target/log-refactor-tool-1.0.0.jar
```

#### 步骤2：基本使用

```bash
# 查看所有可用命令
java -jar target/log-refactor-tool-1.0.0.jar

# 输出：
# 用法:
#   java -jar log-refactor-tool.jar <命令> [参数]
#
# 命令:
#   scan <项目根目录>              - 扫描Java代码中的日志问题
#   analyze <日志目录>              - 分析日志文件分布
#   check <配置文件路径>            - 检查日志配置文件
#   fix <项目根目录> [--apply]      - 批量修复日志问题
#   detect-scheduled <项目根目录>   - 检测定时任务日志问题
#   scan-incremental <项目根目录>   - 增量扫描（只扫描变更文件）
```

---

### 详细使用指南

#### 1️⃣ 扫描代码问题

**基本扫描：**
```bash
java -jar log-refactor-tool-1.0.0.jar scan D:/Codes/My/finance-project
```

**多线程扫描（推荐，速度快）：**
```bash
java -jar log-refactor-tool-1.0.0.jar scan D:/Codes/My/finance-project --threads 4
```

**生成JSON报告：**
```bash
java -jar log-refactor-tool-1.0.0.jar scan D:/Codes/My/finance-project --format json
```

**生成HTML报告：**
```bash
java -jar log-refactor-tool-1.0.0.jar scan D:/Codes/My/finance-project --format html
```

**输出文件：** `log_issues_report.txt` / `log_issues_report.json` / `log_issues_report.html`

---

#### 2️⃣ 分析日志文件

```bash
java -jar log-refactor-tool-1.0.0.jar analyze D:/logs/finance
```

**输出文件：** `log_analysis_report.txt`

**报告内容：**
- 日志文件总数和总大小
- Top 20最大日志文件
- 各模块日志量占比

---

#### 3️⃣ 检查配置文件

```bash
java -jar log-refactor-tool-1.0.0.jar check src/main/resources/logback.xml
```

**输出文件：** `config_check_report.txt`

**检查内容：**
- Root日志级别
- 框架包日志级别
- 异步Appender配置

---

#### 4️⃣ 检测定时任务 ⭐重点推荐

```bash
java -jar log-refactor-tool-1.0.0.jar detect-scheduled D:/Codes/My/finance-project
```

**输出文件：** `scheduled_tasks_report.txt`

**报告内容：**
- 所有定时任务列表（按预估日志量排序）
- 每个任务的执行频率
- 每次执行产生的日志数
- 预估每日日志总量
- 存在的问题（循环日志、堆栈打印等）
- 优化建议

---

#### 5️⃣ 批量修复（谨慎使用）

**预览模式（不会修改文件）：**
```bash
java -jar log-refactor-tool-1.0.0.jar fix D:/Codes/My/finance-project
```

**实际修复模式（会自动创建备份）：**
```bash
java -jar log-refactor-tool-1.0.0.jar fix D:/Codes/My/finance-project --apply
```

**输出文件：** `fix_report.txt`

**修复内容：**
- 字符串拼接改为参数化日志
- printStackTrace改为log.error()
- 业务异常堆栈改为仅记录消息

**⚠️ 重要提示：**
1. 务必先用预览模式确认修复内容
2. 实际修复会自动创建备份目录
3. 修复后需要人工审查关键代码
4. 必须在测试环境验证后再上线

---

#### 6️⃣ 增量扫描

```bash
java -jar log-refactor-tool-1.0.0.jar scan-incremental D:/Codes/My/finance-project
```

**特点：**
- 首次扫描：全量扫描并建立缓存
- 后续扫描：只扫描变更的文件
- 缓存文件：`.log-scan-cache.properties`

**适用场景：**
- CI/CD流水线中每次构建时检查
- 日常开发中的代码质量检查
- 大型项目的快速扫描

---

### 白名单配置

在项目根目录创建 `config/whitelist.txt` 文件：

```
# 白名单配置 - 每行一个路径模式
# 支持通配符 * 和 **

# 排除测试代码
test/**
src/test/**

# 排除生成的代码
target/**
gen/**
build/**

# 排除第三方库
vendor/**
lib/**

# 排除特定包
com/example/generated/**
com/example/thirdparty/**
```

**注意：** 白名单在扫描时自动生效，无需额外参数

---

## 项目结构

```
log-refactor-tool/
├── src/main/java/com/tool/logrefactor/
│   ├── LogIssueScanner.java        # 日志问题扫描器
│   ├── LogFileAnalyzer.java        # 日志文件分析器
│   ├── LogConfigChecker.java       # 配置检查器
│   ├── BatchLogFixer.java          # 批量修复工具
│   ├── ScheduledTaskDetector.java  # 定时任务检测器（新增）
│   ├── IncrementalScanner.java     # 增量扫描器（新增）
│   ├── ReportGenerator.java        # 报告生成器（新增）
│   └── Main.java                   # 主入口
├── config/
│   └── whitelist.txt               # 白名单配置（新增）
├── pom.xml                         # Maven配置
└── README.md
```

---

## 1. Maven配置 (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.tool</groupId>
    <artifactId>log-refactor-tool</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- JSON处理（可选，用于生成JSON报告） -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.8.9</version>
        </dependency>
        
        <!-- Excel处理（用于生成Excel报告） -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>5.2.3</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.3</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>com.tool.logrefactor.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 2. 日志问题扫描器 (LogIssueScanner.java)

```java
package com.tool.logrefactor;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

/**
 * 日志问题扫描器 - 扫描Java项目中的不规范日志写法
 */
public class LogIssueScanner {
    
    private final Path projectRoot;
    private final List<Issue> issues = new ArrayList<>();
    private final Map<String, Integer> stats = new HashMap<>();
    
    // 问题模式定义
    private static class PatternConfig {
        String pattern;
        String description;
        String severity;
        
        PatternConfig(String pattern, String description, String severity) {
            this.pattern = pattern;
            this.description = description;
            this.severity = severity;
        }
    }
    
    private static final Map<String, PatternConfig> PATTERNS = new LinkedHashMap<>();
    
    static {
        PATTERNS.put("string_concat", new PatternConfig(
            "log\\.(debug|info|warn|error)\\s*\\(\\s*\"[^\"]*\"\\s*\\+",
            "字符串拼接日志", "MEDIUM"
        ));
        
        PATTERNS.put("stack_trace_abuse", new PatternConfig(
            "log\\.(error|warn)\\s*\\([^,]+,\\s*\\w+\\s*\\)",
            "可能滥用堆栈信息", "HIGH"
        ));
        
        PATTERNS.put("print_stacktrace", new PatternConfig(
            "\\w+\\.printStackTrace\\s*\\(\\s*\\)",
            "使用printStackTrace", "HIGH"
        ));
        
        PATTERNS.put("loop_logging", new PatternConfig(
            "(for|while)\\s*\\(.*\\)\\s*\\{[^}]*log\\.",
            "循环内打印日志", "MEDIUM"
        ));
    }
    
    public LogIssueScanner(String projectRoot) {
        this.projectRoot = Paths.get(projectRoot);
    }
    
    /**
     * 扫描单个Java文件
     */
    private void scanFile(Path filePath) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            
            for (int i = 0; i < lines.size(); i++) {
                String line = lines.get(i);
                
                for (Map.Entry<String, PatternConfig> entry : PATTERNS.entrySet()) {
                    String issueType = entry.getKey();
                    PatternConfig config = entry.getValue();
                    
                    Pattern pattern = Pattern.compile(config.pattern);
                    Matcher matcher = pattern.matcher(line);
                    
                    if (matcher.find()) {
                        Issue issue = new Issue();
                        issue.file = projectRoot.relativize(filePath).toString();
                        issue.line = i + 1;
                        issue.type = issueType;
                        issue.description = config.description;
                        issue.severity = config.severity;
                        issue.content = line.trim();
                        
                        issues.add(issue);
                        stats.merge(issueType, 1, Integer::sum);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("扫描文件失败: " + filePath + ", 错误: " + e.getMessage());
        }
    }
    
    /**
     * 扫描整个项目目录
     */
    public void scanDirectory() throws IOException {
        System.out.println("开始扫描Java文件...");
        
        List<Path> javaFiles = Files.walk(projectRoot)
            .filter(p -> p.toString().endsWith(".java"))
            .collect(Collectors.toList());
        
        int total = javaFiles.size();
        System.out.println("找到 " + total + " 个Java文件");
        
        for (int i = 0; i < javaFiles.size(); i++) {
            if ((i + 1) % 100 == 0) {
                System.out.println("进度: " + (i + 1) + "/" + total);
            }
            scanFile(javaFiles.get(i));
        }
        
        System.out.println("扫描完成！共发现 " + issues.size() + " 个问题");
    }
    
    /**
     * 生成扫描报告
     */
    public void generateReport(String outputFile) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=" + repeat("=", 79));
            writer.println("日志代码扫描报告");
            writer.println("=" + repeat("=", 79));
            writer.println();
            
            // 统计摘要
            writer.println("【问题统计】");
            writer.println("-" + repeat("-", 79));
            
            List<Map.Entry<String, Integer>> sortedStats = stats.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());
            
            for (Map.Entry<String, Integer> entry : sortedStats) {
                writer.printf("%-30s: %5d%n", entry.getKey(), entry.getValue());
            }
            writer.printf("%-30s: %5d%n", "总计", issues.size());
            writer.println();
            
            // 详细问题列表
            writer.println("【详细问题列表】");
            writer.println("-" + repeat("-", 79));
            
            // 按严重程度排序
            List<Issue> sortedIssues = issues.stream()
                .sorted(Comparator.comparingInt(i -> getSeverityOrder(i.severity)))
                .collect(Collectors.toList());
            
            for (Issue issue : sortedIssues) {
                writer.println();
                writer.println("[" + issue.severity + "] " + issue.type);
                writer.println("  文件: " + issue.file);
                writer.println("  行号: " + issue.line);
                writer.println("  描述: " + issue.description);
                writer.println("  代码: " + truncate(issue.content, 100));
            }
        }
        
        System.out.println("报告已保存到: " + outputFile);
    }
    
    private int getSeverityOrder(String severity) {
        switch (severity) {
            case "HIGH": return 0;
            case "MEDIUM": return 1;
            case "LOW": return 2;
            default: return 3;
        }
    }
    
    private String repeat(String str, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(str);
        }
        return sb.toString();
    }
    
    private String truncate(String str, int maxLength) {
        return str.length() <= maxLength ? str : str.substring(0, maxLength) + "...";
    }
    
    /**
     * 问题类
     */
    private static class Issue {
        String file;
        int line;
        String type;
        String description;
        String severity;
        String content;
    }
    
    public int getIssueCount() {
        return issues.size();
    }
    
    public Map<String, Integer> getStats() {
        return stats;
    }
}
```

---

## 3. 日志文件分析器 (LogFileAnalyzer.java)

```java
package com.tool.logrefactor;

import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.*;

/**
 * 日志文件分析器 - 分析日志文件的体积和分布
 */
public class LogFileAnalyzer {
    
    private final Path logDirectory;
    private final List<FileInfo> fileStats = new ArrayList<>();
    private final Map<String, ModuleStat> moduleStats = new HashMap<>();
    
    public LogFileAnalyzer(String logDirectory) {
        this.logDirectory = Paths.get(logDirectory);
    }
    
    /**
     * 分析日志目录
     */
    public void analyzeDirectory() throws IOException {
        System.out.println("开始分析日志文件...");
        
        List<Path> logFiles = Files.walk(logDirectory)
            .filter(p -> p.toString().endsWith(".log"))
            .collect(Collectors.toList());
        
        if (logFiles.isEmpty()) {
            System.out.println("警告: 在 " + logDirectory + " 下未找到.log文件");
            return;
        }
        
        System.out.println("找到 " + logFiles.size() + " 个日志文件");
        
        for (Path logFile : logFiles) {
            try {
                BasicFileAttributes attrs = Files.readAttributes(logFile, BasicFileAttributes.class);
                long sizeBytes = attrs.size();
                
                FileInfo info = new FileInfo();
                info.path = logFile;
                info.sizeBytes = sizeBytes;
                info.sizeMb = sizeBytes / (1024.0 * 1024.0);
                info.modifiedTime = new Date(attrs.lastModifiedTime().toMillis());
                
                fileStats.add(info);
                
                // 按模块统计
                String moduleName = extractModuleName(logFile);
                ModuleStat stat = moduleStats.computeIfAbsent(moduleName, k -> new ModuleStat());
                stat.count++;
                stat.totalSize += sizeBytes;
                
            } catch (IOException e) {
                System.err.println("分析文件失败: " + logFile + ", 错误: " + e.getMessage());
            }
        }
        
        long totalSize = fileStats.stream().mapToLong(f -> f.sizeBytes).sum();
        System.out.println("分析完成！总文件大小: " + formatSize(totalSize));
    }
    
    /**
     * 从日志文件路径提取模块名
     */
    private String extractModuleName(Path logFile) {
        Path parent = logFile.getParent();
        if (parent != null) {
            return parent.getFileName().toString();
        }
        return logFile.getFileName().toString();
    }
    
    /**
     * 格式化文件大小
     */
    private String formatSize(long sizeBytes) {
        if (sizeBytes < 1024) {
            return sizeBytes + " B";
        } else if (sizeBytes < 1024 * 1024) {
            return String.format("%.2f KB", sizeBytes / 1024.0);
        } else if (sizeBytes < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", sizeBytes / (1024.0 * 1024.0));
        } else {
            return String.format("%.2f GB", sizeBytes / (1024.0 * 1024.0 * 1024.0));
        }
    }
    
    /**
     * 生成分析报告
     */
    public void generateReport(String outputFile) throws IOException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=" + repeat("=", 79));
            writer.println("日志文件分析报告");
            writer.println("=" + repeat("=", 79));
            writer.println();
            
            // 总体统计
            long totalSize = fileStats.stream().mapToLong(f -> f.sizeBytes).sum();
            writer.println("【总体统计】");
            writer.println("-" + repeat("-", 79));
            writer.println("日志文件总数: " + fileStats.size());
            writer.println("总文件大小: " + formatSize(totalSize));
            writer.println();
            
            // 最大的20个文件
            writer.println("【最大的20个日志文件】");
            writer.println("-" + repeat("-", 79));
            
            List<FileInfo> topFiles = fileStats.stream()
                .sorted(Comparator.comparingLong(f -> f.sizeBytes).reversed())
                .limit(20)
                .collect(Collectors.toList());
            
            writer.printf("%-6s%-15s%-25s%s%n", "排名", "文件大小", "修改时间", "文件路径");
            
            for (int i = 0; i < topFiles.size(); i++) {
                FileInfo info = topFiles.get(i);
                String timeStr = sdf.format(info.modifiedTime);
                writer.printf("%-6d%-15s%-25s%s%n",
                    i + 1,
                    formatSize(info.sizeBytes),
                    timeStr,
                    info.path.toString());
            }
            
            writer.println();
            
            // 按模块统计
            writer.println("【按模块统计】");
            writer.println("-" + repeat("-", 79));
            
            List<Map.Entry<String, ModuleStat>> sortedModules = moduleStats.entrySet().stream()
                .sorted(Map.Entry.<String, ModuleStat>comparingByValue(
                    Comparator.comparingLong(m -> m.totalSize)).reversed())
                .collect(Collectors.toList());
            
            writer.printf("%-30s%-10s%-15s%-10s%n", "模块名", "文件数", "总大小", "占比");
            
            for (Map.Entry<String, ModuleStat> entry : sortedModules) {
                double percentage = totalSize > 0 ? 
                    (entry.getValue().totalSize * 100.0 / totalSize) : 0;
                writer.printf("%-30s%-10d%-15s%.2f%%%n",
                    entry.getKey(),
                    entry.getValue().count,
                    formatSize(entry.getValue().totalSize),
                    percentage);
            }
        }
        
        System.out.println("报告已保存到: " + outputFile);
    }
    
    private String repeat(String str, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(str);
        }
        return sb.toString();
    }
    
    /**
     * 文件信息类
     */
    private static class FileInfo {
        Path path;
        long sizeBytes;
        double sizeMb;
        Date modifiedTime;
    }
    
    /**
     * 模块统计类
     */
    private static class ModuleStat {
        int count;
        long totalSize;
    }
}

---

## 4. 配置检查器 (LogConfigChecker.java)

```java
package com.tool.logrefactor;

import org.w3c.dom.*;
import javax.xml.parsers.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

/**
 * 日志配置检查器 - 检查logback.xml或log4j2.xml配置
 */
public class LogConfigChecker {
    
    private final Path configFile;
    private final List<ConfigIssue> issues = new ArrayList<>();
    
    public LogConfigChecker(String configFile) {
        this.configFile = Paths.get(configFile);
    }
    
    /**
     * 检查配置文件
     */
    public void checkConfig() {
        if (!Files.exists(configFile)) {
            System.err.println("错误: 配置文件不存在 - " + configFile);
            return;
        }
        
        System.out.println("检查配置文件: " + configFile);
        
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(configFile.toFile());
            
            // 检查root日志级别
            checkRootLevel(doc);
            
            // 检查各个logger配置
            checkLoggers(doc);
            
            // 检查appender配置
            checkAppenders(doc);
            
        } catch (Exception e) {
            System.err.println("XML解析错误: " + e.getMessage());
            // 尝试用正则表达式进行基本检查
            regexCheck();
        }
    }
    
    /**
     * 检查root日志级别
     */
    private void checkRootLevel(Document doc) {
        NodeList rootElements = doc.getElementsByTagName("root");
        
        if (rootElements.getLength() > 0) {
            Element rootElement = (Element) rootElements.item(0);
            NodeList levelElements = rootElement.getElementsByTagName("level");
            
            if (levelElements.getLength() > 0) {
                Element levelElement = (Element) levelElements.item(0);
                String level = levelElement.getAttribute("value").toUpperCase();
                
                if ("DEBUG".equals(level) || "TRACE".equals(level) || "ALL".equals(level)) {
                    ConfigIssue issue = new ConfigIssue();
                    issue.type = "ROOT_LEVEL_TOO_LOW";
                    issue.severity = "HIGH";
                    issue.message = "Root日志级别设置为 " + level + 
                                   "，生产环境建议设置为 WARN 或 ERROR";
                    issues.add(issue);
                }
            }
        }
    }
    
    /**
     * 检查logger配置
     */
    private void checkLoggers(Document doc) {
        NodeList loggerElements = doc.getElementsByTagName("logger");
        
        String[] frameworkPackages = {"org.springframework", "org.mybatis", "com.ibatis"};
        
        for (int i = 0; i < loggerElements.getLength(); i++) {
            Element loggerElement = (Element) loggerElements.item(i);
            String name = loggerElement.getAttribute("name");
            
            NodeList levelElements = loggerElement.getElementsByTagName("level");
            if (levelElements.getLength() > 0) {
                Element levelElement = (Element) levelElements.item(0);
                String level = levelElement.getAttribute("value").toUpperCase();
                
                for (String pkg : frameworkPackages) {
                    if (name.startsWith(pkg) && 
                        ("DEBUG".equals(level) || "TRACE".equals(level))) {
                        ConfigIssue issue = new ConfigIssue();
                        issue.type = "FRAMEWORK_DEBUG_ENABLED";
                        issue.severity = "MEDIUM";
                        issue.message = "框架包 " + name + " 开启了 " + level + 
                                       " 级别日志，建议设置为 WARN";
                        issues.add(issue);
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * 检查appender配置
     */
    private void checkAppenders(Document doc) {
        NodeList appenderElements = doc.getElementsByTagName("appender");
        
        boolean hasAsync = false;
        for (int i = 0; i < appenderElements.getLength(); i++) {
            Element appenderElement = (Element) appenderElements.item(i);
            String className = appenderElement.getAttribute("class");
            
            if (className.contains("AsyncAppender")) {
                hasAsync = true;
                break;
            }
        }
        
        if (!hasAsync) {
            ConfigIssue issue = new ConfigIssue();
            issue.type = "NO_ASYNC_APPENDER";
            issue.severity = "LOW";
            issue.message = "未使用异步Appender，建议配置AsyncAppender提升性能";
            issues.add(issue);
        }
    }
    
    /**
     * 使用正则表达式进行基本检查（备用方案）
     */
    private void regexCheck() {
        try {
            String content = new String(Files.readAllBytes(configFile));
            
            Pattern pattern = Pattern.compile(
                "<root[^>]*>.*?<level\\s+value=[\"'](DEBUG|TRACE)[\"']",
                Pattern.DOTALL
            );
            
            if (pattern.matcher(content).find()) {
                ConfigIssue issue = new ConfigIssue();
                issue.type = "ROOT_LEVEL_TOO_LOW";
                issue.severity = "HIGH";
                issue.message = "Root日志级别可能设置为DEBUG或TRACE";
                issues.add(issue);
            }
            
        } catch (IOException e) {
            System.err.println("读取配置文件失败: " + e.getMessage());
        }
    }
    
    /**
     * 生成检查报告
     */
    public void generateReport(String outputFile) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=" + repeat("=", 79));
            writer.println("日志配置检查报告");
            writer.println("=" + repeat("=", 79));
            writer.println();
            writer.println("配置文件: " + configFile);
            writer.println();
            
            if (issues.isEmpty()) {
                writer.println("✅ 未发现明显问题");
            } else {
                writer.println("发现 " + issues.size() + " 个问题:");
                writer.println();
                
                // 按严重程度排序
                List<ConfigIssue> sortedIssues = issues.stream()
                    .sorted(Comparator.comparingInt(i -> getSeverityOrder(i.severity)))
                    .collect(Collectors.toList());
                
                for (ConfigIssue issue : sortedIssues) {
                    writer.println("[" + issue.severity + "] " + issue.type);
                    writer.println("  " + issue.message);
                    writer.println();
                }
            }
        }
        
        System.out.println("报告已保存到: " + outputFile);
    }
    
    private int getSeverityOrder(String severity) {
        switch (severity) {
            case "HIGH": return 0;
            case "MEDIUM": return 1;
            case "LOW": return 2;
            default: return 3;
        }
    }
    
    private String repeat(String str, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(str);
        }
        return sb.toString();
    }
    
    /**
     * 配置问题类
     */
    private static class ConfigIssue {
        String type;
        String severity;
        String message;
    }
    
    public int getIssueCount() {
        return issues.size();
    }
}
```

---

## 5. 主入口 (Main.java)

```java
package com.tool.logrefactor;

import java.io.IOException;

/**
 * 日志精简工具主入口
 */
public class Main {
    
    public static void main(String[] args) {
        if (args.length < 2) {
            printUsage();
            System.exit(1);
        }
        
        String command = args[0];
        
        try {
            switch (command) {
                case "scan":
                    runScanner(args);
                    break;
                case "analyze":
                    runAnalyzer(args);
                    break;
                case "check":
                    runConfigChecker(args);
                    break;
                default:
                    System.err.println("未知命令: " + command);
                    printUsage();
                    System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("执行失败: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    /**
     * 运行扫描器
     */
    private static void runScanner(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar scan <项目根目录>");
            System.exit(1);
        }
        
        String projectRoot = args[1];
        LogIssueScanner scanner = new LogIssueScanner(projectRoot);
        scanner.scanDirectory();
        scanner.generateReport("log_issues_report.txt");
        
        // 打印摘要
        System.out.println("\n【问题摘要】");
        for (String type : scanner.getStats().keySet()) {
            System.out.println("  " + type + ": " + scanner.getStats().get(type));
        }
    }
    
    /**
     * 运行分析器
     */
    private static void runAnalyzer(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar analyze <日志目录>");
            System.exit(1);
        }
        
        String logDirectory = args[1];
        LogFileAnalyzer analyzer = new LogFileAnalyzer(logDirectory);
        analyzer.analyzeDirectory();
        analyzer.generateReport("log_analysis_report.txt");
    }
    
    /**
     * 运行配置检查器
     */
    private static void runConfigChecker(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar check <配置文件路径>");
            System.exit(1);
        }
        
        String configFile = args[1];
        LogConfigChecker checker = new LogConfigChecker(configFile);
        checker.checkConfig();
        checker.generateReport("config_check_report.txt");
        
        if (checker.getIssueCount() > 0) {
            System.out.println("\n发现 " + checker.getIssueCount() + " 个问题，详见报告");
        } else {
            System.out.println("\n✅ 未发现明显问题");
        }
    }
    
    /**
     * 打印使用说明
     */
    private static void printUsage() {
        System.out.println("用法:");
        System.out.println("  java -jar log-refactor-tool.jar <命令> [参数]");
        System.out.println();
        System.out.println("命令:");
        System.out.println("  scan <项目根目录>              - 扫描Java代码中的日志问题");
        System.out.println("  analyze <日志目录>              - 分析日志文件分布");
        System.out.println("  check <配置文件路径>            - 检查日志配置文件");
        System.out.println();
        System.out.println("示例:");
        System.out.println("  java -jar log-refactor-tool.jar scan D:/Codes/My/finance-project");
        System.out.println("  java -jar log-refactor-tool.jar analyze D:/logs/finance");
        System.out.println("  java -jar log-refactor-tool.jar check src/main/resources/logback.xml");
    }
}
```

---

## 编译和打包

### 方式1：使用Maven（推荐）

```bash
# 编译并打包
mvn clean package

# 生成的jar包位于 target/log-refactor-tool-1.0.0.jar
```

### 方式2：手动编译

```bash
# 编译
javac -d out src/main/java/com/tool/logrefactor/*.java

# 创建MANIFEST.MF文件
echo "Main-Class: com.tool.logrefactor.Main" > MANIFEST.MF

# 打包
jar cvfm log-refactor-tool.jar MANIFEST.MF -C out .
```

---

## 使用方法

### 1. 扫描代码问题

```bash
java -jar log-refactor-tool.jar scan D:/Codes/My/finance-project
```

查看生成的 `log_issues_report.txt`，了解存在哪些问题。

### 2. 分析日志文件

```bash
java -jar log-refactor-tool.jar analyze D:/logs/finance
```

查看 `log_analysis_report.txt`，找出日志量最大的模块。

### 3. 检查配置文件

```bash
java -jar log-refactor-tool.jar check src/main/resources/logback.xml
```

查看 `config_check_report.txt`，优化日志配置。

---

## 集成到现有项目

如果想将此工具集成到现有的Maven项目中，可以：

1. **作为测试依赖添加**：

```xml
<dependency>
    <groupId>com.tool</groupId>
    <artifactId>log-refactor-tool</artifactId>
    <version>1.0.0</version>
    <scope>test</scope>
</dependency>
```

2. **创建Maven插件目标**，在构建时自动扫描

3. **集成到CI/CD流程**，每次构建时检查日志规范

---

## 注意事项

1. **备份重要**：如果要扩展批量修复功能，务必备份代码
2. **人工审查**：自动扫描结果需要人工审查
3. **测试验证**：任何修改都必须在测试环境充分验证
4. **性能考虑**：扫描大型项目可能需要较长时间
5. **编码问题**：确保Java文件使用UTF-8编码

---

## 扩展建议

1. **添加批量修复功能**：实现自动修复常见问题的能力
2. **支持更多配置格式**：支持properties、yml等配置格式
3. **生成HTML报告**：使用模板引擎生成更美观的报告
4. **集成SonarQube**：将检查结果推送到SonarQube
5. **自定义规则**：允许用户自定义检查规则

---

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**适用JDK版本**：JDK 8+
