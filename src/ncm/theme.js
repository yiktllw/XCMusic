export var themes = [
    {
        // value 是theme.scss里的class名的后半部分，比如 `theme-${value}`
        value: 'dark',
        // display 是显示在设置界面的名字
        display: '暗色',
        // 'dark' / 'light'，暗色类主题，当进入歌单界面等时，会改变背景颜色，此选项会影响到背景颜色
        type: 'dark',
    },
    {
        value: 'light',
        display: '亮色',
        type: 'light',
    },
]