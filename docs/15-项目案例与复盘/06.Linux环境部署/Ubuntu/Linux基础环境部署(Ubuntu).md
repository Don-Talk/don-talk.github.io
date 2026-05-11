# Linux基础环境部署(Ubuntu)

## 1.安装Docker

在Ubuntu 20.04上使用国内源安装Docker，可以使用清华大学源或阿里云源，具体如下。

先更新软件包，安装备要apt软件

```shell
# 更新软件包索引
sudo apt-get update
 
# 安装需要的软件包以使apt能够通过HTTPS使用仓库
sudo apt-get install ca-certificates curl gnupg lsb-release

```text

- 使用清化大学源

```shell
# 添加Docker官方的GPG密钥
curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
 
# 设置稳定版仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

- 使用阿里云源（已选）

```shell
# 添加阿里云官方GPG密钥
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
 
# 写入阿里云Docker仓库地址
sudo sh -c 'echo "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list'

```

更新源并安装Docker

```shell
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 验证是否成功安装了docker
sudo systemctl status docker
docker --version

```

修改docker的`/etc/docker/daemon.json`配置文件，如果在不存在则手动创建，文件内容如下。

```shell
# 修改daemon.json文件，
vim /etc/docker/daemon.json

# daemon.json内容如下：
{
    "registry-mirrors": [
        "https://dockerproxy.com",
        "https://docker.m.daocloud.io",
        "https://cr.console.aliyun.com",
        "https://ccr.ccs.tencentyun.com",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://docker.nju.edu.cn",
        "https://docker.mirrors.sjtug.sjtu.edu.cn",
        "https://github.com/ustclug/mirrorrequest",
        "https://registry.docker-cn.com"
    ]
}

# 重载配置文件，并重启 docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 查看 Registry Mirrors 配置是否成功
sudo docker info 

```



### 报错：Package docker-ce is not available, but is referred to by another package.

解决方法（方法一有效）：https://blog.csdn.net/feiying0canglang/article/details/128241654



## 2.安装配置Nginx

> https://developer.aliyun.com/article/759280
>
> 重装Nginx : https://juejin.cn/post/6844904014136475656



```shell
# 更新apt-get源
sudo apt-get update
# 安装
sudo apt-get install nginx
# 安装后将自动开启nginx服务，打开浏览器输入ip即可查看初始页面



# 查看安装版本
nginx -v
# 输出:nginx version: nginx/1.18.0 (Ubuntu)



# systemctl命令
# 查看状态
sudo systemctl status nginx
# 启动
sudo systemctl start nginx
# 停止
sudo systemctl stop nginx
# 重启
sudo systemctl restart nginx


# 查看文件结构
tree /etc/nginx



```





## 3.安装配置Java

> https://developer.aliyun.com/article/704959

```shell
 apt-get install openjdk-21-jdk
 
 vim ~/.bashrc
 
 # 最后一行添加
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```












