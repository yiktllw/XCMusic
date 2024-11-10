<h1 align="center"> 
    XCMusic
</h1>
<p align="center">
    第三方网易云音乐客户端
</p>
<div align="center">
	<img src="./src/assets/logo.svg" style="width:300px;">
</div>
<br></br>

![image](https://github.com/user-attachments/assets/45fcabb2-8f89-434e-a8cc-7548a740c030)

## 目录

- [特性](#特性)
- [待完成](#待完成)
- [部署](#部署到vercel)
- [配置开发环境](#配置开发环境)
- [灵感来源](#灵感来源)
- [关于](#关于)
- [截图](#截图)

访问DEMO: [xc-music.vercel.app](https://xc-music.vercel.app/)


## 特性
- 使用Vue3+Electron开发
- 出于安全考虑，只支持手机扫码登录
- 与网易云音乐3.0类似的布局
- 支持下载音乐
- 支持播放本地音乐
- 支持多种主题
- 支持自定义主题
- 支持查看回忆坐标、音乐百科
- 支持查看曲谱(没有权限的曲谱需要在手机端购买)
- 可以使用媒体快捷键控制播放
- 可以在系统通知中控制播放
- 支持音量均衡功能
- 支持选择输出设备
- 类手机端的专辑界面
- 背景颜色随显示内容改变
- 支持使用弹幕姬点歌。(需要在弹幕姬安装[DMPlugin_XCMusic](https://github.com/yiktllw/DMPlugin_XCMusic)插件)
- 支持查看和复制歌曲信息(歌曲id，歌曲链接)

## 待完成
- 评论
    - 点赞功能
    - 楼中楼功能
- 播放界面
    - 点击歌词跳转功能
- 侧边栏
    - 首页推荐
    - 下载管理
    - 最近播放
- 歌单
    - 多选操作,使用ctrl,shift完成多选,拖拽排序
    - 处理无版权歌曲
    - 收藏歌单，收藏专辑
- 设置界面
    - 开机自启动功能
    - 启动时自动播放
    - 快捷键
    - 通知管理
    - 侧边栏内容管理
- 系统
    - 完善系统托盘功能
- 音乐云盘

## 部署到vercel
1. fork此项目
2. 部署[yiktllw/NeteaseCloudMusicApi](https://github.com/yiktllw/NeteaseCloudMusicApi)
3. 新建vercel.json文件，写入:
```json
{
    "builds": [
        {
            "src": "package.json",
            "use": "@vercel/static-build",
            "config": {
                "distDir": "dist_electron" 
            }
        }
    ]
}
```
4. 导入到vercel，新增一个环境变量: `VUE_APP_API`，值为第二步部署的api地址。

## 配置开发环境
以下操作均基于Node.js，如果没有安装，请先安装[Node.js](https://nodejs.org/zh-cn)

安装依赖
```
npm install
```
解决依赖冲突
```
node babel_cmds.js
```
运行Electron程序
```
npm run electron:serve
```
编译为二进制程序
```
npm run electron:build
```

## 灵感来源

- 网易云音乐API: [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [网易云音乐3.0](https://music.163.com)
- 部分主题配色来源于vscode对应的主题

## 关于
3. 
<div> </div>

2. 
<div> </div>

1. 图标来自于氢原子$ n=3, l=2, m=1 $时的波函数:

<div align="center">
	<img src="./src/assets/Hydrogen_n=3_l=2_m=1.png" style="width:400px;">
</div>

## 截图
![image](https://github.com/user-attachments/assets/1ab7d31b-955a-4a49-b7c5-bf253fd92a61)

![image](https://github.com/user-attachments/assets/9ae95407-2a1b-470b-a1b5-4de008dc331a)

![image](https://github.com/user-attachments/assets/1f54849d-62fa-4083-8f50-ef4cb0281eaf)

![image](https://github.com/user-attachments/assets/99b367f7-0af6-4e84-994e-65e4727dda50)

![image](https://github.com/user-attachments/assets/a50d0ed3-2cce-4164-a250-c3095b8944b9)

![image](https://github.com/user-attachments/assets/3ccda896-91a9-4c39-b7aa-a4d9054c1844)

![image](https://github.com/user-attachments/assets/295ae345-c30a-45bb-b750-f720371e8ef0)

![image](https://github.com/user-attachments/assets/c5904c59-651c-43e6-bebf-2bb45d18b52e)

![image](https://github.com/user-attachments/assets/74b1ac59-b995-4794-b230-dc80369c38b7)

![image](https://github.com/user-attachments/assets/e7e17666-31d1-484a-98a7-18284c5b10af)

