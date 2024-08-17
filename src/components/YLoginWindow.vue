<template>
    <div>
        <img :src="base64Image" alt="Login Image">
    </div>
</template>

<script>
import { useApi } from '@/ncm/api';
export default {
    data() {
        return {
            base64Image: '',
        };
    },
    async beforeRouteEnter(to, from, next) {
        // 在路由进入之前，执行 API 请求
        const qrKey = await useApi('/login/qr/key');
        const qrCode = await useApi('/login/qr/create', { key: qrKey.data.unikey, qrimg: true });

        // 使用 next 函数更新组件的数据
        next(vm => {
            vm.base64Image = qrCode.data.qrimg;
        });
    },
};
</script>

<style scoped>
/* 添加一些样式使窗口看起来更好 */
div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
}

img {
    max-width: 100%;
    max-height: 100%;
}
</style>