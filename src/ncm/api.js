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