/* eslint-disable no-undef */
import { Setting } from "./ncm/setting";
import { Login } from "./ncm/login";
import { Player } from '@/ncm/player';  // 引入 Player 类
import { OpenedPlaylist } from '@/tools/openedPlaylist';
export { };

declare global {
    interface Window {
        setting: Setting;
        Setting: typeof Setting;
    }
}

declare interface State {
    player: Player;
    setting: Setting;
    login: Login;
    openedPlaylist: OpenedPlaylist;
}
