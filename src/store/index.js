import { createStore } from 'vuex';  // 使用 createStore 创建 Vuex store

export default createStore({
    state() {
        return {
            loginStatus: false, // 初始化 loginStatus 为 false
            sidebarWidth: 230, // 初始化 sidebarWidth 为 230
            likelist: [], // 初始化 likelist 为一个空数组
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
        }
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
    },
});