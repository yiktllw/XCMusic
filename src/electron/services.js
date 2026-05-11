/* eslint-disable no-undef */
// From YesPlayMusic

import clc from "cli-color";
import server from "@yiktllw/ncm-api/server";
import net from "net";
import http from "http";
import fs from "fs";
import path from "path";

const API_HOST = process.env.XCM_API_HOST || "127.0.0.1";
const API_HEALTH_PATH = process.env.XCM_API_HEALTH_PATH || "/login/status";
const DEFAULT_PORT_SCAN_START = 43210;
const DEFAULT_PORT_SCAN_COUNT = 200;

function buildPortRange(startPort, count) {
  return Array.from({ length: count }, (_, index) => startPort + index);
}

function parsePortCandidates(rawPorts) {
  if (!rawPorts || typeof rawPorts !== "string") {
    return buildPortRange(DEFAULT_PORT_SCAN_START, DEFAULT_PORT_SCAN_COUNT);
  }

  const candidates = rawPorts
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter(
      (port, index, list) =>
        Number.isInteger(port) && port > 0 && list.indexOf(port) === index,
    );

  if (candidates.length > 0) {
    return candidates;
  }

  return buildPortRange(DEFAULT_PORT_SCAN_START, DEFAULT_PORT_SCAN_COUNT);
}

async function isPortInUse(port) {
  return new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once("error", (err) =>
        err.code === "EADDRINUSE" ? resolve(true) : reject(err),
      )
      .once("listening", () =>
        tester.once("close", () => resolve(false)).close(),
      )
      .listen(port);
  });
}

async function isApiHealthy(host, port, pathName = API_HEALTH_PATH) {
  return new Promise((resolve) => {
    const request = http.request(
      {
        host,
        port,
        path: pathName,
        method: "GET",
        timeout: 1200,
      },
      (response) => {
        response.resume();
        const statusCode = response.statusCode || 0;
        resolve(statusCode >= 200 && statusCode < 500);
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
    request.on("error", () => resolve(false));
    request.end();
  });
}

export async function startNeteaseMusicApi() {
  const tmpPath = require("os").tmpdir();
  if (!fs.existsSync(path.resolve(tmpPath, "anonymous_token"))) {
    fs.writeFileSync(path.resolve(tmpPath, "anonymous_token"), "", "utf-8");
  }
  // Let user know that the service is starting
  console.log(`${clc.redBright("[NetEase API]")} initiating NCM API`);
  const portCandidates = parsePortCandidates(process.env.XCM_API_PORTS);

  // 保存原始的 console.log
  const originalConsoleLog = console.log;

  // 重写 console.log 方法
  console.log = function (...args) {
    // 将所有参数转换为字符串，并连接成一个完整的消息字符串
    let message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg),
      )
      .join(" ");

    // 如果字符串中包含 "cookie="，则将其后面的内容替换为 "INVISIBLECOOKIE"
    message = message.replace(/cookie=[^&]+/g, "cookie=PROTECTEDCOOKIE");

    // 调用原始的 console.log 方法输出处理后的消息
    originalConsoleLog(message);
  };

  for (const port of portCandidates) {
    const portInUse = await isPortInUse(port);
    const baseURL = `http://${API_HOST}:${port}`;

    if (portInUse) {
      const reusable = await isApiHealthy(API_HOST, port);
      if (reusable) {
        console.log(
          `${clc.redBright("[NetEase API]")} Reusing NCM API on port ${port}`,
        );
        return {
          host: API_HOST,
          port,
          baseURL,
          source: "reused",
          healthy: true,
        };
      }
      continue;
    }

    await server.serveNcmApi({
      port,
      moduleDefs: require("../ncmModDef"),
    });
    console.log(
      `${clc.redBright("[NetEase API]")} NCM API started on port ${port}`,
    );
    return {
      host: API_HOST,
      port,
      baseURL,
      source: "started",
      healthy: true,
    };
  }

  throw new Error("No available API port found for NCM API startup.");
}
