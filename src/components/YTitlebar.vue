<template>
    <div class="titlebar font-color-main">
        <!-- 后退和前进按钮 -->
        <div class="buttons arrows">
            <button class="back" @click="back" :title="$t('titlebar.back')" v-if="type === 'default'">
                <img class="img arrow g-icon" src="../assets/backarrow.svg" />
            </button>
            <button class="forward" @click="forward" :title="$t('titlebar.forward')" v-if="type === 'default'">
                <img class="img arrow g-icon" src="../assets/forwardarrow.svg" />
            </button>
            <div v-else-if="type === 'play-ui'" class="close-button" @click="$emit('close-panel')">
                <img class="img-close-panel g-icon" src="../assets/more.svg" />
            </div>
        </div>
        <!-- 搜索栏 -->
        <div class="searchbar" ref="search_panel_trigger" v-if="type === 'default'">
            <div class="input-wrapper">
                <input type="text" class="search-input font-color-main" @keydown.enter="handleSearch"
                    v-model="searchInput" @input="getSearchSuggestions" :placeholder="$t('titlebar.search') + '...'"
                    @click="this.$refs.search_panel._showPanel()" spellcheck="false" ref="search_input" />
                <img class="img-search g-icon" src="../assets/search.svg" />
                <img v-if="searchInput !== ''" class="img-clear g-icon" src="../assets/clear2.svg"
                    @click="searchInput = ''" />
            </div>
            <YPanel ref="search_panel" :trigger="this.$refs.search_panel_trigger" style="position:relative; width:0px"
                :default-show="false" :slide-direction="1">
                <div class="search-panel">
                    <div class="search-history" v-if="searchHistory.length > 0">
                        <div class="search-history-title">
                            {{ $t('titlebar.searchHistory') }}
                        </div>
                        <div class="search-history-items">
                            <div v-for="item in searchHistory" :key="item" @click="search(item)"
                                class="search-history-item font-color-standard">
                                {{ item }}
                            </div>
                        </div>
                    </div>
                    <div class="search-suggestions" v-if="searchSuggestions?.length > 0">
                        <div class="search-suggestions-title">
                            {{ $t('titlebar.suggestedSearches') }}
                        </div>
                        <div class="search-suggestion" v-for="suggestion in searchSuggestions" :key="suggestion"
                            :title="suggestion.keyword" @click="search(suggestion.keyword)"
                            v-html="highlightMatching(suggestion.keyword)">
                        </div>
                    </div>
                    <div class="search-suggestions" v-else>
                        <div class="search-suggestions-title">
                            {{ $t('titlebar.trending') }}
                        </div>
                        <div class="search-suggestion font-color-high" v-for="(hotSearch) in hotSearches"
                            :key="hotSearch" :title="hotSearch.first" @click="search(hotSearch.first)"
                            v-html="highlightMatching(hotSearch.first)" />
                    </div>
                </div>
            </YPanel>
        </div>
        <div class="buttons">
            <!-- 用户信息 -->
            <button class="avatar" v-if="this.login.status && type === 'default'" @click="openUserPage">
                <img class="avatarImg" :src="this.login.avatar" v-if="this.login.avatar" />
                <div class="avatarImg avatarImgPlaceholder" v-else></div>
            </button>
            <button class="userInfo font-color-main" @click="userInfo" ref="user_info_menu_trigger"
                v-if="type === 'default'">
                <div class="userInfoTxt" v-if="this.login.status">
                    {{ userNickName }}
                </div>
                <div class="userInfoTxt" v-if="!this.login.status">
                    {{ $t('titlebar.notLoggedIn') }}
                </div>
                <img class="img-userInfo g-icon" src="../assets/more.svg" />
            </button>
            <!-- 扫码登录 -->
            <div v-if="showDropdown" ref="dropDownMenu" class="dropdown-menu">
                <div class="login_text">
                    {{ $t('titlebar.scanQRCodeToLogin') }}
                </div>
                <img :src="base64Image" />
            </div>
            <!-- 用户名下拉菜单 -->
            <YPanel class="userInfoPanel" :trigger="this.$refs.user_info_menu_trigger" ref="user_info_panel"
                :default-show="false" :slide-direction="1">
                <div class="user-info-menu">
                    <div class="user-info-item follows">
                        <div class="follows-container follows-container-left">
                            <div class="follows-number font-color-main">
                                {{ userProfile?.follows ?? 0 }}
                            </div>
                            <div class="follows-text font-color-low">
                                {{ $t('titlebar.follows') }}
                            </div>
                        </div>
                        <div class="follows-splitline" />
                        <div class="follows-container follows-container-right">
                            <div class="follows-number font-color-main">
                                {{ userProfile?.followeds ?? 0 }}
                            </div>
                            <div class="follows-text font-color-low">
                                {{ $t('titlebar.followers') }}
                            </div>
                        </div>
                    </div>
                    <div class="user-info-item" @click="$router.push({ path: '/setting' })">
                        {{ $t('titlebar.settings') }}
                    </div>
                    <div class="user-info-item">
                        {{ $t('titlebar.level') }}:
                        {{ userProfile?.level ?? 0 }}
                    </div>
                    <div class="user-info-item" @click="openListenRank">
                        {{ $t('titlebar.listenRank') }}
                    </div>
                    <div class="user-info-item" @click="this.openTestPage">
                        {{ $t('titlebar.testPage') }}
                    </div>
                    <div class="user-info-item">
                        {{ $t('titlebar.about') }}
                    </div>
                    <div class="user-info-item" @click="this.login.logout()">
                        {{ $t('titlebar.logout') }}
                    </div>
                </div>
            </YPanel>
            <!-- 设置、最小化、最大化和关闭按钮 -->
            <button class="settings" @click="settings" :title="$t('titlebar.settings')" v-if="type === 'default'">
                <img class="img settings g-icon" @click="$router.push({ path: '/setting' })"
                    src="../assets/settings.svg" alt="Settings" />
            </button>
            <button class="minimize " @click="minimize" :title="$t('titlebar.minimize')">
                <img class="img minimize g-icon" src="../assets/min.svg" alt="Minimize" />
            </button>
            <button class="maximize " @click="maximize" :title="$t('titlebar.maximize')">
                <img class="img maximize g-icon" src="../assets/max.svg" alt="Maximize" />
            </button>
            <button class="close" @click="close" :title="$t('titlebar.close')">
                <img class="img close g-icon" src="../assets/close.svg" alt="Close" />
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
        'user-login',
        'close-panel',
    ],
    props: {
        type: {
            type: String,
            default: 'default',
        },
    },
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
            searchHistory: [],    // 用于存储搜索历史
            base64Image: '',    // 用于存储 Base64 图片
            userNickName: '用户昵称',   // 用于存储用户昵称
            avatarSrc: '',      // 用于存储头像地址
            searchInput: '',    // 用于存储搜索输入
            searchSuggestions: [],  // 用于存储搜索建议
            hotSearches: [],    // 用于存储热搜榜
            selectedSuggestion: 0,  // 用于存储选中的搜索建议
        };
    },
    watch: {
        searchHistory(newHistory) {
            if (newHistory.length > 0) {
                this.setting.titleBar.searchHistory = newHistory;
            }
        },
    },
    computed: {
        ...mapState({
            login: state => state.login,
            setting: state => state.setting,
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
            if (window.electron?.isElectron) {
                window.electron.ipcRenderer.send('open-settings');
            } else {
                console.log('not in electron, cannot open settings');
            }
        },
        minimize() {
            if (window.electron?.isElectron) {
                window.electron.ipcRenderer.send('minimize');
            } else {
                console.log('not in electron, cannot minimize');
            }
        },
        maximize() {
            if (window.electron?.isElectron) {
                window.electron.ipcRenderer.send('maximize');
            } else {
                console.log('not in electron, cannot maximize');
            }
        },
        close() {
            if (window.electron?.isElectron) {
                window.electron.ipcRenderer.send('close');
            } else {
                console.log('not in electron, cannot close');
            }
        },
        // 搜索
        handleSearch(event) {
            this.search(event.target.value);
        },
        search(text) {
            this.$router.push({ path: `/search/${text}/default` });
            this.$refs.search_panel.closePanel();
            const SEARCH_HISTORY_LENGTH = 10;
            this.searchInput = text;
            if (this.searchHistory.length > 0 && this.searchHistory.length <= SEARCH_HISTORY_LENGTH) {
                console.log('search0');
                if (!this.searchHistory.includes(text)) {
                    this.searchHistory = [
                        text,
                        ...this.searchHistory,
                    ];
                } else {
                    this.searchHistory = [
                        text,
                        ...this.searchHistory.filter((item) => item !== text),
                    ];
                }
            } else if (this.searchHistory.length === 0) {
                this.searchHistory = [
                    text,
                ];
            } else if (this.searchHistory.length >= SEARCH_HISTORY_LENGTH) {
                if (!this.searchHistory.includes(text)) {
                    this.searchHistory = [
                        text,
                        ...this.searchHistory.slice(0, SEARCH_HISTORY_LENGTH - 1),
                    ];
                } else {
                    this.searchHistory = [
                        text,
                        ...this.searchHistory.filter((item) => item !== text).slice(0, SEARCH_HISTORY_LENGTH - 1),
                    ];
                }
            }
            console.log('search:', text);
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
        if (this.type === 'default') {
            await this.getHotSearches();
            this.searchHistory = this.setting.titleBar.searchHistory;
        }
    },
    beforeUnmount() {
        // 移除外部点击处理器
        document.removeEventListener('click', this.handleOutsideClick);
    },
}
</script>

<style lang="scss" scoped>
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
    -webkit-app-region: drag;
    -webkit-user-drag: none;

    .buttons.arrows button {
        margin: 5px;
        margin-top: 4px;
        border: 1px solid rgba(var(--foreground-color-rgb), .1);
        padding: 8px 1px 7px 1px;
        border-radius: 7px;

    }

    .close-button {
        margin-left: 10px;
        padding: 10px 10px 5px 10px;
        background-color: rgba(var(--foreground-color-rgb), .05);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, .1);
        cursor: pointer;

        .img-close-panel {
            width: 16px;
            height: 16px;
        }
    }

    .searchbar {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        margin-right: 10px;
        z-index: 1;

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;

            .search-input {
                filter: opacity(0.5);
                padding: 5px 35px 5px 30px;
                font-size: medium;
                border-radius: 7px;
                border-style: solid;
                border-width: 1.5px;
                width: 250px;
                border-color: rgba(var(--foreground-color-rgb), 0.2);
                margin-top: 0px;
                margin-left: 7px;
                background-color: transparent;
                -webkit-app-region: no-drag;
                -webkit-user-drag: none;

                &::placeholder {
                    user-select: none;
                    color: var(--font-color-main);
                }

                &:focus {
                    outline: none;
                }
            }

            .img-search {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 17px;
                height: 17px;
                opacity: 0.5;
                -webkit-user-drag: none;
            }

            .img-clear {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 17px;
                height: 17px;
                opacity: 0.5;
                -webkit-user-drag: none;
                cursor: pointer;
            }
        }

        .search-panel {
            position: absolute;
            display: flex;
            flex-direction: column;
            padding: 10px;
            width: 300px;
            height: 400px;
            max-height: 400px;
            overflow-y: auto;
            transform: translateX(calc(-100% + 0px));
            background-color: var(--panel-background-color);
            border-radius: 5px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            top: 30px;

            &::-webkit-scrollbar {
                width: 6px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }

            &::-webkit-scrollbar-thumb {
                background: transparent;
                border-radius: 6px;
            }

            &:hover::-webkit-scrollbar-thumb {
                background-color: rgba(var(--foreground-color-rgb), 0.1);
            }

            &:hover::-webkit-scrollbar-thumb:hover {
                background-color: rgba(var(--foreground-color-rgb), 0.2);
            }

            .search-history {
                display: flex;
                flex-direction: column;
                padding: 5px;

                .search-history-title {
                    font-size: 16px;
                    width: 100%;
                    text-align: left;
                    margin-bottom: 5px;
                }

                .search-history-items {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    align-items: baseline;

                    .search-history-item {
                        border-radius: 5px;
                        text-align: left;
                        cursor: pointer;
                        padding: 6px;
                        white-space: nowrap;

                        &:hover {
                            background-color: rgba(var(--foreground-color-rgb), .1);
                            color: var(--font-color-main);
                        }
                    }
                }
            }

            .search-suggestions {
                display: flex;
                flex-direction: column;
                gap: 5px;
                padding: 5px;

                .search-suggestions-title {
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
                    cursor: pointer;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;

                    &:hover {
                        background-color: rgba(var(--foreground-color-rgb), .1);
                    }
                }
            }
        }
    }

    .buttons {
        display: flex;
        -webkit-app-region: no-drag;
        -webkit-user-drag: none;
        gap: 0px;
        align-items: center;

        button {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            position: relative;
            user-select: none;
        }

        .avatar {
            margin: 0;
            padding: 0;

            .avatarImg {
                width: 30px;
                height: 30px;
                border-radius: 100%;
                -webkit-user-drag: none;
            }

            .avatarImgPlaceholder {
                background-color: rgba(var(--foreground-color-rgb), .3);
            }
        }

        .userInfo {
            display: flex;
            align-items: center;
            flex-direction: row;
            transition: all 0.3s ease;
            margin: 0;
            opacity: .5;

            .userInfoTxt {
                font-size: 15px;
                margin-right: 6px;
            }

            .img-userInfo {
                width: 14px;
                height: 14px;
                margin-right: 10px;
                -webkit-user-drag: none;
            }

            &:hover {
                cursor: pointer;
                opacity: 1;
            }
        }

        .dropdown-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--panel-background-color);
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
            z-index: 1;

            img {
                max-width: 150px;
                max-height: 150px;
                border-radius: 5px;
            }
        }

        .user-info-menu {
            z-index: 1;
            position: absolute;
            width: 200px;
            height: 300px;
            transform: translate3d(-180px, 32.1px, 0px);
            background-color: var(--panel-background-color);
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
            user-select: none;

            .user-info-item {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                color: var(--font-color-standard);
                font-weight: 600;
                font-size: medium;
                padding: 8px 5px;
                margin: 0;
                cursor: pointer;

                &:hover {
                    color: var(--font-color-main);
                }
                
                &:not(:last-child) {
                    border-bottom: 1px solid rgba(var(--foreground-color-rgb), .1);
                }

                .follows-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 50%;

                    .follows-number {
                        font-size: 30px;
                        cursor: pointer;
                    }

                    .follows-text {
                        font-size: 14px;
                        font-weight: bolder;
                        cursor: default;
                    }
                }

                .follows-container-left {
                    padding: 0px 8px 5px 0px;
                }

                .follows-container-right {
                    padding: 0px 0px 5px 8px;
                }

                .follows-splitline {
                    width: 1px;
                    height: 45px;
                    background-color: rgba(var(--foreground-color-rgb), .3);
                }
            }

            .follows {
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: unset;
            }
        }
    }
}

.img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
    -webkit-user-drag: none;

    &.settings {
        width: 18px;
        height: 18px;
        margin-right: 10px;
    }

    &.minimize {
        margin-right: 10px;
    }

    &.maximize {
        margin-right: 10px;
    }

    &.close {
        margin-right: 10px;
    }

    &:hover {
        opacity: 1;
    }
}
</style>