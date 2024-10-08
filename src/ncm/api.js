import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API || 'http://localhost:10754', // 设置基本请求地址
    timeout: 10000, // 设置请求超时时间
});

// 添加请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        if (window.electron?.isElectron) {
            // 在 Electron 中直接使用 localhost 地址
            config.baseURL = 'http://localhost:10754';
        } else {
            // 在非 Electron 环境中，使用 /api 作为前缀
            if (process.env.VUE_APP_API) {
                config.baseURL = process.env.VUE_APP_API; // 使用环境变量中的 API 地址
            } else {
                console.error('请设置环境变量 VUE_APP_API');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 自定义 API 请求函数
/**
 * 使用网易云音乐的API
 * @param {string} relativePath api的相对路径
 * @param {Object} params 剩余参数对象
 * @returns {Promise<any>} 返回一个Promise对象
 */
export async function useApi(relativePath, params) {
    try {
        const response = await apiClient.get(relativePath, { params });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

/**
 * 设置喜欢/不喜欢
 * @param {number} id 歌曲id
 * @param {*} like 是否喜欢
 * @param {*} cookie 登录cookie
 * @returns 
 */
export async function setLike(id, like, cookie) {
    let result = await useApi('/like', {
        id: id,
        like: like,
        cookie: cookie
    }).catch(error => {
        console.error(error);
    });
    return result;
}

/**
 * 切换喜欢状态
 * @param {number} id 歌曲id
 * @param {*} status 当前状态
 */
export async function toogleLike(id, status) {
    if (status) {
        await setLike(id, false, localStorage.getItem('login_cookie'));
    } else {
        await setLike(id, true, localStorage.getItem('login_cookie'));
    }
}
