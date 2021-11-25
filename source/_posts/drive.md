---
title: 打造在线观看影音库
date: 2020-03-07
---

最近申请了一个无限容量的 Google Team Drive，里面存一些电影电视剧，配好了在线观看，同时解决了文件上传慢的问题

<!--more-->

> 2021年更新：Google Team Drive已被禁用
> 
> 3 月 15 日更新：调整文章结构，增加新内容

# 最终效果

1. 将视频存放到指定文件夹中
2. OneDrive 自动上传后释放本地空间
3. GitHub Actions 定时将 OneDrive 中的文件复制到 Google Drive 中
4. 随时在线观看

# 配置过程记录

## 准备工作

开始之前，你需要准备：

- 含有团队网盘的谷歌账号
- Cloudflare 账号
- 微软账号
- GitHub 账号
- GoIndex
- Rclone

## 1 配置 Google Drive

### 1.1 使用 Rclone 设置 Google Drive

首先需要到 [Rclone 官网](https://rclone.org/downloads/) 下载合适版本的 Rclone

![](https://cdn.ipear.ml/drive/rclone.png)

下载完成后解压，在 powershell 中运行 `rclone config` 设置 Google Drive

```
No remotes found - make a new one
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n
name> GoogleDrive
```

输入 `n` 新建一个配置，命名为 `GoogleDrive`，按下回车后选择远程存储类型

```
Type of storage to configure.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value

...

12 / Google Cloud Storage (this is not GoogleDrive)
   \ "google cloud storage"
13 / GoogleDrive
   \ "drive"

...

23 / Microsoft OneDrive
   \ "onedrive"

...

Storage> 13
```

输入 `13` 选择 `GoogleDrive`，接下来就要输入 Client ID 和 Client Secret

```
Google Application Client Id
Setting your own is recommended.
See https://rclone.org/drive/#making-your-own-client-id for how to create your own.
If you leave this blank, it will use an internal key which is low performance.
Enter a string value. Press Enter for the default ("").
client_id>
```

可以使用 rclone 自带的 Client ID 和 Client Secret，推荐自己去申请一个，避免官方的 Client ID 和 Client Secret 超出调用次数限制影响使用。

### 1.2 获取 Google Client ID 和 Client Secret

使用谷歌账户登录 [Google API Console](https://console.developers.google.com/)，选择或新建一个项目

![](https://cdn.ipear.ml/drive/client01.png)

在 `启用 API 和服务` 选项下搜索 `Drive`，找到 `Google Drive API`

![](https://cdn.ipear.ml/drive/client02.png)

选择启用

![](https://cdn.ipear.ml/drive/client03.png)

点击左侧凭据，选择创建凭据。如果是第一次使用，会提示需要配置 OAuth 同意屏幕

![](https://cdn.ipear.ml/drive/client04.png)

此时需要跳转到 OAuth 同意屏幕中配置一个应用，只需填写应用名称

回到凭据，点击 `创建凭据`，选择 `OAuth 客户端 ID`，填写应用名称即可得到 Client ID 和 Client Secret

### 1.3 继续配置 Google Drive

将刚才申请好的 Client ID 和 Client Secret 输入到 Rclone 的相应位置中

```
Scope that rclone should use when requesting access from drive.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / Full access all files, excluding Application Data Folder.
   \ "drive"
 2 / Read-only access to file metadata and file contents.
   \ "drive.readonly"
   / Access to files created by rclone only.

...

scope> 1
```

之后在 scope 中填写 `1`，给 Rclone 操作文件的权限

```
...

Enter a string value. Press Enter for the default ("").
root_folder_id>
```

此时需要填写根目录 ID，打开 [Google Drive](https://drive.google.com/)，选择 `共享云端硬盘`，打开自己的共享云端硬盘，将网址的最后一段复制下来，填到这里

接下来三个操作按回车使用默认配置即可

然后会弹出网页，需要登陆谷歌账号并授权 Rclone 访问你的网盘

得到特征码后会询问是否将其设置为团队网盘：

```
Configure this as a team drive?
y) Yes
n) No (default)
y/n> y
```

填写 `y` 然后在下面的列表中输入你的网盘序号（一般只有一个）

此时会提示配置好的信息。需要将 `client_id`、`client_secret`、`root_folder_id`、`refresh_token` 保存下来备用

若因网络问题配置失败，可以添加环境变量配置代理：

```
http_proxy=127.0.0.1:1080
https_proxy=127.0.0.1:1080
```

### 1.4 配置部署 GoIndex

Rclone 可以配合 WinFCP 将 Google Drive 挂载为本地硬盘。但由于某些都懂的原因，连接并不稳定

在 Cloudflare Workers 部署 GoIndex 可以直接访问 Google Drive 中的文件，速度与 Cloudflare 有关

GoIndex 可以实现在线播放网盘中的视频，这点非常重要，准备利用它把我的网盘打造成一个影音库

登录 Cloudflare，新建一个 Workers，填入 [GoIndex](https://github.com/donwa/goindex) 项目中 index.js 文件的内容。index.js 文件的一开始是如下内容：

```javascript
var authConfig = {
    "siteName": "GoIndex", // 网站名称
    "root_pass": "",  // 根目录密码，优先于.password
    "version" : "1.0.7", // 程序版本
    "theme" : "material", // material  classic 
    "client_id": "",
    "client_secret": "",
    "refresh_token": "", // 授权 token
    "root": "" // 根目录ID
};
```

需要将刚才使用 Rclone 时得到的 `client_id`、`client_secret`、`refresh_token` 和 `root_folder_id` 填到这里

点击 `Save and Deploy` 按钮即可完成部署

## 2 配置 OneDrive

平时使用教育邮箱注册的 1TB 容量的 OneDrive 同步文件。Win10 下的 OneDrive 客户端上传能够跑满带宽，但下载很慢

OneDrive 客户端只会同步特定的文件夹，如 `C:\Users\<user>\OneDrive`。如果文件分布在多个文件夹或多个磁盘中，可以使用 `mklink` 创建软链接来实现不同文件夹的同步

### 2.1 创建软链接实现跨磁盘同步

使用 `mklink` 命令建立软链接，`mklink` 的基础语法如下：

```
MKLINK [[/D] | [/H] | [/J]] Link Target
```

`/d` 给目录创建符号链接，`/h` 创建硬链接，`/j` 创建连接点。其中 `/h` 创建的硬链接占用空间与源文件相同；`/d` 与 `/j` 命令基本相同，唯一的不同点是 `/d` 可以跨网络磁盘，`/j` 不可以

`Link` 和 `Target` 为路径，建议使用绝对路径

例如，对 `D:\Videos` 文件夹建立软链接，让 OneDrive 对其同步：

```bat
mklink /j "C:\Users\USER\OneDrive\Videos" "D:\Videos" 
```

### 2.2 Cloudflare +“OneIndex”

OneDrive 这里也有一个与 GoIndex 相同的工具 [FODI](https://github.com/vcheckzen/FODI)，可以部署在 Cloudflare Workers 中。但由于 OneDrive 的限制，在线观看视频非常慢，码率低的视频还好，码率高的视频无法流畅观看

配置 FODI 与配置 GoIndex 相同，首先需要用 rclone 配置好 OneDrive，步骤参考前面的 rclone 配置 GoogleDrive，然后将 FODI 部署到 Cloudflare 中

同样的，可以申请自己的 OneDrive Azure API 用于 Rclone，具体操作参考 [简书：创建适用于 Rclone 的 OneDrive Azure API](https://www.jianshu.com/p/072ff75d35ca)

## 3 使用 GitHub Actions 进行网盘同步

上面提到的两种方案各有优劣：

|          | GoogleDrive + GoIndex |  OneDrive + FODI   |
| :------: | :-------------------: | :----------------: |
|   上传   |     慢，经常掉线      |  很快，可跑满带宽  |
| 在线体验 |          快           | 卡顿，不能流畅观看 |

在逛 GitHub 的时候看到了 [GitHub Actions for rclone](https://github.com/marketplace/actions/github-action-for-rclone)，可以使用 GitHub Actions 在不同的网盘之间同步文件，没有访问限制。

### 3.1 GoIndex 项目改造

Fork 了一下 GoIndex 项目（[SunYufei/goindex](https://github.com/SunYufei/goindex)），对其进行稍加改造：

#### 3.1.1 删除其他分支

只保留了 master 分支，去掉了其他的分支

```sh
# 查看所有分支
git branch -a
# 删除远程分支
git push origin --delete <branch_name>
```

#### 3.1.2 去掉不用的文件

移除了 classic 主题，只保留 `index.js` 和 material 主题下的 `app.js`，并将 `app.js` 移到根目录，重命名为 `material.js`。

此时需要修改 `index.js` 中对主题文件的引用。修改第 20 行 src 中逗号后面的那个 js 文件引用路径。

```html
<script src="//cdn.jsdelivr.net/gh/jquery/jquery@3.2/dist/jquery.min.js"></script>
<script src="//cdn.jsdelivr.net/gh/SunYufei/GoIndex@master/material.js"></script>
```

#### 3.1.3 Material 主题微调

GoIndex 默认的 material 主题在视频播放页面会有文件链接等内容，这是我不需要的。所以我微调了主题文件，去掉这些内容

删除 `material.js` 文件第 274-282 行：

```html
<!-- 固定标签 -->
<div class="mdui-textfield">
  <label class="mdui-textfield-label">下载地址</label>
  <input class="mdui-textfield-input" type="text" value="${url}"/>
</div>
<div class="mdui-textfield">
  <label class="mdui-textfield-label">HTML 引用地址</label>
  <textarea class="mdui-textfield-input"><video><source src="${url}" type="video/mp4"></video></textarea>
</div>
```

#### 3.1.4 将改动同步到 Cloudflare Workers 中

将修改后的 `index.js` 文件内容更新到 Cloudflare Workers 中，否则不会看到主题的改动

### 3.2 使用 GitHub Actions 实现网盘

想要进行这一步，需要使用 rclone 配置好 OneDrive 和 Google Drive，然后提取 `C:\Users\<user>\.config\rclone\rclone.conf` 文件内容：

```conf
[GoogleDrive]
type = drive
client_id = xxx
client_secret = xxx
scope = drive
root_folder_id = xxx
token = {"access_token":"xxx","token_type":"xxx","refresh_token":"xxx","expiry":"xxx"}
team_drive = xxx

[OneDrive]
type = onedrive
token = {"access_token":"xxx","token_type":"xxx","refresh_token":"xxx","expiry":"xxx"}
drive_id = xxx
drive_type = business
```

到 GitHub 项目中添加一个 Secrets，命名为 `RCLONE_CONF`，值为文件的所有内容

在 GoIndex 项目根目录新建 `.github/workflows/copy.yml` 文件，填入如下内容：

```yaml
name: rclone
on:
  schedule:
	# GMT 16:30 / BJT 00:30 进行同步
    - cron: '30 16 * * *'

jobs:
  copy: # job name
    runs-on: ubuntu-latest  # 在 Ubuntu 中运行
    steps:
      - uses: wei/rclone@v1
        env:
          RCLONE_CONF: ${{ secrets.RCLONE_CONF }}
        with:
          args: copy --update --verbose OneDrive:/ GoogleDrive:/
```

将修改好的项目 push 到 GitHub 中，GitHub 会在~~每 6 小时~~每天凌晨 00:30（GMT 16:30）会自动将 OneDrive 文件的内容复制到 Google Drive 中。实测同步速度在 ~~1.5MB/s 左右，虽然不快，但稳定不掉线~~ 30MB/s 左右，非常快，还没有连接问题

## 参考内容

1. [利用 Cloudflare 和 Google 免费搭建无限空间网盘](https://www.iyyxz.com/how-to-use-Cloudflare-and-google-to-build-a-unlimited-storage-drive-index-for-free/)
2. 简书：[Windows mklink /d /h /j 精讲](https://www.jianshu.com/p/b1614a073087)
3. [GoIndex](https://github.com/donwa/goindex)
4. [FODI](https://github.com/vcheckzen/FODI)
5. [Rclone Docs](https://rclone.org/docs/)
6. [GitHub Actions for rclone](https://github.com/marketplace/actions/github-action-for-rclone)
   