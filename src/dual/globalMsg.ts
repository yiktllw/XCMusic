/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * globalMsg.ts 为@/utils/globalMsg.ts配套的处理工具
 * 用于防止循环引用
 *---------------------------------------------------------------*/

export enum GlobalMsgEvents {
  /** 创建歌单 */
  CreatePlaylist = "CreatePlaylist",
  /** 打开登录窗口 */
  OpenLoginWindow = "OpenLoginWindow",
  /** 关闭登录窗口 */
  CloseLoginWindow = "CloseLoginWindow",
  /** 关闭登录窗口 */
  CloseLoginWindowFromHomeView = "CloseLoginWindowFromHomeView",
  /** 打开自定义主题窗口 */
  OpenCustomWindow = "OpenCustomWindow",
  /** 关闭自定义主题窗口 */
  CloseCustomWindow = "CloseCustomWindow",
  /** 打开关闭程序窗口 */
  OpenCloseWindow = "OpenCloseWindow",
  /** 打开歌单右键菜单 */
  OpenCtxMenuPlaylist = "OpenCtxMenuPlaylist",
  /** 打开确认窗口 */
  Confirm = "Confirm",
  /** 关闭播放界面 */
  ClosePlayUI = "ClosePlayUI",
  /** 刷新侧边栏的固定项 */
  RefreshSidebar = "RefreshSidebar",
  /** 刷新用户创建的、订阅的歌单 */
  RefreshPlaylist = "RefreshPlaylist",
}
