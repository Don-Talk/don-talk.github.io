# 在 Ubuntu 24.04 上部署 Jenkins 并设置开机启动

以下是在 Ubuntu 24.04 上安装 Jenkins 并配置其开机自启的详细步骤。

## 步骤 1：安装 Jenkins

1. **更新系统包索引**  
   确保你的系统是最新的：
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```



1. 安装 Java（Jenkins 依赖 Java）

   Jenkins 需要 Java 运行环境，安装 OpenJDK 17（推荐版本）：

   bash

   CollapseWrapCopy

   `sudo apt install openjdk-17-jre -y`

   检查 Java 是否安装成功：

   bash

   CollapseWrapCopy

   `java -version`

2. 添加 Jenkins 仓库

   添加 Jenkins 官方 Debian/Ubuntu 软件源：

   bash

   CollapseWrapCopy

   `curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \  /usr/share/keyrings/jenkins-keyring.asc > /dev/null echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/" | sudo tee \  /etc/apt/sources.list.d/jenkins.list > /dev/null`

3. 安装 Jenkins

   更新包索引并安装 Jenkins：

   bash

   CollapseWrapCopy

   `sudo apt update sudo apt install jenkins -y`

4. 检查 Jenkins 服务状态

   安装完成后，Jenkins 会自动启动。检查其状态：

   bash

   CollapseWrapCopy

   `sudo systemctl status jenkins`

   如果没有运行，可以手动启动：

   bash

   CollapseWrapCopy

   `sudo systemctl start jenkins`

## 步骤 2：设置 Jenkins 开机自启

Jenkins 安装后默认已配置为开机自启（通过 systemd）。确认一下：

bash

CollapseWrapCopy

```text
sudo systemctl is-enabled jenkins
```

如果输出是 enabled，说明已设置好。如果不是，启用它：

bash

CollapseWrapCopy

```text
sudo systemctl enable jenkins
```

## 步骤 3：初始配置 Jenkins

1. 访问 Jenkins

   Jenkins 默认运行在 

   8080

    端口，在浏览器中输入：

   text

   CollapseWrapCopy

   `http://你的服务器IP:8080`

   例如：

   text

   CollapseWrapCopy

   `http://localhost:8080  # 如果在本地 http://192.168.1.100:8080  # 如果在远程服务器`

2. 获取初始管理员密码

   首次访问时需要输入初始密码，从以下文件中获取：

   bash

   CollapseWrapCopy

   `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

   复制密码并粘贴到浏览器中。

3. 完成安装向导

   - 选择“安装推荐插件”（Install suggested plugins）。
   - 创建第一个管理员用户（用户名、密码等）。
   - 配置实例（默认 URL 一般无需修改）。

4. **登录 Jenkins**
    使用刚刚创建的管理员账户登录。

## 步骤 4：（可选）调整防火墙

如果启用了防火墙（如 UFW），允许 8080 端口：

bash

CollapseWrapCopy

```text
sudo ufw allow 8080 sudo ufw status
```

## 步骤 5：验证

- 重启系统：

  bash

  CollapseWrapCopy

  `sudo reboot`

- 重启后，检查 Jenkins 是否自动启动：

  bash

  CollapseWrapCopy

  `sudo systemctl status jenkins`

- 再次访问 http://你的服务器IP:8080，确保能正常打开。

## 注意事项

1. Java 版本兼容性

   Jenkins 推荐使用 Java 11 或 17。如果遇到问题，可以尝试安装其他版本：

   bash

   CollapseWrapCopy

   `sudo apt install openjdk-11-jre -y`

2. 更改默认端口（可选）

   如果想更改 Jenkins 默认端口（8080），编辑配置文件：

   bash

   CollapseWrapCopy

   `sudo nano /etc/default/jenkins`

   找到 

   HTTP_PORT=8080

   ，改为你想要的端口（如 

   8081

   ），然后重启服务：

   bash

   CollapseWrapCopy

   `sudo systemctl restart jenkins`

3. 安全性

   - 建议配置 HTTPS（需要 SSL 证书）。
   - 不要直接暴露 Jenkins 到公网，考虑使用反向代理（如 Nginx）。