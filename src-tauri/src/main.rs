// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::env;
use std::env::consts::OS;
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;  // 导入 CommandExt trait 以便使用 creation_flags

fn main() {
    // 获取当前目录
    let app_dir = std::env::current_dir().expect("Failed to get current directory");

    // 根据操作系统调整文件名后缀
    let exe_name = match OS {
        "windows" => "app.exe",
        _ => "app", // 非 Windows 平台不加后缀
    };

    // 构造 .exe 文件路径
    let exe_path = app_dir.join("resources").join("api").join(exe_name);
    println!("Exe path: {:?}", exe_path);

    // 启动子进程
    let mut child = {
        #[cfg(target_os = "windows")]
        {
            Command::new(exe_path)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .creation_flags(0x08000000) // CREATE_NO_WINDOW
                .spawn()
                .expect("Failed to start exe program")
        }
        #[cfg(not(target_os = "windows"))]
        {
            Command::new(exe_path)
                .stdout(Stdio::piped()) // 捕获标准输出
                .stderr(Stdio::piped()) // 捕获标准错误
                .spawn()
                .expect("Failed to start exe program")
        }
    };

    println!("Started exe program");

    // 获取 stdout 和 stderr
    let stdout = child.stdout.take().expect("Failed to capture stdout");
    let stderr = child.stderr.take().expect("Failed to capture stderr");

    // 创建线程分别处理 stdout 和 stderr
    let stdout_thread = std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(line) => println!("[STDOUT] {}", line), // 转发标准输出
                Err(e) => eprintln!("Error reading stdout: {}", e),
            }
        }
    });

    let stderr_thread = std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            match line {
                Ok(line) => eprintln!("[STDERR] {}", line), // 转发标准错误
                Err(e) => eprintln!("Error reading stderr: {}", e),
            }
        }
    });

    env::set_var("VUE_APP_API", "http://localhost:43210");
    println!("app start");
    app_lib::run();
    println!("app end");

    // 等待子进程完成
    let status = child.wait().expect("Failed to wait on child");
    println!("Process exited with status: {}", status);

    // 等待线程完成
    let _ = stdout_thread.join();
    let _ = stderr_thread.join();
}
