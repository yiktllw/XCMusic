<template>
    <!-- 0 滚动容器 -->
    <div class="scrollable y-playlist-view" ref="scrollable">
        <!-- 1 歌单视图 -->
        <div class="playlist-view" v-show="playlist.coverImgUrl && playlist.createrAvatarUrl" ref="playlist_view">
            <!-- 2 歌单信息 -->
            <div class="playlist-info">
                <!-- 3 歌单封面 -->
                <div class="playlist-cover-container">
                    <!-- 4 封面图片 -->
                    <img v-show="playlist.coverImgUrl" :src="playlist.coverImgUrl" alt="Cover Image"
                        class="playlist-cover" @load="setBackgroundColor" />
                    <!-- 4 渐变层 -->
                    <div class="gradient-overlay"></div>
                    <!-- 4 播放次数 -->
                    <div class="play-info">
                        <img src="../assets/play.svg" class="play-icon" />
                        <span class="play-count">{{ playlist.playCount }}</span>
                    </div>
                </div>
                <!-- 3 歌单详情 -->
                <div class="playlist-details">
                    <!-- 4 歌单名称 -->
                    <h1 style="margin-top:0px;margin-bottom:10px;color:#fff;">{{ playlist.name }}</h1>
                    <!-- 4 创建信息 -->
                    <div class="createrInfo" v-show="playlist.createrAvatarUrl">
                        <!-- 5 创建者头像 -->
                        <img :src="playlist.createrAvatarUrl" alt="Creater Avatar" class="createrAvatar" />
                        <!-- 5 创建者名称 -->
                        <span class="creater-name">
                            {{ playlist.createrName }}
                        </span>
                        <!-- 5 创建时间 -->
                        <span class="create-time">
                            {{ playlist.createTime }}创建
                        </span>
                    </div>
                    <!-- <div>歌曲数量: {{ playlist.trackCount }}</div> -->
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
                        <input type="text" class="search-input" @keydown.enter="handleSearch($event.target.value,true)"
                            @input="handleSearch($event.target.value,false)" placeholder="搜索..." spellcheck="false" />
                    </div>
                </div>
            </div>
            <!-- 2 加载中动画 -->
            <div v-if="isLoading" class="loading-spinner">加载中...</div>
            <!-- 2 歌曲列表 -->
            <YSongsTable :tracks="this.filteredTracks" :likelist="likelist" />
            <!-- 2 分页 -->
            <div v-if="totalPages > 1" class="pagination">
                <button @click="changePage(page)" v-for="page in totalPages" :key="page"
                    :disabled="currentPage === page">
                    <span :class="{ 'underline': currentPage === page }">{{ page }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useApi } from '@/ncm/api';
import Color from 'color';
import YSongsTable from '@/components/YSongsTable.vue';

export default {
    name: 'YPlaylist',
    components: {
        YSongsTable,
    },
    props: {
        // 传入的歌单 ID
        playlistId: {
            type: Number,
            required: true
        },
    },
    data() {
        return {
            playlist: {
                name: '',           // 歌单名称
                coverImgUrl: '',    // 封面图片 URL
                playCount: 0,       // 播放次数
                createTime: '',     // 创建时间
                createrId: 0,       // 创建者 ID
                createrName: '',    // 创建者名称
                createrAvatarUrl: '', // 创建者头像 URL
                trackCount: 0,      // 歌曲数量
                tracks: [], // 歌曲列表
            },
            isLoading: false,   // 是否正在加载
            searchQuery: '',    // 搜索关键字
            likelist: [],       // 用户喜欢的歌曲列表
            filteredTracks: [], // 搜索过滤后的歌曲列表
            currentPage: 1,     // 当前页数
            totalPages: 1,      // 总页数
        };
    },
    watch: {
        // 监听 playlistId 的变化，当 playlistId 变化时重新获取歌单信息
        playlistId: {
            immediate: true,
            handler(newVal) {
                this.fetchPlaylist(newVal);
            }
        },
        // 监听 playlist.coverImgUrl 的变化，当 coverImgUrl 变化时重新设置背景颜色
        'playlist.coverImgUrl': function () {
            this.setBackgroundColor();
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
        async fetchPlaylist(id) {
            try {
                // 并行请求歌单信息、用户喜欢歌曲列表、用户歌单列表、歌曲列表
                const [response, myFavoriteId, getLikelist, getTracks] = await Promise.all([
                    useApi(`/playlist/detail?id=${id}`),
                    localStorage.getItem('login_uid')
                        ? useApi('/user/playlist', { uid: localStorage.getItem('login_uid') })
                        : null,
                    localStorage.getItem('login_uid')
                        ? useApi('/likelist', { uid: localStorage.getItem('login_uid'), cookie: localStorage.getItem('login_cookie') })
                        : null,
                    this.fetchTracks(id, 1) // 并行执行 fetchTracks
                ]);

                // 更新歌单名称
                this.playlist.name = response.playlist.name;

                // 如果是我喜欢的音乐歌单，则更新歌单名称
                if (myFavoriteId && myFavoriteId.playlist[0].id == id) {
                    this.playlist.name = '我喜欢的音乐';
                }

                if (getLikelist) {
                    this.likelist = getLikelist.ids;
                }

                // 更新歌曲列表
                if (getTracks) {
                    this.playlist.tracks = getTracks;
                }

                // 更新歌单信息
                this.playlist.coverImgUrl = response.playlist.coverImgUrl;
                this.playlist.playCount = response.playlist.playCount;
                this.playlist.createTime = this.formatDate(response.playlist.createTime);
                this.playlist.createrId = response.playlist.userId;
                this.playlist.createrName = response.playlist.creator.nickname;
                this.playlist.createrAvatarUrl = response.playlist.creator.avatarUrl;
                this.playlist.trackCount = response.playlist.trackCount;

                this.totalPages = Math.ceil(this.playlist.trackCount / 1000);
                this.updateTracks();
                // console.log('filteredTracks: ', this.filteredTracks);
                // fetchTracks 的结果已经在 getTracks 中处理
                if (this.totalPages > 1) {
                    const promises = [];

                    // 创建每个 fetchTracks 调用的 Promise 并添加到 promises 数组中
                    for (let i = 2; i <= this.totalPages; i++) {
                        promises.push(this.fetchTracks(id, i));
                    }

                    // 使用 Promise.all 并行执行所有的 fetchTracks
                    const addedTracksArray = await Promise.all(promises);

                    // 将所有返回的 tracks 合并到一个数组中
                    this.playlist.tracks = this.playlist.tracks.concat(...addedTracksArray);
                    console.log('filteredTracks: ', this.filteredTracks);
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
                    originalIndex: index
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
        // 格式化时间戳
        formatDate(timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        // 设置背景颜色
        setBackgroundColor() {
            // 创建一个图片对象
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            // 设置图片 URL为歌单封面
            img.src = this.playlist.coverImgUrl;
            if (!img.src) return;

            // 图片加载完成后执行
            img.onload = () => {
                // 创建一个画布对象, 用于获取图片的像素数据
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let r = 0, g = 0, b = 0;
                // 统计 RGB 值
                let count = 0;

                // RGB 值差异的阈值，越小表示越严格地过滤接近的颜色
                const threshold = 30;

                // 遍历图片的每个像素
                for (let i = 0; i < data.length; i += 4) {
                    const pixelR = data[i];
                    const pixelG = data[i + 1];
                    const pixelB = data[i + 2];
                    const pixelA = data[i + 3];

                    // 计算 RGB 三者的最大和最小值之间的差异
                    const maxRGB = Math.max(pixelR, pixelG, pixelB);
                    const minRGB = Math.min(pixelR, pixelG, pixelB);
                    const rgbDifference = maxRGB - minRGB;

                    // 如果 RGB 三者之间的差异小于阈值，则忽略该像素
                    if (rgbDifference >= threshold && pixelA > 0) {
                        r += pixelR;
                        g += pixelG;
                        b += pixelB;
                        count++;
                    }
                }

                if (count === 0) return; // 防止除以零的情况

                // 计算平均 RGB 值
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                // 增加饱和度
                let increasedData = this.increaseSaturation(r, g, b);
                // 减小亮度
                r = increasedData.r * 0.5;
                g = increasedData.g * 0.5;
                b = increasedData.b * 0.5;

                // 设置背景颜色
                window.parent.postMessage({
                    type: 'set-background-color',
                    color: `rgb(${r}, ${g}, ${b})`
                })
            };
        },
        // 增加饱和度
        increaseSaturation(r, g, b,) {
            // 创建一个 Color 对象
            const color = Color.rgb(r, g, b);

            // 获取 HSL 颜色
            let hsl = color.hsl();
            // 使用平方根函数增加饱和度
            let newHsl = hsl.saturationl(20 + 3 * Math.sqrt(hsl.saturationl()));

            // 获取新的 RGB 值
            const [newR, newG, newB] = newHsl.rgb().array();
            // 返回新的 RGB 值
            return { r: Math.round(newR), g: Math.round(newG), b: Math.round(newB) };
        },
        // 处理搜索
        handleSearch(input,fromEnter) {
            console.log('search', input);
            // 更新搜索关键字
            if(fromEnter){
                this.searchQuery = input;
            }else if(this.playlist.tracks.length<1000 || input === ''){
                this.searchQuery = input;
            }
        },
        updateTracks() {
            console.log('step1')
            if (!this.searchQuery) {
                this.filteredTracks = this.playlist.tracks.slice((this.currentPage - 1) * 1000, this.currentPage * 1000);
                console.log('filter Tracks from step1',this.filteredTracks,'currentPage:',this.currentPage);
                return;
            }
            console.log('step2')
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
            console.log('log from updateTracks',this.filteredTracks);
        },
    },
}
</script>

<style scoped>
/* 0 滚动容器 */
.scrollable {
    display: flex;
    padding-left: 15pt;
    padding-right: 15pt;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 100vh;
    max-width: 100vw;
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
    position: absolute;
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
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
}

/* 4 歌单名称 */
h1 {
    font-size: 24px;
    margin-bottom: 10px;
}

/* 4 创建者信息 */
.createrInfo {
    display: inline-flex;
    align-items: center;
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
    margin-top: 57px;
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
    margin-left: 5px;
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

/* 2 分页 */
.pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
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
.underline {
    text-decoration: underline;
}
</style>