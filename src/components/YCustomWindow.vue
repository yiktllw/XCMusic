<template>
    <div class="y-custom-window">
        <YWindow ref="window" @new-window-state="handleNewWindowState">
            <template #header>
                <span class="window-title">
                    {{ $t('create_custom_theme.title') }}
                </span>
            </template>
            <div class="main">
                <div class="main-content">
                    <div class="checks">
                        <div class="check-item name">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_name') }}
                            </div>
                            <textarea class="input font-size-large" v-model="name" :maxlength="40"
                                :placeholder="$t('create_custom_theme.theme_name_placeholder')" rows="2"></textarea>
                        </div>
                        <div class="check-item type">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_type') }}
                            </div>
                            <div class="check">
                                <input type="radio" id="dark" value="dark" v-model="type" />
                                <label for="dark">
                                    {{ $t('create_custom_theme.theme_type_dark') }}
                                </label>
                                <input type="radio" id="light" value="light" v-model="type" />
                                <label for="light">
                                    {{ $t('create_custom_theme.theme_type_light') }}
                                </label>
                            </div>
                        </div>
                        <div class="check-item background">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_background_color') }}
                            </div>
                            <input class="input-ori" type="color" v-model="background" />
                        </div>
                        <div class="check-item auto-background">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_auto_background_type') }}
                            </div>
                            <div class="check">
                                <input type="radio" id="_dark" value="dark" v-model="autoBackgroundType" />
                                <label for="_dark">
                                    {{ $t('create_custom_theme.theme_type_dark') }}
                                </label>
                                <input type="radio" id="_other" value="other" v-model="autoBackgroundType" />
                                <label for="_other">
                                    {{ $t('create_custom_theme.theme_type_other') }}
                                </label>
                            </div>
                        </div>
                        <div class="check-item foreground">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_foreground_color') }}
                            </div>
                            <input class="input-ori" type="color" v-model="foreground" />
                        </div>
                        <div class="check-item panel-background">
                            <div class="label">
                                {{ $t('create_custom_theme.theme_panel_color') }}
                            </div>
                            <input class="input-ori" type="color" v-model="panelBackground" />
                        </div>
                        <div class="check-item font-color-type">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color_type') }}
                            </div>
                            <div class="check">
                                <input type="radio" id="fontColorAll" value="single" v-model="fontColorType" />
                                <label for="fontColorAll">
                                    {{ $t('create_custom_theme.font_color_type_single') }}
                                </label>
                                <input type="radio" id="fontColor" value="various" v-model="fontColorType" />
                                <label for="fontColor">
                                    {{ $t('create_custom_theme.font_color_type_various') }}
                                </label>
                            </div>
                        </div>
                        <div class="check-item font-color-all" v-if="fontColorType === 'single'">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color') }}
                            </div>
                            <input class="input-ori" type="color"
                                v-model="(fontColors as Theme.IFontColorAll).fontColorAll" />
                        </div>
                        <div class="check-item font-color-primary" v-if="fontColorType === 'various'">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color_primary') }}
                            </div>
                            <input class="input-ori" type="color"
                                v-model="(fontColors as Theme.IFontColor).fontColorMain" />
                        </div>
                        <div class="check-item font-color-high" v-if="fontColorType === 'various'">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color_secondary') }}
                            </div>
                            <input class="input-ori" type="color"
                                v-model="(fontColors as Theme.IFontColor).fontColorHigh" />
                        </div>
                        <div class="check-item font-color-standard" v-if="fontColorType === 'various'">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color_tertiary') }}
                            </div>
                            <input class="input-ori" type="color"
                                v-model="(fontColors as Theme.IFontColor).fontColorStandard" />
                        </div>
                        <div class="check-item font-color-low" v-if="fontColorType === 'various'">
                            <div class="label">
                                {{ $t('create_custom_theme.font_color_quaternary') }}
                            </div>
                            <input class="input-ori" type="color"
                                v-model="(fontColors as Theme.IFontColor).fontColorLow" />
                        </div>
                    </div>
                    <div class="preview" :style="{
                        background: `linear-gradient(180deg, ${nowBackgroundStyle} 0%, ${background} 300px, ${background} 100%)`,
                    }">
                        <div class="up">
                            <div class="left" :style="{
                                backgroundColor: foregroundColor,
                            }">
                                <img src="@/assets/logo.svg" class="logo" />
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    这是预览界面
                                </div>
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    这是侧边栏
                                </div>
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    侧边栏背景为5%透明度的前景色
                                </div>
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    字体颜色为次主要字体颜色
                                </div>
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    这是一个图标
                                </div>
                                <img src="@/assets/thumb.svg" class="logo" :style="{
                                    filter: `invert(${type === 'dark' ? '0' : '1'})`,
                                    opacity: '.8',
                                }" />
                                <div class="font-size-preview sidebar-item" :style="{
                                    color: fontColorHigh
                                }">
                                    图标颜色会随主题类型变化
                                </div>
                            </div>
                            <div class="right">
                                <div class="content-img" @click="nextIndex()" :style="{
                                    border: '1px solid ' + foreground,
                                }">
                                    <div class="font-size-preview " :style="{
                                        color: fontColorMain
                                    }">
                                        这是内容区域
                                    </div>
                                    <div class="font-size-preview " :style="{
                                        color: fontColorMain
                                    }">
                                        内容颜色会影响背景色
                                    </div>
                                    <div class="font-size-preview " :style="{
                                        color: nowBackground,
                                    }">
                                        以下为当前内容色
                                    </div>
                                    <div class="font-size-preview " :style="{
                                        color: fontColorMain
                                    }">
                                        {{ nowBackground }}
                                    </div>
                                    <div class="font-size-preview " :style="{
                                        color: fontColorMain
                                    }">
                                        点击切换到下一个内容色
                                    </div>
                                </div>
                                <div class="font-color-display">
                                    <div class="display-item" :style="{
                                        color: fontColorMain
                                    }">
                                        <div style="font-weight: bold;">
                                            这是主要字体颜色
                                        </div>
                                        <div>
                                            这是主要字体颜色
                                        </div>
                                    </div>
                                    <div class="display-item" :style="{
                                        color: fontColorHigh
                                    }">
                                        <div style="font-weight: bold;">
                                            这是次主要字体颜色
                                        </div>
                                        <div>
                                            这是次主要字体颜色
                                        </div>
                                    </div>
                                    <div class="display-item" :style="{
                                        color: fontColorStandard
                                    }">
                                        <div style="font-weight: bold;">
                                            这是次要字体颜色
                                        </div>
                                        <div>
                                            这是次要字体颜色
                                        </div>
                                    </div>
                                    <div class="display-item" :style="{
                                        color: fontColorLow
                                    }">
                                        <div style="font-weight: bold;">
                                            这是次次要字体颜色
                                        </div>
                                        <div>
                                            这是次次要字体颜色
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="down" :style="{
                            backgroundColor: panelBackground,
                        }">
                            <div class="font-size-preview " :style="{
                                color: fontColorStandard
                            }">
                                这是底部栏
                            </div>
                            <div class="font-size-preview " :style="{
                                color: fontColorStandard
                            }">
                                底部栏背景为面板颜色
                            </div>
                            <div class="font-size-preview " :style="{
                                color: fontColorStandard
                            }">
                                字体颜色为次要字体颜色
                            </div>
                        </div>
                    </div>
                </div>
                <button class="create font-size-large" @click="createTheme">
                    {{ $t('create_playlist.create') }}
                </button>
            </div>
        </YWindow>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import YWindow from './YWindow.vue';
import YScroll from './YScroll.vue';
import { Theme } from '@/utils/theme';
import { useStore } from 'vuex';
import { YColor } from '@/utils/color';
import { darkThemeColors, hexToRgb } from '@/utils/color';
import { Doc } from '@/utils/document';

export default defineComponent({
    name: 'YCustomWindow',
    setup() {
        const window = ref<InstanceType<typeof YWindow>>();
        const store = useStore();
        return {
            window,
            globalMsg: store.state.globalMsg,
            setting: store.state.setting,
        }
    },
    components: {
        YWindow,
        YScroll,
    },
    watch: {
        fontColorType(val) {
            if (val === 'single') {
                this.fontColors = { fontColorAll: '#ffffff' };
            } else {
                this.fontColors = {
                    fontColorMain: '#ffffff',
                    fontColorHigh: '#dddddd',
                    fontColorStandard: '#bbbbbb',
                    fontColorLow: '#999999',
                };
            }
        }
    },
    data() {
        return {
            name: '自定义主题',
            type: 'dark' as 'dark' | 'light',
            background: '#000000',
            nowBackgroundIndex: 0,
            autoBackgroundType: 'dark' as 'dark' | 'other',
            foreground: '#ffffff',
            panelBackground: '#333333',
            fontColorType: 'single' as 'single' | 'various',
            fontColors: { fontColorAll: '#ffffff' } as Theme.IFontColor | Theme.IFontColorAll,
            backgroundStyle: '',
        }
    },
    computed: {
        darkThemeColors() {
            return darkThemeColors;
        },
        foregroundColor() {
            const rgb = hexToRgb(this.foreground);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
        },
        fontColorMain() {
            if ('fontColorAll' in this.fontColors) {
                return this.fontColors.fontColorAll;
            } else {
                return this.fontColors.fontColorMain;
            }
        },
        fontColorHigh() {
            if ('fontColorAll' in this.fontColors) {
                const rgb = hexToRgb(this.fontColors.fontColorAll);
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
            } else {
                return this.fontColors.fontColorHigh;
            }
        },
        fontColorStandard() {
            if ('fontColorAll' in this.fontColors) {
                const rgb = hexToRgb(this.fontColors.fontColorAll);
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
            } else {
                return this.fontColors.fontColorStandard;
            }
        },
        fontColorLow() {
            if ('fontColorAll' in this.fontColors) {
                const rgb = hexToRgb(this.fontColors.fontColorAll);
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
            } else {
                return this.fontColors.fontColorLow;
            }
        },
        nowBackground() {
            return this.darkThemeColors[this.nowBackgroundIndex];
        },
        nowBackgroundStyle() {
            if (this.autoBackgroundType === 'dark') {
                return darkThemeColors[this.nowBackgroundIndex];
            } else {
                return YColor.getLightThemeColor(darkThemeColors[this.nowBackgroundIndex], this.background);
            }
        },
    },
    emits: [
        'new-window-state'
    ],
    mounted() {
    },
    methods: {
        handleNewWindowState() {
            this.$emit('new-window-state');
        },
        createTheme() {
            const result = Theme.createTheme({
                name: this.name,
                type: this.type,
                background: this.background,
                autoBackgroundType: this.autoBackgroundType,
                foreground: this.foreground,
                panelBackground: this.panelBackground,
                fontColors: this.fontColors,
            });
            const userCustomThemes = this.setting.display.userCustomThemes;
            this.setting.display.userCustomThemes = [
                ...userCustomThemes,
                {
                    data: result.theme,
                    classContent: result.classContent,
                },
            ]
            this.globalMsg.post('close-custom-window');
            Doc.updateDocumentClassBySetting(this.setting.display.userCustomThemes);
            this.window!.closeWindow();
        },
        nextIndex() {
            this.nowBackgroundIndex = (this.nowBackgroundIndex + 1) % darkThemeColors.length;
        },
    }
})
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px 10px 10px;
    // width: 432.1px;

    .main-content {
        display: flex;
        flex-direction: row;
        width: 100%;

        .checks {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .check-item {
                display: flex;
                flex-direction: row;
                align-items: first baseline;
                gap: 5px;
                width: 100%;

                .label {
                    min-width: 123px;
                    max-width: 123px;
                    text-align: left;
                    color: var(--font-color-main);
                    font-weight: bold;
                }

                .input-ori {
                    padding: 5px 10px;
                }
            }

        }

        .preview {
            margin: 0 10px 13px 13px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 600px;
            min-height: 460px;
            background-color: var(--background-color);
            border: 1px solid var(--foreground-color);

            .font-size-preview {
                font-size: 12px;
            }

            .up {
                height: calc(100% - 50px);
                display: flex;
                flex-direction: row;

                .left {
                    display: flex;
                    flex-direction: column;
                    padding: 10px 0;
                    gap: 10px;
                    width: 110px;
                    height: 100%;
                    align-items: center;

                    .sidebar-item {
                        width: calc(100% - 20px);
                        text-align: left;
                    }

                    .logo {
                        width: 100px;
                        margin-bottom: 10px;
                    }
                }

                .right {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: start;
                    padding: 50px 0 0 50px;
                    width: calc(100% - 200px);

                    .content-img {
                        display: flex;
                        flex-direction: column;
                        cursor: pointer;
                        align-items: center;
                        justify-content: space-between;
                        padding: 15px 0;
                        gap: 13px;
                        width: 321px;
                    }

                    .font-color-display {
                        display: flex;
                        flex-direction: column;
                        align-items: start;
                        padding-top: 20px;
                        gap: 10px;
                        width: 100%;

                        .display-item {
                            display: flex;
                            flex-direction: row;
                            gap: 5px;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                }

            }

            .down {
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0 10px;
                height: 50px;
                background-color: var(--panel-background-color);
                justify-content: space-between;
            }
        }
    }

    .input {
        padding: 5px 10px;
        resize: none;
        width: 120px;
    }

    .check {
        display: flex;
        align-items: center;
        width: 100%;
        // gap: 5px;

        input {
            cursor: pointer;
        }

        label {
            cursor: pointer;
            color: var(--font-color-high);
        }
    }

    .create {
        width: fit-content;
        border-radius: 20px;
        padding: 5px 20px 8px 20px;
        background-color: rgb(255, 70, 90);
        color: #fff;
        border: none;
        cursor: pointer;
    }
}
</style>