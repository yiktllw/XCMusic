## 权限说明 / Permission Description

### 文件系统 / File System
XCMusic需要访问以下目录以保障核心功能运行：
XCMusic requires access to the following directories for core functionality:

~/Downloads/， ~/下载/：用户主目录下的默认下载目录
~/Downloads/, ~/下载/: Default download directories in user home folder

~/Documents/弹幕姬/：用于存储点歌功能相关数据
~/Documents/弹幕姬/: Stores data related to song request feature

### 设备访问 / Device Access
程序需要枚举系统音频输出设备以提供播放功能
The application needs to enumerate system audio output devices for playback functionality

### 其他权限 / Additional Permissions
基于 Electron 框架构建，某些系统可能会显示与核心功能无关的框架级权限请求
Built on Electron framework, some systems may show framework-level permission requests unrelated to core features

您可以安全地拒绝这些额外的权限，这不会影响您正常使用XCMusic
You can safely decline these additional permissions without affecting main functionality