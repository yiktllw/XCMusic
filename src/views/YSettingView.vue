<template>
    <div class="setting">
        <div class="header">
            <div class="title font-color-main">{{ $t('settings') }}</div>
            <div class="switcher">
                <YHeader :switcher="switcher" @new-position="handleSwitcher"></YHeader>
            </div>
        </div>
        <div class="main font-color-main">
            <div class="normal item">
                <div class="normal-title item-title">
                    {{ $t('header.setting_view.normal') }}
                </div>
                <div class="normal-content item-content ">
                    <div class="content-item item-languige">
                        <div class="content-item-title">
                            {{ $t('setting_view.language') }}
                        </div>
                        <div class="content-item-content">
                            <input type="radio" id="zh" name="language" value="zh" v-model="language"
                                @change="switchToLanguage('zh')">
                            <label for="zh" @click="switchToLanguage('zh')">
                                简体中文
                            </label>
                            <input type="radio" id="en" name="language" value="en" v-model="language"
                                @change="switchToLanguage('en')">
                            <label for="en" @click="switchToLanguage('en')">
                                English
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-theme ">
                        <div class="content-item-title item-theme-title ">
                            {{ $t('setting_view.theme') }}
                        </div>
                        <div class="theme-item">
                            <div v-for="item in themes" :key="item.value" class="item-theme-content">
                                <input type="radio" :id="item.value" name="theme" :value="item.value" v-model="theme"
                                    @change="handleTheme">
                                <label :for="item.value" @click="switchToTheme(item.value)">
                                    {{
                                        [
                                            'setting_view.theme_name.dark',
                                            'setting_view.theme_name.dark_high_contrast',
                                            'setting_view.theme_name.light',
                                            'setting_view.theme_name.light_high_contrast',
                                        ].includes(item.display) ?
                                            $t(item.display) : item.display
                                    }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-zoom">
                        <div class="content-item-title item-zoom-title">
                            {{ $t('setting_view.zoom') }}
                        </div>
                        <div class="zoom-item">
                            <div class="item-zoom-content">
                                <input type="number" min="50" max="200" step="5" v-model="zoom">
                                <div class="zoom-apply" @click="handleZoom">
                                    {{ $t('setting_view.apply') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="play item">
                <div class="play-title item-title">
                    {{ $t('header.setting_view.play') }}
                </div>
                <div class="play-content item-content">
                    <div class="content-item item-play-volume_leveling">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.volume_leveling') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="volume_leveling" name="volume_leveling" v-model="volume_leveling"
                                @change="setVolumeLeveling(volume_leveling)">
                            <label for="volume_leveling" @click="setVolumeLeveling(volume_leveling)">
                                {{ $t('setting_view.play.volume_leveling_content') }}
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-play-dbclick">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.dbclick') }}
                        </div>
                        <div class="content-item-content item-play-dbclick-content">
                            <div class="dbclick-item1">
                                <input type="radio" id="play-dbclick" name="play" value="all" v-model="dbclick"
                                    @change="setDbClick('all')">
                                <label for="play-dbclick" @click="setDbClick('all')">
                                    {{ $t('setting_view.play.dbclick_playall') }}
                                </label>
                            </div>
                            <div class="dbclick-item2">
                                <input type="radio" id="play-click" name="play" value="single" v-model="dbclick"
                                    @change="setDbClick('single')">
                                <label for="play-click" @click="setDbClick('single')">
                                    {{ $t('setting_view.play.dbclick_playsingle') }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="download item">
                <div class="download-title item-title">
                    {{ $t('header.setting_view.download') }}
                </div>
            </div>
            <div class="about item">
                <div class="about-title item-title">
                    {{ $t('header.setting_view.about') }}
                </div>
                <div class="about-content item-content">
                    <div class="content-item item-about-version">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.version') }}
                        </div>
                        <div class="content-item-content">
                            {{ version }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, version } from 'vue';
import { setBackgroundColorTheme } from '@/utils/color';
import YHeader from '@/components/YHeader.vue';
import { Message } from '@/dual/YMessageC';
import { useStore } from 'vuex';
import { themes } from '@/utils/theme';
import packageJson from '../../package.json';

export default defineComponent({
    name: 'YSettingView',
    components: {
        YHeader,
    },
    setup() {
        const store = useStore();

        return {
            setting: store.state.setting,
            player: store.state.player,
        }
    },
    computed: {
        version() {
            return packageJson.version;
        }
    },
    data() {
        return {
            switcher: [
                {
                    num: 0,
                    showNum: false,
                    position: 'normal',
                    display: 'header.setting_view.normal',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'play',
                    display: 'header.setting_view.play',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'download',
                    display: 'header.setting_view.download',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'about',
                    display: 'header.setting_view.about',
                }
            ],
            language: 'zh',
            themes: themes,
            theme: 'dark',
            zoom: 100,
            volume_leveling: false,
            dbclick: 'all',
        }
    },
    methods: {
        handleSwitcher(position: string) {
            console.log(position);
        },
        handleTheme(e: any) {
            this.switchToTheme(e.target.value);
        },
        switchToTheme(theme: string) {
            this.theme = theme;
            document.body.className = `theme-${this.theme}`;
            this.setting.display.theme = this.theme;
        },
        handleZoom() {
            try {
                this.setting.display.zoom = this.zoom / 100;
                if (window.electron?.isElectron) {
                    Message.post('success', this.$t('message.setting_view.zoom_applied'));
                } else {
                    Message.post('info', this.$t('message.setting_view.only_desktop'));
                }
            } catch (error) {
                Message.post('error', this.$t('message.setting_view.zoom_range_50_200'));
            }
        },
        switchToLanguage(language: 'zh' | 'en') {
            this.language = language;
            this.setting.display.language = language;
            this.$i18n.locale = this.language;
        },
        setDbClick(behavior: 'all' | 'single') {
            this.dbclick = behavior;
            this.setting.play.dbclick = behavior;
        },
        setVolumeLeveling(bool: boolean) {
            this.volume_leveling = bool;
            this.setting.play.volume_leveling = this.volume_leveling;
            this.player.volumeLeveling = bool;
        }
    },
    mounted() {
        setBackgroundColorTheme();
        this.theme = this.setting.display.theme;
        this.zoom = this.setting.display.zoom * 100;
        this.language = this.setting.display.language;
        this.volume_leveling = this.setting.play.volume_leveling;
        this.dbclick = this.setting.play.dbclick;
    },
})
</script>

<style lang="scss" scoped>
.setting {
    display: flex;
    width: inherit;
    height: inherit;
    padding: 10px;

    .header {
        display: flex;
        flex-direction: column;
        width: calc(100% - 40px);
        text-align: left;
        position: absolute;
        background-color: var(--background-color);

        .title {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0 10px 20px;
        }

        .switcher {
            --font-size-header: 17px;
            --font-weight-header: bold;
        }
    }

    .main {
        display: flex;
        flex-direction: column;
        margin-top: 120px;

        .item {
            display: flex;
            align-items: first baseline;
            flex-direction: row;
            white-space: nowrap;

            .item-title {
                font-size: 17px;
                font-weight: bold;
                margin: 10px 0 10px 23px;
                text-align: left;
                min-width: 86.42px;
            }

            .item-content {
                display: flex;
                flex-direction: column;
                margin: 10px 43.21px 10px 23px;

                .content-item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    align-items: first baseline;
                    color: var(--font-color-high);
                    margin-bottom: 10px;

                    .content-item-title {
                        font-weight: bold;
                        min-width: 100px;
                        text-align: left;
                    }

                    .content-item-content {

                        input[type="radio"] {
                            cursor: pointer;
                        }

                        label {
                            cursor: pointer;
                        }
                    }

                    .item-play-dbclick-content {
                        display: flex;
                        flex-direction: column;
                        line-height: 32.1px;
                        align-items: start;
                    }
                }

                .item-theme {

                    .item-theme-title {
                        font-weight: bold;
                    }

                    .theme-item {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: first baseline;
                        line-height: 32.1px;

                        .item-theme-content {
                            align-items: center;
                            margin-right: 10px;
                            cursor: pointer;

                            input[type="radio"] {
                                cursor: pointer;
                            }

                            label {
                                cursor: pointer;
                                min-width: 70px;
                            }
                        }
                    }
                }

                .item-zoom {

                    .item-zoom-title {
                        font-weight: bold;
                    }

                    .zoom-item {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: first baseline;
                        line-height: 32.1px;

                        .item-zoom-content {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            margin-right: 10px;
                            cursor: pointer;

                            input[type="number"] {
                                display: flex;
                                align-items: center;
                                width: 50px;
                                background-color: transparent;
                                border: 1px solid rgba(var(--foreground-color-rgb), $alpha: 0.3);
                                color: var(--font-color-high);
                                border-radius: 5px;

                                &:focus {
                                    outline: none;
                                }
                            }

                            .zoom-apply {
                                cursor: pointer;
                                margin-left: 10px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>