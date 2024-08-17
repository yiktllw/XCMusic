<template>
    <div class="sidebar y_sidebar_component">
        <div class="title">
            <img src="@/assets/logo.svg" alt="Logo"
                style="height: 28px; margin-right: 10px; margin-left: 15px;margin-top:10px;" />
        </div>
        <div class="scrollable">
            <button class="button" v-for="button in buttons" :key="button.id" @click="handleButtonClick(button.id)"
                :title="button.label">
                <img :src="button.img" alt="button icon" class="button-icon" />
                <span :style="{ color: buttonTextColor }">{{ button.label }}</span>
            </button>
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
    data() {
        return {
            buttons: [
                { label: 'Home', id: 0, img: '' }, // 主页按钮
                // 其他按钮
            ],
            buttonTextColor: '#bbb', // 统一设置按钮的文字颜色
            activeButtonId: null,
        };
    },
    props: {
        displayUrl: {
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
                })
                this.buttons = [];
                userPlaylist.playlist.forEach(playlist => {
                    this.buttons.push({
                        label: playlist.name,
                        id: playlist.id,
                        img: playlist.coverImgUrl
                    });
                });
                this.buttons[0].label = '我喜欢的音乐';
            }
        }
    },
    async mounted() {
        // 获取侧边栏初始宽度并发送给父组件
        const sidebar = document.querySelector('.sidebar.y_sidebar_component');
        const initialWidth = sidebar.style.width || `${sidebar.offsetWidth}px`;

        // Emit the initial width to the parent component
        this.$emit('sidebar-resize', initialWidth);
        this.fetchUserPlaylist();
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

.button {
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    border: 2px solid transparent;
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

.button:hover {
    background-color: rgba(255, 255, 255, 0.1);
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
}
</style>