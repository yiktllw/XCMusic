## 权限说明 / Permission Description

### 文件系统 / File System
<p class="font-color-high">
XCMusic需要访问以下目录以保障核心功能运行：<br>
XCMusic requires access to the following directories for core functionality:
</p>

<p class="font-color-high">
~/Downloads/， ~/下载/：用户主目录下的默认下载目录<br>
~/Downloads/, ~/下载/: Default download directories in user home folder
</p>

<p class="font-color-high">
~/Documents/弹幕姬/：用于存储点歌功能相关数据<br>
~/Documents/弹幕姬/: Stores data related to song request feature
</p>

### 设备访问 / Device Access
<p class="font-color-high">
程序需要枚举系统音频输出设备以提供播放功能<br>
The application needs to enumerate system audio output devices for playback functionality
</p>

### 网络连接 / Network Connectivity
<p class="font-color-high">
XCMusic作为网易云音乐第三方客户端，需建立网络连接以完成平台账号认证及音乐流媒体服务接入。<br>
XCMusic functions as a third-party client for Netease Cloud Music, requiring internet connectivity for account authentication and streaming service integration.
</p>

<p class="font-color-high">
当禁用网络权限时，您仍可完整使用本地的音乐资源播放功能。<br>
When network permissions are disabled, full functionality for local music library playback remains available.
</p>

### 其他权限 / Additional Permissions
<p class="font-color-high">
基于 Electron 框架构建，某些系统可能会显示与核心功能无关的框架级权限请求<br>
Built on Electron framework, some systems may show framework-level permission requests unrelated to core features
</p>

<p class="font-color-high">
您可以安全地拒绝这些额外的权限，这不会影响您正常使用XCMusic<br>
You can safely decline these additional permissions without affecting main functionality
</p>