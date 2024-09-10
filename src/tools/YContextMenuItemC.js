
export class YContextMenuItemC {
    constructor({
        label = '播放',
        role = 'play',
        icon = '@/assets/play.png',
        showSeparator = false,
    }) {
        this._label = label;
        this._role = role;
        this._icon = icon;
        this._showSeparator = showSeparator;
    }
    get label() {
        return this._label;
    }
    set label(value) {
        if (typeof value === 'string') {
            this._label = value;
        }
    }
    get role() {
        return this._role;
    }
    set role(value) {
        if (typeof value === 'string') {
            this._role = value;
        }
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (typeof value === 'string') {
            this._icon = value;
        }
    }
    get showSeparator() {
        return this._showSeparator;
    }
    set showSeparator(value) {
        if (typeof value === 'boolean') {
            this._showSeparator = value;
        }
    }
}

export var songItems = [
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
]