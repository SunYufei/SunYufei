---
title: VSCode开发环境配置
date: 2020-07-26
---

VSCode + C + Java + Go，备战秋招

<!--more-->

# 基础配置

## 插件、设置同步

安装插件 `code-setting-sync`，根据提示配置 GitHub Gists，到设置中打开自动上传和下载

## 色彩、图标

不太喜欢默认的黑色主题，换成了 `Solarized Light`

图标使用了插件 `vscode-icons`

# 开发环境配置

## Markdown

本博客使用Markdown编写，Coding DevOps / GitHub Actions 自动部署。安装 `Markdown All in One` 插件增强 VSCode 的 Markdown 功能

或者使用Typora编写Markdown

## Git

到[git-for-windows](https://github.com/git-for-windows/git/releases)项目中下载最新的git-for-windows，安装完毕后将安装目录的`cmd`文件夹加入环境变量

（可选）VSCode中安装`GitLens`插件

## C/C++

安装MinGW-w64并将`bin`目录添加到环境变量中

安装`C/C++`插件后进入设置，修改如下内容

```json
{
  "C_Cpp.default.compilerPath": "/path/to/mingw64/bin/gcc.exe",
  "C_Cpp.default.cppStandard": "c++17",
  "C_Cpp.default.cStandard": "c11",
  "C_Cpp.default.intelliSenseMode": "gcc-x64",
  "C_Cpp.clang_format_style": "{ BasedOnStyle: LLVM, UseTab: Never, IndentWidth: 4, TabWidth: 4}",
  "C_Cpp.clang_format_sortIncludes": true
}
```

## Go

下载安装Go，开启Go Module，配置GOPROXY

在VSCode中安装Go插件即可

## Java

下载安装OpenJDK，安装完毕后配置`JAVA_HOME`和`Path`环境变量

如果只做算法题，安装插件`Language Support for Java(TM) by Red Hat` 即可。工程开发推荐IntelliJ IDEA

## Python

### 安装 Miniconda 3

由于用不上 Anaconda 的所有包，故选用轻量级的 Miniconda 替代

Miniconda 的安装包可以到 [https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/) 下载

下载完成后双击运行安装即可，假设安装目录为 `D:\Develop\Miniconda`

### 配置环境变量

将下面的三个目录添加到环境变量 `Path` 中

```text
D:\Develop\Miniconda3
D:\Develop\Miniconda3\Library\bin
D:\Develop\Miniconda3\Scripts
```

### 配置清华镜像

在安装其他的软件包之前，可以配置清华镜像加快下载速度

具体操作参考 [Anaconda 镜像使用帮助](https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/)

### Python 3.8

据说有改进和蜜汁加成，试用一下

```
conda install python=3.8
```

### 机器学习 & 计算机视觉

```
conda install dlib -c conda-forge
conda install opencv
conda install scikit-learn scikit-image
conda install seaborn
conda install -c pytorch pytorch torchvision cudatoolkit=10.1 cudnn
```

只需要装这几个包就可以涵盖常用的机器学习和计算机视觉库

- cuda + cudnn
- numpy
- opencv
- pandas
- pillow
- pytorch + torchvision
- scikit-learn + scikit-image
- scipy
- matplotlib + seaborn

> 注：TensorFlow 不支持 Python 3.8，如需安装可使用 conda 新建一个 Python 3.7 的环境

### Jupyter Notebook

VSCode Python 插件支持 Jupyter Notebook，无需在 `conda` 中安装全部的 `jupyter` 只需安装 `notebook`

有一点需要注意的是在配置好上面的环境后使用 `conda` 安装 `notebook` 会出现依赖问题，这里使用 `pip` 安装

```
pip install notebook
```

### VSCode 配置

首先需要在 VSCode 中安装 `Python` 插件然后配置类型检查、格式化代码和引用排序

这里使用 `flake8 + yapf + isort` 组合

```
conda install flake8 yapf isort
```

最后在 VSCode 设置中启用这些工具

## 远程开发

平时用服务器跑机器学习，使用VSCode远程开发需要安装`Remote Development`插件，安装完成后配置免密登录

### 生成密钥对

```sh
ssh-keygen -t rsa
```

生成完毕后会在`C:\Users\USERNAME\.ssh`文件夹下多出两个文件：`id_rsa`和`id_rsa.pub`

### 传递公钥

将`id_rsa.pub`文件传到远程服务器的某个目录下，这里以`/home/sun`为例，执行下面的命令将公钥追加到`authorized_keys`文件中

```sh
cat ~/id_rsa.pub >> ~/.ssh/authorized_keys
```

完成免密登录配置

# LeetCode

VSCode LeetCode插件依赖Node.js 8+，需要预先安装好Node.js

在VSCode中安装LeetCode插件，安装完毕后设置默认编程语言和题目保存路径，在`settings.json`中添加如下内容：

```json
// 默认语言
"leetcode.defaultLanguage": "java",
// 文件保存目录
"leetcode.workspaceFolder": "D:/Documents/Projects/OI/LeetCode",
// 文件相对路径
"leetcode.filePath": {
    "default": {
        "folder": "",
        "filename": "${id}-${tag}-${kebab-case-name}.${ext}"
    },
    "cpp": {
        "folder": "C"
    },
    "golang": {
        "folder": "Go"
    },
    "java": {
        "folder": "Java"
    },
    "python3": {
        "folder": "Python"
    }
}
```

左侧点击LeetCode图标，登录LeetCode账号就可以开始做题了