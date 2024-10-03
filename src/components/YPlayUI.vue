<template>
    <transition name="playui-slide">
        <div class="container" v-if="show">
            <div class="title-bar">
                <YTitlebar :type="'play-ui'" @close-panel="show = false" />
            </div>
            <div class="main-content">
                <div class="content-left">

                </div>
                <div class="content-right">

                </div>
            </div>
            <div class="play-bar">
                <YPlaybar :type="'play-ui'" @close-panel="show = false" />
            </div>
        </div>
    </transition>
</template>

<script lang="js">
import YPlaybar from './YPlaybar.vue';
import YTitlebar from './YTitlebar.vue';

export default {
    name: 'YPlayUI',
    components: {
        YTitlebar,
        YPlaybar,
    },
    data() {
        return {
            show: false,
        };
    },
    computed: {
    },
    methods: {
        showPanel() {
            this.show = true;
        },
        closePanel() {
            this.show = false;
        },
        tooglePanel() {
            this.show = !this.show;
        },
    },
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 600px;

    .title-bar {
        width: 100%;
        height: 50px;
    }

    .main-content {
        display: flex;
        flex-direction: row;
        width: 100%;

        .content-left {
            height: 100%;
        }

        .content-right {
            height: 100%;
        }
    }

    .play-bar {
        width: 100%;
        height: 85px;
    }
}
</style>