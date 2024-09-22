<template>
    <div class="add-to-playlist">
        <YWindow ref="window" @new-window-state="handleNewWindowState">
            <template #header>
                <span style="font-size: 19px; font-weight: bold;">
                    收藏到歌单
                </span>
            </template>
            <YScroll>
                <div class="playlists" style="max-height: 432.1px;">
                    <div class="playlist" v-for="playlist in login.userPlaylists" :key="playlist.id"
                        @click="addToPlaylist(playlist.id)">
                        <img class="img" :src="playlist.img + '?param=50y50'" />
                        <div class="playlist-name">{{ playlist.name }}</div>
                    </div>
                </div>
            </YScroll>
        </YWindow>
    </div>
</template>

<script>
import YWindow from '@/components/YWindow.vue';
import YScroll from '@/components/YScroll.vue';
import { useApi } from '@/ncm/api';
import { mapState } from 'vuex';

export default {
    name: 'YAddToPlaylist',
    props: {
        ids: {
            type: Array,
            required: true,
        },
    },
    emits: [
        'new-window-state'
    ],
    components: {
        YWindow,
        YScroll,
    },
    computed: {
        ...mapState({
            login: state => state.login,
        })
    },
    data() {
        return {
            userPlaylists: [],
        };
    },
    methods: {
        async addToPlaylist(playlistId) {
            await useApi('/playlist/tracks', {
                op: 'add',
                pid: playlistId,
                tracks: this.ids.join(','),
                cookie: this.login.cookie,
            })
                .then((res) => {
                    console.log('Track added to playlist:', res);
                })
                .catch((error) => {
                    console.error('Failed to add track to playlist:', error);
                });
            this.$refs.window.closeWindow();
            this.login.refreshUserPlaylists();
        },
        handleNewWindowState(val) {
            this.$emit('new-window-state', val);
        },
    },
    mounted() {
        this.login.subscribe({
            id: 'YAddToPlaylist',
            func: ()=>{
                this.userPlaylists = this.login.userPlaylists;
            },
            type: 'userPlaylists',
        })
    },
    beforeUnmount() {
        this.login.unSubscribe({
            id: 'YAddToPlaylist',
            type: 'userPlaylists',
        });
    },
}

</script>

<style scoped>
.add-to-playlist {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
}

.playlists {
    display: flex;
    flex-direction: column;
    width: calc(100% - 20px);
    padding: 10px 10px;
}

.playlist {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 11px 15px 11px 15px;
    border-radius: 10px;
    background-color: rgb(45, 45, 55);
}

.playlist:hover {
    background-color: rgba(255, 255, 255, .1);
}

.img {
    width: 50px;
    height: 50px;
    border-radius: 6px;
}

.playlist-name {
    margin-left: 10px;
    font-size: 16px;
    color: #ddd;
    font-weight: bold;
}
</style>