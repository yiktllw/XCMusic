<template>
    <transition name="playui-slide">
        <div class="container" v-if="show">
            <div class="title-bar">
                <YTitlebar :type="'play-ui'" @close-panel="show = false" />
            </div>
            <div class="main-content">
                <div class="content-left">
                    <div class="track-cover">
                        <img :src="track?.al?.picUrl" />
                    </div>
                    <div class="track-info">
                        <div class="track-name font-color-main" :title="track.name">
                            {{ track.name }}
                        </div>
                        <div class="track-artist font-color-standard">
                            <span v-for="(artist, index) in track.ar" :key="artist.id">
                                <span class="artist-button" @click="$router.push({ path: `/artist/${artist.id}` })"
                                    :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')" :key="artist.id">
                                    {{ artist.name }}
                                </span>
                                <span v-if="index < track.ar.length - 1"> /&nbsp; </span>
                            </span>
                        </div>
                        <div class="track-album font-color-standard"
                            @click="$router.push({ path: `/album/${track?.al.id}` })">
                            {{ track.al.name }}
                        </div>
                    </div>
                </div>
                <div class="content-right">
                    <div class="switcher">
                        <div class="switcher-lyric switcher-item"
                            :class="position === 'lyric' ? 'selected' : 'not-selected'" @click="position = 'lyric'">
                            歌词
                        </div>
                        <div class="switcher-wiki switcher-item"
                            :class="position === 'wiki' ? 'selected' : 'not-selected'" @click="position = 'wiki'">
                            百科
                        </div>
                        <div class="switcher-sheet switcher-item"
                            :class="position === 'sheet' ? 'selected' : 'not-selected'" @click="position = 'sheet'">
                            曲谱
                        </div>
                    </div>
                    <YScroll style="height: 50vh; margin-left: 5px; scroll-behavior: smooth;" ref="lyricContainer">
                        <div class="lyric font-color-standard" v-if="position === 'lyric' && lyrics">
                            <div class="lyric-lrc" v-if="lyrics[0]?.content">
                                <div class="before-lyric" />
                                <div class="lyric-lrc-line" v-for="(line, index) in lyrics" :key="line"
                                    :class="lineClass(index)">
                                    {{ line.content }}
                                </div>
                                <div class="after-lyric" />
                            </div>
                            <div class="lyric-yrc" v-else-if="lyrics[0]?.words">

                            </div>
                        </div>
                    </YScroll>
                </div>
            </div>
            <div class="play-bar">
                <YPlaybar :type="'play-ui'" @close-panel="show = false" />
            </div>
        </div>
    </transition>
</template>

<script lang="js">
import YPlaybar from './YPlaybar.vue';
import YTitlebar from './YTitlebar.vue';
import YScroll from './YScroll.vue';
import { Lyrics } from '@/ncm/lyric';
import { mapState } from 'vuex';
import { useApi } from '@/ncm/api';

export default {
    name: 'YPlayUI',
    components: {
        YTitlebar,
        YPlaybar,
        YScroll,
    },
    computed: {
        ...mapState({
            player: state => state.player,
        }),
    },
    data() {
        return {
            show: false,
            track: {
                id: 0,
                name: '',
                tns: '',
                al: {
                    id: 0,
                    name: '',
                    picUrl: '',
                    tns: '',
                },
                ar: [
                    {
                        id: 0,
                        name: '',
                        tns: '',
                    },
                ],
            },
            position: 'lyric',
            lyrics: null,
            currentTime: 0,
            currentLine: 0,
            timeInterval: null,
        };
    },
    emits: [
        'show-panel',
        'close-panel'
    ],
    watch: {
        show(newVal) {
            if (newVal) {
                this.$emit('show-panel');
            } else {
                setTimeout(() => {
                    this.$emit('close-panel');
                }, 300);
            }
        },
        currentLine() {
            this.$nextTick(() => {
                this.scrollToCurrentLine();
            });
        },
    },
    methods: {
        showPanel() {
            this.show = true;
        },
        closePanel() {
            this.show = false;
        },
        tooglePanel() {
            this.show = !this.show;
        },
        async getLyrics(id) {
            await useApi('/lyric/new', {
                id: id,
            }).then((res) => {
                if (res.yrc) {
                    this.lyrics = (new Lyrics({
                        type: 'yrc',
                        data: res.yrc.lyric,
                    })).lyrics;
                } else if (res.lrc) {
                    this.lyrics = (new Lyrics({
                        type: 'lrc',
                        data: res.lrc.lyric,
                    })).lyrics;
                } else {
                    this.lyrics = null;
                }
            });
        },
        lineClass(index) {
            if (index === this.currentLine) {
                return 'current-line';
            } else if (index === this.currentLine - 1 || index === this.currentLine + 1) {
                return 'near-line-1';
            } else if (index === this.currentLine - 2 || index === this.currentLine + 2) {
                return 'near-line-2';
            } else if (index === this.currentLine - 3 || index === this.currentLine + 3) {
                return 'near-line-3';
            } else if (index === this.currentLine - 4 || index === this.currentLine + 4) {
                return 'near-line-4';
            } else {
                return 'far-line';
            }
        },
        scrollToCurrentLine() {
            // 确保 ref 存在，并且有 lyrics 内容
            if (this.$refs.lyricContainer?.$el && this.lyrics.length) {
                const container = this.$refs.lyricContainer.$el;
                const currentLineElement = container.getElementsByClassName('current-line')[0];

                // 如果当前行元素存在
                if (currentLineElement) {
                    // 计算当前行在容器中的位置
                    const containerHeight = container.clientHeight;
                    const lineHeight = currentLineElement.clientHeight;
                    const lineTopOffset = currentLineElement.offsetTop;

                    // 设置滚动条位置，使当前行居中显示
                    container.scrollTop = lineTopOffset - (containerHeight) + (lineHeight / 2);
                }
            }
        }
    },
    async mounted() {
        setTimeout(() => {
            this.scrollToCurrentLine();
        }, 500);
        if (this.player.currentTrack) {
            this.track = this.player.currentTrack;
        }
        this.player.Subscribe({
            id: 'YPlayUI',
            func: async () => {
                this.track = this.player.currentTrack;
                await this.getLyrics(this.player.currentTrack.id);
            },
            type: 'track',
        })
        if (this.player.currentTrack?.id) {
            await this.getLyrics(this.player.currentTrack.id);
        }
        if (this.player.currentTrack) {
            this.currentTime = parseInt(this.player.currentTime * 1000);
        }
        this.player.Subscribe({
            id: 'YPlayUI',
            func: () => {
                this.currentTime = parseInt(this.player.currentTime * 1000);
                if (this.lyrics) {
                    for (let i = 0; i < this.lyrics.length; i++) {
                        if (this.lyrics[i]?.startTime > this.currentTime) {
                            if (this.currentLine !== i - 1) {
                                this.currentLine = i - 1;
                            }
                            break;
                        }
                    }
                    if (this.lyrics[this.lyrics.length - 1]?.startTime < this.currentTime) {
                        if (this.currentLine !== this.lyrics.length - 1) {
                            this.currentLine = this.lyrics.length - 1;
                        }
                    }
                }
            },
            type: 'allTime',
        });
        this.timeInterval = setInterval(() => {
            this.scrollToCurrentLine();
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.timeInterval);
        this.player.UnSubscribe({
            id: 'YPlayUI',
            type: 'track',
        });
        this.player.UnSubscribe({
            id: 'YPlayUI',
            type: 'allTime',
        });
        this.$emit('close-panel');
    },
};
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    background-color: #131319;

    .title-bar {
        width: 100%;
        height: 50px;
    }

    .main-content {
        display: flex;
        flex-direction: row;
        width: 100%;

        .content-left {
            margin: auto;

            .track-cover {
                width: 40vh;
                max-width: 40vw;

                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 10px;
                }
            }

            .track-info {
                margin: 20px 0px 0px 0px;
                width: 40vh;
                max-width: 40vw;
                display: flex;
                flex-direction: column;
                align-items: start;

                .track-name {
                    text-align: left;
                    font-size: 18px;
                    font-weight: bold;
                    max-width: 100%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .track-artist {
                    margin: 8px 0px 0px 0px;
                    max-width: 100%;
                    text-align: left;
                    font-size: 16px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;

                    .artist-button {
                        cursor: pointer;

                        &:hover {
                            color: var(--font-color-main);
                        }
                    }
                }

                .track-album {
                    margin: 8px 0px 0px 0px;
                    max-width: 100%;
                    text-align: left;
                    font-size: 16px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    cursor: pointer;

                    &:hover {
                        color: var(--font-color-main);
                    }
                }
            }
        }

        .content-right {
            height: 100%;
            width: 50vw;
            display: flex;
            align-items: start;
            flex-direction: column;

            .switcher {
                display: flex;
                flex-direction: row;
                background-color: rgba(255, 255, 255, .1);
                border-radius: 20px;
                padding: 3px 3px;
                width: 146px;
                margin: 0 0 10px 0;

                .switcher-item {
                    padding: 2px 8px 4px 8px;
                }

                .selected {
                    color: var(--font-color-main);
                    font-weight: bold;
                    background-color: rgba(255, 255, 255, .2);
                    border-radius: 20px;
                }

                .not-selected {
                    color: var(--font-color-standard);
                    cursor: pointer;

                    &:hover {
                        color: var(--font-color-main);
                    }
                }
            }

            .lyric {
                width: 32.1vw;

                .lyric-lrc {
                    transition: all 0.3s;

                    .before-lyric {
                        height: 25vh;
                    }

                    .after-lyric {
                        height: 25vh;
                    }

                    .lyric-lrc-line {
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        padding: 5px 0;
                        width: 100%;
                        text-align: left;
                    }

                    .current-line {
                        color: var(--font-color-main);
                        font-size: 22px;
                        padding: 10px 0;
                    }

                    .near-line-1 {
                        opacity: 1;
                    }

                    .near-line-2 {
                        opacity: .8;
                    }

                    .near-line-3 {
                        opacity: .6;
                    }

                    .near-line-4 {
                        opacity: .4;
                    }

                    .far-line {
                        opacity: .2;
                    }
                }
            }
        }
    }

    .play-bar {
        width: 100%;
        height: 85px;
    }
}
</style>