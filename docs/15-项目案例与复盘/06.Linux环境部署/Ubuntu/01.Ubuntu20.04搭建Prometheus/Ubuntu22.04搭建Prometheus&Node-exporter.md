# Ubuntu22.04搭建Prometheus&Node-exporter

## 一、Prometheus

### 1.1 安装 Prometheus

1. 创建 Prometheus 用户

   为了安全起见，Prometheus 不应以 root 用户运行。我们创建一个系统用户 prometheus：

   ```bash
   sudo useradd --system --no-create-home --shell /bin/false prometheus
   ```

2. 下载 Prometheus

   访问 Prometheus 官网下载页面，获取最新版本的二进制文件。截至 2025年3月，最新版本可能是 2.48.0 或更高版本。你可以检查 

   Prometheus 下载页面

    获取最新版本号。以下以 2.48.0 为例：

   ```bash
   cd /tmp wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
   ```

3. 解压并移动文件

   解压下载的文件，并将二进制文件移动到 `/usr/local/bin/`：

   ```bash
   tar -xzf prometheus-2.48.0.linux-amd64.tar.gz sudo mv prometheus-2.48.0.linux-amd64/prometheus /usr/local/bin/ sudo mv prometheus-2.48.0.linux-amd64/promtool /usr/local/bin/ sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool
   ```

4. 创建配置目录和数据目录

   Prometheus 需要一个目录来存储配置文件和数据：

   ```bash
   sudo mkdir /etc/prometheus 
   sudo mkdir /var/lib/prometheus 
   sudo chown prometheus:prometheus /etc/prometheus /var/lib/prometheus
   ```

5. 移动默认配置文件

   将解压后的 `prometheus.yml` 和相关目录移动到 `/etc/prometheus/`：

   ```bash
   sudo mv prometheus-2.48.0.linux-amd64/prometheus.yml /etc/prometheus/ sudo mv prometheus-2.48.0.linux-amd64/consoles /etc/prometheus/ sudo mv prometheus-2.48.0.linux-amd64/console_libraries /etc/prometheus/ sudo chown -R prometheus:prometheus /etc/prometheus
   ```

6. 验证 Prometheus 安装

   检查 Prometheus 版本，确保安装成功：

   ```
   prometheus --version
   ```

   输出类似：

   ```
   prometheus, version 2.48.0 (branch: HEAD, revision: ...)
   ```

   

### 1.2 配置 Prometheus 服务并设置开机自启动

1. 创建 systemd 服务文件

   创建一个 systemd 服务文件来管理 Prometheus：

   ```bash
   sudo nano /etc/systemd/system/prometheus.service
   ```

   写入以下内容：

   ```ini
   [Unit] 
   Description=Prometheus Monitoring System 
   Wants=network-online.target 
   After=network-online.target 
   
   [Service] 
   User=prometheus 
   Group=prometheus 
   Type=simple 
   ExecStart=/usr/local/bin/prometheus \  
   --config.file /etc/prometheus/prometheus.yml \  
   --storage.tsdb.path /var/lib/prometheus/ \  
   --web.console.templates=/etc/prometheus/consoles \  
   --web.console.libraries=/etc/prometheus/console_libraries 
   Restart=always 
   
   [Install] 
   WantedBy=multi-user.target
   ```

   

2. 重新加载 systemd 并启动 Prometheus

   启用并启动 Prometheus 服务：

   ```bash
   sudo systemctl daemon-reload 
   sudo systemctl start prometheus 
   sudo systemctl enable prometheus
   ```

3. 验证 Prometheus 运行状态

   检查 Prometheus 是否正常运行：

   ```bash
   sudo systemctl status prometheus
   ```

   如果服务正常运行，输出中会显示` active (running)`。

4. 访问 Prometheus Web 界面

   Prometheus 默认运行在 9090 端口。使用浏览器访问：

   ```text
   http://<your-server-ip>:9090
   ```

   你应该能看到 Prometheus 的 Web 界面。点击 Status-> Targets，目前应该只有 Prometheus 自身的目标（localhost:9090）。





## 二、 安装和配置 Node Exporter

Node Exporter 用于收集服务器的系统指标，Prometheus 会通过 HTTP 拉取这些指标。

### 2.1 安装 Node Exporter

1. **创建 Node Exporter 用户**
    同样，为了安全起见，创建一个系统用户 node_exporter：

   ```bash
   sudo useradd --system --no-create-home --shell /bin/false node_exporter
   ```

   

2. **下载 Node Exporter**
    访问 Prometheus 官网下载页面，获取最新版本的 Node Exporter。截至 2025年3月，最新版本可能是 1.7.0 或更高版本。以下以 1.7.0 为例：

   ```bash
   cd /tmp
   wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
   ```

   

3. **解压并移动文件**
    解压并将二进制文件移动到 /usr/local/bin/：

   ```bash
   tar -xzf node_exporter-1.7.0.linux-amd64.tar.gz
   sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/
   sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
   ```

   

4. **验证 Node Exporter 安装**
    检查 Node Exporter 版本：

   ```bash
   node_exporter --version
   ```

   输出类似：

   ```text
   node_exporter, version 1.7.0 (branch: HEAD, revision: ...)
   ```

   

### 2.2 配置 Node Exporter 服务并设置开机自启动

**1.创建 systemd 服务文件**
 创建一个 systemd 服务文件来管理 Node Exporter：

```bash
sudo vim /etc/systemd/system/node_exporter.service
```

写入以下内容：

```ini
[Unit]
Description=Prometheus Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
```

**2.重新加载 systemd 并启动 Node Exporter**
 启用并启动 Node Exporter 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
```

**3.验证 Node Exporter 运行状态**
 检查 Node Exporter 是否正常运行：

```bash
sudo systemctl status node_exporter
```

如果服务正常运行，输出中会显示 active (running)。

**4.验证 Node Exporter 指标**
 Node Exporter 默认运行在 9100 端口。使用 curl 检查是否能获取指标：

```bash
curl http://localhost:9100/metrics
```



### 2.3 配置 Prometheus 拉取 Node Exporter 指标

**1.编辑 Prometheus 配置文件**
 编辑 /etc/prometheus/prometheus.yml，添加 Node Exporter 作为目标：

```bash
sudo vim /etc/prometheus/prometheus.yml
```

在 scrape_configs 部分添加以下内容：

```yaml
scrape_configs:
  - job_name: 'prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'node_exporter'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9100']
```

- job_name: 'node_exporter' 定义了一个新的任务，命名为 node_exporter。
- targets: ['localhost:9100'] 指定了 Node Exporter 的地址和端口。

**2.重新加载 Prometheus 配置**
 Prometheus 支持动态重新加载配置，无需重启服务：

```bash
curl -X POST http://localhost:9090/-/reload
```

如果 --web.enable-lifecycle 标志未启用，可以重启 Prometheus：

```bash
sudo systemctl restart prometheus
```

**3.验证 Prometheus 拉取数据**
 再次访问 Prometheus Web 界面：

```text
http://<your-server-ip>:9090
```

点击 Status -> Targets，你应该能看到两个目标：

- prometheus (localhost:9090)
- node_exporter (localhost:9100)   两者状态应为 UP。

**4.查看指标**
 在 Prometheus Web 界面的 Graph 标签中，输入以下表达式并点击 Execute：

- node_cpu_seconds_total：查看 CPU 使用情况。
- node_memory_MemAvailable_bytes：查看可用内存。
- node_disk_io_time_seconds_total：查看磁盘 I/O 时间。
   切换到 Graph 视图，你可以看到这些指标的折线图。



## 三、通过下载 .deb 包安装 Grafana

在 Ubuntu 22.04 上，你可以直接下载 Grafana 的 .deb 安装包并手动安装，这样可以绕过 apt 和 python3-apt 的问题。

### 3.1 下载 Grafana 的 .deb 包

1. **访问 Grafana 官网下载页面**
    打开浏览器，访问 [Grafana 下载页面](https://grafana.com/grafana/download)，选择适合 Ubuntu 的版本。
    截至 2025年3月，最新版本可能是 10.2.x 或更高版本。以下以 10.2.3 为例。

2. **下载 .deb 包**
    使用 wget 下载 Grafana 的 .deb 包：

   ```bash
   cd /tmp
   wget https://dl.grafana.com/oss/release/grafana_10.2.3_amd64.deb
   ```

   如果版本已更新，可以在 Grafana 官网找到最新的下载链接。

### 3.2 安装 .deb 包

1. **使用 dpkg 安装**
    使用 dpkg 命令安装下载的 .deb 包：

   ```bash
   sudo dpkg -i grafana_10.2.3_amd64.deb
   ```

   如果缺少依赖，dpkg 可能会报错，例如：

   ```text
   dpkg: dependency problems prevent configuration of grafana:
    grafana depends on libfontconfig1; however:
     Package libfontconfig1 is not installed.
   ```

2. **修复依赖**
    如果 dpkg 报依赖问题，可以使用 apt-get 修复：

   ```bash
   sudo apt-get install -f
   ```

   这会自动安装缺失的依赖（例如 libfontconfig1）。

   

### 3.3 启动 Grafana 并设置开机自启动

1. **启动 Grafana 服务**
    安装完成后，启动 Grafana：

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start grafana-server
   sudo systemctl enable grafana-server
   ```

2. **验证 Grafana 运行状态**
    检查 Grafana 是否正常运行：

   ```bash
   sudo systemctl status grafana-server
   ```

3. **访问 Grafana Web 界面**
    Grafana 默认运行在 3000 端口。使用浏览器访问：

   ```text
   http://<your-server-ip>:3000
   ```

   默认用户名和密码是 admin / admin，登录后会提示你修改密码。



### 3.4 配置 Grafana 连接 Prometheus

你已经安装了 Prometheus 和 Node Exporter，接下来将 Grafana 连接到 Prometheus：

1. 登录 Grafana（http://\<your-server-ip\>:3000）。
2. 点击左侧菜单的 Configuration（齿轮图标） -> Data Sources。
3. 点击 Add data source，选择 Prometheus。
4. 在 URL 字段输入 http://localhost:9090（Prometheus 的地址），然后点击 Save & Test。
5. 导入 Node Exporter 仪表盘：
   - 点击左侧菜单的 + -> Import。
   - 在 Import via grafana.com 字段中输入仪表盘 ID，例如 1860（Node Exporter Full 仪表盘）。
   - 点击 Load，选择 Prometheus 数据源，然后点击 Import。

