---
title: GitHub SSH-Key 配置
categories: Blog
date: 2016-12-14
---

> ~~博客部署在[GitHub Pages](https://pages.github.com/)上，~~ 本文介绍一下怎样配置 GitHub SSH-Key

<!--more-->

## 所需工具

Windows 平台：

[Git for Windows](https://git-scm.com/downloads) 或
[MSYS2](https://msys2.org/)

Linux 平台（安装命令示例）:

```sh
apt install git   # Debian/Ubuntu/Linux Mint/Deepin 等
pacman -S git     # Arch Linux/Manjaro 等
```

## 配置 GitHub

### 申请账号

如果已经有 GitHub 账号，跳过这一步。

打开[GitHub](https://github.com)官网，在首页输入用户名、邮箱、密码，点击 **Sign Up for GitHub** 注册账号

### 新建 Repository

使用账号登录[GitHub](https://github.com)，在右侧有一个绿色的 **New Repository** 按钮，点击创建新的 Repository

在 **Repository Name** 输入 **用户名.github.io** （例如：**sunyufei.github.io**），然后点击最下方绿色按钮创建一个名为 **用户名.github.io** 的 Repository

### 配置 ssh-key

1. 定义好 git 的全局用户名和邮箱

   ```bash
   git config --global user.name  "USERNAME"
   git config --global user.email "USERNAME@EMAIL.COM"
   ```

1. 检查本机是否有 ssh-key 设置

   ```bash
   # Windows
   cd %userprofile%/.ssh
   # Linux
   cd ~/.ssh
   ```

   如果没有则提示：**No such fire or directory.**

   如果有此文件夹，将其删除：

   ```bash
   # Windows 用资源管理器删除即可
   # Linux
   rm -rf ~/.ssh
   ```

1. 生成新的 ssh-key

   ```bash
   ssh-keygen -t rsa -C "USERNAME@EMAIL.COM"
   ```

   然后连着按三次回车，新的 ssh-key 就生成好了，在 **~/.ssh** 文件夹中有两个新文件 **id_rsa** 和 **id_rsa.pub**

1. 将新的 ssh-key 添加到 GitHub 中

   将 **~/.ssh/id_rsa.pub** 的文件内容添加到 GitHub 的 **SSH and GPG keys** 设置中

1. 测试 ssh-key

   ```bash
   ssh -T git@github.com
   ```

   在输入 yes 后提示 **Hi xxx! You've successfully authenticated, but GitHub does notprovide shell access.** 则说明 ssh-key 添加成功
