<template>
    <!-- 0 播放栏 -->
    <div class="playbar">
        <!-- 1 左侧 -->
        <div class="align-left">
            <!-- 2 播放信息 -->
            <div class="play-info">
                <!-- 3 封面 -->
                <img class="img-cover"
                    :src="this.playlist[playlistIndex]?.al.picUrl ? this.playlist[playlistIndex].al.picUrl : ''"
                    v-show="this.playlist[playlistIndex]?.al.picUrl">
                <!-- 4 封面占位图片 -->
                <div class="img-cover-placeholder" v-show="!this.playlist[playlistIndex]?.al.picUrl"></div>
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
                    <img class="img-like" src="../assets/likes.svg" v-if="likelist.includes(playlist[playlistIndex]?.id)">
                    <img v-else class="img-like" src="../assets/unlikes.svg">
                </button>
                <!-- 3 上一首按钮 -->
                <button class="button previous-button" @click="previous" title="上一首">
                    <img class="img-previous" src="../assets/previous.svg">
                </button>
                <!-- 3 播放/暂停按钮 -->
                <button class="button play-button" @click="tooglePlayState" :title="playState === 'pause' ? '播放' : '暂停'">
                    <img v-show="playState === 'pause'" class="img-play" src="../assets/play.svg">
                    <img v-show="playState === 'play'" class="img-pause" src="../assets/pause.svg">
                </button>
                <!-- 3 下一首按钮 -->
                <button class="button next-button" @click="next" title="下一首">
                    <img class="img-next" src="../assets/next.svg">
                </button>
                <!-- 3 播放模式按钮 -->
                <button class="button playMode-button" @click="tooglePlayMode">
                    <img v-show="playMode === 'order'" class="img-order" src="../assets/order.svg" title="顺序播放">
                    <img v-show="playMode === 'random'" class="img-random" src="../assets/random.svg" title="随机播放">
                    <img v-show="playMode === 'loop'" class="img-loop" src="../assets/loop.svg" title="单曲循环">
                    <img v-show="playMode === 'listloop'" class="img-listloop" src="../assets/listloop.svg" title="列表循环">
                </button>
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
                <div class="progress-container" @click="seek">
                    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="time">
                    {{ formatDuration(this.duration) }}
                </div>
            </div>
        </div>
        <!-- 1 右侧 -->
        <div class="align-right">
            <div class="buttons" style="margin-right: 10px;">
                <img src="../assets/playlist.svg" style="width: 20px; height: 20px; cursor: pointer;"
                    @click="tooglePlaylist" title="播放列表">
            </div>
            <div class="playlist-container">
                <div class="playlist-title">
                    <span>播放列表</span>
                    <div class="songs-count"
                    style="color:#fff; margin:0;padding:0 20px 0px 5px;font-size: 13px; font-weight: bold;"
                    :style="{ 'color': orient === 'songs' ? '#fff' : '#bbb' }">
                    {{ playlist.length }}
                </div>

                </div>
                <div class="playlist-header">
                    <div class="playlist-header-item">标题</div>
                    <div class="playlist-header-item">喜欢</div>
                </div>
                <div class="scrollable" v-show="showPlaylist">
                    <YSongsTable class="songs-table" :tracks="this.playlist" :showTrackCounter="false"
                        :showTrackAlbum="false" :showTrackDuration="false" :showTrackPopularity="false" :showHeader="false"
                        :resortable="false" @play-songs="playSongs" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="js">
import { useApi, toogleLikeAndGetLikelist } from '@/ncm/api';
import { mapState, mapActions } from 'vuex';
import YSongsTable from './YSongsTable.vue';

export default {
    name: 'YPlaybar',
    components: {
        YSongsTable
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
            showPlaylist: true, // 是否显示播放列表
        }
    },
    computed: {
        ...mapState({
            likelist: state => state.likelist
        })
    },
    methods: {
        ...mapActions(['updateLikelist']),
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
                this.progress = (audio.currentTime / audio.duration) * 100;
            }
        },
        // 设置音频总时长
        setDuration() {
            const audio = this.$refs.audio;
            this.duration = audio?.duration;
            // console.log('setDuration', this.duration);
        },
        // 拖动进度条
        seek(event) {
            const audio = this.$refs.audio;
            const rect = event.currentTarget.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const seekTime = (offsetX / rect.width) * audio?.duration;
            if (audio?.src) {
                audio.currentTime = seekTime;
            }
        },
        // 切换喜欢状态
        async toogleLike(status) {
            console.log('toogleLike');
            console.log('status:', status);
            let result = await toogleLikeAndGetLikelist(this.playlist[this.playlistIndex].id, status);
            this.updateLikelist(result);
        },
        // 上一首
        previous() {
            console.log('previous');
        },
        // 切换播放状态
        tooglePlayState() {
            this.playState = this.playState === 'play' ? 'pause' : 'play';
            if (this.playState === 'play' && this.$refs.audio.src !== 'http://localhost:4321/' && this.$refs.audio.src) {
                this.$refs.audio.play();
            } else if (this.$refs.audio.src && this.$refs.audio.src !== 'http://localhost:4321/') {
                this.$refs.audio.pause();
            } else {
                this.playState = this.playState === 'play' ? 'pause' : 'play';
                return;
            }
            console.log('tooglePlayState');
        },
        async onAudioEnded() {
            console.log('onAudioEnded');
            await this.scrobble();
            if (this.playMode === 'loop') {
                this.$refs.audio.currentTime = 0;
                this.$refs.audio.play();
            } else {
                await this.next();
            }
        },
        async scrobble() {
            let result = await useApi('/scrobble', {
                id: this.playlist[this.playlistIndex].id,
                time: this.duration,
                sourceid: this.playlistId,
                cookie: localStorage.getItem('login_cookie')
            });
            console.log('scrobble:', result);
        },
        // 下一首
        async next() {
            console.log('next');
            // 如果没有播放列表，直接返回
            this.scrobble();
            if (!this.playlist) {
                return;
            }
            // 如果指标指向的歌曲存在 
            if (this.playlist[this.playlistIndex]) {
                // 处理Index
                if (this.playMode === 'order') {
                    // 如果播放模式是单曲循环或顺序播放
                    this.playlistIndex = (this.playlistIndex + 1);
                    if (this.playlistIndex >= this.playlist.length) {
                        this.$refs.audio.src = '';
                        this.playState = 'pause';
                        return;
                    }
                } else if (this.playMode === 'random') {
                    // 如果播放模式是随机播放
                    this.playlistIndex = Math.floor(Math.random() * this.playlist.length);
                } else if (this.playMode === 'listloop' || this.playMode === 'loop') {
                    // 如果播放模式是列表循环
                    this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
                }
                // 得到指标歌曲的URL
                if (this.playlist[this.playlistIndex]) {
                    this.playTrack(this.playlist[this.playlistIndex]);
                }
            }
        },
        tooglePlayMode() {
            switch (this.playMode) {
                case 'order':
                    this.playMode = 'random';
                    break;
                case 'random':
                    this.playMode = 'loop';
                    break;
                case 'loop':
                    this.playMode = 'listloop';
                    break;
                case 'listloop':
                    this.playMode = 'order';
                    break;
            }
            console.log('tooglePlayMode', this.playMode);
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
                this.$refs.audio.play();
                this.initAudioContext();
                this.setGain(this.dBToGain(gain));
                console.log('gain_linear:', this.gainNode.gain.value);
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
            } else if (event.data.type === 'update-playlist-and-play') {
                console.log('update-playlist-and-play', JSON.parse(event.data.playlist));
                if (this.playlist.length > 0) {
                    this.scrobble();
                }
                this.playlist = JSON.parse(event.data.playlist);
                this.playlistId = event.data.playlistId;
                if (this.playMode === 'order' || this.playMode === 'loop' || this.playMode === 'listloop') {
                    await this.playTrack(this.playlist[0]);
                } else if (this.playMode === 'random') {
                    await this.playTrack(this.playlist[Math.floor(Math.random() * this.playlist.length)]);
                }
            }
        },
        handleArtistClick(artistId) {
            console.log('Artist ID:', artistId);
            // 在这里处理点击事件，例如跳转到艺术家的详情页面
        },
        tooglePlaylist() {
            this.showPlaylist = !this.showPlaylist;
            console.log('tooglePlaylist', this.showPlaylist);
        }
    },
    async mounted() {
        window.addEventListener('message', this.play)
        window.addEventListener('message', this.updatePlaylist)
        if (this.likelist.length === 0) {
            let result = await useApi('/likelist', {
                uid: localStorage.getItem('login_uid'),
                cookie: localStorage.getItem('login_cookie'),
            });
            this.updateLikelist(result.ids);
        }
        console.log('likelist:', this.likelist);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.play)
        window.removeEventListener('message', this.updatePlaylist)
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

.progress-container {
    width: 321px;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 5px;
    position: relative;
    cursor: pointer;
}

.progress-bar {
    height: 100%;
    background-color: rgb(254, 60, 90);
    width: 0;
    border-radius: 5px;
    transition: width 0.1s;
    /* 添加平滑过渡效果 */
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
    right: 15px;
    bottom: 95px;
    width: 300px;
    height: calc(100vh - 230px);
    z-index: 100;
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