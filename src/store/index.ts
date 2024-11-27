import { createStore } from "vuex"; // 使用 createStore 创建 Vuex store
import { Player } from "@/utils/player"; // 引入 Player 类
import { Login } from "@/utils/login";
import { Setting, ISettings } from "@/utils/setting";
import { OpenedPlaylist } from "@/utils/openedPlaylist";
import { markRaw } from "vue";
import { Download } from "@/utils/download_renderer";
import { GlobalMsg } from "@/utils/globalMsg";

export interface State {
  player: Player; // player 属性的类型为 Player
  login: Login;
  setting: ISettings;
  openedPlaylist: OpenedPlaylist;
  download: Download;
  globalMsg: GlobalMsg;
}

export default createStore({
  state() {
    const download = new Download();
    return {
      player: markRaw(new Player()), // 初始化 player 为一个 Player 实例
      login: new Login(), // 初始化 login 为一个 Login 实例
      setting: new Setting(), // 初始化 setting 为一个 Setting 实例
      openedPlaylist: new OpenedPlaylist(), // 初始化 OpenedPlaylist 为一个 OpenedPlaylist 实例
      download: download, // 初始化 download 为一个 Download 实例
      globalMsg: new GlobalMsg(),
    };
  },
  getters: {},
  mutations: {},
  actions: {},
});
