<template>
    <!-- 主容器 -->
    <div class="mainContainer ">
        <div class="align-up">
            <div class="align-left">
                <!-- 侧边栏 -->
                <div class="leftSidebar">
                    <YSidebar :opened_playlist="opened_playlist" ref="YSidebar_ref" />
                </div>
            </div>
            <div class="align-right" id="align_right">
                <!-- 内容 -->
                <div class="mainContent">
                    <!-- 标题栏 -->
                    <YTitlebar />
                    <!-- 显示区域 -->
                    <div class="content">
                        <YDisplayArea class="display-area" ref="YDisplayArea" />
                    </div>
                </div>
            </div>
        </div>
        <div class="align-down">
            <!-- 播放栏 -->
            <div class="playbar">
                <YPlaybar @open-panel="$refs.playUI?.showPanel()" />
            </div>
        </div>
        <div class="context-menu">
            <YContextMenu :items="menu" :target="target" :posX="posX" :posY="posY" :direction="direction"
                ref="contextMenu" @menu-click="handleMenuClick" />
        </div>
        <div class="add-to-playlist-container" ref="add_to_playlist_container" v-if="showAddToPlaylist">
            <YAddToPlaylist :ids="trackIds" @new-window-state="handleNewWindowState" />
        </div>
        <div class="add-to-playlist-container" ref="song-info-container" v-if="showSongInfo">
            <YSongInfo :track="trackOfInfo" @new-window-state="handleNewWindowState_songInfo" />
        </div>
        <div class="message-container">
            <div></div>
            <div class="msg">
                <YMessage :message="msg.message" :key="msgKey" :type="msg.type" v-if="msg.type !== 'none'" />
            </div>
        </div>
    </div>
    <div class="play-ui" :class="showPlayUI ? 'top' : 'bottom'">
        <YPlayUI ref="playUI" @close-panel="showPlayUI = false" @show-panel="showPlayUI = true" />
    </div>
</template>

<script lang="js">
import YDisplayArea from '@/components/YDisplayArea.vue';
import YSidebar from '../components/YSidebar.vue';
import YTitlebar from '../components/YTitlebar.vue';
import { mapState } from 'vuex';
import YPlaybar from '../components/YPlaybar.vue';
import YContextMenu from '@/components/YContextMenu.vue';
import YAddToPlaylist from '@/components/YAddToPlaylist.vue';
import YSongInfo from '@/components/YSongInfo.vue';
import YMessage from '@/components/YMessage.vue';
import YPlayUI from '@/components/YPlayUI.vue';
import { YMessageC, Message } from '@/tools/YMessageC';
import { songItems } from '@/tools/YContextMenuItemC';
import { useApi } from '@/ncm/api';

export default {
    name: 'App',
    data() {
        return {
            // 打开的播放列表
            opened_playlist: 0,
            menu: songItems,
            target: null,
            posX: '0px',
            posY: '0px',
            direction: 4,
            showAddToPlaylist: false,
            trackIds: [],
            trackOfInfo: null,
            showSongInfo: false,
            msg: {
                type: 'none',
                message: '',
            },
            msgKey: 0,
            showPlayUI: false,
        };
    },
    components: {
        YSidebar,
        YTitlebar,
        YDisplayArea,
        YPlaybar,
        YContextMenu,
        YAddToPlaylist,
        YSongInfo,
        YMessage,
        YPlayUI,
    },
    computed: {
        ...mapState({
            // 播放列表
            player: state => state.player,
            setting: state => state.setting,
            login: state => state.login,
        }),
    },
    mounted() {
        // console.log(this.$refs.YDisplayArea);
        window.addEventListener('message', this.handleMessage);
        this.player.quality = this.setting.play.quality;
    },
    beforeUnmount() {
        window.removeEventListener('message', this.handleMessage);
    },
    methods: {
        async handleMessage(event) {
            if (event.data.type === 'song-open-context-menu' || event.data.type === 'song-toogle-context-menu') {
                if (event.data.type === 'song-toogle-context-menu') {
                    this.$refs.contextMenu.toogleContextMenu();
                } else {
                    this.$refs.contextMenu.showContextMenu();
                }
                let data = event.data.data;
                this.menu = songItems;
                if (data.from && data.from !== -1) {
                    this.menu[this.menu.length - 1].from = data.from;
                    this.menu[this.menu.length - 1].display = true;
                    console.log('from:', data.from, this.menu);
                } else {
                    this.menu[this.menu.length - 1].display = false;
                }
                this.target = JSON.parse(data.track);
                this.posX = data.x + 5 + 'px';
                this.posY = data.y + 5 + 'px';
                let menuWidth = 198;
                let menuHeight = 282;
                this.setDirection(data.x, data.y, menuWidth, menuHeight);
                console.log(data)
                let commentCount = await this.getCommentCount(this.target.id)
                this.menu[4].label = `查看评论(${commentCount})`
            } else if (event.data.type === 'song-open-add-to-playlist') {
                this.trackIds = event.data.data.ids;
                console.log('ids: ', this.trackIds);
                this.showAddToPlaylist = true;
            } else if (event.data.type === 'message-show') {
                this.msg = event.data.data;
                this.msgKey++;
            } else if (event.data.type === 'open-info-panel') {
                if (event.data.data) {
                    this.trackOfInfo = JSON.parse(event.data.data);
                    this.showSongInfo = true;
                }
            }
        },
        async getCommentCount(id) {
            let result = '0';
            await useApi(`/comment/music`, {
                id: id ?? null,
                limit: 0,
            }).then(res => {
                let count = res.total;
                if (count < 1000) {
                    result = `${count}`;
                } else if (count >= 1000 && count < 10000) {
                    let num = Math.floor(count / 1000);
                    result = `${num}k+`;
                } else if (count >= 10000 && count < 100000) {
                    let num = Math.floor(count / 10000);
                    result = `${num}w+`
                } else if (count > 100000) {
                    let num = Math.floor(count / 100000);
                    result = `${num}0w+`
                }
            })
            return result;
        },
        setDirection(x, y, menuWidth, menuHeight) {
            if (x + menuWidth > window.innerWidth) {
                if (y + menuHeight > window.innerHeight) {
                    this.direction = 2;
                } else {
                    this.direction = 3;
                }
            } else {
                if (y + menuHeight > window.innerHeight) {
                    this.direction = 1;
                } else {
                    this.direction = 4;
                }
            }

        },
        handleMenuClick(arg) {
            switch (arg.role) {
                case 'song-play':
                    this.player.playTrack(arg.target);
                    break;
                case 'song-addtoplaylist':
                    this.player.nextPlay(arg.target);
                    Message.post(new YMessageC({
                        type: 'info',
                        message: '已添加到播放列表',
                    }));
                    break;
                case 'song-comment':
                    this.$router.push(`/comment/song/${arg.target.id}`);
                    break;
                case 'song-delete':
                    this.deleteFromPlaylist(arg.target.id, arg.from);
                    break;
                case 'song-copylink':
                    navigator.clipboard.writeText(`https://music.163.com/song?id=${arg.target.id}`)
                        .then(() => {
                            Message.post(new YMessageC({
                                type: 'success',
                                message: '链接已复制',
                            }));
                        })
                        .catch((error) => {
                            Message.post(new YMessageC({
                                type: 'error',
                                message: `复制链接失败: ${error}`,
                            }));
                            console.log('Failed to copy link:', error);
                        });
                    break;
                case 'song-subscribe':
                    this.trackIds = [arg.target.id];
                    this.showAddToPlaylist = true;
                    break;
                case 'song-infomation':
                    this.trackOfInfo = arg.target;
                    this.showSongInfo = true;
                    break;
                default:
                    break;
            }
        },
        async deleteFromPlaylist(trackId, playlistId) {
            if (playlistId === -1) {
                return;
            }
            await useApi('/playlist/tracks', {
                op: 'del',
                pid: playlistId,
                tracks: trackId,
                cookie: this.login.cookie,
            })
                .then((res) => {
                    console.log('Track deleted from playlist:', res);
                    if (res.status === 200) {
                        Message.post(new YMessageC({
                            type: 'success',
                            message: '删除成功',
                        }));
                    } else {
                        Message.post(new YMessageC({
                            type: 'error',
                            message: `删除失败: ${res.message ?? (res.status ?? '未知原因')}`,
                        }));
                    }
                })
                .catch((error) => {
                    Message.post(new YMessageC({
                        type: 'error',
                        message: `删除失败: ${error}`,
                    }));
                    console.error('Failed to delete track from playlist:', error);
                });
        },
        handleNewWindowState(val) {
            if (val === false) {
                this.showAddToPlaylist = false;
            }
        },
        handleNewWindowState_songInfo(val) {
            if (val === false) {
                this.showSongInfo = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.mainContainer {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    position: absolute;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--background-color);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .align-up {
        display: flex;
        justify-content: space-between;
        flex-direction: row;
        height: calc(100% - 85px);
        width: 100%;

        .align-left {
            display: flex;

            .leftSidebar {
                display: flex;
                background-color: rgba(var(--foreground-color-rgb), 0.03);
                position: relative;
            }
        }

        .align-right {
            display: flex;
            left: 0;
            flex: 1;
            right: 0;
            margin-right: 5px;
            overflow: hidden;

            .mainContent {
                flex: 1;
                flex-direction: column;
                width: 100%;
                z-index: 0;

                .content {
                    height: calc(100vh - 140px);
                    background-color: transparent;
                    width: 100%;

                    .display-area {
                        background-color: transparent;
                        width: 100%;
                    }
                }
            }
        }
    }

    .align-down {
        display: flex;
        z-index: 10;
        height: 85px;

        .playbar {
            background-color: var(--panel-background-color);
            border-top: 1px solid var(--border-color);
            position: relative;
            height: 100%;
            width: 100%;
            padding: 0;
            margin: 0;
        }
    }

    .context-menu {
        z-index: 1000;
    }

    .add-to-playlist-container {
        top: 0;
        left: 0;
        position: absolute;
        width: 100vw;
        height: 100vh;
        display: flex;
        background-color: transparent;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .message-container {
        top: 80px;
        width: calc(100vw - 20px);
        height: 0px;
        position: absolute;
        display: flex;
        background-color: transparent;
        justify-content: space-between;
        z-index: 1000;

        .msg {
            position: relative;
            align-items: end;
            justify-content: end;
        }
    }
}

.play-ui {
    position: absolute;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
}

.top {
    z-index: 500;
}

.bottom {
    z-index: -1;
}

#app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-size: 2rem;
    color: var(--font-color-main);
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
