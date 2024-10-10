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
                    <span>
                        {{ $t('songs_table.title') }}
                    </span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates[currentSortingIndex].icon" class="sort-icon g-icon" />
                        <span style="font-size:13px; color: var(--font-color-standard);">
                            {{
                                $t(sortingStates[currentSortingIndex].text)
                            }}
                        </span>
                    </div>
                </button>
            </div>
            <!-- 4 resize控件 -->
            <div v-if="showTrackAlbum" class="resizer" @mousedown="startResize($event)">
            </div>
            <!-- 4 专辑-表头 -->
            <div class="songsAlbum" ref="songs_album_ref" v-if="showTrackAlbum"
                :style="{ 'width': `${this.alWidth}px` }">
                <!-- 5 专辑排序按钮 -->
                <button :disabled="!resortable" class="header-button" @click="handleSort_Album">
                    <span>
                        {{ $t('songs_table.album') }}
                    </span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates_Album[currentSortingIndex_Album].icon" class="sort-icon g-icon" />
                        <span style="font-size:13px; color: var(--font-color-standard)">
                            {{
                                $t(sortingStates_Album[currentSortingIndex_Album].text)
                            }}
                        </span>
                    </div>
                </button>
            </div>
            <!-- 4 喜欢-表头 -->
            <div class="likes" v-if="showTrackLikes">
                <button class="header-button">
                    <span>
                        {{ $t('songs_table.like') }}
                    </span>
                </button>
            </div>
            <!-- 4 时长-表头 -->
            <div class="songsDuration" v-if="showTrackDuration">
                <!-- 5 时长排序按钮 -->
                <button :disabled="!resortable" class="header-button" @click="handleSort_Duration">
                    <span>
                        {{ $t('songs_table.duration') }}
                    </span>
                    <!-- 6 排序内容 -->
                    <div v-if="resortable" class="sort-content">
                        <img :src="sortingStates_Duration[currentSortingIndex_Duration].icon"
                            class="sort-icon g-icon" />
                        <span style="font-size:13px;color: var(--font-color-standard)">
                            {{
                                $t(sortingStates_Duration[currentSortingIndex_Duration].text)
                            }}
                        </span>
                    </div>
                </button>
            </div>
            <!-- 4 热度-表头 -->
            <div class="popularity" v-if="showTrackPopularity">
                <button class="header-button">
                    <span>
                        {{ $t('songs_table.popularity') }}
                    </span>
                </button>
            </div>
            <!-- 4 听歌次数-表头 -->
            <div class="listen-count" v-if="showListenCount">
                <button class="header-button">
                    <span>
                        {{ $t('songs_table.listen_count') }}
                    </span>
                </button>
            </div>
        </div>
        <!-- 3 歌曲列表内容 -->
        <ul>
            <template
                v-for="(track, index) in tracks.slice((this.page.current - 1) * this.limit, this.page.current * this.limit)"
                :key="track.id">
                <div class="reels" v-if="track.songInReelIndex === 0 && type === 'album' && alReels.length > 0">
                    <div class="reels-title font-color-main">
                        {{ alReels[track.reelIndex]?.showreelName ?? $t('songs_table.unknown_name') }}
                    </div>
                    <div class="reels-other font-color-standard" v-if="alReels[track.reelIndex]?.composerName">
                        {{ alReels[track.reelIndex]?.composerName ?? $t('songs_table.unknown_artist') }}
                    </div>
                    <div class="reels-other font-color-standard"
                        v-for="artist in alReels[track.reelIndex]?.otherArtists" :key="artist">
                        <span>
                            {{ artist }}
                        </span>
                    </div>
                </div>
                <li :id="`track-item-${track.id}`" class="track-item" ref="track_item_ref"
                    :class="nowPlaying === track.id ? 'current_play_item' : ''" @mouseover="trackMouseEnter(track.id)"
                    @mouseleave="trackMouseLeave(track.id)" @dblclick="playSongAndPlaylist(track)"
                    @click="setFocused(track.id)" tabindex="0" @contextmenu="openContextMenu($event, track)">
                    <div class="align-up">
                        <!-- 4 左侧对齐 -->
                        <div class="align-left">
                            <!-- 5 歌曲序号 -->
                            <div class="track-count font-color-standard" v-if="showTrackCounter">
                                <span v-if="nowPlaying !== track.id">
                                    {{ (page.current - 1) * 500 + index + 1 }}
                                </span>
                                <YPlaying v-else />
                            </div>
                            <!-- 5 封面图片 -->
                            <div class="before-cover" style="min-width: 10px; height: 40px;" v-if="!showTrackCounter">
                            </div>
                            <img v-if="showTrackCover" class="track-cover"
                                :src="track._picUrl ? track._picUrl : track.al?.picUrl" alt="Cover Image" />
                            <!-- 5 歌曲信息 -->
                            <div class="track-info" ref="trackInfo">
                                <!-- 6 歌曲名称 -->
                                <div class="track-name" ref="track_name_ref"
                                    :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : 'var(--font-color-main)' }"
                                    :title="track.name + (track.tns ? ('\n' + track.tns) : '')" v-if="showTrackTitle">
                                    {{ track.name }}
                                    <span class="font-color-standard">
                                        {{ (track.tns ?
                                            (' (' + track.tns + ')') :
                                            '') }}
                                    </span>
                                </div>
                                <!-- 6 歌手名称 -->
                                <div class="track-artist font-color-standard" v-if="showTrackArtist">
                                    <span v-for="(artist, index) in track.ar" :key="artist.id">
                                        <!-- 7 歌手按钮 -->
                                        <span @click="handleArtistClick(artist.id)"
                                            :class="track.id === nowPlaying ? 'artist-button-active' : 'artist-button'"
                                            :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                            {{ artist.name }}
                                        </span>
                                        <span v-if="index < track.ar.length - 1"
                                            :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : 'var(--font-color-standard)' }">
                                            /
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <!-- 4 右侧对齐 -->
                        <div class="align-right">
                            <!-- 5 专辑名称 -->
                            <div class="track-menu" :id="`track-menu-${track.id}`">
                                <img src="@/assets/smalldownload.svg" class="track-menu-icon g-icon"
                                    :title="$t('context.download')">
                                <img src="@/assets/subscribe.svg" class="track-menu-icon g-icon"
                                    :title="$t('context.subscribe')" @click="openAddToPlaylist(track.id)">
                                <img src="@/assets/comment.svg" class="track-menu-icon g-icon"
                                    :title="$t('context.view_comment')" @click="openSongComment(track.id)">
                                <img src="@/assets/detail.svg" class="track-menu-icon g-icon"
                                    title="$t('songs_table.more')" @click="openContextMenu($event, track, 'toogle')">
                            </div>
                            <div class="track-album" ref="track_album_ref" v-if="showTrackAlbum"
                                :style="{ 'width': `${this.alWidth}px` }">
                                <!-- 6 专辑按钮 -->
                                <button @click="handleAlbumClick(track.al.id)" class="album-button font-color-standard"
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
                            <div class="track-duration font-color-standard" v-if="showTrackDuration">{{
                                formatDuration(track.dt) }}</div>
                            <!-- 5 热度 -->
                            <div class="popularity" v-if="showTrackPopularity">
                                <div class="popularity-bar"
                                    style="margin-left: 5px;width: 50px; height: 4px; background-color:rgba(var(--foreground-color-rgb), 0.321); border-radius: 2px;">
                                </div>
                                <div class="popularity-bar"
                                    style="margin-left: 5px; height: 4px; background-color: rgb(254, 60, 90); border-radius: 2px; transform: translateY(-4px);"
                                    :style="{ width: (track.pop / 100 * 50) + 'px' }">
                                </div>
                            </div>
                            <div class="listen-count" style="color: #bbb;" v-if="showListenCount">{{ track.playCount ??
                                0
                                }}次
                            </div>
                        </div>

                    </div>
                    <div class="align-down" v-if="showLyrics">
                        <div class="lyrics" style="color: #aaa; font-size: 14px; margin-top: 5px; margin-left: 50px;">
                            {{ $t('playui.lyric') }}:
                            <span v-for="(lyric, index) in track.lyrics" :key="index" v-html="formatLyric(lyric)">
                            </span>
                        </div>
                    </div>
                </li>
            </template>
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
import { Message } from '@/tools/YMessageC';
import { ref, watch } from 'vue';
import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg';
import updownArrow from '../assets/updown-arrow.svg';

export default {
    name: 'YSongsTable',
    setup(props) { // eslint-disable-line
        const tracks = ref(props.modelValue);
        watch(() => props.modelValue, (newValue) => {
            tracks.value = newValue;
        });
        return {
            tracks
        };
    },
    props: {
        modelValue: {
            type: Array,
            required: true,
            default: () => []
        },
        type: {
            type: String,
            default: 'playlist',
        },
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
        alReels: {
            type: Array,
            default: () => [],
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
                { icon: updownArrow, text: 'songs_table.sort.default', key: 'default' },
                { icon: upArrow, text: 'songs_table.sort.title_ascending', key: 'titleAsc' },
                { icon: downArrow, text: 'songs_table.sort.title_descending', key: 'titleDesc' },
                { icon: upArrow, text: 'songs_table.sort.artist_ascending', key: 'artistAsc' },
                { icon: downArrow, text: 'songs_table.sort.artist_descending', key: 'artistDesc' },
            ],
            // 专辑栏的排序状态
            sortingStates_Album: [
                { icon: updownArrow, text: 'songs_table.sort.default', key: 'default' },
                { icon: upArrow, text: 'songs_table.sort.album_ascending', key: 'albumAsc' },
                { icon: downArrow, text: 'songs_table.sort.album_descending', key: 'albumDesc' },
            ],
            // 时长栏的排序状态
            sortingStates_Duration: [
                { icon: updownArrow, text: 'songs_table.sort.duration_default', key: 'default' },
                { icon: upArrow, text: 'songs_table.sort.duration_default', key: 'albumAsc' },
                { icon: downArrow, text: 'songs_table.sort.duration_default', key: 'albumDesc' },
            ],
            currentSortingIndex: 0, // 标题栏当前排序状态的索引
            currentSortingIndex_Album: 0, // 专辑栏当前排序状态的索引
            currentSortingIndex_Duration: 0,    // 时长栏当前排序状态的索引
            alWidth: 230,
            page: new YPageC(),
            nowPlaying: 0,
        }
    },
    async mounted() {
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
    beforeUnmount() {
        this.player.UnSubscribe({
            id: this.id,
            type: 'track',
        });
    },
    watch: {
        tracks(newVal) {
            this.alWidth = this.setting.display.albumWidth;
            this.page = new YPageC(Math.ceil(newVal.length / this.limit));
        },
    },
    methods: {
        sendPlaylist() {
            if (!this.localPlay) {
                this.$emit('send-playlist');
            } else {
                this.player.playlist = this.tracks;
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
                this.player.playlist = this.tracks;
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
                    this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'titleAsc':
                    console.log('按标题升序排序');
                    // 处理按标题升序排序逻辑
                    this.tracks.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'titleDesc':
                    console.log('按标题降序排序');
                    // 处理按标题降序排序逻辑
                    this.tracks.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'artistAsc':
                    console.log('按歌手升序排序');
                    // 处理按歌手升序排序逻辑
                    this.tracks.sort((a, b) => a.ar[0].name.localeCompare(b.ar[0].name));
                    break;
                case 'artistDesc':
                    console.log('按歌手降序排序');
                    // 处理按歌手降序排序逻辑
                    this.tracks.sort((a, b) => b.ar[0].name.localeCompare(a.ar[0].name));
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
                    this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按专辑升序排序');
                    // 处理按专辑升序排序逻辑
                    this.tracks.sort((a, b) => a.al.name.localeCompare(b.al.name));
                    break;
                case 'albumDesc':
                    console.log('按专辑降序排序');
                    // 处理按专辑降序排序逻辑
                    this.tracks.sort((a, b) => b.al.name.localeCompare(a.al.name));
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
                    this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按时间升序排序');
                    // 处理按时间升序排序逻辑
                    this.tracks.sort((a, b) => parseFloat(a.dt) - parseFloat(b.dt));
                    break;
                case 'albumDesc':
                    console.log('按时间降序排序');
                    // 处理按时间降序排序逻辑
                    this.tracks.sort((a, b) => parseFloat(b.dt) - parseFloat(a.dt));
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
            if (dom) {
                dom.style.display = 'flex';
            }
        },
        trackMouseLeave(id) {
            // console.log('trackMouseLeave', id);
            let dom = this.$refs.main?.querySelector(`#track-menu-${id}`);
            if (dom) {
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
        scrollToCurrentTrack() {
            if (!this.player.currentTrack) {
                return;
            }
            let currentTrackIndex = null;
            const currentTrack = this.tracks.find((track, index) => {
                if (track.id === this.player.currentTrack.id) {
                    currentTrackIndex = index;
                    return true;
                }
            });
            console.log('currentTrackIndex', currentTrackIndex);
            if (currentTrack && currentTrackIndex) {
                if (Math.floor(currentTrackIndex / this.limit) + 1 !== this.page.current) {
                    this.page.current = Math.floor(currentTrackIndex / this.limit) + 1;
                }
                this.$nextTick(() => {
                    const rowElement = this.$refs.main.querySelector('.current_play_item');
                    if (rowElement) {
                        rowElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                        Message.post('success', this.$t('message.playlist_view.scrolled_to_current_track'));
                    }
                })
            }
        },
    },
}


</script>

<style lang="scss" scoped>
.table-container {
    display: flex;
    max-width: 100vw;
    flex-direction: column;

    .table-header {
        display: flex;
        // position: sticky;
        top: 0;
        z-index: 1;
        justify-content: space-between;
        backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        .header-button {
            padding-top: 5px;
            padding-bottom: 5px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--font-color-standard);
            text-align: left;
            width: 100%;
            border-radius: 5px;

            &:hover {
                background-color: rgba(var(--foreground-color-rgb), 0.05);
            }
        }

        .songsCounter {
            width: 50px;

            .header-button:hover {
                cursor: initial;
                background-color: transparent;
            }
        }

        .songsName {
            flex: 1;
            text-align: left;
        }
    }
}

.resizer {
    width: 5px;
    cursor: ew-resize;
    background-color: transparent;
    top: 0;
    right: 0;
    bottom: 0;
}

.songsAlbum {
    padding-right: 10px;
    text-align: left;
}

.likes {
    width: 60px;

    .header-button:hover {
        cursor: initial;
        background-color: transparent;
    }
}

.popularity {
    width: 60px;
}

.listen-count {
    width: 80px;
}

.songsDuration {
    width: 80px;
    text-align: left;
}


.header-counter {
    text-align: center !important;
}

.sort-content {
    position: relative;
    display: inline-block;
    padding: 0;
    background-color: transparent;
    border: none;
    opacity: 0;

    .header-button:hover & {
        opacity: 1;
    }

    .sort-icon {
        opacity: 0.6;
        width: 10px;
        height: 10px;
        margin-left: 5px;
    }
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 5px 0 0 0;

    li {
        margin-bottom: 5px;
    }
}

.reels {
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;
    padding: 00px 0px 05px 20px;

    &:not(:first-child) {
        padding-top: 20px;
    }

    .reels-title {
        font-size: 17px;
        padding: 0px 0px 5px 0px;
    }

    .reels-other {
        font-size: 15px;
        padding: 0px 0px 5px 0px;
    }
}

.track-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin: 0px;
    padding: 7px 0px 7px 0px;
    border-radius: 10px;

    &:hover {
        background-color: rgba(var(--foreground-color-rgb), 0.1);
    }

    &:focus {
        background-color: rgba(var(--foreground-color-rgb), 0.1);
    }

    .align-up {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .align-left {
            display: flex;
            margin-right: 10px;
            flex: 1;
            align-items: center;
            overflow: hidden;

            .track-count {
                flex: 0 0 auto;
                width: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .track-cover {
                width: 40px;
                height: 40px;
                border-radius: 5px;
                user-select: none;
                -webkit-user-drag: none;
            }

            .track-info {
                display: flex;
                flex-direction: column;
                margin-left: 10px;
                min-width: 0;
                text-align: left;

                .track-name {
                    text-align: left;
                    margin-bottom: 3px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 15px;
                }

                .track-artist {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: left;

                    .artist-button {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-size: 13px;
                        padding: 0%;
                        margin: 0%;
                        cursor: pointer;
                        background-color: transparent;
                        border: none;
                        transition: all 0.3s;

                        &:hover {
                            color: var(--font-color-main);
                        }
                    }

                    .artist-button-active {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-size: 13px;
                        padding: 0%;
                        margin: 0%;
                        cursor: pointer;
                        background-color: transparent;
                        border: none;
                        color: rgb(234, 78, 68);

                        &:hover {
                            color: rgb(255, 100, 90)
                        }
                    }
                }
            }
        }

        .align-right {
            display: flex;
            align-items: center;

            .track-menu {
                display: none;
                align-items: center;
                justify-content: center;
                width: 130px;
                padding-right: 10px;

                .track-menu-icon {
                    width: 24px;
                    height: 24px;
                    opacity: .6;
                    margin: 0px 5px;
                    cursor: pointer;

                    &:hover {
                        opacity: 1;
                    }
                }
            }

            .track-album {
                padding-right: 10px;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                .album-button {
                    max-width: 80%;
                    padding: 0%;
                    margin: 0%;
                    font-size: 14px;
                    cursor: pointer;
                    background-color: transparent;
                    border: none;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    &:hover {
                        color: var(--font-color-main);
                    }
                }
            }

            .track-duration {
                width: 80px;
                text-align: left;
                font-size: 14px;
            }
        }

    }

    .align-down {
        display: flex;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        justify-content: space-between;

        .lyrics {
            width: 100%;
            text-align: left;
            max-height: 5em;
            white-space: pre-wrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>