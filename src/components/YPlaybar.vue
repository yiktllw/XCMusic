<template>
    <!-- 0 播放栏 -->
    <div class="playbar">
        <!-- 1 左侧 -->
        <div class="align-left">
            <!-- 2 播放信息 -->
            <div class="play-info">
                <!-- 3 封面 -->
                <img class="img-cover img"
                    :src="this.playlist[playlistIndex]?.al.picUrl ? this.playlist[playlistIndex].al.picUrl : ''"
                    v-show="this.playlist[playlistIndex]?.al.picUrl">
                <!-- 4 封面占位图片 -->
                <div class="img-cover-placeholder img" v-show="!this.playlist[playlistIndex]?.al.picUrl"></div>
                <!-- 4 播放信息文本 -->
                <div class="play-info-text">
                    <!-- 5 播放信息文本:标题 -->
                    <div class="play-info-text-title">
                        {{ this.playlist[playlistIndex]?.name }}
                    </div>
                    <!-- 5 播放信息文本:艺术家 -->
                    <div class="play-info-text-artist">
                        <span v-for="(artist, index) in playlist[playlistIndex]?.ar" :key="artist.id">
                            <span @click="handleArtistClick(artist.id)" class="artist-button"
                                :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                {{ artist.name }}
                            </span>
                            <span v-if="index < playlist[playlistIndex]?.ar.length - 1"> / </span>
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
                <button class="button like-button" @click="toogleLike(likelist.includes(playlist[playlistIndex]?.id))">
                    <img class="img-like img" src="../assets/likes.svg"
                        v-if="likelist.includes(playlist[playlistIndex]?.id)" title="取消喜欢">
                    <img v-else class="img-like img" src="../assets/unlikes.svg" title="喜欢">
                </button>
                <!-- 3 上一首按钮 -->
                <button class="button previous-button" @click="goTo('backwards')" title="上一首">
                    <img class="img-previous img" src="../assets/previous.svg">
                </button>
                <!-- 3 播放/暂停按钮 -->
                <button class="button play-button" @click="tooglePlayState" :title="playState === 'pause' ? '播放' : '暂停'">
                    <img v-show="playState === 'pause'" class="img-play img" src="../assets/play.svg">
                    <img v-show="playState === 'play'" class="img-pause img" src="../assets/pause.svg">
                </button>
                <!-- 3 下一首按钮 -->
                <button class="button next-button" @click="goTo('forward')" title="下一首">
                    <img class="img-next img" src="../assets/next.svg">
                </button>
                <!-- 3 播放模式按钮 -->
                <button class="button playMode-button" @click="this.$refs.play_mode_panel.tooglePanel()"
                    ref="play_mode_panel_trigger">
                    <img v-show="playMode === 'order'" class="img-order img" src="../assets/order.svg" title="顺序播放">
                    <img v-show="playMode === 'listloop'" class="img-listloop img" src="../assets/listloop.svg"
                        title="列表循环">
                    <img v-show="playMode === 'random'" class="img-random img" src="../assets/random.svg" title="随机播放">
                    <img v-show="playMode === 'listrandom'" class="img-random img" src="../assets/listrandom.svg"
                        title="列表随机" style="opacity: 1;">
                    <img v-show="playMode === 'loop'" class="img-loop img" src="../assets/loop.svg" title="单曲循环">
                </button>
                <YPanel ref="play_mode_panel" :trigger="this.$refs.play_mode_panel_trigger">
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
                <!-- 3 音频元素 -->
                <audio src="" ref="audio" @timeupdate="updateProgress" @loadedmetadata="setDuration"
                    @ended="onAudioEnded"></audio>

                <!-- 3 自定义进度条 -->
                <div class="time">
                    {{ this.$refs.audio ? formatDuration(this.$refs.audio.currentTime) : '00:00' }}
                </div>
                <YProgressBar v-model="progress" style="height:20px;width: 321px" @update:model-value="setAudioProgress" />
                <div class="time">
                    {{ formatDuration(this.duration) }}
                </div>
            </div>
        </div>
        <!-- 1 右侧 -->
        <div class="align-right">
            <div class="buttons" style="margin-right: 10px;">
                <img class="img" src="../assets/volume.svg"
                    style="width: 22px; height: 22px;margin-right:10px; cursor: pointer; opacity: 0.9;" title="音量"
                    ref="volume_panel_trigger" @click="this.$refs.volume_panel.tooglePanel()">
                <YPanel ref="volume_panel" :trigger="this.$refs.volume_panel_trigger" :slide-direction="5">
                    <div class="volume-container">
                        <YProgressBarV v-model="volume"
                            style="height: 120px;width: 20px;position: absolute; bottom: 30px;" />
                        <div class="volume-text">
                            {{ Math.round(volume * 100) + '%' }}
                        </div>
                    </div>
                </YPanel>
                <img class="img" src="../assets/playlist.svg"
                    style="width: 20px; height: 20px; margin-left:10px; cursor: pointer; opacity: 0.8;"
                    @click="this.$refs.playlist_panel.tooglePanel" title="播放列表" ref="playlist_panel_trigger">
                <YPanel ref="playlist_panel" :trigger="this.$refs.playlist_panel_trigger" :slide-direction="4">
                    <div class="playlist-container">
                        <div class="playlist-title">
                            <span>播放列表</span>
                            <div class="songs-count"
                                style="color:#fff; margin:0;padding:0 20px 0px 5px;font-size: 13px; font-weight: bold;">
                                {{ playlist.length }}
                            </div>

                        </div>
                        <div class="playlist-header">
                            <div class="playlist-header-item">标题</div>
                            <div class="playlist-header-item">喜欢</div>
                        </div>
                        <div class="scrollable">
                            <YSongsTable class="songs-table" :tracks="this.playlist" :showTrackCounter="false"
                                :showTrackAlbum="false" :showTrackDuration="false" :showTrackPopularity="false"
                                :showHeader="false" :resortable="false" :canSendPlaylist="false" @play-songs="playSongs" />
                        </div>
                    </div>
                </YPanel>
            </div>
        </div>
    </div>
</template>

<script lang="js">
import { useApi, toogleLikeAndGetLikelist } from '@/ncm/api';
import { mapState, mapActions } from 'vuex';
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
            playState: 'pause', // 播放状态
            playMode: 'order',  // 播放模式
            playlist: [], // playlist
            playlistId: 0, // playlist id
            playlistIndex: 0, // current playing index
            progress: 0, // 进度条的宽度百分比
            duration: 0, // 音频的总时长
            audioContext: null, // 音频上下文
            gainNode: null, // 音量控制节点
            volume: 1, // 音量
        }
    },
    computed: {
        ...mapState({
            likelist: state => state.likelist,
            nowPlaying: state => state.nowPlaying,
        })
    },
    watch:{
        volume(value) {
            if(this.$refs.audio.readyState) {
                this.$refs.audio.volume = value;
            }
        },
    },
    methods: {
        ...mapActions(['updateLikelist', 'updateNowPlaying']),
        setAudioProgress(progress) {
            if (this.$refs.audio.src && this.$refs.audio.src !== 'http://localhost:4321/') {
                this.$refs.audio.currentTime = progress * this.$refs.audio.duration;
            }
        },
        // 初始化音量均衡控件
        initAudioContext() {
            if (!this.audioContext) {
                // 创建一个新的 AudioContext
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // console.log('audioContext', this.audioContext);

                // 创建一个增益节点
                this.gainNode = this.audioContext.createGain();
                // console.log('gainNode', this.gainNode);

                // 连接增益节点到 AudioContext 的目标
                this.gainNode.connect(this.audioContext.destination);
                var audioElement = this.$refs.audio;
                audioElement.crossOrigin = 'anonymous';

                // 创建一个新的音频源
                var source = this.audioContext.createMediaElementSource(audioElement);
                source.connect(this.gainNode);
            }

        },
        // 设置音量均衡
        setGain(value) {
            if (this.gainNode) {
                this.gainNode.gain.value = value;
            }
        },
        // 将 dB 转换为线性增益值
        dBToGain(dB) {
            return Math.pow(10, (dB) / 20);
        },
        // 格式化时间
        formatDuration(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        },
        // 更新进度条
        updateProgress() {
            const audio = this.$refs.audio;
            if (audio?.duration) {
                this.progress = (audio.currentTime / audio.duration);
            }
        },
        // 设置音频总时长
        setDuration() {
            const audio = this.$refs.audio;
            this.duration = audio?.duration;
            // console.log('setDuration', this.duration);
        },
        // 切换喜欢状态
        async toogleLike(status) {
            if (!this.playlist[this.playlistIndex]) {
                return;
            }
            console.log('toogleLike');
            console.log('status:', status);
            let result = await toogleLikeAndGetLikelist(this.playlist[this.playlistIndex].id, status);
            this.updateLikelist(result);
        },
        // 切换播放状态
        tooglePlayState() {
            if (!this.$refs.audio.src || !this.$refs.audio.readyState) {
                return;
            }
            this.playState = this.playState === 'play' ? 'pause' : 'play';
            this.playState === 'play' ?
                this.$refs.audio.play() :
                this.$refs.audio.pause();
            console.log('tooglePlayState');
        },
        async onAudioEnded() {
            console.log('onAudioEnded');
            await this.scrobble();
            if (this.playMode === 'loop') {
                this.$refs.audio.currentTime = 0;
                this.$refs.audio.play();
            } else {
                await this.goTo('forward');
            }
        },
        async scrobble() {
            let result = null;
            if (this.playlist[this.playlistIndex]) {
                result = await useApi('/scrobble', {
                    id: this.playlist[this.playlistIndex].id,
                    time: this.duration,
                    sourceid: this.playlistId,
                    cookie: localStorage.getItem('login_cookie')
                });
            } else if (this.playlistId !== 0) {
                result = await useApi('/scrobble', {
                    time: this.duration,
                    sourceid: this.playlistId,
                    cookie: localStorage.getItem('login_cookie')
                });
            }
            console.log('scrobble:', result);
        },
        // 下一首
        async goTo(direction) {
            let forward = direction === 'forward' ? true : false;
            console.log(forward ? 'next' : 'previous');
            // 如果没有播放列表，直接返回
            if (!this.playlist) {
                return;
            }
            this.scrobble();
            // 如果指标指向的歌曲存在 
            if (this.playlist[this.playlistIndex]) {
                // 处理Index
                if (this.playMode === 'order') {
                    // 如果播放模式是单曲循环或顺序播放
                    this.playlistIndex = forward ? (this.playlistIndex + 1) : (this.playlistIndex - 1);
                    if (this.playlistIndex >= this.playlist.length || this.playlistIndex < 0) {
                        this.$refs.audio.src = '';
                        this.playState = 'pause';
                        this.playlistIndex = 0;
                        return;
                    }
                } else if (this.playMode === 'random') {
                    // 如果播放模式是随机播放
                    this.playlistIndex = Math.floor(Math.random() * this.playlist.length);
                } else if (this.playMode === 'listloop' || this.playMode === 'loop' || this.playMode === 'listrandom') {
                    // 如果播放模式是列表循环 / 单曲循环 / 列表随机
                    this.playlistIndex = forward ? ((this.playlistIndex + 1) % this.playlist.length) : ((this.playlistIndex - 1 + this.playlist.length) % this.playlist.length);
                }
                // 得到指标歌曲的URL
                if (this.playlist[this.playlistIndex]) {
                    this.playTrack(this.playlist[this.playlistIndex]);
                }
            }
        },
        tooglePlayMode(mode) {
            if (this.playMode === mode) {
                return;
            }
            this.playMode = mode;
            if (!this.playlist[0]) {
                return;
            }
            if (mode === 'listrandom') {
                this.playlist = this.playlist.sort(() => Math.random() - 0.5);
                let currentIndex = this.playlist.findIndex(track => track.id === this.nowPlaying);
                // 将当前播放的歌曲移动到列表的第一个位置
                this.playlist.unshift(this.playlist.splice(currentIndex, 1)[0]);
                this.playlistIndex = 0;
            } else {
                this.playlist = this.playlist.sort((a, b) => a.originalIndex - b.originalIndex);
                this.playlistIndex = this.playlist.findIndex(track => track.id === this.nowPlaying);
            }
            console.log('playMode:', this.playMode);
        },
        async play(event) {
            if (event.origin !== 'http://localhost:4321') {
                return;
            }
            if (event.data.type === 'play-songs') {
                let track = JSON.parse(event.data.track);
                this.playlistId = event.data.playlistId;
                console.log('play', track);
                await this.playTrack(track);
                // console.log(this.playlist);
                // console.log(trackIndex);
            }
        },
        playSongs(track) {
            console.log('playSongs', track);
            track = JSON.parse(track);
            this.playTrack(track);
        },
        async playTrack(track) {
            let result = await this.getUrl(track.id);
            let url = result.url;
            let gain = result.gain;
            console.log('gain_db:', gain);

            // 找到 track.id 对应的 playlist 项的 index
            let trackIndex = this.playlist.findIndex(_track => _track.id === track.id);
            if (trackIndex !== -1) {
                this.playlist[trackIndex].url = url;
                this.playlistIndex = trackIndex; // 更新 playlistIndex
                this.playState = 'play';
                this.$refs.audio.src = url;
                this.$refs.audio.volume = this.volume;
                this.$refs.audio.play();
                this.initAudioContext();
                this.setGain(this.dBToGain(gain));
                console.log('gain_linear:', this.gainNode.gain.value);
                this.updateNowPlaying(track.id);
            }
        },
        async getUrl(id) {
            let result = await useApi('/song/url/v1', {
                id: id,
                level: 'jymaster',
                cookie: localStorage.getItem('login_cookie')
            });
            return result.data[0];
        },
        async updatePlaylist(event) {
            if (event.origin !== 'http://localhost:4321') {
                return;
            }
            if (event.data.type === 'update-playlist') {
                console.log('update-playlist', JSON.parse(event.data.playlist));
                if (this.playlist.length > 0) {
                    this.scrobble();
                }
                this.playlist = JSON.parse(event.data.playlist);
                this.playlistId = event.data.playlistId;
                if (this.playMode === 'listrandom') {
                    this.playlist = this.playlist.sort(() => Math.random() - 0.5);
                }
            } else {
                if (event.data.type === 'update-playlist-and-play' || event.data.type === 'play-song-and-playlist') {
                    let track = null;
                    if (event.data.type === 'play-song-and-playlist') {
                        track = JSON.parse(event.data.track);
                    }
                    console.log('update-playlist-and-play', JSON.parse(event.data.playlist));
                    if (this.playlist.length > 0) {
                        this.scrobble();
                    }
                    this.playlist = JSON.parse(event.data.playlist);
                    this.playlistId = event.data.playlistId;
                    if (this.playMode === 'order' || this.playMode === 'loop' || this.playMode === 'listloop') {
                        if (track) {
                            await this.playTrack(track);
                        } else {
                            await this.playTrack(this.playlist[0]);
                        }
                    } else if (this.playMode === 'random') {
                        if (track) {
                            await this.playTrack(track);
                        } else {
                            await this.playTrack(this.playlist[Math.floor(Math.random() * this.playlist.length)]);
                        }
                    } else if (this.playMode === 'listrandom') {
                        this.playlist = this.playlist.sort(() => Math.random() - 0.5);
                        await this.playTrack(this.playlist[0]);
                    }
                }
            }
        },
        handleArtistClick(artistId) {
            console.log('Artist ID:', artistId);
            // 在这里处理点击事件，例如跳转到艺术家的详情页面
        },
    },
    async mounted() {
        this.$refs.audio.src = '';
        window.addEventListener('message', this.play)
        window.addEventListener('message', this.updatePlaylist)
        if (this.likelist.length === 0) {
            let result = await useApi('/likelist', {
                uid: localStorage.getItem('login_uid'),
                cookie: localStorage.getItem('login_cookie'),
            });
            this.updateLikelist(result.ids);
        }
        console.log('update likelist from YPlaybar.vue');
    },
    beforeUnmount() {
        window.removeEventListener('message', this.play);
        window.removeEventListener('message', this.updatePlaylist);
    }
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

.img-cover-placeholder {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    margin-left: 15px;
    border-radius: 5px;
    background-color: #222;
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
    height: 100%;
    margin-top: 10px;
    top: 50%;
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
    color: white;
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
    transform: translate3d(calc(-100% ),calc(-100% - 65px),0);
    width: 300px;
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
    flex-direction: row;
    color: white;
    font-size: 17px;
    margin: 10px;
    margin-bottom: 4px;
    padding-bottom: 6px;
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