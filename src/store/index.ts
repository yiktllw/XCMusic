import { createStore } from 'vuex';  // 使用 createStore 创建 Vuex store
import { Player } from '../ncm/player';  // 引入 Player 类
import { Login } from '../ncm/login';
import { Setting } from '../ncm/setting';
import { OpenedPlaylist } from '../tools/openedPlaylist';
import { markRaw } from 'vue';

export interface State {
    player: Player;  // player 属性的类型为 Player
    login: Login;
    setting: Setting;
    openedPlaylist: OpenedPlaylist;
}

export default createStore({
    state() {
        return {
            player: markRaw(new Player()), // 初始化 player 为一个 Player 实例
            login: new Login(), // 初始化 login 为一个 Login 实例
            setting: new Setting(), // 初始化 setting 为一个 Setting 实例
            openedPlaylist: new OpenedPlaylist(), // 初始化 OpenedPlaylist 为一个 OpenedPlaylist 实例
        };
    },
    mutations: {
    },
    actions: {
    },
});