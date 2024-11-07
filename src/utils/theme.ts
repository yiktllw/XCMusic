function hexToRgb(hex: string) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

export namespace Theme {
    /**
     * 使用单种字体颜色，次要字体透明度更低
     */
    export interface IFontColorAll {
        /**
         * 使用单种字体颜色，次要字体透明度更低
         */
        fontColorAll: string,
    }

    /**
     * 使用多种字体颜色，分别为主要字体颜色，次主要字体颜色，标准字体颜色，次标准字体颜色
     */
    export interface IFontColor {
        /**
         * 主要字体颜色
         */
        fontColorMain: string,
        /**
         * 次主要字体颜色
         */
        fontColorHigh: string,
        /**
         * 标准字体颜色
         */
        fontColorStandard: string,
        /**
         * 次标准字体颜色
         */
        fontColorLow: string,
    }

    export interface IThemeCSS {
        /**
         * 自定义主题名称
         */
        name: string,
        /**
         * 主题类型，dark为深色，light为浅色
         */
        type: 'dark' | 'light',
        /**
         * 主题背景色
         */
        background: string,
        /**
         * 主题背景色-自动变化类型，dark的背景色变化更大
         */
        autoBackgroundType: 'dark' | 'other',
        /**
         * 主题前景色
         */
        foreground: string,
        /**
         * 主题面板背景色
         */
        panelBackground: string,
        /**
         * 主题字体颜色
         */
        fontColors: IFontColor | IFontColorAll,
        /**
         * 强调色
         */
        highlight: string,
    }

    type ICssClassContent = string;

    /**
     * 从IThemeCSS生成css class
     */
    export function createTheme(themeToBeProcessed: IThemeCSS): { classContent: ICssClassContent, theme: Theme1 | Theme2 } {
        const time = new Date().getTime();

        var resultClass = ``;
        var fontColors = ``;
        if ('fontColorAll' in themeToBeProcessed.fontColors) {
            fontColors = `--font-color-rgb: ${themeToBeProcessed.fontColors.fontColorAll};\n`
            fontColors += `--font-color-main: rgba(var(--font-color-rgb), 1); \n`
            fontColors += `--font-color-high: rgba(var(--font-color-rgb), 0.8);\n`
            fontColors += `--font-color-standard: rgba(var(--font-color-rgb), 0.6);\n`
            fontColors += `--font-color-low: rgba(var(--font-color-rgb), 0.4);\n`;
        } else {
            fontColors = `--font-color-main: ${themeToBeProcessed.fontColors.fontColorMain}; \n`
            fontColors += `--font-color-high: ${themeToBeProcessed.fontColors.fontColorHigh}; \n`
            fontColors += `--font-color-standard: ${themeToBeProcessed.fontColors.fontColorStandard}; \n`
            fontColors += `--font-color-low: ${themeToBeProcessed.fontColors.fontColorLow};\n`;
        }

        const foregroundColor = hexToRgb(themeToBeProcessed.foreground);

        resultClass += `--icon-invert: invert(${themeToBeProcessed.type === 'dark' ? '0' : '1'});\n`

        resultClass += `${fontColors} --background-color: ${themeToBeProcessed.background}; \n`

        resultClass += `--foreground-color: ${themeToBeProcessed.foreground}; \n `
        resultClass += `--foreground-color-rgb: ${foregroundColor.r}, ${foregroundColor.g}, ${foregroundColor.b}; \n `
        resultClass += `--panel-background-color: ${themeToBeProcessed.panelBackground}; \n`
        
        const highlightColor = hexToRgb(themeToBeProcessed.highlight);
        resultClass += `--highlight-color-rgb: ${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}\n`

        var _theme = null;
        _theme = {
            value: time.toString(),
            display: themeToBeProcessed.name,
        }
        if (themeToBeProcessed.autoBackgroundType === 'dark') {
            _theme = {
                ..._theme,
                type: themeToBeProcessed.type,
            }
        } else {
            _theme = {
                ..._theme,
                background: themeToBeProcessed.background,
            }
        }
        return {
            classContent: resultClass,
            theme: _theme
        };
    }
}

interface IbaseTheme {
    /**
     *  value 是theme.scss里的class名的后半部分，比如 `theme-${value}`
     */
    value: string,
    /**
     *  display 是显示在设置界面的名字
     */
    display: string,
}

export interface Theme1 extends IbaseTheme {
    /**
     *  和background二选一，当进入歌单界面等时，会改变背景颜色，若为dark，则背景色的变动幅度会更大
     */
    type: 'dark' | 'light',
}

export interface Theme2 extends IbaseTheme {
    /**
     * 和type二选一， background是填在theme.scss的背景颜色，当进入歌单界面等时，会改变背景颜色，此选项会影响到改变的背景颜色
     */
    background: string,
}

export var themes: Array<Theme1 | Theme2> = [
    {
        value: 'dark',
        display: 'setting_view.theme_name.dark',
        type: 'dark',
    },
    {
        value: 'dark-high-contrast',
        display: 'setting_view.theme_name.dark_high_contrast',
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
    {
        value: 'dracula',
        display: 'Dracula',
        background: '#282a35',
    },
]