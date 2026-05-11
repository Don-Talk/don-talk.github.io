# 阿里云搭建FTP服务器

> vsftpd（very secure FTP daemon）是Linux操作系统下的一款小巧轻快、安全易用的FTP服务器软件。本文介绍如何在Linux服务器中安装、配置vsftpd，并测试连接FTP服务器。

参考文章：

- https://help.aliyun.com/zh/ecs/how-to-construct-vsftp-and-configure-virtual-users
- https://developer.aliyun.com/article/43258

## 前提条件

有一台Linux服务器



## 背景信息

FTP(File Transfer Protocal)是一种文件传输协议，基于客户端/服务器架构，支持以下两种工作模式：

- 主动模式（PORT）：客户端向FTP服务器发送端口信息，由服务器主动连接该端口。
- 被动模式（PASV）：FTP服务器开启并发送端口信息给客户端，由客户端连接该端口，服务器被动接受连接。

FTP支持以下三种认证模式：

- 匿名用户模式：任何人无需密码验证就可以直接登录FTP服务器。该模式不安全，一般只用来传输不重要的公开文件，不推荐在生产环境中使用。
- 本地用户模式：通过Linux系统本地用户验证登录权限，相较于匿名用户模式更安全。
- 虚拟用户模式：通过虚拟用户验证登录权限，虚拟用户只能访问Linux系统为其提供的FTP服务，而不能访问Linux系统的其他资源。该模式相较于其他两种模式更加安全，如果您对服务器的数据有较高的安全性要求，建议在相关专业人员的指导下，自行配置该模式。



## 安装vsftpd

> Ubuntu 20.04

```shell
apt-get -y install vsftpd
```



我们现在来查看下vsftpd都安装了那些文件。如下：

```shell
root@iZwz99l0y:/etc# dpkg -L vsftpd |tac
/usr/share/man/man8/vsftpd.8.gz
/usr/share/man/man8
/...
/...
/lib
/etc/vsftpd.conf
/etc/pam.d/vsftpd
/etc/pam.d
/etc/logrotate.d/vsftpd
/etc/logrotate.d
/etc/init.d/vsftpd
/etc/init.d
/etc/ftpusers
/etc
/.
```

我们可以看出vsftpd在安装时，生成了很多文件，其中/etc/init/vsftpd.conf、/etc/vsftpd.conf比较重要。

- /etc/init.d/vsftpd是vsftpd的初始化文件
- /etc/vsftpd.conf是vsftpd的配置文件

在`/etc/init.d/vsftpd`中可以看到`/etc/vsftpd.conf`为配置文件

在ubuntu下要启动、停止、重启vsftpd，命令如下：

```shell
sudo service vsftpd stop

sudo service vsftpd start

sudo service vsftpd restart
```

最后，我们再来查看下vsftpd的服务脚本。如下：

```shell
cat /lib/systemd/system/vsftpd.service
```



## 配置vsftpd

vsftpd安装完毕后，我们现在开始配置vsftpd，不过在正式配置之前，我们还有几步工作要做。

### 1.用户相关配置

因为是使用vsftpd的虚拟用户，所以我们需要先在系统中创建一个用户，并且该用户对/www目录具有可读可写可执行权限。

创建用户，如下：

```shell
sudo useradd -m -s /bin/bash ftpmusic

cat /etc/passwd | grep ftpmusic
```

**注意：创建的用户ftpilanni现在是无法登录到系统的，因为没有给该用户设置密码。在此，我们也无需ftpilanni登录到系统，这样相对来说比较安全。**

用户创建完毕后，我们来创建对应的目录并修改其所属用户，如下：

```shell
sudo mkdir /music

sudo chown -R ftpmusic:ftpmusic /music/

# 给用户写权限
sudo chmod -R u=rwx /music/

```

有关用户相关配置结束后，我们开始设置登录vsftp的用户与密码文件login.txt。如下：

```shell

sudo mkdir /etc/vsftpd/

# 在该文件夹下创建login.txt文件
sudo vim /etc/vsftpd/login.txt

# login.txt内容如下
ftpmusic
hongxinzhilianmusic
```

login.txt为登录vsftpd的用户与密码文件。

login.txt设置完毕后，我们要使用db_load进行加密。而db_load需要db-util这个软件。所以需要我们现在安装db-util，如下：

```shell
sudo apt-get -y install db-util
```

db-util安装完毕后，现在开始使用db_load对loginx.txt进行加密。如下：

```shell
sudo db_load -T -t hash -f /etc/vsftpd/login.txt /etc/vsftpd/login.db
```

loginx.txt加密完成后，我们现在开始配置vsftpd的PAM验证。



### 2.PAM验证配置

vsftpd的PAM验证，在此我没有使用vsftpd安装时所生成的/etc/pam.d/vsftpd文件。

因为经过我多次的测试，发现如果使用该文件进行验证的话，无法验证通过。不知道为什么，猜想很有可能是vsftpd的一个BUG。

创建验证文件，如下：

```shell
# 创建验证文件
sudo vim /etc/pam.d/vsftpd.virtual

# 验证文件内容：
auth required pam_userdb.so db=/etc/vsftpd/login
account required pam_userdb.so db=/etc/vsftpd/login
```

其中/etc/vsftpd/login对应/etc/vsftpd/login.db文件



### 3.vsftp权限配置

现在正式配置vsftpd，vsftpd的几乎所有配置项都在/etc/vsftpd.conf文件中进行。

```shell
# 备份原配置文件
cp vsftpd.conf vsftpd_bak.conf
```

根据业务要求修改vsftpd.conf配置内容如下：

```shell
listen=YES

listen_ipv6=NO

anonymous_enable=NO

local_enable=YES

write_enable=YES

local_umask=022

dirmessage_enable=YES

use_localtime=YES

xferlog_enable=YES

connect_from_port_20=YES

xferlog_file=/var/log/vsftpd.log

xferlog_std_format=YES

chroot_local_user=YES

chroot_list_enable=NO

allow_writeable_chroot=YES

secure_chroot_dir=/var/run/vsftpd/empty

pam_service_name=vsftpd

rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem

rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key

ssl_enable=NO

guest_enable=YES

pam_service_name=vsftpd.virtual

user_config_dir=/etc/vsftpd/vu

pasv_enable=YES

pasv_min_port=30000

pasv_max_port=31000
```

在以上配置文件中，有几点需要重点指出。

- local_enable=YES
- write_enable=YES
- local_umask=022

这两项是启用系统用户的写权限。特别是write_enable=YES项一定要启用，否则vsftpd虚拟用户将无法登录vsftpd。

**为什么会是这样？因为虚拟用户依赖与系统用户。**

- chroot_local_user=YES
- chroot_list_enable=NO
- allow_writeable_chroot=YES

这三项是配置vsftpd用户禁止切换上级目录的权限。

- guest_enable=YES
- pam_service_name=vsftpd.virtual
- user_config_dir=/etc/vsftpd/vu

这三项是启用vsftpd虚拟用以及虚拟用户账号配置目录。

- pasv_enable=YES
- pasv_min_port=30000
- pasv_max_port=31000

这三项是启用vsftpd被动模式及相关端口。



### 4.虚拟用户相关配置

vsftpd配置文件修改文件后，现在开始配置虚拟用户的相关权限。如下：

```shell
# 
sudo mkdir /etc/vsftpd/vu

# 
sudo vim /etc/vsftpd/vu/ftpmusic

# ftpmusic文件内容如下：
guest_username=ftpmusic

local_root=/music/

virtual_use_local_privs=YES

anon_umask=133
```

以上配置参数，其中guest_username=ftpmusic表示的是设置FTP对应的系统用户为ftpmusic

local_root=/music/表示使用本地用户登录到ftp时的默认目录。

virtual_use_local_privs=YES虚拟用户和本地用户有相同的权限。

anon_umask表示文件上传的默认掩码。计算方式是777减去anon_umask就是上传文件的权限。在此我们设置的是133，也就是说上传后文件的权限是644。即上传的文件对所属用户来说只有读写权限，没有执行权限。



以上全部配置完毕后，我们来重启vsftpd，如下：

```shell
sudo service vsftpd restart





















