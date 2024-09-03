<template>
    <div class="switcher">
        <!-- 导航元素 -->
        <button class="switcher-item" v-for="(item, index) in switcher" :key="index" @click="handleSwitcher(item.position)">
            <div :class="{ 'choosed-text': item.position === position }" style="font-size: 16px; color:#fff;"
                :style="{ 'font-weight': item.position === position ? 'bold' : '500', 'color': item.position === position ? '#fff' : '#bbb' }">
                {{ item.display }}
                <!-- 选中效果 -->
                <div class="choosed" style="" v-show="item.position === position">
                </div>
            </div>
            <!-- 数字 -->
            <div class="number" v-if="item.showNum" :style="{ 'color': item.position === position ? '#fff' : '#bbb' }">{{
                item.num }}</div>
        </button>
    </div>
</template>

<script lang="js">
export default {
    name: 'YHeader',
    props: {
        switcher: {
            type: Array,
            default: () => [
                {
                    num: 0,
                    showNum: true,
                    position: 'default',
                    display: '默认',
                },
                {
                    num: 0,
                    showNum: true,
                    position: 'hot',
                    display: '选择1',
                }
            ],
        }
    },
    data() {
        return {
            position: '',
        };
    },
    methods: {
        handleSwitcher(position) {
            this.position = position;
            this.$emit('new-position', position);
        },
    },
    mounted() {
        this.position = this.switcher[0].position;
    },
}

</script>

<style scoped>
.switcher {
    display: flex;
    color: #bbb;
    font-size: 16px;
    align-items: center;
    padding-top: 10px;
    margin-left: 10px;
    padding-bottom: 20px;
    /* position: sticky; */
    top: 0px;
    z-index: 1;
    width: 100%;
    backdrop-filter: blur(10px);
    /* mix-blend-mode: multiply; */
}

.switcher-item {
    display: inline-flex;
    flex-direction: row;
    position: relative;
    height: 20px;
    margin: 0 7px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.choosed-text {
    color: rgb(254, 80, 110);
}

.choosed {
    height: 2px;
    background-color: rgb(254, 60, 90);
    transform: translate(7px, 4px);
    width: calc(100% - 14px);
    height: 4px;
    border-radius: 2px;
}

.number {
    /* position: absolute; */
    color: #fff;
    margin: 0;
    padding: 0px 0px 0px 3px;
    font-size: 13px;
    font-weight: bold;
    left: 0;
    top: 0;
}
</style>