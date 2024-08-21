<template>
    <div class="sidebar y_sidebar_component">
        <div class="title">
            <img src="@/assets/logo.svg" alt="Logo"
                style="height: 28px; margin-right: 10px; margin-left: 15px;margin-top:10px;" />
        </div>
        <div class="scrollable">
            <button class="switch-user-playlist" @click="showMyPlaylist = !showMyPlaylist">
                <span>创建的歌单({{ buttons.length }})</span>
                <img class="switch-user-playlist-icon" v-if="showMyPlaylist" src="@/assets/less.svg" />
                <img class=" switch-user-playlist-icon" v-if="!showMyPlaylist" src="@/assets/more.svg"
                    style=" padding-top: 3px; " />
            </button>
            <transition name="fade">
                <div class="fade-container" v-show="showMyPlaylist">
                    <button class="playlist-button" v-for="button in buttons" :key="button.id"
                        @click="handleButtonClick(button.id)" :title="button.label"
                        :class="{ 'activeButton': activeButtonId === button.id }" :disabled="activeButtonId === button.id">
                        <img :src="button.img" class="button-icon" />
                        <div class="playlist-button-text" >{{ button.label }}</div>
                    </button>
                </div>
            </transition>
            <button class="switch-user-playlist" @click="showMySubscribedPlaylist = !showMySubscribedPlaylist">
                <span>收藏的歌单({{ subscribedButtons.length }})</span>
                <img class="switch-user-playlist-icon" v-if="showMySubscribedPlaylist" src="@/assets/less.svg" />
                <img class=" switch-user-playlist-icon" v-if="!showMySubscribedPlaylist" src="@/assets/more.svg"
                    style=" padding-top: 3px; " />
            </button>
            <transition name="fade">
                <div class="fade-container" v-show="showMySubscribedPlaylist">
                    <button class="playlist-button" v-for="button in subscribedButtons" :key="button.id"
                        @click="handleButtonClick(button.id)" :title="button.label" v-show="showMySubscribedPlaylist"
                        :class="{ 'activeButton': activeButtonId === button.id }" :disabled="activeButtonId === button.id">
                        <img :src="button.img" class="button-icon" />
                        <div class="playlist-button-text">{{ button.label }}</div>
                    </button>
                </div>
            </transition>
        </div>
    </div>
    <div class="resizer" @mousedown="initResize"></div>
</template>

<script lang="js">
import { useApi } from '@/ncm/api';
import { mapState } from 'vuex';

export default {
    name: 'YSidebar',
    computed: {
        ...mapState({
            loginStatus: state => state.loginStatus
        })
    },
    emits: [
        'update-display',
        'sidebar-resize'
    ],
    data() {
        return {
            buttons: [],
            subscribedButtons: [],
            buttonTextColor: '#ccc', // 统一设置按钮的文字颜色
            activeButtonId: null,
            showMyPlaylist: true,
            showMySubscribedPlaylist: true,
        };
    },
    props: {
        opened_playlist: {
            type: String,
            required: true,
        },
    },
    methods: {
        handleButtonClick(buttonId) {
            const url = `http://localhost:4321/playlist/${buttonId}`;
            this.$emit('update-display', url);
            console.log(`Button with ID ${buttonId} clicked`);
        },
        initResize() {
            window.addEventListener('mousemove', this.resize);
            window.addEventListener('mouseup', this.stopResize);
        },
        resize(e) {
            const sidebar = document.querySelector('.sidebar.y_sidebar_component');
            const newWidth = e.clientX + 'px';
            sidebar.style.width = newWidth;
            // Emit the new width to the parent component
            this.$emit('sidebar-resize', newWidth);
        },
        stopResize() {
            window.removeEventListener('mousemove', this.resize);
            window.removeEventListener('mouseup', this.stopResize);
        },
        async fetchUserPlaylist() {
            if (localStorage.getItem('login_cookie')) {
                let userAccount = await useApi('/user/account', {
                    cookie: localStorage.getItem('login_cookie'),
                    timestamp: new Date().getTime()
                })
                let userPlaylist = await useApi('/user/playlist', {
                    uid: userAccount.profile.userId,
                    cookie: localStorage.getItem('login_cookie'),
                })
                this.buttons = [];
                this.subscribedButtons = [];
                userPlaylist.playlist.forEach(playlist => {
                    if (!playlist.subscribed) {
                        this.buttons.push({
                            label: playlist.name,
                            id: playlist.id,
                            img: playlist.coverImgUrl
                        });
                    } else {
                        this.subscribedButtons.push({
                            label: playlist.name,
                            id: playlist.id,
                            img: playlist.coverImgUrl
                        });
                    }
                });
                this.buttons[0].label = '我喜欢的音乐';
            }
        },
        handleMessage(event) {
            if (event.origin !== 'http://localhost:4321') {
                return;
            }
            if (event.data.type === 'new-playlist-id') {
                this.activeButtonId = event.data.playlistId;
            }
        },
    },
    async mounted() {
        // 获取侧边栏初始宽度并发送给父组件
        const sidebar = document.querySelector('.sidebar.y_sidebar_component');
        const initialWidth = sidebar.style.width || `${sidebar.offsetWidth}px`;

        // Emit the initial width to the parent component
        this.$emit('sidebar-resize', initialWidth);
        this.fetchUserPlaylist();
        window.addEventListener('message', this.handleMessage);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.handleMessage);
    },
    watch: {
        async loginStatus(newVal) {
            if (newVal === true) {
                this.fetchUserPlaylist();
            }
        }
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
    transform-origin: top;
    /* overflow: hidden; */
}

.fade-enter {
    opacity: 0;
    transform: translateY(-100%);
    /* 初始状态：向上滚动 */
    clip-path: inset(100% 0 0 0);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-100px);
    /* 初始状态：向上滚动 */
    clip-path: inset(100px 0 0 0);
}

.fade-enter-to {
    opacity: 1;
    transform: translateY(0);
    /* 最终状态：位置恢复 */
    clip-path: insert(0 0 0 0);
}

.fade-leave {
    opacity: 1;
    transform: translateY(0);
    /* 最终状态：位置恢复 */
    clip-path: insert(0 0 0 0);
}

.title {
    font-size: 18px;
    color: #fff;
    user-select: none;
    padding: 10px;
    text-align: left;
    /* Optional: Add background color */
    margin-bottom: 10px;
    /* Optional: Add margin */
    -webkit-app-region: drag;
}

.sidebar {
    display: flex;
    /* Optional: Add border radius */
    width: 180px;
    min-width: 180px;
    max-width: 260px;
    /* Adjust the width as needed */
    /* Add vertical scroll bar */
    padding: 0px;
    /* Optional: Add padding */
    height: 100%;
    flex-direction: column;
}

.switch-user-playlist {
    color: #bbb;
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    padding-left: 5px;
    padding-top: 6px;
    padding-bottom: 6px;
    transition: all 0.3s ease;
    -webkit-app-region: no-drag;
    user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    overflow: hidden;
    min-height: 40px;
}

.switch-user-playlist:hover {
    color: #fff;
}

.switch-user-playlist-icon {
    width: 16px;
    height: 16px;
    transition: all 0.3s ease;
    opacity: 0.6;
    padding-left: 5px;
}

.switch-user-playlist:hover .switch-user-playlist-icon {
    opacity: 1;
}

.fade-container {
    display: inherit;
    flex-direction: inherit;
}

.playlist-button {
    color: #eee;
    font-size: 12px;
    display: flex;
    text-align: left;
    align-items: center;
    background-color: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    padding: 6px 7px 6px 5px;
    margin: 3px 0px 3px 0px;
    transition: all 0.3s ease;
    -webkit-app-region: no-drag;
    user-select: none;
    white-space: normal;
    /* overflow: hidden; */
    height: 40px;
    width: 100%;
    /* -webkit-box-orient: vertical; */
    /* -webkit-line-clamp: 2; */
    /* text-overflow: ellipsis; */
}

.activeButton {
    background-color: rgb(254, 60, 90);
}

.playlist-button:hover:not(.activeButton) {
    background-color: rgba(255, 255, 255, 0.1);
}

.playlist-button-text {
    color: inherit;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.button-icon {
    margin-right: 8px;
    width: 30px;
    height: 30px;
    border-radius: 5px;
}

.scrollable {
    display: flex;
    padding-left: 15pt;
    padding-right: 15pt;
    flex-direction: column;
    overflow-y: auto;
    max-height: 100%;
}

/* 默认情况下滚动条透明 */
.scrollable::-webkit-scrollbar {
    width: 6px;
    /* 滚动条宽度 */
}

.scrollable::-webkit-scrollbar-track {
    background: transparent;
    /* 滚动条轨道背景 */
}

.scrollable::-webkit-scrollbar-thumb {
    background: transparent;
    /* 滚动条滑块背景 */
    border-radius: 6px;
    /* 滚动条滑块圆角 */
}

/* 鼠标悬停时显示滚动条 */
.scrollable:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    /* 滚动条滑块背景 */
}

.scrollable:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
    /* 滚动条滑块悬停背景 */
}

.scrollable>* {
    margin-bottom: 5px;
    /* Optional: Add space between buttons */
}

.resizer {
    width: 5px;
    cursor: ew-resize;
    background-color: transparent;
}</style>