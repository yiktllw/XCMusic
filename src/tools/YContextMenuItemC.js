
export class YContextMenuItemC {
    /**
     * @param {Object} params
     * @param {string} params.label 显示的文字
     * @param {string} params.role 作用
     * @param {string} params.icon 图标
     * @param {boolean} params.showSeparator 是否显示分隔符
     * @param {boolean} params.display 是否显示此菜单项
     */
    constructor({
        label = '播放',
        role = 'play',
        icon = '@/assets/play.png',
        showSeparator = false,
        display = false,
    }) {
        this._label = label;
        this._role = role;
        this._icon = icon;
        this._showSeparator = showSeparator;
        this._display = display;
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
    get display() {
        return this._display;
    }
    set display(value) {
        if (typeof value === 'boolean') {
            this._display = value;
        }
    }
}

export var songItems = [
    new YContextMenuItemC({
        label: 'context.play',
        icon: require('@/assets/play_.svg'),
        role: 'song-play',
        showSeparator: false,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.nextplay',
        icon: require('@/assets/addtoplaylist.svg'),
        role: 'song-addtoplaylist',
        showSeparator: false,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.subscribe',
        icon: require('@/assets/subscribe.svg'),
        role: 'song-subscribe',
        showSeparator: false,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.download',
        icon: require('@/assets/smalldownload.svg'),
        role: 'song-download',
        showSeparator: true,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.view_comment',
        icon: require('@/assets/comment.svg'),
        role: 'song-comment',
        showSeparator: false,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.copy_link',
        icon: require('@/assets/link.svg'),
        role: 'song-copylink',
        showSeparator: false,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.info',
        icon: require('@/assets/info.svg'),
        role: 'song-infomation',
        showSeparator: true,
        display: true,
    }),
    new YContextMenuItemC({
        label: 'context.delete_from_playlist',
        icon: require('@/assets/delete.svg'),
        role: 'song-delete',
        showSeparator: false,
        from: -1,
        display: false,
    })
]