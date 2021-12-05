---
title: 文化崂山抢票记
date: 2020-01-29
---

年前实现了基于 DevOps 的全自动抢票，由于众所周知的原因，文化崂山低价观影一时半会用不上了，它敢放票咱不敢去呀，一去岂不是要瞬间爆炸。

最近在家里闲着没啥事，不想看论文，就寻思着写点东西，分享一下开发过程，记录一下第一次尝试 DevOps。

<!--more-->

本文主要包含如下内容：
1. 抢票原理及实现
2. GitHub Actions 部署
3. 怎样部署自己的抢票工具

## 抢票原理及实现

首先来讲一下抢票原理。用程序模拟人访问文化崂山网站，进行登录、抢票等操作，主要用到 requests 库。

整个代码的核心是一个 Session对象，用于保持登录状态。

```python
session = requests.Session()
```

主要包含5大模块：
1. 余票查询
1. 登录
1. 订单查询
1. 订票
1. 删票


### 登录

登录模块最简单，只需要将用户名和密码 POST 到指定网址即可。

```python
data = {
	'IdNumber': 'username',
	'PassWord': 'password'
}
r = session.post(login_url, data)
```

服务端返回登录信息，`登录成功`、`用户名或密码错误`等

### 余票查询

这里需要分析网站首页的活动信息，剔除无用信息，保留有需要的部分：`(活动时间, 截止时间, 活动链接)`。由于活动数量较多，一页可能显示不完，就需要对后面的几页进行分析。

文化崂山在元旦时上线了新版后台，相比于旧版基于 Asp.NET 的后台，分析后面的页面更简单了，只需要在网址上做做手脚。

```python
url = index_url + '/pages/' + page_num
```

发送 GET 请求就可以得到网页内容，然后用网页解析工具解析网页即可得到余票情况。

```python
r = requests.get(url)
```

### 订单查询

订单查询与余票查询有相似的地方，都需要分析页面信息，分析的方法也类似。与获取余票信息不同的是，需要先进行登录操作，得到用户的 Cookies 后再进行订单查询。

```python
url = order_url + '/page/' + page_num
r = session.get(url)
```

### 订票

订票操作与登录操作类似，需要将特定的数据 POST 到指定网址。

```python
data = {
	'activityid': '',
	'activityname': '',
	'idnumber': '',
	'realname': '',
	'type2': '',
	'current_url': url
}
r = session.post(purchase_url, data)
```

服务端返回订票情况，如 `抢票成功，请携带xxx到xxx`、`您已用光今年的6次抢票机会` 等。

### 删票

如果不及时删票可能会影响到以后的抢票活动（官方这样说的，不晓得具体是不是这样）。删票时需要提前获得已定的票的 id，然后将这个 id POST 到指定网址即可。

```python
data = {
	'QzId': tid
}
r = session.post(url, data)
```

服务端返回一个数字，表示删票成功与否。


## GitHub Actions 部署

GitHub Actions 是 DevOps 的一种体现形式。B站看到利用 GitHub Actions 实现博客网站的自动编译部署。GitHub 会在每次提交代码后自动将博客源文件编译成静态网站部署到 GitHub Pages 中。

看了一下GitHub Actions的官方文档后，我准备做两个事情：
1. 搭建全自动部署的博客（搭建中，GitHub 和 Coding 双备份）
1. 文化崂山全自动抢票（已实现）

启用 Actions 很简单，只需要在仓库目录下新建 `.github/workflows` 目录，然后在里面添加 yaml 文件，按照 GitHub 文档给定的格式填写内容，例如：

```yaml
# Actions name
name: autorun
# 在提交代码时运行 actions
on: [push]
jobs:
  autorun:	# job id
    name: autorun
    runs-on: ubuntu-latest	# 运行环境
    steps:
      - uses: actions/checkout@v2	# pull 仓库代码
      - name: install requirements
        run: pip3 install -r requirements.txt
      - name: run code
        # 使用 secrets 保存用户名密码，此处调用
        run: python3 run.py -u ${{ secrets.USERNAME }} -p ${{ secrets.PASSWORD }}
```

## 怎样部署自己的抢票工具

> 影院开放后补充

1. fork 这个仓库
1. 修改 cron.yml
1. 添加 Secrets
