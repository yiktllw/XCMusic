<template>
    <div class="main font-color-main">
        <div class="track" v-if="type === 'song'" :key="trackKey">
            <div class="cover" v-if="track.picUrl">
                <img :src="track.picUrl + '?param=100y100'" />
            </div>
            <div class="cover placeholder" v-else>
            </div>
            <div class="info">
                <div class="track-name" :title="track.name">
                    {{ track.name }}
                </div>
                <div class="track-album" :title="track.al.name" @click="openAlbum(track.al.id)">
                    专辑:&nbsp;{{ track.al.name }}
                </div>
                <div class="track-artist">
                    歌手:&nbsp;<span v-for="(artist, index) in track.ar" :key="index" :title="artist.name"
                        @click="openArtist(artist.id)">
                        {{ artist.name }}
                        <span v-if="index !== track.ar.length - 1">&nbsp;/&nbsp;</span>
                    </span>
                </div>
            </div>
        </div>
        <YComment :type="type" :id="id" :key="id" />
    </div>
</template>

<script lang="js">
import YComment from '@/components/YComment.vue';
import { YTrackC } from '@/tools/YTrackC';
import { setBackgroundColor, getColorFromImg } from '@/ncm/color';

export default {
    name: 'YCommentView',
    components: {
        YComment,
    },
    props: {
        type: {
            type: String,
            required: true,
        },
        id: {
            type: Number,
            required: true,
        },
    },
    watch: {
        id(newId) {
            this.track = this.type === 'song' ? new YTrackC(newId) : new YTrackC(null);
            this.track.onTrackLoaded = async () => {
                await this.trackLoaded();
            }
        }
    },
    data() {
        return {
            track: this.type === 'song' ? new YTrackC(this.id) : new YTrackC(null),
            trackKey: 0,
        };
    },
    methods: {
        openAlbum(id) {
            this.$router.push({ path: `/album/${id}` });
        },
        openArtist(id) {
            this.$router.push({ path: `/artist/${id}` });
        },
        async trackLoaded() {
            this.trackKey++;
            let color = await getColorFromImg(this.track.picUrl + '?param=30y30', document);
            if (color) {
                setBackgroundColor(color);
            } else {
                setBackgroundColor({ r: 19, g: 19, b: 25 });
            }
        }
    },
    mounted() {
        this.track.onTrackLoaded = async () => {
            await this.trackLoaded();
        };
    },
}
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-direction: column;
    text-align: left;
    overflow: hidden;
    padding: 20px;

    .track {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 20px;

        .cover {
            width: 100px;
            height: 100px;
            margin-right: 10px;

            img {
                width: 100px;
                height: 100px;
                border-radius: 10px;
            }
        }

        .placeholder {
            background-color: rgba(var(--foreground-color-rgb), 0.3);
            border-radius: 10px;
        }

        .info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            .track-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .track-album,
            .track-artist {
                font-size: 14px;
                margin-bottom: 5px;
                color: var(--font-color-standard);
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;

                &:hover {
                    color: var(--font-color-main);
                }
            }
        }
    }
}
</style>