<template>
    <div class="main">
        <YHeader :switcher="switcher" @new-position="handlePosition" />
        <YSongsTable :resortable="false" :canSendPlaylist="false" :showHeader="false" v-model="tracks" :showTrackPopularity="false"
            :id="'YLocalSongsView.vue'" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import YSongsTable from '@/components/YSongsTable.vue';
import YHeader from '@/components/YHeader.vue';
import { TrackIds } from '@/utils/tracks';

export default defineComponent({
    name: 'YLocalSongsView',
    components: {
        YSongsTable,
        YHeader,
    },
    setup() {
        const store = useStore();
        return {
            download: store.state.download,
        }
    },
    computed: {
    },
    data() {
        return {
            tracks: [] as any,
            switcher: [
                {
                    num: 0,
                    showNum: false,
                    position: 'download',
                    display: 'header.local_music.downloaded_songs',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'local',
                    display: 'header.local_music.local_songs',
                },
            ],
        };
    },
    methods: {
        async getDownloadedTracks() {
            const ids = this.download.downloadedSongIds;
            const temp = new TrackIds(ids);
            await temp.initData();
            this.tracks = temp.tracks;
        },
        handlePosition(position: string) {
            if (position === 'download') {
                this.getDownloadedTracks();
            } else {
                this.tracks = [];
            }
        },
    },
    mounted() {
        this.getDownloadedTracks();
        this.download.Subscribe({
            id: 'YLocalSongsView',
            type: 'downloaded-songs',
            func: async () => {
                await this.getDownloadedTracks();
            }
        })
    },
    beforeUnmount() {
        this.download.UnSubscribe({
            id: 'YLocalSongsView',
            type: 'downloaded-songs',
        })
    },
})
</script>

<style lang="scss" scoped>
.main {
    padding: 0;
}
</style>