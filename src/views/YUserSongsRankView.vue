<template>
    <YHeader :switcher="switcher" @new-position="handleNewPosition" />
    <YSongsTable :show-track-album="false" :show-track-popularity="false" :show-header="false" :show-listen-count="true"
        :local-play="true" :resortable="false" :tracks="position === 'recent' ? recentTracks : alltimeTracks"
        style="margin: 0px 20px 0px 10px;" />
</template>

<script lang="js">
import YHeader from '@/components/YHeader.vue';
import YSongsTable from '@/components/YSongsTable.vue';
import { Tracks } from '@/ncm/tracks';
import { useApi } from '@/ncm/api';
import { mapState } from 'vuex';

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
    },
    data() {
        return {
            switcher: [
                {
                    num: 0,
                    showNum: false,
                    position: 'recent',
                    display: '最近一周',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'alltime',
                    display: '所有时间',
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
                this.recentTracks = (new Tracks({
                    url: '/user/record',
                    tracks: res.weekData,
                }))._tracks;
            }).catch((err) => {
                console.log(err);
            });
            await useApi('/user/record', {
                uid: this.userId,
                type: 0,
                cookie: this.login.cookie,
            }).then((res) => {
                this.alltimeTracks = (new Tracks({
                    url: '/user/record',
                    tracks: res.allData
                }))._tracks;
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