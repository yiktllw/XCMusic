import axios from 'axios';

export async function useApi(relativePath, params) {
    let localHost = "http://localhost:10754"; // 确保包含协议
    if (!window.electron?.isElectron){
        localHost = "/api";
    }
    try {
        const response = await axios.get(localHost + relativePath, {
            params: params // 正确传递查询参数
        });
        return response.data; // 返回响应数据
    } catch (error) {
        console.error(error);
        throw error; // 如果需要，可以抛出错误
    }
}

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

export async function toogleLike(id, status) {
    if (status) {
        await setLike(id, false, localStorage.getItem('login_cookie'));
    } else {
        await setLike(id, true, localStorage.getItem('login_cookie'));
    }
}
