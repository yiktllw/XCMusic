<template>
    <!-- 0 滚动容器 -->
    <div class="scrollable y-playlist-view" ref="scrollable">
        <!-- 1 歌单视图 -->
        <div class="playlist-view" ref="playlist_view">
            <!-- 2 歌单信息 -->
            <div class="playlist-info">
                <!-- 3 歌单封面 -->
                <div class="playlist-cover-container">
                    <!-- 4 封面图片 -->
                    <img v-show="playlist.coverImgUrl" :src="playlist.coverImgUrl" alt="Cover Image" class="playlist-cover"
                        @load="_setBackgroundColor" />
                    <div v-show="!playlist.coverImgUrl" class="playlist-cover" style="background-color: #333;"></div>
                    <!-- 4 渐变层 -->
                    <div class="gradient-overlay" v-if="type === 'playlist'"></div>
                    <!-- 4 播放次数 -->
                    <div class="play-info" v-if="type === 'playlist'">
                        <img src="../assets/play.svg" class="play-icon" />
                        <span class="play-count">{{ playlist.playCount }}</span>
                    </div>
                </div>
                <!-- 3 歌单详情 -->
                <div class="playlist-details" v-show="playlist.name">
                    <div class="align-up" :class="type === 'playlist' ? '' : 'align-up-album'">
                        <!-- 4 歌单名称 -->
                        <h1 style="margin-top:0px;margin-bottom:10px;color:#fff;">{{ playlist.name + (playlist.transName ?
                            playlist.transName : '') }}</h1>
                        <!-- 4 创建信息 -->
                        <div class="createrInfo" v-if="type === 'playlist'">
                            <!-- 5 创建者头像 -->
                            <img v-show="playlist.createrAvatarUrl" :src="playlist.createrAvatarUrl"
                                class="createrAvatar" />
                            <div v-show="!playlist.createrAvatarUrl" class="createrAvatar" style="background-color: #333;">
                            </div>
                            <!-- 5 创建者名称 -->
                            <span class="creater-name">
                                {{ playlist.createrName }}
                            </span>
                            <span v-show="!playlist.createrAvatarUrl" class="creater-name"
                                style="background-color: #333;">创建者
                            </span>
                            <!-- 5 创建时间 -->
                            <span class="create-time">
                                {{ playlist.createTime }}创建
                            </span>
                        </div>
                        <!-- 4 创建信息 -->
                        <div class="album-artist" v-else>
                            <span v-for="(artist, index) in playlist.artists" :key="artist.id">
                                <!-- 5 歌手按钮 -->
                                <span @click="handleArtistClick(artist.id)" class="artist-button"
                                    :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                    {{ artist.name }}
                                </span>
                                <span v-if="index < playlist.artists.length - 1"> /&nbsp; </span>
                            </span>
                        </div>
                        <div class="createrInfo" v-if="type === 'album'">
                            <!-- 5 创建时间 -->
                            <span class="create-time-album">
                                {{ playlist.createTime }}&nbsp;发布
                            </span>
                        </div>
                    </div>
                    <div class="align-down">
                        <!-- 4 歌单按钮 -->
                        <div class="play-buttons">
                            <!-- 5 播放按钮 -->
                            <button class="play-button" @click="playAll">
                                <img src="../assets/play.svg" style="width: 15px; height: 15px; padding-right:5px;" />
                                <span style="padding-bottom: 2px;">
                                    播放
                                </span>
                            </button>
                            <!-- 5 添加到播放列表按钮 -->
                            <button class="add-button" @click="addPlaylistToQueue">
                                <img src="../assets/addtoplaylist.svg"
                                    style="width: 15px; height: 15px; padding-right:5px;" />
                                添加到播放列表
                            </button>
                            <!-- 5 下载按钮 -->
                            <button class="download-button" @click="downloadPlaylist">
                                <img src="../assets/download.svg" style="width: 15px; height: 15px; padding-right:5px;" />
                                下载
                            </button>
                            <!-- 5 多选按钮 -->
                            <button class="multichoice-button" @click="multiChoice">
                                <img src="../assets/multichoice.svg"
                                    style="width: 15px; height: 15px; padding-right:5px;" />
                                多选
                            </button>
                            <!-- 5 搜索框 -->
                            <input type="text" class="search-input" @keydown.enter="handleSearch($event.target.value, true)"
                                @input="handleSearch($event.target.value, false)" placeholder="搜索..." spellcheck="false" />
                        </div>
                    </div>
                </div>
            </div>
            <!-- 2 切换歌曲或评论 -->
            <div class="orienter">
                <!-- 3 歌曲 -->
                <div class="orient-songs">
                    <!-- 4 歌曲按钮 -->
                    <button class="orient-button" @click="orient = 'songs'">
                        <span :class="{ 'choosed-text': orient === 'songs' }" style="font-size: 16px; color:#fff;"
                            :style="{ 'font-weight': orient === 'songs' ? 'bold' : '500', 'color': orient === 'songs' ? '#fff' : '#bbb' }">歌曲</span>
                        <div class="choosed"
                            style="transform: translate(7px,4px); width: 60%; height: 4px; border-radius: 2px;"
                            v-show="orient === 'songs'">
                        </div>
                    </button>
                </div>
                <div class="songs-count"
                    style="color:#fff; margin:0;padding:0 20px 0px 2px;font-size: 13px; font-weight: bold;"
                    :style="{ 'color': orient === 'songs' ? '#fff' : '#bbb' }">
                    {{ playlist.trackCount }}
                </div>
                <!-- 3 评论 -->
                <div class="orient-comments">
                    <!-- 4 评论按钮 -->
                    <button class="orient-button" @click="orient = 'comments'">
                        <span :class="{ 'choosed-text': orient === 'comments' }" style="font-size: 16px;"
                            :style="{ 'font-weight': orient === 'comments' ? 'bold' : '500', 'color': orient === 'comments' ? '#fff' : '#bbb' }">
                            评论
                        </span>
                        <div class="choosed"
                            style="transform: translate(7px,4px); width: 60%; height: 4px; border-radius: 2px;"
                            v-show="orient === 'comments'">
                        </div>
                    </button>
                </div>
            </div>
            <!-- 2 加载中动画 -->
            <YLoading v-if="isLoading" />
            <!-- 2 歌曲列表 -->
            <YSongsTable v-if="!isLoading && type === 'playlist'" v-show="orient === 'songs'" :tracks="this.filteredTracks"
                :likelist="likelist" :showTrackPopularity="false" @play-songs="playSongs" @send-playlist="sendPlaylist"
                @play-song-and-playlist="playSongAndPlaylist" />
            <YSongsTable v-if="!isLoading && type === 'album'" v-show="orient === 'songs'" :tracks="this.filteredTracks"
                :likelist="likelist" :showTrackAlbum="false" :showTrackCover="false" @play-songs="playSongs"
                @send-playlist="sendPlaylist" @play-song-and-playlist="playSongAndPlaylist" />
            <!-- 2 分页 -->
            <div v-if="totalPages > 1 && type === 'playlist'" class="pagination">
                <button @click="changePage(page)" v-for="page in totalPages" :key="page" :disabled="currentPage === page">
                    <span :class="{ 'choosed-text': currentPage === page }" style="font-size: medium;">{{ page }}</span>
                    <div class="choosed" v-show="currentPage === page"></div>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import YSongsTable from '@/components/YSongsTable.vue';
import YLoading from '@/components/YLoading.vue';
import { useApi } from '@/ncm/api';
import { formatDate_yyyymmdd } from '@/ncm/time';
import { getColorFromImg, setBackgroundColor } from '@/ncm/color'
import { mapState, mapActions } from 'vuex';
import { preparePlaylist } from '@/tools/playlist';

export default {
    name: 'YPlaylist',
    components: {
        YSongsTable,
        YLoading,
    },
    props: {
        // 传入的歌单 ID
        playlistId: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            default: 'playlist'
        },
    },
    computed: {
        ...mapState({
            likelist: state => state.likelist
        }),
    },
    data() {
        return {
            playlist: {
                name: '',           // 歌单名称
                transName: '',      // 歌单翻译名称
                coverImgUrl: '',    // 封面图片 URL
                artists: [],        // 歌单歌手
                playCount: 0,       // 播放次数
                createTime: '',     // 创建时间
                createrId: 0,       // 创建者 ID
                createrName: '',    // 创建者名称
                createrAvatarUrl: '', // 创建者头像 URL
                trackCount: 0,      // 歌曲数量
                tracks: [], // 歌曲列表
            },
            isLoading: true,   // 是否正在加载
            searchQuery: '',    // 搜索关键字
            filteredTracks: [], // 搜索过滤后的歌曲列表
            currentPage: 1,     // 当前页数
            totalPages: 1,      // 总页数
            orient: 'songs',    // 歌曲列表或评论列表
        };
    },
    watch: {
        // 监听 playlistId 的变化，当 playlistId 变化时重新获取歌单信息
        playlistId: {
            immediate: true,
            handler(newVal) {
                this.fetchPlaylist(newVal);
                window.postMessage({
                    type: 'new-playlist-id',
                    playlistId: newVal
                })
                this.isLoading = true;
            }
        },
        // 监听 playlist.coverImgUrl 的变化，当 coverImgUrl 变化时重新设置背景颜色
        'playlist.coverImgUrl': function () {
            this._setBackgroundColor();
        },
        searchQuery: {
            handler() {
                this.updateTracks();
                // console.log('filterTracks', this.filteredTracks);
            }
        },
        currentPage: {
            handler() {
                this.updateTracks();
                // console.log('filterTracks', this.filteredTracks);
            }
        },
    },
    methods: {
        // 获取歌单
        ...mapActions(['updateLikelist']),
        async fetchPlaylist(id) {
            try {
                let requests = [];
                if (this.type === 'playlist') {
                    requests = [
                        useApi(`/playlist/detail?id=${id}`).then(response => {
                            this.playlist.name = response.playlist.name;
                            this.playlist.transName = '';
                            this.playlist.coverImgUrl = response.playlist.coverImgUrl;
                            this.playlist.playCount = response.playlist.playCount;
                            this.playlist.createTime = formatDate_yyyymmdd(response.playlist.createTime);
                            this.playlist.createrId = response.playlist.userId;
                            this.playlist.createrName = response.playlist.creator.nickname;
                            this.playlist.createrAvatarUrl = response.playlist.creator.avatarUrl;
                            this.playlist.trackCount = response.playlist.trackCount;
                            this.totalPages = Math.ceil(this.playlist.trackCount / 1000);
                            return response;
                        }),
                        localStorage.getItem('login_uid')
                            ? useApi('/user/playlist', { uid: localStorage.getItem('login_uid') }).then(myFavoriteId => {
                                if (myFavoriteId.playlist[0].id == id) {
                                    this.playlist.name = '我喜欢的音乐';
                                }
                                return myFavoriteId;
                            })
                            : null,
                        localStorage.getItem('login_uid')
                            ? useApi('/likelist', { uid: localStorage.getItem('login_uid'), cookie: localStorage.getItem('login_cookie') }).then(getLikelist => {
                                this.updateLikelist(getLikelist.ids);
                                console.log('update likelist from YPlayilst.vue');
                                return getLikelist;
                            })
                            : null,
                        this.fetchTracks(id, 1).then(getTracks => {
                            this.playlist.tracks = getTracks;
                            this.updateTracks();
                            this.isLoading = false;
                            return getTracks;
                        })
                    ];
                } else {
                    requests = [
                        useApi(`/album?id=${id}`).then(response => {
                            this.playlist.name = response.album.name;
                            this.playlist.transName = response.album.transNames ? (' (' + response.album.transNames + ')') : '';
                            this.playlist.coverImgUrl = response.album.picUrl;
                            this.playlist.createTime = formatDate_yyyymmdd(response.album.publishTime);
                            this.playlist.artists = response.album.artists;
                            this.playlist.trackCount = response.album.size;
                            this.playlist.tracks = response.songs.map(track => {
                                return {
                                    ...track,
                                    al: {
                                        id: track.al.id,
                                        name: track.al.name,
                                        picUrl: response.album.picUrl,
                                        tns: track.al.tns,
                                    },
                                }
                            });
                            // console.log('playlist.tracks', this.playlist.tracks);
                            this.updateTracks();
                            // console.log('playlist.tracks', this.filteredTracks);
                            this.isLoading = false;
                            return response;
                        }),
                        localStorage.getItem('login_uid')
                            ? useApi('/user/playlist', { uid: localStorage.getItem('login_uid') }).then(myFavoriteId => {
                                if (myFavoriteId.playlist[0].id == id) {
                                    this.playlist.name = '我喜欢的音乐';
                                }
                                return myFavoriteId;
                            })
                            : null,
                        localStorage.getItem('login_uid')
                            ? useApi('/likelist', { uid: localStorage.getItem('login_uid'), cookie: localStorage.getItem('login_cookie') }).then(getLikelist => {
                                this.updateLikelist(getLikelist.ids);
                                console.log('update likelist from YAlbumView.vue');
                                return getLikelist;
                            })
                            : null,
                    ];
                }

                // 使用Promise.allSettled来处理可能出现的null值（避免报错）
                await Promise.allSettled(requests);

                // 处理fetchTracks获取的多个页面的track
                if (this.totalPages > 1 && this.type === 'playlist') {
                    const promises = [];

                    for (let i = 2; i <= this.totalPages; i++) {
                        promises.push(this.fetchTracks(id, i));
                    }

                    const addedTracksArray = await Promise.all(promises);

                    this.playlist.tracks = this.playlist.tracks.concat(...addedTracksArray);
                    // console.log('filteredTracks: ', this.filteredTracks);
                    this.updateTracks();
                }
            } catch (error) {
                console.error('Failed to fetch playlist or tracks:', error);
            }
        },
        // 获取歌曲列表
        async fetchTracks(id, page) {
            try {
                // 设置正在加载
                // 获取当前页的歌曲列表
                const offset = (page - 1) * 1000;
                const limit = 1000;
                let getTracks = await useApi('/playlist/track/all', { id: id, limit: limit, offset: offset });
                // 加入新的属性 originalIndex，用于排序
                let result = getTracks.songs.map((track, index) => ({
                    ...track,
                    originalIndex: index,
                    _picUrl: track.al.picUrl + '?param=40y40',
                }));
                return result;
            } catch (error) {
                console.error('Failed to fetch tracks:', error);
                throw error; // 将错误抛出，以便在 fetchPlaylist 中捕获
            } finally {
                // 设置加载完成
            }
        },
        // 改变当前歌单的页面
        changePage(page) {
            this.currentPage = page;
            console.log('changePage', page);
            console.log(this.currentPage);
        },
        // 设置背景颜色
        async _setBackgroundColor() {
            let color = await getColorFromImg(this.playlist.coverImgUrl, document);
            // 设置背景颜色
            setBackgroundColor(color);

        },
        // 处理搜索
        handleSearch(input, fromEnter) {
            console.log('search', input);
            // 更新搜索关键字
            if (fromEnter) {
                this.searchQuery = input;
            } else if (this.playlist.tracks.length < 1000 || input === '') {
                this.searchQuery = input;
            }
        },
        // 更新歌曲列表 搜索过滤
        updateTracks() {
            // console.log('step1')
            if (!this.searchQuery && this.type === 'playlist') {
                this.filteredTracks = this.playlist.tracks.slice((this.currentPage - 1) * 1000, this.currentPage * 1000);
                // console.log('filter Tracks from step1', this.filteredTracks, 'currentPage:', this.currentPage);
                return;
            } else if (!this.searchQuery && this.type === 'album') {
                this.filteredTracks = this.playlist.tracks;
                return;
            }
            // console.log('step2')
            const query = this.searchQuery.toLowerCase();
            // 否则返回包含搜索关键字的歌曲
            this.filteredTracks = this.playlist.tracks.filter(track => {
                // 歌曲名称
                const trackName = track.name.toLowerCase();
                // 处理歌曲别名
                let trackNameTns = '';
                if (track.tns) {
                    trackNameTns = track.tns[0] ? track.tns[0].toLowerCase() : '';
                }
                // 歌手名称
                const trackArtist = track.ar.map(artist => artist.name.toLowerCase()).join(' / ');
                // 歌手别名
                const trackArtistTns = track.ar.map(artist => artist.tns[0] ? artist.tns[0].toLowerCase() : '').join('/');
                // 专辑名称
                const trackAlbum = track.al.name.toLowerCase();
                // 专辑别名
                const trackAlbumTns = track.al.tns[0] ? track.al.tns[0].toLowerCase() : '';
                return trackName.includes(query) || trackNameTns.includes(query) || trackArtistTns.includes(query) || trackArtist.includes(query) || trackAlbum.includes(query) || trackAlbumTns.includes(query);
            });
            // console.log('log from updateTracks', this.filteredTracks);
        },
        async playAll() {
            // 播放歌单
            console.log('playAll');
            let playlist = preparePlaylist(this.playlist.tracks);
            window.postMessage({
                type: 'update-playlist-and-play',
                playlist: JSON.stringify(playlist),
                playlistId: this.playlistId,
            });
            if (this.type === 'playlist') {
                await this.scrobble();
                await this.updatePlayCount();
            }
        },
        async addPlaylistToQueue() {
            window.postMessage({
                type: 'add-playlist-to-queue',
                playlist: JSON.stringify(preparePlaylist(this.playlist.tracks)),
                playlistId: this.playlistId,
            });
        },
        async playSongs(track) {
            // 播放歌曲
            console.log('playSongs');
            window.postMessage({
                type: 'play-songs',
                track: track,
                playlistId: this.playlistId,
            });
            if (this.type === 'playlist') {
                await this.updatePlayCount();
            }
        },
        async sendPlaylist() {
            // 发送歌单
            let playlist = preparePlaylist(this.playlist.tracks);
            console.log('sendPlaylist');
            window.postMessage({
                type: 'update-playlist',
                playlist: JSON.stringify(playlist),
                playlistId: this.playlistId,
            });
            if (this.type === 'playlist') {
                await this.scrobble();
                await this.updatePlayCount();
            }
        },
        async playSongAndPlaylist(track) {
            // 播放歌曲并发送歌单
            console.log('playSongAndPlaylist');
            let playlist = preparePlaylist(this.playlist.tracks);
            window.postMessage({
                type: 'play-song-and-playlist',
                track: track,
                playlist: JSON.stringify(playlist),
                playlistId: this.playlistId,
            });
            if (this.type === 'playlist') {
                await this.scrobble();
                await this.updatePlayCount();
            }
        },
        async scrobble() {
            let result = await useApi('/scrobble', {
                sourceid: this.playlistId,
                cookie: localStorage.getItem('login_cookie')
            });
            console.log('scrobble:', result);
        },
        async updatePlayCount() {
            let result = await useApi('/playlist/update/playcount', {
                id: this.playlistId,
            });
            console.log('updatePlayCount:', result);
        },
        handleArtistClick(artistId) {
            // 处理歌手点击
            console.log('artistId:', artistId);
        },
    },
    beforeUnmount() {
        // 组件销毁时发送消息
        window.postMessage({
            type: 'new-playlist-id',
            playlistId: 0,
        });
    }
}
</script>

<style scoped>
/* 0 滚动容器 */
.scrollable {
    display: flex;
    /* padding-left: 15pt; */
    padding-right: 15pt;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100vh - 142px);
    /* max-width: 100vw; */
    /* width: 100px; */
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

/* 1 歌单视图 */
.playlist-view {
    padding: 20px;
    background-color: transparent;
}

/* 2 歌单信息 */
.playlist-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
}

/* 3 歌单封面 */
.playlist-cover-container {
    position: relative;
    display: inline-block;
    margin-right: 20px;
}

/* 4 封面图片 */
.playlist-cover {
    display: block;
    width: 160px;
    height: 160px;
    border-radius: 10px;
    user-select: none;
    -webkit-user-drag: none;
}

/* 4 渐变层 */
.gradient-overlay {
    border-radius: 10px;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    /* 控制渐变高度，50% 意味着渐变到中间 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
    pointer-events: none;
    /* 确保渐变层不会阻止对图片的交互 */
    z-index: 1;
}

/* 4 播放次数信息 */
.play-info {
    position: absolute;
    top: 3px;
    right: 3px;
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 5px;
    z-index: 1;
}

/* 4 播放次数图标 */
.play-icon {
    width: 11px;
    height: 11px;
    margin-right: 3px;
}

/* 4 播放次数 */
.play-count {
    color: #fff;
    font-size: 14px;
}

/* 3 歌单详情 */
.playlist-details {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 160px;
    flex-direction: column;
}

.align-up {
    display: inherit;
    flex-direction: inherit;
    margin-top: 5px;
}

.align-up-album {
    width: 100%;
    margin-top: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.album-artist {
    display: flex;
    color: #eee;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist-button {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
}

.align-down {
    display: inherit;
    flex-direction: inherit;
    margin-bottom: 5px;
}

/* 4 歌单名称 */
h1 {
    text-align: left;
    font-size: 24px;
    margin-bottom: 10px;
}

/* 4 创建者信息 */
.createrInfo {
    display: inline-flex;
    align-items: center;
}

.create-time-album {
    color: #bbb;
    font-size: 14px;
}

/* 5 创建者头像 */
.createrAvatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 5px;
}

/* 5 创建者名称 */
.creater-name {
    color: #eee;
}

/* 5 创建时间 */
.create-time {
    color: #ccc;
    padding-bottom: 3px;
    padding-left: 10px;
}

/* 4 歌单按钮 */
.play-buttons {
    display: inline-flex;
    width: 100%;
    height: 35px;
}

/* 5 播放按钮 */
.play-button {
    color: #eee;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    border-style: none;
    border-radius: 5px;
    padding: 7px 15px 7px 12px;
    margin-right: 5px;
    background-color: rgb(254, 60, 90);
}

/* 5 播放按钮悬停样式 */
.play-button:hover {
    background-color: rgb(230, 55, 76);
}

/* 5 添加按钮 */
.add-button,
/* 5 下载按钮 */
.download-button,
/* 5 多选按钮 */
.multichoice-button {
    color: #eee;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    border-style: none;
    border-radius: 5px;
    padding: 7px 15px 7px 12px;
    margin-left: 5px;
    margin-right: 5px;
    padding-top: 8px;
    padding-bottom: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
}

/* 5 添加按钮悬停样式 */
.add-button:hover,
/* 5 下载按钮悬停样式 */
.download-button:hover,
/* 5 多选按钮悬停样式 */
.multichoice-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* 5 搜索框 */
.search-input {
    filter: opacity(0.5);
    background-image: url('../assets/search.svg');
    background-repeat: no-repeat;
    background-position: left 10px center;
    /* 图片位置 */
    background-size: 15px 15px;
    /* 图片大小 */
    padding: 8px 15px 8px 30px;
    /* 为了确保文字不会覆盖图片 */
    background-color: rgba(255, 255, 255, 0.05);
    color: #eee;
    border-style: none;
    border-radius: 100px;
    width: 50px;
    transition-duration: 0.3s;
    margin-left: auto;
}

/* 5 搜索框默认文字 */
.search-input::placeholder {
    user-select: none;
    color: #fff;
}

/* 5 搜索框激活样式 */
.search-input:focus {
    width: 150px;
    outline: none;
}

/* 2 切换歌曲或评论 */
.orienter {
    display: flex;
    margin-bottom: 20px;
    background-color: transparent;
}

.orient-button {
    color: #eee;
    cursor: pointer;
    background-color: transparent;
    border-style: none;
    padding: 0;
}

/* 3 歌曲 */
.orient-songs {
    background-color: transparent;
}

/* 3 评论 */
.orient-comments {
    background-color: transparent;
}

/* 2 分页 */
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

/* 2 分页按钮 */
.pagination button {
    color: #fff;
    margin: 0 5px;
    padding: 5px 10px;
    border: none;
    background-color: transparent;
}

.pagination button:hover {
    cursor: pointer;
}

/* 2 分页按钮选中样式 */
.choosed-text {
    color: rgb(254, 80, 110);
}

.choosed {
    width: 90%;
    height: 2px;
    background-color: rgb(254, 60, 90);
    transform: translateY(1px);
    transform: translateX(1px);
}
</style>