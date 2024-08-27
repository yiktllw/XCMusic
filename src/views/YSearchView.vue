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
                <YSongsTable :resortable="false" :canSendPlaylist="false" :showTrackCover="true"
                    :tracks="this.switcher[0].tracks" />
            </div>
            <div class="albums" v-else-if="position === 'album'">
                <YPlaylistList :playlists="switcher[1].playlists" type="album" />
            </div>
            <div class="playlists" v-else-if="position === 'playlist'">
                <YPlaylistList :playlists="switcher[2].playlists" />
            </div>
        </div>
    </YScroll>
</template>

<script lang="js">
import YSongsTable from '@/components/YSongsTable.vue';
import YPlaylistList from '@/components/YPlaylistList.vue';
import YScroll from '@/components/YScroll.vue';
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
    components: {
        YSongsTable,
        YScroll,
        YPlaylistList,
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
                    position: 'artist'
                },
                {
                    display: '歌词',
                    position: 'lyric'
                },
                {
                    display: '用户',
                    position: 'user'
                },
            ],
        };
    },
    watch: {
        search() {
            this.fetchTracks();
        }
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
            this.switcher[0].tracks = result.result.songs;
            console.log('fetchTracks', result.result.songs);
        },
        async fetchPlaylists() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 1000,
                limit: 100,
            });
            this.switcher[2].playlists = result.result.playlists;
            console.log('fetchPlaylists', result.result.playlists);
        },
        async fetchAlbums() {
            let result = await useApi('/cloudsearch', {
                keywords: this.search,
                type: 10,
                limit: 100,
            });
            this.switcher[1].playlists = result.result.albums;
            console.log('fetchAlbums', result.result.albums);
        },
    },
    mounted() {
        console.log('mounted');
        this.fetchTracks();
        this.fetchPlaylists();
        this.fetchAlbums();
    },
}

</script>


<style scoped>
.switcher {
    display: flex;
    color: #bbb;
    font-size: 16px;
    align-items: center;
    margin-top: 10px;
    margin-left: 10px;
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
    margin-top: 20px;
    padding: 0 10px;
}
</style>