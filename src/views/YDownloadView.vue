<template>
    <div class="main">
        <div class="title" v-if="downloading.length > 0">
            {{ $t('localsongs.downloading') }}
        </div>
        <div class="downloading font-color-high" v-if="downloading.length > 0">
            <div v-for="item in downloading" :key="`${item.track.id}--${downloadingKey}`" class="downloading-item">
                <div class="downloading-item-info">
                    <div class="downloading-item-info-title">
                        {{ item.track.name }}
                    </div>
                    <div class="downloading-item-info-progress">
                        {{ item.percent }}%
                    </div>
                </div>
                <div class="downloading-item-progress">
                    <div class="downloading-item-progress-bar" :style="{ width: item.percent + '%' }"></div>
                </div>
            </div>
        </div>
        <div class="title">
            {{ $t('localsongs.downloaded') }}
        </div>
        <YSongsTable :resortable="false" :canSendPlaylist="false" :showHeader="false" v-model="tracks"
            :showTrackPopularity="false" :id="'YLocalSongsView.vue'" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import YSongsTable from '@/components/YSongsTable.vue';
import { ITrack, TrackIds } from '@/utils/tracks';
import { YColor } from '@/utils/color';
import { ITrackWithProgress } from '@/dual/YLocalSongsView';

export default defineComponent({
    name: 'YLocalSongsView',
    components: {
        YSongsTable,
    },
    setup() {
        const store = useStore();
        return {
            download: store.state.download,
        }
    },
    data() {
        return {
            tracks: [] as ITrack[],
            downloading: [] as ITrackWithProgress[],
            downloadingKey: 0,
        };
    },
    methods: {
        async getDownloadedTracks() {
            const ids = this.download.downloadedSongIds;
            const temp = new TrackIds(ids);
            await temp.initData();
            this.tracks = temp.tracks;
        },
    },
    mounted() {
        YColor.setBackgroundColorTheme();
        this.getDownloadedTracks();
        this.download.subscriber.on({
            id: 'YLocalSongsView',
            type: 'downloaded-songs',
            func: async () => {
                await this.getDownloadedTracks();
                this.downloading = this.download.downloading;
                this.downloadingKey += 1;
            }
        });
        this.downloading = this.download.downloading;
        this.download.subscriber.on({
            id: 'YLocalSongsView',
            type: 'downloading',
            func: () => {
                this.downloading = this.download.downloading;
                this.downloadingKey += 1;
            }
        });
    },
    beforeUnmount() {
        this.download.subscriber.offAll('YLocalSongsView');
    },
})
</script>

<style lang="scss" scoped>
.main {
    padding: 0;
    text-align: left;
    margin-bottom: 20px;

    .title {
        width: inherit;
        font-size: 18px;
        margin: 10px 20px;
        font-weight: bold;
        color: var(--font-color-main);
    }

    .downloading {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: left;
        width: calc(100% - 20px);
        padding: 10px;


        .downloading-item {
            width: inherit;
            padding: 5px 0;
            display: flex;
            border-radius: 10px;

            &:hover {
                background-color: rgba(var(--foreground-color-rgb), 0.1);
            }

            .downloading-item-info {
                width: calc(100% - 10px);
                max-width: calc(100% - 30px);
                padding: 5px 15px;
                display: flex;
                justify-content: space-between;
                flex-direction: row;

                .downloading-item-info-title {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: calc(100% - 100px);
                }

                .downloading-item-info-progress {
                    width: 50px;
                    text-align: center;
                }
            }
        }
    }
}
</style>
