<template>
    <YScroll style="max-height: 100%;">
        <div class="container">
            <div class="user-info">
                <div class="avatar">
                    <img class="avatar-img" :src="user.picUrl" v-show="user.picUrl">
                    <div class="avatar-img" style="background-color: #333;" v-show="!user.picUrl"></div>
                </div>
                <div class="user-info-text">
                    <div class="user-name">
                        {{ user.name }}
                    </div>
                    <div class="user-level" v-if="type === 'user'">
                        LV.{{ user.level }}
                    </div>
                    <div class="user-follow" v-if="type === 'user'">
                        <div>关注: {{ user.follows }}</div>
                        <div
                            style="height:100%;width:1px;background-color: rgba(255, 255, 255, .1); margin: 0px 10px; border-radius: 1px;">
                        </div>
                        <div>粉丝: {{ user.followeds }}</div>
                    </div>
                </div>
            </div>
            <div class="switcher" v-show="type === 'artist'">

            </div>
            <div class="content">
                <div class="playlists" v-if="type === 'user'">
                    <div class="playlists-header">
                        <div class="align-left">
                            <span style="font-weight: bold;">创建的歌单</span>
                        </div>
                        <div class="align-right" @click="listType = !listType">
                            切换视图
                        </div>
                    </div>
                    <div class="playlist-list" v-if="listType">
                        <YPlaylistList :playlists="userPlaylists" />
                    </div>
                    <div class="playlist-biglist" v-else>
                        <YPlaylistBiglist :playlists="userPlaylists" />
                    </div>
                </div>
            </div>
        </div>
    </YScroll>
</template>

<script lang="js">
import { useApi } from '@/ncm/api';
import { setBackgroundColor, getColorFromImg } from '@/ncm/color';
import YScroll from '@/components/YScroll.vue';
import YPlaylistList from '@/components/YPlaylistList.vue';
import YPlaylistBiglist from '@/components/YPlaylistBiglist.vue';

export default {
    name: 'YUserView',
    props: {
        userId: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            default: 'user',
        },
    },
    components: {
        YScroll,
        YPlaylistList,
        YPlaylistBiglist,
    },
    data() {
        return {
            user: {},
            userPlaylists: [],
            listType: false,
        }
    },
    methods: {
        async fetchUser() {
            if (this.userId === 0) {
                console.log('invalid userId');
                return;
            }
            let response = null;
            if (this.type === 'user') {
                let request = [
                    useApi('/user/detail', {
                        uid: this.userId,
                        cookie: localStorage.getItem('login_cookie'),
                    }).then(response => {
                        this.user = {
                            id: response.profile.userId,
                            name: response.profile.nickname,
                            picUrl: response.profile.avatarUrl + '?param=160y160',
                            followeds: response.profile.followeds,
                            follows: response.profile.follows,
                            playlistCount: response.profile.playlistCount,
                            level: response.level,
                        };
                        console.log('fetch user: ', response);
                    }),

                    useApi('/user/playlist', {
                        uid: this.userId,
                        cookie: localStorage.getItem('login_cookie'),
                    }).then(response => {
                        this.userPlaylists = response.playlist.map(item => {
                            return {
                                ...item,
                                _picUrl: item.coverImgUrl + '?param=40y40',
                                _bigPicUrl: item.coverImgUrl + '?param=180y180',
                            }
                        });
                        console.log('fetch user playlists: ', response);
                    })
                ];
                await Promise.allSettled(request);
            } else {
                response = await useApi('/artist/detail', {
                    id: this.userId,
                    cookie: localStorage.getItem('login_cookie'),
                })
                let artist = response.data.artist;
                this.user = {
                    id: artist.id,
                    name: artist.name,
                    transName: artist.transNames[0],
                    picUrl: artist.avatar + '?param=160y160',
                    musicSize: artist.musicSize,
                    albumSize: artist.albumSize,
                    briefDesc: artist.briefDesc,
                };
                console.log('fetch artist: ', response);
            }
        },
    },
    async mounted() {
        await this.fetchUser();
        let color = await getColorFromImg(this.user.picUrl, document);
        if (color) {
            setBackgroundColor(color);
        }
    }
}

</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    color: #fff;
    /* align-items: center; */
    padding: 20px;
}

.user-info {
    display: flex;
    /* padding: 10px; */
    margin-bottom: 20px;
}

.avatar {
    margin-right: 20px;
}

.avatar-img {
    width: 160px;
    height: 160px;
    border-radius: 50%;

}

.user-info-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    /* padding-top: 10px; */
    justify-content: center;
}

.user-name {
    font-size: 20px;
    font-weight: bold;
    margin: 6px 0px;
}

.user-level {
    font-size: 11px;
    font-weight: bold;
    color: rgba(255, 255, 255, .8);
    border-radius: 10px;
    border: 1px solid #555;
    background-color: rgba(255, 255, 255, .05);
    padding: 2px 6px;
    margin: 6px 0px;
}

.user-follow {
    display: flex;
    flex-direction: row;
    margin: 6px 0px 30px 0px;
    color: #eee;
    font-size: 16px;
    font-weight: bold;
}

.content {
    display: flex;
}

.playlists {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.playlists-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    font-size: 20px;
    color: #ccc;
    margin-bottom: 20px;
}
</style>