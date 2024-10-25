import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        children: [
            {
                path: 'about',
                name: 'about',
                component: () => import('../views/AboutView.vue')
            },
            {
                path: 'greeting',
                name: 'Greeting',
                component: () => import('../views/YGreetingView.vue')
            },
            {
                path: 'playlist/:id',
                name: 'Playlist',
                component: () => import('../views/YPlaylistView.vue'),
                props: route => ({
                    playlistId: Number(route.params.id),
                    type: 'playlist',
                })
            },
            {
                path: 'album/:id',
                name: 'Album',
                component: () => import('../views/YPlaylistView.vue'),
                props: route => ({
                    playlistId: Number(route.params.id),
                    type: 'album',
                })
            },
            {
                path: 'search/:search/:position',
                name: 'Search',
                component: () => import('../views/YSearchView.vue'),
                props: route => ({
                    search: route.params.search,
                    position: route.params.position,
                })
            },
            {
                path: 'user/:id',
                name: 'UserPage',
                component: () => import('../views/YUserView.vue'),
                props: route => ({
                    userId: Number(route.params.id),
                    type: 'user',
                })
            },
            {
                path: 'artist/:id',
                name: 'Artist',
                component: () => import('../views/YUserView.vue'),
                props: route => ({
                    userId: Number(route.params.id),
                    type: 'artist',
                })
            },
            {
                path: 'test',
                name: 'Test',
                component: () => import('../views/YTestView.vue')
            },
            {
                path: 'user_songs_rank/:uid',
                name: 'UserSongsRank',
                component: () => import('../views/YUserSongsRankView.vue'),
                props: route => ({
                    userId: Number(route.params.uid),
                })
            },
            {
                path: 'comment/song/:id',
                name: 'SongComment',
                component: () => import('../views/YCommentView.vue'),
                props: route => ({
                    id: Number(route.params.id),
                    type: 'song',
                })
            },
            {
                path: 'comment/album/:id',
                name: 'AlbumComment',
                component: () => import('../views/YCommentView.vue'),
                props: route => ({
                    id: Number(route.params.id),
                    type: 'album',
                })
            },
            {
                path: 'comment/playlist/:id',
                name: 'PlaylistComment',
                component: () => import('../views/YCommentView.vue'),
                props: route => ({
                    id: Number(route.params.id),
                    type: 'playlist',
                })
            },
            {
                path: 'setting',
                name: 'Setting',
                component: () => import('../views/YSettingView.vue')
            },
            {
                path: 'markdown/:file',
                name: 'Markdown',
                component: () => import('../views/YMarkdownView.vue'),
                props: route => ({
                    file: route.params.file,
                }),
            },
            {
                path: 'sheet/:id',
                name: 'Sheet',
                component: () => import('../views/YSheetView.vue'),
                props: route => ({
                    sheetId: Number(route.params.id),
                }),
            },
            {
                path: 'follow/:id',
                name: 'Follow',
                component: () => import('../views/YFollowView.vue'),
                props: route => ({
                    uid: Number(route.params.id),
                    type: 'follows',
                }),
            },
            {
                path: 'follower/:id',
                name: 'Follower',
                component: () => import('../views/YFollowView.vue'),
                props: route => ({
                    uid: Number(route.params.id),
                    type: 'followers',
                }),
            },
            {
                path: 'subscribe/album',
                name: 'SubscribeAlbum',
                component: () => import('../views/YSubscribedAlbumView.vue'),
            },
            {
                path: 'local',
                name: 'Local',
                component: () => import('../views/YLocalSongsView.vue'),
            },
        ],
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
