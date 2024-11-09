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
            <div class="songsName" v-if="showTrackTitle">
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
            <div class="songsAlbum" ref="songs_album_ref" v-if="showTrackAlbum" :style="{ 'width': `${alWidth}px` }">
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
        <ul ref="UL">
            <template v-for="(track, index) in tracks.slice((page.current - 1) * limit, page.current * limit)">
                <div class="reels" v-if="track.songInReelIndex === 0 && type === 'album' && alReels.length > 0">
                    <div class="reels-title font-color-main">
                        {{ alReels[track.reelIndex]?.showreelName ?? $t('songs_table.unknown_name') }}
                    </div>
                    <div class="reels-other font-color-standard" v-if="alReels[track.reelIndex]?.composerName">
                        {{ alReels[track.reelIndex]?.composerName ?? $t('songs_table.unknown_artist') }}
                    </div>
                    <div class="reels-other font-color-standard"
                        v-for="artist in alReels[track.reelIndex]?.otherArtists">
                        <span>
                            {{ artist }}
                        </span>
                    </div>
                </div>
                <li :id="`track-item-${track.id}`" class="track-item"
                    :class="nowPlaying === track.id ? 'current_play_item' : ''">
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
                                :src="track._picUrl ? track._picUrl : track.al?.picUrl" />
                            <!-- 5 歌曲信息 -->
                            <div class="track-info">
                                <!-- 6 歌曲名称 -->
                                <div class="track-name"
                                    :style="{ color: track.id === nowPlaying ? 'rgb(234,78,68)' : 'var(--font-color-main)' }"
                                    :title="track.name + (track.tns ? ('\n' + track.tns) : '')" v-if="showTrackTitle">
                                    {{ type === 'album' ? track.reelName ?? track.name : track.name }}
                                    <span class="font-color-standard">
                                        {{ (track.tns ?
                                            (' (' + track.tns + ')') :
                                            '') }}
                                    </span>
                                </div>
                                <!-- 6 歌手名称 -->
                                <div class="track-artist font-color-standard" v-if="showTrackArtist">
                                    <img src="@/assets/success.svg" class="track-artist-download-icon"
                                        v-if="downloadedSongIds.includes(track.id)">
                                    <span v-for="(artist, index) in track.ar">
                                        <!-- 7 歌手按钮 -->
                                        <span class="ul-button" :id="`artist-${artist.id}`"
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
                            <div class="track-menu" :id="`track-menu-${track.id}`">
                                <img src="@/assets/smalldownload.svg" class="track-menu-icon g-icon ul-button"
                                    id="download" :title="$t('context.download')"
                                    v-if="!downloadedSongIds.includes(track.id)">
                                <img src="@/assets/subscribe.svg" class="track-menu-icon g-icon ul-button"
                                    id="subscribe" :title="$t('context.subscribe')">
                                <img src="@/assets/comment.svg" class="track-menu-icon g-icon ul-button" id="comment"
                                    :title="$t('context.view_comment')">
                                <img src="@/assets/detail.svg" class="track-menu-icon g-icon ul-button" id="detail"
                                    :title="$t('songs_table.more')">
                            </div>
                            <!-- 5 专辑名称 -->
                            <div class="track-album track-album-ref" v-if="showTrackAlbum"
                                :style="{ 'width': `${alWidth}px` }">
                                <!-- 6 专辑按钮 -->
                                <button class="album-button font-color-standard ul-button" :id="`album-${track.al.id}`"
                                    :title="track.al.name + (track.al.tns ? ('\n' + track.al.tns) : '')">
                                    {{ trackAlTns(track.al.name, track.al.tns) }}
                                </button>
                            </div>
                            <!-- 5 喜欢 -->
                            <div class="likes" style="text-align: left;" v-if="showTrackLikes">
                                <img v-if="id === 'YPlaybar.vue'" src="../assets/delete.svg"
                                    class="g-icon like-icon delete-icon ul-button" :id="`track-menu-${track.id}`"
                                    :title="$t('playbar.delete_from_playlist')">
                                <div :id="`track-menu-2-${track.id}`" style="display: block;">
                                    <img v-if="likelist.includes(track.id)" src="../assets/likes.svg"
                                        style="width: 16.8px; height: 16.8px; padding-left:10px;    -webkit-user-drag: none; " />
                                    <img v-else src="../assets/unlikes.svg"
                                        style="width: 16.8px; height: 16.8px; padding-left:10px; opacity: 0.7;" />

                                </div>
                            </div>
                            <!-- 5 时长 -->
                            <div class="track-duration font-color-standard" v-if="showTrackDuration">{{
                                formatDuration(track.dt) }}</div>
                            <!-- 5 热度 -->
                            <div class="popularity" v-if="showTrackPopularity">
                                <div class="popularity-bar"
                                    style="margin-left: 5px;width: 50px; height: 4px; background-color:rgba(var(--foreground-color-rgb), 0.321); border-radius: 2px;">
                                </div>
                                <div class="popularity-bar" style="margin-left: 5px; height: 4px; background-color: rgb(var(--highlight-color-rgb));
 border-radius: 2px; transform: translateY(-4px);" :style="{ width: (track.pop / 100 * 50) + 'px' }">
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

<script lang="ts">
import { formatDuration_mmss } from '@/utils/time';
import { useStore } from 'vuex';
import YPlaying from './YPlaying.vue';
import YPage from './YPage.vue';
import { YPageC } from '@/dual/YPageC';
import { Message } from '@/dual/YMessageC';
import { ref, watch, defineComponent, toRaw } from 'vue';
import { useApi } from '@/utils/api';
import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg';
import updownArrow from '../assets/updown-arrow.svg';
import { isLocal } from '@/utils/localTracks_renderer';
import { ITrack } from '@/utils/tracks';

type AlReels = {
    showreelName: string;
    composerName: string;
    otherArtists: string[];
}

export default defineComponent({
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
            type: Array as () => AlReels[],
            default: () => [],
        },
    },
    name: 'YSongsTable',
    setup(props: { modelValue: Array<any> }) {
        const tracks = ref<Array<ITrack>>(props.modelValue);
        watch(() => props.modelValue, (newValue) => {
            tracks.value = newValue;
        });

        const main = ref<HTMLElement | null>(null);
        const songs_album_ref = ref<HTMLElement | null>(null);
        const UL = ref<HTMLElement | null>(null);

        const store = useStore();

        return {
            tracks,
            songs_album_ref,
            main,
            download: store.state.download,
            player: store.state.player,
            login: store.state.login,
            setting: store.state.setting,
            UL,
        };
    },
    components: {
        YPlaying,
        YPage,
    },
    emits: [
        'update:modelValue',
        'update-display',
        'play-song-and-playlist',
    ],
    computed: {
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
            page: new YPageC(Math.ceil(this.tracks.length / this.limit) || 1),
            nowPlaying: 0,
            downloadedSongIds: [] as any[],
            hoverTrackId: 0,
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
        this.player.subscriber.on({
            id: this.id,
            type: 'track',
            func: () => {
                this.nowPlaying = this.player.currentTrack?.id ?? 0;
            }
        })
        this.downloadedSongIds = this.download.downloadedSongIds;
        this.download.subscriber.on({
            id: this.id,
            type: 'downloaded-songs',
            func: () => {
                this.downloadedSongIds = this.download.downloadedSongIds;
            }
        })
        this.UL?.addEventListener('mousemove', this.handleUlMouseMove);
        this.UL?.addEventListener('mouseleave', this.handleUlMouseLeave);
        this.UL?.addEventListener('dblclick', this.handleUlDbClick);
        this.UL?.addEventListener('click', this.handleUlClick);
        this.UL?.addEventListener('contextmenu', this.handleUlContext);
    },
    beforeUnmount() {
        this.player.subscriber.offAll(this.id);
        this.download.subscriber.offAll(this.id);
        this.UL?.removeEventListener('mousemove', this.handleUlMouseMove);
        this.UL?.removeEventListener('mouseleave', this.handleUlMouseLeave);
        this.UL?.removeEventListener('dblclick', this.handleUlDbClick);
        this.UL?.removeEventListener('click', this.handleUlClick);
        this.UL?.removeEventListener('contextmenu', this.handleUlContext);
        console.log('YSongsTable Unmounted, Cleaned EventListener');
        // 清空引用
        this.main = null;
        this.songs_album_ref = null;
        // this.track_album_ref = null;
        this.UL = null;
        window.removeEventListener('mousemove', this.resize);
    },
    watch: {
        tracks(newVal, oldVal) {
            this.alWidth = this.setting.display.albumWidth;
            this.page = new YPageC(Math.ceil(newVal.length / this.limit) || 1);
        },
    },
    methods: {
        isLocal(id: number | string) {
            return isLocal(id);
        },
        async playSongAndPlaylist(track: any) {
            console.log('Play Song And Playlist:', track.id);
            if (!this.canSendPlaylist || this.setting.play.dbclick === 'single') {
                await this.player.playTrack(track);
            } else {
                this.player.playlist = this.tracks.slice();
                await this.player.playTrack(track);
            }
        },
        formatDuration(duration: number) {
            return formatDuration_mmss(duration);
        },
        // 开始resize
        startResize(event: MouseEvent) {
            // 记录初始鼠标位置和专辑宽度
            this.initialMouseX = event.clientX;
            this.initialAlbumWidth = this.songs_album_ref?.offsetWidth ?? 0;

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
        resize(event: MouseEvent) {
            // 计算鼠标移动距离
            this.deltaX = event.clientX - this.initialMouseX;
            // 计算新的专辑宽度
            if (this.initialAlbumWidth - this.deltaX > 200 && this.initialAlbumWidth - this.deltaX < 400) {
                this.newWidth = this.initialAlbumWidth - this.deltaX;
            }
            // 设置专辑宽度
            if (this.songs_album_ref && this.newWidth > 200 && this.newWidth < 400) {
                this.songs_album_ref.style.width = `${this.newWidth}px`;
            }

        },
        setAlbumWidth(width: number) {
            if (this.songs_album_ref) {
                this.songs_album_ref.style.width = `${width}px`;
            }
            this.resizeByNewWidth(width);
        },
        // 根据新的专辑宽度调整歌曲名称和专辑的宽度
        resizeByNewWidth(newWidth: number) {
            let track_albums: NodeListOf<Element> | null = document.querySelectorAll('.track-album-ref');
            track_albums.forEach(element => {
                if (element) { // 确保元素存在
                    (element as HTMLElement).style.width = `${newWidth}px`;
                }
            });
            track_albums = null;
        },
        // 停止resize
        stopResize() {
            // 移除鼠标移动和松开监听
            window.removeEventListener('mousemove', this.resize);
            window.removeEventListener('mouseup', this.stopResize);
        },
        // 处理歌手点击
        handleArtistClick(artistId: number | string) {
            if (!artistId || isLocal(artistId)) return;
            this.$router.push(`/artist/${artistId}`);
            console.log('Open Artist with ID:', artistId);
        },
        // 处理专辑点击
        handleAlbumClick(albumId: number | string) {
            if (!albumId || isLocal(albumId)) return;
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
        sortTracks(sortKey: string) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.tracks.sort((a: any, b: any) => a.originalIndex - b.originalIndex);
                    break;
                case 'titleAsc':
                    console.log('按标题升序排序');
                    // 处理按标题升序排序逻辑
                    this.tracks.sort((a: any, b: any) => a.name.localeCompare(b.name));
                    break;
                case 'titleDesc':
                    console.log('按标题降序排序');
                    // 处理按标题降序排序逻辑
                    this.tracks.sort((a: any, b: any) => b.name.localeCompare(a.name));
                    break;
                case 'artistAsc':
                    console.log('按歌手升序排序');
                    // 处理按歌手升序排序逻辑
                    this.tracks.sort((a: any, b: any) => a.ar[0].name.localeCompare(b.ar[0].name));
                    break;
                case 'artistDesc':
                    console.log('按歌手降序排序');
                    // 处理按歌手降序排序逻辑
                    this.tracks.sort((a: any, b: any) => b.ar[0].name.localeCompare(a.ar[0].name));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        // 专辑排序
        sortTracks_Album(sortKey: string) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.tracks.sort((a: any, b: any) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按专辑升序排序');
                    // 处理按专辑升序排序逻辑
                    this.tracks.sort((a: any, b: any) => a.al.name.localeCompare(b.al.name));
                    break;
                case 'albumDesc':
                    console.log('按专辑降序排序');
                    // 处理按专辑降序排序逻辑
                    this.tracks.sort((a: any, b: any) => b.al.name.localeCompare(a.al.name));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        // 时长排序
        sortTracks_Duration(sortKey: string) {
            // 根据不同的排序 key 进行排序操作
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.tracks.sort((a: any, b: any) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按时间升序排序');
                    // 处理按时间升序排序逻辑
                    this.tracks.sort((a: any, b: any) => parseFloat(a.dt) - parseFloat(b.dt));
                    break;
                case 'albumDesc':
                    console.log('按时间降序排序');
                    // 处理按时间降序排序逻辑
                    this.tracks.sort((a: any, b: any) => parseFloat(b.dt) - parseFloat(a.dt));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        formatLyric(lyric: string) {
            return '   ' + lyric + '   ';
        },
        getClosestTrackItem(element: HTMLElement) {
            return element.closest('.track-item') as HTMLElement;
        },
        handleUlContext(event: MouseEvent) {
            const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
            if (!trackItem) return;

            let trackId_ = trackItem.id.replace('track-item-', '');
            let trackId = parseInt(trackId_, 10);

            // 查找对应的 track 对象
            const track = this.tracks.find(t => t.id === trackId);

            if (track) this.openContextMenu(event, track);
        },
        handleUlClick(event: MouseEvent) {
            const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
            if (!trackItem) return;

            let trackId_ = trackItem.id.replace('track-item-', '');
            let trackId = parseInt(trackId_, 10);
            if (trackId) this.setFocused(trackId);

            const button = (event.target as HTMLElement).closest('.ul-button');
            if (!button) return;
            const buttonId = button.id;

            if (buttonId.includes('artist-')) {
                const artistId = parseInt(buttonId.replace('artist-', ''), 10);
                if (artistId) this.handleArtistClick(artistId);
            } else if (buttonId.includes('album-')) {
                const albumId = parseInt(buttonId.replace('album-', ''), 10);
                if (albumId) this.handleAlbumClick(albumId);
            } else if (buttonId.includes('download')) {
                const track = this.tracks.find(t => t.id === trackId);
                if (track) this.downloadSong(toRaw(track));
            } else if (buttonId.includes('comment')) {
                this.openSongComment(trackId);
            } else if (buttonId.includes('subscribe')) {
                this.openAddToPlaylist(trackId);
            } else if (buttonId.includes('detail')) {
                const track = this.tracks.find(t => t.id === trackId)
                this.openContextMenu(event, toRaw(track), 'toogle');
            } else if (buttonId.includes('track-menu-')) {
                const trackId = parseInt(buttonId.replace('track-menu-', ''), 10);
                this.deletaFromPlaylist(trackId);
            }
        },
        handleUlDbClick(event: MouseEvent) {
            const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
            if (!trackItem) return;

            let trackId_ = trackItem.id.replace('track-item-', '');
            let trackId = parseInt(trackId_, 10);

            // 查找对应的 track 对象
            const track = this.tracks.find(t => t.id === trackId);

            if (track) this.playSongAndPlaylist(track);
        },
        handleUlMouseMove(event: MouseEvent) {
            const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
            if (!trackItem) return;

            let trackId_ = trackItem.id.replace('track-item-', '');
            let trackId = parseInt(trackId_, 10);
            if (trackId === this.hoverTrackId) return; // 避免重复触发

            // 查找对应的 track 对象
            const track = this.tracks.find(t => t.id === trackId);

            if (track) this.trackMouseEnter(track.id);
        },
        handleUlMouseLeave() {
            this.trackMouseLeave(this.hoverTrackId);
        },
        trackMouseEnter(id: number) {
            this.trackMouseLeave(this.hoverTrackId);
            let dom = this.main?.querySelector(`#track-menu-${id}`) as HTMLElement;
            if (dom) dom.style.display = 'flex';

            this.hoverTrackId = id;
            if (this.id !== 'YPlaybar.vue') return;

            let domToBeHidden = this.main?.querySelector(`#track-menu-2-${id}`) as HTMLElement;
            if (domToBeHidden) domToBeHidden.style.display = 'none';

        },
        trackMouseLeave(id: number) {
            let dom = this.main?.querySelector(`#track-menu-${id}`) as HTMLElement;
            if (dom) dom.style.display = 'none';

            if (this.id !== 'YPlaybar.vue') return;

            let domToBeShown = this.main?.querySelector(`#track-menu-2-${id}`) as HTMLElement;
            if (domToBeShown) domToBeShown.style.display = 'block';
        },
        trackAlTns(name: string, tns: string | string[]) {
            let result = name;
            if (tns?.length > 0) {
                result += ' (' + tns + ')';
            }
            return result;
        },
        setFocused(id: number | string) {
            let dom = this.main?.querySelector(`#track-item-${id}`);
            if (dom) {
                dom?.classList.add('focused');
            }
        },
        openSongComment(id: number | string) {
            if (!id || isLocal(id)) return;
            this.$router.push(`/comment/song/${id}`);
        },
        openContextMenu(event: any, track: any, type = 'show') {
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
        openAddToPlaylist(id: number | string) {
            if (!id || isLocal(id)) return;
            window.postMessage({
                type: 'song-open-add-to-playlist',
                data: {
                    ids: [id],
                },
            });
            console.log('Open Add To Playlist:', id);
            // 在HomeView中处理
        },
        scrollToCurrentTrack(smooth = true) {
            if (!this.player.currentTrack) {
                return;
            }
            let currentTrackIndex = null;
            const currentTrack = this.tracks.find((track: any, index: number) => {
                if (track.id === this.player.currentTrack.id) {
                    currentTrackIndex = index;
                    return true;
                }
            });
            if (currentTrack && (currentTrackIndex ?? -1) >= 0 && typeof currentTrackIndex === 'number') {
                if (Math.floor(currentTrackIndex / this.limit) + 1 !== this.page.current) {
                    this.page.current = Math.floor(currentTrackIndex / this.limit) + 1;
                }
                this.$nextTick(() => {
                    let rowElement = this.main?.querySelector('.current_play_item');
                    if (rowElement) {
                        rowElement.scrollIntoView({
                            behavior: smooth ? 'smooth' : 'auto',
                            block: 'center',
                        });
                        Message.post('success', this.$t('message.playlist_view.scrolled_to_current_track'));
                    }
                    rowElement = null;
                })
            }
        },
        async downloadSong(track: any) {
            if (!track.id || isLocal(track.id)) return;
            const url = await useApi('/song/url/v1', {
                id: track.id,
                level: this.setting.download.quality,
                cookie: this.login.cookie ?? undefined,
            }).then((res) => res.data[0].url).catch((err) => {
                console.error(err);
                return '';
            });
            this.download.add(url, track, this.setting.download.path);
        },
        deletaFromPlaylist(id: number | string) {
            // if (!id || isLocal(id)) return;
            if (this.id !== 'YPlaybar.vue') {
                return;
            }
            this.tracks = this.tracks.filter((track: any) => track.id !== id);
            this.player.deleteTrack(id);
        },
    },
})


</script>

<style src="./YSongsTable.scss" lang="scss" scoped></style>