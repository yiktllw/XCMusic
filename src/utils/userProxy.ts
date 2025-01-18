/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * userProxy.ts为主进程中，用户设置代理的相关操作
 * 支持http、socks4、socks5、浏览器代理
 *---------------------------------------------------------------*/
import { session } from "electron";
import { ProxyConfig } from "@/dual/userProxy.interface";

/**
 * 设置代理
 */
export function setProxy(proxyConfig: ProxyConfig) {
  // `none` 表示不使用代理
  if (proxyConfig.mode === "none") {
    session.defaultSession.setProxy({ proxyRules: "" }).then(() => {
      console.log("代理已禁用");
    });
  }
  // 使用 HTTP 代理 / SOCKS 代理（SOCKS4 或 SOCKS5）
  else {
    let proxyUrl: URL;
    try {
      proxyUrl = new URL(proxyConfig.server);
    } catch (error) {
      console.error("代理服务器地址无效");
      return;
    }
    let proxyAuth = "";
    if (proxyConfig.username && proxyConfig.password) {
      proxyAuth = `${proxyConfig.username}:${proxyConfig.password}@`;
    }
    let proxyRule = `${proxyConfig.mode}=${proxyAuth}http://${proxyUrl.host}`;
    session.defaultSession.setProxy({ proxyRules: proxyRule }).then(() => {
      console.log(
        `使用 ${proxyConfig.mode.toUpperCase()} 代理: ${proxyConfig.server}`
      );
    });
  }
}
