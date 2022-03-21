---
title: Alpine 安装 Docker
date: 2020-02-09
categories: Linux
---

Alpine Linux 是一个基于安全的轻量级 Linux 发行版，非常小巧，很省资源，用来做 Docker 的宿主很不错。本文尝试在虚拟机中安装 Alpine，然后安装 Docker，使用 Docker 跑复杂应用。

<!--more-->

## Virtual Box 安装 Alpine

### 1. 下载

到[官网下载页面](https://www.alpinelinux.org/downloads/)中，选择 `STANDARD` 版本，下载 ISO 文件

### 2. 新建虚拟机

打开 Virtual Box，新建虚拟机，类型选择 `Linux`，版本选择 `Other Linux (64-bit)`

![](https://cdn.ipear.ml/alpine-docker/new-vm.png)

点击下一步，根据实际需求设置内存和硬盘大小

### 3. 挂载 Alpine ISO

![](https://cdn.ipear.ml/alpine-docker/add-iso.png)

### 4. 安装

启动虚拟机，根据提示进行安装（此处不赘述，参考官方文档）

## 安装 Docker

### 1. 设置端口映射

设置端口映射用于 ssh 连接

![](https://cdn.ipear.ml/alpine-docker/napt.png)

### 2. 修改 ssh 配置

打开 `/etc/ssh/sshd_config` 文件，取消注释 `Port 22` 和 `PermitRootLogin prohibit-password`，并将 `prohibit-password` 改为 `yes`，重启 `sshd` 服务

```shell
service sshd restart
```

此时可以使用 ssh 工具登录虚拟机内的 Alpine

### 3. 安装 Docker

```shell
apk update
apk add docker
```

### 4. 启动守护程序

添加引导时启动

```shell
rc-update add docker boot
```

手动启动 Docker 守护程序

```shell
service docker start
```

> 注意：此处顺序不能颠倒

此时 Docker 安装启动完毕

## 运行 Docker

以人人影视 docker 为例

```shell
docker run -d -p 3001:3001 -v /opt/rrdata:/opt/work/store --name rrys baiyuetribe/rrshare
```

## 参考内容

1. [alpine linux 环境中安装 docker](https://www.imooc.com/article/287437)

1. [Installation](https://wiki.alpinelinux.org/wiki/Installation) (Alpine Wiki)

1. [Docker](https://wiki.alpinelinux.org/wiki/Docker) (Alpine Wiki)

1. [Baiyuetribe/rrshare_docker](https://github.com/Baiyuetribe/rrshare_docker)
