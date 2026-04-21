## MySQL项目实战案例

**学习目标:**
> * 掌握实际项目的数据库设计方法
> * 学会根据业务需求设计表结构
> * 理解常见业务场景的SQL实现
> * 能够进行数据库性能优化

---

## 1. 电商系统数据库设计

### 1.1 需求分析

设计一个简化版的电商系统,包含以下核心功能:
- 用户管理(注册、登录、个人信息)
- 商品管理(分类、品牌、商品详情)
- 购物车(添加、删除、修改数量)
- 订单管理(下单、支付、发货、收货)
- 评价系统(商品评价、评分)

### 1.2 概念设计(E-R图)

主要实体:
- 用户(User)
- 商品分类(Category)
- 品牌(Brand)
- 商品(Product)
- 购物车(Cart)
- 订单(Order)
- 订单项(OrderItem)
- 评价(Review)

实体关系:
- 用户 - 订单: 一对多
- 分类 - 商品: 一对多
- 品牌 - 商品: 一对多
- 用户 - 购物车: 一对多
- 用户 - 评价: 一对多
- 商品 - 评价: 一对多
- 订单 - 订单项: 一对多
- 商品 - 订单项: 一对多

### 1.3 物理设计(建表语句)

```sql
-- ==================== 基础数据表 ====================

-- 用户表
CREATE TABLE `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码(加密)',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(255) COMMENT '头像URL',
    `email` VARCHAR(100) COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    `birthday` DATE COMMENT '生日',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品分类表
CREATE TABLE `category` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `parent_id` INT DEFAULT 0 COMMENT '父分类ID, 0表示一级分类',
    `level` TINYINT DEFAULT 1 COMMENT '分类层级: 1-一级, 2-二级, 3-三级',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(255) COMMENT '分类图标',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 品牌表
CREATE TABLE `brand` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '品牌ID',
    `name` VARCHAR(100) NOT NULL COMMENT '品牌名称',
    `logo` VARCHAR(255) COMMENT '品牌Logo',
    `description` TEXT COMMENT '品牌描述',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品牌表';

-- ==================== 商品相关表 ====================

-- 商品表
CREATE TABLE `product` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    `category_id` INT NOT NULL COMMENT '分类ID',
    `brand_id` INT COMMENT '品牌ID',
    `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
    `subtitle` VARCHAR(255) COMMENT '副标题',
    `main_image` VARCHAR(255) COMMENT '主图URL',
    `sub_images` TEXT COMMENT '子图URL列表(JSON)',
    `detail` TEXT COMMENT '商品详情',
    `price` DECIMAL(10, 2) NOT NULL COMMENT '销售价格',
    `original_price` DECIMAL(10, 2) COMMENT '原价',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    `sales` INT DEFAULT 0 COMMENT '销量',
    `specifications` JSON COMMENT '规格参数(JSON)',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_id (category_id),
    INDEX idx_brand_id (brand_id),
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_sales (sales),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_name_subtitle (name, subtitle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 商品SKU表(库存单位)
CREATE TABLE `product_sku` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'SKU ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `sku_code` VARCHAR(50) NOT NULL COMMENT 'SKU编码',
    `specifications` JSON COMMENT '规格组合(JSON)',
    `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
    `sales` INT DEFAULT 0 COMMENT '销量',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_product_id (product_id),
    UNIQUE INDEX idx_sku_code (sku_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU表';

-- ==================== 购物车表 ====================

CREATE TABLE `cart` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `sku_id` BIGINT COMMENT 'SKU ID',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
    `checked` TINYINT DEFAULT 1 COMMENT '是否选中: 0-未选中, 1-选中',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_user_product_sku (user_id, product_id, sku_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- ==================== 订单相关表 ====================

-- 订单表
CREATE TABLE `orders` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
    `pay_amount` DECIMAL(10, 2) NOT NULL COMMENT '实付金额',
    `freight_amount` DECIMAL(10, 2) DEFAULT 0 COMMENT '运费',
    `discount_amount` DECIMAL(10, 2) DEFAULT 0 COMMENT '优惠金额',
    `pay_type` TINYINT COMMENT '支付方式: 1-支付宝, 2-微信, 3-银行卡',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态: 0-待付款, 1-已付款, 2-已发货, 3-已完成, 4-已取消, 5-已关闭',
    `receiver_name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    `receiver_phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
    `receiver_address` VARCHAR(255) NOT NULL COMMENT '收货地址',
    `remark` VARCHAR(500) COMMENT '订单备注',
    `pay_time` DATETIME COMMENT '支付时间',
    `delivery_time` DATETIME COMMENT '发货时间',
    `receive_time` DATETIME COMMENT '收货时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_pay_time (pay_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单项表
CREATE TABLE `order_item` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单号(冗余)',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称(快照)',
    `product_image` VARCHAR(255) COMMENT '商品图片(快照)',
    `sku_id` BIGINT COMMENT 'SKU ID',
    `sku_spec` VARCHAR(255) COMMENT 'SKU规格(快照)',
    `price` DECIMAL(10, 2) NOT NULL COMMENT '成交单价',
    `quantity` INT NOT NULL COMMENT '购买数量',
    `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '小计金额',
    
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单项表';

-- ==================== 评价表 ====================

CREATE TABLE `review` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `rating` TINYINT NOT NULL COMMENT '评分: 1-5星',
    `content` TEXT COMMENT '评价内容',
    `images` JSON COMMENT '评价图片(JSON数组)',
    `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名: 0-否, 1-是',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-隐藏, 1-显示',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';
```

### 1.4 典型业务SQL实现

#### 1.4.1 商品查询与分页

```sql
-- 查询商品列表(带筛选和排序)
SELECT 
    p.id,
    p.name,
    p.subtitle,
    p.main_image,
    p.price,
    p.original_price,
    p.sales,
    c.name AS category_name,
    b.name AS brand_name
FROM product p
LEFT JOIN category c ON p.category_id = c.id
LEFT JOIN brand b ON p.brand_id = b.id
WHERE p.status = 1
    AND p.category_id = 10
    AND p.price BETWEEN 100 AND 1000
ORDER BY p.sales DESC, p.created_at DESC
LIMIT 0, 20;

-- 使用全文搜索
SELECT 
    id,
    name,
    price,
    MATCH(name, subtitle) AGAINST('手机' IN BOOLEAN MODE) AS relevance
FROM product
WHERE MATCH(name, subtitle) AGAINST('手机' IN BOOLEAN MODE)
    AND status = 1
ORDER BY relevance DESC
LIMIT 20;
```

#### 1.4.2 加入购物车

```sql
-- 添加商品到购物车(如果已存在则更新数量)
INSERT INTO cart (user_id, product_id, sku_id, quantity)
VALUES (1001, 5001, 10001, 2)
ON DUPLICATE KEY UPDATE 
    quantity = quantity + 2,
    updated_at = NOW();

-- 查询用户购物车
SELECT 
    c.id,
    c.quantity,
    c.checked,
    p.id AS product_id,
    p.name AS product_name,
    p.main_image,
    p.price,
    s.sku_code,
    s.specifications,
    s.price AS sku_price,
    s.stock
FROM cart c
INNER JOIN product p ON c.product_id = p.id
LEFT JOIN product_sku s ON c.sku_id = s.id
WHERE c.user_id = 1001
ORDER BY c.created_at DESC;
```

#### 1.4.3 创建订单(事务处理)

```sql
DELIMITER $$
CREATE PROCEDURE create_order(
    IN p_user_id BIGINT,
    IN p_receiver_name VARCHAR(50),
    IN p_receiver_phone VARCHAR(20),
    IN p_receiver_address VARCHAR(255),
    IN p_remark VARCHAR(500)
)
BEGIN
    DECLARE v_order_no VARCHAR(50);
    DECLARE v_total_amount DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_exit_handler BOOLEAN DEFAULT FALSE;
    
    -- 异常处理
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET v_exit_handler = TRUE;
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 生成订单号(日期+随机数)
    SET v_order_no = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- 计算购物车中选中商品的总金额
    SELECT SUM(
        CASE 
            WHEN c.sku_id IS NOT NULL THEN c.quantity * s.price
            ELSE c.quantity * p.price
        END
    ) INTO v_total_amount
    FROM cart c
    INNER JOIN product p ON c.product_id = p.id
    LEFT JOIN product_sku s ON c.sku_id = s.id
    WHERE c.user_id = p_user_id AND c.checked = 1;
    
    -- 检查购物车是否为空
    IF v_total_amount IS NULL OR v_total_amount = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '购物车为空';
    END IF;
    
    -- 创建订单
    INSERT INTO orders (
        order_no, user_id, total_amount, pay_amount, 
        receiver_name, receiver_phone, receiver_address, remark
    ) VALUES (
        v_order_no, p_user_id, v_total_amount, v_total_amount,
        p_receiver_name, p_receiver_phone, p_receiver_address, p_remark
    );
    
    -- 获取订单ID
    SET @order_id = LAST_INSERT_ID();
    
    -- 创建订单项并扣减库存
    INSERT INTO order_item (
        order_id, order_no, product_id, product_name, product_image,
        sku_id, sku_spec, price, quantity, total_amount
    )
    SELECT 
        @order_id,
        v_order_no,
        c.product_id,
        p.name,
        p.main_image,
        c.sku_id,
        s.specifications,
        CASE WHEN c.sku_id IS NOT NULL THEN s.price ELSE p.price END,
        c.quantity,
        c.quantity * CASE WHEN c.sku_id IS NOT NULL THEN s.price ELSE p.price END
    FROM cart c
    INNER JOIN product p ON c.product_id = p.id
    LEFT JOIN product_sku s ON c.sku_id = s.id
    WHERE c.user_id = p_user_id AND c.checked = 1;
    
    -- 扣减库存(普通商品)
    UPDATE product p
    INNER JOIN cart c ON p.id = c.product_id
    SET p.stock = p.stock - c.quantity,
        p.sales = p.sales + c.quantity
    WHERE c.user_id = p_user_id AND c.checked = 1 AND c.sku_id IS NULL;
    
    -- 扣减库存(SKU商品)
    UPDATE product_sku s
    INNER JOIN cart c ON s.id = c.sku_id
    SET s.stock = s.stock - c.quantity,
        s.sales = s.sales + c.quantity
    WHERE c.user_id = p_user_id AND c.checked = 1 AND c.sku_id IS NOT NULL;
    
    -- 清空购物车中已选中的商品
    DELETE FROM cart WHERE user_id = p_user_id AND checked = 1;
    
    COMMIT;
    
    -- 返回订单号
    SELECT v_order_no AS order_no, @order_id AS order_id;
END$$
DELIMITER ;

-- 调用存储过程
CALL create_order(
    1001, 
    '张三', 
    '13800138000', 
    '北京市朝阳区xxx路xxx号', 
    '请尽快发货'
);
```

#### 1.4.4 订单查询

```sql
-- 查询用户订单列表(分页)
SELECT 
    o.id,
    o.order_no,
    o.total_amount,
    o.pay_amount,
    o.status,
    o.receiver_name,
    o.receiver_phone,
    o.created_at,
    COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN order_item oi ON o.id = oi.order_id
WHERE o.user_id = 1001
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 0, 10;

-- 查询订单详情
SELECT 
    o.*,
    oi.id AS item_id,
    oi.product_id,
    oi.product_name,
    oi.product_image,
    oi.sku_spec,
    oi.price,
    oi.quantity,
    oi.total_amount AS item_total
FROM orders o
INNER JOIN order_item oi ON o.id = oi.order_id
WHERE o.order_no = 'ORD202401011200001234';
```

#### 1.4.5 数据统计

```sql
-- 销售统计(按天)
SELECT 
    DATE(pay_time) AS sale_date,
    COUNT(DISTINCT id) AS order_count,
    SUM(pay_amount) AS total_sales,
    AVG(pay_amount) AS avg_order_amount
FROM orders
WHERE status IN (1, 2, 3)
    AND pay_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(pay_time)
ORDER BY sale_date DESC;

-- 热销商品TOP 10
SELECT 
    p.id,
    p.name,
    p.main_image,
    p.price,
    SUM(oi.quantity) AS total_sales,
    SUM(oi.total_amount) AS total_amount
FROM order_item oi
INNER JOIN product p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status IN (1, 2, 3)
    AND o.pay_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY total_sales DESC
LIMIT 10;

-- 用户消费排行
SELECT 
    u.id,
    u.username,
    u.nickname,
    COUNT(o.id) AS order_count,
    SUM(o.pay_amount) AS total_spent,
    AVG(o.pay_amount) AS avg_order_amount
FROM orders o
INNER JOIN user u ON o.user_id = u.id
WHERE o.status IN (1, 2, 3)
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 10;
```

### 1.5 性能优化建议

**1. 索引优化**
```sql
-- 为常用查询条件添加索引
ALTER TABLE product ADD INDEX idx_category_status (category_id, status);
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- 超过2秒的查询记录到慢查询日志
```

**2. 分表策略**
当订单表数据量超过1000万时,可以考虑分表:
- 按用户ID哈希分表
- 按时间范围分表(按月或按年)

**3. 读写分离**
- 主库: 写操作(INSERT、UPDATE、DELETE)
- 从库: 读操作(SELECT)

**4. 缓存优化**
- Redis缓存热门商品、分类信息
- 缓存用户会话信息
- 缓存购物车数据

---

## 2. 博客系统数据库设计

### 2.1 需求分析

设计一个个人博客系统,包含:
- 用户管理
- 文章管理(发布、编辑、删除)
- 分类和标签
- 评论系统
- 点赞和收藏

### 2.2 建表语句

```sql
-- 用户表
CREATE TABLE blog_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    email VARCHAR(100),
    bio TEXT COMMENT '个人简介',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章分类表
CREATE TABLE blog_category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'URL别名',
    description TEXT,
    parent_id INT DEFAULT 0,
    article_count INT DEFAULT 0 COMMENT '文章数量(冗余)',
    
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章标签表
CREATE TABLE blog_tag (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    use_count INT DEFAULT 0 COMMENT '使用次数(冗余)',
    
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章表
CREATE TABLE blog_article (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE COMMENT 'URL别名',
    summary VARCHAR(500) COMMENT '摘要',
    content LONGTEXT NOT NULL COMMENT '文章内容(Markdown)',
    cover_image VARCHAR(255) COMMENT '封面图',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-草稿, 1-已发布, 2-已删除',
    view_count INT DEFAULT 0 COMMENT '阅读量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶',
    published_at DATETIME COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_view_count (view_count),
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章标签关联表(多对多)
CREATE TABLE blog_article_tag (
    article_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (article_id, tag_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE blog_comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT COMMENT '用户ID, 未登录为NULL',
    parent_id INT DEFAULT 0 COMMENT '父评论ID',
    nickname VARCHAR(50) NOT NULL COMMENT '评论者昵称',
    email VARCHAR(100) COMMENT '评论者邮箱',
    website VARCHAR(255) COMMENT '评论者网站',
    content TEXT NOT NULL,
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '浏览器信息',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待审核, 1-已通过, 2-已拒绝',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_article_id (article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 点赞表
CREATE TABLE blog_like (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_user_article (user_id, article_id),
    INDEX idx_article_id (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.3 典型业务SQL

```sql
-- 发布文章
INSERT INTO blog_article (
    user_id, category_id, title, slug, summary, content, 
    status, published_at
) VALUES (
    1, 5, 'MySQL性能优化实战', 
    'mysql-performance-optimization',
    '本文介绍MySQL性能优化的常用技巧...',
    '# MySQL性能优化实战\n\n...',
    1, NOW()
);

-- 关联标签
INSERT INTO blog_article_tag (article_id, tag_id) VALUES 
(1, 10),  -- MySQL
(1, 15),  -- 性能优化
(1, 20);  -- 数据库

-- 更新分类和标签的文章数量
UPDATE blog_category SET article_count = article_count + 1 WHERE id = 5;
UPDATE blog_tag SET use_count = use_count + 1 WHERE id IN (10, 15, 20);

-- 查询文章列表(分页)
SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.cover_image,
    a.view_count,
    a.like_count,
    a.comment_count,
    a.published_at,
    c.name AS category_name,
    u.nickname AS author_name,
    GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
FROM blog_article a
LEFT JOIN blog_category c ON a.category_id = c.id
LEFT JOIN blog_user u ON a.user_id = u.id
LEFT JOIN blog_article_tag at ON a.id = at.article_id
LEFT JOIN blog_tag t ON at.tag_id = t.id
WHERE a.status = 1
GROUP BY a.id
ORDER BY a.is_top DESC, a.published_at DESC
LIMIT 0, 10;

-- 增加阅读量
UPDATE blog_article SET view_count = view_count + 1 WHERE id = 1;

-- 点赞(使用INSERT IGNORE避免重复点赞)
INSERT IGNORE INTO blog_like (user_id, article_id) VALUES (100, 1);
-- 如果插入成功,更新点赞数
UPDATE blog_article SET like_count = like_count + 1 
WHERE id = 1 AND ROW_COUNT() > 0;

-- 发表评论
INSERT INTO blog_comment (
    article_id, user_id, parent_id, nickname, email, content, 
    ip_address, status
) VALUES (
    1, 100, 0, '张三', 'zhangsan@example.com',
    '写得很好!', '192.168.1.1', 1
);

-- 更新文章评论数
UPDATE blog_article SET comment_count = comment_count + 1 WHERE id = 1;

-- 查询文章评论(树形结构)
WITH RECURSIVE comment_tree AS (
    -- 根评论
    SELECT 
        id, parent_id, nickname, content, created_at, 0 AS level
    FROM blog_comment
    WHERE article_id = 1 AND parent_id = 0 AND status = 1
    
    UNION ALL
    
    -- 子评论
    SELECT 
        c.id, c.parent_id, c.nickname, c.content, c.created_at, ct.level + 1
    FROM blog_comment c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE c.status = 1
)
SELECT * FROM comment_tree
ORDER BY created_at ASC;

-- 热门文章(TOP 10)
SELECT 
    id, title, slug, view_count, like_count, published_at
FROM blog_article
WHERE status = 1
    AND published_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY view_count DESC
LIMIT 10;

-- 标签云
SELECT 
    t.id, t.name, t.slug, t.use_count
FROM blog_tag t
WHERE t.use_count > 0
ORDER BY t.use_count DESC
LIMIT 30;
```

---

## 3. 学生管理系统实战

### 3.1 需求分析

设计一个学校学生管理系统:
- 学生信息管理
- 班级管理
- 课程管理
- 成绩管理
- 考勤管理

### 3.2 建表语句

```sql
-- 班级表
CREATE TABLE class (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL COMMENT '班级名称',
    grade VARCHAR(20) COMMENT '年级',
    teacher_id INT COMMENT '班主任ID',
    student_count INT DEFAULT 0 COMMENT '学生人数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学生表
CREATE TABLE student (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_no VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL,
    gender ENUM('男', '女') NOT NULL,
    birth_date DATE,
    class_id INT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    enroll_date DATE COMMENT '入学日期',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-休学, 1-在读, 2-毕业',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_student_no (student_no),
    INDEX idx_class_id (class_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 教师表
CREATE TABLE teacher (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_no VARCHAR(20) NOT NULL UNIQUE COMMENT '工号',
    name VARCHAR(50) NOT NULL,
    gender ENUM('男', '女'),
    phone VARCHAR(20),
    email VARCHAR(100),
    subject VARCHAR(50) COMMENT '任教科目',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 课程表
CREATE TABLE course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE COMMENT '课程代码',
    credit DECIMAL(3, 1) COMMENT '学分',
    hours INT COMMENT '学时',
    teacher_id INT,
    semester VARCHAR(20) COMMENT '学期',
    
    INDEX idx_course_code (course_code),
    INDEX idx_teacher_id (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 选课表
CREATE TABLE student_course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    score DECIMAL(5, 2) COMMENT '成绩',
    exam_date DATE COMMENT '考试日期',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-学习中, 1-已考试, 2-已补考',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_student_course_semester (student_id, course_id, semester),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 考勤表
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT,
    attendance_date DATE NOT NULL,
    status ENUM('出勤', '迟到', '早退', '旷课', '请假') NOT NULL,
    remark VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_student_date (student_id, attendance_date),
    INDEX idx_course_date (course_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.3 典型业务SQL

```sql
-- 录入学生成绩
INSERT INTO student_course (student_id, course_id, semester, score, exam_date, status)
VALUES (1001, 501, '2024春季', 85.5, '2024-06-20', 1)
ON DUPLICATE KEY UPDATE 
    score = VALUES(score),
    exam_date = VALUES(exam_date),
    status = VALUES(status);

-- 查询学生成绩单
SELECT 
    s.student_no,
    s.name,
    s.class_id,
    c.course_name,
    sc.score,
    sc.exam_date,
    t.name AS teacher_name
FROM student s
INNER JOIN student_course sc ON s.id = sc.student_id
INNER JOIN course c ON sc.course_id = c.id
LEFT JOIN teacher t ON c.teacher_id = t.id
WHERE s.id = 1001
ORDER BY sc.semester, c.course_name;

-- 计算学生平均成绩和GPA
SELECT 
    s.id,
    s.name,
    COUNT(sc.id) AS course_count,
    AVG(sc.score) AS avg_score,
    SUM(CASE 
        WHEN sc.score >= 90 THEN 4.0
        WHEN sc.score >= 80 THEN 3.0
        WHEN sc.score >= 70 THEN 2.0
        WHEN sc.score >= 60 THEN 1.0
        ELSE 0
    END * c.credit) / SUM(c.credit) AS gpa
FROM student s
INNER JOIN student_course sc ON s.id = sc.student_id
INNER JOIN course c ON sc.course_id = c.id
WHERE s.id = 1001
GROUP BY s.id;

-- 班级成绩排名
SELECT 
    s.id,
    s.name,
    s.student_no,
    AVG(sc.score) AS avg_score,
    RANK() OVER (ORDER BY AVG(sc.score) DESC) AS rank
FROM student s
INNER JOIN student_course sc ON s.id = sc.student_id
WHERE s.class_id = 101
GROUP BY s.id
ORDER BY avg_score DESC;

-- 统计各科成绩分布
SELECT 
    c.course_name,
    COUNT(*) AS total_students,
    SUM(CASE WHEN sc.score >= 90 THEN 1 ELSE 0 END) AS excellent,
    SUM(CASE WHEN sc.score BETWEEN 80 AND 89 THEN 1 ELSE 0 END) AS good,
    SUM(CASE WHEN sc.score BETWEEN 70 AND 79 THEN 1 ELSE 0 END) AS medium,
    SUM(CASE WHEN sc.score BETWEEN 60 AND 69 THEN 1 ELSE 0 END) AS pass,
    SUM(CASE WHEN sc.score < 60 THEN 1 ELSE 0 END) AS failed,
    AVG(sc.score) AS avg_score,
    MAX(sc.score) AS max_score,
    MIN(sc.score) AS min_score
FROM course c
INNER JOIN student_course sc ON c.id = sc.course_id
WHERE sc.semester = '2024春季'
GROUP BY c.id;

-- 查询缺勤学生
SELECT 
    s.name,
    s.student_no,
    c.course_name,
    COUNT(CASE WHEN a.status = '旷课' THEN 1 END) AS absent_count,
    COUNT(CASE WHEN a.status = '迟到' THEN 1 END) AS late_count,
    COUNT(CASE WHEN a.status = '请假' THEN 1 END) AS leave_count
FROM student s
INNER JOIN attendance a ON s.id = a.student_id
INNER JOIN course c ON a.course_id = c.id
WHERE a.attendance_date >= '2024-09-01'
GROUP BY s.id, c.id
HAVING absent_count > 3
ORDER BY absent_count DESC;

-- 批量导入学生
LOAD DATA INFILE '/path/to/students.csv'
INTO TABLE student
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(student_no, name, gender, birth_date, class_id, phone, email, address, enroll_date);
```

---

## 4. 常见问题与解决方案

### 4.1 大数据量分页优化

**问题:** 深分页性能差
```sql
-- ❌ 慢查询
SELECT * FROM orders LIMIT 100000, 10;
```

**解决方案:**
```sql
-- ✅ 方案1: 使用游标
SELECT * FROM orders WHERE id > 100000 LIMIT 10;

-- ✅ 方案2: 延迟关联
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders LIMIT 100000, 10) tmp ON o.id = tmp.id;
```

### 4.2 防止SQL注入

```java
// ❌ 危险: 拼接SQL
String sql = "SELECT * FROM user WHERE username = '" + username + "'";

// ✅ 安全: 使用预编译语句
String sql = "SELECT * FROM user WHERE username = ?";
PreparedStatement pstmt = connection.prepareStatement(sql);
pstmt.setString(1, username);
```

### 4.3 批量操作优化

```sql
-- ❌ 逐条插入(慢)
INSERT INTO user (name, age) VALUES ('张三', 25);
INSERT INTO user (name, age) VALUES ('李四', 26);

-- ✅ 批量插入(快)
INSERT INTO user (name, age) VALUES 
('张三', 25),
('李四', 26),
('王五', 27);

-- ✅ 大批量数据分批插入
-- 每批1000条,避免单次插入过多
```

### 4.4 软删除实现

```sql
-- 添加删除标记字段
ALTER TABLE user ADD COLUMN deleted_at DATETIME DEFAULT NULL;

-- 软删除
UPDATE user SET deleted_at = NOW() WHERE id = 1;

-- 查询时排除已删除的数据
SELECT * FROM user WHERE deleted_at IS NULL;

-- 创建唯一索引时需要考虑软删除
-- 使用部分索引(MySQL 8.0.13+)
CREATE UNIQUE INDEX idx_username ON user(username) WHERE deleted_at IS NULL;
```

---

## 5. 总结

### 数据库设计原则

1. **规范化与反规范化的平衡**
   - 遵循第三范式,减少数据冗余
   - 适当冗余字段,提高查询性能

2. **合理选择数据类型**
   - 越小越好,越简单越好
   - 避免NULL,使用默认值

3. **索引设计**
   - 为常用查询条件创建索引
   - 避免过多索引影响写性能
   - 定期分析和优化索引

4. **事务控制**
   - 保持事务简短
   - 合理设置隔离级别
   - 注意死锁问题

### 性能优化要点

1. **SQL优化**
   - 避免SELECT *
   - 使用EXPLAIN分析查询
   - 优化JOIN和子查询

2. **架构优化**
   - 读写分离
   - 分库分表
   - 引入缓存

3. **监控与维护**
   - 开启慢查询日志
   - 定期ANALYZE TABLE
   - 监控连接数和QPS

---

**综合练习:**

1. 设计一个在线投票系统的数据库,包括用户、投票、选项、投票记录等表
2. 实现一个社交媒体的关注/粉丝功能,包括关注、取关、查询粉丝列表等
3. 设计一个简单的ERP系统,包括产品、供应商、采购订单、入库记录等
4. 为一个论坛系统设计数据库,包括板块、帖子、回复、点赞等功能
