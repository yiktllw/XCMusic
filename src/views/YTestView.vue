<template>
    <div class="display">
        <div @click="$router.push({path: '/audio/test'})">
            点击跳转到音频调试界面
        </div>
        <YCloseWindow></YCloseWindow>
    </div>
</template>

<script lang="ts">
import YCloseWindow from '@/components/YCloseWindow.vue';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
// import { Theme } from '@/utils/theme';

export default defineComponent({
    name: 'YTestView',
    components: {
        YCloseWindow,
    },
    setup() {
        const store = useStore();

        return {
            player: store.state.player,
            setting: store.state.setting,
            download: store.state.download,
        }
    },
    computed: {
    },
    data() {
        return {
        };
    },
    methods: {
    },
    async mounted() {
        // const theme: Theme.IThemeCSS = {
        //     autoBackgroundType: 'other',
        //     background: '#f0f0f0',
        //     foreground: '#0f0f0f',
        //     name: 'test',
        //     type: 'light',
        //     fontColors: {
        //         fontColorAll: '#000000',
        //     },
        //     panelBackground: '#f0f0f0',
        // }
        // const result = Theme.createTheme(theme);
        // const _theme = result.theme;
        // const classContent = result.classContent;
        // const userCustomThemes = this.setting.display.userCustomThemes.slice();
        // this.setting.display.userCustomThemes = [
        //     ...userCustomThemes,
        //     {
        //         data: _theme,
        //         classContent: classContent,
        //     }
        // ]
    },
    beforeUnmount() {
    },
})

</script>

<style lang="scss" scoped>
.display {
    display: flex;
    justify-content: center;
    align-items: center;
}

.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
}
</style>