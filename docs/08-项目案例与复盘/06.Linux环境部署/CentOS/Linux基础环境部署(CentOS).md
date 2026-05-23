# Linux基础环境部署(CentOS)

> Linux环境：ContOS 7.9

## 01.安装JDK 17

### 1.JDK17下载

[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/Adoptium/) 国内的站点，下载速度贼快

```shell
wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz
```



### 2.上传解压

上传到自己指定的目录，我丢在这个目录`/opt/jdk_17`下

文件上传到服务器后，解压命令：

```shell
tar -zxvf jdk-17_linux-x64_bin.tar.gz
```

### 3.配置环境

打开配置文件

```shell
# 打开配置文件
vim /etc/profile

# 配置JDK路径
export JAVA_HOME=/opt/jdk_17/jdk-17.0.12
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPAT=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

#重新加载配置
source /etc/profile

#查看结果
java -version
```



## 02.Elasticsearch7.15.2

1. 下载

   ```shell
   wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.15.2-linux-x86_64.tar.gz
   ```

   

2. 解压

   ```shell
   tar -xzf elasticsearch-7.15.2-linux-x86_64.tar.gz 
   ```

   

3. fds



## 0.3Redis

1.添加 EPEL 仓库，因为 Redis 在标准的 CentOS 仓库中不可用：

```shell
sudo yum install epel-release
```

2.安装 Redis：

```shell
sudo yum install redis
```

3.启动 Redis 服务：

```shell
sudo systemctl start redis
```

4.如果你想让 Redis 在启动时自动运行，你可以启用它：

```shell
sudo systemctl enable redis
```

5.检查 Redis 是否正在运行：

```shell
sudo systemctl status redis
```

6.修改端口

打开 Redis 配置文件。根据你的系统和安装方式，它通常在 /etc/redis/redis.conf 或 /etc/redis.conf。你可以使用你喜欢的文本编辑器打开它。

```shell
sudo vim /etc/redis.conf

#将这个改成你想要的端口
port 26379
```

7.修改密码

查找 requirepass 参数。如果找不到，你可以直接添加它。将它设置为你想要的密码，请将 yournewpassword 替换为你想要的密码。

```shell
requirepass yournewpassword：
```

8.修改允许外网访问

查找 bind 参数，它定义了允许连接到 [Redis](https://so.csdn.net/so/search?q=Redis&spm=1001.2101.3001.7020) 的主机。默认情况下，它可能设置为 127.0.0.1，这意味着只允许本地连接。你可以将其更改为 0.0.0.0 来允许所有主机的连接：

```shell
bind 0.0.0.0
```

9.重启Redis

```shell
sudo systemctl restart redis



































