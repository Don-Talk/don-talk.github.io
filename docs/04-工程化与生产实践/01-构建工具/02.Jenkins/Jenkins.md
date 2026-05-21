# Jenkins CI/CD 完全指南

## 一、Jenkins 概述

### 1.1 什么是 Jenkins？

Jenkins 是一个开源的自动化服务器，用于持续集成和持续交付（CI/CD）。

**核心功能：**
- 自动化构建
- 自动化测试
- 自动化部署
- 插件生态系统（1500+ 插件）

### 1.2 为什么选择 Jenkins？

| 优势 | 说明 |
|------|------|
| 开源免费 | 社区活跃，持续更新 |
| 插件丰富 | 支持各种工具和平台 |
| 跨平台 | Windows、Linux、macOS |
| 分布式构建 | Master-Slave 架构 |
| 灵活配置 | Web界面 + Pipeline代码 |

---

## 二、安装部署

### 2.1 Ubuntu 24.04 安装

#### 步骤1：系统准备

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装 Java（Jenkins 依赖）
sudo apt install openjdk-17-jre -y

# 验证 Java
java -version
```

#### 步骤2：添加 Jenkins 仓库

```bash
# 下载并导入 Jenkins GPG key
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# 添加 Jenkins 软件源
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```

#### 步骤3：安装 Jenkins

```bash
# 更新包索引
sudo apt update

# 安装 Jenkins
sudo apt install jenkins -y

# 启动 Jenkins
sudo systemctl start jenkins

# 设置开机自启
sudo systemctl enable jenkins

# 检查状态
sudo systemctl status jenkins
```

#### 步骤4：配置防火墙

```bash
# 如果使用 UFW 防火墙
sudo ufw allow 8080/tcp
sudo ufw reload

# 查看防火墙状态
sudo ufw status
```

### 2.2 Docker 安装（推荐）

```bash
# 拉取 Jenkins LTS 镜像
docker pull jenkins/jenkins:lts-jdk17

# 创建数据目录
mkdir -p /var/jenkins_home
sudo chown -R 1000:1000 /var/jenkins_home

# 运行容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17

# 查看日志
docker logs -f jenkins
```

### 2.3 更改默认端口

```bash
# 编辑配置文件
sudo nano /etc/default/jenkins

# 修改端口
HTTP_PORT=8081

# 重启服务
sudo systemctl restart jenkins
```

---

## 三、初始配置

### 3.1 获取管理员密码

```bash
# 查看初始管理员密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Docker 方式
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3.2 访问 Jenkins

浏览器访问：`http://你的服务器IP:8080`

**安装向导：**
1. 输入初始密码
2. 选择"安装推荐插件"
3. 创建管理员账户
4. 配置实例 URL
5. 开始使用

### 3.3 安装必要插件

**推荐插件：**
- Git Plugin
- GitHub Integration
- Docker Plugin
- Pipeline
- Blue Ocean
- Role-based Authorization Strategy
- Email Extension
- Slack Notification

**安装方法：**
```
Manage Jenkins → Manage Plugins → Available
搜索插件名称 → 勾选 → Install without restart
```

---

## 四、基础概念

### 4.1 核心术语

| 术语 | 说明 |
|------|------|
| Job/Project | 构建任务 |
| Build | 一次构建执行 |
| Workspace | 工作空间 |
| Node | 节点（Master/Slave） |
| Plugin | 插件 |
| Pipeline | 流水线 |

### 4.2 Jenkins 架构

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────┐
│   Master    │ ← 调度、管理、UI
└──────┬──────┘
       │
┌──────▼──────┐     ┌──────────┐
│  Agent 1    │     │ Agent 2  │ ← 执行构建
└─────────────┘     └──────────┘
```

---

## 五、创建第一个 Job

### 5.1 Freestyle Project

**步骤：**
1. New Item → 输入名称 → 选择"Freestyle project"
2. Source Code Management → Git → 输入仓库地址
3. Build Triggers → 选择触发方式
4. Build → Add build step → Execute shell
5. Apply → Save

**示例 Shell 脚本：**
```bash
#!/bin/bash
echo "Building..."
mvn clean package
echo "Build completed!"
```

### 5.2 Pipeline Project（推荐）

**步骤：**
1. New Item → 输入名称 → 选择"Pipeline"
2. Pipeline → Definition → Pipeline script
3. 编写 Pipeline 代码
4. Apply → Save

---

## 六、Pipeline 实战

### 6.1 Declarative Pipeline 基础

```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = 'my-app'
        VERSION = '1.0.0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/user/repo.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

### 6.2 Spring Boot 项目 CI/CD

```groovy
pipeline {
    agent any
    
    tools {
        maven 'Maven-3.8'
        jdk 'JDK-17'
    }
    
    environment {
        DOCKER_IMAGE = 'myapp'
        DOCKER_REGISTRY = 'registry.example.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Code Quality') {
            steps {
                sh 'mvn sonar:sonar -Dsonar.projectKey=myapp'
            }
        }
        
        stage('Build & Test') {
            steps {
                sh 'mvn clean package -DskipTests=false'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                    archiveArtifacts artifacts: 'target/*.jar', 
                                      fingerprint: true
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }
        
        stage('Docker Push') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 
                                       'docker-credentials') {
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                            .push()
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                            .push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    kubectl set image deployment/myapp \
                        myapp=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_NUMBER}
                    kubectl rollout status deployment/myapp
                '''
            }
        }
    }
    
    post {
        success {
            slackSend channel: '#deployments',
                     message: "✅ Build #${env.BUILD_NUMBER} succeeded!",
                     color: 'good'
        }
        failure {
            slackSend channel: '#deployments',
                     message: "❌ Build #${env.BUILD_NUMBER} failed!",
                     color: 'danger'
        }
    }
}
```

### 6.3 多分支 Pipeline

**Jenkinsfile 放在项目根目录：**

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'mvn test'
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        sh 'mvn verify -Pintegration-test'
                    }
                }
            }
        }
    }
}
```

**配置多分支：**
```
New Item → Multibranch Pipeline
→ Branch Sources → Git
→ 配置仓库地址
→ Scan Multibranch Pipeline Now
```

---

## 七、高级配置

### 7.1 凭证管理

**添加凭证：**
```
Manage Jenkins → Credentials → System → Global credentials
→ Add Credentials
```

**凭证类型：**
- Username with password
- SSH Username with private key
- Secret text
- Docker Host Certificate Authentication

**在 Pipeline 中使用：**
```groovy
withCredentials([usernamePassword(
    credentialsId: 'my-credentials',
    usernameVariable: 'USER',
    passwordVariable: 'PASS'
)]) {
    sh 'echo $USER:$PASS'
}
```

### 7.2 参数化构建

```groovy
pipeline {
    agent any
    
    parameters {
        string(name: 'VERSION', defaultValue: '1.0.0', 
               description: '应用版本')
        choice(name: 'ENVIRONMENT', 
               choices: ['dev', 'staging', 'prod'],
               description: '部署环境')
        booleanParam(name: 'RUN_TESTS', 
                     defaultValue: true,
                     description: '是否运行测试')
    }
    
    stages {
        stage('Build') {
            steps {
                echo "Version: ${params.VERSION}"
                echo "Environment: ${params.ENVIRONMENT}"
                
                if (params.RUN_TESTS) {
                    sh 'mvn test'
                }
            }
        }
    }
}
```

### 7.3 定时构建

```groovy
// Cron 表达式：分 时 日 月 周
triggers {
    // 每天凌晨2点
    cron('0 2 * * *')
    
    // 每15分钟
    // cron('H/15 * * * *')
    
    // 工作日晚上8点
    // cron('0 20 * * 1-5')
}
```

### 7.4 并行执行

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Chrome Tests') {
            steps {
                sh 'mvn test -Dbrowser=chrome'
            }
        }
        
        stage('Firefox Tests') {
            steps {
                sh 'mvn test -Dbrowser=firefox'
            }
        }
        
        stage('API Tests') {
            steps {
                sh 'mvn test -Dtest=ApiTest'
            }
        }
    }
}
```

---

## 八、安全配置

### 8.1 用户权限管理

**安装插件：** Role-based Authorization Strategy

**配置角色：**
```
Manage Jenkins → Security → Role-Based Strategy
```

**角色示例：**
- **admin**：所有权限
- **developer**：构建、查看
- **viewer**：只读

### 8.2 HTTPS 配置

**Nginx 反向代理：**

```nginx
server {
    listen 443 ssl;
    server_name jenkins.example.com;
    
    ssl_certificate /etc/ssl/certs/jenkins.crt;
    ssl_certificate_key /etc/ssl/private/jenkins.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.3 备份策略

```bash
#!/bin/bash
# Jenkins 备份脚本

BACKUP_DIR="/backup/jenkins"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份 Jenkins 数据
tar czf $BACKUP_DIR/jenkins_$DATE.tar.gz \
    /var/lib/jenkins/

# 保留最近7天的备份
find $BACKUP_DIR -name "jenkins_*.tar.gz" -mtime +7 -delete

echo "Backup completed: jenkins_$DATE.tar.gz"
```

**定时备份（crontab）：**
```bash
# 每天凌晨3点备份
0 3 * * * /usr/local/bin/jenkins-backup.sh
```

---

## 九、监控与维护

### 9.1 系统监控

**查看系统信息：**
```
Manage Jenkins → System Information
```

**关键指标：**
- Executor 使用情况
- 内存使用
- 磁盘空间
- 构建队列

### 9.2 日志查看

```bash
# Jenkins 主日志
sudo tail -f /var/log/jenkins/jenkins.log

# Docker 日志
docker logs -f jenkins

# 构建日志
# 在 Web UI 中查看每个 Build 的 Console Output
```

### 9.3 性能优化

**JVM 参数调优：**
```bash
# 编辑 /etc/default/jenkins
JAVA_ARGS="-Xms512m -Xmx2048m \
           -XX:MaxPermSize=256m \
           -XX:+UseG1GC"
```

**清理旧构建：**
```groovy
// 在 Pipeline 中添加
options {
    buildDiscarder(logRotator(
        numToKeepStr: '10',
        daysToKeepStr: '30'
    ))
}
```

---

## 十、常见问题

### 10.1 Jenkins 无法启动

```bash
# 检查 Java 版本
java -version

# 检查端口占用
sudo lsof -i :8080

# 查看详细错误
sudo journalctl -u jenkins -f

# 检查权限
sudo ls -la /var/lib/jenkins/
```

### 10.2 构建失败排查

**检查清单：**
1. 查看 Console Output
2. 检查工作空间权限
3. 验证凭证配置
4. 检查网络连接
5. 查看系统日志

### 10.3 插件冲突

```bash
# 禁用问题插件
sudo systemctl stop jenkins
sudo mv /var/lib/jenkins/plugins/problem-plugin.jpi \
        /var/lib/jenkins/plugins/problem-plugin.jpi.bak
sudo systemctl start jenkins
```

---

## 十一、最佳实践

### 11.1 Pipeline 最佳实践

1. **使用声明式 Pipeline**
   - 更易读
   - 更好的错误提示
   - 内置验证

2. **代码复用**
   ```groovy
   // 共享库
   @Library('my-shared-library') _
   
   pipeline {
       // ...
   }
   ```

3. **环境变量管理**
   - 使用 `environment` 块
   - 敏感信息用 Credentials
   - 避免硬编码

4. **错误处理**
   ```groovy
   post {
       always {
           // 清理操作
       }
       success {
           // 成功通知
       }
       failure {
           // 失败告警
       }
   }
   ```

### 11.2 安全最佳实践

- ✅ 启用 HTTPS
- ✅ 定期更新 Jenkins 和插件
- ✅ 最小权限原则
- ✅ 定期备份
- ✅ 审计日志
- ❌ 不要暴露到公网
- ❌ 不要使用默认密码
- ❌ 不要在代码中存储凭证

### 11.3 性能最佳实践

- 使用 Agent 分布式构建
- 限制并发构建数
- 定期清理旧数据
- 监控资源使用
- 优化 Pipeline 执行时间

---

## 十二、总结

### 核心要点

1. **安装部署**
   - Ubuntu/Docker 两种方式
   - 配置防火墙和端口
   - 设置开机自启

2. **基础配置**
   - 安装必要插件
   - 配置凭证管理
   - 设置用户权限

3. **Pipeline 开发**
   - 声明式语法
   - 多阶段构建
   - 并行执行
   - 错误处理

4. **运维管理**
   - 监控日志
   - 定期备份
   - 性能优化
   - 安全加固

### 学习资源

- 📖 官方文档：https://www.jenkins.io/doc/
- 🎓 在线课程：Jenkins Certified Engineer
- 💬 社区论坛：https://community.jenkins.io/
- 📦 插件中心：https://plugins.jenkins.io/

掌握 Jenkins 是实现自动化 DevOps 的关键技能！🚀