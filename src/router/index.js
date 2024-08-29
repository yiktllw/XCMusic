import { createRouter, createWebHistory } from 'vue-router'
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
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
            },
            {
                path: 'login',
                name: 'Login',
                component: () => import(/* webpackChunkName: "about" */ '../components/YLoginWindow.vue')
            },
            {
                path: 'greeting',
                name: 'Greeting',
                component: () => import(/* webpackChunkName: "about" */ '../views/YGreetingView.vue')
            },
            {
                path: 'playlist/:id',
                name: 'Playlist',
                component: () => import(/* webpackChunkName: "about" */ '../views/YPlaylistView.vue'),
                props: route => ({
                    playlistId: Number(route.params.id),
                    type: 'playlist',
                })
            },
            {
                path: 'album/:id',
                name: 'Album',
                component: () => import(/* webpackChunkName: "about" */ '../views/YPlaylistView.vue'),
                props: route => ({
                    playlistId: Number(route.params.id),
                    type: 'album',
                })
            },
            {
                path: 'search/:search/:position',
                name: 'Search',
                component: () => import(/* webpackChunkName: "about" */ '../views/YSearchView.vue'),
                props: route => ({
                    search: route.params.search,
                    position: route.params.position,
                })
            }
        ],
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
