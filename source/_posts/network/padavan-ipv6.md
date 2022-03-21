---
title: Padavan 启用 IPv6
categories: Network
date: 2019-05-21
---

&nbsp;<!--more-->

实验室里用的路由器刷的 OpenWrt，不知为何以太网和 WiFi 不能同时使用，将其换成了 Padavan，问题解决。

由于平时需要科学上网，使用的工具是基于 IPv6 的科学上网工具。校园网提供原生 IPv6，但中间多了路由器后需要配置 Teredo 或者配置路由器支持 IPv6 交换。Teredo 不太稳定，后一种方法稳定一些，本文记录一下配置方法。

## 1 开启 opt 环境

首先需要到 Padavan 管理后台开启 opt 环境。设置路径在`扩展功能`-`配置扩展功能`-`opt 环境`

启用下列选项：

- 启用 opt 自动更新
- 启用 扩展脚本 自动更新
- opt 强制安装
- 启用 提交统计

注意点击下方`应用本页面设置`按钮，后文不在赘述。

## 2 开启 WAN 端 IPv6

在管理后台`外部网络(WAN)`-`IPv6 设置`中设置：

| 选项                           | 值             |
| :----------------------------- | :------------- |
| IPv6 连接类型                  | Native DHCPv6  |
| 获取 IPv6 外网地址             | Stateless: RA  |
| 自动获取 IPv6 DNS              | 启用           |
| 通过 DHCPv6 获取内网 IPv6 地址 | 启用           |
| 启用 LAN 路由器通告            | 启用           |
| 启用 LAN DHCPv6 服务器         | Stateless (\*) |

若需要手动设置 IPv6 DNS，禁用`自动获取 IPv6 DNS`选项后手动设置 DNS 地址。

## 3 安装并运行 6relayd

转到`系统管理`-`控制台`，在输入框中依次输入如下命令：

```bash
opkg update
opkg install 6relayd    # 安装 6relayd

6relayd -d -A eth2.2 br0    # 启用 6relayd
```

这里`eth2.2`是 WAN 网口网卡名，可用`ifconfig`命令查看，一般不用更改。`br0`代表整个内网，一般不用更改。

## 4 开机自动安装并配置 6relayd 脚本

将下面的脚本复制粘贴到`高级设置`-`自定义设置`-`脚本`-`在路由器启动之后执行`中最后即可实现开机自动安装配置 6relayd：

```bash
# 开机自动安装运行 6relayd
export PATH='/etc/storage/bin:/tmp/script:/etc/storage/script:/opt/usr/sbin:/opt/usr/bin:/opt/sbin:/opt/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin'
export LD_LIBRARY_PATH=/lib:/opt/lib
while ! [ -x "`which opkg`" ]
do
        logger -t "【6relayd】" "Waitting opt install"
        sleep 3
done
while ! [ -x "`which 6relayd`" ]
do
        logger -t "【6relayd】" "6relayd not found,begin to install it"
        opkg update
        opkg install 6relayd
done
logger -t "【6relayd】" "6relayd has been installed"
6relayd -d -A eth2.2 br0
logger -t "【6relayd】" "6relayd start"
```

## 5 解决 6relayd 自动掉线

若长时间没有 IPv6 的连接，6relayd 会自动停止，简单的解决方法是每隔半小时重新连接一下 6relayd。将一下代码添加到`系统管理`-`服务`-`计划任务(Crontab)`中即可：

```bash
*/30 * * * * 6relayd -d -A eth2.2 br0
```
