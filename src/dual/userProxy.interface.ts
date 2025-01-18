/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * 此文件为userProxy.ts的接口定义
 *---------------------------------------------------------------*/

export interface ProxyConfig {
  /**
   * 代理模式，可选值为"none"、"http"、"socks4"、"socks5"
   */
  mode: "none" | "http" | "socks4" | "socks5";
  /**
   * 代理服务器地址，如"127.0.0.1:7890"
   */
  server: string;
  /**
   * 代理服务器用户名，可选
   */
  username?: string;
  /**
   * 代理服务器密码，可选
   */
  password?: string;
}