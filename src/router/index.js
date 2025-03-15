import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    children: [
      {
        path: "about",
        name: "about",
        component: () => import("@/views/AboutView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "greeting",
        name: "Greeting",
        component: () => import("@/views/YGreetingView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "playlist/:id",
        name: "Playlist",
        component: () => import("@/views/YPlaylistViewNew/index.vue"),
        props: (route) => ({
          playlistId: Number(route.params.id),
          type: "playlist",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "album/:id",
        name: "Album",
        component: () => import("@/views/YPlaylistViewNew/index.vue"),
        props: (route) => ({
          playlistId: Number(route.params.id),
          type: "album",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "search/:search/:position",
        name: "Search",
        component: () => import("@/views/YSearchView.vue"),
        props: (route) => ({
          search: route.params.search,
          position: route.params.position,
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "user/:id",
        name: "UserPage",
        component: () => import("@/views/YUserView.vue"),
        props: (route) => ({
          userId: Number(route.params.id),
          type: "user",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "artist/:id",
        name: "Artist",
        component: () => import("@/views/YUserView.vue"),
        props: (route) => ({
          userId: Number(route.params.id),
          type: "artist",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "test",
        name: "Test",
        component: () => import("@/views/YTestView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "user_songs_rank/:uid",
        name: "UserSongsRank",
        component: () => import("@/views/YUserSongsRankView.vue"),
        props: (route) => ({
          userId: Number(route.params.uid),
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "comment/song/:id",
        name: "SongComment",
        component: () => import("@/views/YCommentView.vue"),
        props: (route) => ({
          id: Number(route.params.id),
          type: "song",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "comment/album/:id/info/:info",
        name: "AlbumComment",
        component: () => import("@/views/YCommentView.vue"),
        props: (route) => ({
          id: Number(route.params.id),
          type: "album",
          info: JSON.parse(decodeURIComponent(route.params.info)),
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "comment/playlist/:id/info/:info",
        name: "PlaylistComment",
        component: () => import("@/views/YCommentView.vue"),
        props: (route) => ({
          id: Number(route.params.id),
          type: "playlist",
          info: JSON.parse(decodeURIComponent(route.params.info)),
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "setting",
        name: "Setting",
        component: () => import("@/views/YSettingView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "markdown/:file",
        name: "Markdown",
        component: () => import("@/views/YMarkdownView.vue"),
        props: (route) => ({
          file: route.params.file,
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "sheet/:id",
        name: "Sheet",
        component: () => import("@/views/YSheetView.vue"),
        props: (route) => ({
          sheetId: Number(route.params.id),
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "follow/:id",
        name: "Follow",
        component: () => import("@/views/YFollowView.vue"),
        props: (route) => ({
          uid: Number(route.params.id),
          type: "follows",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "follower/:id",
        name: "Follower",
        component: () => import("@/views/YFollowView.vue"),
        props: (route) => ({
          uid: Number(route.params.id),
          type: "followers",
        }),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "subscribe/album",
        name: "SubscribeAlbum",
        component: () => import("@/views/YSubscribedAlbumView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "local",
        name: "Local",
        component: () => import("@/views/YLocalSongsView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "download",
        name: "Download",
        component: () => import("@/views/YDownloadView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "cloud",
        name: "Cloud",
        component: () => import("@/views/YCloudView.vue"),
        meta: {
          keepAlive: false,
        },
      },
      {
        path: "audio/test",
        name: "AudioTest",
        component: () => import("@/views/YAudioView.vue"),
        meta: {
          keepAlive: false,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
