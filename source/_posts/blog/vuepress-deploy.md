---
title: VuePress 部署时遇到的问题
categories: Blog
date: 2019-03-12
---

&nbsp;

<!--more-->

[VuePress](https://vuepress.vuejs.org/) 官方文档的 [部署](https://vuepress.vuejs.org/zh/guide/deploy.html#%E9%83%A8%E7%BD%B2) 部分提供了在 [GitHub Pages](https://pages.github.com/) 上的部署脚本`deploy.sh`

```bash
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

参考这个脚本写了 Windows 系统下的 PowerShell 脚本

```powershell
yarn.cmd docs:build

Set-Location .\docs\.vuepress\dist

Write-Output "sunyufei.ml" | Out-File CNAME

git.exe init
git.exe add -A
git.exe commit -m "Deploy on GitHub Pages"
git.exe push -f git@github.com:SunYufei/sunyufei.github.io.git master

Set-Location ..\..\..
```

在运行时提示禁止运行，原因是 PowerShell 默认的执行策略是`RETRICTED`，即只能运行单独的命令，不允许运行脚本

将执行策略修改为`REMOTESIGNED`即可运行用户自定义脚本和来自网络的已签名脚本

```powershell
Set-ExecutionPolicy REMOTESIGNED
```

修改运行策略后脚本可以正常运行，但生成的`CNAME`文件编码有误，[GitHub Pages](https://pages.github.com/) 不识别

PowerShell 默认使用`UTF-16`编码，GitHub Pages 要求`CNAME`文件使用`UTF-8`编码，在 PowerShell 的 `Out-File` 命令中指定输出文件编码即可

```powershell
Write-Output "sunyufei.ml" | Out-File -Encoding utf8 CNAME
```
