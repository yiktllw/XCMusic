<template>
    <YScroll style="max-height:100%;">
        <div class="switcher">
            <button class="switcher-item" v-for="(item, index) in switcher" :key="index"
                @click="handleSwitcher(item.position)">
                <span :class="{ 'choosed-text': item.position === position }" style="font-size: 16px; color:#fff;"
                    :style="{ 'font-weight': item.position === position ? 'bold' : '500', 'color': item.position === position ? '#fff' : '#bbb' }">{{
                        item.display }}</span>
                <div class="choosed" style="transform: translate(7px,4px); width: 60%; height: 4px; border-radius: 2px;"
                    v-show="item.position === position">
                </div>
            </button>
        </div>
        <div class="content">
            <div class="songs" v-if="position === 'song'">
                <YSongsTable :resortable="false" stickyTop="50px" :canSendPlaylist="false" :showTrackCover="true"
                    :tracks="this.switcher[0].tracks" />
            </div>
            <div class="albums" v-else-if="position === 'album'">
                <YPlaylistList :playlists="switcher[1].playlists" stickyTop="50px" type="album" />
            </div>
            <div class="playlists" v-else-if="position === 'playlist'">
                <YPlaylistList :playlists="switcher[2].playlists" stickyTop="50px" />
            </div>
            <div class="artists" v-else-if="position === 'artist'">
                <YArtistList :artists="switcher[3].artists" />
            </div>
            <div class="lyrics" v-else-if="position === 'lyric'">
                <YSearchLyrics :listWithLyrics="switcher[4].lyricsList" />
            </div>
            <div class="users" v-else-if="position === 'user'">
                <YArtistList :artists="switcher[5].users" type="user" />
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
import { setBackgroundColor } from '@/ncm/color';
import { useApi } from '../ncm/api';

export default {
    name: 'YSearchView',
    props: {
        search: {
            type: String,
            required: true
        },
        position: {
            type: String,
            default: 'song'
        }
    },
    watch: {
        position(newPosition) {
            switch (newPosition) {
                case 'song':
                    this.fetchTracks();
                    this.lastPosition = 'song';
                    break;
                case 'album':
                    this.fetchAlbums();
                    this.lastPosition = 'album';
                    break;
                case 'playlist':
                    this.fetchPlaylists();
                    this.lastPosition = 'playlist';
                    break;
                case 'artist':
                    this.fetchArtists();
                    this.lastPosition = 'artist';
                    break;
                case 'lyric':
                    this.fetchLyrics();
                    this.lastPosition = 'lyric';
                    break;
                case 'user':
                    this.fetchUsers();
                    this.lastPosition = 'user';
                    break;
                case 'default':
                    this.$router.push({ path: `/search/${this.search}/${this.lastPosition}` });
                    break;
            }
        },
        search() {
            switch (this.position) {
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
    components: {
        YSongsTable,
        YScroll,
        YPlaylistList,
        YArtistList,
        YSearchLyrics,
    },
    data() {
        return {
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
            lastPosition: 'song',
        };
    },
    methods: {
        handleSwitcher(position) {
            console.log('switch position', position);
            this.$router.push({ path: `/search/${this.search}/${position}` });
        },
        async fetchTracks() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1,
                limit: 100,
            });
            this.switcher[0].tracks = result.result.songs?.map((song) => {
                return {
                    ...song,
                    _picUrl: song.al.picUrl + '?param=40y40',
                }
            });
            // console.log('fetchTracks', result.result.songs);
        },
        async fetchPlaylists() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1000,
                limit: 100,
            });
            this.switcher[2].playlists = result.result.playlists?.map((playlist) => {
                return {
                    ...playlist,
                    _picUrl: playlist.coverImgUrl + '?param=40y40',
                }
            });
            console.log('fetchPlaylists', result.result.playlists);
        },
        async fetchAlbums() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 10,
                limit: 100,
            });
            this.switcher[1].playlists = result.result.albums?.map((album) => {
                return {
                    ...album,
                    _picUrl: album.picUrl + '?param=40y40',
                }
            });
            // console.log('fetchAlbums', result.result.albums);
        },
        async fetchArtists() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 100,
                limit: 100,
            });
            this.switcher[3].artists = result.result.artists?.map((artist) => {
                return {
                    ...artist,
                    _picUrl: artist.picUrl + '?param=130y130',
                }
            });
            // console.log('fetchArtists', result.result.artists);
        },
        async fetchLyrics() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1006,
                limit: 100,
            });
            this.switcher[4].lyricsList = result.result.songs;
            console.log('fetchLyrics', result.result.songs);
        },
        async fetchUsers() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1002,
                limit: 100,
            });
            this.switcher[5].users = result.result.userprofiles?.map((user) => {
                return {
                    ...user,
                    _picUrl: user.avatarUrl + '?param=130y130',
                }
            });
            // console.log('fetchUsers', result.result.userprofiles);
        }
    },
    mounted() {
        this.fetchTracks();
        setBackgroundColor({ r: 19, g: 19, b: 25 });
        this.position === 'default' ? this.$router.push({ path: `/search/${this.search}/${this.lastPosition}` }) : null;
    },
}

</script>


<style scoped>
.switcher {
    display: flex;
    color: #bbb;
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