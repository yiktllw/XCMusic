interface Theme {
    value: string,
    display: string,
    type?: 'dark' | 'light',
    background?: string,
}

export var themes: Theme[] = [
    {
        // value 是theme.scss里的class名的后半部分，比如 `theme-${value}`
        value: 'dark',
        // display 是显示在设置界面的名字
        display: 'setting_view.theme_name.dark',
        // 可选项，type和background二选一。
        // 'dark' / 'light'，暗色类主题，当进入歌单界面等时，会改变背景颜色，此选项会影响到改变的背景颜色
        type: 'dark',
    },
    {
        value: 'dark-high-contrast',
        display: 'setting_view.theme_name.dark_high_contrast',
        // 可选项，type和background二选一。
        // background是填在theme.scss的背景颜色，当进入歌单界面等时，会改变背景颜色，此选项会影响到改变的背景颜色
        background: '#000000',
    },
    {
        value: 'light',
        display: 'setting_view.theme_name.light',
        type: 'light',
    },
    {
        value: 'light-high-contrast',
        display: 'setting_view.theme_name.light_high_contrast',
        background: '#ffffff',
    },
    {
        value: 'yikt',
        display: 'yikt',
        background: '#f2cada',
    },
    {
        value: 'material',
        display: 'Material',
        background: '#283237',
    },
    {
        value: 'onedark',
        display: 'One Dark',
        background: '#292c33',
    },
    {
        value: 'solarized-light',
        display: 'Solarized Light',
        background: '#fcf6e5',
    },
    {
        value: 'abyss',
        display: 'Abyss',
        background: '#020c17',
    },
    {
        value: 'tomorrow-night-blue',
        display: 'Tomorrow Night Blue',
        background: '#0b254e',
    },
    {
        value: 'monokai',
        display: 'Monokai',
        background: '#272823',
    },
]