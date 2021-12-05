---
title: Windows 下 OpenCV 安装踩坑记
date: 2019-03-06
---

> 你已经是一台成熟的电脑了，该学会自己给自己安装开发环境了。

<!--more-->

## 前言

项目需要使用 OpenCV 和它的扩展模块 opencv_contrib，官网上只提供源码、不含扩展模块的Windows版本、iOS和Android pack，想使用OpenCV和它的扩展模块，有如下的几种方法：

1. 使用OpenCV Python接口
2. 使用Manjaro Linux / Arch Linux系统并安装OpenCV
3. 下载源码自行编译
4. 其他方法

## 0x01

先来说说第一种方法，安装很简单：

```bash
pip install opencv-python opencv-contrib-python
```

使用方法参考官方文档即可，前面一直用这个方法，开发很快也很顺利。

**「一号坑已就位」**

OpenCV基础模块用到现在没发现什么问题，直到我用到了扩展模块中的face模块，按照官方文档的要求写好程序，运行时发生了程序卡死的现象。搜了一下在GitHub上搜到一个issue：

[opencv/opencv_contrib#1661 Using Facemark API (Python), Version 4.0.0 - pre : bad alloc error](https://github.com/opencv/opencv_contrib/issues/1661)

里面主要说的是一个C++函数的BUG导致导出Python接口时出现错误。Issue的下面讲了很多，给人一种BUG已经修复的感觉。我去看了一下有BUG的那个文件，里面写了一句话：

```cpp
// FIX IT
```

也就是说，开发人员临时修了一下BUG，但没有合并到OpenCV代码中。

**“官方BUG最为致命”**

此路不通，另寻他路。

> 2019-08-22 更新：此 BUG 已修复

## 0x02

我想到了以前装RTTOV时使用的Manjaro Linux系统，去仓库里搜了一下，有OpenCV软件包，而且这个软件包包含了扩展模块，可以拿来做开发环境。

那么问题来了，有些东西必须在Windows系统中使用，怎样兼顾呢？

方法有几种：

1. Windows + WSL
2. Windows + 虚拟机 + Manjaro
3. 其他方法

官方WSL不含Manjaro或者Arch Linux系统，想安装的话可以使用[Arch Wiki](https://wiki.archlinux.org/)推荐的[ArchWSL](https://github.com/yuk7/ArchWSL)项目，安装也很简单，跟着文档一步步来就行。

系统安装完毕后，开始安装软件包：

```bash
pacman -S opencv
```

此时可以使用SSH连接WSL进行开发了。

```bash
# 安装OpenSSH
pacman -S openssh
# 开机启动SSH
systemctl enable sshd.service
# 配置SSH可以使用用户名密码登录
vi /etc/ssh/sshd_config
# 将PasswordAuthentication yes前的#去掉
# 重启SSH服务
systemctl restart sshd.service
```

**「二号坑已就位」**

屏幕上出现一行字：`System has not been booted with systemd as init system (PID 1). Can't operate.`

搜了一下，在GitHub上找到一个issue：

[Microsoft/WSL#1579 WSL does not support systemd / an init system, so you cannot use services. You have to run the commands yourself.](https://github.com/Microsoft/WSL/issues/1579)

**官方：我不支持，嘿嘿嘿**

从别的地方找到了启用sshd的方法，开启一个terminal，使用nohup启用sshd服务在后台运行：

```bash
nohup /usr/bin/sshd -D >> ~/output.log 2>&1 &
```

使用IDE链接WSL，配好编译环境，写好测试代码，一切很顺利的样子。

**「三号坑已就位」**

在我封装好摄像头类进行测试的时候，控制台里多了几行字，系统在问我：“摄像头是啥？”

WSL 貌似不能使用一些外设。

## 0x03

虚拟机总能用外设了吧。装个编译程序用的虚拟机，不需要分配太多的资源。安装过程很顺利，摄像头也能够使用。

**「四号坑已就位」**

把虚拟机放后台再开个IDE，内存占用90%多。此法可行，但条件不允许啊。

## 0x04

搜了一下使用MinGW编译的OpenCV，GitHub上有一个项目，[OpenCV-MinGW-Build](https://github.com/huihut/OpenCV-MinGW-Build)，但没有扩展模块。里面有编译方法，我参照它开始了我的编译之路。

参照教程使用CMake生成Makefile，使用mingw32-make.exe进行编译

```bash
mingw32-make.exe -j8
```

启用8线程，看着那满载的CPU，感觉这次稳了。

**「五号坑已就位」**

在编译到`videoio`模块时报错，原因是MinGW自带的头文件aviriff.h注释错误，文件第一行的多行注释少一个“/”符号，修正错误后继续编译，后面报了一些Warning，没有出现Error。

完成后参照[在VSCode中使用OpenCV](https://stackoverflow.com/questions/51622111/opencv-c-mingw-vscode-fatal-error-to-compile/51801863#51801863)博客，编写好Makefile文档，进行测试。

**「六号坑已就位」**

能编译、能链接但不能运行。原因是缺少依赖库。

## 0x05

在博客[在VSCode中使用OpenCV](https://stackoverflow.com/questions/51622111/opencv-c-mingw-vscode-fatal-error-to-compile/51801863#51801863)的底部有两条评论，提供了两种在Windows系统中安装使用OpenCV的方法：

1. 使用[MSYS2](https://msys2.org/)安装OpenCV；
2. 使用vcpkg (MS packager to install windows based open source projects)安装OpenCV。

MSYS2可以看做Windows下的Arch Linux，与WSL不同，MSYS2里面的包都是编译成Windows平台的exe、dll等文件，而WSL中的包是编译成elf、so等文件。

## 0x06 MSYS2 + OpenCV环境配置

### Step 1 下载安装

到官网下载MSYS2安装包，安装完成后配置包镜像。并将目录

```
/path/to/MSYS2/mingw64/bin
```

添加到环境变量中。

### Step 2 安装相关的包

```bash
# 如果没有安装toolchain，安装一下
pacman -S mingw-w64-x86_64-toolchain
# 安装OpenCV
pacman -S mingw-w64-x86_64-opencv
```

### Step 3 配置VSCode开发环境

打开VSCode的设置文件，添加下列内容：

```yaml
"C_Cpp.default.compilerPath": "/path/to/MSYS2/mingw64/bin/gcc.exe",
"C_Cpp.default.cppStandard": "c++11",
"C_Cpp.default.intelliSenseMode": "gcc-x64"
```

### Step 4 编写项目Makefile文件

```makefile
CC = g++ 

CFLAGS += -g -Wall -I/path/to/MSYS2/mingw64/include/opencv4 

LDFLAGS += -L/path/to/MSYS2/mingw64/lib \
	-lopencv_aruco \
	-lopencv_bgsegm \
	-lopencv_calib3d \
	-lopencv_ccalib \
	-lopencv_core \
	-lopencv_datasets \
	-lopencv_dnn -lopencv_dnn_objdetect \
	-lopencv_dpm \
	-lopencv_face \
	-lopencv_features2d -lopencv_xfeatures2d \
	-lopencv_flann \
	-lopencv_fuzzy \
	-lopencv_gapi \
	-lopencv_hdf \
	-lopencv_hfs \
	-lopencv_highgui \
	-lopencv_img_hash \
	-lopencv_imgcodecs -lopencv_imgproc -lopencv_ximgproc \
	-lopencv_line_descriptor \
	-lopencv_ml \
	-lopencv_objdetect -lopencv_xobjdetect \
	-lopencv_optflow \
	-lopencv_ovis \
	-lopencv_phase_unwrapping \
	-lopencv_photo -lopencv_xphoto \
	-lopencv_plot \
	-lopencv_reg \
	-lopencv_rgbd \
	-lopencv_saliency \
	-lopencv_sfm \
	-lopencv_shape \
	-lopencv_stereo \
	-lopencv_stitching \
	-lopencv_structured_light \
	-lopencv_superres \
	-lopencv_surface_matching \
	-lopencv_text \
	-lopencv_tracking \
	-lopencv_video -lopencv_videoio -lopencv_videostab \
	-lopengl32 \
	-lglu32

TARGET = # target

OBJS += # obj files

all:$(TARGET)
$(TARGET):$(OBJS)
	$(CC) $(CFLAGS) $(OBJS) -o $(TARGET) $(LDFLAGS)
$(OBJS):%.o:%.cpp
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY:clean
clean:
	rm -r $(OBJS) $(TARGET)
```

### Step 5 编译运行

```bash
mingw32-make.exe
```

至此，环境配置完毕。

## 经验总结

1. 看博客一定要看到最后
2. 不要形成惯性思维

## 致谢

[MSYS2](https://msys2.org/)

[ArchWSL](https://github.com/yuk7/ArchWSL)

[Arch WiKi](https://wiki.archlinux.org/)

[OpenCV-MinGW-Build](https://github.com/huihut/OpenCV-MinGW-Build)及其开发者[huihut](https://blog.huihut.com/)