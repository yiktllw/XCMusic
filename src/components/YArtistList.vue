<template>
    <!-- 歌手列表 -->
    <div class="artists-list">
        <div class="artists-item" v-for="(artist) in artists" :key="type === 'artist' ? artist.id : artist.userId">
            <!-- 歌手信息 -->
            <div class="artists-info" @click="openUserPage(type === 'artist' ? artist.id : artist.userId, type)"
                :title="artist.name">
                <!-- 头像 -->
                <img :src="artist._picUrl" class="artists-avatar">
                <!-- 歌手名 -->
                <div class="artists-name-text">{{ type === 'artist' ? artist.name : artist.nickname }}</div>
            </div>
            <!-- 专辑数/粉丝数 -->
            <div class="artists-track-count" :title="type === 'artist' ? artist.albumSize : artist.followeds">
                <span>{{ type === 'artist' ? ('专辑: ' + artist.albumSize) : ('粉丝: ' + artist.followeds) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="js">
export default {
    name: 'YArtistList',
    props: {
        // 歌手列表
        artists: {
            type: Array,
            default: () => [],
        },
        // 类型
        type: {
            type: String,
            default: 'artist' // artist: 歌手, user: 用户
        }
    },
    methods: {
        openUserPage(id) {
            if (this.type === 'artist') {
                console.log('open artist page :', id)
                this.$router.push({ path: `/artist/${id}` })
            } else if (this.type === 'user') {
                console.log('open user page :', id)
                this.$router.push({ path: `/user/${id}` })
            }
        }
    },
}

</script>

<style scoped>
.artists-list {
    display: flex;
    flex-wrap: wrap;
    /* justify-content: ; */
    color: #fff;
}

.artists-item {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 10px;
    max-width: 210px;
    min-width: 180px;
    border-radius: 10px;
    cursor: pointer;
}

.artists-item:hover {
    background-color: rgba(255, 255, 255, .05);
}

.artists-avatar {
    width: 130px;
    height: 130px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 10px;
}

.artists-name-text {
    font-size: 17px;
    color: #eee;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.artists-track-count {
    font-size: 14px;
    color: #bbb;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>