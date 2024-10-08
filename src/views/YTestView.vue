<template>
    <div class="display">
        <button @click="$refs.playUI.tooglePanel">
            切换
        </button>
        <YMultiSelect ref="playUI" :tracks="tracks" />
    </div>
</template>

<script lang="js">
import YMultiSelect from '@/components/YMultiSelect.vue';
import { mapState } from 'vuex';
import { setBackgroundColor } from '@/ncm/color';

export default {
    name: 'YTestView',
    components: {
        YMultiSelect,
    },
    computed: {
        ...mapState({
            player: state => state.player,
            setting: state => state.setting,
        }),
    },
    data() {
        return {
            tracks: [],
        };
    },
    methods: {
        hexToRgb(hex) {
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
        this.tracks = this.player.playlist
        this.player.Subscribe({
            id: 'YTestView',
            func: () => {
                this.tracks = this.player.playlist;
            },
            type: 'playlist',
        })
        window.setBkColor = (color) => {
            setBackgroundColor(color);
        }
        window.setBkColorHEX = (color) => {
            setBackgroundColor(this.hexToRgb(color));
        }
    },
    beforeUnmount() {
        this.player.UnSubscribe({
            id: 'YTestView',
            type: 'playlist',
        });
    },
}

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