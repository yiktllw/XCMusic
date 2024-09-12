<template>
    <!-- 0 播放栏 -->
    <div class="playbar">
        <!-- 1 左侧 -->
        <div class="align-left">
            <!-- 2 播放信息 -->
            <div class="play-info">
                <!-- 3 封面 -->
                <img class="img-cover img" :src="this.player.currentTrackCover ?? require('../assets/song.svg')">
                <!-- 4 播放信息文本 -->
                <div class="play-info-text">
                    <!-- 5 播放信息文本:标题 -->
                    <div class="play-info-text-title">
                        {{ this.player.currentTrackName }}
                    </div>
                    <!-- 5 播放信息文本:艺术家 -->
                    <div class="play-info-text-artist">
                        <span v-for="(artist, index) in this.player.currentTrackArtists" :key="artist.id">
                            <span @click="handleArtistClick(artist.id)" class="artist-button"
                                :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                {{ artist.name }}
                            </span>
                            <span v-if="index < this.player.currentTrackArtists.length - 1"> /&nbsp; </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 1 中间 -->
        <div class="align-center">
            <!-- 2 控制按钮 -->
            <div class="buttons">
                <!-- 3 喜欢按钮 -->
                <button class="button like-button" @click="_toogleLike(likelist.includes(this.player.currentTrack?.id))">
                    <img class="img-like img" src="../assets/likes.svg"
                        v-if="likelist.includes(this.player.currentTrack?.id)" title="取消喜欢">
                    <img v-else class="img-like img" src="../assets/unlikes.svg" title="喜欢">
                </button>
                <!-- 3 上一首按钮 -->
                <button class="button previous-button" @click="goTo('backwards')" title="上一首">
                    <img class="img-previous img" src="../assets/previous.svg">
                </button>
                <!-- 3 播放/暂停按钮 -->
                <button class="button play-button" @click="tooglePlayState" :title="playState === 'pause' ? '播放' : '暂停'">
                    <img v-if="playState === 'pause'" class="img-play img" src="../assets/play.svg">
                    <img v-if="playState === 'play'" class="img-pause img" src="../assets/pause.svg">
                </button>
                <!-- 3 下一首按钮 -->
                <button class="button next-button" @click="goTo('forward')" title="下一首">
                    <img class="img-next img" src="../assets/next.svg">
                </button>
                <!-- 3 播放模式按钮 -->
                <button class="button playMode-button" @click="this.$refs.play_mode_panel.tooglePanel()"
                    ref="play_mode_panel_trigger">
                    <img v-if="playMode === 'order'" class="img-order img" src="../assets/order.svg" title="顺序播放">
                    <img v-if="playMode === 'listloop'" class="img-listloop img" src="../assets/listloop.svg" title="列表循环">
                    <img v-if="playMode === 'random'" class="img-random img" src="../assets/random.svg" title="随机播放">
                    <img v-if="playMode === 'listrandom'" class="img-random img" src="../assets/listrandom.svg" title="列表随机"
                        style="opacity: 1;">
                    <img v-if="playMode === 'loop'" class="img-loop img" src="../assets/loop.svg" title="单曲循环">
                </button>
                <YPanel :default-show="false" ref="play_mode_panel" :trigger="this.$refs.play_mode_panel_trigger"
                    :slide-direction="5">
                    <div class="playMode-switcher">
                        <div class="playMode-item"
                            @click="tooglePlayMode('order'); this.$refs.play_mode_panel.tooglePanel()">
                            <img class="img-order img playMode-img" src="../assets/order.svg">顺序播放
                        </div>
                        <div class="playMode-item"
                            @click="tooglePlayMode('listloop'); this.$refs.play_mode_panel.tooglePanel()">
                            <img class="img-listloop img playMode-img" src="../assets/listloop.svg">列表循环
                        </div>
                        <div class="playMode-item"
                            @click="tooglePlayMode('random'); this.$refs.play_mode_panel.tooglePanel()">
                            <img class="img-random img playMode-img" src="../assets/random.svg">随机播放
                        </div>
                        <div class="playMode-item"
                            @click="tooglePlayMode('listrandom'); this.$refs.play_mode_panel.tooglePanel()">
                            <img class="img-random img playMode-img" src="../assets/listrandom.svg">列表随机
                        </div>
                        <div class="playMode-item"
                            @click="tooglePlayMode('loop'); this.$refs.play_mode_panel.tooglePanel()">
                            <img class="img-loop img playMode-img" src="../assets/loop.svg">单曲循环
                        </div>
                    </div>
                </YPanel>
            </div>
            <!-- 2 进度条 -->
            <div class="progress">
                <!-- 3 自定义进度条 -->
                <div class="time">
                    {{ this.player.currentTime ? formatDuration(this.player.currentTime) : '00:00' }}
                </div>
                <YProgressBar v-model="this.player.progress" style="height:20px;width: 321px"
                    @update:model-value="setAudioProgress" />
                <div class="time">
                    {{ formatDuration(this.duration) }}
                </div>
            </div>
        </div>
        <!-- 1 右侧 -->
        <div class="align-right">
            <div class="buttons" style="margin-right: 10px;">
                <div class="quality-button" ref="quality_panel_trigger" @click="this.$refs.quality_panel.tooglePanel()"
                    title="选择音质">
                    {{ this.player.qualityDisplay }}
                </div>
                <YPanel ref="quality_panel" :trigger="this.$refs.quality_panel_trigger" :slide-direction="4"
                    :default-show="false">
                    <div class="quality-panel">
                        <div class="quality-title">
                            歌曲音质
                        </div>
                        <div class="quality-switcher">
                            <div class="quality-item" v-for="quality in qualityGroup" :key="quality.id"
                                @click="setQuality(quality.name)" :style="{ 'opacity': quality.available ? 1 : .4 }">
                                <div class="quality-item-title">
                                    {{ quality.display }}
                                </div>
                                <div class="quality-item-desc">
                                    {{ quality.size + ' ' + quality.desc }}
                                </div>
                            </div>
                        </div>
                    </div>
                </YPanel>
                <img class="img" src="../assets/volume.svg"
                    style="width: 22px; height: 22px;margin-right:10px; cursor: pointer; opacity: 0.9;" title="音量"
                    ref="volume_panel_trigger" @click="this.$refs.volume_panel.tooglePanel()">
                <YPanel ref="volume_panel" :trigger="this.$refs.volume_panel_trigger" :slide-direction="5">
                    <div class="volume-container">
                        <YProgressBarV v-model="this.player.volume"
                            style="height: 120px;width: 20px;position: absolute; bottom: 30px;"
                            @set-progress-end="this.updateVolumeInSetting" />
                        <div class="volume-text">
                            {{ Math.round(this.player.volume * 100) + '%' }}
                        </div>
                    </div>
                </YPanel>
                <img class="img" src="../assets/playlist.svg"
                    style="width: 20px; height: 20px; margin-left:10px; cursor: pointer; opacity: 0.8;"
                    @click="this.$refs.playlist_panel.tooglePanel" title="播放列表" ref="playlist_panel_trigger">
                <YPanel ref="playlist_panel" :trigger="this.$refs.playlist_panel_trigger" :slide-direction="4"
                    :default-show="false">
                    <div class="playlist-container">
                        <div class="playlist-title">
                            <div class="title-left">
                                <span>播放列表</span>
                                <div class="songs-count"
                                    style="color:#fff; margin:0;padding:0 20px 0px 5px;font-size: 13px; font-weight: bold;">
                                    {{ playlist.length }}
                                </div>
                            </div>
                            <div class="title-right">
                                <span @click="this.player.clearPlaylist()" style="cursor: pointer;">
                                    <img src="../assets/delete.svg"
                                        style="width: 20px; height: 20px;margin-right: 8px; opacity: .8;" title="清空播放列表">
                                </span>
                            </div>
                        </div>
                        <div class="playlist-header">
                            <div class="playlist-header-item">标题</div>
                            <div class="playlist-header-item">喜欢</div>
                        </div>
                        <div class="scrollable">
                            <YSongsTable class="songs-table" :tracks="this.playlist" :showTrackCounter="false"
                                :showTrackAlbum="false" :showTrackDuration="false" :showTrackPopularity="false"
                                :showHeader="false" :resortable="false" :canSendPlaylist="false"
                                :limit="500" />
                        </div>
                    </div>
                </YPanel>
            </div>
        </div>
    </div>
</template>

<script lang="js">
import { toogleLike } from '@/ncm/api';
import { mapState } from 'vuex';
import YSongsTable from './YSongsTable.vue';
import YPanel from './YPanel.vue';
import YProgressBar from './YProgressBar.vue';
import YProgressBarV from './YProgressBarV.vue';

export default {
    name: 'YPlaybar',
    components: {
        YSongsTable,
        YPanel,
        YProgressBar,
        YProgressBarV,
    },
    data() {
        return {
            qualityGroup: [
                {
                    name: 'jymaster',
                    display: '超清母带(Master)',
                    id: 0,
                    desc: '还原音频细节，192kHz/24bit',
                    available: false,
                    size: '',
                },
                {
                    name: 'sky',
                    display: '沉浸环绕声(Surround Audio)',
                    id: 1,
                    desc: '沉浸式体验，最高5.1声道',
                    available: false,
                    size: '',
                },
                {
                    name: 'jyeffect',
                    display: '高清环绕声(Spatial Audio)',
                    id: 2,
                    desc: '环绕声体验，声音听感增强，96kHz/24bit',
                    available: false,
                    size: '',
                },
                {
                    name: 'hires',
                    display: '高解析度无损(Hi-Res)',
                    id: 3,
                    desc: '更饱满清晰的高解析度音质，最高192kHz/24bit',
                    available: false,
                    size: '',
                },
                {
                    name: 'lossless',
                    display: '无损(SQ)',
                    id: 4,
                    desc: '高保真无损音质，最高48kHz/16bit',
                    available: false,
                    size: '',
                },
                {
                    name: 'exhigh',
                    display: '极高(HQ)',
                    id: 5,
                    desc: '近CD品质的细节体验，最高320kbps',
                    available: false,
                    size: '',
                },
                {
                    name: 'standard',
                    display: '标准',
                    id: 7,
                    desc: '128kbps',
                    available: false,
                    size: '',
                }
            ],
        }
    },
    computed: {
        ...mapState({
            player: state => state.player,
            login: state => state.login,
            setting: state => state.setting,
        }),
        likelist() {
            return this.login.likelist ?? [];
        },
        playState() {
            return this.player.playState;
        },
        playMode() {
            return this.player.mode;
        },
        playlist() {
            return this.player.playlist;
        },
        playlistId() {
            return this.player.playlistId;
        },
        playlistIndex() {
            return this.player.playlistIndex;
        },
        duration() {
            return this.player.duration;
        },
    },
    methods: {
        setAudioProgress(progress) {
            this.player.progress = progress;
        },
        // 格式化时间
        formatDuration(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        },
        // 切换喜欢状态
        async _toogleLike(status) {
            if (!this.player.currentTrack) {
                return;
            }
            console.log('toogleLike');
            console.log('status:', status);
            await toogleLike(this.player.currentTrack.id, status);
            if (this.login.status) {
                this.login.reloadLikelist();
            }
        },
        // 切换播放状态
        tooglePlayState() {
            this.player.playState = this.player.playState === 'play' ? 'pause' : 'play';
        },
        // 下一首
        async goTo(direction) {
            let forward = direction === 'forward' ? true : false;
            console.log(forward ? 'next' : 'previous');
            forward ? this.player.next() : this.player.previous();
        },
        tooglePlayMode(mode) {
            if (mode === 'order' || mode === 'listloop' || mode === 'random' || mode === 'listrandom' || mode === 'loop') {
                this.player.mode = mode;
                this.setting.play = {
                    ...this.setting.play,
                    mode: mode,
                }
            }
        },
        async playTrack(track) {
            await this.player.playTrack(track);
        },
        addTrackToPlaylist(track) {
            this.player.addTrack(track);
        },
        handleArtistClick(artistId) {
            console.log('Artist ID:', artistId);
            this.$router.push({ path: '/artist/' + artistId });
        },
        updateVolumeInSetting() {
            this.setting.play = {
                ...this.setting.play,
                volume: this.player.volume,
            }
        },
        setQuality(quality) {
            console.log('setQuality:', quality);
            this.player.quality = quality;
            this.setting.play = {
                ...this.setting.play,
                quality: quality,
            }
            this.$refs.quality_panel.tooglePanel();
        },
    },
    mounted() {
        if (this.login.status) {
            this.login.likelist.length === 0 ? this.login.reloadLikelist() : null;
        }
        this.player.volume = this.setting.play.volume;
        this.player.quality = this.setting.play.quality;
        this.tooglePlayMode(this.setting.play.mode);
        this.player.onTrackReady = () => {
            let avQuality = this.player.availableQuality;
            this.qualityGroup.forEach((quality) => {
                // 清空可用数据
                quality.available = false;
                quality.size = '';
                avQuality.forEach((avItem) => {
                    if (quality.name === avItem.name) {
                        quality.available = true;
                        quality.size = avItem.size;
                    }
                });
            });
        }
    },
}

</script>

<style scoped>
.playbar {
    display: flex;
    color: white;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    user-select: none;
}

.img {
    user-select: none;
    opacity: 0.9;
    -webkit-user-drag: none;
}

.align-left {
    display: flex;
    align-items: center;
    width: calc(50vw - 220px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 100%;
}

.play-info {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.img-cover {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    margin-left: 15px;
    border-radius: 5px;
}

.play-info-text {
    display: flex;
    flex-direction: column;
}

.play-info-text-title {
    display: flex;
    text-align: left;
    align-items: flex-start;
}

.play-info-text-artist {
    display: flex;
    text-align: left;
    align-items: flex-start;
    color: #bbb;
    font-size: 14px;
    margin-top: 5px;
}

.artist-button {
    cursor: pointer;
}

.align-center {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.buttons {
    display: flex;
    align-items: center;
}

.button {
    margin: 0 10px;
    cursor: pointer;
    background-color: transparent;
    border: none;
}

.quality-button {
    position: relative;
    cursor: pointer;
    color: #bbb;
    font-size: 14px;
    font-weight: bold;
    margin-right: 20px;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    padding: 3px 6px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
}

.quality-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 321px;
    /* height: 390px; */
    background-color: rgb(55, 55, 65);
    border-radius: 5px;
    transform: translate(calc(-100% - 20px), calc(-100% - 25px));
    text-align: left;
    padding-top: 15px;
    padding-bottom: 10px;
}

.quality-title {
    color: #eee;
    font-size: 17px;
    text-align: left;
    font-weight: bold;
    padding: 0px 0px 10px 15px;
}

.quality-switcher {
    display: flex;
    flex-direction: column;
}

.quality-item {
    display: flex;
    flex-direction: column;
    text-align: left;
    height: 50px;
    justify-content: center;
    cursor: pointer;
    font-size: 15px;
    padding-left: 15px;
}

.quality-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.quality-item-title {
    color: #eee;
    font-size: 15px;
    width: 100%;
    text-align: left;
}

.quality-item-desc {
    color: #bbb;
    font-size: 13px;
    width: 100%;
    text-align: left;
}

.volume-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 20px;
    height: 135px;
    align-items: center;
    justify-content: top;
    background-color: rgb(52, 52, 61);
    border-radius: 5px;
    padding: 10px 10px 20px 10px;
    transform: translate(-100%, calc(-100% - 20px));
}

.volume-text {
    position: absolute;
    font-size: 13px;
    bottom: 5px;
}

.play-button {
    display: flex;
    width: 40px;
    height: 40px;
    background-color: rgb(254, 60, 90);
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    overflow: hidden;
}

.img-like {
    width: 22px;
    height: 22px;
}

.img-previous {
    width: 18px;
    height: 18px;
}

.img-play {
    width: 16px;
    height: 16px;
    padding-left: 3px;
}

.img-pause {
    width: 16px;
    height: 16px;
}

.img-next {
    width: 18px;
    height: 18px;
}

.playMode-button {
    display: flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    margin-bottom: 3px;
}

.img-order {
    width: 20px;
    height: 20px;
}

.img-random {
    width: 18px;
    height: 18px;
}

.img-loop {
    width: 22px;
    height: 22px;
}

.img-listloop {
    width: 22px;
    height: 22px;
}

.playMode-switcher {
    display: flex;
    position: absolute;
    width: 90px;
    height: 190px;
    transform: translate(calc(-100% + 35px), calc(-100% - 20px));
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgb(55, 55, 65);
    border-radius: 5px;
    padding: 10px;
    box-shadow: 2px -2px 10px #111;
}

.playMode-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 30px;
    cursor: pointer;
    color: #eee;
    font-size: 15px;
    padding: 10px 0px;
    margin: 0px;
}

.playMode-item:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playMode-img {
    margin-right: 5px;
}

.progress {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 4px;
    background-color: transparent;
}

.time {
    color: #888;
    font-size: 12px;
    margin: 0 8px;
}

.align-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: calc(50vw - 220px);
    height: 100%;
    margin-right: 20px;
}

.playlist-container {
    position: absolute;
    background-color: rgb(44, 45, 55);
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    /* align-items: left; */
    justify-content: flex-start;
    transform: translate3d(calc(-100%), calc(-100% - 65px), 0);
    width: calc(321px + 43px);
    height: calc(100vh - 230px);
    box-shadow: -1px -1px 10px #111;
}

.scrollable {
    display: block;
    width: 100%;
    overflow-y: auto;
    user-select: none;
    -webkit-user-drag: none;
}

/* 0 滚动条样式 */
.scrollable::-webkit-scrollbar {
    /* 滚动条宽度 */
    width: 6px;
}

.scrollable::-webkit-scrollbar-track {
    /* 滚动条轨道背景 */
    background: transparent;
}

.scrollable::-webkit-scrollbar-thumb {
    /* 滚动条滑块背景 */
    background: transparent;
    /* 滚动条滑块圆角 */
    border-radius: 6px;
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

.playlist-title {
    display: flex;
    justify-content: space-between;
    margin: 10px;
    margin-bottom: 4px;
    padding-bottom: 6px;
}

.title-left {
    display: flex;
    flex-direction: row;
    color: white;
    font-size: 17px;
    text-align: left;
    font-weight: bold;
}

.playlist-header {
    display: flex;
    color: #bbb;
    font-size: 14px;
    flex-direction: row;
    padding: 0px 25px 10px 0px;
    margin-right: 10px;
    margin-left: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    justify-content: space-between;
}
</style>