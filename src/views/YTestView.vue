<template>
    <div class="display">
        <button >
            切换
        </button>
        <TSTest />
        <p>
            {{ $t('settings') }}
        </p>
        <YMultiSelect ref="playUI" :tracks="tracks" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import YMultiSelect from '../components/YMultiSelect.vue';
import { useStore } from 'vuex';
import TSTest from '../components/TSTest.vue';
import { ipcRenderer } from 'electron';

export default defineComponent({
    name: 'YTestView',
    components: {
        YMultiSelect,
        TSTest,
    },
    setup(){
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
            tracks: [] as any[],
        };
    },
    methods: {
        hexToRgb(hex: string) {
            // 去掉前导的 '#' 符号（如果存在）
            hex = hex.replace(/^#/, '');

            // 处理简写形式的 HEX（如 "f03" => "ff0033"）
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }

            // 转换为 RGB 值
            const num = parseInt(hex, 16);

            return {
                r: (num >> 16) & 255, // 获取红色值
                g: (num >> 8) & 255,  // 获取绿色值
                b: num & 255          // 获取蓝色值
            };
        }
    },
    mounted() {
        window.setting = this.setting;
        window.test = (url: string) => {
            window.electron.ipcRenderer.send('download-song', url, this.player.currentTrack, 'C:/Users/yiktllw/Downloads');
        }
        console.log('download', this.download);
    },
    beforeUnmount() {
        this.player.UnSubscribe({
            id: 'YTestView',
            type: 'playlist',
        });
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