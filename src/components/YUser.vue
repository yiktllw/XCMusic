<template>
        <div v-if="isLoggedIn">
            <img :src="userAvatar" alt="User Avatar" class="user-avatar">
        </div>
        <div v-else>
            <button @click="login">登录</button>
        </div>
</template>

<script>
export default {
    data() {
        return {
            isLoggedIn: false,
            userAvatar: require('@/assets/logo.png' )// 替换为实际的头像路径
        };
    },
    methods: {
        login() {
            this.isLoggedIn = true;
        },
        logout() {
            this.isLoggedIn = false;
        }
    }
};
</script>

<style lang="scss" scoped>

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}
</style>