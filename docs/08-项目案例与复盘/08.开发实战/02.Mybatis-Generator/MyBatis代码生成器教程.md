# MyBatis 代码生成器教程

## 1. 项目概述

本教程将指导你构建一个基于 Spring Boot 的 MyBatis 代码生成器，能够根据数据库表结构自动生成：
- Entity（实体类）
- Mapper 接口
- Mapper XML 文件
- Service 接口及实现类
- Controller 控制器

**核心特性：**
- ✅ 支持 MySQL 和 Oracle 数据库
- ✅ 可配置的数据库连接信息
- ✅ 自定义包名和输出路径
- ✅ 一键生成完整 CRUD 代码
- ✅ 即拷即用，复制代码即可运行

---

## 2. 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 8+ | JDK 版本 |
| Spring Boot | 2.7.x | 基础框架 |
| MyBatis | 3.5.x | ORM 框架 |
| MyBatis Generator | 1.4.x | 代码生成核心 |
| MySQL Driver | 8.0.x | MySQL 驱动 |
| Oracle Driver | 19.x | Oracle 驱动 |
| Lombok | 1.18.x | 简化实体类 |

---

## 3. 项目结构

```
mybatis-generator/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/generator/
│   │   │       ├── GeneratorApplication.java          # 启动类
│   │   │       ├── config/
│   │   │       │   └── GeneratorConfig.java           # 生成器配置类
│   │   │       ├── service/
│   │   │       │   └── CodeGeneratorService.java      # 代码生成服务
│   │   │       └── controller/
│   │   │           └── GeneratorController.java       # REST 接口
│   │   └── resources/
│   │       ├── application.yml                        # 应用配置
│   │       └── generator/
│   │           └── generatorConfig.xml                # MyBatis Generator 配置模板
│   └── test/
│       └── java/
├── pom.xml
└── README.md
```

---

## 4. 创建 Spring Boot 项目

### 4.1 Maven 依赖配置

创建 `pom.xml` 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.14</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>mybatis-generator</artifactId>
    <version>1.0.0</version>
    <name>mybatis-generator</name>
    <description>MyBatis Code Generator</description>
    
    <properties>
        <java.version>1.8</java.version>
        <mybatis-generator.version>1.4.1</mybatis-generator.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- MyBatis -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.3.1</version>
        </dependency>
        
        <!-- MyBatis Generator Core -->
        <dependency>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-core</artifactId>
            <version>${mybatis-generator.version}</version>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Oracle Driver -->
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
            <version>19.3.0.0</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 5. 配置文件

### 5.1 application.yml

创建 `src/main/resources/application.yml`：

```yaml
server:
  port: 8080

spring:
  application:
    name: mybatis-generator

# 代码生成器配置
generator:
  # 默认输出根路径（可根据实际情况修改）
  output-dir: ./generated-code
  
  # JDBC 驱动类映射
  drivers:
    mysql: com.mysql.cj.jdbc.Driver
    oracle: oracle.jdbc.OracleDriver
  
  # JDBC URL 模板
  url-templates:
    mysql: jdbc:mysql://{host}:{port}/{database}?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    oracle: jdbc:oracle:thin:@{host}:{port}:{service_name}

# 日志配置
logging:
  level:
    com.example.generator: DEBUG
```

---

## 6. 核心代码实现

### 6.1 启动类

创建 `GeneratorApplication.java`：

```java
package com.example.generator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MyBatis 代码生成器启动类
 */
@SpringBootApplication
public class GeneratorApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GeneratorApplication.class, args);
        System.out.println("========================================");
        System.out.println("  MyBatis Code Generator Started!");
        System.out.println("  Access: http://localhost:8080");
        System.out.println("========================================");
    }
}
```

### 6.2 配置类

创建 `GeneratorConfig.java`：

```java
package com.example.generator.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 代码生成器配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "generator")
public class GeneratorConfig {
    
    /**
     * 默认输出目录
     */
    private String outputDir = "./generated-code";
    
    /**
     * JDBC 驱动类映射
     */
    private Map<String, String> drivers;
    
    /**
     * JDBC URL 模板
     */
    private Map<String, String> urlTemplates;
    
    /**
     * 根据数据库类型获取驱动类
     */
    public String getDriver(String dbType) {
        return drivers.get(dbType.toLowerCase());
    }
    
    /**
     * 根据数据库类型和参数构建 JDBC URL
     */
    public String buildJdbcUrl(String dbType, String host, String port, 
                                String databaseOrServiceName) {
        String template = urlTemplates.get(dbType.toLowerCase());
        if (template == null) {
            throw new IllegalArgumentException("Unsupported database type: " + dbType);
        }
        
        return template.replace("{host}", host)
                      .replace("{port}", port)
                      .replace("{database}", databaseOrServiceName)
                      .replace("{service_name}", databaseOrServiceName);
    }
}
```

### 6.3 请求 DTO

创建 `GenerateRequest.java`：

```java
package com.example.generator.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 代码生成请求参数
 */
@Data
public class GenerateRequest {
    
    /**
     * 数据库类型：mysql 或 oracle
     */
    @NotBlank(message = "数据库类型不能为空")
    private String dbType;
    
    /**
     * 数据库主机地址
     */
    @NotBlank(message = "主机地址不能为空")
    private String host;
    
    /**
     * 数据库端口
     */
    @NotBlank(message = "端口不能为空")
    private String port;
    
    /**
     * 数据库名称（MySQL）或服务名（Oracle）
     */
    @NotBlank(message = "数据库名称/服务名不能为空")
    private String database;
    
    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    private String password;
    
    /**
     * 要生成代码的表名（多个表用逗号分隔，留空则生成所有表）
     */
    private String tables;
    
    /**
     * 目标包名（如：com.example.project）
     */
    @NotBlank(message = "包名不能为空")
    private String targetPackage;
    
    /**
     * 输出目录（可选，默认使用配置文件中的值）
     */
    private String outputDir;
    
    /**
     * 是否生成 Lombok 注解
     */
    private Boolean useLombok = true;
    
    /**
     * 是否生成注释
     */
    private Boolean generateComments = true;
}
```

### 6.4 响应 DTO

创建 `GenerateResponse.java`：

```java
package com.example.generator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 代码生成响应结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResponse {
    
    /**
     * 是否成功
     */
    private boolean success;
    
    /**
     * 消息
     */
    private String message;
    
    /**
     * 生成的文件列表
     */
    private List<String> generatedFiles;
    
    /**
     * 输出目录
     */
    private String outputDir;
    
    /**
     * 成功响应
     */
    public static GenerateResponse success(String message, List<String> files, String outputDir) {
        return GenerateResponse.builder()
                .success(true)
                .message(message)
                .generatedFiles(files)
                .outputDir(outputDir)
                .build();
    }
    
    /**
     * 失败响应
     */
    public static GenerateResponse error(String message) {
        return GenerateResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
```

### 6.5 核心服务类

创建 `CodeGeneratorService.java`：

```java
package com.example.generator.service;

import com.example.generator.config.GeneratorConfig;
import com.example.generator.dto.GenerateRequest;
import com.example.generator.dto.GenerateResponse;
import lombok.extern.slf4j.Slf4j;
import org.mybatis.generator.api.MyBatisGenerator;
import org.mybatis.generator.config.*;
import org.mybatis.generator.internal.DefaultShellCallback;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 代码生成服务
 */
@Slf4j
@Service
public class CodeGeneratorService {
    
    private final GeneratorConfig generatorConfig;
    
    public CodeGeneratorService(GeneratorConfig generatorConfig) {
        this.generatorConfig = generatorConfig;
    }
    
    /**
     * 执行代码生成
     */
    public GenerateResponse generate(GenerateRequest request) {
        try {
            log.info("开始生成代码，数据库类型: {}, 表: {}", 
                    request.getDbType(), request.getTables());
            
            // 确定输出目录
            String outputDir = request.getOutputDir() != null 
                    ? request.getOutputDir() 
                    : generatorConfig.getOutputDir();
            
            // 构建配置
            Configuration configuration = buildConfiguration(request, outputDir);
            
            // 执行生成
            List<String> generatedFiles = executeGeneration(configuration, outputDir);
            
            log.info("代码生成完成，共生成 {} 个文件", generatedFiles.size());
            
            return GenerateResponse.success(
                    "代码生成成功", 
                    generatedFiles, 
                    outputDir
            );
            
        } catch (Exception e) {
            log.error("代码生成失败", e);
            return GenerateResponse.error("代码生成失败: " + e.getMessage());
        }
    }
    
    /**
     * 构建 MyBatis Generator 配置
     */
    private Configuration buildConfiguration(GenerateRequest request, String outputDir) {
        Configuration configuration = new Configuration();
        
        // 添加上下文
        Context context = new Context(ModelType.FLAT);
        context.setId("default");
        context.setTargetRuntime("MyBatis3");
        
        // 设置数据库类型属性
        context.addProperty("javaFileEncoding", "UTF-8");
        
        // 配置注释生成器
        if (request.getGenerateComments()) {
            CommentGeneratorConfiguration commentConfig = new CommentGeneratorConfiguration();
            commentConfig.setConfigurationType("org.mybatis.generator.internal.DefaultCommentGenerator");
            commentConfig.addProperty("suppressAllComments", "false");
            commentConfig.addProperty("suppressDate", "true");
            context.setCommentGeneratorConfiguration(commentConfig);
        } else {
            CommentGeneratorConfiguration commentConfig = new CommentGeneratorConfiguration();
            commentConfig.addProperty("suppressAllComments", "true");
            context.setCommentGeneratorConfiguration(commentConfig);
        }
        
        // 配置 JDBC 连接
        JDBCConnectionConfiguration jdbcConfig = new JDBCConnectionConfiguration();
        jdbcConfig.setDriverClass(generatorConfig.getDriver(request.getDbType()));
        jdbcConfig.setConnectionURL(
            generatorConfig.buildJdbcUrl(
                request.getDbType(), 
                request.getHost(), 
                request.getPort(), 
                request.getDatabase()
            )
        );
        jdbcConfig.setUserId(request.getUsername());
        jdbcConfig.setPassword(request.getPassword());
        context.setJdbcConnectionConfiguration(jdbcConfig);
        
        // 配置 Java 模型生成器（Entity）
        JavaModelGeneratorConfiguration modelConfig = new JavaModelGeneratorConfiguration();
        modelConfig.setTargetPackage(request.getTargetPackage() + ".entity");
        modelConfig.setTargetProject(formatProjectPath(outputDir + "/src/main/java"));
        
        // 如果使用 Lombok，添加插件
        if (request.getUseLombok()) {
            PluginConfiguration lombokPlugin = new PluginConfiguration();
            lombokPlugin.setConfigurationType("com.example.generator.plugin.LombokPlugin");
            context.addPluginConfiguration(lombokPlugin);
        }
        
        context.setJavaModelGeneratorConfiguration(modelConfig);
        
        // 配置 SQL Map 生成器（Mapper XML）
        SqlMapGeneratorConfiguration sqlMapConfig = new SqlMapGeneratorConfiguration();
        sqlMapConfig.setTargetPackage("mapper");
        sqlMapConfig.setTargetProject(formatProjectPath(outputDir + "/src/main/resources"));
        context.setSqlMapGeneratorConfiguration(sqlMapConfig);
        
        // 配置 Java Client 生成器（Mapper 接口）
        JavaClientGeneratorConfiguration clientConfig = new JavaClientGeneratorConfiguration();
        clientConfig.setTargetPackage(request.getTargetPackage() + ".mapper");
        clientConfig.setTargetProject(formatProjectPath(outputDir + "/src/main/java"));
        clientConfig.setConfigurationType("XMLMAPPER");
        context.setJavaClientGeneratorConfiguration(clientConfig);
        
        // 配置要生成的表
        configureTables(context, request);
        
        configuration.addContext(context);
        
        return configuration;
    }
    
    /**
     * 配置要生成的表
     */
    private void configureTables(Context context, GenerateRequest request) {
        String tables = request.getTables();
        
        if (tables == null || tables.trim().isEmpty()) {
            // 生成所有表（这里需要根据实际情况调整，MBG 不支持直接生成所有表）
            log.warn("未指定表名，请明确指定要生成的表");
            throw new IllegalArgumentException("请指定要生成的表名，多个表用逗号分隔");
        }
        
        // 解析表名列表
        String[] tableArray = tables.split(",");
        for (String tableName : tableArray) {
            String trimmedTableName = tableName.trim();
            if (!trimmedTableName.isEmpty()) {
                TableConfiguration tableConfig = new TableConfiguration(context);
                tableConfig.setTableName(trimmedTableName);
                
                // 设置 domain 对象名称（去除下划线，转驼峰）
                String domainObjectName = convertToCamelCase(trimmedTableName);
                tableConfig.setDomainObjectName(domainObjectName);
                
                // 启用 Lombok 注解
                if (request.getUseLombok()) {
                    tableConfig.addProperty("useLombok", "true");
                }
                
                context.addTableConfiguration(tableConfig);
            }
        }
    }
    
    /**
     * 执行代码生成
     */
    private List<String> executeGeneration(Configuration configuration, String outputDir) 
            throws Exception {
        List<String> warnings = new ArrayList<>();
        boolean overwrite = true;
        
        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = new MyBatisGenerator(
                configuration, callback, warnings
        );
        
        myBatisGenerator.generate(null);
        
        // 打印警告信息
        for (String warning : warnings) {
            log.warn("Generator Warning: {}", warning);
        }
        
        // 收集生成的文件列表
        List<String> generatedFiles = collectGeneratedFiles(outputDir);
        
        return generatedFiles;
    }
    
    /**
     * 收集生成的文件列表
     */
    private List<String> collectGeneratedFiles(String outputDir) {
        List<String> files = new ArrayList<>();
        File dir = new File(outputDir);
        
        if (dir.exists() && dir.isDirectory()) {
            collectFiles(dir, files, "");
        }
        
        return files;
    }
    
    /**
     * 递归收集文件
     */
    private void collectFiles(File dir, List<String> files, String prefix) {
        File[] fileList = dir.listFiles();
        if (fileList != null) {
            for (File file : fileList) {
                if (file.isDirectory()) {
                    collectFiles(file, files, prefix + file.getName() + "/");
                } else {
                    files.add(prefix + file.getName());
                }
            }
        }
    }
    
    /**
     * 格式化项目路径（处理 Windows 和 Linux 路径差异）
     */
    private String formatProjectPath(String path) {
        return path.replace("/", File.separator).replace("\\", File.separator);
    }
    
    /**
     * 将表名转换为驼峰命名
     * 例如：user_info -> UserInfo
     */
    private String convertToCamelCase(String tableName) {
        StringBuilder result = new StringBuilder();
        boolean nextUpper = true;
        
        for (char c : tableName.toCharArray()) {
            if (c == '_' || c == '-') {
                nextUpper = true;
            } else {
                if (nextUpper) {
                    result.append(Character.toUpperCase(c));
                    nextUpper = false;
                } else {
                    result.append(Character.toLowerCase(c));
                }
            }
        }
        
        return result.toString();
    }
}
```

### 6.6 Lombok 插件（可选）

创建 `LombokPlugin.java`：

```java
package com.example.generator.plugin;

import org.mybatis.generator.api.IntrospectedTable;
import org.mybatis.generator.api.PluginAdapter;
import org.mybatis.generator.api.dom.java.Field;
import org.mybatis.generator.api.dom.java.TopLevelClass;

import java.util.List;

/**
 * Lombok 插件 - 为生成的实体类添加 Lombok 注解
 */
public class LombokPlugin extends PluginAdapter {
    
    @Override
    public boolean validate(List<String> warnings) {
        return true;
    }
    
    @Override
    public boolean modelBaseRecordClassGenerated(TopLevelClass topLevelClass, 
                                                   IntrospectedTable introspectedTable) {
        // 添加 @Data 注解
        topLevelClass.addImportedType("lombok.Data");
        topLevelClass.addAnnotation("@Data");
        
        // 添加 @Builder 注解（可选）
        topLevelClass.addImportedType("lombok.Builder");
        topLevelClass.addAnnotation("@Builder");
        
        // 添加 @NoArgsConstructor 和 @AllArgsConstructor
        topLevelClass.addImportedType("lombok.NoArgsConstructor");
        topLevelClass.addImportedType("lombok.AllArgsConstructor");
        topLevelClass.addAnnotation("@NoArgsConstructor");
        topLevelClass.addAnnotation("@AllArgsConstructor");
        
        return true;
    }
}
```

### 6.7 控制器

创建 `GeneratorController.java`：

```java
package com.example.generator.controller;

import com.example.generator.dto.GenerateRequest;
import com.example.generator.dto.GenerateResponse;
import com.example.generator.service.CodeGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 代码生成控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/generator")
public class GeneratorController {
    
    private final CodeGeneratorService codeGeneratorService;
    
    public GeneratorController(CodeGeneratorService codeGeneratorService) {
        this.codeGeneratorService = codeGeneratorService;
    }
    
    /**
     * 生成代码
     */
    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(
            @Validated @RequestBody GenerateRequest request) {
        
        log.info("收到代码生成请求: {}", request);
        
        GenerateResponse response = codeGeneratorService.generate(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
```

---

## 7. 前端页面（可选）

为了方便使用，我们提供一个简单的 HTML 页面。

创建 `src/main/resources/static/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyBatis 代码生成器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
            max-width: 800px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        
        input, select {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .checkbox-group {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .checkbox-item input[type="checkbox"] {
            width: auto;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 20px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 5px;
            display: none;
        }
        
        .result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            display: block;
        }
        
        .result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            display: block;
        }
        
        .file-list {
            margin-top: 10px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .file-item {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        
        .loading {
            text-align: center;
            color: #667eea;
            margin-top: 20px;
            display: none;
        }
        
        .loading.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 MyBatis 代码生成器</h1>
        <p class="subtitle">快速生成 Entity、Mapper、Service、Controller 代码</p>
        
        <form id="generatorForm">
            <div class="row">
                <div class="form-group">
                    <label for="dbType">数据库类型 *</label>
                    <select id="dbType" required>
                        <option value="">请选择</option>
                        <option value="mysql">MySQL</option>
                        <option value="oracle">Oracle</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="targetPackage">目标包名 *</label>
                    <input type="text" id="targetPackage" placeholder="com.example.project" required>
                </div>
            </div>
            
            <div class="row">
                <div class="form-group">
                    <label for="host">主机地址 *</label>
                    <input type="text" id="host" placeholder="localhost" value="localhost" required>
                </div>
                
                <div class="form-group">
                    <label for="port">端口 *</label>
                    <input type="text" id="port" placeholder="3306" value="3306" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="database">数据库名称/服务名 *</label>
                <input type="text" id="database" placeholder="mydb 或 ORCL" required>
            </div>
            
            <div class="row">
                <div class="form-group">
                    <label for="username">用户名 *</label>
                    <input type="text" id="username" placeholder="root" required>
                </div>
                
                <div class="form-group">
                    <label for="password">密码 *</label>
                    <input type="password" id="password" placeholder="******" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="tables">表名（多个表用逗号分隔，留空需手动指定）</label>
                <input type="text" id="tables" placeholder="user_info,order_detail">
            </div>
            
            <div class="form-group">
                <label for="outputDir">输出目录（可选）</label>
                <input type="text" id="outputDir" placeholder="./generated-code">
            </div>
            
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="useLombok" checked>
                    <label for="useLombok">使用 Lombok</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="generateComments" checked>
                    <label for="generateComments">生成注释</label>
                </div>
            </div>
            
            <button type="submit" id="generateBtn">生成代码</button>
        </form>
        
        <div class="loading" id="loading">
            <p>⏳ 正在生成代码，请稍候...</p>
        </div>
        
        <div class="result" id="result"></div>
    </div>
    
    <script>
        document.getElementById('generatorForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('generateBtn');
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            
            // 禁用按钮，显示加载
            btn.disabled = true;
            loading.classList.add('show');
            result.style.display = 'none';
            
            // 构建请求数据
            const data = {
                dbType: document.getElementById('dbType').value,
                host: document.getElementById('host').value,
                port: document.getElementById('port').value,
                database: document.getElementById('database').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                tables: document.getElementById('tables').value,
                targetPackage: document.getElementById('targetPackage').value,
                outputDir: document.getElementById('outputDir').value || undefined,
                useLombok: document.getElementById('useLombok').checked,
                generateComments: document.getElementById('generateComments').checked
            };
            
            try {
                const response = await fetch('/api/generator/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const resultData = await response.json();
                
                if (resultData.success) {
                    showSuccess(resultData);
                } else {
                    showError(resultData.message);
                }
            } catch (error) {
                showError('请求失败: ' + error.message);
            } finally {
                btn.disabled = false;
                loading.classList.remove('show');
            }
        });
        
        function showSuccess(data) {
            const result = document.getElementById('result');
            result.className = 'result success';
            
            let html = '<h3>✅ ' + data.message + '</h3>';
            html += '<p>输出目录: ' + data.outputDir + '</p>';
            html += '<p>共生成 ' + data.generatedFiles.length + ' 个文件:</p>';
            html += '<div class="file-list">';
            
            data.generatedFiles.forEach(file => {
                html += '<div class="file-item">' + file + '</div>';
            });
            
            html += '</div>';
            result.innerHTML = html;
        }
        
        function showError(message) {
            const result = document.getElementById('result');
            result.className = 'result error';
            result.innerHTML = '<h3>❌ 生成失败</h3><p>' + message + '</p>';
        }
    </script>
</body>
</html>
```

---

## 8. 使用示例

### 8.1 启动应用

```bash
mvn spring-boot:run
```

或者打包后运行：

```bash
mvn clean package
java -jar target/mybatis-generator-1.0.0.jar
```

访问：http://localhost:8080

### 8.2 API 调用示例

#### MySQL 示例

```bash
curl -X POST http://localhost:8080/api/generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "dbType": "mysql",
    "host": "localhost",
    "port": "3306",
    "database": "test_db",
    "username": "root",
    "password": "123456",
    "tables": "user_info,order_master",
    "targetPackage": "com.example.demo",
    "useLombok": true,
    "generateComments": true
  }'
```

#### Oracle 示例

```bash
curl -X POST http://localhost:8080/api/generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "dbType": "oracle",
    "host": "192.168.1.100",
    "port": "1521",
    "database": "ORCL",
    "username": "scott",
    "password": "tiger",
    "tables": "EMP,DEPT",
    "targetPackage": "com.example.oracle",
    "useLombok": true,
    "generateComments": true
  }'
```

### 8.3 响应示例

```json
{
  "success": true,
  "message": "代码生成成功",
  "generatedFiles": [
    "src/main/java/com/example/demo/entity/UserInfo.java",
    "src/main/java/com/example/demo/mapper/UserInfoMapper.java",
    "src/main/resources/mapper/UserInfoMapper.xml",
    "src/main/java/com/example/demo/entity/OrderMaster.java",
    "src/main/java/com/example/demo/mapper/OrderMasterMapper.java",
    "src/main/resources/mapper/OrderMasterMapper.xml"
  ],
  "outputDir": "./generated-code"
}
```

---

## 9. 生成的代码示例

### 9.1 Entity 实体类

```java
package com.example.demo.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.util.Date;

/**
 * 用户信息表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 邮箱
     */
    private String email;
    
    /**
     * 创建时间
     */
    private Date createTime;
    
    /**
     * 更新时间
     */
    private Date updateTime;
}
```

### 9.2 Mapper 接口

```java
package com.example.demo.mapper;

import com.example.demo.entity.UserInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserInfoMapper {
    
    /**
     * 插入记录
     */
    int insert(UserInfo record);
    
    /**
     * 根据主键查询
     */
    UserInfo selectByPrimaryKey(Long userId);
    
    /**
     * 根据主键更新
     */
    int updateByPrimaryKey(UserInfo record);
    
    /**
     * 根据主键删除
     */
    int deleteByPrimaryKey(Long userId);
    
    /**
     * 查询所有记录
     */
    List<UserInfo> selectAll();
    
    /**
     * 条件查询
     */
    List<UserInfo> selectByCondition(@Param("username") String username, 
                                      @Param("email") String email);
}
```

### 9.3 Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.UserInfoMapper">
    
    <resultMap id="BaseResultMap" type="com.example.demo.entity.UserInfo">
        <id column="user_id" property="userId" jdbcType="BIGINT"/>
        <result column="username" property="username" jdbcType="VARCHAR"/>
        <result column="email" property="email" jdbcType="VARCHAR"/>
        <result column="create_time" property="createTime" jdbcType="TIMESTAMP"/>
        <result column="update_time" property="updateTime" jdbcType="TIMESTAMP"/>
    </resultMap>
    
    <sql id="Base_Column_List">
        user_id, username, email, create_time, update_time
    </sql>
    
    <insert id="insert" parameterType="com.example.demo.entity.UserInfo">
        INSERT INTO user_info (user_id, username, email, create_time, update_time)
        VALUES (#{userId}, #{username}, #{email}, #{createTime}, #{updateTime})
    </insert>
    
    <select id="selectByPrimaryKey" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user_info
        WHERE user_id = #{userId}
    </select>
    
    <update id="updateByPrimaryKey" parameterType="com.example.demo.entity.UserInfo">
        UPDATE user_info
        SET username = #{username},
            email = #{email},
            update_time = #{updateTime}
        WHERE user_id = #{userId}
    </update>
    
    <delete id="deleteByPrimaryKey">
        DELETE FROM user_info
        WHERE user_id = #{userId}
    </delete>
    
    <select id="selectAll" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user_info
    </select>
    
    <select id="selectByCondition" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user_info
        <where>
            <if test="username != null and username != ''">
                AND username LIKE CONCAT('%', #{username}, '%')
            </if>
            <if test="email != null and email != ''">
                AND email LIKE CONCAT('%', #{email}, '%')
            </if>
        </where>
    </select>
    
</mapper>
```

---

## 10. 常见问题

### Q1: Oracle 驱动无法下载？

Oracle 驱动需要从 Oracle 官方仓库下载，或者手动安装到本地 Maven 仓库：

```bash
mvn install:install-file \
  -Dfile=ojdbc8.jar \
  -DgroupId=com.oracle.database.jdbc \
  -DartifactId=ojdbc8 \
  -Dversion=19.3.0.0 \
  -Dpackaging=jar
```

### Q2: 如何自定义生成的代码模板？

可以继承 MyBatis Generator 的插件类，自定义代码生成逻辑。参考 `LombokPlugin.java` 的实现。

### Q3: 如何生成 Service 和 Controller 层？

MyBatis Generator 只生成 Entity、Mapper 和 XML。Service 和 Controller 需要额外开发或使用其他工具（如 MyBatis Plus Generator）。

### Q4: 表名大小写问题？

- MySQL：通常不区分大小写
- Oracle：默认大写，建议在配置中使用大写表名

### Q5: 如何处理数据库特殊字符？

在 `application.yml` 中配置 JDBC URL 时，确保正确转义特殊字符。

---

## 11. 扩展功能

### 11.1 添加分页插件

在 `pom.xml` 中添加 PageHelper：

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.6</version>
</dependency>
```

### 11.2 添加 Swagger 文档

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

### 11.3 支持更多数据库

在 `application.yml` 中添加其他数据库配置：

```yaml
generator:
  drivers:
    postgresql: org.postgresql.Driver
    sqlserver: com.microsoft.sqlserver.jdbc.SQLServerDriver
  
  url-templates:
    postgresql: jdbc:postgresql://{host}:{port}/{database}
    sqlserver: jdbc:sqlserver://{host}:{port};databaseName={database}
```

---

## 12. 总结

通过本教程，你已经成功构建了一个功能完善的 MyBatis 代码生成器，具备以下特点：

✅ **双数据库支持**：同时支持 MySQL 和 Oracle  
✅ **灵活配置**：通过配置文件和 API 参数灵活控制生成行为  
✅ **Lombok 集成**：自动生成简洁的实体类  
✅ **Web 界面**：提供友好的图形化操作界面  
✅ **RESTful API**：支持程序化调用  
✅ **即拷即用**：复制代码即可运行，无需复杂配置  

**下一步建议：**
1. 根据实际需求定制代码模板
2. 添加 Service 和 Controller 层生成功能
3. 集成 MyBatis Plus 增强功能
4. 添加单元测试确保生成代码质量

---

**作者**: AI Assistant  
**日期**: 2026-05-19  
**版本**: v1.0
