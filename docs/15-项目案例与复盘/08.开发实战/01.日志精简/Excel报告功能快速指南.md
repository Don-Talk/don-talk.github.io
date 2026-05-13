# Excel报告功能快速指南

## 功能概述

日志精简工具现在支持生成Excel格式的报告，按问题类型自动分成不同的Sheet，便于查看和分析。

---

## 快速开始

### 1. 确保已添加POI依赖

在 `pom.xml` 中确认包含以下依赖：

```xml
<!-- Excel处理 -->
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
```

### 2. 重新编译

```bash
mvn clean package
```

### 3. 生成Excel报告

```bash
java -jar target/log-refactor-tool-1.0.0.jar scan D:/your-project --format excel
```

---

## Excel报告结构

生成的 `log_issues_report.xlsx` 文件包含以下Sheet：

### 📊 Sheet 1: 汇总统计

**内容：**
- 报告标题和生成时间
- 各问题类型的数量、占比、严重程度
- 总计行

**用途：** 快速了解整体情况

---

### 🔍 Sheet 2-N: 按问题类型分类

每个问题类型一个独立的Sheet：

#### string_concat（字符串拼接）
- 所有使用字符串拼接的日志问题
- 严重程度：MEDIUM（橙色）

#### stack_trace_abuse（堆栈滥用）
- 业务异常也打印完整堆栈的问题
- 严重程度：HIGH（红色）

#### print_stacktrace（printStackTrace）
- 使用printStackTrace()的问题
- 严重程度：HIGH（红色）

#### loop_logging（循环内日志）
- 在循环内打印日志的问题
- 严重程度：MEDIUM（橙色）

**每个Sheet包含：**
- 序号
- 文件路径
- 行号
- 严重程度（带颜色）
- 问题描述
- 代码内容

---

### 📋 最后一个Sheet: 所有问题

**内容：**
- 所有问题的完整列表
- 包含"问题类型"列

**用途：** 全局查看和筛选

---

## Excel报告的优势

| 特性 | 说明 |
|------|------|
| ✅ 分类清晰 | 按问题类型分Sheet，针对性处理 |
| ✅ 颜色标识 | HIGH=红色，MEDIUM=橙色，LOW=绿色 |
| ✅ 易于筛选 | 使用Excel筛选功能快速定位 |
| ✅ 便于分享 | 团队可直接打开，无需特殊工具 |
| ✅ 可排序 | 按文件、行号、严重程度排序 |
| ✅ 可统计 | 使用Excel公式二次分析 |

---

## 使用场景

### 场景1：代码审查会议

```bash
# 会前生成Excel报告
java -jar log-refactor-tool-1.0.0.jar scan ./src --format excel

# 会议上直接打开Excel，按Sheet逐个讨论
```

### 场景2：分配修复任务

```bash
# 1. 生成Excel报告
java -jar log-refactor-tool-1.0.0.jar scan ./src --format excel

# 2. 打开Excel，筛选出HIGH级别问题
# 3. 分配给不同开发人员
# 4. 每人负责一个Sheet的问题修复
```

### 场景3：进度跟踪

```bash
# 每周生成一次Excel报告
java -jar log-refactor-tool-1.0.0.jar scan ./src --format excel

# 对比不同周的报告，跟踪修复进度
```

### 场景4：质量报告

```bash
# 将Excel报告作为代码质量报告的一部分
# 附在周报或月报中
```

---

## 常用操作

### 1. 筛选HIGH级别问题

1. 打开Excel文件
2. 选择"所有问题"Sheet
3. 点击"严重程度"列的筛选按钮
4. 只勾选"HIGH"
5. 优先修复这些问题

### 2. 按模块分组

1. 在"文件路径"列添加筛选
2. 根据包名或模块名筛选
3. 分配给对应的开发人员

### 3. 统计各模块问题数

1. 复制"所有问题"Sheet的数据
2. 使用数据透视表
3. 按"文件路径"分组统计

### 4. 导出为CSV

1. 选择某个Sheet
2. 文件 → 另存为
3. 选择CSV格式
4. 可用于导入其他工具

---

## 与其他格式对比

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **TXT** | 简单、体积小 | 不易查看、无法筛选 | 快速查看、日志记录 |
| **JSON** | 结构化、易处理 | 需要工具查看 | 程序处理、API集成 |
| **HTML** | 美观、可交互 | 需要浏览器 | 网页展示、在线查看 |
| **Excel** ⭐ | 分类清晰、易筛选、可统计 | 体积较大 | **团队分享、任务分配、质量报告** |

---

## 常见问题

**Q1: 生成的Excel文件很大怎么办？**

A: Excel文件确实比TXT大，但便于查看和分析。如果只需要简单查看，可以使用TXT格式。

**Q2: 可以同时生成多种格式吗？**

A: 目前一次只能生成一种格式。如需多种格式，可以多次运行：
```bash
java -jar tool.jar scan ./src --format txt
java -jar tool.jar scan ./src --format excel
```

**Q3: Excel中的颜色不明显怎么办？**

A: 可以在Excel中调整显示设置，或使用"条件格式"功能增强颜色显示。

**Q4: 如何自定义Sheet名称？**

A: 修改 `ExcelReportGenerator.java` 中的 `createIssueTypeSheet` 方法。

---

## 最佳实践

1. **定期生成**：每周或每次重要提交后生成Excel报告
2. **优先处理HIGH**：先修复红色标记的HIGH级别问题
3. **分工合作**：按Sheet分配给不同开发人员
4. **跟踪进度**：保留历史报告，对比修复进度
5. **纳入流程**：将Excel报告纳入Code Review流程

---

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**适用工具版本**：log-refactor-tool 1.0.0+
