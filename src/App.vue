<template>
    <router-view />
</template>

<script lang="js">
import { mapState } from 'vuex';

export default {
    name: 'App',
    computed: {
        ...mapState({
            setting: state => state.setting,
        }),
    },
    mounted() {
        this.$router.push({ path: '/greeting' });
        // 初始化缩放
        if (window.electron.isElectron) {
            window.electron.ipcRenderer.send('zoom', parseFloat(this.setting.display.zoom));
        }
        // 初始化主题
        document.body.className = `theme-${this.setting.display.theme}`;
        // 初始化语言
        this.$i18n.locale = this.setting.display.language;
    }
}

</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
}
</style>
