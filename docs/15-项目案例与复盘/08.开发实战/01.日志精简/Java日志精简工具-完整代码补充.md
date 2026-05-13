# Java日志精简工具 - 完整代码补充

## 说明

本文档补充主教程中缺失的完整代码实现。请将这些代码添加到对应文件中。

---

## 缺失的代码文件清单

### ✅ 已实现的代码（主教程中已有）
1. LogIssueScanner.java - 日志问题扫描器
2. LogFileAnalyzer.java - 日志文件分析器（已修复"最大的20个文件"问题）
3. LogConfigChecker.java - 配置检查器

### ❌ 需要补充的代码
4. BatchLogFixer.java - 批量修复工具
5. ScheduledTaskDetector.java - 定时任务检测器
6. IncrementalScanner.java - 增量扫描器
7. ReportGenerator.java - 报告生成器
8. Main.java - 主入口（需要完善）

---

## 4. BatchLogFixer.java（完整代码）

```java
package com.tool.logrefactor;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

/**
 * 批量日志修复工具 - 自动修复常见的日志问题
 * 注意：使用前请务必备份代码！
 */
public class BatchLogFixer {
    
    private final Path projectRoot;
    private final boolean dryRun;  // 预览模式，不实际修改
    private int fixCount = 0;
    private Path backupDir = null;
    
    public BatchLogFixer(String projectRoot, boolean dryRun) {
        this.projectRoot = Paths.get(projectRoot);
        this.dryRun = dryRun;
    }
    
    /**
     * 创建备份
     */
    public void createBackup() throws IOException {
        if (!dryRun) {
            backupDir = projectRoot.getParent().resolve(
                projectRoot.getFileName() + "_backup_" + System.currentTimeMillis());
            copyDirectory(projectRoot, backupDir);
            System.out.println("已创建备份: " + backupDir);
        }
    }
    
    /**
     * 复制目录
     */
    private void copyDirectory(Path source, Path target) throws IOException {
        Files.walkFileTree(source, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) 
                    throws IOException {
                Path targetDir = target.resolve(source.relativize(dir));
                Files.createDirectories(targetDir);
                return FileVisitResult.CONTINUE;
            }
            
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) 
                    throws IOException {
                Path targetFile = target.resolve(source.relativize(file));
                Files.copy(file, targetFile, StandardCopyOption.REPLACE_EXISTING);
                return FileVisitResult.CONTINUE;
            }
        });
    }
    
    /**
     * 修复字符串拼接日志
     */
    public boolean fixStringConcat(Path filePath) throws IOException {
        String content = new String(Files.readAllBytes(filePath));
        String originalContent = content;
        
        // 匹配 log.info("xxx" + var + "yyy")
        Pattern pattern = Pattern.compile(
            "log\\.(\\w+)\\s*\\(\\s*\"([^\"]*)\"\\s*\\+\\s*(\\w+)\\s*\\+\\s*\"([^\"]*)\"");
        
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        
        while (matcher.find()) {
            String level = matcher.group(1);
            String part1 = matcher.group(2);
            String var = matcher.group(3);
            String part2 = matcher.group(4);
            
            String replacement = String.format("log.%s(\"%s{}%s\", %s)", 
                                              level, part1, part2, var);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        
        content = sb.toString();
        
        if (!content.equals(originalContent)) {
            if (!dryRun) {
                Files.write(filePath, content.getBytes());
            }
            fixCount++;
            return true;
        }
        
        return false;
    }
    
    /**
     * 修复printStackTrace为日志输出
     */
    public boolean fixPrintStackTrace(Path filePath) throws IOException {
        List<String> lines = Files.readAllLines(filePath);
        boolean modified = false;
        List<String> newLines = new ArrayList<>();
        
        for (String line : lines) {
            if (line.contains(".printStackTrace()")) {
                String indent = line.substring(0, line.indexOf(line.trim()));
                newLines.add(indent + "log.error(\"Exception occurred\", e);");
                modified = true;
                fixCount++;
            } else {
                newLines.add(line);
            }
        }
        
        if (modified && !dryRun) {
            Files.write(filePath, newLines);
        }
        
        return modified;
    }
    
    /**
     * 修复业务异常堆栈滥用
     */
    public boolean fixStackAbuse(Path filePath) throws IOException {
        String content = new String(Files.readAllBytes(filePath));
        String originalContent = content;
        
        // 简化策略：将 catch 块中的 log.error("...", e) 改为仅记录消息
        Pattern pattern = Pattern.compile(
            "log\\.error\\([^,]+,\\s*(\\w+)\\s*\\)");
        
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        
        while (matcher.find()) {
            String exceptionVar = matcher.group(1);
            String replacement = String.format(
                "log.error(\"{}\", %s.getMessage())", exceptionVar);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        
        content = sb.toString();
        
        if (!content.equals(originalContent)) {
            if (!dryRun) {
                Files.write(filePath, content.getBytes());
            }
            fixCount++;
            return true;
        }
        
        return false;
    }
    
    /**
     * 处理整个项目目录
     */
    public void processDirectory() throws IOException {
        System.out.println(dryRun ? "【预览模式】" : "【修复模式】");
        System.out.println("开始处理Java文件...");
        
        List<Path> javaFiles = Files.walk(projectRoot)
            .filter(p -> p.toString().endsWith(".java"))
            .collect(Collectors.toList());
        
        int total = javaFiles.size();
        
        for (int i = 0; i < javaFiles.size(); i++) {
            if ((i + 1) % 100 == 0) {
                System.out.println("进度: " + (i + 1) + "/" + total + ", 已修复: " + fixCount);
            }
            
            try {
                fixStringConcat(javaFiles.get(i));
                fixPrintStackTrace(javaFiles.get(i));
                fixStackAbuse(javaFiles.get(i));
            } catch (Exception e) {
                System.err.println("处理文件失败: " + javaFiles.get(i) + ", 错误: " + e.getMessage());
            }
        }
        
        System.out.println("处理完成！共修复 " + fixCount + " 处问题");
    }
    
    /**
     * 生成修复报告
     */
    public void generateReport(String outputFile) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=" + repeat("=", 79));
            writer.println("日志修复报告");
            writer.println("=" + repeat("=", 79));
            writer.println();
            writer.println("模式: " + (dryRun ? "预览（未实际修改）" : "修复（已修改）"));
            writer.println("修复数量: " + fixCount);
            if (backupDir != null) {
                writer.println("备份位置: " + backupDir);
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
    
    public int getFixCount() {
        return fixCount;
    }
}
```

---

## 5. ScheduledTaskDetector.java（完整代码）

```java
package com.tool.logrefactor;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

/**
 * 定时任务日志检测器 - 专门检测定时任务中的不规范日志
 */
public class ScheduledTaskDetector {
    
    private final Path projectRoot;
    private final List<ScheduledTaskInfo> tasks = new ArrayList<>();
    
    // 定时任务注解模式
    private static final Pattern SCHEDULED_PATTERN = Pattern.compile(
        "@Scheduled\\s*\\([^)]*\\)");
    
    // Cron表达式模式
    private static final Pattern CRON_PATTERN = Pattern.compile(
        "cron\\s*=\\s*\"([^\"]+)\"");
    
    // 固定间隔模式
    private static final Pattern FIXED_RATE_PATTERN = Pattern.compile(
        "fixedRate\\s*=\\s*(\\d+)");
    
    public ScheduledTaskDetector(String projectRoot) {
        this.projectRoot = Paths.get(projectRoot);
    }
    
    /**
     * 扫描所有定时任务
     */
    public void scanScheduledTasks() throws IOException {
        System.out.println("开始扫描定时任务...");
        
        List<Path> javaFiles = Files.walk(projectRoot)
            .filter(p -> p.toString().endsWith(".java"))
            .collect(Collectors.toList());
        
        for (Path javaFile : javaFiles) {
            try {
                scanFile(javaFile);
            } catch (Exception e) {
                System.err.println("扫描文件失败: " + javaFile + ", 错误: " + e.getMessage());
            }
        }
        
        System.out.println("扫描完成！发现 " + tasks.size() + " 个定时任务");
    }
    
    /**
     * 扫描单个文件
     */
    private void scanFile(Path filePath) throws IOException {
        List<String> lines = Files.readAllLines(filePath);
        String content = String.join("\n", lines);
        
        Matcher scheduledMatcher = SCHEDULED_PATTERN.matcher(content);
        
        while (scheduledMatcher.find()) {
            int startPos = scheduledMatcher.start();
            
            // 查找方法名
            String methodName = extractMethodName(lines, startPos);
            
            // 提取调度信息
            String scheduleInfo = extractScheduleInfo(scheduledMatcher.group());
            
            // 分析方法体内的日志
            TaskLogAnalysis logAnalysis = analyzeMethodLogs(lines, startPos);
            
            ScheduledTaskInfo taskInfo = new ScheduledTaskInfo();
            taskInfo.file = projectRoot.relativize(filePath).toString();
            taskInfo.methodName = methodName;
            taskInfo.scheduleInfo = scheduleInfo;
            taskInfo.logCount = logAnalysis.logCount;
            taskInfo.hasLoopLogging = logAnalysis.hasLoopLogging;
            taskInfo.hasStackPrint = logAnalysis.hasStackPrint;
            taskInfo.estimatedDailyLogs = estimateDailyLogs(scheduleInfo, logAnalysis.logCount);
            
            tasks.add(taskInfo);
        }
    }
    
    /**
     * 提取方法名
     */
    private String extractMethodName(List<String> lines, int charPosition) {
        int lineNum = 0;
        int charCount = 0;
        
        for (int i = 0; i < lines.size(); i++) {
            charCount += lines.get(i).length() + 1;
            if (charCount > charPosition) {
                lineNum = i;
                break;
            }
        }
        
        for (int i = lineNum; i < Math.min(lineNum + 5, lines.size()); i++) {
            String line = lines.get(i);
            Matcher methodMatcher = Pattern.compile(
                "(public|private|protected)\\s+\\w+\\s+(\\w+)\\s*\\(").matcher(line);
            
            if (methodMatcher.find()) {
                return methodMatcher.group(2);
            }
        }
        
        return "unknown";
    }
    
    /**
     * 提取调度信息
     */
    private String extractScheduleInfo(String annotation) {
        Matcher cronMatcher = CRON_PATTERN.matcher(annotation);
        if (cronMatcher.find()) {
            return "cron: " + cronMatcher.group(1);
        }
        
        Matcher rateMatcher = FIXED_RATE_PATTERN.matcher(annotation);
        if (rateMatcher.find()) {
            long rate = Long.parseLong(rateMatcher.group(1));
            return "fixedRate: " + rate + "ms";
        }
        
        return annotation;
    }
    
    /**
     * 分析方法体内的日志
     */
    private TaskLogAnalysis analyzeMethodLogs(List<String> lines, int methodStartPos) {
        TaskLogAnalysis analysis = new TaskLogAnalysis();
        
        int braceCount = 0;
        boolean inMethod = false;
        
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            
            if (!inMethod && line.contains("{")) {
                inMethod = true;
            }
            
            if (inMethod) {
                braceCount += countChar(line, '{');
                braceCount -= countChar(line, '}');
                
                if (line.matches(".*log\\.(debug|info|warn|error).*")) {
                    analysis.logCount++;
                }
                
                if (line.matches(".*(for|while).*") && analysis.logCount > 0) {
                    analysis.hasLoopLogging = true;
                }
                
                if (line.contains(".printStackTrace()")) {
                    analysis.hasStackPrint = true;
                }
                
                if (braceCount == 0 && inMethod) {
                    break;
                }
            }
        }
        
        return analysis;
    }
    
    /**
     * 估算每日日志量
     */
    private long estimateDailyLogs(String scheduleInfo, int logCount) {
        if (scheduleInfo.contains("fixedRate")) {
            Matcher matcher = Pattern.compile("fixedRate: (\\d+)ms").matcher(scheduleInfo);
            if (matcher.find()) {
                long rate = Long.parseLong(matcher.group(1));
                long executionsPerDay = (24 * 60 * 60 * 1000) / rate;
                return executionsPerDay * logCount;
            }
        }
        
        // 默认估算（假设每分钟执行一次）
        return 24 * 60 * logCount;
    }
    
    private int countChar(String str, char c) {
        int count = 0;
        for (char ch : str.toCharArray()) {
            if (ch == c) count++;
        }
        return count;
    }
    
    /**
     * 生成检测报告
     */
    public void generateReport(String outputFile) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile))) {
            writer.println("=" + repeat("=", 79));
            writer.println("定时任务日志检测报告");
            writer.println("=" + repeat("=", 79));
            writer.println();
            
            List<ScheduledTaskInfo> sortedTasks = tasks.stream()
                .sorted(Comparator.comparingLong(t -> t.estimatedDailyLogs).reversed())
                .collect(Collectors.toList());
            
            writer.println("【定时任务列表】（按预估日志量排序）");
            writer.println("-" + repeat("-", 79));
            writer.printf("%-40s%-20s%-15s%-15s%s%n", 
                         "方法", "调度信息", "日志数/次", "预估日日志", "问题");
            writer.println();
            
            for (ScheduledTaskInfo task : sortedTasks) {
                String issues = "";
                if (task.hasLoopLogging) issues += "循环日志 ";
                if (task.hasStackPrint) issues += "堆栈打印 ";
                
                writer.printf("%-40s%-20s%-15d%-15d%s%n",
                    truncate(task.methodName, 40),
                    truncate(task.scheduleInfo, 20),
                    task.logCount,
                    task.estimatedDailyLogs,
                    issues.isEmpty() ? "无" : issues
                );
            }
            
            writer.println();
            writer.println("【优化建议】");
            writer.println("-" + repeat("-", 79));
            writer.println("1. 对于高频执行的定时任务（如每秒/每分钟），建议:");
            writer.println("   - 将INFO级别日志改为DEBUG或WARN");
            writer.println("   - 仅在异常时打印ERROR日志");
            writer.println("   - 使用采样策略（如每100次执行记录1次）");
            writer.println();
            writer.println("2. 避免在循环内打印日志，改为汇总后打印");
            writer.println("3. 业务异常不要打印完整堆栈，仅记录消息");
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
    
    private String truncate(String str, int maxLength) {
        return str.length() <= maxLength ? str : str.substring(0, maxLength) + "...";
    }
    
    /**
     * 定时任务信息类
     */
    public static class ScheduledTaskInfo {
        String file;
        String methodName;
        String scheduleInfo;
        int logCount;
        boolean hasLoopLogging;
        boolean hasStackPrint;
        long estimatedDailyLogs;
    }
    
    /**
     * 任务日志分析结果
     */
    private static class TaskLogAnalysis {
        int logCount = 0;
        boolean hasLoopLogging = false;
        boolean hasStackPrint = false;
    }
    
    public List<ScheduledTaskInfo> getTasks() {
        return tasks;
    }
}
```

---

由于篇幅限制，我将其他缺失的代码放在下一个补充文件中。请先编译测试以上两个类的代码是否正确。

---

## 6. IncrementalScanner.java（完整代码）

```java
package com.tool.logrefactor;

import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;

/**
 * 增量扫描器 - 只扫描变更的文件
 */
public class IncrementalScanner {
    
    private final Path projectRoot;
    private final Path cacheFile;
    private final Map<String, String> fileHashCache = new HashMap<>();
    
    public IncrementalScanner(String projectRoot) {
        this.projectRoot = Paths.get(projectRoot);
        this.cacheFile = this.projectRoot.resolve(".log-scan-cache.properties");
        loadCache();
    }
    
    /**
     * 加载缓存
     */
    private void loadCache() {
        if (Files.exists(cacheFile)) {
            try {
                Properties props = new Properties();
                props.load(new FileInputStream(cacheFile.toFile()));
                
                for (String key : props.stringPropertyNames()) {
                    fileHashCache.put(key, props.getProperty(key));
                }
                
                System.out.println("加载缓存: " + fileHashCache.size() + " 个文件");
            } catch (IOException e) {
                System.err.println("加载缓存失败: " + e.getMessage());
            }
        }
    }
    
    /**
     * 保存缓存
     */
    private void saveCache() {
        try {
            Properties props = new Properties();
            for (Map.Entry<String, String> entry : fileHashCache.entrySet()) {
                props.setProperty(entry.getKey(), entry.getValue());
            }
            props.store(new FileOutputStream(cacheFile.toFile()), "Log Scan Cache");
        } catch (IOException e) {
            System.err.println("保存缓存失败: " + e.getMessage());
        }
    }
    
    /**
     * 计算文件MD5
     */
    private String calculateMD5(Path filePath) throws IOException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] fileBytes = Files.readAllBytes(filePath);
        byte[] digest = md.digest(fileBytes);
        
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    /**
     * 获取变更的文件列表
     */
    public List<Path> getChangedFiles() throws IOException {
        System.out.println("检查文件变更...");
        
        List<Path> changedFiles = new ArrayList<>();
        List<Path> allJavaFiles = Files.walk(projectRoot)
            .filter(p -> p.toString().endsWith(".java"))
            .collect(java.util.stream.Collectors.toList());
        
        int unchangedCount = 0;
        
        for (Path javaFile : allJavaFiles) {
            String relativePath = projectRoot.relativize(javaFile).toString();
            
            try {
                String currentHash = calculateMD5(javaFile);
                String cachedHash = fileHashCache.get(relativePath);
                
                if (cachedHash == null || !cachedHash.equals(currentHash)) {
                    changedFiles.add(javaFile);
                    fileHashCache.put(relativePath, currentHash);
                } else {
                    unchangedCount++;
                }
            } catch (IOException e) {
                System.err.println("处理文件失败: " + javaFile + ", 错误: " + e.getMessage());
                changedFiles.add(javaFile);
            }
        }
        
        System.out.println("总文件数: " + allJavaFiles.size());
        System.out.println("变更文件: " + changedFiles.size());
        System.out.println("未变文件: " + unchangedCount);
        
        saveCache();
        
        return changedFiles;
    }
}
```

---

## 7. ReportGenerator.java（完整代码）

```java
package com.tool.logrefactor;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 报告生成器 - 支持多种格式的报告输出
 */
public class ReportGenerator {
    
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 生成JSON格式报告
     */
    public static void generateJsonReport(Map<String, Object> reportData, String outputFile) 
            throws IOException {
        
        reportData.put("generatedAt", sdf.format(new Date()));
        reportData.put("toolVersion", "1.0.0");
        
        String json = gson.toJson(reportData);
        Files.write(Paths.get(outputFile), json.getBytes());
        
        System.out.println("JSON报告已保存到: " + outputFile);
    }
    
    /**
     * 生成HTML格式报告（简化版）
     */
    public static void generateHtmlReport(Map<String, Object> reportData, String outputFile) 
            throws IOException {
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n<head>\n");
        html.append("  <meta charset='UTF-8'>\n");
        html.append("  <title>日志扫描报告</title>\n");
        html.append("  <style>");
        html.append("    body { font-family: Arial, sans-serif; margin: 20px; }");
        html.append("    table { border-collapse: collapse; width: 100%; }");
        html.append("    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append("    th { background-color: #4CAF50; color: white; }");
        html.append("    .HIGH { color: red; }");
        html.append("    .MEDIUM { color: orange; }");
        html.append("    .LOW { color: green; }");
        html.append("  </style>");
        html.append("</head>\n<body>\n");
        
        html.append("<h1>日志扫描报告</h1>\n");
        html.append("<p>生成时间: " + sdf.format(new Date()) + "</p>\n");
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> stats = (Map<String, Integer>) reportData.get("stats");
        if (stats != null) {
            html.append("<h2>问题统计</h2>\n");
            html.append("<table>\n<tr><th>问题类型</th><th>数量</th></tr>\n");
            for (Map.Entry<String, Integer> entry : stats.entrySet()) {
                html.append(String.format("<tr><td>%s</td><td>%d</td></tr>\n", 
                                         entry.getKey(), entry.getValue()));
            }
            html.append("</table>\n");
        }
        
        html.append("</body>\n</html>");
        
        Files.write(Paths.get(outputFile), html.toString().getBytes());
        System.out.println("HTML报告已保存到: " + outputFile);
    }
}
```

---

## 8. Main.java（完整代码 - 需要替换主教程中的版本）

```java
package com.tool.logrefactor;

import java.io.IOException;
import java.util.*;

/**
 * 日志精简工具主入口
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
                case "scan":
                    runScanner(args);
                    break;
                case "analyze":
                    runAnalyzer(args);
                    break;
                case "check":
                    runConfigChecker(args);
                    break;
                case "fix":
                    runFixer(args);
                    break;
                case "detect-scheduled":
                    runScheduledDetector(args);
                    break;
                case "scan-incremental":
                    runIncrementalScan(args);
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
    
    private static void runScanner(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar scan <项目根目录> [--threads N] [--format txt|json|html|excel]");
            System.exit(1);
        }
        
        String projectRoot = args[1];
        int threads = 1;
        String format = "txt";
        
        for (int i = 2; i < args.length; i++) {
            if ("--threads".equals(args[i]) && i + 1 < args.length) {
                threads = Integer.parseInt(args[++i]);
            } else if ("--format".equals(args[i]) && i + 1 < args.length) {
                format = args[++i];
            }
        }
        
        LogIssueScanner scanner = new LogIssueScanner(projectRoot);
        
        if (threads > 1) {
            scanner.scanDirectoryParallel(threads);
        } else {
            scanner.scanDirectory();
        }
        
        // 根据格式生成不同的报告
        if ("excel".equals(format)) {
            String outputFile = "log_issues_report.xlsx";
            ExcelReportGenerator.generateExcelReport(
                scanner.getIssues(), 
                scanner.getStats(), 
                outputFile
            );
        } else if ("json".equals(format)) {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("stats", scanner.getStats());
            reportData.put("issues", scanner.getIssues());
            ReportGenerator.generateJsonReport(reportData, "log_issues_report.json");
        } else if ("html".equals(format)) {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("stats", scanner.getStats());
            ReportGenerator.generateHtmlReport(reportData, "log_issues_report.html");
        } else {
            scanner.generateReport("log_issues_report.txt");
        }
        
        System.out.println("\n【问题摘要】");
        for (String type : scanner.getStats().keySet()) {
            System.out.println("  " + type + ": " + scanner.getStats().get(type));
        }
    }
    
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
    
    private static void runFixer(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar fix <项目根目录> [--apply]");
            System.exit(1);
        }
        
        String projectRoot = args[1];
        boolean applyMode = false;
        
        for (int i = 2; i < args.length; i++) {
            if ("--apply".equals(args[i])) {
                applyMode = true;
            }
        }
        
        BatchLogFixer fixer = new BatchLogFixer(projectRoot, !applyMode);
        
        if (!applyMode) {
            System.out.println("\n⚠️  当前为预览模式，不会修改任何文件");
            System.out.println("   确认无误后，请添加 --apply 参数执行实际修复\n");
        } else {
            System.out.println("\n⚠️  即将执行实际修复，正在创建备份...");
            fixer.createBackup();
        }
        
        fixer.processDirectory();
        fixer.generateReport("fix_report.txt");
    }
    
    private static void runScheduledDetector(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar detect-scheduled <项目根目录>");
            System.exit(1);
        }
        
        String projectRoot = args[1];
        ScheduledTaskDetector detector = new ScheduledTaskDetector(projectRoot);
        detector.scanScheduledTasks();
        detector.generateReport("scheduled_tasks_report.txt");
    }
    
    private static void runIncrementalScan(String[] args) throws IOException {
        if (args.length < 2) {
            System.err.println("用法: java -jar log-refactor-tool.jar scan-incremental <项目根目录>");
            System.exit(1);
        }
        
        String projectRoot = args[1];
        IncrementalScanner incrementalScanner = new IncrementalScanner(projectRoot);
        List<java.nio.file.Path> changedFiles = incrementalScanner.getChangedFiles();
        
        System.out.println("\n开始扫描变更文件...");
        LogIssueScanner scanner = new LogIssueScanner(projectRoot);
        scanner.scanFiles(changedFiles);
        scanner.generateReport("log_issues_report.txt");
        
        System.out.println("\n【问题摘要】");
        for (String type : scanner.getStats().keySet()) {
            System.out.println("  " + type + ": " + scanner.getStats().get(type));
        }
    }
    
    private static void printUsage() {
        System.out.println("用法:");
        System.out.println("  java -jar log-refactor-tool.jar <命令> [参数]");
        System.out.println();
        System.out.println("命令:");
        System.out.println("  scan <项目根目录>              - 扫描Java代码中的日志问题");
        System.out.println("  analyze <日志目录>              - 分析日志文件分布");
        System.out.println("  check <配置文件路径>            - 检查日志配置文件");
        System.out.println("  fix <项目根目录> [--apply]      - 批量修复日志问题");
        System.out.println("  detect-scheduled <项目根目录>   - 检测定时任务日志问题");
        System.out.println("  scan-incremental <项目根目录>   - 增量扫描（只扫描变更文件）");
        System.out.println();
        System.out.println("示例:");
        System.out.println("  java -jar log-refactor-tool.jar scan D:/Codes/My/finance-project");
        System.out.println("  java -jar log-refactor-tool.jar scan D:/project --threads 4");
        System.out.println("  java -jar log-refactor-tool.jar analyze D:/logs/finance");
        System.out.println("  java -jar log-refactor-tool.jar check src/main/resources/logback.xml");
        System.out.println("  java -jar log-refactor-tool.jar fix D:/project --apply");
        System.out.println("  java -jar log-refactor-tool.jar detect-scheduled D:/project");
    }
}
```

---

## 使用说明

### 1. 补充缺失的代码

将上述代码分别保存到对应的Java文件中：
- `src/main/java/com/tool/logrefactor/BatchLogFixer.java`
- `src/main/java/com/tool/logrefactor/ScheduledTaskDetector.java`
- `src/main/java/com/tool/logrefactor/IncrementalScanner.java`
- `src/main/java/com/tool/logrefactor/ReportGenerator.java`
- `src/main/java/com/tool/logrefactor/Main.java`（替换原有内容）

### 2. 需要在LogIssueScanner中添加的方法

在 `LogIssueScanner.java` 中添加以下方法以支持多线程和增量扫描：

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 多线程扫描
 */
public void scanDirectoryParallel(int threadCount) throws IOException {
    System.out.println("开始并行扫描Java文件（线程数: " + threadCount + "）...");
    
    List<Path> javaFiles = Files.walk(projectRoot)
        .filter(p -> p.toString().endsWith(".java"))
        .collect(Collectors.toList());
    
    int total = javaFiles.size();
    System.out.println("找到 " + total + " 个Java文件");
    
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    AtomicInteger processedCount = new AtomicInteger(0);
    
    List<Future<?>> futures = new ArrayList<>();
    for (Path javaFile : javaFiles) {
        Future<?> future = executor.submit(() -> {
            try {
                scanFile(javaFile);
                int count = processedCount.incrementAndGet();
                if (count % 100 == 0) {
                    System.out.println("进度: " + count + "/" + total);
                }
            } catch (Exception e) {
                System.err.println("扫描文件失败: " + javaFile + ", 错误: " + e.getMessage());
            }
        });
        futures.add(future);
    }
    
    for (Future<?> future : futures) {
        try {
            future.get();
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("任务执行异常: " + e.getMessage());
        }
    }
    
    executor.shutdown();
    System.out.println("扫描完成！共发现 " + issues.size() + " 个问题");
}

/**
 * 扫描指定的文件列表（用于增量扫描）
 */
public void scanFiles(List<Path> files) {
    System.out.println("开始扫描 " + files.size() + " 个文件...");
    
    for (Path javaFile : files) {
        try {
            scanFile(javaFile);
        } catch (Exception e) {
            System.err.println("扫描文件失败: " + javaFile + ", 错误: " + e.getMessage());
        }
    }
    
    System.out.println("扫描完成！共发现 " + issues.size() + " 个问题");
}

/**
 * 获取所有问题列表
 */
public List<Issue> getIssues() {
    return issues;
}
```

### 3. 编译打包

```bash
mvn clean package
```

### 4. 测试所有功能

```bash
# 测试扫描功能（生成TXT报告）
java -jar target/log-refactor-tool-1.0.0.jar scan D:/test-project

# 测试生成Excel报告（按问题类型分Sheet）
java -jar target/log-refactor-tool-1.0.0.jar scan D:/test-project --format excel

# 测试多线程扫描
java -jar target/log-refactor-tool-1.0.0.jar scan D:/test-project --threads 4

# 测试分析功能
java -jar target/log-refactor-tool-1.0.0.jar analyze D:/test-logs

# 测试配置检查
java -jar target/log-refactor-tool-1.0.0.jar check src/main/resources/logback.xml

# 测试定时任务检测
java -jar target/log-refactor-tool-1.0.0.jar detect-scheduled D:/test-project

# 测试批量修复（预览模式）
java -jar target/log-refactor-tool-1.0.0.jar fix D:/test-project

# 测试增量扫描
java -jar target/log-refactor-tool-1.0.0.jar scan-incremental D:/test-project
```

---

## Excel报告功能说明

### 生成的Excel文件结构

当你使用 `--format excel` 参数时，会生成 `log_issues_report.xlsx` 文件，包含以下Sheet：

#### 1. **汇总统计** Sheet
- 报告标题和生成时间
- 各问题类型的数量统计
- 各问题类型的占比
- 严重程度分布

#### 2. **按问题类型分的Sheet**
每个问题类型一个Sheet，例如：
- `string_concat` - 字符串拼接问题
- `stack_trace_abuse` - 堆栈滥用问题
- `print_stacktrace` - printStackTrace问题
- `loop_logging` - 循环内日志问题

每个Sheet包含：
- 序号
- 文件路径
- 行号
- 严重程度（带颜色标识：红色=HIGH，橙色=MEDIUM，绿色=LOW）
- 问题描述
- 代码内容

#### 3. **所有问题** Sheet
- 包含所有问题的完整列表
- 额外增加“问题类型”列
- 便于全局查看和筛选

### Excel报告的优势

✅ **分类清晰**：按问题类型分Sheet，便于针对性处理  
✅ **颜色标识**：严重程度用不同颜色标识，一目了然  
✅ **易于筛选**：可以使用Excel的筛选功能快速定位  
✅ **便于分享**：团队成员可以直接打开查看，无需特殊工具  
✅ **可排序**：可以按文件、行号、严重程度等排序  
✅ **可统计**：可以使用Excel公式进行二次统计分析  

### 使用示例

```bash
# 生成Excel报告
java -jar log-refactor-tool-1.0.0.jar scan D:/finance-project --format excel

# 生成Excel报告并使用多线程加速
java -jar log-refactor-tool-1.0.0.jar scan D:/finance-project --threads 4 --format excel
```

生成的 `log_issues_report.xlsx` 文件可以直接用Excel或WPS打开。

---

## 常见问题

**Q: 编译时找不到Gson类？**

A: 确保pom.xml中已添加Gson依赖，并执行 `mvn clean install` 下载依赖。

**Q: Main.java中的scanFiles方法找不到？**

A: 需要在LogIssueScanner.java中添加该方法（见上文）。

**Q: 如何验证代码是否正确？**

A: 先编译，然后创建一个测试项目，运行各个命令看是否能正常执行并生成报告。

---

## 9. ExcelReportGenerator.java（新增 - Excel报告生成器）

**功能：** 生成Excel格式的报告，按问题类型分Sheet展示

```java
package com.tool.logrefactor;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Excel报告生成器 - 生成按问题类型分Sheet的Excel报告
 */
public class ExcelReportGenerator {
    
    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 生成Excel报告
     * @param issues 问题列表
     * @param stats 统计数据
     * @param outputFile 输出文件路径
     */
    public static void generateExcelReport(List<LogIssueScanner.Issue> issues, 
                                          Map<String, Integer> stats,
                                          String outputFile) throws IOException {
        
        Workbook workbook = new XSSFWorkbook();
        
        // 创建样式
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle highSeverityStyle = createHighSeverityStyle(workbook);
        CellStyle mediumSeverityStyle = createMediumSeverityStyle(workbook);
        CellStyle lowSeverityStyle = createLowSeverityStyle(workbook);
        CellStyle summaryStyle = createSummaryStyle(workbook);
        
        // 1. 创建汇总Sheet
        createSummarySheet(workbook, stats, summaryStyle);
        
        // 2. 按问题类型创建Sheet
        Map<String, List<LogIssueScanner.Issue>> issuesByType = groupIssuesByType(issues);
        
        for (Map.Entry<String, List<LogIssueScanner.Issue>> entry : issuesByType.entrySet()) {
            String issueType = entry.getKey();
            List<LogIssueScanner.Issue> typeIssues = entry.getValue();
            
            createIssueTypeSheet(workbook, issueType, typeIssues, 
                               headerStyle, highSeverityStyle, 
                               mediumSeverityStyle, lowSeverityStyle);
        }
        
        // 3. 创建所有问题Sheet
        createAllIssuesSheet(workbook, issues, headerStyle, 
                           highSeverityStyle, mediumSeverityStyle, lowSeverityStyle);
        
        // 4. 写入文件
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            workbook.write(fos);
        }
        
        workbook.close();
        System.out.println("Excel报告已保存到: " + outputFile);
    }
    
    /**
     * 创建汇总Sheet
     */
    private static void createSummarySheet(Workbook workbook, Map<String, Integer> stats, 
                                          CellStyle summaryStyle) {
        Sheet sheet = workbook.createSheet("汇总统计");
        
        // 标题
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("日志扫描报告 - 汇总统计");
        titleCell.setCellStyle(summaryStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));
        
        // 生成时间
        Row timeRow = sheet.createRow(2);
        timeRow.createCell(0).setCellValue("生成时间:");
        timeRow.createCell(1).setCellValue(sdf.format(new Date()));
        
        // 统计表格头
        Row headerRow = sheet.createRow(4);
        headerRow.createCell(0).setCellValue("问题类型");
        headerRow.createCell(1).setCellValue("数量");
        headerRow.createCell(2).setCellValue("占比");
        headerRow.createCell(3).setCellValue("严重程度");
        
        // 统计数据
        int total = stats.values().stream().mapToInt(Integer::intValue).sum();
        int rowNum = 5;
        
        // 按数量排序
        List<Map.Entry<String, Integer>> sortedStats = new ArrayList<>(stats.entrySet());
        sortedStats.sort(Map.Entry.<String, Integer>comparingByValue().reversed());
        
        for (Map.Entry<String, Integer> entry : sortedStats) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
            
            double percentage = total > 0 ? (entry.getValue() * 100.0 / total) : 0;
            row.createCell(2).setCellValue(String.format("%.2f%%", percentage));
            
            // 设置严重程度
            String severity = getSeverityForType(entry.getKey());
            row.createCell(3).setCellValue(severity);
        }
        
        // 总计行
        Row totalRow = sheet.createRow(rowNum + 1);
        totalRow.createCell(0).setCellValue("总计");
        totalRow.createCell(1).setCellValue(total);
        totalRow.createCell(2).setCellValue("100.00%");
        
        // 自动调整列宽
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * 创建问题类型Sheet
     */
    private static void createIssueTypeSheet(Workbook workbook, String issueType, 
                                            List<LogIssueScanner.Issue> issues,
                                            CellStyle headerStyle,
                                            CellStyle highStyle, 
                                            CellStyle mediumStyle, 
                                            CellStyle lowStyle) {
        // Sheet名称不能超过31个字符
        String sheetName = issueType.length() > 31 ? 
                          issueType.substring(0, 28) + "..." : issueType;
        Sheet sheet = workbook.createSheet(sheetName);
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"序号", "文件路径", "行号", "严重程度", "问题描述", "代码内容"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据行
        int rowNum = 1;
        for (LogIssueScanner.Issue issue : issues) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(issue.file);
            row.createCell(2).setCellValue(issue.line);
            row.createCell(3).setCellValue(issue.severity);
            row.createCell(4).setCellValue(issue.description);
            row.createCell(5).setCellValue(issue.content);
            
            // 根据严重程度设置样式
            Cell severityCell = row.getCell(3);
            if ("HIGH".equals(issue.severity)) {
                severityCell.setCellStyle(highStyle);
            } else if ("MEDIUM".equals(issue.severity)) {
                severityCell.setCellStyle(mediumStyle);
            } else {
                severityCell.setCellStyle(lowStyle);
            }
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            // 设置最大宽度
            if (sheet.getColumnWidth(i) > 256 * 50) {
                sheet.setColumnWidth(i, 256 * 50);
            }
        }
    }
    
    /**
     * 创建所有问题Sheet
     */
    private static void createAllIssuesSheet(Workbook workbook, 
                                            List<LogIssueScanner.Issue> issues,
                                            CellStyle headerStyle,
                                            CellStyle highStyle, 
                                            CellStyle mediumStyle, 
                                            CellStyle lowStyle) {
        Sheet sheet = workbook.createSheet("所有问题");
        
        // 表头
        Row headerRow = sheet.createRow(0);
        String[] headers = {"序号", "文件路径", "行号", "问题类型", "严重程度", "问题描述", "代码内容"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 数据行
        int rowNum = 1;
        for (LogIssueScanner.Issue issue : issues) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(issue.file);
            row.createCell(2).setCellValue(issue.line);
            row.createCell(3).setCellValue(issue.type);
            row.createCell(4).setCellValue(issue.severity);
            row.createCell(5).setCellValue(issue.description);
            row.createCell(6).setCellValue(issue.content);
            
            // 根据严重程度设置样式
            Cell severityCell = row.getCell(4);
            if ("HIGH".equals(issue.severity)) {
                severityCell.setCellStyle(highStyle);
            } else if ("MEDIUM".equals(issue.severity)) {
                severityCell.setCellStyle(mediumStyle);
            } else {
                severityCell.setCellStyle(lowStyle);
            }
        }
        
        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 256 * 50) {
                sheet.setColumnWidth(i, 256 * 50);
            }
        }
    }
    
    /**
     * 按问题类型分组
     */
    private static Map<String, List<LogIssueScanner.Issue>> groupIssuesByType(
            List<LogIssueScanner.Issue> issues) {
        Map<String, List<LogIssueScanner.Issue>> grouped = new LinkedHashMap<>();
        
        for (LogIssueScanner.Issue issue : issues) {
            grouped.computeIfAbsent(issue.type, k -> new ArrayList<>()).add(issue);
        }
        
        return grouped;
    }
    
    /**
     * 获取问题类型对应的严重程度
     */
    private static String getSeverityForType(String issueType) {
        switch (issueType) {
            case "stack_trace_abuse":
            case "print_stacktrace":
                return "HIGH";
            case "string_concat":
            case "loop_logging":
                return "MEDIUM";
            default:
                return "LOW";
        }
    }
    
    /**
     * 创建表头样式
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
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
     * 创建HIGH严重程度样式
     */
    private static CellStyle createHighSeverityStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.RED.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }
    
    /**
     * 创建MEDIUM严重程度样式
     */
    private static CellStyle createMediumSeverityStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.ORANGE.getIndex());
        style.setFont(font);
        return style;
    }
    
    /**
     * 创建LOW严重程度样式
     */
    private static CellStyle createLowSeverityStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.GREEN.getIndex());
        style.setFont(font);
        return style;
    }
    
    /**
     * 创建汇总样式
     */
    private static CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
}
```

---

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**用途**：补充主教程中缺失的完整代码实现
