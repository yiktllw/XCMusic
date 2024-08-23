import axios from 'axios';

export async function useApi(relativePath, params) {
    const localHost = "http://localhost:10754"; // 确保包含协议
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
    })
    return result;
}

export async function toogleLikeAndGetLikelist(id,status) {
    if (status) {
        await setLike(id, false, localStorage.getItem('login_cookie'));
    } else {
        await setLike(id, true, localStorage.getItem('login_cookie'));
    }
    let result = await useApi('/likelist', {
        uid: localStorage.getItem('login_uid'),
        cookie: localStorage.getItem('login_cookie'),
        timestamp: new Date().getTime()
    });
    return result.ids;
}
