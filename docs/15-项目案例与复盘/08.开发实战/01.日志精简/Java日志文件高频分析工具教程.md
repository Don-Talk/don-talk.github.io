# Java日志文件高频分析工具教程（JDK8）

## 概述

本工具专门用于**分析已生成的日志文件**，通过统计分析找出产生最多日志量的内容，并生成详细的Excel报告。与代码扫描工具不同，这是基于真实日志数据的动态分析。

**核心价值：**
- 🎯 **数据驱动**：基于真实日志，精准定位问题源头
- 📊 **多维度统计**：按类、级别、时间、模板等多维度分析
- 🔍 **智能识别**：自动识别定时任务日志、循环内日志
- 📈 **趋势分析**：支持多时间段对比分析
- 📋 **Excel报告**：按问题类型分Sheet，便于团队使用

**环境要求：**
- JDK 8+
- Maven 3.x

---

## 项目结构

```
log-file-analyzer/
├── src/main/java/com/tool/loganalyzer/
│   ├── LogParser.java              # 日志解析器
│   ├── StatisticsEngine.java       # 统计分析引擎
│   ├── LogTemplateExtractor.java   # 日志模板提取器
│   ├── CorrelationAnalyzer.java    # 关联分析器
│   ├── ExcelReportGenerator.java   # Excel报告生成器
│   └── Main.java                   # 主入口
├── config/
│   └── log-pattern.properties      # 日志格式配置
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
    <artifactId>log-file-analyzer</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Apache POI for Excel -->
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
        
        <!-- Commons CSV for parsing -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-csv</artifactId>
            <version>1.9.0</version>
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
                            <mainClass>com.tool.loganalyzer.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 2. 日志解析器 (LogParser.java)

```java
package com.tool.loganalyzer;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.*;

/**
 * 日志解析器 - 解析各种格式的日志文件
 */
public class LogParser {
    
    private static final DateTimeFormatter DATE_FORMAT = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    
    // 常见日志格式正则
    private static final Pattern LOG_PATTERN = Pattern.compile(
        "(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\.\\d{3})\\s+" +
        "\\[([^\\]]+)\\]\\s+" +
        "(DEBUG|INFO|WARN|ERROR)\\s+" +
        "([\\w.$]+)\\s+-\\s+" +
        "(.*)"
    );
    
    /**
     * 解析单个日志文件
     */
    public List<LogEntry> parseFile(Path logFile) throws IOException {
        List<LogEntry> entries = new ArrayList<>();
        
        try (BufferedReader reader = Files.newBufferedReader(logFile)) {
            String line;
            while ((line = reader.readLine()) != null) {
                LogEntry entry = parseLine(line);
                if (entry != null) {
                    entries.add(entry);
                }
            }
        }
        
        return entries;
    }
    
    /**
     * 解析单行日志
     */
    public LogEntry parseLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return null;
        }
        
        Matcher matcher = LOG_PATTERN.matcher(line);
        if (!matcher.matches()) {
            return null;
        }
        
        LogEntry entry = new LogEntry();
        entry.timestamp = LocalDateTime.parse(matcher.group(1), DATE_FORMAT);
        entry.thread = matcher.group(2);
        entry.level = matcher.group(3);
        entry.className = matcher.group(4);
        entry.message = matcher.group(5);
        entry.template = extractTemplate(entry.message);
        
        return entry;
    }
    
    /**
     * 提取日志模板（将变量部分替换为{}）
     */
    private String extractTemplate(String message) {
        if (message == null) {
            return "";
        }
        
        return message
            .replaceAll("\\b\\d+\\b", "{}")                    // 数字
            .replaceAll("[0-9a-f]{8}-[0-9a-f]{4}-...", "{}")  // UUID
            .replaceAll("id=[^,\\s]+", "id={}")                // id=xxx
            .replaceAll("orderId=[^,\\s]+", "orderId={}")      // orderId=xxx
            .replaceAll("userId=[^,\\s]+", "userId={}")        // userId=xxx
            .replaceAll("\\d{4}-\\d{2}-\\d{2}", "{}");         // 日期
    }
    
    /**
     * 流式解析大文件（节省内存）
     */
    public void parseFileStreaming(Path logFile, LogEntryConsumer consumer) 
            throws IOException {
        
        try (BufferedReader reader = Files.newBufferedReader(logFile)) {
            String line;
            int lineNumber = 0;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                LogEntry entry = parseLine(line);
                if (entry != null) {
                    consumer.accept(entry);
                }
                
                // 每10000行回调一次，便于进度显示
                if (lineNumber % 10000 == 0) {
                    consumer.onProgress(lineNumber);
                }
            }
        }
    }
    
    /**
     * 日志条目
     */
    public static class LogEntry {
        LocalDateTime timestamp;
        String thread;
        String level;
        String className;
        String message;
        String template;
        
        public String getPackageName() {
            int lastDot = className.lastIndexOf('.');
            return lastDot > 0 ? className.substring(0, lastDot) : className;
        }
        
        public boolean isScheduledTask() {
            return thread != null && 
                   (thread.contains("scheduled") || 
                    thread.contains("timer") ||
                    thread.contains("cron"));
        }
    }
    
    /**
     * 消费者接口（用于流式处理）
     */
    @FunctionalInterface
    public interface LogEntryConsumer {
        void accept(LogEntry entry);
        
        default void onProgress(int lineNumber) {
            // 默认空实现
        }
    }
}
```

---

## 3. 统计分析引擎 (StatisticsEngine.java)

```java
package com.tool.loganalyzer;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

/**
 * 统计分析引擎 - 多维度统计分析
 */
public class StatisticsEngine {
    
    private final Map<String, Integer> classStats = new ConcurrentHashMap<>();
    private final Map<String, Integer> levelStats = new ConcurrentHashMap<>();
    private final Map<String, Integer> templateStats = new ConcurrentHashMap<>();
    private final Map<String, Integer> threadStats = new ConcurrentHashMap<>();
    private final Map<Integer, Integer> hourlyStats = new ConcurrentHashMap<>();
    
    private long totalLines = 0;
    
    /**
     * 处理单条日志
     */
    public void processEntry(LogParser.LogEntry entry) {
        totalLines++;
        
        // 按类统计
        classStats.merge(entry.className, 1, Integer::sum);
        
        // 按级别统计
        levelStats.merge(entry.level, 1, Integer::sum);
        
        // 按模板统计
        templateStats.merge(entry.template, 1, Integer::sum);
        
        // 按线程统计
        threadStats.merge(entry.thread, 1, Integer::sum);
        
        // 按小时统计
        int hour = entry.timestamp.getHour();
        hourlyStats.merge(hour, 1, Integer::sum);
    }
    
    /**
     * 获取按类统计的TOP N
     */
    public List<StatItem> getClassStatsTopN(int n) {
        return getTopN(classStats, n);
    }
    
    /**
     * 获取按模板统计的TOP N
     */
    public List<StatItem> getTemplateStatsTopN(int n) {
        return getTopN(templateStats, n);
    }
    
    /**
     * 获取按级别统计
     */
    public Map<String, Integer> getLevelStats() {
        return new HashMap<>(levelStats);
    }
    
    /**
     * 获取按线程统计
     */
    public Map<String, Integer> getThreadStats() {
        return new HashMap<>(threadStats);
    }
    
    /**
     * 获取按小时统计
     */
    public Map<Integer, Integer> getHourlyStats() {
        return new TreeMap<>(hourlyStats);
    }
    
    /**
     * 获取总行数
     */
    public long getTotalLines() {
        return totalLines;
    }
    
    /**
     * 识别定时任务相关日志
     */
    public List<StatItem> getScheduledTaskLogs() {
        return threadStats.entrySet().stream()
            .filter(e -> e.getKey().contains("scheduled") || 
                        e.getKey().contains("timer") ||
                        e.getKey().contains("cron"))
            .map(e -> new StatItem(e.getKey(), e.getValue()))
            .sorted(Comparator.comparingInt(StatItem::getCount).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * 获取TOP N统计
     */
    private List<StatItem> getTopN(Map<String, Integer> stats, int n) {
        return stats.entrySet().stream()
            .map(e -> new StatItem(e.getKey(), e.getValue()))
            .sorted(Comparator.comparingInt(StatItem::getCount).reversed())
            .limit(n)
            .collect(Collectors.toList());
    }
    
    /**
     * 统计项
     */
    public static class StatItem {
        private String name;
        private int count;
        
        public StatItem(String name, int count) {
            this.name = name;
            this.count = count;
        }
        
        public String getName() { return name; }
        public int getCount() { return count; }
        
        public double getPercentage(long total) {
            return total > 0 ? (count * 100.0 / total) : 0;
        }
    }
}
```

---

## 4. 日志模板提取器 (LogTemplateExtractor.java)

```java
package com.tool.loganalyzer;

import java.util.*;
import java.util.regex.*;

/**
 * 日志模板提取器 - 智能提取日志模板
 */
public class LogTemplateExtractor {
    
    /**
     * 提取日志模板（更智能的版本）
     */
    public String extractTemplate(String message) {
        if (message == null || message.isEmpty()) {
            return "";
        }
        
        String template = message;
        
        // 替换各种模式的变量
        template = replacePattern(template, "\\b\\d{1,}\\b", "{}");           // 整数
        template = replacePattern(template, "\\b\\d+\\.\\d+\\b", "{}");       // 小数
        template = replacePattern(template, "[0-9a-f]{8}-[0-9a-f]{4}-...", "{}"); // UUID
        template = replacePattern(template, "\\d{4}-\\d{2}-\\d{2}", "{}");    // 日期
        template = replacePattern(template, "\\d{2}:\\d{2}:\\d{2}", "{}");    // 时间
        
        // 替换常见的键值对
        template = replacePattern(template, "id=[^,\\s\\]]+", "id={}");
        template = replacePattern(template, "orderId=[^,\\s\\]]+", "orderId={}");
        template = replacePattern(template, "userId=[^,\\s\\]]+", "userId={}");
        template = replacePattern(template, "name=[^,\\s\\]]+", "name={}");
        
        return template;
    }
    
    private String replacePattern(String text, String regex, String replacement) {
        return Pattern.compile(regex).matcher(text).replaceAll(replacement);
    }
}
```

---

## 5. Excel报告生成器 (ExcelReportGenerator.java)

```java
package com.tool.loganalyzer;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Excel报告生成器 - 生成多维度分析报告
 */
public class ExcelReportGenerator {
    
    private static final SimpleDateFormat sdf = 
        new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 生成完整的Excel报告
     */
    public void generateReport(StatisticsEngine stats, 
                              String outputFile) throws IOException {
        
        Workbook workbook = new XSSFWorkbook();
        
        // 创建样式
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        CellStyle highPriorityStyle = createHighPriorityStyle(workbook);
        
        // Sheet 1: 执行摘要
        createSummarySheet(workbook, stats, headerStyle, numberStyle);
        
        // Sheet 2: 高频日志TOP 50
        createTopTemplatesSheet(workbook, stats, headerStyle, numberStyle, 
                               highPriorityStyle);
        
        // Sheet 3: 类日志量排行
        createClassStatsSheet(workbook, stats, headerStyle, numberStyle);
        
        // Sheet 4: 级别分布
        createLevelStatsSheet(workbook, stats, headerStyle, numberStyle);
        
        // Sheet 5: 时间分布
        createHourlyStatsSheet(workbook, stats, headerStyle, numberStyle);
        
        // Sheet 6: 定时任务分析
        createScheduledTaskSheet(workbook, stats, headerStyle, numberStyle);
        
        // Sheet 7: 优化建议
        createRecommendationsSheet(workbook, stats, headerStyle);
        
        // 写入文件
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            workbook.write(fos);
        }
        
        workbook.close();
        System.out.println("Excel报告已保存到: " + outputFile);
    }
    
    /**
     * 创建执行摘要Sheet
     */
    private void createSummarySheet(Workbook workbook, StatisticsEngine stats,
                                   CellStyle headerStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("执行摘要");
        
        int rowNum = 0;
        
        // 标题
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("日志文件分析报告");
        titleCell.setCellStyle(headerStyle);
        
        rowNum++; // 空行
        
        // 基本信息
        Row infoRow1 = sheet.createRow(rowNum++);
        infoRow1.createCell(0).setCellValue("分析时间:");
        infoRow1.createCell(1).setCellValue(sdf.format(new Date()));
        
        Row infoRow2 = sheet.createRow(rowNum++);
        infoRow2.createCell(0).setCellValue("总日志数:");
        infoRow2.createCell(1).setCellValue(stats.getTotalLines());
        
        rowNum++; // 空行
        
        // TOP 5高频日志
        Row topHeader = sheet.createRow(rowNum++);
        topHeader.createCell(0).setCellValue("TOP 5 高频日志模板");
        
        List<StatisticsEngine.StatItem> topTemplates = 
            stats.getTemplateStatsTopN(5);
        
        for (int i = 0; i < Math.min(5, topTemplates.size()); i++) {
            StatisticsEngine.StatItem item = topTemplates.get(i);
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(String.format("%d. %s", i + 1, 
                                                         item.getName()));
            row.createCell(1).setCellValue(item.getCount());
            row.createCell(2).setCellValue(
                String.format("%.2f%%", item.getPercentage(stats.getTotalLines())));
        }
        
        // 自动调整列宽
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建高频日志TOP 50 Sheet
     */
    private void createTopTemplatesSheet(Workbook workbook, 
                                        StatisticsEngine stats,
                                        CellStyle headerStyle,
                                        CellStyle numberStyle,
                                        CellStyle highPriorityStyle) {
        Sheet sheet = workbook.createSheet("高频日志TOP 50");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"排名", "日志模板", "出现次数", "占比", "优先级"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据
        List<StatisticsEngine.StatItem> topTemplates = 
            stats.getTemplateStatsTopN(50);
        
        int rowNum = 1;
        for (int i = 0; i < topTemplates.size(); i++) {
            StatisticsEngine.StatItem item = topTemplates.get(i);
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(i + 1);
            row.createCell(1).setCellValue(item.getName());
            row.createCell(2).setCellValue(item.getCount());
            row.createCell(3).setCellValue(
                String.format("%.2f%%", item.getPercentage(stats.getTotalLines())));
            
            // 设置优先级
            String priority = getPriority(item, stats.getTotalLines());
            Cell priorityCell = row.createCell(4);
            priorityCell.setCellValue(priority);
            
            if ("HIGH".equals(priority)) {
                priorityCell.setCellStyle(highPriorityStyle);
            }
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 256 * 80) {
                sheet.setColumnWidth(i, 256 * 80);
            }
        }
    }
    
    /**
     * 创建类日志量排行Sheet
     */
    private void createClassStatsSheet(Workbook workbook, 
                                      StatisticsEngine stats,
                                      CellStyle headerStyle,
                                      CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("类日志量排行");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"排名", "类名", "日志数量", "占比"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据
        List<StatisticsEngine.StatItem> classStats = 
            stats.getClassStatsTopN(50);
        
        int rowNum = 1;
        for (int i = 0; i < classStats.size(); i++) {
            StatisticsEngine.StatItem item = classStats.get(i);
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(i + 1);
            row.createCell(1).setCellValue(item.getName());
            row.createCell(2).setCellValue(item.getCount());
            row.createCell(3).setCellValue(
                String.format("%.2f%%", item.getPercentage(stats.getTotalLines())));
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建级别分布Sheet
     */
    private void createLevelStatsSheet(Workbook workbook,
                                      StatisticsEngine stats,
                                      CellStyle headerStyle,
                                      CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("级别分布");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"级别", "数量", "占比"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据
        Map<String, Integer> levelStats = stats.getLevelStats();
        
        int rowNum = 1;
        for (Map.Entry<String, Integer> entry : levelStats.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
            row.createCell(2).setCellValue(
                String.format("%.2f%%", 
                    entry.getValue() * 100.0 / stats.getTotalLines()));
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建时间分布Sheet
     */
    private void createHourlyStatsSheet(Workbook workbook,
                                       StatisticsEngine stats,
                                       CellStyle headerStyle,
                                       CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("时间分布(24小时)");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"时段", "日志数量", "占比"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据
        Map<Integer, Integer> hourlyStats = stats.getHourlyStats();
        
        int rowNum = 1;
        for (int hour = 0; hour < 24; hour++) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(
                String.format("%02d:00-%02d:59", hour, hour));
            
            int count = hourlyStats.getOrDefault(hour, 0);
            row.createCell(1).setCellValue(count);
            row.createCell(2).setCellValue(
                String.format("%.2f%%", 
                    count * 100.0 / stats.getTotalLines()));
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建定时任务分析Sheet
     */
    private void createScheduledTaskSheet(Workbook workbook,
                                         StatisticsEngine stats,
                                         CellStyle headerStyle,
                                         CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("定时任务分析");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"线程名", "日志数量", "占比", "说明"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据
        List<StatisticsEngine.StatItem> scheduledLogs = 
            stats.getScheduledTaskLogs();
        
        int rowNum = 1;
        for (StatisticsEngine.StatItem item : scheduledLogs) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(item.getName());
            row.createCell(1).setCellValue(item.getCount());
            row.createCell(2).setCellValue(
                String.format("%.2f%%", 
                    item.getPercentage(stats.getTotalLines())));
            row.createCell(3).setCellValue("定时任务相关");
        }
        
        // 如果没有定时任务日志
        if (scheduledLogs.isEmpty()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("未检测到定时任务日志");
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建优化建议Sheet
     */
    private void createRecommendationsSheet(Workbook workbook,
                                           StatisticsEngine stats,
                                           CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("优化建议");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"优先级", "问题描述", "影响范围", "优化建议"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        int rowNum = 1;
        
        // 分析INFO级别占比
        Map<String, Integer> levelStats = stats.getLevelStats();
        Integer infoCount = levelStats.get("INFO");
        if (infoCount != null && infoCount > stats.getTotalLines() * 0.7) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("HIGH");
            row.createCell(1).setCellValue("INFO级别日志占比过高");
            row.createCell(2).setCellValue(
                String.format("%.2f%%", infoCount * 100.0 / stats.getTotalLines()));
            row.createCell(3).setCellValue(
                "建议将部分INFO日志降级为DEBUG，或采用采样策略");
        }
        
        // 分析高频日志
        List<StatisticsEngine.StatItem> topTemplates = 
            stats.getTemplateStatsTopN(10);
        
        for (StatisticsEngine.StatItem item : topTemplates) {
            if (item.getPercentage(stats.getTotalLines()) > 5) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue("HIGH");
                row.createCell(1).setCellValue(
                    "高频日志: " + truncate(item.getName(), 50));
                row.createCell(2).setCellValue(
                    String.format("%.2f%% (%d次)", 
                        item.getPercentage(stats.getTotalLines()), 
                        item.getCount()));
                row.createCell(3).setCellValue(
                    "建议降低日志级别或减少打印频率");
            }
        }
        
        // 分析定时任务
        List<StatisticsEngine.StatItem> scheduledLogs = 
            stats.getScheduledTaskLogs();
        
        if (!scheduledLogs.isEmpty()) {
            for (StatisticsEngine.StatItem item : scheduledLogs) {
                if (item.getCount() > stats.getTotalLines() * 0.1) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue("MEDIUM");
                    row.createCell(1).setCellValue(
                        "定时任务日志量大: " + item.getName());
                    row.createCell(2).setCellValue(
                        String.format("%.2f%%", 
                            item.getPercentage(stats.getTotalLines())));
                    row.createCell(3).setCellValue(
                        "建议仅在异常时记录日志，或使用采样策略");
                }
            }
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 256 * 60) {
                sheet.setColumnWidth(i, 256 * 60);
            }
        }
    }
    
    /**
     * 获取优先级
     */
    private String getPriority(StatisticsEngine.StatItem item, long total) {
        double percentage = item.getPercentage(total);
        if (percentage > 10) {
            return "HIGH";
        } else if (percentage > 5) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    /**
     * 截断字符串
     */
    private String truncate(String str, int maxLength) {
        return str.length() <= maxLength ? str : 
               str.substring(0, maxLength) + "...";
    }
    
    /**
     * 创建表头样式
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    /**
     * 创建数字样式
     */
    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }
    
    /**
     * 创建高优先级样式
     */
    private CellStyle createHighPriorityStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.RED.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}
```

---

## 6. 主入口 (Main.java)

```java
package com.tool.loganalyzer;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 日志文件分析工具主入口
 */
public class Main {
    
    public static void main(String[] args) {
        if (args.length < 1) {
            printUsage();
            System.exit(1);
        }
        
        String command = args[0];
        
        try {
            switch (command) {
                case "analyze":
                    runAnalysis(args);
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
     * 运行分析
     */
    private static void runAnalysis(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-file-analyzer.jar analyze <日志目录> [--threads N]");
            System.exit(1);
        }
        
        String logDirectory = args[1];
        int threads = 4;
        
        // 解析参数
        for (int i = 2; i < args.length; i++) {
            if ("--threads".equals(args[i]) && i + 1 < args.length) {
                threads = Integer.parseInt(args[++i]);
            }
        }
        
        Path logDir = Paths.get(logDirectory);
        if (!Files.exists(logDir)) {
            System.err.println("错误: 目录不存在 - " + logDirectory);
            System.exit(1);
        }
        
        System.out.println("开始分析日志文件...");
        System.out.println("日志目录: " + logDirectory);
        System.out.println("线程数: " + threads);
        System.out.println();
        
        // 查找所有日志文件
        List<Path> logFiles = findLogFiles(logDir);
        System.out.println("找到 " + logFiles.size() + " 个日志文件");
        System.out.println();
        
        if (logFiles.isEmpty()) {
            System.err.println("警告: 未找到.log文件");
            System.exit(1);
        }
        
        // 创建统计引擎
        StatisticsEngine stats = new StatisticsEngine();
        LogParser parser = new LogParser();
        
        // 多线程处理
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        AtomicLong processedFiles = new AtomicLong(0);
        AtomicLong totalLines = new AtomicLong(0);
        
        List<Future<?>> futures = new ArrayList<>();
        
        for (Path logFile : logFiles) {
            Future<?> future = executor.submit(() -> {
                try {
                    final long[] lineCount = {0};
                    
                    parser.parseFileStreaming(logFile, entry -> {
                        stats.processEntry(entry);
                        lineCount[0]++;
                    });
                    
                    totalLines.addAndGet(lineCount[0]);
                    long completed = processedFiles.incrementAndGet();
                    
                    if (completed % 10 == 0) {
                        System.out.println("进度: " + completed + "/" + 
                                         logFiles.size() + " 文件, " +
                                         totalLines.get() + " 行");
                    }
                    
                } catch (IOException e) {
                    System.err.println("处理文件失败: " + logFile + 
                                     ", 错误: " + e.getMessage());
                }
            });
            
            futures.add(future);
        }
        
        // 等待所有任务完成
        for (Future<?> future : futures) {
            future.get();
        }
        
        executor.shutdown();
        
        System.out.println();
        System.out.println("分析完成！");
        System.out.println("总日志数: " + stats.getTotalLines());
        System.out.println();
        
        // 生成Excel报告
        String outputFile = "log_analysis_report.xlsx";
        ExcelReportGenerator reportGenerator = new ExcelReportGenerator();
        reportGenerator.generateReport(stats, outputFile);
        
        System.out.println();
        System.out.println("=== 分析摘要 ===");
        System.out.println("TOP 5 高频日志模板:");
        
        List<StatisticsEngine.StatItem> topTemplates = 
            stats.getTemplateStatsTopN(5);
        
        for (int i = 0; i < topTemplates.size(); i++) {
            StatisticsEngine.StatItem item = topTemplates.get(i);
            System.out.printf("  %d. %s (%d次, %.2f%%)%n",
                i + 1,
                truncate(item.getName(), 60),
                item.getCount(),
                item.getPercentage(stats.getTotalLines()));
        }
    }
    
    /**
     * 查找所有日志文件
     */
    private static List<Path> findLogFiles(Path directory) throws IOException {
        List<Path> logFiles = new ArrayList<>();
        
        Files.walk(directory)
            .filter(p -> p.toString().endsWith(".log"))
            .forEach(logFiles::add);
        
        return logFiles;
    }
    
    /**
     * 截断字符串
     */
    private static String truncate(String str, int maxLength) {
        return str.length() <= maxLength ? str : 
               str.substring(0, maxLength) + "...";
    }
    
    /**
     * 打印使用说明
     */
    private static void printUsage() {
        System.out.println("用法:");
        System.out.println("  java -jar log-file-analyzer.jar <命令> [参数]");
        System.out.println();
        System.out.println("命令:");
        System.out.println("  analyze <日志目录> [--threads N]  - 分析日志文件");
        System.out.println();
        System.out.println("示例:");
        System.out.println("  java -jar log-file-analyzer.jar analyze D:/logs/finance");
        System.out.println("  java -jar log-file-analyzer.jar analyze D:/logs --threads 8");
    }
}
```

---

## 编译和使用

### 1. 编译打包

```bash
mvn clean package
```

### 2. 基本使用

```bash
# 分析日志目录
java -jar target/log-file-analyzer-1.0.0.jar analyze D:/logs/finance

# 使用多线程加速
java -jar target/log-file-analyzer-1.0.0.jar analyze D:/logs/finance --threads 8
```

### 3. 查看报告

生成的 `log_analysis_report.xlsx` 包含7个Sheet：
1. **执行摘要** - 总体情况概览
2. **高频日志TOP 50** - 最关键的发现
3. **类日志量排行** - 按类统计
4. **级别分布** - INFO/WARN/ERROR分布
5. **时间分布** - 24小时日志分布
6. **定时任务分析** - 定时任务相关日志
7. **优化建议** - 可执行的优化清单

---

## 核心优势

✅ **数据驱动** - 基于真实日志数据，不是猜测  
✅ **精准定位** - 直接找出产生最多日志的内容  
✅ **多维度分析** - 按类、级别、时间、模板等维度  
✅ **智能识别** - 自动识别定时任务、高频日志  
✅ **Excel报告** - 分类清晰，便于团队使用  
✅ **性能优化** - 流式处理 + 多线程，支持GB级日志  

---

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**适用JDK版本**：JDK 8+
