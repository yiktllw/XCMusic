<template>
    <!-- 主容器 -->
    <div class="mainContainer">
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
                <YPlaybar />
            </div>
        </div>
        <div class="context-menu">
            <YContextMenu :items="menu" :target="target" :posX="posX" :posY="posY" :direction="direction"
                ref="contextMenu" @menu-click="handleMenuClick" />
        </div>
        <div class="add-to-playlist-container" ref="add_to_playlist_container" v-if="showAddToPlaylist">
            <YAddToPlaylist :ids="trackIds" @new-window-state="handleNewWindowState" />
        </div>
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
        };
    },
    components: {
        YSidebar,
        YTitlebar,
        YDisplayArea,
        YPlaybar,
        YContextMenu,
        YAddToPlaylist,
    },
    computed: {
        ...mapState({
            // 播放列表
            player: state => state.player,
            login: state => state.login,
        }),
    },
    mounted() {
        // console.log(this.$refs.YDisplayArea);
        window.addEventListener('message', this.handleMessage);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.handleMessage);
    },
    methods: {
        async handleMessage(event) {
            if (event.data.type === 'song-open-context-menu') {
                this.$refs.contextMenu.showContextMenu();
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
                    break;
                case 'song-comment':
                    this.$router.push(`/comment/song/${arg.target.id}`);
                    break;
                case 'song-delete':
                    this.deleteFromPlaylist(arg.target.id, arg.from);
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
                })
                .catch((error) => {
                    console.error('Failed to delete track from playlist:', error);
                });
        },
        handleNewWindowState(val) {
            if (val === false) {
                this.showAddToPlaylist = false;
            }
        },
    },
};
</script>

<style scoped>
.mainContainer {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    position: absolute;
    margin: 0;
    padding: 0;
    /* background: linear-gradient(to bottom, #6a553f, #131319); */
    background-color: #131319;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.align-up {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    height: calc(100% - 85px);
    width: 100%;
}

.align-left {
    display: flex;
}

.align-right {
    display: flex;
    left: 0;
    flex: 1;
    right: 0;
    margin-right: 5px;
    overflow: hidden;
}

.align-down {
    display: flex;
    z-index: 10;
    height: 85px;
}

.leftSidebar {
    display: flex;
    background-color: rgba(255, 255, 255, 0.03);
    position: relative;
}

.mainContent {
    flex: 1;
    flex-direction: column;
    width: 100%;
    z-index: 0;
    /* position: absolute; */
}

.content {
    /* 确保内容区域占据剩余空间 */
    height: calc(100vh - 140px);
    background-color: transparent;
    width: 100%;
    /* 设置内容区域的背景颜色 */
}

.display-area {
    background-color: transparent;
    width: 100%;
}

.playbar {
    background-color: rgb(45, 45, 55);
    position: relative;
    height: 100%;
    width: 100%;
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
</style>
