<h1 align="center"> 
    XCMusic
</h1>
<p align="center">
    第三方网易云音乐客户端
</p>
<div align="center">
	<img src="./src/assets/logo.svg" style="width:300px;">
</div>

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
运行Electron程序
```
npm run electron:serve
```
编译为win32程序
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
![image](https://github.com/user-attachments/assets/309af8e7-07af-4f88-9a9a-872c40563a23)

![image](https://github.com/user-attachments/assets/97cfc4f3-3dfa-4305-8476-076cf2b75b3a)

![image](https://github.com/user-attachments/assets/07d9be0a-c8d4-4ce8-b2fc-9ab9f312e63e)

![image](https://github.com/user-attachments/assets/5ce78c42-dc6e-4291-8121-90783345cd23)

![image](https://github.com/user-attachments/assets/4a5a5a48-55ac-4edc-86ac-a63cd68247ca)

![image](https://github.com/user-attachments/assets/3770519c-035a-4c25-b70c-28e4f6eed30f)

![image](https://github.com/user-attachments/assets/34d6a10a-4581-4943-afa6-d1bc4708a090)

![image](https://github.com/user-attachments/assets/2fdb5c77-217a-4226-8139-26efac5f6533)

![image](https://github.com/user-attachments/assets/87a43859-f795-4126-ab5d-a81931411a75)

![image](https://github.com/user-attachments/assets/17159272-990a-4256-9776-b65a17ba23c2)


