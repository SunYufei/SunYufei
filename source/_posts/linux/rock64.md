---
title: Armbian 配置记录
categories: Linux
date: 2021-10-05
---

手中有个 Rock64 开发板，刷入了 Armbian，记录一下配置过程

<!--more-->

# 基础配置

## 镜像源

/etc/apt/sources.list

```conf
deb https://mirrors.bfsu.edu.cn/debian testing main contrib non-free
deb https://mirrors.bfsu.edu.cn/debian testing-updates main contrib non-free
deb https://mirrors.bfsu.edu.cn/debian testing-backports main contrib non-free
deb https://mirrors.bfsu.edu.cn/debian-security testing-security main contrib non-free
```

/etc/apt/sources.list.d/armbian.list

```conf
deb https://mirrors.bfsu.edu.cn/armbian bullseye main bullseye-utils
```

## zsh

安装 zsh 及插件

```shell
sudo apt install zsh zsh-autosuggestions zsh-syntax-highlighting zsh-theme-powerlevel9k
```

启用 zsh

```shell
chsh -s /usr/bin/zsh
```

编辑`~/.zshrc`

```shell
export TERM="xterm-256color"
export PATH=/sbin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:$PATH

source /usr/share/powerlevel9k/powerlevel9k.zsh-theme
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# key bindings
bindkey "\e[1~" beginning-of-line
bindkey "\e[4~" end-of-line
bindkey "\e[5~" beginning-of-history
bindkey "\e[6~" end-of-history
# for rxvt
bindkey "\e[8~" end-of-line
bindkey "\e[7~" beginning-of-line
# for non RH/Debian xterm, can't hurt for RH/DEbian xterm
bindkey "\eOH" beginning-of-line
bindkey "\eOF" end-of-line
# for freebsd console
bindkey "\e[H" beginning-of-line
bindkey "\e[F" end-of-line
# completion in the middle of a line
bindkey '^i' expand-or-complete-prefix
```

为 root 用户建立 zshrc 连接

```shell
sudo ln -s /home/$USER/.zshrc /root/.zshrc
```

# 磁盘挂载与共享

## 开机挂载硬盘

在`/etc/fstab`文件末尾添加

```shell
/dev/sda1 /mnt/sda ext4 defaults 0 0
```

## Samba

安装 samba

```shell
sudo apt install samba
```

创建共享目录并设置读写权限（略，此处以挂载的硬盘`/mnt/sda`为例）

```shell
sudo chown -R $USER:root /mnt/sda
sudo chmod -R 755 /mnt/sda
```

添加 samba 用户

```shell
sudo smbpasswd -a $USER$
```

配置`/etc/samba/smb.conf`，在文件末尾添加

```conf
[share]
    comment = share
    path = /mnt/sda
    available = yes
    browsable = yes
    writeable = yes
    valid users = $USER$
```

重启服务

```shell
sudo service smbd restart
```

## rclone

安装 rclone

```shell
sudo apt install rclone
```

建立 root 用户的 rclone.conf 连接

```shell
sudo ln -s /home/$USER/.config/rclone/rclone.conf /root/.config/rclone/rclone.conf
```

## 阿里云盘 WebDAV

编写启动脚本 run.sh，注意替换 TOKEN，端口号可自定义

```bash
#!/bin/bash

DIR=/opt/aliyun-drive
BIN="$DIR/webdav.jar"
TOKEN=
PORT=1080
MOUNT=/mnt/aliyun
USER=

_install() {
	# jdk
	if [ ! -e "/usr/bin/java" ]; then
		apt install default-jdk -y
	fi
	# rclone
	if [ ! -e "/usr/bin/rclone" ]; then
		apt install rclone -y
	fi
}

_download() {
	_install
	GHAPI=https://api.github.com/repos/zxbu/webdav-aliyundriver/releases/latest
    BINURL=$(wget -qO- $GHAPI | grep browser_download_url | cut -d '"' -f 4)
    mkdir -p $DIR
    wget ${BINURL/github.com/hub.fastgit.org} --no-verbose -O $BIN
    chmod +x $BIN
}

_config() {
	rclone config create aliyun webdav url http://localhost:$PORT vendor other
}

_mount() {
	_install
	_config

	mkdir -p $MOUNT
	chown -R $USER:root $MOUNT

	nohup rclone mount aliyun:/ $MOUNT --cache-dir /tmp --allow-other --vfs-cache-mode writes --allow-non-empty >/dev/null 2>&1 &
}

_umount() {
	fusermount -u $MOUNT
}

_start() {
	nohup java -jar $BIN --aliyundrive.refresh-token=$TOKEN --server.port=$PORT --aliyundrive.auth.enable=false >/dev/null 2>&1 &
}

_stop() {
	pkill -f $BIN
}

_restart() {
	_stop
	sleep 1
	_start
}


case "$1" in
	download)
		_download
		;;
	config)
		_config
		;;
	mount)
		_mount
		;;
	umount)
		_umount
		;;
	start)
		_start
		;;
	stop)
		_stop
		;;
	restart)
		_restart
		;;
	*)
		echo "Usage: {download|config|mount|umount|start|stop|restart}" >&2
		exit 3
		;;
esac

exit 0
```

下载、启动阿里云盘并挂载

```shell
sudo ./run.sh download
sudo ./run.sh start
sudo ./run.sh mount
```

## 其他挂载

```shell
sudo mkdir -p /var/journal
sudo ln -s /var/journal /var/log/journal
```

# 下载工具

## Aria2

### 安装 Aria2

```shell
sudo apt install aria2
```

### 配置文件

修改文件 /opt/aria2/aria2.conf

```conf
# download
dir=/mnt/sda/downloads
continue=true
max-connection-per-server=16
min-split-size=2M
split=16

# bt
bt-detach-seed-only=true
bt-force-encryption=true
bt-max-peers=128
bt-tracker=
dht-file-path=/opt/aria2/dht/dht.dat
dht-file-path6=/opt/aria2/dht/dht6.dat
enable-dht=true
enable-dht6=true
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

新建配置文件及其存放目录

```shell
mkdir -p /opt/aria2/dht
touch /opt/aria2/aria2.session
```

### 设置开机启动

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

```shell
sudo systemctl enable aria2.service
sudo service aria2 start
```

### 配置自动更新 trackers

将如下内容填入 /opt/aria2/aria2-tracker.sh

```shell
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

新增一项定时任务，将 `0 3 * * * root sh /opt/aria2/aria2-tracker.sh ` 添加至 /etc/crontab 末尾

### 配置 AriaNG + Nginx

下载 AriaNG 并解压，以 `/opt/aria2/AriaNG` 文件夹为例

```shell
wget https://github.com/mayswind/AriaNg/releases/download/1.2.2/AriaNg-1.2.2.zip
mkdir /opt/aria2/AriaNG
mv AriaNg-*.zip /opt/aria2/AriaNG
cd /opt/aria2/AriaNG
unzip AriaNg-*.zip
```

安装 Nginx

```shell
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

```shell
sudo ln -s /etc/nginx/sites-available/aria2.conf /etc/nginx/sites-enabled/aria2.conf
```

重启 Nginx

```shell
sudo service nginx restart
```

## qbittorrent nox enhanced edition

### 安装 qbittorrent-enhanced-nox

```bash
#!/bin/bash

BIN=/opt/qbittorrent-nox/qbittorrent-nox

if [ -e $BIN ]; then
	rm $BIN
fi

GHAPI=https://api.github.com/repos/c0re100/qBittorrent-Enhanced-Edition/releases/latest
BINTAG=aarch64-linux
BINURL=$(wget -qO- $GHAPI | grep browser_download_url | grep "$BINTAG" | grep static | cut -d '"' -f 4)

echo ${BINURL/github.com/hub.fastgit.org} | wget --no-verbose -i- -O- | gzip -d -c > $BIN

chmod +x $BIN
```

### 添加服务

修改`/etc/systemd/system/qbittorrent-nox.service`，填入如下内容

```conf
[Unit]
    Description = qbittorrent-nox
    After = network.target
[Service]
    User = root
    Type = forking
    RemainAfterExit = yes
    ExecStart = /opt/qbittorrent-nox/qbittorrent-nox -d
[Install]
    WantedBy = multi-user.target
```

启动服务并设置开机启动

```shell
sudo systemctl daemon-reload
sudo systemctl enable qbittorrent-nox
sudo systemctl start qbittorrent-nox
```

默认登录网址：`ip:8080`，用户名：`admin`，密码：`adminadmin`

## simple-torrent

> 下载占用高，已停用

### 下载二进制文件

```shell
wget https://github.com/boypt/simple-torrent/releases/download/1.3.8/cloud-torrent_linux_arm64_static.gz
sudo gzip -d cloud-torrent_linux_arm64_static.gz -c /opt/simple-torrent/cloud-torrent
sudo chmod +x /opt/simple-torrent/cloud-torrent
```

### 配置文件

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

### 添加服务

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

### 自动更新脚本

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

# 开发环境

## Podman

### 安装

```shell
sudo apt install podman uidmap slirp4netns
```

### 添加镜像源

修改`/etc/containers/registries.conf`，添加如下内容：

```conf
unqualified-search-registries = ["docker.io"]
[[registry]]
prefix = "docker.io"
location = "zs2joo3y.mirror.aliyuncs.com"
```

### Rootless 配置

修改`/usr/share/containers/containers.conf`，启用如下内容

```conf
cgroup_manager = "cgroupfs"
runtime = "crun"
```

运行

```shell
sudo loginctl enable-linger 1000
```

### 修改镜像存储路径

```shell
sudo mkdir -p /mnt/sda/containers
sudo ln -s /mnt/sda/containers/ /home/$USER/.local/share/containers
```

### 重启 Podman 服务

```shell
service podman restart
```

## Redis

```shell
podman pull redis:6-alpine
podman run -itd --name redis -p 6379:6379 redis
```

## MySQL

```shell
podman pull mysql/mysql-server

mkdir -p /mnt/sda/data/mysql
podman run -itd --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -v /mnt/sda/data/mysql:/var/lib/mysql mysql-server
```

配置 MySQL

```shell
podman exec -it mysql bash

mysql -u root -p
use mysql;
update user set host='%' where user='root';
grant all on *.* to 'root'@'%';
flush privileges;
```

## ElasticSearch

```shell
podman pull elasticsearch:7.14.2
podman run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.14.2
```
