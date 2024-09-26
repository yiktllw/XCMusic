<template>
    <div class="table-container" ref="main">
        <!-- 3 表头 -->
        <div v-if="showHeader" class="table-header" :style="{ top: stickyTop }">
            <!-- 4 歌曲序号-表头 -->
            <div class="songsCounter" v-if="showTrackCounter">
                <!-- 5 歌曲序号-表头按钮 -->
                <button class="header-button header-counter">
                    <span>#</span>
                </button>
            </div>
            <!-- 4 歌曲标题-表头 -->
            <div class="songsName" ref="songs_name_ref" v-if="showTrackTitle">
                <!-- 5 标题排序按钮 -->
                <button :disabled="!resortable" class="header-button" @click="handleSort">
                    <span>标题</span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates[currentSortingIndex].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{ sortingStates[currentSortingIndex].text
                            }}</span>
                    </div>
                </button>
            </div>
            <!-- 4 resize控件 -->
            <div v-if="showTrackAlbum" class="resizer" @mousedown="startResize($event)"></div>
            <!-- 4 专辑-表头 -->
            <div class="songsAlbum" ref="songs_album_ref" v-if="showTrackAlbum"
                :style="{ 'width': `${this.alWidth}px` }">
                <!-- 5 专辑排序按钮 -->
                <button :disabled="!resortable" class="header-button" @click="handleSort_Album">
                    <span>专辑</span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates_Album[currentSortingIndex_Album].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{
                            sortingStates_Album[currentSortingIndex_Album].text
                        }}</span>
                    </div>
                </button>
            </div>
            <!-- 4 喜欢-表头 -->
            <div class="likes" v-if="showTrackLikes">
                <button class="header-button">
                    <span>喜欢</span>
                </button>
            </div>
            <!-- 4 时长-表头 -->
            <div class="songsDuration" v-if="showTrackDuration">
                <!-- 5 时长排序按钮 -->
                <button :disabled="!resortable" class="header-button" @click="handleSort_Duration">
                    <span>时长</span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates_Duration[currentSortingIndex_Duration].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{
                            sortingStates_Duration[currentSortingIndex_Duration].text
                        }}</span>
                    </div>
                </button>
            </div>
            <!-- 4 热度-表头 -->
            <div class="popularity" v-if="showTrackPopularity">
                <button class="header-button">
                    <span>热度</span>
                </button>
            </div>
            <!-- 4 听歌次数-表头 -->
            <div class="listen-count" v-if="showListenCount">
                <button class="header-button">
                    <span>听歌次数</span>
                </button>
            </div>
        </div>
        <!-- 3 歌曲列表内容 -->
        <ul>
            <li v-for="(track, index) in localTracks.slice((this.page.current - 1) * this.limit, this.page.current * this.limit)"
                :id="`track-item-${track.id}`" :key="track.id" class="track-item" ref="track_item_ref"
                @mouseover="trackMouseEnter(track.id)" @mouseleave="trackMouseLeave(track.id)"
                @dblclick="playSongAndPlaylist(track)" @click="setFocused(track.id)" tabindex="0"
                @contextmenu="openContextMenu($event, track)">
                <div class="align-up">
                    <!-- 4 左侧对齐 -->
                    <div class="align-left">
                        <!-- 5 歌曲序号 -->
                        <div class="track-count" v-if="showTrackCounter">
                            <span v-if="nowPlaying !== track.id">{{ index + 1 }}</span>
                            <YPlaying v-else />
                        </div>
                        <!-- 5 封面图片 -->
                        <div class="before-cover" style="min-width: 10px; height: 40px;" v-if="!showTrackCounter"></div>
                        <img v-if="showTrackCover" class="track-cover"
                            :src="track._picUrl ? track._picUrl : track.al?.picUrl" alt="Cover Image" />
                        <!-- 5 歌曲信息 -->
                        <div class="track-info" ref="trackInfo">
                            <!-- 6 歌曲名称 -->
                            <div class="track-name" ref="track_name_ref"
                                :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : '#fff' }"
                                :title="track.name + (track.tns ? ('\n' + track.tns) : '')" v-if="showTrackTitle">{{
                                    track.name +
                                    (track.tns ?
                                        (' (' + track.tns + ')') :
                                        '')
                                }}</div>
                            <!-- 6 歌手名称 -->
                            <div class="track-artist" v-if="showTrackArtist">
                                <span v-for="(artist, index) in track.ar" :key="artist.id">
                                    <!-- 7 歌手按钮 -->
                                    <span @click="handleArtistClick(artist.id)"
                                        :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : '#aaa' }"
                                        class="artist-button"
                                        :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                        {{ artist.name }}
                                    </span>
                                    <span v-if="index < track.ar.length - 1"
                                        :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : '#aaa' }"> /
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- 4 右侧对齐 -->
                    <div class="align-right">
                        <!-- 5 专辑名称 -->
                        <div class="track-menu" :id="`track-menu-${track.id}`">
                            <img src="@/assets/smalldownload.svg" class="track-menu-icon" title="下载">
                            <img src="@/assets/subscribe.svg" class="track-menu-icon" title="收藏" @click="openAddToPlaylist(track.id)">
                            <img src="@/assets/comment.svg" class="track-menu-icon" title="评论"
                                @click="openSongComment(track.id)">
                            <img src="@/assets/detail.svg" class="track-menu-icon" title="更多"
                                @click="openContextMenu($event, track, 'toogle')">
                        </div>
                        <div class="track-album" ref="track_album_ref" v-if="showTrackAlbum"
                            :style="{ 'width': `${this.alWidth}px` }">
                            <!-- 6 专辑按钮 -->
                            <button @click="handleAlbumClick(track.al.id)" class="album-button"
                                :title="track.al.name + (track.al.tns ? ('\n' + track.al.tns) : '')">
                                {{ trackAlTns(track.al.name, track.al.tns) }}
                            </button>
                        </div>
                        <!-- 5 喜欢 -->
                        <div class="likes" style="text-align: left;" v-if="showTrackLikes">
                            <img v-if="likelist.includes(track.id)" src="../assets/likes.svg"
                                style="width: 16.8px; height: 16.8px; padding-left:10px;    -webkit-user-drag: none; " />
                            <img v-else src="../assets/unlikes.svg"
                                style="width: 16.8px; height: 16.8px; padding-left:10px; opacity: 0.7;" />
                        </div>
                        <!-- 5 时长 -->
                        <div class="track-duration" v-if="showTrackDuration">{{ formatDuration(track.dt) }}</div>
                        <!-- 5 热度 -->
                        <div class="popularity" v-if="showTrackPopularity">
                            <div class="popularity-bar"
                                style="margin-left: 5px;width: 50px; height: 4px; background-color: #444; border-radius: 2px;">
                            </div>
                            <div class="popularity-bar"
                                style="margin-left: 5px; height: 4px; background-color: rgb(254, 60, 90); border-radius: 2px; transform: translateY(-4px);"
                                :style="{ width: (track.pop / 100 * 50) + 'px' }">
                            </div>
                        </div>
                        <div class="listen-count" style="color: #bbb;" v-if="showListenCount">{{ track.playCount ?? 0
                            }}次
                        </div>
                    </div>

                </div>
                <div class="align-down" v-if="showLyrics">
                    <div class="lyrics" style="color: #aaa; font-size: 14px; margin-top: 5px; margin-left: 50px;">
                        歌词:
                        <span v-for="(lyric, index) in track.lyrics" :key="index" v-html="formatLyric(lyric)">
                        </span>
                    </div>
                </div>
            </li>
        </ul>
        <YPage v-model="page" />
    </div>
</template>

<script lang="js">
import { formatDuration_mmss } from '@/ncm/time';
import { mapState } from 'vuex';
import YPlaying from './YPlaying.vue';
import YPage from './YPage.vue';
import { YPageC } from '@/tools/YPageC';

export default {
    name: 'YSongsTable',
    props: {
        showTrackCounter: {
            type: Boolean,
            default: true,
        },
        showTrackCover: {
            type: Boolean,
            default: true,
        },
        showTrackTitle: {
            type: Boolean,
            default: true,
        },
        showTrackArtist: {
            type: Boolean,
            default: true,
        },
        showTrackAlbum: {
            type: Boolean,
            default: true,
        },
        showTrackLikes: {
            type: Boolean,
            default: true,
        },
        showTrackPopularity: {
            type: Boolean,
            default: true,
        },
        showTrackDuration: {
            type: Boolean,
            default: true,
        },
        showLyrics: {
            type: Boolean,
            default: false,
        },
        showListenCount: {
            type: Boolean,
            default: false,
        },
        resortable: {
            type: Boolean,
            default: true,
        },
        showHeader: {
            type: Boolean,
            default: true,
        },
        showMenu: {
            type: Boolean,
            default: true,
        },
        canSendPlaylist: {
            type: Boolean,
            default: true,
        },
        tracks: {
            type: Array,
            default: () => [],
            required: true,
        },
        localPlay: {
            type: Boolean,
            default: false,
        },
        stickyTop: {
            type: String,
            default: '0px',
        },
        limit: {
            type: Number,
            default: 500,
        },
        id: {
            type: String,
            required: true,
        },
        from: {
            type: Number,
            default: -1,
        },
    },
    components: {
        YPlaying,
        YPage,
    },
    emits: [
        'send-playlist',
        'update-display',
        'play-song-and-playlist',
    ],
    computed: {
        ...mapState({
            player: state => state.player,
            login: state => state.login,
            setting: state => state.setting,
        }),
        likelist() {
            return this.login.likelist ?? [];
        },
    },
    data() {
        return {
            initialMouseX: 0,   // 鼠标初始位置
            initialAlbumWidth: 0,   // 初始专辑宽度
            deltaX: 0,  // resize控件的鼠标移动距离
            newWidth: 0,    // resize控件的新的专辑宽度
            // 歌曲标题栏的排序状态
            sortingStates: [
                { icon: require('../assets/updown-arrow.svg'), text: '默认排序', key: 'default' },
                { icon: require('../assets/up-arrow.svg'), text: '标题升序', key: 'titleAsc' },
                { icon: require('../assets/down-arrow.svg'), text: '标题降序', key: 'titleDesc' },
                { icon: require('../assets/up-arrow.svg'), text: '歌手升序', key: 'artistAsc' },
                { icon: require('../assets/down-arrow.svg'), text: '歌手降序', key: 'artistDesc' },
            ],
            // 专辑栏的排序状态
            sortingStates_Album: [
                { icon: require('../assets/updown-arrow.svg'), text: '默认排序', key: 'default' },
                { icon: require('../assets/up-arrow.svg'), text: '专辑升序', key: 'albumAsc' },
                { icon: require('../assets/down-arrow.svg'), text: '专辑降序', key: 'albumDesc' },
            ],
            // 时长栏的排序状态
            sortingStates_Duration: [
                { icon: require('../assets/updown-arrow.svg'), text: '', key: 'default' },
                { icon: require('../assets/up-arrow.svg'), text: '', key: 'albumAsc' },
                { icon: require('../assets/down-arrow.svg'), text: '', key: 'albumDesc' },
            ],
            currentSortingIndex: 0, // 标题栏当前排序状态的索引
            currentSortingIndex_Album: 0, // 专辑栏当前排序状态的索引
            currentSortingIndex_Duration: 0,    // 时长栏当前排序状态的索引
            localTracks: [],
            alWidth: 230,
            page: new YPageC(),
            nowPlaying: 0,
        }
    },
    async mounted() {
        this.localTracks = this.tracks;
        if (this.login.status) {
            if (this.login.likelist?.length === 0) {
                this.login.reloadLikelist();
            }
        }
        this.alWidth = this.setting.display.albumWidth;
        this.nowPlaying = this.player.currentTrack?.id ?? 0;
        this.player.Subscribe({
            id: this.id,
            type: 'track',
            func: () => {
                this.nowPlaying = this.player.currentTrack?.id ?? 0;
            }
        })
    },
    beforeUnmount(){
        this.player.UnSubscribe({
            id: this.id,
            type: 'track',
        });
    },
    watch: {
        tracks(newVal) {
            this.localTracks = newVal;
            this.alWidth = this.setting.display.albumWidth;
        },
        localTracks(newVal) {
            this.page = new YPageC(Math.ceil(newVal.length / this.limit));
        },
    },
    methods: {
        // playSongs(track) {
        //     console.log('Play Songs:', track.id);
        //     if (!this.localPlay) {
        //         this.$emit('play-songs', JSON.stringify(track));
        //     } else {
        //         this.player.playTrack(track);
        //         this.player.playState = 'play';
        //     }
        //     this.sendPlaylist();
        // },
        sendPlaylist() {
            if (!this.localPlay) {
                this.$emit('send-playlist');
            } else {
                this.player.playlist = this.localTracks;
            }
        },
        async playSongAndPlaylist(track) {
            console.log('Play Song And Playlist:', track.id);
            if (this.canSendPlaylist) {
                this.$emit('play-song-and-playlist', JSON.stringify(track));
            } else {
                await this.player.playTrack(track);
            }
            if (this.localPlay) {
                this.player.playlist = this.localTracks;
                await this.player.playTrack(track);
                this.player.playState = 'play';
            }
        },
        formatDuration(duration) {
            return formatDuration_mmss(duration);
        },
        // 开始resize
        startResize(event) {
            // 记录初始鼠标位置和专辑宽度
            this.initialMouseX = event.clientX;
            this.initialAlbumWidth = this.$refs.songs_album_ref.offsetWidth;

            // 添加鼠标移动监听
            window.addEventListener('mousemove', this.resize);
            // 添加鼠标松开监听
            window.addEventListener('mouseup', () => {
                // 根据新的专辑宽度调整歌曲名称和专辑的宽度
                this.resizeByNewWidth(this.newWidth);
                this.setting.display.albumWidth = this.newWidth;
                // 移除鼠标移动和松开监听
                window.removeEventListener('mousemove', this.resize);
                window.removeEventListener('mouseup', this.stopResize);
            });
        },
        // resize
        resize(event) {
            // 计算鼠标移动距离
            this.deltaX = event.clientX - this.initialMouseX;
            // 计算新的专辑宽度
            if (this.initialAlbumWidth - this.deltaX > 200 && this.initialAlbumWidth - this.deltaX < 400) {
                this.newWidth = this.initialAlbumWidth - this.deltaX;
            }
            // 设置专辑宽度
            if (this.$refs.songs_album_ref && this.newWidth > 200 && this.newWidth < 400) {
                this.$refs.songs_album_ref.style.width = `${this.newWidth}px`;
            }

        },
        setAlbumWidth(width) {
            if (this.$refs.songs_album_ref) {
                this.$refs.songs_album_ref.style.width = `${width}px`;
            }
            this.resizeByNewWidth(width);
        },
        // 根据新的专辑宽度调整歌曲名称和专辑的宽度
        resizeByNewWidth(newWidth) {
            if (this.$refs.track_album_ref) {
                this.$refs.track_album_ref.forEach(element => {
                    if (element) { // 确保元素存在
                        element.style.width = `${newWidth}px`;
                    }
                });
            }
        },
        // 停止resize
        stopResize() {
            // 移除鼠标移动和松开监听
            window.removeEventListener('mousemove', this.resize);
            window.removeEventListener('mouseup', this.stopResize);
        },
        // 处理歌手点击
        handleArtistClick(artistId) {
            this.$router.push(`/artist/${artistId}`);
            console.log('Open Artist with ID:', artistId);
        },
        // 处理专辑点击
        handleAlbumClick(albumId) {
            this.$router.push(`/album/${albumId}`);
            console.log('Open Album with ID:', albumId);
        },
        // 切换标题排序状态
        handleSort() {
            // 切换到下一个排序状态
            this.currentSortingIndex = (this.currentSortingIndex + 1) % this.sortingStates.length;
            // console.log('tracks', this.tracks);

            // 发送消息到处理函数，根据 key 进行不同的排序操作
            const currentSortKey = this.sortingStates[this.currentSortingIndex].key;
            this.sortTracks(currentSortKey);
        },
        // 切换专辑排序状态
        handleSort_Album() {
            // 切换到下一个排序状态
            this.currentSortingIndex_Album = (this.currentSortingIndex_Album + 1) % this.sortingStates_Album.length;

            // 发送消息到处理函数，根据 key 进行不同的排序操作
            const currentSortKey = this.sortingStates_Album[this.currentSortingIndex_Album].key;
            this.sortTracks_Album(currentSortKey);
        },
        // 切换时长排序状态
        handleSort_Duration() {
            // 切换到下一个排序状态
            this.currentSortingIndex_Duration = (this.currentSortingIndex_Duration + 1) % this.sortingStates_Duration.length;

            // 发送消息到处理函数，根据 key 进行不同的排序操作
            const currentSortKey = this.sortingStates_Duration[this.currentSortingIndex_Duration].key;
            this.sortTracks_Duration(currentSortKey);
        },
        // 标题排序
        sortTracks(sortKey) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.localTracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'titleAsc':
                    console.log('按标题升序排序');
                    // 处理按标题升序排序逻辑
                    this.localTracks.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'titleDesc':
                    console.log('按标题降序排序');
                    // 处理按标题降序排序逻辑
                    this.localTracks.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'artistAsc':
                    console.log('按歌手升序排序');
                    // 处理按歌手升序排序逻辑
                    this.localTracks.sort((a, b) => a.ar[0].name.localeCompare(b.ar[0].name));
                    break;
                case 'artistDesc':
                    console.log('按歌手降序排序');
                    // 处理按歌手降序排序逻辑
                    this.localTracks.sort((a, b) => b.ar[0].name.localeCompare(a.ar[0].name));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        // 专辑排序
        sortTracks_Album(sortKey) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.localTracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按专辑升序排序');
                    // 处理按专辑升序排序逻辑
                    this.localTracks.sort((a, b) => a.al.name.localeCompare(b.al.name));
                    break;
                case 'albumDesc':
                    console.log('按专辑降序排序');
                    // 处理按专辑降序排序逻辑
                    this.localTracks.sort((a, b) => b.al.name.localeCompare(a.al.name));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        // 时长排序
        sortTracks_Duration(sortKey) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.localTracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按时间升序排序');
                    // 处理按时间升序排序逻辑
                    this.localTracks.sort((a, b) => parseFloat(a.dt) - parseFloat(b.dt));
                    break;
                case 'albumDesc':
                    console.log('按时间降序排序');
                    // 处理按时间降序排序逻辑
                    this.localTracks.sort((a, b) => parseFloat(b.dt) - parseFloat(a.dt));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        formatLyric(lyric) {
            return '   ' + lyric + '   ';
        },
        trackMouseEnter(id) {
            // console.log('trackMouseEnter', id);
            let dom = this.$refs.main?.querySelector(`#track-menu-${id}`);
            if (dom){
                dom.style.display = 'flex';
            }
        },
        trackMouseLeave(id) {
            // console.log('trackMouseLeave', id);
            let dom = this.$refs.main?.querySelector(`#track-menu-${id}`);
            if (dom){
                dom.style.display = 'none';
            }
        },
        trackAlTns(name, tns) {
            let result = name;
            if (tns?.length > 0) {
                result += ' (' + tns + ')';
            }
            return result;
        },
        setFocused(id) {
            let dom = this.$refs.main?.querySelector(`#track-item-${id}`);
            if (dom) {
                dom?.classList.add('focused');
            }
        },
        openSongComment(id) {
            this.$router.push(`/comment/song/${id}`);
        },
        openContextMenu(event, track, type = 'show') {
            window.postMessage({
                type: type === 'show' ? 'song-open-context-menu' : 'song-toogle-context-menu',
                data: {
                    x: event.clientX,
                    y: event.clientY,
                    track: JSON.stringify(track),
                    from: this.from,
                },
            });
            // 在HomeView中处理
        },
        openAddToPlaylist(id) {
            window.postMessage({
                type: 'song-open-add-to-playlist',
                data: {
                    ids: [id],
                },
            });
            console.log('Open Add To Playlist:', id);
            // 在HomeView中处理
        },
    },
}


</script>

<style scoped>
/* 2 歌曲列表 */
.table-container {
    display: flex;
    max-width: 100vw;
    flex-direction: column;
}

/* 3 表头 */
.table-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1;
    justify-content: space-between;
    /* background-color: rgba(255, 255, 255, 0.8); */
    /* 设置一个半透明的背景 */
    backdrop-filter: blur(8px);
    /* 给背景增加模糊效果 */
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    /* 增加边框以视觉分离 */
}

/* 4 歌曲序号-表头 */
.songsCounter {
    width: 50px;
    color: #aaa;
}

/* 4 歌曲序号-表头悬停样式 */
.songsCounter .header-button:hover {
    cursor: initial;
    background-color: transparent;
}

/* 4 歌曲标题-表头 */
.songsName {
    flex: 1;
    text-align: left;
    color: #fff;
}

/* 4 resize 控件 */
.resizer {
    width: 5px;
    /* 调整宽度，增加点击区域 */
    cursor: ew-resize;
    /* 鼠标悬停时显示列调整光标 */
    background-color: transparent;
    /* 默认情况下透明 */
    top: 0;
    right: 0;
    bottom: 0;
    /* z-index: 10; */
    /* 确保它位于其他内容之上 */
}

/* 4 专辑-表头 */
.songsAlbum {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    /* width: 230px; */
    color: #ccc;
}

/* 4 喜欢-表头 */
/* 4 喜欢 */
.likes {
    width: 60px;
}

/* 4 喜欢-表头悬停样式 */
.likes .header-button:hover {
    cursor: initial;
    background-color: transparent;
}

.popularity {
    width: 60px;
}

.listen-count {
    width: 80px;
}

/* 4 时长-表头 */
.songsDuration {
    width: 80px;
    text-align: left;
    color: #aaa;
}

/* 5 排序按钮 */
.header-button {
    padding-top: 5px;
    padding-bottom: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: #ccc;
    text-align: left;
    width: 100%;
    border-radius: 5px;
    /* transition: all 0.3s; */
}

/* 5 排序按钮悬停样式 */
.header-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

/* 5 歌曲序号-表头按钮 */
.header-counter {
    text-align: center;
}

/* 6 排序内容 */
.sort-content {
    position: relative;
    display: inline-block;
    padding: 0;
    background-color: transparent;
    border: none;
    opacity: 0;
    /* transition: all 0.3s; */
}

/* 6 排序内容悬停样式 */
.header-button:hover .sort-content {
    opacity: 1;
}

/* 7 排序图标 */
.sort-icon {
    opacity: 0.6;
    width: 10px;
    height: 10px;
    margin-left: 5px;
}

/* 3 歌曲列表内容 */
ul {
    list-style-type: none;
    padding: 0;
    margin: 5px 0 0 0;
}

/* 3 歌曲列表内容 */
li {
    margin-bottom: 5px;
}

/* 3 歌曲列表内容 */
.track-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin: 0px;
    padding: 7px 0px 7px 0px;
    border-radius: 10px;
    /* transition: all 0.3s; */
}

/* 3 歌曲列表内容悬停样式 */
.track-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.track-item:focus {
    background-color: rgba(255, 255, 255, 0.1);
}

.align-up {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
}

.align-down {
    display: flex;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    /* align-items: ; */
    justify-content: space-between;
}

.lyrics {
    width: 100%;
    text-align: left;
    max-height: 5em;
    white-space: pre-wrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 4 左侧对齐 */
.align-left {
    display: flex;
    margin-right: 10px;
    flex: 1;
    align-items: center;
    /* 使歌曲信息不会溢出 */
    overflow: hidden;
}

/* 5 歌曲序号 */
.track-count {
    flex: 0 0 auto;
    width: 50px;
    color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 5 封面图片 */
.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    user-select: none;
    -webkit-user-drag: none;
}

/* 5 歌曲信息 */
.track-info {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    min-width: 0;
    text-align: left;
}

/* 6 歌曲名称 */
.track-name {
    text-align: left;
    color: #fff;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
}

/* 6 歌手名称 */
.track-artist {
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    /* max-width: 90%; */
    text-overflow: ellipsis;
    text-align: left;
}

/* 7 歌手按钮 */
.artist-button {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    padding: 0%;
    margin: 0%;
    color: #aaa;
    cursor: pointer;
    background-color: transparent;
    border: none;
    transition: all 0.3s;
}

/* 7 歌手按钮悬停样式 */
.artist-button:hover {
    color: #ccc;
}

/* 4 右侧对齐 */
.align-right {
    display: flex;
    align-items: center;
}

.track-menu {
    display: none;
    align-items: center;
    justify-content: center;
    width: 130px;
    padding-right: 10px;
}

.track-menu-icon {
    width: 24px;
    height: 24px;
    opacity: .6;
    margin: 0px 5px;
    cursor: pointer;
}

.track-menu-icon:hover {
    opacity: 1;
}

/* 5 专辑名称 */
.track-album {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    /* width: 230px; */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 6 专辑按钮 */
.album-button {
    max-width: 80%;
    padding: 0%;
    margin: 0%;
    color: #ccc;
    font-size: 14px;
    cursor: pointer;
    background-color: transparent;
    border: none;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.album-button:hover {
    color: #fff;
}

/* 5 时长 */
.track-duration {
    width: 80px;
    text-align: left;
    color: #aaa;
    font-size: 14px;
}
</style>