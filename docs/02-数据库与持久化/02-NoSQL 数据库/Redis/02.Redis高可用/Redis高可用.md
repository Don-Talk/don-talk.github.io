# Redis高可用

## 一、Redis 主从复制的基本概念和原理

### Redis 主从复制的基本概念

Redis主从复制是一种高可用机制，用于实现数据的冗余备份、读写分离和故障恢复。它允许一个主节点（Master）将数据实时复制到多个从节点（Slave或Replica）。从Redis6.2开始，“Slave”术语被推荐替换为“Replica”，但原理相同。

- 主节点（Master）：负责处理所有写操作(SET、DEL等)，并将这些操作同步到从节点。主节点可以同时读写。
- 从节点（Replica）：默认只读（可配置为读写，但不推荐），从节点接收数据副本。主要用于分担负载、数据备份或作为故障转移备选。
  - 核心目的：
  - 高可用：主节点故障时，从节点可提升为主
  - 读写分离：写到主，读从从，提高吞吐量
  - 数据备份：防止单点故障导致数据丢失
  - 地理分布：支持跨数据中心复制

主从复制是异步的（非阻塞），数据一致性是最终一致性（可能有短暂延迟）。它不提供自动故障转移，需要结合哨兵（Sentinel）或集群（Cluster）实现。

### Redis主从复制的原理

主从复制基于客户端-服务器模型，**从节点主动连接主节点**。过程分为初始化阶段（建立连接）和同步阶段（数据传输）。核心命令是REPLICAOF \<master_ip\> \<master_port\>  (从节点配置或动态执行)

1. 建立连接过程

   - 从节点执行REPLICAOF命令，连接主节点
   - 从节点发送PING确认连接
   - 如果需要认证，从节点发送AUTH（如果主配置了密码）
   - 从节点发送自己的监听端口（REPLICONF listening-port），用于后续通信
   - 主节点记录从节点信息，形成主从关系

2. 数据同步原理

   同步分为全量同步（Full Resynchronization）和增量同步(partial Resynchronization)。Redis优先尝试增量，如果失败则退回全量。

   - 全量同步（SYNC/PSYNC）：
     - 触发：首次连接、从节点重启、网络中断后重连，或复制ID不匹配
     - 过程：
       1. 从节点发送PSYNC ? -1（询问主节点支持增量）
       2. 主节点fork子进程生成RDB快照（不阻塞主进程）
       3. 主节点发送RDB文件给从节点
       4. 从节点清空自身数据，加载RDB文件
       5. 同时，主节点将快照期间的写命令放入缓冲区（Replication Buffer），发送给从节点
     - 特点：传输整个数据集，适合初始同步，但开销大（内存、带宽）
   - 增量同步（PSYNC）：
     - 触发：网络短暂中断后重连，且复制偏移量（Offset）相差不大
     - 过程：
       1. 从节点发送PSYNC \<runid\>  \<offset\> （runid是主节点运行ID，offset是已复制偏移量）
       2. 主节点检查runid和offset，如果匹配，从backlog（复制backlog缓冲区，默认1MB）中取出缺失命令发送
       3. 从节点应用这些命令，追赶主节点
     - 特点：只传增量命令，高效。依赖backlog大小（配置repl-backlog-size），如果溢出则回退全量。

3. 命令传播（Command Propagation）

   - 同步后，主节点每执行一个写命令，都异步发送给所有从节点（使用 REPLCONF ACK 机制确认）
   - 从节点执行命令，保持数据一致
   - 支持级联复制：从节点可在有子从节点，形成树状结构（配置REPLICAOF）

4. 配置与监控

   - 配置示例（redis.conf或动态）

     ```bash
     # 从节点配置
     replicaof 127.0.0.1 6379  # 主节点IP和端口
     masterauth password       # 如果主节点有密码
     repl-diskless-sync yes    # 无盘复制（直接内存传输 RDB，减少I/O）
     repl-backlog-size 1mb     # 增量缓冲区大小
     ```

   - 监控命令：
     - INFO Replication ： 查看主从状态、偏移、延迟
     - ROLE：确认节点角色

5. 注意事项：

   - 异步性：可能有数据延迟（repl-offset），高负载下需监控
   - 版本捷荣：Redis 2.8引入PSYNC，提高效率
   - 问题：不自动failover，主挂从不接管；大数据集全量同步慢



## 二、Redis 主从复制的常见拓扑结构

Redis主从复制（Replication）支持多种拓扑结构，以适应不同规模和需求的场景。这些结构基于主节点和从节点的连接方式，主要目的是实现数据冗余、负载均衡和高可用。以下是常见的拓扑结构，从简单到复杂列出，每种包括描述、优缺点和使用场景。

1. 一主一从（One Master,One Replica）

   - 描述：一个主节点连接一个从节点。从节点直接从主节点同步数据。
   - 配置示例：从节点配置 replicaof \<master_ip\> \<master_port\>
   - 特点：简单，直接备份
   - 适用场景：小型应用、开发测试环境，或作为基本数据备份。

   | 优点             | 缺点                     |
   | ---------------- | ------------------------ |
   | 配置简单，易管理 | 单点故障风险高；扩展性差 |
   | 资源消耗低       | 读负载无法分担           |

2. 一主多从（One Master,Multiple Replicas）

   - 描述：一个主节点连接多个从节点（可达数百个）。所有从节点并行从主节点同步数据，主节点处理所有写，从节点分担读

   - 配置示例：每个从节点独立配置replicaof指向同一主

   - 特点：支持读写分离，提高吞吐量。主节点使用复制缓冲区（replicaof backlog）管理增量同步

   - 使用场景：读多写少的场景，如缓存服务、网站后端

     | 优点                   | 缺点                                   |
     | ---------------------- | -------------------------------------- |
     | 高读性能；易水平扩展   | 主节点压力大（全量同步时）；写操作瓶颈 |
     | 数据多副本，提升可靠性 | 从节点故障不影响主                     |

3. 级联复制（Cascading Replication，或树状/链式结构）

   - 描述：主节点连接一级从节点，一级从节点再连接二级从节点，形成树状或链式。数据从主向下级联同步。例如主-->Replica1-->Replica2
   - 配置示例：Replica1配置 replicaof master，Replica2配置 replicaof Replica1
   - 特点：减少主节点负载，主只同步到一级从。支持多层级，但延迟可能累计
   - 适用场景：大规模部署、跨数据中心复制，或主节点带宽有限时

   | 优点                 | 缺点                                   |
   | -------------------- | -------------------------------------- |
   | 减轻主负载；灵活扩展 | 数据延迟增加（多级传递）；故障传播风险 |
   | 适合地理分布         | 管理复杂                               |

4. 户为主从（Mutual Replication，或环状结构）

   - 描述：多个节点互为彼此的主从，形成环状（如A是B的主，B是C的主，C是A的主）。但Redis不原生支持完整环状，通常通过自定义脚本实现部分互备。
   - 特点：每个节点既是主也是从，实现双向同步。但容易导致数据循环和不一致。
   - 使用场景：极少使用，仅在特定多主场景（如实验环境）。不推荐生产，因为一致性问题。

   | 优点             | 缺点                          |
   | ---------------- | ----------------------------- |
   | 无单点；负载均衡 | 易数据冲突/循环；复杂且不稳定 |
   |                  | Redis 不原生支持              |

5. 其他扩展拓扑（与高可用结合）

   - 哨兵模式（Sentinel）下的主从：在上述拓扑上叠加哨兵节点，实现自动故障转移。哨兵监控主从，选举新主。常见于一主多从+多哨兵。
   - 集群模式（Cluster）下的复制：Redis Cluster中每个主节点有1至多个从节点，形成分布式主从。集群自动管理槽位和复制。
   - 跨地域复制：使用级联+配置 repl-diskless-sync（无盘复制）优化带宽

6. 选择建议

   - 入门：从小规模（如一主多从）开始，结合INFO Replication监控状态
   - 生产：推荐一主多从+哨兵，避免单点。配置参数min-replicas-to-write 1(主需要至少1从才能写)提升一致性
   - 注意：所有拓扑均为异步复制，可能有延迟。大数据集时，优化repl-backlog-size以支持增量同步



## 三、主从复制的全量同步和增量同步细节

在Redis主从复制中，数据同步是核心机制，用于确保从节点的数据与主节点保持一致。同步分为全量同步和增量同步。全量同步传输整个数据集，适用于初始连接或大差距恢复；增量只传输缺失命令，适用于短暂中断。二者都基于PSYNC命令，优先尝试增量，如果失败回退全量。

1. 全量同步（Full Resynchronization）

   全量同步是将主节点整个数据集以RDB快照形式传输给从节点的过程。开销较大，但确保数据完整。

   - 触发条件：
     - 首次建立主从连接(从节点执行REPLICAOF)
     - 从节点重启或网络长时间中断，导致复制偏移（offset）差距过大
     - 主从运行ID（runid）不匹配（主节点重启会生成新runid）
     - 增量同步失败（如backlog缓冲区溢出）
     - 手动触发（如DEBUG RELOAD ）
   - 详细过程（以PSYNC命令为基础）
     1. 连接建立：从节点发送PSYNC ? -1到主节点，询问是否支持增量(？表示位置runid，-1表示位置offset)
     2. 主节点响应：如果不支持增量或条件不满足，主节点回复 FULLRESYNC \<runid\> \<offset\>（runid 是运行 ID，offset 是偏移量），并开始全量准备
     3. 生成RDB快照：主节点fork子进程（不阻塞主进程）生成RDB文件（类似于BGSAVE）。如果配置`repl-diskless-sync yes`，则直接从内存流式传输RDB数据，而不写盘（减少I/O，开销更高）
     4. 传输RDB：主节点将RDB文件发送给从节点。同时，主节点将快照生成期间的写命令放入复制缓冲区（Replication buffer），后续发送。
     5. 从节点加载：从节点接收RDB，清空自身数据（FLUSHALL），然后加载RDB到内存。加载后，应用缓冲区中的增量命令
     6. 同步完成：从节点发送ACK确认，进入命令传播阶段。主节点更新从节点的offset
   - 涉及参数：
     - repl-diskless-sync yes/no ：启用无盘复制（默认no，从Redis3.0支持）
     - repl-diskless-sync-delay \<seconds\> ： 多主节点时延迟启动，批量传输（默认5s）
     - repl-timeout \<seconds\> : 超时时间（默认60s)，防止传输卡住
   - 特点与开销：
     - 时间：取决于数据集大小（GB级别可能几分钟）
     - 内存：fork时主节点内存几乎翻倍（COW机制）
     - 带宽：传输整个RDB，网络差时慢

2. 增量同步（Partial Resynchronization）

   增量同步只传输从节点缺失的写命令，高效恢复短暂中断。依赖主节点的复制backlog缓冲区。

   - 触发条件：

     - 网络短暂中断后重连（几秒到几分钟）
     - 主从runid匹配，且offset差距在backlog大小内
     - 从节点有部分数据，但需要追赶

   - 详细过程：

     1. 连接重试：从节点发送 PSYNC \<runid\> \<offset\>到主节点（提供上次的 runid 和已复制 offset）
     2. 主节点校验：主节点检查 runid 是否匹配（主重启 runid 变，导致失败回退全量）。然后比较 offset，如果缺失部分在 backlog 中，恢复 CONTINUE \<new_offset\>
     3. 提取增量：主节点从backlog（环形缓冲区）取出offset之后的写命令，发送给从节点
     4. 从节点应用：从节点逐条执行收到的命令，更新自身数据和offset
     5. 同步完成：从节点发送ACK，主节点确认，继续正常命令传播

   - 涉及参数：

     - repl-backlog-size \<size\>：backlog 大小（默认 1MB），越大支持更大差距的增量（推荐根据写负载调高，如 64MB）。
     - repl-backlog-ttl \<seconds\>：backlog 空闲后释放时间（默认 3600s），0 表示永不释放。
     - min-replicas-to-write \<num\>：主节点至少需要 num 个从节点才能写（提升一致性）。

   - 特点与开销：

     - 时间：只需要几秒，取决于缺失命令量
     - 内存：backlog固定大小，低开销
     - 带宽：只传命令，高效。但如果backlog溢出（写太快），强制全量。

     全量同步 vs. 增量同步对比

     使用表格总结区别，便于理解：

     | 方面         | 全量同步 (Full Resynchronization) | 增量同步 (Partial Resynchronization)       |
     | ------------ | --------------------------------- | ------------------------------------------ |
     | **触发时机** | 初始、长时间中断、runid 不匹配    | 短暂中断、runid 匹配、offset 在 backlog 内 |
     | **传输内容** | 整个 RDB 快照 + 缓冲区增量命令    | 只缺失的写命令                             |
     | **命令**     | PSYNC → FULLRESYNC                | PSYNC → CONTINUE                           |
     | **开销**     | 高（内存、带宽、时间）            | 低（只命令）                               |
     | **恢复速度** | 慢（加载 RDB）                    | 快（应用命令）                             |
     | **适用场景** | 大数据集初始同步                  | 生产环境高可用，减少 downtime              |
     | **失败回退** | 无（已是最全面）                  | 回退到全量                                 |

   注意事项与优化

   - ​	优先级Redis总是先尝试增量（PSYNC），失败则全量
   - 问题：全量在大数据集（>10GB）时可能导致主节点OOM或网络拥堵；增量依赖backlog，如果写QPS高，需要增大大小
   - 监控：用INFO Replication查看master_repl_offset、slave_repl_offset（延迟=主-从）和repl_backlog_active。
   - 生产建议：启用repl-disk-sync优化全量；调大backlog减少全量出发。结合哨兵自动处理中断
   - 版本差异：Redis2.8引入PSYNC；更高版本优化无盘复制。



## 四、主从复制存在的问题

Redis主从复制虽然提供了数据冗余和读写分离，但作为异步复制机制，它存在一些固有问题：

1. 单点故障（Single Point of Failue）

   - 描述：主节点是唯一写入口，如果主节点崩溃，从节点无法接管写操作，导致整个系统写不可用。从节点虽有数据副本，但默认只读
   - 影响：服务中断，需要手动干预切换主从角色（e.g.，执行REPILICAOF no one使从变主）
   - 解决方案：结合Redis Sentinel（哨兵）或Redis Cluster实现自动故障转移（failover）。哨兵可监控并选举新主。

2. 数据延迟（Replication Lag）

   - 描述：复制是异步的，主节点写命令后不等待从节点确认就返回成功。从节点应用命令有延迟（毫秒到秒级），高负载或网络问题时延迟增大。
   - 影响：读从节点可能读到旧数据，导致不一致（最终一致性，而非强一致）。例如，电商订单系统可能出现“已支付但库存未扣减”
   - 解决方案：
     - 监控 INFO Replication中的 slave_repl_offset与master_repl_offset差值
     - 配置min-replicas-to-write \<num\> 和 min-replicas-max-lag \<seconds\>：主节点至少需要num个从节点再lag内才能写
     - 优化网络，使用级联拓扑减少主负载

3. 全量同步开销大

   - 描述：全量同步需要传输整个RDB文件，fork子进程消耗内存（几乎双倍），网络带宽高。大数据集（>10GB）时同步可能几分钟，甚至导致OOM
   - 影响：新从节点加入或连接频繁时，主节点压力大，影响性能。无盘复制虽然优化I/O，但内存开销更大
   - 解决方案：
     - 增大repl-backlog-size（默认1MB）以减少全量触发，支持更多增量同步
     - 使用SSD磁盘，调优repl-diskless-sync-delay批量处理多从同步
     - 避免大数据集频繁重启主节点 

4. 脑裂问题

   - 描述：网络分区时，从节点可能误判主节点下线，自行提升为主，导致多个“主节点”并存。数据写入不同主，恢复后冲突。
   - 影响：数据不一致，需要手动合并
   - 解决方案：使用哨兵的quorum机制（多数派投票）避免误判。配置奇数个哨兵结点，确保网络稳定。

5. 数据丢失风险

   - 描述：主节点崩溃时，未同步到从节点的写命令丢失（异步性质），如果主未持久化（RDB /AOF），重启后数据也丢
   - 影响：RPO（Recovery Point Objective）较高，可能丢失秒级数据
   - 解决方案：启用AOF（appendfsync everysec）在主节点上，确保写命令持久化。结合哨兵快速failover。

6. 扩展性和管理复杂性

   - 描述：从节点过多时，主节点复制缓冲区压力大；级联拓扑中延迟累计。手动管理角色切换麻烦
   - 影响：大规模集群时，运维成本高
   - 解决方案：迁移到Redis Cluster，支持自动分片和failover。使用工具如Redis Sentinel或外部 orchestrator自动化管理

7. 安全和兼容性问题

   - 描述：默认无加密，数据传输明文（易窃听）。不同Redis版本间复制可能不兼容
   - 影响：生产环境安全隐患
   - 解决方案：启用SSL/TLS（tls-replication yes从Redis 6.0支持）。统一版本，避免跨大版本复制。

8. 总结与建议

   主从复制适合中小规模、读多写少场景，但不适合强一致性需求（如金融）。生产中，推荐结合哨兵或集群缓解问题。监控指标包括延迟、offset和backlog使用率。如果问题频繁，考虑切换到更高级架构如Cluster。

   实际部署时，测试failover场景确保RTO（Recovery Time Objective）在可接受范围内。





## 五、Redis 哨兵机制的基本概念和工作原理

### 哨兵机制的基本概念

Redis Sentinel（哨兵）是一种高可用解决方案，用于监控Redis主从复制架构，实现自动故障转移（failover）、配置管理和通知。它不是Redis的核心组件，而是独立的进程（可运行在单独服务器上），从Redis2.8稳定版本引入。Sentinel解决了主从复制的单点故障问题，使系统在主节点崩溃时自动切换到从节点作为新主。

- 核心角色：
  - 哨兵节点：多个Sentinel进程组成集群（推荐3-5个奇数个），互相监控以避免单点
  - 被监控节点：Redis主从实例
- 主要功能：
  - 监控：持续检查主从节点的健康状态
  - 故障转移：主节点下线时，自动选举并提升一个从节点为主
  - 配置更新：通知客户端新节点信息
  - 通知：通过订阅频道或脚本警报管理员
- 优势：无须手动干预，实现秒级failover；支持主从拓扑的自动化管理
- 局限：Sentinel本身是最终一致性，不保证强一致；不处理数据分区（需要结合Cluster）

Sentinel适用于读写分离的高可用场景，如电商缓存或实时数据系统，但不适合超大规模（>100节点），此时用Redis Cluster。

### Redis哨兵的工作原理

Sentinel的工作基于分布式算法，类似于Raft的共识机制，包括心跳检测、客观下线判断和领导者选举。多个Sentinel形成quorum（法定人数）来决策，避免脑裂。过程分为监控、故障检测、failover和恢复阶段。

1. 初始化与配置

   - Sentinel通过配置文件（sentinel.conf）启动，指定监控的主节点（sentinel monitor \<master-name\> \<ip\> \<port\> \<quorum\>）

   - 示例配置：

     ```bash
     sentinel monitor mymaster 127.0.0.1 6379 2  # quorum=2，表示至少 2 个哨兵同意才下线
     sentinel down-after-milliseconds mymaster 30000  # 下线判断超时 30s
     sentinel failover-timeout mymaster 180000  # failover 超时 3min
     sentinel parallel-syncs mymaster 1  # failover 时并行同步从节点数
     port 26379  # Sentinel 端口
     ```

   - Sentinel启动后，自动发现从节点和其他Sentinel（通过主节点的INFO Replication和PUB/SUB通信）

2. 监控阶段

   - 心跳检测：每个Sentinel每秒向主从节点发送PING（间隔可配置）。如果无响应，计时超时
   - 信息交换：Sentinel间每10s交换视图（通过Sentinel的PUB/SUB频道，如 __sentinel__:hello），共享对节点的判断。
   - 客户端交互：客户端可查询Sentinel（如SENTINEL get-master-addr-by-name mymaster）获取当前主地址
   
3. 故障检测

   - 主观下线（Subjectively Down, SDOWN）：单个Sentinel如果PING超时，标记节点为主观下线
   - 客观下线（Objectively Down, ODOWN）：该Sentinel向其他Sentinel询问，如果达到quorum数同意，则标记为客观下线。仅主节点ODOWN触发failover；从节点或Sentinel只用于监控

4. 故障转移（Failover）

   - 领导者选举：ODWON后，Sentinel间使用Raft-like算法选举领导者（Leader）
     - 过程：一个Sentinel发送`SENTINEL is-master-down-by-addr`投票请求。其他Sentinel投票（基于优先级，如uptime、ID）
     - 胜者需要超过半数（quorum+1），成为领导者。选举失败重试。
   - 新主选举：领导者从可用节点中挑选新主。选择规则（优先级降序）：
     1. 优先级（replica-priority配置，默认100；0表示不选）
     2. 复制偏移（offset）最大（数据最完整）
     3. runid最小（启动最早）
   - 切换过程：
     1. 领导者向选中的从节点发送`REPLICAOF no one`，使其成为新主
     2. 更新其他从节点的`REPLICAOF`指向新主
     3. 并行同步(`parallel-syncs`)从节点到新主（全量或增量）
     4. 更新Sentinel配置，通知客户端（通过订阅`__sentinel__:hello`）
   - 时间：通常5--30秒，取决于网络和配置

5. 恢复与通知

   - 旧主恢复后，自动成为新的从节点（`sentinel failover-time `内）
   - 通知：可配置脚本（`sentinel notification-script`）发邮件或警报
   - 监控：用SENTINEL命令或INFO查看状态

### **注意事项：**

- quorum设置：推荐（N/2+1），N为Sentinel数。太低容易误判，太高难决策。
- 网络分区：奇数Sentinel避免平票；部署在不同机器/区
- 与Cluster区别：Sentinel只管单个主从组；Cluster内置类似机制，支持分片。
- 生产建议：至少3Sentinel；结合AOF/RDB持久化，测试failover。



## 六、Redis 哨兵中的领导者选举和新主节点挑选

在Redis Sentinel（哨兵）机制中，领导者选举（Leader Election）是故障转移（failover）过程中的关键步骤。当主节点被客观下线（ODOWN）后，多个哨兵需要选举出一个领导者来执行failover操作。这基于Raft-like的共识算法，确保只有一个哨兵领导整个过程，避免混乱。选举是分布式的，依赖哨兵间的通信。

### 选举过程细节

1. 触发选举：主节点ODWON后，第一个检测到的哨兵会发起选举。它向其他哨兵发送`SENTINEL is-master-down-by-addr`命令，请求投票支持自己成为领导者。
2. 投票规则：
   - 每个哨兵收到请求后，检查是否已投票（每个epoch只投一次）
   - 如果未投，回复同意（基于请求者的优先级，如uptime长短、ID大小）
   - 拒绝条件：已投他人、请求者配置不符，或网络问题
3. 获胜条件：
   - 请求者收集投票，如果超过quorum（法定人数，通常N/2+1，N为哨兵总数）+多数哨兵同意，则成为领导者
   - quorum来自配置`sentinel monitor ... \<quorum\>`，推荐奇数哨兵（如3个，quorum=2）
4. 重试机制：
   - 如果无人获胜（e.g.，平票或超时），进入新epoch（选举轮次） ，随机延迟后重选
   - 超时由`sentinel failover-timeout`控制（默认180s）
5. 特点：
   - 异步、非阻塞：哨兵继续监控
   - 防止脑裂：多数派机制确保网络分区时，只有一侧选举成功
   - 时间：通常毫秒到秒级，取决于网络

### 示例

假设 3 个哨兵（S1、S2、S3），quorum=2：

- S1 发起，S2 和 S3 同意 → S1 领导者（3>2）。
- 如果 S2 不同意，S1 只得 2 票（S1 自己 + S3）→ 若 quorum=2，仍胜（但多数派需 >1.5，即 2）。

选举失败率低，但网络抖动时可能多次重试。监控用 SENTINEL 命令查看当前领导者。

### Redis哨兵中的新主节点挑选

领导者选举成功后，领导者负责从可用从节点（Replicas）中挑选一个作为新主节点（New Master）。挑选基于优先级原则，确保新主数据最完整、稳定。这是一个确定性过程，非选举。

#### 挑选过程细节

1. 候选筛选：
   - 领导者从主节点的从节点列表（通过INFO Replication获取）中过滤可用候选：
     - 必须在线（非SDOWN/ODOWN）
     - 复制连接正常（offset有效）
     - 配置允许（replica-priority > 0）
2. 挑选规则（优先级降序，逐项比较）：
   1. 从节点优先级（replica-priority）:配置在redis.conf（默认100）。越高越优先；0表示排除。自定义如地理位置或硬件。
   2. 复制偏移量（replication offset）:offset越大（数据越接近主），越优先。确保最小数据丢失。
   3. 运行ID（runid）：字母序最小（启动最早）的优先。runid是节点唯一标识。
3. 执行切换：
   - 向选中的节点发送`REPLICARION no one`，使其独立为主
   - 更新其他从节点的`REPLICAOF`指向新主
   - 通知所有哨兵和客户端新主地址（通过PUB/SUB）
   - 并行同步其他从节点（配置`sentinel parallel-syncs`，默认1，避免过多全量同步）
4. 恢复旧主：旧主上线后，自动变为新主的从节点
5. 特点：
   - 确定性：相同条件下，所有哨兵会选相同节点。
   - 时间：几秒，取决于从节点数
   - 自定义：可通过脚本(`sentinel client-reconfig-script`)干预

### 示例

假设主节点下3个从节点：

- Replica1: priority=100,  offset=1000，runid=“a”
- Replica2: priority=90,  offset=950, runid="b"
- Replica3: priority=100,  offset=990, runid="c"

挑选：Replica1和Replica3的priority相同-->比较offset，Replica1>Replica3-->选择Replica1

注意事项：

- 配置建议：设置不同priority避免平局；quorum过低容易误选
- 问题：从节点延迟大时，可能选择次优节点。结合AOF最小化丢失
- 监控：`SENTINEL failover mymaster`手动触发测试；日志查看挑选细节。

### Redis Sentinel 配置示例

以下是一个典型的 Redis Sentinel 配置文件（sentinel.conf）的示例。假设我们监控一个名为 “mymaster” 的主节点（IP: 127.0.0.1，端口: 6379），有 3 个哨兵节点，quorum 设置为 2。生产环境中，建议将哨兵部署在不同机器上，并调整参数根据实际负载。

```bash
# Sentinel 监听端口（默认 26379，与 Redis 端口区分）
port 26379

# 守护进程模式
daemonize yes

# 日志文件
logfile "/var/log/redis/sentinel.log"

# 监控的主节点：master-name ip port quorum
# quorum 表示至少多少哨兵同意才客观下线
sentinel monitor mymaster 127.0.0.1 6379 2

# 下线判断超时（毫秒），默认 30s
sentinel down-after-milliseconds mymaster 30000

# failover 超时（毫秒），默认 180s
sentinel failover-timeout mymaster 180000

# failover 时并行同步从节点数，默认 1（避免过多全量同步）
sentinel parallel-syncs mymaster 1

# 如果主节点有密码
sentinel auth-pass mymaster mypassword

# 通知脚本（可选，当 failover 发生时执行）
sentinel notification-script mymaster /path/to/notify.sh

# 客户端重配置脚本（可选，更新客户端配置）
sentinel client-reconfig-script mymaster /path/to/reconfig.sh
```

- 启动Sentinel：使用`redis-sentinel /path/to/sentinel.conf`命令启动。多个哨兵共享类似配置，Sentinel会自动发现彼此
- 注意：主从节点的redis.conf中需要配置`replica-priority`（从节点优先级，默认100）来影响新主挑选。例如，从节点设置`replica-priority 100`

### Redis Sentinel 的 Java 代码示例

以下是使用 Java 的 Redis Sentinel 示例代码。我选择了 Jedis（一个流行的 Java Redis 客户端）来实现，因为它支持 Sentinel 模式。示例包括：

- 连接 Sentinel，获取当前主节点地址。
- 读写操作（自动处理 failover）。
- 订阅 failover 事件（监控主节点切换）。

首先，确保在项目中添加 Jedis 依赖（Maven 示例）：

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>5.1.2</version>  <!-- 最新版本根据需要调整 -->
</dependency>
```

Java 代码示例（一个简单的类）：

```java
import redis.clients.jedis.*;
import redis.clients.jedis.params.SetParams;
import redis.clients.jedis.util.JedisURIHelper;

import java.util.HashSet;
import java.util.Set;

public class RedisSentinelExample {
    public static void main(String[] args) {
        // Sentinel 节点列表（IP:端口）
        Set<String> sentinels = new HashSet<>();
        sentinels.add("127.0.0.1:26379");
        sentinels.add("127.0.0.1:26380");
        sentinels.add("127.0.0.1:26381");

        // 创建 JedisSentinelPool（连接池，自动处理 failover）
        JedisSentinelPool pool = new JedisSentinelPool("mymaster", sentinels, new JedisPoolConfig());

        // 获取连接（到当前主节点）
        try (Jedis jedis = pool.getResource()) {
            // 示例写操作
            jedis.set("key", "value", SetParams.setParams().ex(60));  // 设置键，过期 60s
            System.out.println("Set key successfully");

            // 示例读操作
            String value = jedis.get("key");
            System.out.println("Value: " + value);
        }

        // 订阅 failover 事件（可选，监控主切换）
        subscribeToFailoverEvents(sentinels);

        // 手动触发 failover（生产慎用，仅测试）
        triggerFailover(sentinels);

        // 关闭池
        pool.close();
    }

    private static void subscribeToFailoverEvents(Set<String> sentinels) {
        // 使用一个 Sentinel 连接订阅 +switch-master 频道
        Jedis jedis = new Jedis("127.0.0.1", 26379);  // 任意一个 Sentinel
        JedisPubSub pubSub = new JedisPubSub() {
            @Override
            public void onMessage(String channel, String message) {
                System.out.println("Failover Event: " + message);  // e.g., "mymaster old_ip old_port new_ip new_port"
            }
        };
        new Thread(() -> jedis.subscribe(pubSub, "+switch-master")).start();  // 异步订阅
    }

    private static void triggerFailover(Set<String> sentinels) {
        // 使用任意 Sentinel 触发 failover
        try (Jedis jedis = new Jedis("127.0.0.1", 26379)) {
            String result = jedis.sentinelFailover("mymaster");
            System.out.println("Failover triggered: " + result);
        }
    }
}
```

**解释**：

- JedisSentinelPool：自动发现主节点，支持 failover 时无缝切换。
- 订阅 +switch-master：当领导者选举成功并切换新主时，收到通知。
- 手动 failover：用 sentinelFailover 命令测试。

**运行注意**：确保 Sentinel 已配置并运行（如前述 sentinel.conf）。如果有密码，添加 JedisSentinelPool 的重载构造函数传入密码。

**扩展**：对于更高级的使用，可以集成 Spring Data Redis，它内置 Sentinel 支持。



## 七、Redis 集群的基本概念和原理

### Redis集群的基本概念

Redis Cluster是Redis的官方分布式实现，从Redis3.0引入，用于大规模数据存储和高可用。它将数据自动分片（sharding）到多个节点，支持动态扩展、自动故障转移和负载均衡，而无需外部代理（如Sentinel只管单个主从组）。

- 核心组件：
  - 节点（Node）：每个Redis实例作为一个节点。集群至少3主节点（推荐3-6主+等量从），每个主节点有0-N个从节点（Replica）
  - 槽位（Hash Slot）：数据分片的单位，总共16384个槽位（0-16383）。每个键通过CRC16哈希算法映射到槽（`HASH_SLOT = CRC16(key) mod 16384`）
  - 客户端：如Jedis或Lettuce，支持集群模式，负责路由请求到正确节点。
- 主要功能：
  - 数据分片：数据分布到多个节点，避免单点瓶颈。
  - 高可用：内置failover，从节点自动提升为主
  - 动态伸缩：在线添加/移除节点，重新分配槽
  - 一致性：最终一致性，支持异步复制
- 优势：水平扩展（支持TB级别数据）、无单点、原生支持。适用于大数据、高并发场景，如分布式缓存或数据库。
- 局限：不支持多键操作（e.g.，MGET如果键在不同槽）；事务限于单槽；不适合小规模（<3节点）

Redis Cluster与Sentinel的区别： Cluster内置分片和failover，Sentinel只用于非分片的主从。

### Redis集群的原理

Cluster的工作基于去中心化架构，使用Gossip协议通信，确保节点间状态同步。过程包括集群初始化、数据路由、通信和failover。

1. 集群初始化：
   - 节点通过`CLUSTER MEET \<ip\> \<port\>`命令加入集群（握手，建立连接）
   - 分配槽：手动（`CLUSTER ADDSLOTS`）或自动（工具如redis-cli --cluster create）。每个主节点分担部分槽。
   - 配置：redis.conf中启用`cluster-enabled yes`，设置`cluster-node-timeout 15000`（节点超时）等。
2. 数据路由原理：
   - 哈希槽计算：键key的槽 = CRC16(KEY) mod 16384。带哈希标签（大括号）的键如 {user:1}:name）只哈希标签部分(`"user:1"`)，确保相关键在同槽。
   - 客户端路由：客户端获取集群状态（`CLUSTER SLOTS`）,缓存槽-节点映射。请求时，直接发到对应节点。如果槽迁移中，节点返回`MOVED/ASK`重定向。
   - 重定向：MOVED表示永久迁移，ASK表示临时（迁移中）
3. 节点通信（Gossip协议）：
   - 每个节点每秒随机ping几个节点，交换状态（PING/PONG）
   - 传播信息：节点失败、槽分配、新节点加入
   - 效率：对数级传播，确保集群视图一致
4. 故障转移（failover）:
   - 检测：节点超时（`cluster-node-timeout`）后，从节点投票（类似Sentinel的客观下线）。需要多数主节点（主节点数为N的话，需要 > N/2）
   - 选举：从节点竞争为新主，基于优先级（replica-priority）、offset和runid
   - 过程：新主广播`FAILOVER_AUTH_REQUEST`,或多数票后接管槽，更新集群状态。
   - 时间：几秒到几十秒
5. 动态伸缩：
   - 添加节点：`CLUSTER MEET`加入，然后用`redis-cli --cluster reshard`迁移槽。
   - 移除节点：先迁移其槽到其他节点，再`CLUSTER FORGET`
   - 自动重平衡：工具支持

### 配置示例（redis.conf 片段）

```bash
cluster-enabled yes
cluster-config-file nodes.conf  # 集群状态文件
cluster-node-timeout 15000     # 超时 ms
cluster-replica-validity-factor 10  # 从节点有效性因子
```

#### 注意事项

- **监控**：用 CLUSTER INFO、CLUSTER NODES 查看状态。
- **生产建议**：至少 3 主 + 3 从；用奇数主避免平票；客户端需支持集群模式。
- **问题**：网络分区可能脑裂；大数据迁移慢。



## 八、Redis 集群中数据的分区方式

Redis Cluster使用数据分片（Sharding）机制将数据分布到多个节点上，确保负载均衡和可扩展性。这种分区方式基于哈希槽（Hash Slot），而非直接基于键的数量或节点数。它是客户端驱动的（Client-Side Sharding），客户端负责计算键所属槽并路由请求。

### 分区原理

- 哈希槽（Hash Slot）：整个集群固定有16384个槽（0-16383），每个槽代表一个数据分区单位。每个主节点（Master）负责一部分槽（可不均匀，但推荐均衡）
- 键到槽的映射：
  - 对于键key，计算槽位：slot = CRC16(key) % 16384
  - 支持标签（Tags）：如果键包含 {tag}，只哈希 tag 部分（e.g., user:{100}:name 和 user:{100}:age 在同一槽，确保相关键共存，支持多键操作如事务）
  - 无标签键：哈希整个键
- 数据分布：
  - 集群初始化时，槽均匀分配给主节点（e.g.，3主节点各自约5461个槽）
  - 每个槽只能属于一个主节点，但主节点可有从节点（Replica）复制数据。
- 路由过程：
  1. 客户端获取集群状态（CLUSTER SLOTS命令），缓存槽-节点映射
  2. 对于操作，计算键的槽，发送到对应节点
  3. 如果槽不在当前节点（e.g.，迁移中），节点返回重定向：
     - MOVED \<slot\> \<new_node\>：永久迁移，客户端更新缓存。
     - ASK \<slot\> \<temp_node\>：临时重定向（迁移中），不更新缓存。
- 一致性：最终一致性。从节点不持有槽，只复制主数据。

### 优缺点

| 方面     | 优点                                       | 缺点                                          |
| -------- | ------------------------------------------ | --------------------------------------------- |
| **效率** | 固定槽数，计算快；客户端路由，无代理开销。 | 多键操作限于同槽（否则需多次请求）。          |
| **扩展** | 易重分配槽，支持动态伸缩。                 | 标签滥用可能导致热点（hot keys）。            |
| **适用** | 大规模数据，TB 级。                        | 小集群（<3 节点）不推荐；**不支持跨槽事务**。 |

### 注意事项

- 热点问题：如果键分布不均（e.g., 许多键哈希到同一槽），导致节点负载不均。解决方案：合理设计键名，使用标签。
- 版本：Redis 3.0+ 支持；更高版本优化重定向。
- 监控：用 CLUSTER INFO 查看槽分配状态。

## 九、Redis 集群的动态伸缩

Redis Cluster支持在线动态伸缩，允许添加或移除节点，而不中断服务。这通过槽迁移和集群重平衡实现，确保数据连续可用。过程是半自动的，需要工具如`redis-cli`辅助。

### 动态扩展（Scale Out：添加节点）

- 过程：

  1. 添加新节点：启动新Redis实例，配置`cluster-enabled yes`。用`CLUSTER MEET \<existing_node_ip\> \<port\>`加入集群（从任意现有节点）
  2. 分配槽：新节点初始无槽。用`redis-cli --cluster reshard <host:port> `（连接任意节点）迁移槽：
     - 指定源节点（或all），目标为新节点，迁移槽数（e.g.，从其他主迁移1000槽）
     - 迁移时，源节点将键数据（RDB格式）传输到目标，更新集群状态
  3. 添加从节点（可选）：为新主添加Replica，用`CLUSTER REPLICATE \<master_id\>`
  4. 重平衡：用`redis-cli --cluster rebalance <host:port>`自动均衡槽分布

- 特点：在线迁移，客户端通过重定向处理。迁移中键可读，但写可能短暂阻塞

- 示例命令：

  ```bash
  # 添加节点
  redis-cli -h existing_host -p 7000 cluster meet new_host 7003
  
  # 迁移槽
  redis-cli --cluster reshard existing_host:7000 --cluster-to new_node_id --cluster-slots 1000
  ```

### 动态收缩（Scale In：移除节点）

- 过程：
  1. 迁移槽：用 redis-cli --cluster reshard  --cluster-from  --cluster-to  将移除节点的槽迁移到其他节点。
  2. 移除节点：槽清空后，用 CLUSTER FORGET  从集群视图移除（每个节点执行，避免孤岛）。
  3. 处理从节点：如果移除主，其从节点需先重新分配（CLUSTER REPLICATE 到其他主）。
  4. 重平衡：可选再平衡剩余槽。
- 特点：确保无数据丢失，但迁移时间取决于数据量（GB 级可能几分钟）。

### 优缺点

| 方面       | 优点                                        | 缺点                                        |
| ---------- | ------------------------------------------- | ------------------------------------------- |
| **可用性** | 在线操作，无 downtime；自动 failover 兼容。 | 迁移大数据时，网络/CPU 开销大；需手动工具。 |
| **灵活性** | 支持水平扩展到数百节点。                    | 移除节点前必须清空槽，否则失败。            |
| **性能**   | 重平衡后负载均衡。                          | 迁移中可能短暂重定向风暴。                  |

#### 注意事项

- **工具**：推荐 redis-cli --cluster；Ruby 脚本 redis-trib.rb 已弃用。
- **高可用**：添加时优先加主+从；收缩时避免减少到 <3 主。
- **监控**：用 CLUSTER NODES 查看节点状态，CLUSTER INFO 检查迁移进度。
- **生产建议**：测试环境模拟伸缩；结合容器化（如 Kubernetes）自动化。



## 十、生产示例

假设我们有一个中大型电商平台的生产环境（如一个在线购物网站），每天处理数百万用户请求。Redis在这里被用作：

- 缓存层：存储热门商品信息、用户推荐列表，减少数据库查询压力
- 会话存储：管理用户登录状态和购物车数据
- 实时统计：如PV/UV计数、限流器
- 消息队列：使用Pub/Sub或Stream处理订单通知

在这种场景下，数据量可能达到TB级别，读写QPS高达10万+。为了确保高可用性和扩展性，我们会结合Sentinel（用于主从高可用）和Cluster（用于分片扩展）。下面分别讲解Sentinel和Cluster的部署、配置。注意：这些是基于Redis 6.x/7.x的通用实践，实际部署需考虑服务器规格（如至少8核CPU、32GB内存的机器）、网络（低延迟内网）和监控（如Prometheus + Grafana）。

混合使用建议：在电商场景下，先用Sentinel搭建小集群，数据增长后再迁移到Cluster。备份策略：定期RDB/AOF备份到S3或NFS。

### Redis Sentinel的部署和配置

Sentinel是Redis的高可用解决方案，用于主从复制架构中监控主节点（Master），自动故障转移（Failover）。适合中小规模场景，不支持自动分片，但能实现99.99%的可用性。

#### 部署步骤：

> 假设3台服务器：192.168.1.101，192.168.1.102，192.168.1.103

1. 安装Redis：在每台服务器上安装Redis
2. 配置主从：一台作为Master（101），其余作为Slave（102、103）。Slave通过`replicaof \<master-ip\> 6379`配置同步
3. 部署Sentinel：在每台服务器上运行Sentinel实例（至少3个，形成奇数仲裁）。Sentinel是独立的进程，使用`redis-sentinel /path/to/sentinel.conf`启动
4. 网络配置：确保端口开放（6379 for Redis, 26379 for Sentinel），并设置防火墙规则
5. 测试Failover：手动kill Master，观察Sentinel选举新Master
6. 集成客户端：使用支持Sentinel的客户端如Jedis（Java）或Lettuce，连接时指定Sentinel节点列表。

#### 配置示例：

sentinel.conf文件，复制到每台Sentinel节点

```bash
# 基本设置
port 26379  # Sentinel端口
dir /var/redis/sentinel  # 工作目录
logfile /var/log/redis/sentinel.log

# 监控的Master（my-master是别名，2是仲裁数，即至少2个Sentinel同意才Failover）
sentinel monitor my-master 192.168.1.101 6379 2

# Failover参数
sentinel down-after-milliseconds my-master 30000  # 节点失联30秒视为down
sentinel failover-timeout my-master 180000  # Failover超时3分钟
sentinel parallel-syncs my-master 1  # Failover时并行同步Slave数

# 认证（可选，如果Redis有密码）
sentinel auth-pass my-master mypassword

# 通知脚本（可选，Failover时执行）
sentinel notification-script my-master /scripts/notify.sh
```

Master的redis.conf示例（简化）：

```bash
port 6379
requirepass mypassword  # 密码
appendonly yes  # 启用AOF持久化
replica-announce-ip 192.168.1.101  # 公告IP（云环境用）
```

Slave的redis.conf（与Master类似，加上）：

```bash
replicaof 192.168.1.101 6379
masterauth mypassword
```

#### 生产注意：

- Sentinel节点最好与Redis节点分离（或至少不与Master同机），避免单点故障。
- 结合VIP（Virtual IP）或DNS实现客户端无缝切换。
- 监控：Sentinel日志 + Redis INFO命令检查replication状态。
- 缺点：不自动分片，如果数据增长，需要手动迁移。

### Redis Cluster 的部署和配置

Cluster是Redis的分布式解决方案，支持自动分片（16384个槽位）、故障转移和结点动态添加/移除。适合大数据量、高并发场景，能线性扩展到数百节点。

#### 部署步骤：

> 假设6台服务器：101-106，每2台一组主从，共3主3从

1. 安装Redis：每台服务器安装Redis
2. 配置节点：每个节点启用Cluster模式，无需手动主从
3. 创建Cluster：使用`redis-cli --cluster create`命令初始化（指定所有节点IP:端口）
4. 添加节点（可选）：用`redis-cli --cluster add-node`动态扩展
5. 网络：开放6379（数据）和16379（总线）端口。Cluster节点间需要全连通。
6. 测试：用`redis-cli -c`连接，插入数据观察分片；kill一个Master观察自动Failover
7. 客户端：使用支持Cluster的客户端（如JedisCluster），他会自动处理重定向

#### 配置示例：

redis.conf文件，复制到所有节点

```bash
# 基本设置
port 6379
dir /var/redis
logfile /var/log/redis.log

# Cluster模式启用
cluster-enabled yes
cluster-config-file nodes.conf  # 节点配置文件（自动生成）
cluster-node-timeout 15000  # 节点超时15秒
cluster-require-full-coverage no  # 允许部分槽不可用继续服务（生产慎用）

# 持久化（推荐结合AOF+RDB）
appendonly yes
appendfilename "appendonly.aof"

# 认证（可选）
requirepass mypassword
masterauth mypassword  # 用于节点间认证

# 其他优化
protected-mode no  # 关闭保护模式（内网用）
```

创建Cluster命令示例：

```bash
redis-cli --cluster create 192.168.1.101:6379 192.168.1.102:6379 192.168.1.103:6379 192.168.1.104:6379 192.168.1.105:6379 192.168.1.106:6379 --cluster-replicas 1 --cluster-yes
```

（--cluster-replicas 1 表示每个主配1个从）

#### 生产注意：

- 最小3主节点（奇数避免脑裂），每个主至少1从。
- 数据迁移：用 redis-cli --cluster reshard 重新分配槽位。
- 监控：CLUSTER INFO 和 CLUSTER NODES 命令查看状态；集成外部工具如Redis_exporter。
- 缺点：多键操作（如MGET）需同槽，否则需客户端处理；Pub/Sub广播全节点。
- 与Sentinel比较：Cluster内置Failover，无需额外Sentinel，但配置更复杂。

