<template>
    <YHeader :switcher="switcher" @new-position="handleNewPosition" />
    <YSongsTable :show-track-album="false" :show-track-popularity="false" :show-header="false" :show-listen-count="true"
        :local-play="true" :resortable="false" v-model="displayTracks"
        style="margin: 0px 20px 0px 10px;" :id="'YUserSongRankView.vue'" />
</template>

<script lang="js">
import YHeader from '@/components/YHeader.vue';
import YSongsTable from '@/components/YSongsTable.vue';
import { Tracks } from '@/ncm/tracks';
import { useApi } from '@/ncm/api';
import { mapState } from 'vuex';
import { markRaw } from 'vue';

export default {
    name: 'YUserSongsRank',
    props: {
        userId: {
            type: Number,
            required: true,
        },
    },
    components: {
        YHeader,
        YSongsTable,
    },
    computed: {
        ...mapState(['login']),
        displayTracks() {
            return this.position === 'recent' ? this.recentTracks : this.alltimeTracks;
        }
    },
    data() {
        return {
            switcher: [
                {
                    num: 0,
                    showNum: false,
                    position: 'recent',
                    display: 'user_songs_rank_view.last_week',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'alltime',
                    display: 'user_songs_rank_view.alltime',
                },
            ],
            position: 'recent',
            recentTracks: [],
            alltimeTracks: [],
        };
    },
    methods: {
        handleNewPosition(position) {
            this.position = position;
        },
        async fetchUserSongsRank() {
            await useApi('/user/record', {
                uid: this.userId,
                type: 1,
                cookie: this.login.cookie,
            }).then((res) => {
                this.recentTracks = markRaw((new Tracks({
                    url: '/user/record',
                    tracks: res.weekData,
                })).tracks);
            }).catch((err) => {
                console.log(err);
            });
            await useApi('/user/record', {
                uid: this.userId,
                type: 0,
                cookie: this.login.cookie,
            }).then((res) => {
                this.alltimeTracks = markRaw((new Tracks({
                    url: '/user/record',
                    tracks: res.allData
                })).tracks);
            }).catch((err) => {
                console.log(err);
            });
        },
    },
    async mounted() {
        await this.fetchUserSongsRank();
    },
}

</script>