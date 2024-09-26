<template>
    <!-- 滚动容器 -->
    <YScroll style="max-height:100%;">
        <!-- 导航 -->
        <div class="switcher">
            <button class="switcher-item" v-for="(item, index) in switcher" :key="index"
                @click="handleSwitcher(item.position)">
                <span :class="{ 'choosed-text': item.position === position }" style="font-size: 16px; color:#fff;"
                    :style="{ 'font-weight': item.position === position ? 'bold' : '500', 'color': item.position === position ? '#fff' : '#bbb' }">{{
                        item.display }}</span>
                <div class="choosed" style="transform: translate(7px,4px); width: 60%; height: 4px; border-radius: 2px;"
                    v-if="item.position === position">
                </div>
            </button>
        </div>
        <!-- 内容 -->
        <div class="content">
            <!-- 歌曲 -->
            <div class="songs" v-if="position === 'song'">
                <YSongsTable :resortable="false" stickyTop="50px" :canSendPlaylist="false" :showTrackCover="true"
                    :tracks="this.switcher[0].tracks" :id="'YSearchView.vue'" />
                <YPage v-model="songsPage" />
            </div>
            <!-- 专辑 -->
            <div class="albums" v-else-if="position === 'album'">
                <YPlaylistList :playlists="switcher[1].playlists" stickyTop="50px" type="album" />
                <YPage v-model="albumsPage" />
            </div>
            <!-- 歌单 -->
            <div class="playlists" v-else-if="position === 'playlist'">
                <YPlaylistList :playlists="switcher[2].playlists" stickyTop="50px" />
                <YPage v-model="playlistsPage" />
            </div>
            <!-- 歌手 -->
            <div class="artists" v-else-if="position === 'artist'">
                <YArtistList :artists="switcher[3].artists" />
                <YPage v-model="artistsPage" />
            </div>
            <!-- 歌词 -->
            <div class="lyrics" v-else-if="position === 'lyric'">
                <YSearchLyrics :listWithLyrics="switcher[4].lyricsList" />
                <YPage v-model="lyricsPage" />
            </div>
            <!-- 用户 -->
            <div class="users" v-else-if="position === 'user'">
                <YArtistList :artists="switcher[5].users" type="user" />
                <YPage v-model="usersPage" />
            </div>
        </div>
    </YScroll>
</template>

<script lang="js">
import YSongsTable from '@/components/YSongsTable.vue';
import YPlaylistList from '@/components/YPlaylistList.vue';
import YArtistList from '@/components/YArtistList.vue';
import YSearchLyrics from '@/components/YSearchLyrics.vue';
import YScroll from '@/components/YScroll.vue';
import YPage from '@/components/YPage.vue';
import { Tracks } from '@/ncm/tracks';
import { YPageC } from '@/tools/YPageC';
import { setBackgroundColor } from '@/ncm/color';
import { useApi } from '../ncm/api';
import { markRaw } from 'vue';

export default {
    name: 'YSearchView',
    props: {
        // 搜索关键字
        search: {
            type: String,
            required: true
        },
        // 搜索位置
        position: {
            type: String,
            default: 'song'
        }
    },
    watch: {
        // 监听搜索位置变化, 切换搜索位置
        position(newPosition) {
            this.fetchData(newPosition);
            if (newPosition !== 'default') {
                this.lastPosition = newPosition;
            }
        },
        // 监听搜索关键字变化, 重新搜索
        search() {
            this.fetchData(this.position);
        }
    },
    components: {
        YSongsTable,
        YScroll,
        YPlaylistList,
        YArtistList,
        YSearchLyrics,
        YPage,
    },
    data() {
        return {
            // 导航
            switcher: [
                {
                    display: '歌曲',
                    position: 'song',
                    tracks: [],
                },
                {
                    display: '专辑',
                    position: 'album',
                    playlists: [],
                },
                {
                    display: '歌单',
                    position: 'playlist',
                    playlists: [],
                },
                {
                    display: '歌手',
                    position: 'artist',
                    artists: [],
                },
                {
                    display: '歌词',
                    position: 'lyric',
                    lyricsList: [],
                },
                {
                    display: '用户',
                    position: 'user',
                    users: [],
                },
            ],
            // 上次搜索位置
            lastPosition: 'song',
            songsPage: new YPageC(1),
            albumsPage: new YPageC(1),
            playlistsPage: new YPageC(1),
            artistsPage: new YPageC(1),
            lyricsPage: new YPageC(1),
            usersPage: new YPageC(1),
        };
    },
    methods: {
        // 切换搜索位置
        handleSwitcher(position) {
            console.log('switch position', position);
            this.$router.push({ path: `/search/${this.search}/${position}` });
        },
        // 搜索歌曲
        async fetchTracks(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1,
                limit: 100,
                offset: (this.songsPage.current - 1) * 100,
            })
                .then((result) => {
                    this.switcher[0].tracks = markRaw((new Tracks({
                        url: '/cloudsearch?type=1',
                        tracks: result.result.songs,
                    })).tracks);
                    if (newPageInstance) {
                        this.songsPage = new YPageC(Math.ceil(result.result.songCount / 100));
                    }
                    this.songsPage.onPageChange = () => {
                        this.fetchTracks(false);
                    };
                })
                .catch((err) => {
                    console.log('fetchTracks', err);
                });
        },
        // 搜索歌单
        async fetchPlaylists(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1000,
                limit: 100,
                offset: (this.playlistsPage.current - 1) * 100,
            })
                .then(result => {
                    this.switcher[2].playlists = result.result.playlists?.map((playlist) => {
                        return {
                            ...playlist,
                            _picUrl: playlist.coverImgUrl + '?param=40y40',
                        }
                    });
                    if (newPageInstance) {
                        this.playlistsPage = new YPageC(Math.ceil(result.result.playlistCount / 100));
                    }
                    this.playlistsPage.onPageChange = () => {
                        this.fetchPlaylists(false);
                    };
                    console.log('fetchPlaylists', result.result.playlists);
                })
                .catch((err) => {
                    console.log('fetchPlaylists', err);
                });
        },
        // 搜索专辑
        async fetchAlbums(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 10,
                limit: 100,
                offset: (this.albumsPage.current - 1) * 100,
            })
                .then(result => {
                    this.switcher[1].playlists = result.result.albums?.map((album) => {
                        return {
                            ...album,
                            _picUrl: album.picUrl + '?param=40y40',
                        }
                    });
                    if (newPageInstance) {
                        this.albumsPage = new YPageC(Math.ceil(result.result.albumCount / 100));
                    }
                    this.albumsPage.onPageChange = () => {
                        this.fetchAlbums(false);
                    };
                })
                .catch((err) => {
                    console.log('fetchAlbums', err);
                });
        },
        // 搜索歌手
        async fetchArtists(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 100,
                limit: 100,
                offset: (this.artistsPage.current - 1) * 100,
            })
                .then(result => {
                    this.switcher[3].artists = result.result.artists?.map((artist) => {
                        return {
                            ...artist,
                            _picUrl: artist.picUrl + '?param=130y130',
                        }
                    });
                    if (newPageInstance) {
                        this.artistsPage = new YPageC(Math.ceil(result.result.artistCount / 100));
                    }
                    this.artistsPage.onPageChange = () => {
                        this.fetchArtists(false);
                    };
                })
                .catch((err) => {
                    console.log('fetchArtists', err);
                });
        },
        // 搜索歌词
        async fetchLyrics(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1006,
                limit: 100,
            })
                .then(result => {
                    this.switcher[4].lyricsList = markRaw((new Tracks({
                        url: '/cloudsearch?type=1006',
                        tracks: result.result.songs,
                    })).tracks);
                    if (newPageInstance) {
                        this.lyricsPage = new YPageC(Math.ceil(result.result.songCount / 100));
                    }
                    this.lyricsPage.onPageChange = () => {
                        this.fetchLyrics(false);
                    };
                })
                .catch((err) => {
                    console.log('fetchLyrics', err);
                });
        },
        // 搜索用户
        async fetchUsers(newPageInstance = true) {
            await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1002,
                limit: 100,
                offset: (this.usersPage.current - 1) * 100,
            })
                .then(result => {
                    this.switcher[5].users = result.result.userprofiles?.map((user) => {
                        return {
                            ...user,
                            _picUrl: user.avatarUrl + '?param=130y130',
                        }
                    });
                    if (newPageInstance) {
                        this.usersPage = new YPageC(Math.ceil(result.result.userprofileCount / 100));
                    }
                    this.usersPage.onPageChange = () => {
                        this.fetchUsers(false);
                    };
                })
                .catch((err) => {
                    console.log('fetchUsers', err);
                });
        },
        fetchData(position) {
            switch (position) {
                case 'song':
                    this.fetchTracks();
                    break;
                case 'album':
                    this.fetchAlbums();
                    break;
                case 'playlist':
                    this.fetchPlaylists();
                    break;
                case 'artist':
                    this.fetchArtists();
                    break;
                case 'lyric':
                    this.fetchLyrics();
                    break;
                case 'user':
                    this.fetchUsers();
                    break;
                case 'default':
                    this.$router.push({ path: `/search/${this.search}/${this.lastPosition}` });
                    break;
            }
        }
    },
    mounted() {
        this.fetchData(this.position);
        // 设置背景颜色
        setBackgroundColor({ r: 19, g: 19, b: 25 });
        // 当前位置为默认位置时, 跳转到上次搜索位置
        this.position === 'default' ? this.$router.push({ path: `/search/${this.search}/${this.lastPosition}` }) : null;
    },
}

</script>


<style scoped>
.switcher {
    display: flex;
    font-size: 16px;
    align-items: center;
    padding-top: 10px;
    margin-left: 10px;
    padding-bottom: 20px;
    position: sticky;
    top: 0px;
    z-index: 1;
    width: 100%;
    background-color: #131319;
    backdrop-filter: blur(10px);
    /* mix-blend-mode: multiply; */
}

.switcher-item {
    height: 20px;
    margin: 0 7px;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

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

.content {
    padding: 0 10px;
}
</style>