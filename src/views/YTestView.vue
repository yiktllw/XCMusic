<template>
    <div class="display">
        <YContextMenu :items="menu" />
    </div>
</template>

<script lang="js">
import YContextMenu from '@/components/YContextMenu.vue';
import { YContextMenuItemC } from '@/tools/YContextMenuItemC';

export default {
    name: 'YTestView',
    components: {
        YContextMenu,
    },
    data() {
        return {
            menu: [
                new YContextMenuItemC({
                    label: '播放',
                    icon: require('@/assets/play_.svg'),
                    role: 'song-play',
                    showSeparator: false,
                }),
                new YContextMenuItemC({
                    label: '添加到播放列表',
                    icon: require('@/assets/addtoplaylist.svg'),
                    role: 'song-addtoplaylist',
                    showSeparator: false,
                }),
                new YContextMenuItemC({
                    label: '收藏',
                    icon: require('@/assets/subscribe.svg'),
                    role: 'song-subscribe',
                    showSeparator: false,
                }),
                new YContextMenuItemC({
                    label: '下载',
                    icon: require('@/assets/smalldownload.svg'),
                    role: 'song-download',
                    showSeparator: true,
                }),
                new YContextMenuItemC({
                    label: '查看评论',
                    icon: require('@/assets/comment.svg'),
                    role: 'song-comment',
                    showSeparator: false,
                }),
                new YContextMenuItemC({
                    label: '复制链接',
                    icon: require('@/assets/comment.svg'),
                    role: 'song-copylink',
                    showSeparator: false,
                }),
                new YContextMenuItemC({
                    label: '查看歌曲信息',
                    icon: require('@/assets/comment.svg'),
                    role: 'song-infomation',
                    showSeparator: true,
                }),
                new YContextMenuItemC({
                    label: '从歌单中删除',
                    icon: require('@/assets/comment.svg'),
                    role: 'song-delete',
                    showSeparator: false,
                })
            ],
        };
    },
    methods: {

    },
    mounted() {
    },
}

</script>