# Spring源码深度解析

## 模块导航

### 01-IOC容器
- [01.IOC容器源码解析](./01.IOC容器源码解析.md) - 容器启动流程、BeanDefinition加载、Bean实例化、循环依赖三级缓存

### 02-AOP代理
- [02.AOP源码解析](./02.AOP源码解析.md) - 自动代理创建器、JDK动态代理、CGLIB代理、拦截器链执行

---

## 学习路径建议

**前置要求**:
- ✅ 熟练掌握Java基础(反射、泛型、注解)
- ✅ 理解设计模式(工厂、模板方法、代理、责任链)
- ✅ 熟悉Spring基本使用(IOC、AOP、事务)

**第一阶段: IOC容器** (3-5天)
1. 阅读IOC容器源码解析文档
2. 搭建调试环境,设置断点
3. 跟踪refresh()方法的执行流程
4. 理解Bean生命周期的每个阶段

**第二阶段: AOP代理** (2-3天)
5. 阅读AOP源码解析文档
6. 对比JDK代理和CGLIB的实现
7. 调试拦截器链的执行过程
8. 理解通知的执行顺序

**第三阶段: 实战应用** (持续)
9. 尝试自己实现简化版IOC容器
10. 实现简单的AOP框架
11. 阅读其他模块源码(事务、MVC等)

---

## 核心知识点

### IOC容器核心
- ApplicationContext启动流程(refresh方法)
- BeanDefinition的加载和解析(XML/注解)
- Bean实例化的三个阶段(实例化→属性填充→初始化)
- 三级缓存解决循环依赖问题
- BeanPostProcessor扩展机制
- Aware接口的作用

### AOP代理核心
- @EnableAspectJAutoProxy的工作原理
- AnnotationAwareAspectJAutoProxyCreator的作用
- JDK动态代理 vs CGLIB代理的选择策略
- Advisor、Advice、Pointcut的关系
- 拦截器链的执行顺序
- 五种通知(@Around、@Before等)的执行时机

### 设计模式应用
- **工厂模式**: BeanFactory创建Bean
- **模板方法**: AbstractAutowireCapableBeanFactory定义流程
- **策略模式**: InstantiationStrategy、AopProxy
- **责任链**: 拦截器链、BeanPostProcessor链
- **观察者模式**: ApplicationEvent事件机制
- **适配器模式**: HandlerAdapter

---

## 调试技巧

### 1. 设置断点的关键位置

#### IOC容器启动
```java
// AbstractApplicationContext.refresh() - 容器启动入口
AbstractApplicationContext.java:540

// AbstractAutowireCapableBeanFactory.doCreateBean() - Bean创建核心
AbstractAutowireCapableBeanFactory.java:510

// AbstractAutowireCapableBeanFactory.populateBean() - 属性填充
AbstractAutowireCapableBeanFactory.java:1200

// AbstractAutowireCapableBeanFactory.initializeBean() - Bean初始化
AbstractAutowireCapableBeanFactory.java:1700
```

#### AOP代理创建
```java
// AbstractAutoProxyCreator.postProcessAfterInitialization() - 创建代理
AbstractAutoProxyCreator.java:310

// DefaultAopProxyFactory.createAopProxy() - 选择代理方式
DefaultAopProxyFactory.java:60

// JdkDynamicAopProxy.invoke() - JDK代理调用
JdkDynamicAopProxy.java:150

// ReflectiveMethodInvocation.proceed() - 拦截器链执行
ReflectiveMethodInvocation.java:160
```

### 2. 观察关键变量

#### Bean创建过程
```java
// 查看BeanDefinition
RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);

// 查看实例化后的对象
Object bean = instanceWrapper.getWrappedInstance();

// 查看注入的属性
PropertyValues pvs = mbd.getPropertyValues();

// 查看后置处理器列表
List<BeanPostProcessor> postProcessors = getBeanPostProcessors();
```

#### AOP代理过程
```java
// 查看Advisor列表
List<Advisor> advisors = findEligibleAdvisors(beanClass, beanName);

// 查看代理类型
Class<?> proxyClass = proxy.getClass();

// 查看拦截器链
List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
```

### 3. 使用条件断点

```java
// 只在自己关心的Bean上断点
beanName.equals("userService")

// 只在特定类上断点
bean.getClass().getName().contains("UserService")

// 只在循环依赖时断点
isSingletonCurrentlyInCreation(beanName)
```

---

## 常见问题FAQ

### Q1: 为什么要先理解整体流程再深入细节?

**A**: Spring源码非常庞大,如果一开始就陷入细节容易迷失方向。建议:
1. 先画出流程图,理解整体架构
2. 找到核心方法(如refresh、doCreateBean)
3. 逐层深入,不要一次性看完所有代码
4. 结合注释和文档理解设计意图

### Q2: 如何高效阅读源码?

**A**: 
1. **带着问题阅读**: 例如"循环依赖怎么解决的?"
2. **边读边画**: 画出调用链路和类关系图
3. **动手调试**: 设置断点,单步执行,观察变量
4. **做笔记**: 记录关键流程和自己的理解
5. **对比学习**: 对比不同版本的实现差异

### Q3: 三级缓存为什么能解决循环依赖?

**A**: 
- **一级缓存**: 完整的Bean(已初始化)
- **二级缓存**: 早期引用的Bean(已实例化,未填充属性)
- **三级缓存**: Bean工厂(用于创建早期引用)

当A依赖B,B又依赖A时:
1. A实例化后,将工厂放入三级缓存
2. A填充属性时发现需要B,去创建B
3. B实例化后,填充属性时发现需要A
4. B从三级缓存获取A的工厂,得到A的早期引用
5. B完成初始化,A继续填充属性,拿到完整的B
6. A完成初始化

关键是**提前暴露早期引用**,让B能够引用到A(即使A还没完全初始化)。

### Q4: JDK代理和CGLIB有什么区别?

**A**:

| 特性 | JDK动态代理 | CGLIB代理 |
|------|------------|-----------|
| 原理 | 反射机制,实现接口 | 字节码生成,继承目标类 |
| 要求 | 目标类必须实现接口 | 无要求,但不能是final类 |
| 性能 | Spring 5前较慢,之后优化 | 一直较快 |
| 限制 | 只能代理接口方法 | 不能代理final方法 |
| 适用 | 面向接口编程 | 普通类 |

**选择策略**:
- 有接口 → 默认JDK代理
- 无接口或强制CGLIB → CGLIB代理

### Q5: 如何自己实现简化版IOC容器?

**A**: 核心步骤:

```java
public class SimpleApplicationContext {
    
    private Map<String, Object> singletonObjects = new ConcurrentHashMap<>();
    private Map<String, BeanDefinition> beanDefinitionMap = new HashMap<>();
    
    // 1. 扫描包,注册BeanDefinition
    public void scan(String basePackage) {
        // 扫描@Component注解,创建BeanDefinition
    }
    
    // 2. 实例化Bean
    public Object createBean(String beanName) {
        BeanDefinition bd = beanDefinitionMap.get(beanName);
        
        // 2.1 实例化(反射调用构造器)
        Class<?> clazz = Class.forName(bd.getClassName());
        Object bean = clazz.getDeclaredConstructor().newInstance();
        
        // 2.2 属性填充(@Autowired注入)
        populateBean(bean, bd);
        
        // 2.3 初始化(@PostConstruct)
        initializeBean(bean);
        
        // 2.4 放入缓存
        singletonObjects.put(beanName, bean);
        
        return bean;
    }
    
    // 3. 获取Bean
    public Object getBean(String beanName) {
        return singletonObjects.get(beanName);
    }
}
```

---

## 推荐学习资源

### 书籍
- 《Spring源码深度解析》- 郝佳
- 《Spring技术内幕》- 计文柯
- 《Expert One-on-One Spring》- Rod Johnson

### 视频课程
- B站: Spring源码解读系列
- 慕课网: Spring源码解析
- 极客时间: Spring源码剖析

### 在线资源
- [Spring官方GitHub](https://github.com/spring-projects/spring-framework)
- [Spring官方文档](https://spring.io/projects/spring-framework)
- [芋道源码](https://github.com/YunaiV/onemall) - 中文注释版

---

## 下一步学习

完成源码阅读后,建议继续:

1. **Spring事务源码** - PlatformTransactionManager、Propagation
2. **Spring MVC源码** - DispatcherServlet、HandlerMapping
3. **Spring Boot源码** - 自动配置原理、Starter机制
4. **Spring Cloud源码** - 服务发现、配置中心、网关

或者开始**综合实战项目**,将理论知识应用到实际开发中!
