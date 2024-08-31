import { createStore } from 'vuex';  // 使用 createStore 创建 Vuex store
import { Player } from '@/ncm/player';  // 引入 Player 类

export default createStore({
    state() {
        return {
            loginStatus: false, // 初始化 loginStatus 为 false
            sidebarWidth: 230, // 初始化 sidebarWidth 为 230
            likelist: [], // 初始化 likelist 为一个空数组
            nowPlaying: 0, // 初始化 正在播放的歌曲id 为 0
            player: new Player(), // 初始化 player 为一个 Player 实例
        };
    },
    mutations: {
        setLoginStatus(state, status) {
            state.loginStatus = status;
        },
        setSidebarWidth(state, width) {
            state.sidebarWidth = width;
        },
        setLikeList(state, list) {
            state.likelist = list;
        },
        setNowPlaying(state, id) {
            state.nowPlaying = id;
        },
    },
    actions: {
        updateLoginStatus({ commit }, status) {
            commit('setLoginStatus', status);
        },
        updateSidebarWidth({ commit }, width) {
            commit('setSidebarWidth', width);
        },
        updateLikelist({ commit }, list) {
            commit('setLikeList', list);
        },
        updateNowPlaying({ commit }, id) {
            commit('setNowPlaying', id);
        },
    },
});