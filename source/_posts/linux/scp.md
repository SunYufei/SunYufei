---
title: Linux 互传文件
date: 2020-02-12
categories: Linux
---

更换了服务器之后，需要将原来的文件传到新的服务器上。平时使用 VPN 连接，SSH 登录，传输文件用 sftp，速度上限为 VPN 服务器网络上限。将原有服务器数据下载下来再上传到新服务器上太慢了。幸运的是两台服务器在同一个网段下，可以通过 scp 命令内网传输，速度快很多。

<!--more-->

## scp 传输命令

传文件

```shell
scp file.ext user@x.x.x.x:/home/user
```

传目录

```shell
scp -r path user@x.x.x.x:/home/user
```

## 免密传输

如果没有配置好 SSH Key，上面的两个操作回要求输入密码。配置免密传输很简单，先将公钥文件传到目标服务器中

```shell
scp ~/.ssh/id_rsa.pub user@x.x.x.x:/home/user
```

然后在目标服务器上将公钥添加到 `authorized_keys` 文件中

```shell
cat id_rsa.pub >> ~/.ssh/authorized_keys
```

此时传输文件不需要输密码了


## 后台传输

文件量巨大，前台传输的话当 ssh 断开传输就停止了，可以使用 `nohup` 命令将其放到后台运行，关闭终端后文件传输不会中断。

注意：需要配置好 ssh 免密登录

```shell
nohup scp -r /home/user user@x.x.x.x:/home/user &
```
