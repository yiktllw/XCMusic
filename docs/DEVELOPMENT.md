
以下操作均基于Node.js，如果没有安装，请先安装[Node.js](https://nodejs.org/zh-cn)，建议使用nodejs 18及以上版本。

可以使用electron或者tauri作为项目后端，由于tauri后端并未完全适配，更建议使用electron后端。

### 安装依赖

```shell
npm install
```

### 使用electron
运行Electron程序

```shell
npm run electron:serve
```

打包为二进制程序

```shell
npm run electron:build
```

如果在mac上因为找不到python出错，请在安装python后执行
```bash
node ./scripts/mac_build.js
```

### 使用tauri

1. 打包网易云音乐api程序:

   1. 克隆仓库:[yiktllw/NeteaseCloudMusicApi](https://github.com/yiktllw/NeteaseCloudMusicApi)
   2. 在`NeteaseCloudMusicApi`目录下，安装依赖:

   ```shell
   npm install
   ```

   3. 在`NeteaseCloudMusicApi`目录下，修改`app.js`的`start`函数为:

   ```javascript
   async function start() {
     // 检测是否存在 anonymous_token 文件,没有则生成
     if (!fs.existsSync(path.resolve(tmpPath, "anonymous_token"))) {
       fs.writeFileSync(path.resolve(tmpPath, "anonymous_token"), "", "utf-8");
     }
     // 启动时更新anonymous_token
     const generateConfig = require("./generateConfig");
     await generateConfig();
     require("./server").serveNcmApi({
       checkVersion: false,
       port: 43210,
     });
   }
   ```

   4. 在`NeteaseCloudMusicApi`目录下，根据平台运行命令:

   win平台

   ```shell
   npm run pkgwin
   ```

   linux平台

   ```shell
   npm run pkglinux
   ```

   macos平台

   ```shell
   npm run pkgmacos
   ```

   5. 在`NeteaseCloudMusicApi/bin`目录下，找到打包的程序，并将其复制到`XCMusic/src-tauri/resources/api`目录下。

2. 安装Rust开发环境

3. 运行tauri程序:

```shell
npm run tauri:serve
```

4. 打包为二进制程序:

```shell
npm run tauri:build
```