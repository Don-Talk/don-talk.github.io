# Python日志精简自动化工具教程

## 概述

本教程提供一套基于Python的日志精简自动化工具，帮助快速识别和优化Java项目中的不规范日志代码。

**环境要求：**
- Python 3.6+
- 无需额外安装第三方库（使用标准库）

---

## 工具清单

### 1. 日志代码扫描器 (`scan_log_issues.py`)

**功能：** 扫描Java源代码，找出不规范的日志写法

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
日志代码扫描器 - 扫描Java项目中的不规范日志写法
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict


class LogIssueScanner:
    """日志问题扫描器"""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.issues = []
        self.stats = defaultdict(int)
        
        # 定义问题模式
        self.patterns = {
            'string_concat': {
                'pattern': r'log\.(debug|info|warn|error)\s*\(\s*"[^"]*"\s*\+',
                'description': '字符串拼接日志',
                'severity': 'MEDIUM'
            },
            'stack_trace_abuse': {
                'pattern': r'log\.(error|warn)\s*\([^,]+,\s*\w+\s*\)',
                'description': '可能滥用堆栈信息',
                'severity': 'HIGH'
            },
            'print_stacktrace': {
                'pattern': r'\w+\.printStackTrace\s*\(\s*\)',
                'description': '使用printStackTrace',
                'severity': 'HIGH'
            },
            'loop_logging': {
                'pattern': r'(for|while)\s*\(.*\)\s*\{[^}]*log\.',
                'description': '循环内打印日志',
                'severity': 'MEDIUM'
            },
            'large_object_log': {
                'pattern': r'log\.\w+\s*\([^)]*(List|Map|Set|Collection)[^)]*\)',
                'description': '可能打印大对象',
                'severity': 'LOW'
            }
        }
    
    def scan_file(self, file_path):
        """扫描单个Java文件"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                
            for line_num, line in enumerate(lines, 1):
                for issue_type, config in self.patterns.items():
                    if re.search(config['pattern'], line):
                        issue = {
                            'file': str(file_path.relative_to(self.project_root)),
                            'line': line_num,
                            'type': issue_type,
                            'description': config['description'],
                            'severity': config['severity'],
                            'content': line.strip()
                        }
                        self.issues.append(issue)
                        self.stats[issue_type] += 1
        except Exception as e:
            print(f"扫描文件失败 {file_path}: {e}")
    
    def scan_directory(self):
        """扫描整个项目目录"""
        java_files = list(self.project_root.rglob('*.java'))
        total = len(java_files)
        
        print(f"开始扫描 {total} 个Java文件...")
        
        for i, java_file in enumerate(java_files, 1):
            if i % 100 == 0:
                print(f"进度: {i}/{total}")
            self.scan_file(java_file)
        
        print(f"扫描完成！共发现 {len(self.issues)} 个问题")
    
    def generate_report(self, output_file='log_issues_report.txt'):
        """生成扫描报告"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("日志代码扫描报告\n")
            f.write("=" * 80 + "\n\n")
            
            # 统计摘要
            f.write("【问题统计】\n")
            f.write("-" * 80 + "\n")
            for issue_type, count in sorted(self.stats.items(), key=lambda x: x[1], reverse=True):
                f.write(f"{issue_type:30s}: {count:5d}\n")
            f.write(f"{'总计':30s}: {len(self.issues):5d}\n\n")
            
            # 详细问题列表
            f.write("【详细问题列表】\n")
            f.write("-" * 80 + "\n")
            
            # 按严重程度排序
            severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
            sorted_issues = sorted(self.issues, key=lambda x: severity_order.get(x['severity'], 3))
            
            for issue in sorted_issues:
                f.write(f"\n[{issue['severity']}] {issue['type']}\n")
                f.write(f"  文件: {issue['file']}\n")
                f.write(f"  行号: {issue['line']}\n")
                f.write(f"  描述: {issue['description']}\n")
                f.write(f"  代码: {issue['content'][:100]}\n")
        
        print(f"报告已保存到: {output_file}")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python scan_log_issues.py <项目根目录>")
        print("示例: python scan_log_issues.py D:/Codes/My/finance-project")
        sys.exit(1)
    
    project_root = sys.argv[1]
    
    if not os.path.exists(project_root):
        print(f"错误: 目录不存在 - {project_root}")
        sys.exit(1)
    
    scanner = LogIssueScanner(project_root)
    scanner.scan_directory()
    scanner.generate_report()
    
    # 打印摘要
    print("\n【问题摘要】")
    for issue_type, count in sorted(scanner.stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {issue_type}: {count}")


if __name__ == '__main__':
    main()
```

**使用方法：**
```bash
python scan_log_issues.py D:/Codes/My/finance-project
```

---

### 2. 日志文件分析器 (`analyze_log_files.py`)

**功能：** 分析现有日志文件，统计日志量分布

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
日志文件分析器 - 分析日志文件的体积和分布
"""

import os
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime


class LogFileAnalyzer:
    """日志文件分析器"""
    
    def __init__(self, log_directory):
        self.log_directory = Path(log_directory)
        self.file_stats = []
        self.module_stats = defaultdict(lambda: {'count': 0, 'size': 0})
    
    def analyze_directory(self):
        """分析日志目录"""
        log_files = list(self.log_directory.rglob('*.log'))
        
        if not log_files:
            print(f"警告: 在 {self.log_directory} 下未找到.log文件")
            return
        
        print(f"开始分析 {len(log_files)} 个日志文件...")
        
        for log_file in log_files:
            try:
                stat = log_file.stat()
                size_mb = stat.st_size / (1024 * 1024)
                
                file_info = {
                    'path': log_file,
                    'size_bytes': stat.st_size,
                    'size_mb': size_mb,
                    'modified_time': datetime.fromtimestamp(stat.st_mtime)
                }
                
                self.file_stats.append(file_info)
                
                # 按模块统计（根据文件名或路径提取模块名）
                module_name = self._extract_module_name(log_file)
                self.module_stats[module_name]['count'] += 1
                self.module_stats[module_name]['size'] += stat.st_size
                
            except Exception as e:
                print(f"分析文件失败 {log_file}: {e}")
        
        print(f"分析完成！总文件大小: {self._format_size(sum(f['size_bytes'] for f in self.file_stats))}")
    
    def _extract_module_name(self, log_file):
        """从日志文件路径提取模块名"""
        # 简单策略：取文件名或父目录名
        parts = log_file.parts
        if len(parts) >= 2:
            return parts[-2]  # 返回父目录名作为模块名
        return log_file.stem
    
    def _format_size(self, size_bytes):
        """格式化文件大小"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
    
    def generate_report(self, output_file='log_analysis_report.txt'):
        """生成分析报告"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("日志文件分析报告\n")
            f.write("=" * 80 + "\n\n")
            
            # 总体统计
            total_size = sum(f['size_bytes'] for f in self.file_stats)
            f.write("【总体统计】\n")
            f.write("-" * 80 + "\n")
            f.write(f"日志文件总数: {len(self.file_stats)}\n")
            f.write(f"总文件大小: {self._format_size(total_size)}\n\n")
            
            # 最大的20个文件
            f.write("【最大的20个日志文件】\n")
            f.write("-" * 80 + "\n")
            sorted_files = sorted(self.file_stats, key=lambda x: x['size_bytes'], reverse=True)[:20]
            
            f.write(f"{'排名':<6}{'文件大小':<15}{'修改时间':<25}{'文件路径'}\n")
            for i, file_info in enumerate(sorted_files, 1):
                f.write(f"{i:<6}{self._format_size(file_info['size_bytes']):<15}"
                       f"{file_info['modified_time'].strftime('%Y-%m-%d %H:%M:%S'):<25}"
                       f"{file_info['path']}\n")
            
            f.write("\n")
            
            # 按模块统计
            f.write("【按模块统计】\n")
            f.write("-" * 80 + "\n")
            sorted_modules = sorted(self.module_stats.items(), 
                                   key=lambda x: x[1]['size'], reverse=True)
            
            f.write(f"{'模块名':<30}{'文件数':<10}{'总大小':<15}{'占比':<10}\n")
            for module_name, stats in sorted_modules:
                percentage = (stats['size'] / total_size * 100) if total_size > 0 else 0
                f.write(f"{module_name:<30}{stats['count']:<10}"
                       f"{self._format_size(stats['size']):<15}{percentage:.2f}%\n")
        
        print(f"报告已保存到: {output_file}")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python analyze_log_files.py <日志目录>")
        print("示例: python analyze_log_files.py D:/logs/finance")
        sys.exit(1)
    
    log_directory = sys.argv[1]
    
    if not os.path.exists(log_directory):
        print(f"错误: 目录不存在 - {log_directory}")
        sys.exit(1)
    
    analyzer = LogFileAnalyzer(log_directory)
    analyzer.analyze_directory()
    analyzer.generate_report()


if __name__ == '__main__':
    main()
```

**使用方法：**
```bash
python analyze_log_files.py D:/logs/finance
```

---

### 3. 批量修复工具 (`batch_fix_logs.py`)

**功能：** 自动修复常见的日志问题（使用前请备份代码！）

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量日志修复工具 - 自动修复常见的日志问题
注意：使用前请务必备份代码！
"""

import os
import re
import sys
from pathlib import Path
import shutil


class LogFixer:
    """日志修复器"""
    
    def __init__(self, project_root, dry_run=True):
        self.project_root = Path(project_root)
        self.dry_run = dry_run  # 默认只预览，不实际修改
        self.fix_count = 0
        self.backup_dir = None
    
    def create_backup(self):
        """创建备份目录"""
        if not self.dry_run:
            self.backup_dir = self.project_root.parent / f"{self.project_root.name}_backup"
            if not self.backup_dir.exists():
                shutil.copytree(self.project_root, self.backup_dir)
                print(f"已创建备份: {self.backup_dir}")
    
    def fix_string_concat(self, file_path):
        """修复字符串拼接日志"""
        modified = False
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 匹配 log.info("xxx" + var + "yyy")
            pattern = r'log\.(\w+)\s*\(\s*"([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"'
            
            def replace_func(match):
                level = match.group(1)
                part1 = match.group(2)
                var = match.group(3)
                part2 = match.group(4)
                return f'log.{level}("{part1}{{}}{part2}", {var})'
            
            content = re.sub(pattern, replace_func, content)
            
            if content != original_content:
                modified = True
                if not self.dry_run:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                self.fix_count += 1
                
        except Exception as e:
            print(f"处理文件失败 {file_path}: {e}")
        
        return modified
    
    def fix_print_stacktrace(self, file_path):
        """修复printStackTrace为日志输出"""
        modified = False
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if '.printStackTrace()' in line:
                    # 简单替换，实际情况可能需要更复杂的逻辑
                    indent = len(line) - len(line.lstrip())
                    new_lines.append(' ' * indent + 'log.error("Exception occurred", e);\n')
                    modified = True
                    self.fix_count += 1
                else:
                    new_lines.append(line)
            
            if modified and not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                    
        except Exception as e:
            print(f"处理文件失败 {file_path}: {e}")
        
        return modified
    
    def process_directory(self):
        """处理整个项目目录"""
        java_files = list(self.project_root.rglob('*.java'))
        total = len(java_files)
        
        print(f"{'【预览模式】' if self.dry_run else '【修复模式】'}")
        print(f"开始处理 {total} 个Java文件...")
        
        for i, java_file in enumerate(java_files, 1):
            if i % 100 == 0:
                print(f"进度: {i}/{total}, 已修复: {self.fix_count}")
            
            self.fix_string_concat(java_file)
            self.fix_print_stacktrace(java_file)
        
        print(f"处理完成！共修复 {self.fix_count} 处问题")
    
    def generate_report(self, output_file='fix_report.txt'):
        """生成修复报告"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("日志修复报告\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"模式: {'预览（未实际修改）' if self.dry_run else '修复（已修改）'}\n")
            f.write(f"修复数量: {self.fix_count}\n")
            if self.backup_dir:
                f.write(f"备份位置: {self.backup_dir}\n")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python batch_fix_logs.py <项目根目录> [--apply]")
        print("说明: 默认只预览，添加 --apply 参数才会实际修改文件")
        print("示例: python batch_fix_logs.py D:/Codes/My/finance-project --apply")
        sys.exit(1)
    
    project_root = sys.argv[1]
    apply_mode = '--apply' in sys.argv
    
    if not os.path.exists(project_root):
        print(f"错误: 目录不存在 - {project_root}")
        sys.exit(1)
    
    fixer = LogFixer(project_root, dry_run=not apply_mode)
    
    if not apply_mode:
        print("\n⚠️  当前为预览模式，不会修改任何文件")
        print("   确认无误后，请添加 --apply 参数执行实际修复\n")
    else:
        print("\n⚠️  即将执行实际修复，正在创建备份...")
        fixer.create_backup()
    
    fixer.process_directory()
    fixer.generate_report()


if __name__ == '__main__':
    main()
```

**使用方法：**
```bash
# 预览模式（推荐先用此模式查看会修改哪些地方）
python batch_fix_logs.py D:/Codes/My/finance-project

# 实际修复模式（会自动创建备份）
python batch_fix_logs.py D:/Codes/My/finance-project --apply
```

---

### 4. 配置检查工具 (`check_log_config.py`)

**功能：** 检查logback.xml/log4j2.xml配置文件

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
日志配置检查工具 - 检查logback.xml或log4j2.xml配置
"""

import os
import sys
import re
from pathlib import Path
import xml.etree.ElementTree as ET


class LogConfigChecker:
    """日志配置检查器"""
    
    def __init__(self, config_file):
        self.config_file = Path(config_file)
        self.issues = []
    
    def check_config(self):
        """检查配置文件"""
        if not self.config_file.exists():
            print(f"错误: 配置文件不存在 - {self.config_file}")
            return
        
        print(f"检查配置文件: {self.config_file}")
        
        try:
            tree = ET.parse(self.config_file)
            root = tree.getroot()
            
            # 检查root日志级别
            self._check_root_level(root)
            
            # 检查各个logger配置
            self._check_loggers(root)
            
            # 检查appender配置
            self._check_appenders(root)
            
        except ET.ParseError as e:
            print(f"XML解析错误: {e}")
            # 尝试用正则表达式进行基本检查
            self._regex_check()
    
    def _check_root_level(self, root):
        """检查root日志级别"""
        # 查找root元素
        root_elem = root.find('.//root') or root.find('.//{*}root')
        
        if root_elem is not None:
            level_elem = root_elem.find('level') or root_elem.find('{*}level')
            if level_elem is not None:
                level = level_elem.get('value', '').upper()
                
                if level in ['DEBUG', 'TRACE', 'ALL']:
                    self.issues.append({
                        'type': 'ROOT_LEVEL_TOO_LOW',
                        'severity': 'HIGH',
                        'message': f'Root日志级别设置为 {level}，生产环境建议设置为 WARN 或 ERROR'
                    })
    
    def _check_loggers(self, root):
        """检查logger配置"""
        # 查找所有logger元素
        logger_elems = root.findall('.//logger') or root.findall('.//{*}logger')
        
        for logger in logger_elems:
            name = logger.get('name', '')
            level_elem = logger.find('level') or logger.find('{*}level')
            
            if level_elem is not None:
                level = level_elem.get('value', '').upper()
                
                # 检查框架包的日志级别
                framework_packages = ['org.springframework', 'org.mybatis', 'com.ibatis']
                for pkg in framework_packages:
                    if name.startswith(pkg) and level in ['DEBUG', 'TRACE']:
                        self.issues.append({
                            'type': 'FRAMEWORK_DEBUG_ENABLED',
                            'severity': 'MEDIUM',
                            'message': f'框架包 {name} 开启了 {level} 级别日志，建议设置为 WARN'
                        })
    
    def _check_appenders(self, root):
        """检查appender配置"""
        # 检查是否有异步appender
        appenders = root.findall('.//appender') or root.findall('.//{*}appender')
        
        has_async = False
        for appender in appenders:
            class_name = appender.get('class', '')
            if 'AsyncAppender' in class_name:
                has_async = True
                break
        
        if not has_async:
            self.issues.append({
                'type': 'NO_ASYNC_APPENDER',
                'severity': 'LOW',
                'message': '未使用异步Appender，建议配置AsyncAppender提升性能'
            })
    
    def _regex_check(self):
        """使用正则表达式进行基本检查（备用方案）"""
        with open(self.config_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查root级别
        if re.search(r'<root[^>]*>.*?<level\s+value=["\'](DEBUG|TRACE)["\']', content, re.DOTALL):
            self.issues.append({
                'type': 'ROOT_LEVEL_TOO_LOW',
                'severity': 'HIGH',
                'message': 'Root日志级别可能设置为DEBUG或TRACE'
            })
    
    def generate_report(self, output_file='config_check_report.txt'):
        """生成检查报告"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("日志配置检查报告\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"配置文件: {self.config_file}\n\n")
            
            if not self.issues:
                f.write("✅ 未发现明显问题\n")
            else:
                f.write(f"发现 {len(self.issues)} 个问题:\n\n")
                
                # 按严重程度排序
                severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
                sorted_issues = sorted(self.issues, 
                                      key=lambda x: severity_order.get(x['severity'], 3))
                
                for issue in sorted_issues:
                    f.write(f"[{issue['severity']}] {issue['type']}\n")
                    f.write(f"  {issue['message']}\n\n")
        
        print(f"报告已保存到: {output_file}")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python check_log_config.py <配置文件路径>")
        print("示例: python check_log_config.py src/main/resources/logback.xml")
        sys.exit(1)
    
    config_file = sys.argv[1]
    
    checker = LogConfigChecker(config_file)
    checker.check_config()
    checker.generate_report()
    
    # 打印摘要
    if checker.issues:
        print(f"\n发现 {len(checker.issues)} 个问题，详见报告")
    else:
        print("\n✅ 未发现明显问题")


if __name__ == '__main__':
    main()
```

**使用方法：**
```bash
python check_log_config.py src/main/resources/logback.xml
```

---

## 完整使用流程

### 步骤1：扫描代码问题
```bash
python scan_log_issues.py D:/Codes/My/finance-project
```
查看生成的 `log_issues_report.txt`，了解存在哪些问题。

### 步骤2：分析日志文件
```bash
python analyze_log_files.py D:/logs/finance
```
查看 `log_analysis_report.txt`，找出日志量最大的模块。

### 步骤3：检查配置文件
```bash
python check_log_config.py src/main/resources/logback.xml
```
查看 `config_check_report.txt`，优化日志配置。

### 步骤4：预览修复效果
```bash
python batch_fix_logs.py D:/Codes/My/finance-project
```
查看会修改哪些地方，确认无误后再执行实际修复。

### 步骤5：执行实际修复（可选）
```bash
python batch_fix_logs.py D:/Codes/My/finance-project --apply
```
会自动创建备份并修复问题。

---

## 注意事项

1. **备份重要**：执行批量修复前务必备份代码
2. **人工审查**：自动修复后需要人工审查关键代码
3. **测试验证**：修复后必须在测试环境充分验证
4. **分步执行**：建议先修复简单问题，再处理复杂问题
5. **保留堆栈**：系统错误和未预期异常应保留完整堆栈信息

---

## 扩展建议

1. **集成到CI/CD**：将扫描脚本集成到Jenkins，每次构建时检查日志规范
2. **定期执行**：设置定时任务，每周扫描一次代码
3. **自定义规则**：根据项目特点添加更多的检查规则
4. **生成HTML报告**：可以使用Jinja2模板生成更美观的HTML报告

---

**文档版本**：v1.0  
**创建日期**：2026-05-12  
**适用Python版本**：3.6+
