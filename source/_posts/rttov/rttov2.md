---
title: CentOS 7 安装 RTTOV
categories: RTTOV12
date: 2019-05-31
---

前面做过在 Manjaro Linux 下安装 RTTOV 的笔记，由于 Manjaro Linux 下的所有包都是最新的，难免会出现一些稳定性问题（e.g. RTTOV 挂了），故换用 CentOS 7 安装 RTTOV，记录一下安装过程。

<!--more-->

> 2019/06/02 更新
>
> 1. 修复了一个导致编译出错的问题
>
> 1. 将下载 Miniconda2 时使用的 wget 替换为 curl（CentOS 7 默认不安装 wget）
>
> 1. 修改文章结构

## 安装准备

- CentOS 7 x64
- rttov12.tar.gz

## 安装 RTTOV 依赖包

### 设置 yum 为国内镜像（可选）

参照[CentOS 镜像使用帮助](http://mirrors.ustc.edu.cn/help/centos.html)将 yum 镜像设置为国内镜像

### 安装 epel

```bash
sudo yum install epel-release
```

### 更新软件包缓存

```bash
sudo yum makecache
```

### 安装依赖包

```bash
sudo yum install make \
                 gcc gcc-gfortran \
                 perl perl-core perl-devel perl-libs \
                 zlib zlib-devel \
                 hdf5 hdf5-devel \
                 netcdf netcdf-devel \
                 netcdf-fortran netcdf-fortran-devel
```

## 安装 RTTOV GUI 依赖包（可选）

```bash
# 下载 Miniconda 2
curl -O https://repo.anaconda.com/miniconda/Miniconda2-latest-Linux-x86_64.sh

# 安装
sh Miniconda2-latest-Linux-x86_64.sh
```

注意：在出现`by running conda init? [yes|no]`时输入`yes`。

重启 terminal，使 miniconda 环境变量生效。

```bash
# 安装 RTTOV GUI 的依赖库，注意 wxpython 版本
conda install numpy scipy h5py matplotlib wxpython==3.0.0
```

## 编译安装 RTTOV

### 下载解压 RTTOV 12.2

到官网下载 RTTOV 12.2，下载完成后解压

```bash
# 在 /home/{username}/ 下安装
cd ~
mkdir rttov12
tar -zxvf rttov122.tar.gz -C rttov12
```

### 修改 Makefile.local

```bash
cd ~/rttov12
vi build/Makefile.local
```

主要修改如下内容，注意新增的部分：

```bash
HDF5_PREFIX = /usr

# For most compilers:
FFLAGS_HDF5 = -D_RTTOV_HDF $(FFLAG_MOD)$(HDF5_PREFIX)/include -I/usr/lib64/gfortran/modules

# In most cases:
LDFLAGS_HDF5 = -L$(HDF5_PREFIX)/lib -L$(HDF5_PREFIX)/lib64 -lhdf5hl_fortran -lhdf5_hl -lhdf5_fortran -lhdf5

NETCDF_PREFIX = /usr

# For most other compilers:
FFLAGS_NETCDF = -D_RTTOV_NETCDF -I$(NETCDF_PREFIX)/include

# For NetCDF v4.2 and later:
LDFLAGS_NETCDF = -L$(NETCDF_PREFIX)/lib -L$(NETCDF_PREFIX)/lib64 -lnetcdff
```

### 编译 RTTOV

```bash
cd ~/rttov12/src
# 根据提示进行编译安装，可根据实际情况调整编译参数
../build/rttov_compile.sh
```

### 测试 RTTOV 安装情况

```bash
cd ~/rttov12/rttov_test
sh test_rttov12.sh ARCH=gfortran
```

若出现`Ran 11 tests, 11=OK`则说明测试无误。

### 配置 GUI 环境（可选）

::: tip 提示
若未进行`安装 RTTOV GUI 依赖库`操作，本小节无需进行
:::

修改`rttov_gui.env`文件

```bash
cd ~/rttov12/gui
vi rttov_gui.env
```

在 `RTTOV_GUI_PREFIX=` 后添加

```bash
/home/{username}/rttov12/gui
```

图形界面测试

```bash
cd ~/rttov12/gui
source rttov_gui.env
./rttovgui
```

如果出来图形界面，则说明图形界面安装配置成功。

## 参考内容

1. [RTTOV 12.2 安装记录](rttov.md)
1. [RTTOV 12.2 (Radiative Transfer for TOVS) 研究环境搭建（一）on WSL Ubuntu LTS 18.04](https://www.jianshu.com/p/1c2a771a2eca)
1. [RTTOV 12.2 (Radiative Transfer for TOVS) 研究环境搭建（二）on WSL Ubuntu LTS 18.04](https://www.jianshu.com/p/ba81ce2ca81e)
