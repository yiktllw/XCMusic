<template>
    <div class="titlebar">
        <!-- 后退和前进按钮 -->
        <div class="buttons arrows">
            <button class="back" @click="back" title="后退">
                <img class="img arrow" src="../assets/backarrow.svg" />
            </button>
            <button class="forward" @click="forward" title="前进">
                <img class="img arrow" src="../assets/forwardarrow.svg" />
            </button>
        </div>
        <!-- 搜索栏 -->
        <div class="searchbar" ref="search_panel_trigger">
            <input type="text" class="search-input" @keydown.enter="handleSearch" @input="getSearchSuggestions"
                placeholder="搜索..." @click="this.$refs.search_panel._showPanel()" spellcheck="false" />
            <YPanel ref="search_panel" :trigger="this.$refs.search_panel_trigger" style="position:relative; width:0px">
                <div class="search-panel">

                </div>
            </YPanel>
        </div>
        <div class="buttons">
            <!-- 用户信息 -->
            <button class="avatar" v-if="loginStatus">
                <img class="avatarImg" :src="avatarSrc" v-show="avatarSrc" />
                <div class="avatarImg avatarImgPlaceholder" v-if="!avatarSrc"></div>
            </button>
            <button class="userInfo" @click="userInfo" ref="user_info_menu_trigger">
                <div class="userInfoTxt" v-if="loginStatus">
                    {{ userNickName }}
                </div>
                <div class="userInfoTxt" v-if="!loginStatus">
                    未登录
                </div><img class="img-userInfo" src="../assets/more.svg" />
            </button>
            <!-- 扫码登录 -->
            <div v-if="showDropdown" ref="dropDownMenu" class="dropdown-menu">
                <div class="login_text">扫码登录</div>
                <img :src="base64Image" />
            </div>
            <!-- 用户名下拉菜单 -->
            <YPanel class="userInfoPanel" :trigger="this.$refs.user_info_menu_trigger" ref="user_info_panel">
                <div class="user-info-menu">
                    <div class="user-info-item follows">
                        <div class="followings">{{ userProfile.follows }}关注</div>
                        <div class="followers">{{ userProfile.followeds }}粉丝</div>
                    </div>
                    <div class="user-info-item">我的会员</div>
                    <div class="user-info-item">我的等级{{ userProfile.level }}</div>
                    <div class="user-info-item">个人信息设置</div>
                    <div class="user-info-item">退出登录</div>
                </div>
            </YPanel>
            <!-- 设置、最小化、最大化和关闭按钮 -->
            <button class="settings" @click="settings" title="设置">
                <img class="img settings" src="../assets/settings.svg" alt="Settings" />
            </button>
            <button class="minimize" @click="minimize" title="最小化">
                <img class="img minimize" src="../assets/min.svg" alt="Minimize" />
            </button>
            <button class="maximize" @click="maximize" title="最大化">
                <img class="img maximize" src="../assets/max.svg" alt="Maximize" />
            </button>
            <button class="close" @click="close" title="关闭">
                <img class="img close" src="../assets/close.svg" alt="Close" />
            </button>
        </div>
    </div>
</template>

<script lang="js">
import { useApi } from '@/ncm/api';
import { mapState, mapActions } from 'vuex';
import YPanel from './YPanel.vue';

export default {
    name: 'YTitlebar',
    emits: [
        'navigate-back',
        'navigate-forward',
        'user-login'
    ],
    components: {
        YPanel,
    },
    data() {
        return {
            userProfile: {}, // 用于存储用户信息
            showDropdown: false, // 用于控制下拉登录菜单的显示
            base64Image: '', // 用于存储 Base64 图片
            userNickName: '用户昵称', // 用于存储用户昵称
            avatarSrc: '', // 用于存储头像地址
        };
    },
    computed: {
        ...mapState({
            loginStatus: state => state.loginStatus, // 用于存储登录状态
        })
    },
    methods: {
        ...mapActions(['updateLoginStatus']),
        // 后退和前进
        back() {
            this.$emit('navigate-back');
            // console.log('back');
        },
        forward() {
            this.$emit('navigate-forward');
            // console.log('forward');
        },
        // 用户信息
        async userInfo(event) {
            event.stopPropagation(); // 阻止事件冒泡以免立即触发外部点击处理器
            // 如果已登录，则打开用户信息窗口
            if (localStorage.getItem('login_cookie') && this.loginStatus) {
                this.$refs.user_info_panel.tooglePanel();
                console.log('open userInfo');
            } else {
                // 如果未登录，则显示二维码登录
                // console.log('未登录');
                // console.log('loginStatus_:', loginStatus_.data.account);
                // window.electron.ipcRenderer.send('open-login-window');
                let qrKey = await useApi('/login/qr/key', { timestamp: new Date().getTime() });
                this.qrKey = qrKey.data.unikey;
                let qrCode = await useApi('/login/qr/create', { key: this.qrKey, qrimg: true, timestamp: new Date().getTime() });
                this.base64Image = qrCode.data.qrimg;
                this.updateLoginStatus("titlebar userInfo set login_status to false", false);
                this.toggleDropdown(); // 切换下拉菜单显示
                this.pollQRCodeStatus(); // 轮询二维码状态
            }
        },
        // 轮询二维码状态
        async pollQRCodeStatus() {
            const interval = setInterval(async () => {
                let checkResponse = await useApi('/login/qr/check', { key: this.qrKey, timestamp: new Date().getTime() });
                if (checkResponse.code === 803) {
                    // 关闭扫码窗口
                    this.showDropdown = false;
                    clearInterval(interval);
                    // console.log('登录成功，cookie:', checkResponse.cookie);
                    this.$emit('user-login');
                    await this.init();
                    localStorage.setItem('login_cookie', checkResponse.cookie);
                    this.updateLoginStatus("titlebar pollQRCodeStatus set login_status to true", true);
                }
                // console.log('checkResponse:', checkResponse.message);
                // console.log('qrKey:', this.qrKey);
            }, 2000); // 每2秒轮询一次
            setInterval(() => {
                if (this.showDropdown === false) {
                    clearInterval(interval);
                }
            }, 2000); // 停止轮询
        },

        // 处理登录窗口的外部点击
        handleOutsideClick(event) {
            const dropdownMenu = this.$refs.dropdownMenu;
            if (dropdownMenu && !dropdownMenu.contains(event.target)) {
                this.showDropdown = false; // 隐藏下拉菜单
            }
        },
        // 切换下拉菜单显示
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        // 设置、最小化、最大化和关闭
        settings() {
            window.electron.ipcRenderer.send('open-settings');
            // console.log('settings');
        },
        minimize() {
            window.electron.ipcRenderer.send('minimize');
            // console.log('minimize');
        },
        maximize() {
            window.electron.ipcRenderer.send('maximize');
            // console.log('maximize');
        },
        close() {
            window.electron.ipcRenderer.send('close');
            // console.log('close');
        },
        // 搜索
        handleSearch(event) {
            const searchText = event.target.value;
            console.log('search:', searchText);
        },
        async getSearchSuggestions(event) {
            const searchText = event.target.value;
            let result = await useApi('/search/suggest', {
                keywords: searchText,
                type: 'mobile',
            });
            if (result.code === 200) {
                console.log('get suggestions', result);
            }
        },
        async init() {
            document.addEventListener('click', this.handleOutsideClick);
            if (localStorage.getItem('login_cookie')) {
                this.updateLoginStatus("titlebar mounted set login_status to ture", true);
                let statusCheck = await useApi('/login/status', { timestamp: new Date().getTime(), cookie: localStorage.getItem('login_cookie') });
                this.userNickName = statusCheck.data.profile.nickname;
                this.avatarSrc = statusCheck.data.profile.avatarUrl;
                let uid = statusCheck.data.profile.userId;
                localStorage.setItem('login_uid', uid);
                // console.log(this.avatarSrc);

                let userProfile = await useApi('/user/detail', { uid: uid, cookie: localStorage.getItem('login_cookie') });
                this.userProfile = userProfile.profile;
                this.userProfile.level = userProfile.level;
                // console.log('userProfile:', this.userProfile);
            }
        },
    },
    async mounted() {
        // 添加外部点击处理器
        await this.init();
    },
    beforeUnmount() {
        // 移除外部点击处理器
        document.removeEventListener('click', this.handleOutsideClick);
    },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.titlebar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 15px 10px 10px;
    background-color: transparent;
    color: #fff;
    -webkit-app-region: drag;
    -webkit-user-drag: none;
}

.img.arrow {
    top: 0;
    margin: 0px;
    padding-top: 8px;
    padding-bottom: 7px;
    padding-left: 1px;
    padding-right: 1px;
    border-radius: 7px;
    border-style: solid;
    border-width: 1px;
    border-color: rgba(255, 255, 255, 0.1);
    margin-top: 0px;
    background-color: transparent;
}

.buttons.arrows button {
    margin: 0px;
    margin-top: 4px;
}

.searchbar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    margin-right: 10px;
    margin-left: var(--sidebar-width);
}

.search-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 300px;
    height: calc(100vh - 300px);
    transform: translateX(calc(-100% + 35px));
    background-color: #333;
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    top: 30px;
}

.search-input {
    background-image: url('../assets/search.svg');
    filter: opacity(0.5);
    /* 将背景图像和内容的透明度都设为 50% */
    background-repeat: no-repeat;
    background-position: left 10px center;
    /* 图片位置 */
    background-size: 17px 17px;
    /* 图片大小 */
    padding: 8px 15px 8px 35px;
    /* 为了确保文字不会覆盖图片 */
    font-size: medium;
    color: #fff;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    border-radius: 7px;
    border-style: solid;
    border-width: 1.5px;
    border-color: rgba(255, 255, 255, 0.1);
    margin-top: 0px;
    margin-left: 7px;
    background-color: transparent;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
}

.search-input::placeholder {
    user-select: none;
    color: rgba(255, 255, 255, 1);
}

.search-input:focus {
    outline: none;
    /* border-color: #fff; */
}

.buttons {
    display: flex;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
    gap: 0px;
    align-items: center;
}

.buttons button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    position: relative;
    user-select: none;
}

button .tooltip {
    visibility: hidden;
    transform: opacity 0.3s;
    padding: 5px;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    border-radius: 5px;
    z-index: 1;
    opacity: 0;
}

button:hover .tooltip {
    visibility: visible;
    opacity: 1;
}

.avatar {
    margin: 0;
    padding: 0;
}

.avatarImg {
    width: 30px;
    height: 30px;
    border-radius: 100%;
    -webkit-user-drag: none;
}

.avatarImgPlaceholder {
    background-color: #333;
}

.userInfo {
    display: flex;
    align-items: center;
    flex-direction: row;
    color: #bbb;
    transition: all 0.3s ease;
    margin: 0;
}

.userInfoTxt {
    color: #bbb;
    font-size: 15px;
    margin-right: 6px;
    transition: all 0.3s ease;
}

.userInfoTxt:hover {
    color: #eee;
}

.img-userInfo {
    width: 14px;
    height: 14px;
    opacity: 0.7;
    margin-right: 10px;
    -webkit-user-drag: none;
}

.userInfo:hover .img-userInfo {
    transition: all 0.3s ease;
    opacity: 1;
}

.dropdown-menu {
    position: fixed;
    /* 固定在窗口上 */
    top: 50%;
    /* 垂直居中 */
    left: 50%;
    /* 水平居中 */
    transform: translate(-50%, -50%);
    /* 通过平移来使其完全居中 */
    background-color: #333;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.dropdown-menu img {
    max-width: 150px;
    /* 根据需要调整大小 */
    max-height: 150px;
    border-radius: 5px;
}

.user-info-menu {
    position: absolute;
    top: 56px;
    right: 175px;
    background-color: #333;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.user-info-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #fff;
    padding: 5px;
    margin: 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.user-info-item:not(:last-child) {
    border-bottom: 1px solid #555;
}

.img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
    -webkit-user-drag: none;
}

.img.settings {
    width: 16px;
    height: 16px;
    margin-right: 10px;
}

.img.minimize {
    margin-right: 10px;
}

.img.maximize {
    margin-right: 10px;
}

.img.close {
    margin-right: 10px;
}

.img:hover {
    opacity: 1;
}
</style>