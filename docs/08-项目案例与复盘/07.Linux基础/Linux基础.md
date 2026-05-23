# Linux基础



## 01.linux运行jar包命令

linux运行jar包
要运行java的项目需要先将项目打包成war包或者jar包，打包成war包需要将war包部署到tomcat服务器上才能运行。而打包成jar包可以直接使用java命令执行。在linux系统中运行jar包主要有以下四种方式。

一、java -jar xxx.jar

这是最基本的jar包执行方式，但是当我们是当我们用ctrl+c中断或者关闭窗口时时，程序也会中断执行，当然关闭或重启虚拟机也同样如此。

二、java -jar xxx.jar &

&代表在后台运行，使用ctrl+c不会中断程序的运行，但是关闭窗口会中断程序的运行。

三、nohup java -jar xxx.jar &

使用这种方式运行的程序日志会输出到当前目录下的nohup.out文件，使用ctrl+c中断或者关闭窗口都不会中断程序的执行。

四、nohup java -jar xxx.jar >temp.log &

temp.out的意思是将日志输出重定向到temp.log文件，使用ctrl+c中断或者关闭窗口都不会中断程序的执行。

nohup java -jar xxx.jar >temp.log &

查看jar包进程

```shell
ps aux|grep xxx.jar
ps -ef | grep java
```

将会看到此jar的进程信息：
root 2373 0.9 15.8 2575356 296448 pts/0 Sl+ 16:28 1:18 java -jar erp-0.5.1.2.jar
或
root 2373 2004 0 16:28 pts/0 00:01:18 java -jar erp-0.5.1.2.jar

停止jar包
也就是杀死进程
找到jar的pid，杀掉命令为：

kill -9 pid
pkill 进程名

```shell
# 查询占用8080端口号的进程
netstat -apn | grep 8080

# 删除进程
kill -9 8080

# 关闭进程
ps -aux | grep java

kill -s 9 24204
```



## 02.内存

### 查看内存使用情况

### 1.使用free命令

```shell
# 以MB为单位来展示内存使用信息
free -m

# 以MB为单位来展示内存使用信息
free -h
```

### 2.查看/proc/meminfo

```shell
cat /proc/meminfo
```

### 3.使用vmstat命令

```shell
vmstat -s
```

### 4.使用top命令

```shell
# CentOS
top -o %MEM
top -o %CPU
```

### 5.htop命令

> 用法与top一样，但是界面更友好，需要先安装

```shell
# 安装 htop
yum install htop -y

htop -o %MEM
```



## 03.缓存相关

1. ### 使用sync和echo命令清除RAM缓存和交换空间

  - 清除页面缓存（Page Cache）:
  - **清除目录项和inode**:



- sync; echo 1 > /proc/sys/vm/drop_caches
  这个命令会清除页面缓存，但不会中断任何正在运行的进程或服务。

清除目录项和inode:

- sync; echo 2 > /proc/sys/vm/drop_caches
  这个命令会清除目录项和inode，适用于需要清理文件系统元数据的情况。

- sync; echo 3 > /proc/sys/vm/drop_caches



## 04.日志文件

> 查看日志文件最后一百行

- ```shell
tail -n 100 log文件路径
  ```
  
  

## 05.防火墙

> https://blog.51cto.com/u_15127627/2732834

1. 查看防火墙状态

   ```shell
   firewall-cmd --state
   ```

   

2. 开启防火墙

3. 设置开机自启

4. 重启防火墙

5. 查看防火墙设置开机自启是否成功



公司本地测试服务器183.233.197.205

```shell
# 查看防火墙状态
sudo service ufw status

sudo ufw status

sudo ufw allow 8000/tcp

sudo ufw deny 8000/tcp

sudo ufw enable 8000/tcp

sudo ufw disable 8000/tcp
```





## 06.用户权限



















