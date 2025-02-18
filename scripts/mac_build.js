const { exec } = require("child_process");

// 查找 Python 路径
exec("which python", (error, stdout, stderr) => {
  if (error || stderr) {
    console.error(
      "错误：未找到 Python。请确保已安装 Python 并在 PATH 中配置。",
    );
    process.exit(1);
  }

  // 获取 Python 路径
  const pythonPath = stdout.trim();

  // 导出 PYTHON_PATH 环境变量
  process.env.PYTHON_PATH = pythonPath;
  console.log(`已设置 PYTHON_PATH 为: ${pythonPath}`);

  // 执行 npm run electron:build
  const buildProcess = exec("npm run electron:build");

  // 直接转发 npm run electron:build 的标准输出
  buildProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  // 直接转发 npm run electron:build 的错误输出
  buildProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  // 处理执行完成后的回调
  buildProcess.on("close", (code) => {
    if (code === 0) {
      console.log("构建成功！");
    } else {
      console.error(`构建失败，退出代码: ${code}`);
      process.exit(1);
    }
  });
});
