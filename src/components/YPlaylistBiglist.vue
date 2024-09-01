<template>
    <div class="playlists-biglist">
        <div class="playlist-item" v-for="(playlist) in playlists" :key="playlist.id" @click="openPlaylist(playlist.id)">
            <div class="playlist-item-cover" :title="playlist.name">
                <img class="playlist-item-cover-img" :src="playlist._bigPicUrl">
                <div class="gradient-overlay" v-if="type === 'playlist'"></div>
                <!-- 4 播放次数 -->
                <div class="play-info" v-if="type === 'playlist'">
                    <img src="../assets/play.svg" class="play-icon" />
                    <span class="play-count">{{ playlist.playCount }}</span>
                </div>
            </div>
            <div class="playilst-item-info">
                <div class="playlist-item-name" :title="playlist.name">
                    {{ playlist.name }}
                </div>
                <div class="playlist-item-count">
                    {{ playlist.trackCount ?? playlist.size }}首
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="js">
export default {
    name: 'YPlaylistBiglist',
    props: {
        playlists: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
            default: 'playlist',
            validator(value) {
                return ['playlist', 'album'].includes(value)
            }
        },
        stickyTop: {
            type: String,
            default: '0px',
        },
    },
}
</script>

<style scoped>
.playlists-biglist {
    display: flex;
    flex-wrap: wrap;
    /* justify-content: ; */
    color: #fff;
}

.playlist-item {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 10px;
    max-width: 230px;
    min-width: 180px;
    border-radius: 10px;
    cursor: pointer;
}

.playlist-item-cover {
    position: relative;
}

.playlist-item-cover-img {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 10px;
}

.gradient-overlay {
    position: absolute;
    border-radius: 10px;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    /* 控制渐变高度，50% 意味着渐变到中间 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
    pointer-events: none;
    /* 确保渐变层不会阻止对图片的交互 */
    z-index: 1;
}

/* 4 播放次数信息 */
.play-info {
    position: absolute;
    top: 3px;
    right: 3px;
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 5px;
    z-index: 1;
}

/* 4 播放次数图标 */
.play-icon {
    width: 11px;
    height: 11px;
    margin-right: 3px;
}

.play-count {
    color: #fff;
    font-size: 14px;
}

.playlist-item-name {
    width: 180px;
    max-width: 180px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 17px;
    font-weight: bold;
    color: #eee;
    margin-bottom: 6px;
}

.playlist-item-count {
    font-size: 13px;
    color: #aaa;
    text-align: left;
}
</style>