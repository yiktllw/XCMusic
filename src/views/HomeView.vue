<template>
    <div class="mainContainer">
        <div class="leftSidebar">
            <YSidebar @sidebar-resize="handleSidebarResize" :opened_playlist="opened_playlist" ref="YSidebar_ref" />
        </div>
        <div class="mainContent">
            <YTitlebar />
            <div class="content">
                <!-- Your main content goes here -->
                <YDisplayArea class="display-area" ref="YDisplayArea" />
            </div>
        </div>
        <div class="playbar">
            <YPlaybar />
        </div>
    </div>
</template>

<script lang="js">
import YDisplayArea from '@/components/YDisplayArea.vue';
import YSidebar from '../components/YSidebar.vue';
import YTitlebar from '../components/YTitlebar.vue';
import { mapActions } from 'vuex';
import YPlaybar from '../components/YPlaybar.vue';

export default {
    name: 'App',
    data() {
        return {
            // Add your data here
            displayUrl: '',
            newDisplayUrl: '',
            opened_playlist: 0,
        };
    },
    components: {
        YSidebar,
        YTitlebar,
        YDisplayArea,
        YPlaybar,
    },
    methods: {
        ...mapActions(['updateSidebarWidth']),
        handleSidebarResize(newWidth) {
            const mainContent = document.querySelector('.mainContent');
            mainContent.style.marginLeft = `calc(${newWidth} + 20px)`;
            mainContent.style.maxWidth = `calc(100% - ${newWidth}px)`;
            // this.updateSidebarWidth(newWidth);
            // this.display_width = window.innerWidth - parseInt(newWidth, 10);
        },
    },
    mounted() {
        // Add your mounted hook here
        // this.displayUrl = '/greeting';

        const sidebar = this.$refs.YSidebar_ref;
        const sidebarWidth = sidebar.offsetWidth;
        this.display_width = `${window.innerWidth - sidebarWidth}px`;

        const titlebarHeight = 50;
        this.display_height = window.innerHeight - titlebarHeight;
    },
};
</script>

<style scoped>
.mainContainer {
    display: flex;
    position: absolute;
    margin: 0px;
    padding: 0%;
    /* background: linear-gradient(to bottom, #6a553f, #131319); */
    background-color: #131319;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.leftSidebar {
    display: flex;
    background-color: rgba(255, 255, 255, 0.03);
    margin-bottom: 80px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
}

.mainContent {
    flex: 1;
    flex-direction: column;
    /* margin-left: 170px; */
    /* position: absolute; */
    top: 0;
    left: 0;
    right: 0;
    width: 0px;
    margin-right:5px;
}

.content {
    /* 确保内容区域占据剩余空间 */
    height: calc(100vh - 140px);
    background-color: transparent;
    /* 设置内容区域的背景颜色 */
}

.display-area {
    background-color: transparent;
}

.playbar {
    background-color: rgb(45, 45, 55);
    position: fixed;
    bottom: 0;
    height: 80px;
    width: 100vw;
    padding: 0;
    margin: 0;
}

#app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-size: 2rem;
    color: #000000;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
