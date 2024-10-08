<template>
    <div class="setting">
        <div class="header">
            <div class="title font-color-main">设置</div>
            <div class="switcher">
                <YHeader :switcher="switcher" @new-position="handleSwitcher"></YHeader>
            </div>
        </div>
        <div class="main font-color-main">
            <div class="normal item">
                <div class="normal-title item-title">
                    常规
                </div>
                <div class="normal-content item-content ">
                    <div class="content-item item-theme ">
                        <div class="content-item-title item-theme-title ">主题</div>

                        <div class="theme-item">
                            <div v-for="item in themes" :key="item.value" class="item-theme-content">
                                <input type="radio" :id="item.value" name="theme" :value="item.value" v-model="theme"
                                    @change="handleTheme">
                                <label :for="item.value" @click="switchToTheme(item.value)">{{ item.display }}</label>
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-zoom">
                        <div class="content-item-title item-zoom-title">缩放</div>
                        <div class="zoom-item">
                            <div class="item-zoom-content">
                                <input type="number" min="50" max="200" step="5" v-model="zoom">
                                <div class="zoom-apply" @click="handleZoom">
                                    应用
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="js">
import { setBackgroundColorTheme } from '@/ncm/color';
import YHeader from '@/components/YHeader.vue';
import { Message } from '@/tools/YMessageC';
import { mapState } from 'vuex';
import { themes } from '@/ncm/theme';

export default {
    name: 'YSettingView',
    components: {
        YHeader,
    },
    computed: {
        ...mapState({
            setting: state => state.setting,
        }),
    },
    data() {
        return {
            switcher: [
                {
                    num: 0,
                    showNum: false,
                    position: 'normal',
                    display: '常规',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'play',
                    display: '播放',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'download',
                    display: '下载',
                },
                {
                    num: 0,
                    showNum: false,
                    position: 'about',
                    display: '关于',
                }
            ],
            themes: themes,
            theme: 'dark',
            zoom: 100,
        }
    },
    methods: {
        handleSwitcher(position) {
            console.log(position);
        },
        handleTheme(e) {
            this.switchToTheme(e.target.value);
        },
        switchToTheme(theme) {
            this.theme = theme;
            document.body.className = `theme-${this.theme}`;
            this.setting.display.theme = this.theme;
        },
        handleZoom() {
            try {
                this.setting.display.zoom = this.zoom / 100;
                if (!window.electron?.isElectron) {
                    Message.post('info', '缩放功能仅在桌面端生效');
                } else {
                    Message.post('success', '缩放已应用');
                }
            } catch (error) {
                Message.post('error', '请输入50到200之间的数字');
            }
        },
    },
    mounted() {
        setBackgroundColorTheme();
        this.theme = this.setting.display.theme;
        this.zoom = this.setting.display.zoom * 100;
    },
}
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
                margin: 10px 43.21px 10px 23px;
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
                }

                .item-theme {

                    .item-theme-title {
                        margin-right: 30px;
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
                        margin-right: 30px;
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