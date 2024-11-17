<p align="center">
    <div align="center">
        <img src="./src/assets/logo.svg" style="width:300px;">
    </div>
    <h1 align="center"> 
        XCMusic
    </h1>
    <p align="center">
        第三方网易云音乐客户端 / GUI of Netease Cloud Music
        <br />
        <a href="https://xc-music.vercel.app">访问Demo</a>
        ·
        <a href="https://github.com/yiktllw/XCMusic/issues">报告Bug</a>
        ·
        <a href="https://github.com/yiktllw/XCMusic/issues">提出新特性</a>
        <br/>
    </p>
    <div align="center">

[![Contributors][contributors-shield]][contributors-url] [![Forks][forks-shield]][forks-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![MIT License][license-shield]][license-url]

</div>

</p>

![image](https://github.com/user-attachments/assets/883a0c2d-5ed2-4d3b-acd3-8c867820b5ba)

## 目录

- [目录](#目录)
- [特性](#特性)
- [待完成](#待完成)
- [部署到vercel](#部署到vercel)
- [配置开发环境](#配置开发环境)
- [灵感来源](#灵感来源)
- [关于](#关于)
- [许可证](#许可证)
- [截图](#截图)

## 特性

- 使用Vue3+Electron开发
- 出于安全考虑，只支持手机扫码登录
- 与网易云音乐3.0类似的布局
- 支持下载音乐、播放本地音乐
- 支持多种主题、自定义主题
- 支持查看歌词、回忆坐标、音乐百科
- 支持查看曲谱(没有权限的曲谱需要在手机端购买)
- 支持音量均衡功能
- 支持选择输出设备
- 支持使用弹幕姬点歌。(需要在弹幕姬安装[DMPlugin_XCMusic](https://github.com/yiktllw/DMPlugin_XCMusic)插件)

**[⬆ 回到目录](#目录)**

## 待完成

- [ ] 评论
  - [ ] 点赞功能
  - [ ] 楼中楼功能
- [ ] 播放界面
  - [ ] 点击歌词跳转功能
- [ ] 侧边栏
  - [ ] 首页推荐
  - [ ] 最近播放
- [ ] 歌单
  - [ ] 多选操作,使用ctrl,shift完成多选,拖拽排序
  - [ ] 处理无版权歌曲
  - [ ] 收藏歌单，收藏专辑
- [ ] 设置界面
  - [x] 开机自启动功能
  - [x] 启动时自动播放
  - [ ] 快捷键
  - [ ] 通知管理
  - [x] 硬件加速
  - [x] 侧边栏内容管理
  - [x] 导入、导出设置为JSON
  - [x] 导入、导出已下载歌曲信息
- [ ] 系统
  - [ ] 完善系统托盘功能
- [ ] 音乐云盘

**[⬆ 回到目录](#目录)**

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

**[⬆ 回到目录](#目录)**

## 配置开发环境

以下操作均基于Node.js，如果没有安装，请先安装[Node.js](https://nodejs.org/zh-cn)

安装依赖

```shell
npm install
```

运行Electron程序

```shell
npm run electron:serve
```

编译为二进制程序

```shell
npm run electron:build
```

**[⬆ 回到目录](#目录)**

## 灵感来源

- 网易云音乐API: [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [网易云音乐3.0](https://music.163.com)
- 部分主题配色来源于vscode对应的主题

**[⬆ 回到目录](#目录)**

## 关于

4. XC系列01: XCMusic
<div/>

3. Für "Clara Josephine Schumann".
<div/>

2. Prelude for TeXpert Code.
<div/>

1. 图标来自于氢原子$ n=3, l=2, m=1 $时的波函数

**[⬆ 回到目录](#目录)**

## 许可证

根据 MIT 许可证分发。打开 [LICENSE](./LICENSE) 查看更多内容。

**[⬆ 回到目录](#目录)**

## 截图

![image](https://github.com/user-attachments/assets/45fcabb2-8f89-434e-a8cc-7548a740c030)

![image](https://github.com/user-attachments/assets/9ae95407-2a1b-470b-a1b5-4de008dc331a)

![image](https://github.com/user-attachments/assets/1f54849d-62fa-4083-8f50-ef4cb0281eaf)

![image](https://github.com/user-attachments/assets/99b367f7-0af6-4e84-994e-65e4727dda50)

![image](https://github.com/user-attachments/assets/a50d0ed3-2cce-4164-a250-c3095b8944b9)

![image](https://github.com/user-attachments/assets/3ccda896-91a9-4c39-b7aa-a4d9054c1844)

![image](https://github.com/user-attachments/assets/295ae345-c30a-45bb-b750-f720371e8ef0)

![image](https://github.com/user-attachments/assets/c5904c59-651c-43e6-bebf-2bb45d18b52e)

![image](https://github.com/user-attachments/assets/74b1ac59-b995-4794-b230-dc80369c38b7)

![image](https://github.com/user-attachments/assets/e7e17666-31d1-484a-98a7-18284c5b10af)

**[⬆ 回到目录](#目录)**

<!-- Contributors -->

[contributors-shield]: https://img.shields.io/github/contributors/yiktllw/XCMusic.svg
[contributors-url]: https://github.com/yiktllw/XCMusic/graphs/contributors

<!-- Forks -->

[forks-shield]: https://img.shields.io/github/forks/yiktllw/XCMusic.svg
[forks-url]: https://github.com/yiktllw/XCMusic/network/members

<!-- Stars -->

[stars-shield]: https://img.shields.io/github/stars/yiktllw/XCMusic.svg
[stars-url]: https://github.com/yiktllw/XCMusic/stargazers

<!-- Issues -->

[issues-shield]: https://img.shields.io/github/issues/yiktllw/XCMusic.svg
[issues-url]: https://github.com/yiktllw/XCMusic/issues

<!-- License -->

[license-shield]: https://img.shields.io/github/license/yiktllw/XCMusic.svg
[license-url]: https://github.com/yiktllw/XCMusic/blob/master/LICENSE
