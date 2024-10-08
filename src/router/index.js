import { createRouter,createWebHashHistory } from 'vue-router'
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
                path: 'login',
                name: 'Login',
                component: () => import('../components/YLoginWindow.vue')
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
        ],
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
