<template>
    <div class="table-container">
        <!-- 3 表头 -->
        <div class="table-header" :style="{ top: stickyTop }" v-if="showHeader">
            <!-- 4 歌单序号-表头 -->
            <div class="playlists-counter font-color-standard">
                <div class="header-button header-counter">
                    <span>#</span>
                </div>
            </div>
            <!-- 4 歌单标题-表头 -->
            <div class="playlists-name">
                <div class="header-button">
                    <span>
                        {{ $t('playlist_list.title') }}
                    </span>
                </div>
            </div>
            <!-- 4 歌曲数量-表头 -->
            <div class="playlists-track-count font-color-standard ">
                <div class="header-button">
                    <span>
                        {{ $t('playlist_list.song_count') }}
                    </span>
                </div>
            </div>
            <!-- 4 作者-表头 -->
            <div class="playlists-author font-color-standard">
                <div class="header-button">
                    <span>
                        {{ type === 'playlist' ? $t('playlist_list.creator') : $t('playlist_list.author') }}
                    </span>
                </div>
            </div>
            <div class="play-count font-color-standard">
                <div class="header-button">
                    <span v-if="type === 'playlist'">
                        {{ $t('playlist_list.play_count') }}
                    </span>
                    <span v-else>
                        {{ $t('playlist_list.create_time') }}
                    </span>
                </div>
            </div>
        </div>
        <div class="playlists-list">
            <div class="playlists-item" v-for="(playlist, index) in playlists" :key="playlist.id"
                @click="openPlaylist(playlist.id)">
                <!-- 5 歌单序号 -->
                <div class="playlists-counter font-color-standard">
                    <span>{{ index + 1 }}</span>
                </div>
                <!-- 5 歌单标题 -->
                <div class="playlists-name font-color-main" :title="playlist.name">
                    <img :src="playlist._picUrl"
                        style="width: 40px; height: 40px; margin-right: 10px; border-radius: 5px;">
                    <span class="playlists-name-text">
                        {{ playlist.name }}
                    </span>
                </div>
                <!-- 5 歌曲数 -->
                <div class="playlists-track-count font-color-standard" :title="playlist.trackCount + '首'">
                    <span>
                        {{ type === 'playlist' ? playlist.trackCount : playlist.size }}
                        {{ $t('playlist_list.song_counter') }}
                    </span>
                </div>
                <!-- 5 作者 -->
                <div class="playlists-author font-color-standard"
                    @click="openUserPage(type === 'playlist' ? playlist.creator.userId : playlist.artist.id)"
                    :title="type === 'playlist' ? playlist.creator?.nickname : playlist.artist?.name">
                    <span>{{ type === 'playlist' ? playlist.creator?.nickname : playlist.artist?.name }}</span>
                </div>
                <div class="play-count font-color-standard">
                    <span v-if="(type === 'playlist')">{{ formatedPlayCount(playlist.playCount) }}</span>
                    <span v-else>{{ formatedTime(playlist.publishTime) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="js">
import { formatDate_yyyymmdd } from '@/ncm/time';
export default {
    name: 'YPlaylistList',
    props: {
        playlists: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
            default: 'playlist',
        },
        stickyTop: {
            type: String,
            default: '0px',
        },
        showHeader: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        openPlaylist(id) {
            if (typeof id === 'string' && id.startsWith('user-record-')) {
                let uid = id.split('user-record-')[1];
                this.$router.push({ path: `/user_songs_rank/${uid}` });
                return;
            }
            this.type === 'playlist' ?
                this.$router.push({ path: `/playlist/${id}` }) :
                this.$router.push({ path: `/album/${id}` });
        },
        openUserPage(id) {
            console.log('open user page: ', id);
        },
        formatedPlayCount(count) {
            return count > 10000 ? `${(count / 10000).toFixed(1)}万` : count;
        },
        formatedTime(time) {
            return formatDate_yyyymmdd(time);
        },
    },
}

</script>

<style lang="scss" scoped>
.table-container {
    display: flex;
    max-width: 100vw;
    flex-direction: column;

    .table-header {
        display: flex;
        align-items: center;
        top: 0;
        justify-content: space-between;
        backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .playlists-list {
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        .playlists-item {
            display: flex;
            justify-content: space-between;
            height: 40px;
            align-items: center;
            padding: 7px 0px;
            border-radius: 10px;
            font-size: 15px;
            overflow: hidden;

            &:hover {
                background-color: rgba(var(--foreground-color-rgb), 0.1);
            }
        }
    }
}

.playlists-counter {
    width: 50px;
}

/* 4 歌曲标题-表头 */
.playlists-name {
    display: flex;
    flex: 1;
    text-align: left;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 10px;
}

.playlists-name-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 4 专辑-表头 */
.playlists-author {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    width: 160px;
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden;
}

.play-count {
    width: 100px;
    text-align: left;
}

/* 4 时长-表头 */
.playlists-track-count {
    width: 100px;
    text-align: left;
}

/* 5 排序按钮 */
.header-button {
    display: flex;
    align-items: center;
    padding: 5px 0px 5px 6px;
    font-size: 13px;
    margin-bottom: 5px;
    background: none;
    border: none;
    color: var(--font-color-standard);
    text-align: left;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    transition: all 0.3s;
}

/* 5 歌曲序号-表头按钮 */
.header-counter {
    width: 40px;
    text-align: center;
}
</style>