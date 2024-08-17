import { createStore } from 'vuex';  // 使用 createStore 创建 Vuex store

export default createStore({
    state() {
        return {
            loginStatus: false, // 初始化 loginStatus 为 false
            sidebarWidth: 230
        };
    },
    mutations: {
        setLoginStatus(state, status) {
            state.loginStatus = status;
        }
    },
    actions: {
        updateLoginStatus({ commit }, status) {
            commit('setLoginStatus', status);
        },
        updateSidebarWidth({ commit }, width) {
            commit('setSidebarWidth', width);
        }
    }
});