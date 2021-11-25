---
title: 解决本站无法被百度搜索收录的问题
categories: Blog
date: 2019-07-03
---

&nbsp;

<!--more-->

## 问题综述

本站搭建在 GitHub Pages 上，搭建后发现 Google 已经收录了，但百度却没有收录，原因在于 GitHub 屏蔽了百度爬虫的抓取。

## 可选的解决方案

#### 当百度不存在

这个方案最方便，实现起来也简单（没有任何操作）。但作为中文站，大部分人还是通过百度来发现网站内容的，抛弃百度等于和相当一部分读者说再见了。方案不可行，PASS

#### 抛弃 GitHub Pages，选用其他产品（如VPS、GitLab等）

VPS 需要花时间和金钱去维护，GitLab 的响应速度比 GitHub 慢接近一倍。用户体验差，PASS

#### 使用 CDN

此方案需要网站有一定的访问量，且需要花钱买服务。PASS

#### 双仓库 + 多路解析

使用 Coding Pages 和 GitHub Pages 双站点，结合多路解析实现让百度爬虫访问 Coding Pages，其他用户直接访问 GitHub Pages。这个需要有自己的自定义域名，可行，本文使用这个方案。

## 具体实现方式的选择

#### 为什么使用 Coding Pages

目前国内免费的 Pages 服务主要是 Coding Pages 或者 码云 Gitee，Coding Pages 可以免费支持自定义域名，码云需要开通 VIP 才能使用自定义域名。

## 部署过程

### 双站点部署

本站使用 `Hugo` 搭建，通过编写自动部署脚本 `deploy.bat` 部署到 GitHub Pages 和 Coding Pages 中。

```bash
hugo

cd public
git add .
git commit -m "Update: %date:~0,10%"
git push origin master
```

### 配置多路解析

前往自定义域名提供商的网站修改域名解析，本文使用的是腾讯云的域名服务。

在域名解析中分别创建指向 GitHub Pages 域名和 Coding Pages 域名的解析规则。注意添加指向 Coding Pages，线路类型为搜索引擎的解析规则。

### 绑定自定义域名

Coding Pages 不支持直接读取 CNAME，所以需要手动设置，在 Pages 服务界面点击设置图标，根据官方提示进行设置，这里不再赘述。

## 参考内容

[胡刘郏：使用双仓库 + 多路解析解决 Github Pages 无法被百度搜索收录的问题](https://www.huliujia.com/blog/7d8b8a8b346ec437171b8ceca0c4fd708af4b702/)