<template>
    <div class="main">
        <YHeader :switcher="switcher" @new-position="handlePosition" />
        <YSongsTable :resortable="false" :canSendPlaylist="false" :showHeader="false" v-model="tracks"
            :showTrackPopularity="false" :id="'YLocalSongsView.vue'" v-if="position === 'download'" />
        <div class="local" v-else>
            <div class="path-info font-color-main">
                <div class="path-title">
                    {{ $t('localsongs.addpaths') + ' :' }}
                </div>
                <div class="path-list font-color-high">
                    <div class="path-item" v-for="path in localPaths" :key="path">
                        {{ path }}
                    </div>
                </div>
            </div>
            <YSongsTable :resortable="false" :canSendPlaylist="false" :showHeader="false" v-model="localTracks"
                :showTrackPopularity="false" :show-track-likes="false" :id="'YLocalSongsView.vue-2'" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { useStore } from 'vuex';
import YSongsTable from '@/components/YSongsTable.vue';
import YHeader from '@/components/YHeader.vue';
import { ITrack, TrackIds, Tracks } from '@/utils/tracks';
import { YColor } from '@/utils/color';

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
            setting: store.state.setting,
        }
    },
    computed: {
    },
    data() {
        return {
            tracks: [] as ITrack[],
            localTracks: [] as ITrack[],
            localPaths: [] as string[],
            position: 'download',
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
        async handlePosition(position: string) {
            this.position = position;
            if (position === 'download') {
                this.getDownloadedTracks();
            } else {
                const paths = toRaw(this.setting.download.localPaths);
                let res: any[] = [];
                for (const path of paths) {
                    res = res.concat(await window.electron.ipcRenderer.invoke('get-local-tracks', path));
                }
                this.localTracks = (new Tracks({
                    url: 'local',
                    tracks: res,
                })).tracks;
            }
        },
    },
    mounted() {
        YColor.setBackgroundColorTheme();
        this.getDownloadedTracks();
        this.localPaths = toRaw(this.setting.download.localPaths);
        this.download.subscriber.on({
            id: 'YLocalSongsView',
            type: 'downloaded-songs',
            func: async () => {
                await this.getDownloadedTracks();
            }
        })
    },
    beforeUnmount() {
        this.download.subscriber.offAll('YLocalSongsView');
    },
})
</script>

<style lang="scss" scoped>
.main {
    padding: 0;

    .local {
        width: 100%;
        .path-info {
            padding: 0 0 0px 30px;
            width: fit-content;
            font-weight: bold;
            text-align: left;
            .path-title {
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .path-list {
                font-size: 14px;
                
                .path-item{
                    padding: 5px 0;
                }
            }
        }
    }
}
</style>