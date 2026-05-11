# Git添加SSH秘钥

> 参考：https://cloud.tencent.com/developer/article/2015651



## 1.配置用户名和邮箱

```sh
$ git config --global user.name "用户名"

$ git config --global user.email "用户邮箱"
```



## 2.生成密钥对

首先查看设备上是否已生成过秘钥对

```sh
$ cd ~/.ssh    //进入指定路径文件夹
$ ls           //查看文件夹下内容
```

看一下有没有 `id\_rsa` 和 `id_rsa.pub` 等文件，`.pub` 文件是公钥，另一个文件是密钥

若没有这些文件，或没有 `.ssh` 目录，则使用 `ssh-keygen` 命令来创建

```sh
$ ssh-keygen -t rsa -C "你的邮箱"
```

如有提示信息，点击 `enter` 即可，不需要设置密码！ 难道你想在每次提交代码前输入一遍密码吗？

成功后会提示

```sh
Your public key has been saved in /home/you/.ssh/id_rsa.pub.
The key fingerprint is: 
```



## 3.进入 .ssh 文件夹，查找公钥

进入指定路径 `.ssh` 文件夹中，用记事本打开 `id_rsa.pub`，全选复制内容

也可通过指令查看

```sh
$ cat ~/.ssh/id_rsa.pub
```

例如：

```sh
ssh-rsa your secret email@email.com
```



## 4.进入代码托管平台，上传密钥

下面以 GitHub 为例，演示相关操作过程

1.登陆 github 帐户，点击你的头像，然后 `Settings -> SSH and GPG keys -> New SSH key`

2、然后你复制上面的公钥内容，粘贴进 `key` 文本域内。 `title` 域，自己随便起个名字

3、点击 `add key`

完成以后，验证下这个key是不是正常工作：

```sh
$ ssh -T git@github.com
Attempts to ssh to github
```

如果，看到如下信息提示

```sh
Hi xxx! You've successfully authenticated, but GitHub does not # provide shell access.
```






































