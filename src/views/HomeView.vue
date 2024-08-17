<template>
    <div class="mainContainer">
        <div class="leftSidebar">
            <YSidebar @button-click="handleButtonClick" @sidebar-resize="handleSidebarResize"
                @update-display="updateDisplayUrl" :displayUrl="displayUrl" ref="YSidebar_ref" />
        </div>
        <div class="mainContent">
            <YTitlebar @navigate-back="triggerNavigateBack" @navigate-forward="triggerNavigateForward"
                @user-login="userLogin" />
            <div class="content">
                <!-- Your main content goes here -->
                <YDisplayArea class="display-area" :displayUrl="displayUrl" ref="YDisplayArea" />
            </div>
        </div>
    </div>
</template>

<script lang="js">
import YDisplayArea from '@/components/YDisplayArea.vue';
import YSidebar from '../components/YSidebar.vue';
import YTitlebar from '../components/YTitlebar.vue';
import { mapActions } from 'vuex';

export default {
    name: 'App',
    data() {
        return {
            // Add your data here
            displayUrl: '',
        };
    },
    components: {
        YSidebar,
        YTitlebar,
        YDisplayArea,
    },
    methods: {
        ...mapActions(['updateSidebarWidth']),
        triggerNavigateBack() {
            this.$refs.YDisplayArea.navigateBack();
            // console.log('triggerNavigateBack');
        },
        triggerNavigateForward() {
            this.$refs.YDisplayArea.navigateForward();
            // console.log('triggerNavigateForward');
        },
        handleButtonClick(buttonId) {
            // Handle button click event
            console.log(`Button with ID ${buttonId} clicked`);
        },
        handleSidebarResize(newWidth) {
            const mainContent = document.querySelector('.mainContent');
            if (parseInt(newWidth, 10) < 260 && parseInt(newWidth, 10) > 170) {
                mainContent.style.marginLeft = newWidth;
                mainContent.style.maxWidth = `calc(100% - ${newWidth}px)`;
                this.updateSidebarWidth('resized', newWidth);
                this.display_width = window.innerWidth - parseInt(newWidth, 10);
            }
        },
        updateDisplayUrl(url) {
            this.displayUrl = url;
        },
        userLogin() {
            // Handle user login event
            console.log('User logged in');
            this.$refs.YSidebar_ref.fetchUserPlaylist();
        },
    },
    mounted() {
        // Add your mounted hook here
        this.displayUrl = 'http://localhost:4321/greeting';

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
    margin-bottom: 40px;
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
}

.content {
    /* 确保内容区域占据剩余空间 */
    height: calc(100vh - 120px);
    margin-bottom: 40px;
    background-color: transparent;
    /* 设置内容区域的背景颜色 */
}

.display-area {
    background-color: transparent;
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
