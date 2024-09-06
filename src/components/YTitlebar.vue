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
            <input type="text" class="search-input" @keydown.enter="handleSearch" v-model="searchInput"
                @input="getSearchSuggestions" placeholder="搜索..." @click="this.$refs.search_panel._showPanel()"
                spellcheck="false" ref="search_input" />
            <YPanel ref="search_panel" :trigger="this.$refs.search_panel_trigger" style="position:relative; width:0px"
                :default-show="false" :slide-direction="1">
                <div class="search-panel">
                    <div class="search-suggestions" v-if="searchSuggestions?.length > 0">
                        <div class="search-suggestions-title">猜你想搜</div>
                        <div class="search-suggestion" v-for="suggestion in searchSuggestions" :key="suggestion"
                            :title="suggestion.keyword" @click="search(suggestion.keyword)"
                            v-html="highlightMatching(suggestion.keyword)">
                        </div>
                    </div>
                    <div class="search-suggestions" v-else>
                        <div class="search-suggestions-title">热搜榜
                        </div>
                        <div class="search-suggestion" v-for="(hotSearch) in hotSearches" :key="hotSearch"
                            :title="hotSearch.first" @click="search(hotSearch.first)"
                            v-html="highlightMatching(hotSearch.first)" />
                    </div>
                </div>
            </YPanel>
        </div>
        <div class="buttons">
            <!-- 用户信息 -->
            <button class="avatar" v-if="this.login.status" @click="openUserPage">
                <img class="avatarImg" :src="this.login.avatar" v-if="this.login.avatar" />
                <div class="avatarImg avatarImgPlaceholder" v-else></div>
            </button>
            <button class="userInfo" @click="userInfo" ref="user_info_menu_trigger">
                <div class="userInfoTxt" v-if="this.login.status">
                    {{ userNickName }}
                </div>
                <div class="userInfoTxt" v-if="!this.login.status">
                    未登录
                </div><img class="img-userInfo" src="../assets/more.svg" />
            </button>
            <!-- 扫码登录 -->
            <div v-if="showDropdown" ref="dropDownMenu" class="dropdown-menu">
                <div class="login_text">扫码登录</div>
                <img :src="base64Image" />
            </div>
            <!-- 用户名下拉菜单 -->
            <YPanel class="userInfoPanel" :trigger="this.$refs.user_info_menu_trigger" ref="user_info_panel"
                :default-show="false" :slide-direction="1">
                <div class="user-info-menu">
                    <div class="user-info-item follows">
                        <div class="follows-container follows-container-left">
                            <div class="follows-number">
                                {{ userProfile?.follows ?? 0 }}
                            </div>
                            <div class="follows-text">
                                关注
                            </div>
                        </div>
                        <div class="follows-splitline" />
                        <div class="follows-container follows-container-right">
                            <div class="follows-number">
                                {{ userProfile?.followeds ?? 0 }}
                            </div>
                            <div class="follows-text">
                                粉丝
                            </div>
                        </div>
                    </div>
                    <div class="user-info-item">我的会员</div>
                    <div class="user-info-item">等级{{ userProfile?.level ?? 0 }}</div>
                    <div class="user-info-item" @click="openListenRank">我的听歌排行</div>
                    <div class="user-info-item">个人信息设置</div>
                    <div class="user-info-item" @click="this.openTestPage">测试页面</div>
                    <div class="user-info-item">关于XCMusic</div>
                    <div class="user-info-item" @click="this.login.logout()">退出登录</div>
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
            userProfile: {
                follows: 0,
                followeds: 0,
                level: 0,
            },    // 用于存储用户信息
            showDropdown: false,    // 用于控制下拉登录菜单的显示
            base64Image: '',    // 用于存储 Base64 图片
            userNickName: '用户昵称',   // 用于存储用户昵称
            avatarSrc: '',      // 用于存储头像地址
            searchInput: '',    // 用于存储搜索输入
            searchSuggestions: [],  // 用于存储搜索建议
            hotSearches: [],    // 用于存储热搜榜
            selectedSuggestion: 0,  // 用于存储选中的搜索建议
        };
    },
    computed: {
        ...mapState({
            login: state => state.login,
        })
    },
    methods: {
        ...mapActions(['updateLoginStatus']),
        // 后退和前进
        back() {
            this.$router.go(-1);
            // console.log('back');
        },
        forward() {
            this.$router.go(1);
            // console.log('forward');
        },
        async openUserPage() {
            if (this.login.status) {
                this.$router.push({ path: `/user/${this.login.userId}` });
            }
        },
        // 用户信息
        async userInfo(event) {
            event.stopPropagation(); // 阻止事件冒泡以免立即触发外部点击处理器
            // 如果已登录，则打开用户信息窗口
            if (this.login.cookie && this.login.status) {
                this.$refs.user_info_panel.tooglePanel();
                console.log('open userInfo');
            } else {
                // 如果未登录，则显示二维码登录
                let qrKey = await useApi('/login/qr/key', {
                    timestamp: new Date().getTime()
                }).catch((error) => {
                    console.error('Failed to get QR key:', error);
                });
                this.qrKey = qrKey.data.unikey;
                let qrCode = await useApi('/login/qr/create', {
                    key: this.qrKey,
                    qrimg: true,
                    timestamp: new Date().getTime()
                }).catch((error) => {
                    console.error('Failed to get QR code:', error);
                });
                this.base64Image = qrCode.data.qrimg;
                this.toggleDropdown(); // 切换下拉菜单显示
                this.pollQRCodeStatus(); // 轮询二维码状态
            }
        },
        // 轮询二维码状态
        async pollQRCodeStatus() {
            const interval = setInterval(async () => {
                let checkResponse = await useApi('/login/qr/check', {
                    key: this.qrKey,
                    timestamp: new Date().getTime()
                }).catch((error) => {
                    console.error('Failed to check QR code:', error);
                });
                if (checkResponse.code === 803) {
                    // 关闭扫码窗口
                    this.showDropdown = false;
                    clearInterval(interval);
                    // console.log('登录成功，cookie:', checkResponse.cookie);
                    this.$emit('user-login');
                    await this.init();
                    this.login.cookie = checkResponse.cookie;
                }
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
            this.search(event.target.value);
        },
        search(text) {
            console.log('search:', text);
            this.$router.push({ path: `/search/${text}/default` });
            this.$refs.search_panel.closePanel();
        },
        async getSearchSuggestions(event) {
            const searchText = event.target.value;
            if (!searchText) {
                this.searchSuggestions = [];
                return;
            }
            let result = await useApi('/search/suggest', {
                keywords: searchText,
                type: 'mobile',
            }).catch((error) => {
                console.error('Failed to get search suggestions:', error);
            });
            if (result.code === 200) {
                console.log('get suggestions', result);
                this.searchSuggestions = result.result.allMatch;
            }
        },
        async init() {
            document.addEventListener('click', this.handleOutsideClick);
            if (this.login.cookie) {
                this.userNickName = this.login.userName;
                this.avatarSrc = this.login.avatar;

                if (!this.login.userId) {
                    await this.login.updateInfo();
                }
                let userProfile = await useApi('/user/detail', {
                    uid: this.login.userId,
                    cookie: this.login.cookie,
                }).catch((error) => {
                    console.error('Failed to get user profile:', error);
                });
                this.userProfile = userProfile.profile;
                this.userProfile.level = userProfile.level;
                // console.log('userProfile:', this.userProfile);
            }
        },
        highlightMatching(keyword) {
            if (keyword.startsWith(this.searchInput)) {
                return `<span style="color: rgb(255, 60, 90);">${this.searchInput}</span>${keyword.slice(this.searchInput.length)}`;
            }
            return keyword;
        },
        async getHotSearches() {
            // 获取热搜榜
            let result = await useApi('/search/hot/detail', {}).catch((error) => {
                console.error('Failed to get hot searches:', error);
            });
            console.log('get hot searches', result.result.hots);
            this.hotSearches = result.result.hots;
        },
        openTestPage() {
            this.$router.push({ path: '/test' });
        },
        openListenRank() {
            this.$router.push({ path: `/user_songs_rank/${this.login.userId}` })
        }
    },
    async mounted() {
        // 添加外部点击处理器
        await this.init();
        await this.getHotSearches();
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
    padding: 15px 10px 10px 10px;
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
    z-index: 1;
    margin-left: var(--sidebar-width);
}

.search-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 250px;
    height: 300px;
    max-height: 300px;
    overflow-y: auto;
    transform: translateX(calc(-100% + 15px));
    background-color: rgb(44, 44, 55);
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    top: 30px;
}

.search-panel::-webkit-scrollbar {
    /* 滚动条宽度 */
    width: 6px;
}

.search-panel::-webkit-scrollbar-track {
    /* 滚动条轨道背景 */
    background: transparent;
}

.search-panel::-webkit-scrollbar-thumb {
    /* 滚动条滑块背景 */
    background: transparent;
    /* 滚动条滑块圆角 */
    border-radius: 6px;
}

/* 鼠标悬停时显示滚动条 */
.search-panel:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    /* 滚动条滑块背景 */
}

.search-panel:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
    /* 滚动条滑块悬停背景 */
}

.search-suggestions {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
}

.search-suggestions-title {
    color: #aaa;
    font-size: 16px;
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
}

.search-suggestion {
    width: calc(100% - 20px);
    padding: 6px 10px;
    border-radius: 5px;
    text-align: left;
    color: #eee;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.search-suggestion:hover {
    background-color: rgba(255, 255, 255, .1);
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
    z-index: 1;
}

.dropdown-menu img {
    max-width: 150px;
    /* 根据需要调整大小 */
    max-height: 150px;
    border-radius: 5px;
}

.user-info-menu {
    z-index: 1;
    position: absolute;
    width: 200px;
    height: 300px;
    /* top: 56px; */
    /* right: 130px; */
    transform: translate3d(-180px, 32.1px, 0px);
    background-color: rgb(44, 44, 55);
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    user-select: none;
}

.user-info-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #bbb;
    font-weight: 600;
    font-size: medium;
    padding: 5px;
    margin: 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.follows {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: unset;
}

.follows-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
}

.follows-container-left {
    padding: 0px 8px 5px 0px;
}

.follows-container-right {
    padding: 0px 0px 5px 8px;
}

.follows-number {
    font-size: 30px;
    color: #fff;
    cursor: pointer;
}

.follows-text {
    font-size: 14px;
    font-weight: bolder;
    color: #999;
    cursor: default;
}

.follows-splitline {
    width: 1px;
    height: 45px;
    background-color: #555;
}

.img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
    -webkit-user-drag: none;
}

.img.settings {
    width: 18px;
    height: 18px;
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