# 博客系统实战项目 - 完整教程

## 📚 项目导航

### 第一阶段: 需求与设计 ✅
- [01.需求分析与系统设计](./01.需求分析与系统设计.md) - 功能需求、技术选型、数据库设计、API规范

### 第二阶段: 基础搭建 ✅
- [02.项目初始化与基础配置](./02.项目初始化与基础配置.md) - Spring Boot项目、统一响应、异常处理
- [03.框架配置详解](./03.框架配置详解.md) - MyBatis-Plus、Swagger、Redis、Security配置

### 第三阶段: 核心模块开发 ✅
- [04.用户模块开发](./04.用户模块开发.md) - 注册、登录、JWT认证 ✅
- [05.文章模块开发](./05.文章模块开发.md) - CRUD、分页、搜索 ✅
- [06.分类标签模块开发](./06.分类标签模块开发.md) - 分类管理、标签管理 ✅
- [07.评论系统模块开发](./07.评论系统模块开发.md) - 发表评论、回复、点赞 ✅
- [08.文件上传模块开发](./08.文件上传模块开发.md) - 图片上传、OSS存储 ✅

### 第四阶段: 前端开发
- ⏳ 09.Vue项目搭建 - 前端环境、路由、状态管理
- ⏳ 10.页面组件开发 - 首页、文章页、后台管理
- ⏳ 11.API对接 - Axios封装、接口调用

### 第五阶段: 部署上线
- ⏳ 12.Docker容器化 - Dockerfile、docker-compose
- ⏳ 13.Nginx配置 - 反向代理、负载均衡
- ⏳ 14.性能优化 - 缓存策略、SQL优化

---

## 📊 项目完成度

| 阶段 | 进度 | 文档数 | 代码行数 |
|------|------|--------|----------|
| 需求与设计 | ✅ 100% | 1 | 501 |
| 基础搭建 | ✅ 100% | 2 | 1,582 |
| 核心模块开发 | ✅ 100% | 5 | 4,640 |
| 前端开发 | ⏳ 0% | 0 | 0 |
| 部署运维 | ⏳ 0% | 0 | 0 |
| **总计** | **60%** | **8** | **6,723** |

---

## 🎯 核心技术栈

**DonTalk Blog** 是一个基于Spring Boot + Vue的前后端分离个人博客系统。

**后端**:
- Spring Boot 2.7.x
- Spring Security + JWT
- MyBatis-Plus 3.5.x
- MySQL 8.0
- Redis 7.0
- Swagger 3.0

**前端**:
- Vue.js 3.x
- Element Plus 2.x
- Axios 1.x
- Vue Router 4.x
- Pinia 2.x

---

### 后端技术
- **Spring Boot 2.7.x**: 快速开发框架
- **MyBatis-Plus**: ORM框架，简化CRUD
- **Spring Security + JWT**: 安全认证
- **MySQL 8.0**: 关系型数据库
- **Redis**: 缓存中间件
- **阿里云OSS**: 对象存储
- **Swagger**: API文档

### 前端技术 (待实现)
- **Vue.js 3.x**: 渐进式JavaScript框架
- **Element Plus**: UI组件库
- **Axios**: HTTP客户端
- **Vue Router**: 路由管理
- **Pinia**: 状态管理

### DevOps工具 (待实现)
- **Docker**: 容器化部署
- **Nginx**: Web服务器
- **GitHub Actions**: CI/CD流水线

---

## 📝 已完成的API接口

### 用户模块 (6个接口)
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取个人信息
- `PUT /api/users/profile` - 更新个人信息
- `PUT /api/users/password` - 修改密码
- `POST /api/users/avatar` - 上传头像

### 文章模块 (9个接口)
- `POST /api/articles` - 创建文章
- `PUT /api/articles` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章
- `POST /api/articles/{id}/publish` - 发布文章
- `GET /api/articles/{id}` - 查询文章详情
- `POST /api/articles/query` - 分页查询文章
- `POST /api/articles/{id}/view` - 增加阅读量
- `POST /api/articles/{id}/like` - 点赞文章
- `GET /api/articles/search` - 搜索文章

### 分类模块 (5个接口)
- `POST /api/categories` - 创建分类
- `PUT /api/categories` - 更新分类
- `DELETE /api/categories/{id}` - 删除分类
- `GET /api/categories` - 查询所有分类
- `GET /api/categories/{id}` - 根据ID查询分类

### 标签模块 (6个接口)
- `POST /api/tags` - 创建标签
- `PUT /api/tags` - 更新标签
- `DELETE /api/tags/{id}` - 删除标签
- `GET /api/tags` - 查询所有标签
- `GET /api/tags/hot` - 查询热门标签
- `GET /api/tags/{id}` - 根据ID查询标签

### 评论模块 (5个接口)
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/{id}` - 删除评论
- `GET /api/comments/article/{articleId}` - 查询文章评论
- `POST /api/comments/{id}/like` - 点赞评论
- `DELETE /api/comments/{id}/like` - 取消点赞

### 文件上传模块 (4个接口)
- `POST /api/files/image` - 上传图片
- `POST /api/files/avatar` - 上传头像
- `POST /api/files/cover` - 上传封面图
- `DELETE /api/files` - 删除文件

**总计**: 35个RESTful API接口 ✅

---

## 🗄️ 数据库表设计

已设计并实现8张核心表:

1. **sys_user** - 用户表
2. **article** - 文章表
3. **category** - 分类表
4. **tag** - 标签表
5. **article_tag** - 文章标签关联表
6. **comment** - 评论表
7. **comment_like** - 评论点赞表
8. **file_upload** - 文件上传记录表(可选)

详见: [01.需求分析与系统设计.md](./01.需求分析与系统设计.md#四数据库表设计)

---

## 🚀 快速开始

### 环境要求

- JDK 11+
- Maven 3.6+
- MySQL 8.0+
- Redis 7.0+
- Node.js 16+
- IDEA / VS Code

### 后端启动

```bash
# 1. 克隆项目
git clone https://github.com/dontalk/dontalk-blog.git

# 2. 导入数据库
mysql -u root -p < sql/blog.sql

# 3. 修改配置文件
# 编辑 src/main/resources/application.yml
# 修改数据库和Redis配置

# 4. 启动项目
mvn spring-boot:run

# 5. 访问Swagger
# http://localhost:8080/api/swagger-ui.html
```

### 前端启动

```bash
# 1. 进入前端目录
cd dontalk-blog-web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问前端
# http://localhost:3000
```

## 📖 学习建议

### 初学者路线
1. **第1周**: 阅读需求分析文档，理解项目架构
2. **第2周**: 搭建开发环境，运行项目
3. **第3-4周**: 逐个模块学习，理解代码逻辑
4. **第5周**: 尝试添加新功能(如: 文章收藏、站内信)
5. **第6周**: 学习前端开发，完成前后端联调
6. **第7周**: 学习Docker部署，上线到云服务器

### 进阶路线
1. **性能优化**: Redis缓存、数据库索引优化
2. **安全加固**: XSS防护、SQL注入防护、CSRF防护
3. **高并发**: 消息队列、分布式锁、限流降级
4. **监控告警**: Prometheus + Grafana
5. **微服务改造**: Spring Cloud Alibaba

---

## 🔧 常见问题

### Q1: 如何切换数据库?

**A**: 修改application.yml:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blog
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Q2: 如何禁用Spring Security?

**A**: 临时禁用(不推荐):
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
```

### Q3: 如何使用腾讯云COS替代阿里云OSS?

**A**: 
1. 添加腾讯云COS依赖
2. 修改OssConfig为CosConfig
3. 替换上传逻辑为COS SDK
4. 更新配置文件

### Q4: 如何实现文章草稿自动保存?

**A**: 使用定时任务:
```java
@Scheduled(fixedRate = 60000) // 每分钟
public void autoSaveDrafts() {
    // 保存前端localStorage中的草稿到数据库
}
```

---

## 📌 下一步计划

### 短期目标 (1-2周)
- [ ] 完成前端Vue项目开发
- [ ] 实现文章收藏功能
- [ ] 实现站内信通知
- [ ] 完善单元测试(覆盖率>80%)

### 中期目标 (1个月)
- [ ] Docker容器化部署
- [ ] Nginx反向代理配置
- [ ] GitHub Actions CI/CD
- [ ] 性能压测与优化

### 长期目标 (3个月)
- [ ] 微服务架构改造
- [ ] Elasticsearch全文检索
- [ ] 实时聊天功能(WebSocket)
- [ ] 移动端适配(UniApp)

```
dontalk-blog/
├── docs/                          # 项目文档
│   └── 06-综合实战项目/01-博客系统/
├── backend/                       # 后端代码
│   ├── src/main/java/com/dontalk/blog/
│   │   ├── common/               # 通用模块
│   │   ├── config/               # 配置类
│   │   ├── module/               # 业务模块
│   │   │   ├── user/            # 用户模块
│   │   │   ├── article/         # 文章模块
│   │   │   ├── category/        # 分类模块
│   │   │   ├── tag/             # 标签模块
│   │   │   └── comment/         # 评论模块
│   │   ├── security/            # 安全模块
│   │   └── utils/               # 工具类
│   └── pom.xml
├── frontend/                      # 前端代码
│   ├── src/
│   │   ├── views/               # 页面组件
│   │   ├── components/          # 公共组件
│   │   ├── router/              # 路由配置
│   │   ├── store/               # 状态管理
│   │   └── api/                 # API接口
│   └── package.json
└── docker/                        # Docker配置
    ├── Dockerfile
    └── docker-compose.yml
```

---

## 🔧 开发规范

### 代码规范

1. **命名规范**:
   - 类名: 大驼峰(UserService)
   - 方法名: 小驼峰(getUserById)
   - 常量: 全大写+下划线(MAX_SIZE)
   - 包名: 全小写(com.dontalk.blog)

2. **注释规范**:
   - 类必须有类注释
   - 公共方法必须有方法注释
   - 复杂逻辑要有行内注释

3. **异常处理**:
   - 使用BusinessException抛业务异常
   - Controller层不捕获异常,交给全局处理器
   - 日志记录关键操作和异常

### Git规范

**分支策略**:
- `main`: 主分支,生产环境代码
- `develop`: 开发分支
- `feature/xxx`: 功能分支
- `hotfix/xxx`: 修复分支

**提交信息**:
```
feat: 添加用户注册功能
fix: 修复登录Token验证bug
docs: 更新API文档
style: 代码格式化
refactor: 重构用户模块
test: 添加单元测试
```

---

## 📊 数据库设计

### 核心表

| 表名 | 说明 | 字段数 |
|------|------|--------|
| sys_user | 用户表 | 12 |
| blog_article | 文章表 | 15 |
| blog_category | 分类表 | 6 |
| blog_tag | 标签表 | 4 |
| blog_article_tag | 文章标签关联表 | 2 |
| blog_comment | 评论表 | 8 |

详细设计见: [01.需求分析与系统设计.md](./01.需求分析与系统设计.md)

---

## 🎨 API文档

启动项目后访问Swagger:

```
http://localhost:8080/api/swagger-ui.html
```

### 主要接口

#### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

#### 文章管理
- `GET /api/articles` - 文章列表
- `GET /api/articles/{id}` - 文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章

#### 分类管理
- `GET /api/categories` - 分类列表
- `POST /api/categories` - 创建分类

#### 标签管理
- `GET /api/tags` - 标签列表
- `POST /api/tags` - 创建标签

#### 评论管理
- `GET /api/comments?articleId=1` - 文章评论列表
- `POST /api/comments` - 发表评论

---

## 💡 常见问题

### Q1: 启动时报数据库连接错误?

**A**: 检查以下几点:
1. MySQL是否启动
2. 数据库是否创建(`CREATE DATABASE blog_db`)
3. application.yml中的配置是否正确
4. 用户名密码是否正确

### Q2: Redis连接失败?

**A**: 
1. 确保Redis已启动
2. 检查application.yml中的Redis配置
3. 如果不需要Redis,可以暂时注释相关配置

### Q3: Swagger无法访问?

**A**: 
1. 确认项目已启动
2. 访问正确URL: `http://localhost:8080/api/swagger-ui.html`
3. 检查SwaggerConfig配置是否正确

### Q4: Token验证失败?

**A**: 
1. 确认请求Header中携带了Token: `Authorization: Bearer <token>`
2. 检查Token是否过期
3. 查看后端日志,确认JWT配置是否正确

---

## 🤝 贡献指南

欢迎提交Issue或PR!

**可以贡献的内容**:
- 修复Bug
- 优化性能
- 添加新功能
- 完善文档
- 改进UI/UX

---

## 📝 更新日志

### v1.1.0 (2026-06-02)
- ✅ 完成需求分析和系统设计
- ✅ 完成项目初始化和基础配置
- ✅ 完成框架配置(MyBatis-Plus、Swagger、Security)
- ✅ 完成用户模块(注册、登录、JWT认证)
- ✅ 完成文章模块(CRUD、分页、搜索)
- ✅ 完成分类标签模块(分类管理、标签管理)
- ✅ 完成评论系统模块(发表评论、回复、点赞)
- ✅ 完成文件上传模块(OSS存储、本地存储)
- ⏳ 前端开发中...

---

## 📄 License

MIT License

---

## 👨‍💻 作者

**DonTalk**
- GitHub: https://github.com/dontalk
- Blog: https://dontalk.github.io

---

**祝学习愉快!** 🎉

如有问题,欢迎提Issue或联系作者。
