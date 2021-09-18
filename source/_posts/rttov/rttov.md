---
title: RTTOV 12.2 安装记录
categories: RTTOV12
date: 2018-11-16
---

最近帮助海洋技术系的老师和师姐安装了 RTTOV12.2 系统。记录一下安装过程，同时记录一下踩过的坑。

<!--more-->

## Day 1

RTTOV，全称 Radiative Transferfor TOVS，具体是干啥的我不知道。安装 RTTOV 需要 Linux 系统环境，一开始我选择了 Ubuntu 18.10 版本，电脑除了运行 RTTOV 还要跑点别的，用 Ubuntu 相对方便一点。我在电脑上划出 20GB 空间，安装好 Ubuntu，就开始编译根据手册准备编译 RTTOV。

手册要求先安装依赖库 gfortran、perl 等。安装这些很简单，一条命令即可。

```sh
sudo apt install gfortran perl
```

由于我的英语有些瑕疵，把手册中安装完成后的其他内容的下载当成了下一步操作，导致分给Linux的20GB很快就木有了。又划了80GB给Linux，继续安装。

手册中讲到需要先编译HDF5后再编译RTTOV，于是我就转到了HDF5的编译。在编译HDF5的过程中遇到了依赖库缺失的问题，编译未能继续，第一天结束。

## Day 2

> 看手册要仔细，看不懂英文手册就上网搜一下安装成功的示例

简书上有一篇文章记录了 RTTOV12.2 的安装过程，[文章链接](https://www.jianshu.com/p/ba81ce2ca81e)。这篇文章看起来写的很详细，实际上漏洞百出，不能说是一篇不好的文章，至少提供了一个安装的思路。

文章记录了 RTTOV 的安装依赖关系。简单来说，需要先安装 gcc g++ gfortran make，在依次编译安装 zlib hdf5 netcdf netcdf-fortran，最后编译安装 RTTOV。

有了安装过程，开始安装。

前四个很简单，一条命令即可。

```bash
sudo apt install build-essential gfortran
```

接下来坑爹的地方来了，简书的这篇文章写了怎样编译zlib等库，但按照它给的步骤实际操作根本不能完成，因为文章中有些命令是错误的。于是我找到官方安装文档进行编译安装。

zlib、hdf5、netcdf 编译安装成功，netcdf-fortran 编译失败，不知道原因在哪里。又进行不下去了，第二天结束。


## Day 3

> [Arch Linux](https://archlinux.org/)是个好东西


我到 Arch 仓库中搜了一下这几个包，都可以通过 `pacman` 安装。我将系统换成了Manjaro，一个基于 Arch Linux 的发行版。

**终于找到简便的安装方法了**

下面记录一下安装过程。

## RTTOV 12.2 安装记录

> 以下操作在[Arch Linux](https://archlinux.org/)或 [Manjaro Linux](https://manjaro.org/)中进行

### Step 1 下载安装依赖库

设置 pacman 镜像为国内镜像（非必须）

```bash
# 备份 mirrorlist
sudo mv /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak

# 将清华镜像写入新的 mirrorlist 中
sudo echo "Server = https://mirrors.tuna.tsinghua.edu.cn/manjaro/stable/\$repo/\$arch" >> /etc/pacman.d/mirrorlist

# 同步软件仓库
sudo pacman -Syy
```

安装依赖包

```bash
# 一条命令安装编译依赖库，无需自行编译
sudo pacman -S gcc make gcc-fortran zlib hdf5 netcdf netcdf-fortran
```

### Step 2 安装 Python 2

到[Miniconda官网](https://conda.io/en/latest/miniconda.html)下载 Miniconda2

安装Miniconda2，安装过程中注意将Miniconda加入环境变量

```bash
sh Miniconda2-*.sh
```

安装RTTOV GUI的依赖库，注意wxpython版本
```bash
conda install numpy scipy h5py matplotlib wxpython==3.0.0
```

### Step 3 下载 RTTOV 12.2

到官网下载RTTOV12.2，下载完成后解压

```bash
# 在家目录下安装
cd
mkdir rttov12
tar -zxvf rttov122.tar.gz -C rttov12
```

### Step 4 修改build/Makefile.local

```bash
cd rttov12
nano build/Makefile.local
```

主要修改如下内容

```bash
HDF5_PREFIX = /usr
# For most compilers ...
FFLAGS_HDF5 =-D_RTTOV_HDF $(FFLAG_MOD)$(HDF5_PREFIX)/include
# For most compilers ...
LDFLAGS_HDF5 =-L$(HDF5_PREFIX)/lib -lhdf5hl_fortran -lhdf5_hl -lhdf5_fortran -lhdf5

NETCDF_PREFIX = /usr
# For most compilers ...
FFLAGS_NETCDF =-D_RTTOV_NETCDF -I$(NETCDF_PREFIX)/include
# For netcdf v4.2 and later ...
LDFLAGS_NETCDF =-L$(NETCDF_PREFIX)/lib -lnetcdff
```

### Step 5 编译RTTOV

```bash
cd rttov12
# 需要在此目录下进行编译
cd src
# 根据提示进行编译安装，可根据实际情况调整编译参数
../build/rttov_compile.sh  
```

测试RTTOV安装情况

```bash
cd rttov12
cd rttov_test
sh test_rttov12.sh ARCH=gfortran
```

### Step 6 配置GUI环境

修改`rttov_gui.env`文件

```bash
cd rttov12
cd gui
nano rttov_gui.env
```

在`RTTOV_GUI_PREFIX=`后添加
```bash
/home/{username}/rttov12/gui
```

### Step 7 运行RTTOV

```bash
cd rttov12
cd gui
source rttov_gui.env
./rttovgui
```

如果出来图形界面，则说明安装成功。

至此，安装完毕。

## 参考内容

1. [Arch Linux](https://archlinux.org/)
1. [ArchWiki](https://wiki.archlinux.org/)
1. [Manjaro Linux](https://manjaro.org/)
1. [RTTOV12.2 (Radiative Transfer for TOVS) 研究环境搭建（二）on WSL Ubuntu LTS 18.04](https://www.jianshu.com/p/ba81ce2ca81e)

推荐一波Manjaro Linux