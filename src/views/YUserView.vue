<template>
    <!-- 用户/歌手界面 -->
    <div class="container font-color-main" v-if="user">
        <!-- 用户信息 -->
        <div class="user-info">
            <!-- 头像 -->
            <div class="avatar">
                <img class="avatar-img" :src="user.picUrl" v-if="user.picUrl">
                <!-- 如果没有头像，显示默认头像 -->
                <div class="avatar-img" style="background-color: #333;" v-if="!user.picUrl"></div>
            </div>
            <!-- 用户信息-文本 -->
            <div class="user-info-text">
                <!-- 用户名 -->
                <div class="user-name">
                    {{ user.name }}
                </div>
                <!-- 用户等级 -->
                <div class="user-level font-color-high" v-if="type === 'user'">
                    LV.{{ (user as IUser).level }}
                </div>
                <!-- 歌手翻译名 -->
                <div class="trans-name font-color-high" v-if="type === 'artist' && (user as IArtist).transName">
                    {{ (user as IArtist).transName }}
                </div>
                <!-- 歌手身份 -->
                <div class="artist-identity font-color-high" v-if="type === 'artist' && (user as IArtist).identity">
                    {{ (user as IArtist).identity }}
                </div>
                <!-- 关注/粉丝 -->
                <div class="user-follow font-color-high" v-if="type === 'user'">
                    <div style="cursor: pointer;" @click="openUserFollow(userId, 'follow')">
                        {{ $t('titlebar.follows') }}:
                        {{ (user as IUser).follows }}
                    </div>
                    <div
                        style="height:100%;width:1px;background-color: rgba(255, 255, 255, .1); margin: 0px 10px; border-radius: 1px;">
                    </div>
                    <div style="cursor: pointer;" @click="openUserFollow(userId, 'follower')">
                        {{ $t('titlebar.followers') }}:
                        {{ (user as IUser).followeds }}
                    </div>
                </div>
            </div>
        </div>
        <!-- 导航 -->
        <div class="switcher font-color-standard">
            <!-- 导航元素 -->
            <button class="switcher-item font-color-standard" v-for="(item, index) in user.switcher"
                @click="handleSwitcher(item.position)">
                <span style="font-size: 16px; color:var(--font-color-main);"
                    :style="{ 'font-weight': item.position === user.position ? 'bold' : '500', 'color': item.position === user.position ? 'var(--font-color-main)' : 'var(--font-color-standard)' }">
                    {{ $t(item.display) }}
                </span>
                <!-- 选中效果 -->
                <div class="choosed"
                    style="transform: translate(7px,4px); width: calc(100% - 15px); height: 4px; border-radius: 2px;"
                    v-if="item.position === user.position">
                </div>
            </button>
            <!-- 右侧切换视图 -->
            <div v-if="showRightSwitcher" class="right-switcher"
                style="display: flex;flex: 1;justify-content: flex-end; margin-right: 30px;">
                <img src="@/assets/biglist.svg" class="list-icon g-icon" @click="(user as IUser).listType = false"
                    :style="{ opacity: (user as IUser).listType ? .6 : 1 }">
                <img src="@/assets/smalllist.svg" class="list-icon g-icon" @click="(user as IUser).listType = true"
                    :style="{ opacity: (user as IUser).listType ? 1 : .6 }">
            </div>
        </div>
        <!-- 用户/歌手主界面 -->
        <div class="content">
            <!-- 用户主界面 -->
            <div class="content-user" v-if="type === 'user'">
                <!-- 歌单界面 -->
                <div class="playlist-list" v-if="(user as IUser).listType">
                    <YPlaylistList
                        :playlists="user.position === 'createdPlaylist' ? (user as IUser).userPlaylists : (user as IUser).userSubscribedPlaylists" />
                </div>
                <!-- 大歌单界面 -->
                <div class="playlist-biglist" v-else>
                    <YPlaylistBiglist
                        :playlists="user.position === 'createdPlaylist' ? (user as IUser).userPlaylists : (user as IUser).userSubscribedPlaylists" />
                </div>
            </div>
            <!-- 歌手界面 -->
            <div class="content-artist" v-else-if="type === 'artist'">
                <!-- 歌手作品 -->
                <div class="artist-works" v-if="user.position === 'song'">
                    <!-- 歌曲列表 -->
                    <YSongsTable :resortable="false" :canSendPlaylist="false" :showHeader="false"
                        v-model="(user as IArtist).tracks" v-if="(user as IArtist).tracks" :id="'YUserView.vue'" />
                    <YPage v-model="page" />
                </div>
                <!-- 加载中 -->
                <YLoading v-if="!(user as IArtist).tracks" />
                <!-- 歌单界面 -->
                <div class="playlist-list" v-if="(user as IUser).listType && user.position === 'album'">
                    <!-- 歌手专辑列表 -->
                    <YPlaylistList type="album" :playlists="(user as IArtist).albums" />
                </div>
                <!-- 大歌单界面 -->
                <div class="playlist-biglist" v-if="!(user as IUser).listType && user.position === 'album'">
                    <YPlaylistBiglist type="album" :playlists="(user as IArtist).albums" />
                </div>
                <!-- 歌手简介 -->
                <div class="artist-intro font-color-high" v-if="(user as IArtist).intro && user.position === 'detail'">
                    <div v-for="(item) in (user as IArtist).intro">
                        <!-- 标题 -->
                        <div v-if="item.ti"
                            style="font-size: 18px; font-weight: bold; margin: 15px 0px 10px 0px; color: var(--font-color-main);">
                            {{ item.ti }}
                        </div>
                        <!-- 文本 -->
                        <div v-if="item.txt" style="font-size: 14px; margin: 10px 0px;" v-html="item.txt">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import YScroll from '@/components/YScroll.vue';
import YPlaylistList from '@/components/YPlaylistList.vue';
import YPlaylistBiglist from '@/components/YPlaylistBiglist.vue';
import YSongsTable from '@/components/YSongsTable.vue';
import YLoading from '@/components/YLoading.vue';
import YPage from '@/components/YPage.vue';
import { Tracks } from '@/utils/tracks';
import { useApi } from '@/utils/api';
import { YColor } from '@/utils/color';
import { useStore } from 'vuex';
import { YPageC } from '@/dual/YPageC';
import { markRaw, defineComponent } from 'vue';
import songsRank from '@/assets/songsrank.svg';
import { Theme1, Theme2 } from '@/utils/theme';
import { IArtist, IUser } from '@/dual/YUserView';

export default defineComponent({
    name: 'YUserView',
    props: {
        // 用户 id
        userId: {
            type: Number,
            default: 0,
        },
        // 用户/歌手
        type: {
            type: String,
            default: 'user', // user, artist
        },
    },
    watch: {
        // id变化时，重新获取用户信息
        userId() {
            this.fetchUser();
        },
        // type变化时，重新获取用户信息
        type() {
            this.fetchUser();
        },
    },
    components: {
        YScroll,
        YPlaylistList,
        YPlaylistBiglist,
        YSongsTable,
        YLoading,
        YPage,
    },
    data() {
        return {
            // 用户/歌手信息
            user: null as IUser | IArtist | null,
            page: new YPageC(1),
        }
    },
    setup() {
        const store = useStore();
        return {
            login: store.state.login,
            setting: store.state.setting,
        };
    },
    computed: {
        // 是否显示右侧切换视图
        showRightSwitcher() {
            return this.type === 'user' || (this.type === 'artist' && this.user!.position === 'album');
        },
    },
    methods: {
        // 切换导航位置，并获取对应的数据
        handleSwitcher(position: 'createdPlaylist' | 'subscribedPlaylist' | 'song' | 'album' | 'detail') {
            console.log('switch position', position);
            this.user!.position = position;
            switch (position) {
                case 'createdPlaylist':
                    this.fetchUserPlaylist();
                    break;
                case 'subscribedPlaylist':
                    this.fetchUserPlaylist();
                    break;
                case 'song':
                    this.fetchArtistWorks(0, true);
                    break;
                case 'album':
                    this.fetchArtistAlbums();
                    break;
                case 'detail':
                    this.fetchArtistIntro();
                    break;
                default:
                    break;
            }
        },
        // 获取 用户/歌手 信息
        async fetchUser() {
            // 如果 userId 为 0，返回
            if (this.userId === 0) {
                console.log('invalid userId');
                return;
            }
            if (this.type === 'user') {
                // 如果 type 为 user，获取用户信息
                let response = await useApi('/user/detail', {
                    uid: this.userId,
                    cookie: this.login.cookie,
                }).catch(err => {
                    console.log('fetch user error:', err);
                });
                // 处理用户信息
                this.user = {
                    id: response.profile.userId,
                    name: response.profile.nickname,
                    picUrl: response.profile.avatarUrl + '?param=160y160',
                    followeds: response.profile.followeds,
                    follows: response.profile.follows,
                    playlistCount: response.profile.playlistCount,
                    level: response.level,
                    listenSongs: response.listenSongs,
                    listType: false,
                    userPlaylists: [],
                    userSubscribedPlaylists: [],
                    position: 'createdPlaylist',
                    switcher: [
                        {
                            display: 'sidebar.created_playlist',
                            position: 'createdPlaylist',
                        },
                        {
                            display: 'sidebar.subscribed_playlist',
                            position: 'subscribedPlaylist',
                        },
                    ],
                };
                // 获取用户的歌单
                await this.fetchUserPlaylist();
            } else {
                // 如果 type 为 artist，获取歌手信息
                let response = await useApi('/artist/detail', {
                    id: this.userId,
                    cookie: this.login.cookie,
                }).catch(err => {
                    console.log('fetch artist error:', err);
                });
                let artist = response.data.artist;
                // 处理歌手信息
                this.user = {
                    id: artist.id,
                    name: artist.name,
                    transName: artist.transNames[0],
                    picUrl: artist.avatar + '?param=160y160',
                    identity: response.data.identify?.imageDesc ?? '',
                    briefDesc: artist.briefDesc,
                    intro: [],
                    musicSize: artist.musicSize,
                    albumSize: artist.albumSize,
                    tracks: [],
                    albums: [],
                    // 切换器的初始位置
                    position: 'song',
                    // 歌手界面的切换器
                    switcher: [
                        {
                            display: 'user_view.songs',
                            position: 'song',
                        },
                        {
                            display: 'user_view.albums',
                            position: 'album',
                        },
                        {
                            display: 'user_view.detail',
                            position: 'detail',
                        },
                    ],
                };
                // 获取歌手的作品，第一页
                await this.fetchArtistWorks(0, true);
            }
        },
        // 获取用户的歌单
        async fetchUserPlaylist() {
            //  如果不是用户界面，返回
            if (this.type !== 'user') {
                return;
            }
            // 获取用户的歌单
            let response = await useApi('/user/playlist', {
                uid: this.userId,
                cookie: this.login.cookie,
            }).catch(err => {
                console.log('fetch user playlist error:', err);
            });
            // 清空用户的歌单
            (this.user as IUser).userPlaylists = [{
                name: this.$t('user_view.listen_rank'),
                id: `user-record-${this.userId}`,
                userId: this.userId,
                creator: response.playlist[0]?.creator ?? null,
                playCount: 0,
                trackCount: this.$t('user_view.total_listen') + `${(this.user as IUser)?.listenSongs}`,
                _picUrl: songsRank,
                _bigPicUrl: songsRank,
                artist: {
                    name: '',
                    id: 0,
                },
                size: 0,
                publishTime: 0,
            }];
            (this.user as IUser).userSubscribedPlaylists = [];
            // 返回处理后的歌单
            response.playlist.forEach((item: any) => {
                if (!item.subscribed) {
                    // 用户创建的歌单
                    (this.user as IUser).userPlaylists.push({
                        ...item,
                        _picUrl: item.coverImgUrl + '?param=40y40',
                        _bigPicUrl: item.coverImgUrl + '?param=180y180',
                    });
                } else {
                    // 用户收藏的歌单
                    (this.user as IUser).userSubscribedPlaylists.push({
                        ...item,
                        _picUrl: item.coverImgUrl + '?param=40y40',
                        _bigPicUrl: item.coverImgUrl + '?param=180y180',
                    });
                }
            });
        },
        // 获取歌手的专辑
        async fetchArtistAlbums() {
            //  如果不是歌手界面，返回
            if (this.type !== 'artist') {
                return;
            }
            // 获取歌手的专辑
            let response = await useApi('/artist/album', {
                id: this.userId,
                limit: 1900,
                cookie: this.login.cookie,
            }).catch(err => {
                console.log('fetch artist albums error:', err);
            });
            // 返回处理后的专辑
            (this.user as IArtist)!.albums = response.hotAlbums.map((album: any) => {
                return {
                    ...album,
                    _picUrl: album.picUrl + '?param=80y80',
                    _bigPicUrl: album.picUrl + '?param=180y180',
                }
            });
        },
        // 按页获取歌手的作品
        async fetchArtistWorks(page: number, newPage = false) {
            const SONGS_PER_PAGE = 100;
            //  如果不是歌手界面，返回
            if (this.type !== 'artist') {
                return;
            }
            // 获取歌手的歌曲
            await useApi('/api/v2/artist/songs', {
                id: this.userId,
                limit: SONGS_PER_PAGE,
                offset: page * SONGS_PER_PAGE,
            })
                .then(async (response) => {
                    if (newPage) {
                        this.page.total = Math.ceil(response.total / SONGS_PER_PAGE);
                        this.page.onPageChange = () => {
                            this.fetchArtistWorks(this.page.current - 1, false);
                        }
                    }
                    // 由于歌曲的封面缺失，需要获取歌手的专辑
                    // await this.fetchArtistAlbums();
                    // 为歌曲添加专辑的封面
                    (this.user as IArtist).tracks = markRaw((new Tracks({
                        url: '/api/v2/artist/songs',
                        tracks: response.songs,
                    })).tracks);
                })
                .catch(err => {
                    console.log('fetch artist songs error:', err);
                });
        },
        async fetchArtistIntro() {
            //  如果不是歌手界面，返回
            if (this.type !== 'artist') {
                return;
            }
            // 获取歌手的描述
            await useApi('/artist/desc', {
                id: this.userId,
            })
                .then(response => {
                    // 处理歌手的描述
                    let desc = [
                        {
                            ti: `${(this.user as IArtist).name} 简介`,
                            txt: (this.user as IArtist).briefDesc,
                        },
                    ];
                    // 添加歌手的描述
                    (this.user as IArtist).intro = [
                        ...desc,
                        ...response.introduction,
                    ]
                })
                .catch(err => {
                    console.log('fetch artist intro error:', err);
                });
        },
        openUserFollow(id: number, type: string) {
            this.$router.push({ path: `/${type}/${id}` });
        },
    },
    async mounted() {
        // 获取用户信息
        await this.fetchUser();
        try {
            const theme = YColor.findTheme(this.setting.display.theme);
            if (this.user?.picUrl) {
                YColor.setBkColorFromImg(this.user.picUrl, document, (theme as Theme1).type, (theme as Theme2).background);
            }
        } catch (error) {
            console.error('YUserView', error);
        }
    }
})

</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    padding: 20px;

    .user-info {
        display: flex;
        margin-bottom: 10px;

        .avatar {
            margin-right: 20px;

            .avatar-img {
                width: 160px;
                height: 160px;
                border-radius: 50%;

            }
        }

        .user-info-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
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
            border-radius: 10px;
            border: 1px solid rgba(var(--foreground-color-rgb), .3);
            background-color: rgba(var(--foreground-color-rgb), .05);
            padding: 2px 6px;
            margin: 6px 0px;
        }

        .trans-name {
            font-size: 16px;
            font-weight: bold;
            margin: 6px 0px 6px 0px;
        }

        .artist-identity {
            margin: 6px 0px 20px 0px;
        }

        .user-follow {
            display: flex;
            flex-direction: row;
            margin: 6px 0px 30px 0px;
            font-size: 16px;
            font-weight: bold;
        }
    }

    .switcher {
        display: flex;
        font-size: 16px;
        align-items: center;
        padding-top: 10px;
        margin-left: 10px;
        padding-bottom: 20px;
        top: 0px;
        z-index: 1;
        width: 100%;
        backdrop-filter: blur(10px);

        .switcher-item {
            height: 20px;
            margin: 0 7px;
            background-color: transparent;
            border: none;
            cursor: pointer;

            .choosed {
                height: 2px;
                background-color: rgb(var(--highlight-color-rgb));
                transform: translateY(1px);
                transform: translateX(1px);
            }
        }

        .right-switcher {
            .list-icon {
                width: 20px;
                height: 20px;
                margin: 0px 10px;
                cursor: pointer;
            }
        }
    }

    .content {
        display: flex;

        .content-user {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .content-artist {
            display: flex;
            flex-direction: column;
            width: calc(100% - 20px);

            .artist-intro {
                margin: 0px 20px;
                text-align: left;
                line-height: 1.8em;
            }
        }
    }
}
</style>