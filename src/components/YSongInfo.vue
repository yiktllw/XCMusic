<template>
    <div class="song-info">
        <YWindow ref="window" @new-window-state="handleNewWindowState">
            <template #header>
                <span style="font-size: 19px; font-weight: bold;">
                    歌曲信息
                </span>
            </template>
            <YScroll>
                <div class="song-info-content">
                    <div class="song-info-item">
                        <div class="left">
                            <span class="song-info-item-title">歌曲名：</span>
                            <span class="song-info-item-content">{{ track.name }}</span>
                        </div>
                        <img class="img-copy" @click="copy(track.name)" src="@/assets/copy.svg" title="点击复制">
                    </div>
                    <div class="song-info-item" v-if="track.tns?.length > 0">
                        <div class="left">
                            <span class="song-info-item-title">歌曲译名：</span>
                            <span class="song-info-item-content">{{ track.tns[0] }}</span>
                        </div>
                        <img class="img-copy" @click="copy(track.tns[0])" src="@/assets/copy.svg" title="点击复制">
                    </div>
                    <div class="song-info-item" style="justify-content: start;" >
                        <span class="song-info-item-title">歌手：</span>
                        <div class="song-info-item-content" style="width: 100%;">
                            <div class="song-info-artist" v-for="artist in track.ar" :key="artist.id" style="width: 100%;">
                                <div class="left">
                                    <span @click="openArtist(artist.id)">
                                        {{ artist.name }}
                                    </span>
                                </div>
                                <img class="img-copy" @click="copy(artist.name)" src="@/assets/copy.svg" title="点击复制">
                            </div>
                        </div>
                    </div>
                    <div class="song-info-item">
                        <div class="left">
                            <span class="song-info-item-title">专辑：</span>
                            <span class="song-info-item-content album" @click="openAlbum(track.al.id)">
                                {{ track.al.name }}
                            </span>
                        </div>
                        <img class="img-copy" @click="copy(track.al.name)" src="@/assets/copy.svg" title="点击复制">
                    </div>
                    <div class="song-info-item" v-if="track.al.tns?.length > 0">
                        <div class="left">
                            <span class="song-info-item-title">专辑译名：</span>
                            <span class="song-info-item-content">{{ track.al.tns[0] }}</span>
                        </div>
                        <img class="img-copy" @click="copy(track.al.tns[0])" src="@/assets/copy.svg" title="点击复制">
                    </div>
                    <div class="song-info-item">
                        <div class="left">
                            <span class="song-info-item-title">歌曲ID：</span>
                            <span class="song-info-item-content">{{ track.id }}</span>
                        </div>
                        <img class="img-copy" @click="copy(track.id)" src="@/assets/copy.svg" title="点击复制">
                    </div>
                    <div class="song-info-item">
                        <div class="left">
                            <span class="song-info-item-title">歌曲链接：</span>
                            <span class="song-info-item-content">
                                {{ `https://music.163.com/song?id=${track.id}`
                                }}
                            </span>
                        </div>
                        <img class="img-copy" @click="copy(`https://music.163.com/song?id=${track.id}`)"
                            src="@/assets/copy.svg" title="点击复制">
                    </div>
                </div>
            </YScroll>
        </YWindow>
    </div>
</template>

<script lang="js">
import YWindow from '@/components/YWindow.vue';
import YScroll from './YScroll.vue';
import { YMessageC,Message } from '@/tools/YMessageC';

export default {
    name: 'YSongInfo',
    props: {
        track: {
            type: Object,
            required: true,
        },
    },
    components: {
        YWindow,
        YScroll,
    },
    data() {
        return {
        };
    },
    emits: [
        'new-window-state'
    ],
    methods: {
        handleNewWindowState(val) {
            this.$emit('new-window-state', val);
        },
        copy(text) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('复制成功: ', text);
                Message.post(new YMessageC({
                    type: 'success',
                    message: '复制成功',
                }));
            }, () => {
                console.log('复制失败: ', text);
            });
        },
        openArtist(id) {
            this.$router.push(`/artist/${id}`)
            this.$refs.window.closeWindow();
        },
        openAlbum(id) {
            this.$router.push(`/album/${id}`)
            this.$refs.window.closeWindow();
        },
    },
}
</script>

<style scoped>
.song-info {
    display: flex;
}

.song-info-content {
    padding: 10px;
    width: 432.1px;
    max-height: 432.1px;
}

.song-info-item {
    display: flex;
    justify-content: space-between;
    margin: 15px 10px;
    text-align: left;
}

.left {
    display: flex;
    align-items: first baseline;
}

.song-info-item-title {
    width: 75px;
    min-width: 75px;
    white-space: nowrap;
    font-size: 16px;
    font-weight: bold;
}

.song-info-item-content {
    font-size: 16px;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
}

.song-info-artist {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-right: 10px;
    font-size: 16px;
    margin-bottom: 8px;
}

.album {
    cursor: pointer;
}

.img-copy {
    width: 20px;
    height: 20px;
    cursor: pointer;
    opacity: .8;
}

.img-copy:hover {
    opacity: 1;
}
</style>