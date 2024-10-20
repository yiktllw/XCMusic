<template>
    <transition name="playui-slide">
        <div class="container theme-dark" v-if="show" ref="playuiContainer">
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
                                <span class="artist-button"
                                    @click="$router.push({ path: `/artist/${artist.id}` }); show = false;"
                                    :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')" :key="artist.id">
                                    {{ artist.name }}
                                </span>
                                <span v-if="index < track.ar.length - 1"> /&nbsp; </span>
                            </span>
                        </div>
                        <div class="track-album font-color-standard"
                            @click="$router.push({ path: `/album/${track?.al.id}` }); show = false"
                            :title="track.al.name + (track.al.tns ? ('\n' + track.al.tns) : '')">
                            {{ track.al.name }}
                        </div>
                    </div>
                </div>
                <div class="content-right">
                    <div class="switcher">
                        <div class="switcher-lyric switcher-item"
                            :class="position === 'lyric' ? 'selected' : 'not-selected'" @click="position = 'lyric'">
                            {{ $t('playui.lyric') }}
                        </div>
                        <div class="switcher-wiki switcher-item"
                            :class="position === 'wiki' ? 'selected' : 'not-selected'" @click="position = 'wiki'">
                            {{ $t('playui.wiki') }}
                        </div>
                        <div class="switcher-sheet switcher-item"
                            :class="position === 'sheet' ? 'selected' : 'not-selected'" @click="position = 'sheet'">
                            {{ $t('playui.sheet') }}
                        </div>
                    </div>
                    <YScroll class="yscroll" style="height: calc(100vh - 350px); margin-left: 5px; "
                        ref="lyricContainer">
                        <div class="lyric font-color-standard" v-if="position === 'lyric' && lyrics">
                            <div class="lyric-a">
                                <div class="before-lyric" />
                                <div class="lyric-line" v-for="(line, index) in lyrics" :key="line"
                                    :class="lineClass(index)" :style="{
                                        'transform': index === currentLine ? 'scale(1.375)' : 'scale(1)',
                                        'transition': ` color, transform 0.5s ease`
                                    }">
                                    <span v-if="line.content" :style="{
                                        'color': index === currentLine ? 'var(--font-color-main)' : 'var(--font-color-standard)',
                                        'transition': `color 0.5s ease`
                                    }">
                                        <span v-if="typeof line.content !== 'string'">
                                            <span v-for="(content, cindex) in line.content" :key="cindex">
                                                <img v-if="content.li" :src="content.li + '?param=22y22'"
                                                    style="border-radius: 10px; margin: 0 2px -4px 8px;">
                                                {{ content.tx }}
                                            </span>
                                        </span>
                                        <span v-else>
                                            {{ line.content }}
                                        </span>
                                    </span>
                                    <span v-else-if="line.words" class="yrc-line">
                                        <span v-for="(word, windex) in line.words" :key="windex" :style="{
                                        }" class="yrc-line-item">
                                            <span class="item-ori">
                                                {{ word.text }}
                                            </span>
                                            <span class="item-standard font-color-standard" v-if="index >= currentLine">
                                                {{ word.text }}
                                            </span>
                                            <span class="item-white font-color-main" :style="{
                                                'transition': `clip-path ${((word.duration ?? 0) + (word.startTime ?? line.startTime) > currentTime) ? ((word.duration ?? 0) / 1000) : 0}s linear, color 0.5s ease`,
                                                clipPath: (word.startTime <= currentTime) ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                                                'color': (index === currentLine) ? 'var(--font-color-main)' : 'var(--font-color-standard)',
                                            }">
                                                {{ word.text }}
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                <div class="after-lyric" />
                            </div>
                        </div>
                        <div class="wiki font-color-main" v-else-if="position === 'wiki'">
                            <div class="wiki-content">
                                <div class="wiki-first-listen" v-if="firstListen?.creatives?.length > 0">
                                    <div class="first-listen-main-title">
                                        {{ firstListen.uiElement.mainTitle.title }}
                                    </div>
                                    <div class="first-listen-content">
                                        <div class="content-first-listen">
                                            <div class="first-listen-title font-color-main">
                                                {{ firstListenTitle }}
                                            </div>
                                            <div class="first-listen-period font-color-main">
                                                {{ firstListenPeriod }}
                                            </div>
                                            <div class="first-listen-time font-color-main">
                                                {{ firstListenTime }}
                                            </div>
                                        </div>
                                        <div class="listen-count">
                                            <div class="listen-count-title font-color-main">
                                                {{ listenCountTitle }}
                                            </div>
                                            <div class="listen-count-content font-color-main">
                                                {{ listenCountContent }}
                                            </div>
                                            <div class="listen-count-info">
                                                {{ listenCountInfo }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="wiki-song">
                                    <div class="wiki-song-title">
                                        {{ songWiki?.uiElement.mainTitle.title }}
                                    </div>
                                    <div class="wiki-song-content">
                                        <div class="wiki-song-content-item" v-for="(creative, index) in creatives"
                                            :key="index">
                                            <div class="item-title">
                                                {{ creative.title }}
                                            </div>
                                            <div class="item-content">
                                                <span v-for="(content, cindex) in creative.content" :key="cindex">
                                                    {{ content }}
                                                    <span v-if="cindex < creative.content.length - 1"> 、 </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="sheet font-color-main" v-else-if="position === 'sheet'">
                            <div class="sheet-list" v-if="sheets">
                                <div class="sheet-item" v-for="(sheet, index) in sheets" :key="index"
                                    @click="openSheet(sheet)">
                                    <div class="sheet-item-img">
                                        <img class="sheet-preview-img" :src="sheet.coverImageUrl + '?param=80y100'" />
                                    </div>
                                    <div class="sheet-item-title font-color-main">
                                        {{ sheet.name }}
                                    </div>
                                </div>
                            </div>
                            <div class="no-sheet" v-else>
                                {{ $t('playui.noSheet') }}
                            </div>
                        </div>
                    </YScroll>
                </div>
            </div>
            <div class="play-bar">
                <YPlaybar :type="'play-ui'" @close-panel="show = false" ref="playBar" />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import YPlaybar from './YPlaybar.vue';
import YTitlebar from './YTitlebar.vue';
import YScroll from './YScroll.vue';
import { defineComponent, ref } from 'vue';
import { Lyrics } from '@/utils/lyric';
import { useStore } from 'vuex';
import { useApi } from '@/utils/api';
import { getColorFromImg } from '@/utils/color';
import { Message } from '@/dual/YMessageC';

export default defineComponent({
    name: 'YPlayUI',
    components: {
        YTitlebar,
        YPlaybar,
        YScroll,
    },
    setup() {
        const lyricContainer = ref<InstanceType<typeof YScroll>>();
        const playuiContainer = ref<HTMLElement>();
        const playBar = ref<InstanceType<typeof YPlaybar>>();
        const store = useStore();
        const player = store.state.player;
        const login = store.state.login;

        return {
            lyricContainer,
            playuiContainer,
            playBar,
            player,
            login,
        };
    },
    computed: {
        firstListenPeriod() {
            if (this.firstListen && this.firstListen.creatives.length > 0) {
                return this.firstListen.creatives[0].resources[0].resourceExt.musicFirstListenDto.season + '的' + this.firstListen.creatives[0].resources[0].resourceExt.musicFirstListenDto.period;
            }
            return '';
        },
        firstListenTime() {
            if (this.firstListen && this.firstListen.creatives.length > 0) {
                return this.firstListen.creatives[0].resources[0].resourceExt.musicFirstListenDto.date;
            }
            return '';
        },
        firstListenTitle() {
            if (this.firstListen && this.firstListen.creatives.length > 0) {
                return this.firstListen.creatives[0].resources[0].uiElement.mainTitle.title;
            }
            return '';
        },
        listenCount() {
            if (this.firstListen && this.firstListen.creatives.length > 0) {
                return this.firstListen.creatives[0].resources[1];
            }
            return null;
        },
        listenCountTitle() {
            if (this.listenCount) {
                return this.listenCount?.uiElement.mainTitle.title;
            }
            return '';
        },
        listenCountContent() {
            if (this.listenCount) {
                return this.listenCount?.resourceExt.musicTotalPlayDto.playCount + '次·' + this.formatDuration(this.listenCount?.resourceExt.musicTotalPlayDto.duration);
            }
            return '';
        },
        listenCountInfo() {
            if (this.listenCount) {
                return this.listenCount?.resourceExt.musicTotalPlayDto.text;
            }
            return '';
        },
        creatives() {
            let res: any[] = [];
            if (this.songWiki) {
                this.songWiki.creatives.forEach((element: any) => {
                    let contentRes: any[] = [];
                    if (element.uiElement.textLinks) {
                        element.uiElement.textLinks.forEach((textLink: any) => {
                            contentRes.push(textLink.text);
                        });
                    } else if (element.resources) {
                        element.resources.forEach((resource: any) => {
                            if (resource.uiElement.mainTitle) {
                                contentRes.push(resource.uiElement.mainTitle.title);
                            }
                        });
                    }
                    res.push({
                        title: element.uiElement.mainTitle.title,
                        content: contentRes,
                    });
                });
            }
            return res;
        },
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
            lyrics: null as any,
            firstListen: null as any,
            songWiki: null as any,
            sheets: null as any,
            currentTime: 0,
            currentLine: 0,
            startTime: null as any,
            timeInterval: null as any,
            scrollAnimationFrame: null as any,
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
                this.$nextTick(() => {
                    this.scrollToCurrentLine();
                    this.setBackgroundColor();
                });
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
        position(newPos) {
            if (newPos === 'lyric') {
                this.$nextTick(() => {
                    this.scrollToCurrentLine();
                });
            } else if (newPos === 'wiki') {
                this.$nextTick(() => {
                    const container = this.lyricContainer?.$el;
                    if (!container) {
                        return;
                    }
                    container.scrollTop = 0;
                });
            } else if (newPos === 'sheet') {
                this.getSheets();
                this.$nextTick(() => {
                    const container = this.lyricContainer?.$el;
                    if (!container) {
                        return;
                    }
                    container.scrollTop = 0;
                });
            }
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
        async getLyrics(id: number | string) {
            await useApi('/lyric/new', {
                id: id,
            }).then((res) => {
                if (res?.yrc) {
                    this.lyrics = (new Lyrics({
                        type: 'yrc',
                        data: res.yrc.lyric,
                    })).lyrics;
                } else if (res?.lrc) {
                    this.lyrics = (new Lyrics({
                        type: 'lrc',
                        data: res.lrc.lyric,
                    })).lyrics;
                } else {
                    this.lyrics = null;
                }
            });
        },
        lineClass(index: number) {
            if (index === this.currentLine) {
                return 'current-line';
            } else {
                return 'far-line';
            }
        },
        scrollToCurrentLine() {
            // 确保 ref 存在，并且有 lyrics 内容
            if (!this.lyricContainer?.$el || !this.lyrics?.length) {
                return;
            }
            const container = this.lyricContainer.$el;
            const currentLineElement = container.getElementsByClassName('current-line')[0];

            // 如果当前行元素存在
            if (currentLineElement) {
                // 计算当前行在容器中的位置
                const containerHeight = container.clientHeight;
                const lineHeight = 38;
                const lineTopOffset = currentLineElement.offsetTop;

                // 设置滚动条位置，使当前行居中显示
                let scrollTop = lineTopOffset - 0.5 * containerHeight - 4 * lineHeight;
                let scrollTopNow = container.scrollTop;

                // 如果已有动画在进行，取消当前动画
                if (this.scrollAnimationFrame) {
                    cancelAnimationFrame(this.scrollAnimationFrame);
                }

                // 动画参数
                const duration = 500; // 动画持续时间

                // 动画循环
                const animateScroll = (currentTime: number) => {
                    // 如果是第一次调用，设置 startTime
                    if (!this.startTime) {
                        this.startTime = currentTime; // 将当前时间设置为 startTime
                    }

                    // 计算已经过的时间
                    const elapsed = currentTime - this.startTime;
                    const t = Math.min(elapsed / duration, 1); // 计算动画进度 (0 - 1)
                    const easeT = this.ease(t); // 应用缓动

                    // 计算当前的 scrollTop 值
                    const currentScrollTop = scrollTopNow + (scrollTop - scrollTopNow) * easeT;
                    container.scrollTop = currentScrollTop;

                    // 如果动画尚未结束，继续请求下一个动画帧
                    if (t < 1) {
                        this.scrollAnimationFrame = requestAnimationFrame(animateScroll);
                    } else {
                        this.scrollAnimationFrame = null; // 动画完成后重置动画 ID
                        this.startTime = null; // 重置 startTime
                    }
                };

                // 启动动画
                this.scrollAnimationFrame = requestAnimationFrame(animateScroll);
            }
        },
        cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
            const u = 1 - t;
            return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
        },
        ease(t: number): number {
            let res = this.cubicBezier(t, 0.0, 0.0, 0.58, 1.0);

            res = Math.max(0, Math.min(1, res));
            // console.log(res);
            return res;
        },
        async setBackgroundColor() {
            if (!this.track?.al?.picUrl) {
                return;
            }
            await getColorFromImg(this.track.al.picUrl + '?param=50y50', document).then((color) => {
                if (!color) {
                    if (this.playuiContainer) {
                        this.playuiContainer.style.background = 'var(--background-color)';
                    }
                    return;
                }
                if (this.playuiContainer) {
                    this.playuiContainer.style.background = `linear-gradient(180deg, rgb(${color.r}, ${color.g}, ${color.b}) 0%, rgb(${color.r * .321}, ${color.g * .321}, ${color.b * .321}) 100%)`;
                }
                let progressDOM = this.playBar?.progressBarNoTrack?.progressDOM;
                if (progressDOM) {
                    progressDOM.style.background = `linear-gradient(to right, rgba(${color.r}, ${color.g}, ${color.b}, .4321), rgb(${color.r}, ${color.g}, ${color.b} ))`;
                }
            });
        },
        async getWiki() {
            await useApi('/song/wiki/summary', {
                id: this.track.id,
                cookie: this.login.cookie,
            }).then((res) => {
                this.firstListen = res.data.blocks[0];
                this.songWiki = res.data.blocks[1];
            });
        },
        formatDuration(duration: number) {
            if (duration < 600) {
                return duration + '分钟';
            } else {
                return (duration / 60).toFixed(0) + '小时';
            }
        },
        async getSheets() {
            await useApi('/sheet/list', {
                id: this.track.id,
                cookie: this.login.cookie,
            }).then((res) => {
                if (res.code !== 200) {
                    console.log('id: ', this.track.id, '获取曲谱失败, ', res.code);
                }
                const data = res.data;
                if (data.musicSheetSimpleInfoVOS) {
                    this.sheets = data.musicSheetSimpleInfoVOS;
                } else {
                    this.sheets = null;
                }
            })
        },
        openSheet(sheet: any) {
            this.$router.push({ path: `/sheet/${sheet.id}` });
            this.closePanel();
        },
    },
    async mounted() {
        if (this.player.currentTrack) {
            this.track = this.player.currentTrack;
        }
        this.player.Subscribe({
            id: 'YPlayUI',
            func: async () => {
                this.track = this.player.currentTrack;
                this.scrollToCurrentLine();
                let requests = [
                    this.setBackgroundColor(),
                    this.getLyrics(this.player.currentTrack.id),
                    this.getWiki(),
                    this.getSheets(),
                ]
                await Promise.all(requests);
                this.currentLine = 0;
                this.$nextTick(() => {
                    this.scrollToCurrentLine();
                });
            },
            type: 'track',
        })
        if (this.player.currentTrack?.id) {
            await this.getLyrics(this.player.currentTrack.id);
            await this.getWiki();
        }
        if (this.player.currentTrack) {
            this.currentTime = parseInt((this.player.currentTime * 1000).toString());
        }
        this.player.Subscribe({
            id: 'YPlayUI',
            func: () => {
                this.currentTime = parseInt((this.player.currentTime * 1000).toString());
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
});
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
                background-color: rgba(var(--foreground-color-rgb), .1);
                border-radius: 20px;
                padding: 3px 3px;
                margin: 0 0 10px 0;

                .switcher-item {
                    display: flex;
                    align-items: center;
                    padding: 2px 8px 4px 8px;
                }

                .selected {
                    color: var(--font-color-main);
                    font-weight: bold;
                    background-color: rgba(var(--foreground-color-rgb), .2);
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

            .yscroll {
                mask-image: linear-gradient(to bottom,
                        rgba(0, 0, 0, 0.1) 0%,
                        rgba(0, 0, 0, 0.2) 10%,
                        rgba(0, 0, 0, 0.4) 20%,
                        rgba(0, 0, 0, 0.6) 30%,
                        rgba(0, 0, 0, 1) 50%,
                        rgba(0, 0, 0, 0.6) 70%,
                        rgba(0, 0, 0, 0.4) 80%,
                        rgba(0, 0, 0, 0.2) 90%,
                        rgba(0, 0, 0, 0.1) 100%);
            }

            .lyric {
                width: 43.21vw;

                .lyric-a {
                    transition: color, opacity 0.3s;


                    .before-lyric {
                        height: calc(25vh - 16px);
                    }

                    .after-lyric {
                        height: calc(25vh - 16px);
                    }

                    .lyric-line {
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        padding: 7px 0 7px 0;
                        width: 72%;
                        text-align: left;
                        transform-origin: left center;
                        line-height: 1.5;

                        .yrc-line {
                            .yrc-line-item {
                                position: relative;
                                overflow: hidden;

                                .item-ori {
                                    opacity: 0;
                                }

                                .item-standard {
                                    top: 0;
                                    left: 0;
                                    position: absolute;
                                }

                                .item-white {
                                    top: 0;
                                    left: 0;
                                    position: absolute;
                                    color: var(--font-color-main);
                                    clip-path: inset(0 100% 0 0);
                                }
                            }
                        }
                    }

                    .current-line {
                        opacity: 1;
                    }

                    .far-line {
                        opacity: 1;
                    }
                }
            }

            .wiki {
                width: 43.21vw;

                .wiki-content {
                    width: 100%;

                    .wiki-first-listen {
                        display: flex;
                        flex-direction: column;
                        align-items: start;

                        .first-listen-main-title {
                            font-size: 20px;
                            font-weight: bold;
                            margin-bottom: 10px;
                            padding: 10px 0 0 5px;
                        }

                        .first-listen-content {
                            display: flex;
                            flex-direction: row;
                            width: calc(100% - 20px);

                            .content-first-listen {
                                background-color: rgba(var(--foreground-color-rgb), .1);
                                border-radius: 10px;
                                padding: 10px;
                                text-align: left;
                                width: calc(50% - 10px);

                                .first-listen-title {
                                    padding: 3px 0;
                                    opacity: .5;
                                }

                                .first-listen-period {
                                    padding: 5px 0;
                                    font-weight: bold;
                                    font-size: 20px;
                                }

                                .first-listen-time {
                                    padding: 3px 0;
                                    opacity: .8;
                                }
                            }

                            .listen-count {
                                background-color: rgba(var(--foreground-color-rgb), .1);
                                border-radius: 10px;
                                padding: 10px;
                                margin-left: 10px;
                                text-align: left;
                                width: calc(50% - 10px);

                                .listen-count-title {
                                    padding: 3px 0;
                                    opacity: .5;
                                }

                                .listen-count-content {
                                    padding: 5px 0;
                                    font-weight: bold;
                                    font-size: 20px;
                                }

                                .listen-count-info {
                                    padding: 3px 0;
                                    opacity: .8;
                                }
                            }
                        }
                    }

                    .wiki-song {
                        display: flex;
                        flex-direction: column;
                        width: calc(100% - 20px);
                        align-items: start;

                        .wiki-song-title {
                            font-size: 20px;
                            font-weight: bold;
                            margin: 8px 0 10px 0;
                            padding: 10px 0 0 5px;
                        }

                        .wiki-song-content {
                            display: flex;
                            flex-direction: column;
                            background-color: rgba(var(--foreground-color-rgb), .1);
                            padding: 10px;
                            border-radius: 10px;
                            width: inherit;

                            .wiki-song-content-item {
                                display: flex;
                                flex-direction: row;
                                padding: 4px 0;

                                .item-title {
                                    opacity: .5;
                                    width: 80px;
                                    text-align: left;
                                }

                                .item-content {
                                    font-size: 16px;
                                }
                            }
                        }
                    }
                }
            }

            .sheet {
                display: flex;
                align-items: center;
                min-height: 100%;
                width: 43.21vw;

                .sheet-list {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    width: 100%;

                    .sheet-item {
                        min-width: 110px;
                        max-width: 140px;
                        margin: 10px 0px;
                        cursor: pointer;

                        .sheet-item-img {
                            .sheet-preview-img {
                                width: 80px;
                                height: 100px;
                                border-radius: 10px;
                            }
                        }
                    }
                }

                .no-sheet {
                    font-size: 20px;
                    font-weight: bold;
                }
            }
        }
    }

    .play-bar {
        width: 100%;
        height: 85px;
        background-color: rgba(var(--foreground-color-rgb), .03);
    }
}
</style>