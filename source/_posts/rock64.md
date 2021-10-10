---
title: Armbian 配置记录
categories: Rock64
date: 2021-10-05
---

手中有个Rock64开发板，刷入了Armbian，记录一下配置过程

<!--more-->

## 1 镜像源

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

## 2 磁盘挂载与共享

### 2.1 开机挂载硬盘

在`/etc/fstab`文件末尾添加

```bash
/dev/sda1 /mnt ext4 defaults 0 0
```

### 2.2 Samba

安装samba

```bash
sudo apt install samba
```

创建共享目录并设置读写权限（略，此处以挂载的硬盘`/mnt`为例）

```bash
sudo chmod 777 /mnt
```

添加samba用户

```bash
sudo smbpasswd -a $USER$
```

配置`/etc/samba/smb.conf`，在文件末尾添加

```conf
[share]
    comment = share
    path = /mnt
    available = yes
    browsable = yes
    writeable = yes
    valid users = $USER$
```

重启服务

```bash
sudo service smbd restart
```

### 2.3 阿里云盘 WebDAV

安装依赖环境

```bash
sudo apt install default-jdk
```

下载 jar 包

```bash
wget https://github.com/zxbu/webdav-aliyundriver/releases/download/v2.4.1/webdav-2.4.1.jar
```

编写启动脚本 run.sh，注意替换 refresh_token，端口号可自定义

```bash
_start() {
    nohup java -jar /opt/aliyun-webdav/webdav-2.4.1.jar --aliyundrive.refresh-token="refresh_token" --server.port=1080 --aliyundrive.auth.enable=false > /dev/null 2>error.log &
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

```bash
sudo ./run.sh start
```

## 3 下载工具

### 3.1 Aria2

#### 3.1.1 安装 Aria2

```bash
sudo apt install aria2
```

#### 3.1.2 配置文件

修改文件 /opt/aria2/aria2.conf

```conf
# download
dir=/mnt/downloads/aria2
continue=true
max-connection-per-server=16
min-split-size=4M
split=16

# bt
bt-detach-seed-only=true
bt-max-peers=64
bt-tracker=
dht-file-path=/opt/aria2/dht/dht.dat
dht-file-path6=/opt/aria2/dht/dht6.dat
enable-dht=true
enable-dht6=true
file-allocation=trunc
max-overall-upload-limit=64K
peer-id-prefix=-TR3000-
peer-agent=Transmission/3.00
seed-ratio=0
seed-time=60

# rpc
enable-rpc=true
input-file=/opt/aria2/aria2.session
save-session=/opt/aria2/aria2.session
save-session-interval=60
rpc-allow-origin-all=true
rpc-listen-all=true

```

#### 3.1.3 设置开机启动

将如下内容填入 /etc/systemd/system/aria2.service

```conf
[Unit]
    Description = Aria2
    After = syslog.target
    After = network.target
[Service]
    Type = forking
    ExecStart = /usr/bin/aria2c --conf-path=/etc/aria2/aria2.conf -D
    Restart = always
    RestartSec = 10
[Install]
    WantedBy=multi-user.target
```

启动并运行服务

```bash
sudo systemctl enable aria2.service
sudo service aria2 start
```

#### 3.1.4 配置自动更新 trackers

将如下内容填入 /opt/aria2/aria2-tracker.sh

```bash
#!/bin/bash
service aria2 stop

list=`wget -qO- https://cdn.jsdelivr.net/gh/ngosang/trackerslist@master/trackers_best_ip.txt|awk NF|sed ":a;N;s/\n/,/g;ta"`

if [ -z "`grep "bt-tracker" /opt/aria2/aria2.conf`" ]; then
        sed -i '$a bt-tracker='${list} /opt/aria2/aria2.conf
        echo [+] Add
else
        sed -i "s@bt-tracker=.*@bt-tracker=$list@g" /opt/aria2/aria2.conf
        echo [+] Update
fi

service aria2 start
```

新增一项定时任务，将 `0 3 * * * root sh /opt/aria2/aria2-tracker.sh
` 添加至 /etc/crontab 末尾

#### 3.1.5 配置 AriaNG + Nginx

下载 AriaNG 并解压，以 `/opt/aria2/AriaNG` 文件夹为例

```bash
wget https://github.com/mayswind/AriaNg/releases/download/1.2.2/AriaNg-1.2.2.zip
mkdir /opt/aria2/AriaNG
mv AriaNg-*.zip /opt/aria2/AriaNG
cd /opt/aria2/AriaNG
unzip AriaNg-*.zip
```

安装 Nginx

```bash
sudo apt install nginx
```

编辑文件 /etc/nginx/sites-available/aria2.conf，填入如下内容

```conf
server {
    listen      2080      default_server;
    listen      [::]:2080 default_server;
    server_name AriaNG;
    charset     utf-8;
    location / {
        root    /opt/aria2/AriaNG;
    }
}
```

创建配置文件的软链接

```bash
sudo ln -s /etc/nginx/sites-available/aria2.conf /etc/nginx/sites-enabled/aria2.conf
```

重启Nginx

```bash
sudo service nginx restart
```


### 3.2 qbittorrent-nox enhanced edition

> 已停用

#### 3.2.1 安装 qbittorrent-enhanced-nox

```bash
wget https://github.com/c0re100/qBittorrent-Enhanced-Edition/releases/download/release-4.3.8.10/qbittorrent-nox_aarch64-linux-musl_static.zip
unzip qbittorrent-nox*.zip
```

#### 3.2.2 添加服务

修改`/etc/systemd/system/qbittorrent-nox.service`，填入如下内容

```conf
[Unit]
    Description = qbittorrent-nox
    After = network.target
[Service]
    User = root
    Type = forking
    RemainAfterExit = yes
    ExecStart = /usr/bin/qbittorrent-nox -d
[Install]
    WantedBy = multi-user.target
```

启动服务并设置开机启动

```bash
sudo systemctl daemon-reload
sudo systemctl enable qbittorrent-nox
sudo systemctl start qbittorrent-nox
```

默认登录网址：`ip:8080`，用户名：`admin`，密码：`adminadmin`

### 3.3 simple-torrent

#### 3.3.1 下载二进制文件

```bash
wget https://github.com/boypt/simple-torrent/releases/download/1.3.8/cloud-torrent_linux_arm64_static.gz
sudo gzip -d cloud-torrent_linux_arm64_static.gz -c /opt/simple-torrent/cloud-torrent
sudo chmod +x /opt/simple-torrent/cloud-torrent
```

#### 3.3.2 配置文件

编辑 /opt/simple-torrent/conf.yaml

```yaml
allowruntimeconfigure: true
alwaysaddtrackers: true
autostart: false
disableutp: false
donecmd: ""
downloaddirectory: /mnt/downloads/simple-torrent
downloadrate: Unlimited
enableseeding: true
enableupload: true
incomingport: 50007
maxconcurrenttask: 6
nodefaultportforwarding: true
obfspreferred: true
obfsrequirepreferred: false
proxyurl: ""
seedratio: 0
seedtime: "0"
trackerlist: remote:https://trackerslist.com/all.txt
uploadrate: 32k
watchdirectory: /mnt/torrents
```

#### 3.3.3 添加服务

编辑 /etc/systemd/system/cloud-torrent.service

```conf
[Unit]
    Description=Cloud Torrent
    After=network.target

[Service]
    Type=simple
    User=root
    ExecStart=/opt/simple-torrent/cloud-torrent --listen :3080 -c /opt/simple-torrent/config.yaml --disable-log-time
    Restart=always
    RestartPreventExitStatus=42
    RestartSec=3

[Install]
    WantedBy=multi-user.service
```

#### 3.3.4 自动更新脚本

```bash
#!/bin/bash

# stop service
SERVICE=cloud-torrent
service $SERVICE stop
echo "[+] stop service"

# download new
CLDBIN=/opt/simple-torrent/cloud-torrent
rm $CLDBIN
echo "[+] remove old $CLDBIN"

GHAPI=https://api.github.com/repos/boypt/simple-torrent/releases/latest
BINTAG=linux_arm64
BINURL=$(wget -qO- $GHAPI | grep browser_download_url | grep "$BINTAG" | grep static | cut -d '"' -f 4)

echo ${BINURL/github.com/hub.fastgit.org} | wget --no-verbose -i- -O- | gzip -d -c > ${CLDBIN}

chmod +x ${CLDBIN}
echo "[+] download new $CLDBIN"

# open service
service $SERVICE start
echo "[+] start service"
```

### 3.4 live-torrent

```bash
sudo apt install docker.io
docker run --restart=always --name live-torrent -d -p 3000:8080 davenchy/live-torrent
```