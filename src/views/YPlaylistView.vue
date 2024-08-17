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
                        <input type="text" class="search-input" @keydown.enter="handleSearch($event.target.value)"
                            @input="handleSearch($event.target.value)" placeholder="搜索..." spellcheck="false" />
                    </div>
                </div>
            </div>
            <!-- 2 加载中动画 -->
            <div v-if="isLoading" class="loading-spinner">加载中...</div>
            <!-- 2 歌曲列表 -->
            <div class="table-container">
                <!-- 3 表头 -->
                <div class="table-header">
                    <!-- 4 歌曲序号-表头 -->
                    <div class="songsCounter">
                        <!-- 5 歌曲序号-表头按钮 -->
                        <button class="header-button header-counter">
                            <span>#</span>
                        </button>
                    </div>
                    <!-- 4 歌曲标题-表头 -->
                    <div class="songsName" ref="songs_name_ref">
                        <!-- 5 标题排序按钮 -->
                        <button class="header-button" @click="handleSort">
                            <span>标题</span>
                            <!-- 6 排序内容 -->
                            <div class="sort-content">
                                <img :src="sortingStates[currentSortingIndex].icon" class="sort-icon" />
                                <span style="font-size:13px; color: #aaa;">{{ sortingStates[currentSortingIndex].text
                                    }}</span>
                            </div>
                        </button>
                    </div>
                    <!-- 4 resize控件 -->
                    <div class="resizer" @mousedown="startResize($event)"></div>
                    <!-- 4 专辑-表头 -->
                    <div class="songsAlbum" ref="songs_album_ref">
                        <!-- 5 专辑排序按钮 -->
                        <button class="header-button" @click="handleSort_Album">
                            <span>专辑</span>
                            <!-- 6 排序内容 -->
                            <div class="sort-content">
                                <img :src="sortingStates_Album[currentSortingIndex_Album].icon" class="sort-icon" />
                                <span style="font-size:13px; color: #aaa;">{{
                                    sortingStates_Album[currentSortingIndex_Album].text
                                }}</span>
                            </div>
                        </button>
                    </div>
                    <!-- 4 喜欢-表头 -->
                    <div class="likes">
                        <button class="header-button">
                            <span>喜欢</span>
                        </button>
                    </div>
                    <!-- 4 时长-表头 -->
                    <div class="songsDuration">
                        <!-- 5 时长排序按钮 -->
                        <button class="header-button" @click="handleSort_Duration">
                            <span>时长</span>
                            <!-- 6 排序内容 -->
                            <div class="sort-content">
                                <img :src="sortingStates_Duration[currentSortingIndex_Duration].icon"
                                    class="sort-icon" />
                                <span style="font-size:13px; color: #aaa;">{{
                                    sortingStates_Duration[currentSortingIndex_Duration].text
                                }}</span>
                            </div>
                        </button>
                    </div>
                </div>
                <!-- 3 歌曲列表内容 -->
                <ul v-if="!isLoading">
                    <li v-for="(track, index) in filteredTracks" :key="track.id" class="track-item"
                        ref="track_item_ref">
                        <!-- 4 左侧对齐 -->
                        <div class="align-left">
                            <!-- 5 歌曲序号 -->
                            <div class="track-count">{{ (currentPage - 1) * 1000 + index + 1 }}</div>
                            <!-- 5 封面图片 -->
                            <img class="track-cover" :src="track.al.picUrl" alt="Cover Image" />
                            <!-- 5 歌曲信息 -->
                            <div class="track-info" ref="trackInfo">
                                <!-- 6 歌曲名称 -->
                                <div class="track-name" ref="track_name_ref"
                                    :title="track.name + (track.tns ? ('\n' + track.tns) : '')">{{ track.name }}</div>
                                <!-- 6 歌手名称 -->
                                <div class="track-artist">
                                    <span v-for="(artist, index) in track.ar" :key="artist.id">
                                        <!-- 7 歌手按钮 -->
                                        <span @click="handleArtistClick(artist.id)" class="artist-button"
                                            :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                            {{ artist.name }}
                                        </span>
                                        <span v-if="index < track.ar.length - 1"> / </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <!-- 4 右侧对齐 -->
                        <div class="align-right">
                            <!-- 5 专辑名称 -->
                            <div class="track-album" ref="track_album_ref">
                                <!-- 6 专辑按钮 -->
                                <button @click="handleAlbumClick(track.al.id)" class="album-button"
                                    :title="track.al.name + (track.al.tns ? ('\n' + track.al.tns) : '')">
                                    {{ track.al.name }}
                                </button>
                            </div>
                            <!-- 5 喜欢 -->
                            <div class="likes" style="text-align: left;">
                                <img v-if="likelist.includes(track.id)" src="../assets/likes.svg"
                                    style="width: 16.8px; height: 16.8px; padding-left:10px;" />
                                <img v-else src="../assets/unlikes.svg"
                                    style="width: 16.8px; height: 16.8px; padding-left:10px;" />
                            </div>
                            <!-- 5 时长 -->
                            <div class="track-duration">{{ formatDuration(track.dt) }}</div>
                        </div>
                    </li>
                </ul>
            </div>
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

export default {
    name: 'YPlaylist',
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
            currentPage: 1, // 当前页码
            totalPages: 1,  // 总页数
            isLoading: false,   // 是否正在加载
            initialMouseX: 0,   // 鼠标初始位置
            initialAlbumWidth: 0,   // 初始专辑宽度
            deltaX: 0,  // resize控件的鼠标移动距离
            newWidth: 0,    // resize控件的新的专辑宽度
            searchQuery: '',    // 搜索关键字
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
            likelist: []    // 用户喜欢歌曲列表
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
        }
    },
    computed: {
        // 搜索过滤后的歌曲列表
        filteredTracks() {
            // 如果搜索关键字为空，则返回全部歌曲
            if (!this.searchQuery) {
                return this.playlist.tracks.slice((this.currentPage - 1) * 1000, this.currentPage * 1000);
            }
            const query = this.searchQuery.toLowerCase();
            // 否则返回包含搜索关键字的歌曲
            return this.playlist.tracks.filter(track => {
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
                const trackArtistTns = track.ar.map(artist => artist.tns[0] ? artist.tns[0].toLowerCase() : '').join(' / ');
                // 专辑名称
                const trackAlbum = track.al.name.toLowerCase();
                // 专辑别名
                const trackAlbumTns = track.al.tns[0] ? track.al.tns[0].toLowerCase() : '';
                return trackName.includes(query) || trackNameTns.includes(query) || trackArtistTns.includes(query) || trackArtist.includes(query) || trackAlbum.includes(query) || trackAlbumTns.includes(query);
            });
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
                        ? useApi('/likelist', {
                            uid: localStorage.getItem('login_uid'),
                            cookie: localStorage.getItem('login_cookie'),
                        })
                        : null,
                    this.fetchTracks(id, 1) // 并行执行 fetchTracks
                ]);

                // 更新歌单名称
                this.playlist.name = response.playlist.name;

                // 如果是我喜欢的音乐歌单，则更新歌单名称
                if (myFavoriteId && myFavoriteId.playlist[0].id == id) {
                    this.playlist.name = '我喜欢的音乐';
                }

                // 更新用户喜欢歌曲列表
                if (getLikelist) {
                    this.likelist = getLikelist.ids;
                }

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
            this.fetchTracks(this.playlistId, page);
        },
        // 格式化时间戳
        formatDate(timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        // 格式化歌曲时长
        formatDuration(duration) {
            const minutes = Math.floor(duration / 60000);
            const seconds = ((duration % 60000) / 1000).toFixed(0);
            return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            if (this.initialAlbumWidth - this.deltaX > 200) {
                this.newWidth = this.initialAlbumWidth - this.deltaX;
            }
            // 设置专辑宽度
            if (this.$refs.songs_album_ref && this.newWidth > 200) {
                this.$refs.songs_album_ref.style.width = `${this.newWidth}px`;
            }

        },
        // 根据新的专辑宽度调整歌曲名称和专辑的宽度
        resizeByNewWidth(newWidth) {
            // // 计算歌曲名称和专辑的宽度
            // const tableHeaderWidth = this.$refs.scrollable.querySelector('.table-header').offsetWidth;
            // // 计算时长的宽度
            // const trackDurationWidth = this.$refs.scrollable.querySelector('.track-duration').offsetWidth;
            // // 计算喜欢的宽度
            // const likesWidth = this.$refs.scrollable.querySelector('.likes').offsetWidth;
            // // 计算序号的宽度
            // const trackCounterWidth = this.$refs.scrollable.querySelector('.songsCounter').offsetWidth;
            // // 计算封面的宽度
            // const trackCoverWidth = this.$refs.scrollable.querySelector('.track-cover').offsetWidth;
            // // 得到歌曲名称的宽度
            // const trackNameWidth = tableHeaderWidth - trackCoverWidth - trackDurationWidth - likesWidth - trackCounterWidth - newWidth - 30;
            // // 设置歌曲名称和专辑的宽度
            // if (this.$refs.trackInfo) {
            //     this.$refs.trackInfo.forEach(element => {
            //         if (element) { // 确保元素存在
            //             element.style.width = `${trackNameWidth}px`;
            //         }
            //     });
            // }
            // 设置专辑的宽度
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
        handleSearch(input) {
            console.log('search', input);
            // 更新搜索关键字
            this.searchQuery = input;
        },
        // 处理歌手点击
        handleArtistClick(artistId) {
            console.log('Artist ID:', artistId);
            // 在这里处理点击事件，例如跳转到艺术家的详情页面
        },
        // 处理专辑点击
        handleAlbumClick(albumId) {
            console.log('Album ID:', albumId);
            // 在这里处理点击事件，例如跳转到专辑详情页面
        },
        // 切换标题排序状态
        handleSort() {
            // 切换到下一个排序状态
            this.currentSortingIndex = (this.currentSortingIndex + 1) % this.sortingStates.length;

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
                    this.playlist.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'titleAsc':
                    console.log('按标题升序排序');
                    // 处理按标题升序排序逻辑
                    this.playlist.tracks.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'titleDesc':
                    console.log('按标题降序排序');
                    // 处理按标题降序排序逻辑
                    this.playlist.tracks.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'artistAsc':
                    console.log('按歌手升序排序');
                    // 处理按歌手升序排序逻辑
                    this.playlist.tracks.sort((a, b) => a.ar[0].name.localeCompare(b.ar[0].name));
                    break;
                case 'artistDesc':
                    console.log('按歌手降序排序');
                    // 处理按歌手降序排序逻辑
                    this.playlist.tracks.sort((a, b) => b.ar[0].name.localeCompare(a.ar[0].name));
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
                    this.playlist.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按专辑升序排序');
                    // 处理按专辑升序排序逻辑
                    this.playlist.tracks.sort((a, b) => a.al.name.localeCompare(b.al.name));
                    break;
                case 'albumDesc':
                    console.log('按专辑降序排序');
                    // 处理按专辑降序排序逻辑
                    this.playlist.tracks.sort((a, b) => b.al.name.localeCompare(a.al.name));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
        // 时长排序
        sortTracks_Duration(sortKey) {
            // 根据不同的排序 key 进行排序操作
            console.log('timeDuration:', this.playlist.tracks[0].dt);
            switch (sortKey) {
                case 'default':
                    console.log('使用默认排序');
                    // 处理默认排序逻辑
                    this.playlist.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
                    break;
                case 'albumAsc':
                    console.log('按时间升序排序');
                    // 处理按时间升序排序逻辑
                    this.playlist.tracks.sort((a, b) => parseFloat(a.dt) - parseFloat(b.dt));
                    break;
                case 'albumDesc':
                    console.log('按时间降序排序');
                    // 处理按时间降序排序逻辑
                    this.playlist.tracks.sort((a, b) => parseFloat(b.dt) - parseFloat(a.dt));
                    break;
                default:
                    console.log('未知排序选项');
            }
        },
    },
    mounted() {
        // 设置专辑的宽度
    },
    beforeUnmount() {
    },
};
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

/* 2 歌曲列表 */
.table-container {
    display: flex;
    max-width: 100vw;
    overflow: hidden;
    flex-direction: column;
}

/* 3 表头 */
.table-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1;
    justify-content: space-between;
    margin-bottom: 10px;
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
    z-index: 10;
    /* 确保它位于其他内容之上 */
}

/* 4 专辑-表头 */
.songsAlbum {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    width: 230px;
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
    transition: all 0.3s;
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
    transition: all 0.3s;
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
}

/* 3 歌曲列表内容 */
li {
    margin-bottom: 5px;
}

/* 3 歌曲列表内容 */
.track-item {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin: 0px;
    padding: 7px 0px 7px 0px;
    border-radius: 10px;
    transition: all 0.3s;
}

/* 3 歌曲列表内容悬停样式 */
.track-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
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
}

/* 5 封面图片 */
.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    margin-right: 10px;
    user-select: none;
    -webkit-user-drag: none;
}

/* 5 歌曲信息 */
.track-info {
    display: flex;
    flex-direction: column;
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

/* 5 专辑名称 */
.track-album {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    width: 230px;
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

/* 5 时长 */
.track-duration {
    width: 80px;
    text-align: left;
    color: #aaa;
    font-size: 14px;
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

/* 2 分页按钮选中样式 */
.underline {
    text-decoration: underline;
}
</style>