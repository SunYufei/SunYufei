---
title: Armbian 配置记录
categories: Rock64
date: 2021-10-05
---

<!--more-->

## 镜像源

/etc/apt/sources.list

```conf
deb https://mirrors.tuna.tsinghua.edu.cn/debian buster main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian buster-updates main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian buster-backports main contrib non-free
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
```

/etc/apt/sources.list.d/armbian.list

```conf
deb https://mirrors.tuna.tsinghua.edu.cn/armbian buster main buster-utils buster-desktop
```

## 开机挂载硬盘

在 /etc/fstab 文件末尾添加

```shell
/dev/sda1 /mnt ext4 defaults 0 0
```

## Samba

安装 samba

```shell
sudo apt install samba
```

创建共享目录（略，此处以挂载的硬盘 `/mnt` 为例）

添加 samba 用户

```shell
sudo smbpasswd -a user
```

配置 /etc/samba/smb.conf，在文件末尾添加

```conf
[share]
    comment = share
    path = /mnt
    available = yes
    browsable = yes
    writeable = yes
    valid users = user
```

重启服务

```shell
sudo service smbd restart
```

## 阿里云盘 WebDAV

安装依赖环境

```shell
sudo apt install default-jdk
```

下载 jar 包

```shell
wget https://github.com/zxbu/webdav-aliyundriver/releases/download/v2.4.1/webdav-2.4.1.jar
```

编写启动脚本 run.sh，注意替换 refresh_token，端口号可自定义

```shell
_start() {
    nohup java -jar /opt/aliyun-webdav/webdav-2.4.1.jar --aliyundrive.refresh-token="refresh_token" --server.port=9080 --aliyundrive.auth.enable=false > /dev/null 2>error.log &
}

_stop() {
    pkill -f /opt/aliyun-webdav/webdav-2.4.1.jar
}

_restart() {
    _stop
    sleep 1
    _start
}

case "$1" in
    start)
        _start
        ;;
    stop)
        _stop
        ;;
    status)
        exit $?
        ;;
    restart)
        _restart
        ;;
    *)
        echo "Usage: {start|stop|restart}" >&2
        exit 3
        ;;
esac

exit 0
```

启动阿里云盘

```shell
sudo ./run.sh start
```