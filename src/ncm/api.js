import axios from 'axios';

export async function useApi(relativePath, params) {
    let apiHost = "http://localhost:10754";
    if (!window.electron?.isElectron) {
        if (process.env.NCM_API_URL) {
            apiHost = process.env.NCM_API_URL ?? 'http://localhost:10754';
        } else {
            console.error('请设置环境变量 NCM_API_URL');
        }
    }
    try {
        const response = await axios.get(apiHost + relativePath, {
            params: params
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
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
