---
title: 使用 Miniconda 和 pipenv 管理 Python 版本及包依赖
date: 2019-04-05
---

&nbsp;<!--more-->

## Miniconda 简介

Conda 是一个开源的包管理系统和环境管理系统，用于安装多个版本的软件包及其依赖关系，并在它们之间轻松切换。Conda 适用于 Linux、OS X 和 Windows，是为 Python 程序创建的，可以打包和分发任何软件。

Anaconda 是一个开源的 Python 发行版，包含了 Conda、Python 等多个科学计算包及其依赖项，安装包较大。

Miniconda 是最小的 Conda 安装环境，只包含 Conda 和 Python。

## pipenv 简介

pipenv 是 Pipfile 主要倡导者、requests 作者 Kenneth Reitz 写的一个命令行工具，主要包含了Pipfile、pip、click、requests 和 virtualenv。Pipfile 和 pipenv 本来都是 Kenneth Reitz 的个人项目，后来贡献给了 pypa 组织。Pipfile 是社区拟定的依赖管理文件，用于替代过于简陋的 requirements.txt 文件。

Pipfile 文件是 TOML 格式而不是 requirements.txt 这样的纯文本。

一个项目对应一个 Pipfile，支持开发环境与正式环境区分。默认提供 default 和 development 区分。

提供版本锁支持，存为 Pipfile.lock。

## 开发环境配置

### Miniconda 创建多版本 Python 环境

以创建 Python 2.7 和 Python 3.6 环境为例，注意将`env_name`换成自定义的环境名

```sh
# Python 2.7
conda create -n env_name python=2.7
# Python 3.6
conda create -n env_name python=3.6
```

### pipenv 安装

推荐使用 Python 3 的 pip 进行 pipenv 的安装
```bash
pip install pipenv
```

### pipenv 项目依赖环境管理

通过使用 Conda 创建的多版本 Python 实现多版本控制

```bash
pipenv --python /path/to/python
# 或者使用系统自带的 Python 3
pipenv --three
# 或者使用系统自带的 Python 2
pipenv --two
```

如果需要安装项目依赖包，使用 `pipenv install` 命令，以 requests 和 beautifulsoup4 为例，可以使用 `==` 指定安装的版本。

```bash 
pipenv install requests beautifulsoup4==4.6.0
```