<template>
    <div class="setting" ref="main">
        <div class="header">
            <div class="title font-color-main">{{ $t('settings') }}</div>
            <div class="switcher">
                <YHeader :switcher="switcher" @new-position="handleSwitcher" ref="header"></YHeader>
            </div>
        </div>
        <div class="main font-color-main">
            <div class="normal item" id="normal">
                <div class="normal-title item-title">
                    {{ $t('header.setting_view.normal') }}
                </div>
                <div class="normal-content item-content ">
                    <div class="content-item item-languige">
                        <div class="content-item-title">
                            {{ $t('setting_view.language') }}
                        </div>
                        <div class="content-item-content">
                            <input type="radio" id="setting_zh" name="language" value="zh" v-model="language"
                                @change="switchToLanguage('zh')">
                            <label for="setting_zh">
                                简体中文
                            </label>
                            <input type="radio" id="setting_en" name="language" value="en" v-model="language"
                                @change="switchToLanguage('en')">
                            <label for="setting_en">
                                English
                            </label>
                        </div>
                    </div>
                    <div class="content-item">
                        <div class="content-item-title">
                            {{ $t('setting_view.open_sys') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="setting_open_at_login" name="open_at_login" v-model="openAtLogin"
                                @change="setOpenAtLogin(openAtLogin)">
                            <label for="setting_open_at_login">
                                {{ $t('setting_view.open_at_login') }}
                            </label>
                        </div>
                    </div>
                    <div class="content-item close-item">
                        <div class="content-item-title">
                            {{ $t('setting_view.close') }}
                        </div>
                        <div class="content-item-content item-content-close">
                            <div class="close-item1">
                                <input type="radio" id="setting_minimize" name="close" value="minimize"
                                    v-model="closeBehavior" @change="setClose('minimize')">
                                <label for="setting_minimize">
                                    {{ $t('setting_view.close_to_minimize') }}
                                </label>
                            </div>
                            <div class="close-item2">
                                <input type="radio" id="setting_close" name="close" value="quit" v-model="closeBehavior"
                                    @change="setClose('quit')">
                                <label for="setting_close">
                                    {{ $t('setting_view.close_to_quit') }}
                                </label>
                            </div>
                            <div class="always-ask">
                                <input type="checkbox" id="setting_always_ask" name="always_ask"
                                    v-model="closeAlwaysAsk" @change="setAlwaysAsk(closeAlwaysAsk)">
                                <label for="setting_always_ask">
                                    {{ $t('setting_view.close_always_ask') }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="content-item">
                        <div class="content-item-title">
                            {{ $t('setting_view.reload') }}
                        </div>
                        <div class="content-item-content">
                            <div class="reload-item" @click="reloadWindow">
                                {{ $t('setting_view.click_to_reload') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="appearance item" id="appearance">
                <div class="appearance-title item-title">
                    {{ $t('header.setting_view.appearance') }}
                </div>
                <div class="appearance-content item-content">
                    <div class="content-item item-theme ">
                        <div class="content-item-title item-theme-title ">
                            {{ $t('setting_view.theme') }}
                        </div>
                        <div class="content-item-content">
                            <select v-model="theme" @change="handleTheme">
                                <option v-for="item in themes" :value="item.value">
                                    {{
                                        [
                                            'setting_view.theme_name.dark',
                                            'setting_view.theme_name.dark_high_contrast',
                                            'setting_view.theme_name.light',
                                            'setting_view.theme_name.light_high_contrast',
                                        ].includes(item.display) ?
                                            $t(item.display) : item.display
                                    }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="content-item item-custom">
                        <div class="content-item-title">
                            {{ $t('setting_view.appearance.custom') }}
                        </div>
                        <div class="content-item-content ">
                            <div class="custom-text" @click="openCustomWindow">
                                {{ $t('setting_view.appearance.click_to_create_theme') }}
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
                    <div class="content-item item-fullscreen-auto-zoom">
                        <div class="content-item-title">
                            {{ $t('setting_view.display.fullscreen') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="setting_auto_zoom" name="auto_zoom" v-model="auto_zoom"
                                @change="setAutoZoom(auto_zoom)">
                            <label for="setting_auto_zoom" :title="$t('setting_view.display.press_f11_to_fullscreen')">
                                {{ $t('setting_view.display.fullscreen_auto_zoom') }}
                                <span class="font-color-low">
                                    ({{ $t('setting_view.display.press_f11_to_fullscreen') }})
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-sidebar">
                        <div class="content-item-title">
                            {{ $t('setting_view.display.sidebar') }}
                        </div>
                        <div class="content-item-content item-sidebar-content">
                            <div class="item-sidebar-content-title">
                                {{ $t('setting_view.display.hideInSidebar') }}
                            </div>
                            <div class="item-sidebar-content-checks">
                                <input type="checkbox" id="setting_sidebar_favorite" name="setting_sidebar_favorite"
                                    v-model="hideInSidebar_favorite" @change="setHideInSidebar">
                                <label for="setting_sidebar_favorite">
                                    {{ $t('playlist_view.my_favorite_musics') }}
                                </label>
                                <input type="checkbox" id="setting_sidebar_album" name="setting_sidebar_album"
                                    v-model="hideInSidebar_album" @change="setHideInSidebar">
                                <label for="setting_sidebar_album">
                                    {{ $t('subscribed_album') }}
                                </label>
                                <input type="checkbox" id="setting_sidebar_local" name="setting_sidebar_local"
                                    v-model="hideInSidebar_local" @change="setHideInSidebar">
                                <label for="setting_sidebar_local">
                                    {{ $t('local_music') }}
                                </label>
                                <input type="checkbox" id="setting_sidebar_download" name="setting_sidebar_download"
                                    v-model="hideInSidebar_download" @change="setHideInSidebar">
                                <label for="setting_sidebar_download">
                                    {{ $t('manage_download') }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="play item" id="play">
                <div class="play-title item-title">
                    {{ $t('header.setting_view.play') }}
                </div>
                <div class="play-content item-content">
                    <div class="content-item ">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.launch') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="setting_auto_play" name="auto_play" v-model="autoPlay"
                                @change="setAutoPlay(autoPlay)">
                            <label for="setting_auto_play">
                                {{ $t('setting_view.play.auto_play') }}
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-play-volume_leveling">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.volume_leveling') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="setting_volume_leveling" name="volume_leveling"
                                v-model="volume_leveling" @change="setVolumeLeveling(volume_leveling)">
                            <label for="setting_volume_leveling">
                                {{ $t('setting_view.play.volume_leveling_content') }}
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-playui">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.playui') }}
                        </div>
                        <div class="content-item-content">
                            <input type="checkbox" id="setting_spectrum" name="spectrum" v-model="spectrum"
                                @change="setSpectrum(spectrum)">
                            <label for="setting_spectrum">
                                {{ $t('setting_view.play.show_spectrum') }}
                            </label>
                        </div>
                    </div>
                    <div class="content-item item-play-dbclick">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.dbclick') }}
                        </div>
                        <div class="content-item-content item-play-dbclick-content">
                            <div class="dbclick-item1">
                                <input type="radio" id="setting_play-dbclick" name="play" value="all" v-model="dbclick"
                                    @change="setDbClick('all')">
                                <label for="setting_play-dbclick">
                                    {{ $t('setting_view.play.dbclick_playall') }}
                                </label>
                            </div>
                            <div class="dbclick-item2">
                                <input type="radio" id="setting_play-click" name="play" value="single" v-model="dbclick"
                                    @change="setDbClick('single')">
                                <label for="setting_play-click">
                                    {{ $t('setting_view.play.dbclick_playsingle') }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="content-item">
                        <div class="content-item-title">
                            {{ $t('setting_view.play.device') }}
                        </div>
                        <div class="content-item-content">
                            <select v-model="selectedDevice" @change="selectAudioOutputDevice(selectedDevice)">
                                <option v-for="device in devices" :key="device.deviceId" :value="device.deviceId">
                                    {{ device.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="download item" id="download">
                <div class="download-title item-title">
                    {{ $t('header.setting_view.download') }}
                </div>
                <div class="download-content item-content">
                    <div class="content-item item-download-quality">
                        <div class="content-item-title">
                            {{ $t('setting_view.download.quality') }}
                        </div>
                        <div class="content-item-content download-quality-item">
                            <select v-model="quality" @change="setQuality(($event.target as HTMLSelectElement).value)">
                                <option v-for="quality_item in qualities" :key="quality_item" :value="quality_item">
                                    {{ $t(`quality.${quality_item}`) }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="content-item item-download-path">
                        <div class="content-item-title">
                            {{ $t('setting_view.download.path') }}
                        </div>
                        <div class="content-item-content download-path-content">
                            <input type="text" v-model="downloadPath" />
                            <div class="select-file" @click="selectFile">
                                {{ $t('setting_view.download.select') }}
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-download-local">
                        <div class="content-item-title">
                            {{ $t('setting_view.download.local') }}
                        </div>
                        <div class="content-item-content local-path-content download-path-content">
                            <div class="head">
                                <div class="head-item add-path" @click="addPath">
                                    {{ $t('setting_view.download.add') }}
                                </div>
                                <div class="head-item clear-path" @click="clearPath">
                                    {{ $t('setting_view.download.clear') }}
                                </div>
                            </div>
                            <div class="path-item" v-for="(path, index) in localPaths" :key="path">
                                <input type="text" v-model="localPaths[index]" />
                                <div class="select-file" @click="setPath(index)">
                                    {{ $t('setting_view.download.select') }}
                                </div>
                                <img src="../assets/delete.svg" class="g-icon delete-img" @click="deletePath(index)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="about item" id="about">
                <div class="about-title item-title">
                    {{ $t('header.setting_view.about') }}
                </div>
                <div class="about-content item-content">
                    <div class="content-item item-backup">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.backup') }}
                        </div>
                        <div class="content-item-content backup-content">
                            <div class="export backup-content-item" @click="exportToJSON">
                                {{ $t('setting_view.about.export') }}
                            </div>
                            <div class="import backup-content-item" @click="importFromJSON">
                                {{ $t('setting_view.about.import') }}
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-about-version">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.version') }}
                        </div>
                        <div class="content-item-content">
                            {{ version }}
                        </div>
                    </div>
                    <div class="content-item item-about-author">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.author') }}
                        </div>
                        <div class="content-item-content">
                            YiktLLW
                        </div>
                    </div>
                    <div class="content-item item-about-readme">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.readme') }}
                        </div>
                        <div class="content-item-content" @click="openReadme">
                            <div class="github-link">
                                README
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-about-changelog">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.changelog') }}
                        </div>
                        <div class="content-item-content" @click="openChangelog">
                            <div class="github-link">
                                CHANGELOG
                            </div>
                        </div>
                    </div>
                    <div class="content-item item-about-github">
                        <div class="content-item-title">
                            {{ $t('setting_view.about.source_code') }}
                        </div>
                        <div class="content-item-content">
                            <div class="github-link" @click="openGitRepo">
                                GitHub
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { YColor } from '@/utils/color';
import YHeader from '@/components/YHeader.vue';
import { Message } from '@/dual/YMessageC';
import { useStore } from 'vuex';
import { themes } from '@/utils/theme';
import packageJson from '../../package.json';
import { exportToJSON, importFromJSON, qualities, TSideBarItems } from '@/utils/setting';

export default defineComponent({
    name: 'YSettingView',
    components: {
        YHeader,
    },
    setup() {
        const store = useStore();
        const main = ref<HTMLElement | null>(null);
        const header = ref<typeof YHeader | null>(null);

        return {
            main,
            header,
            setting: store.state.setting,
            player: store.state.player,
            globalMsg: store.state.globalMsg,
        }
    },
    computed: {
        version() {
            return packageJson.version;
        }
    },
    watch: {
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
                    position: 'appearance',
                    display: 'header.setting_view.appearance',
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
            closeBehavior: 'minimize',
            closeAlwaysAsk: false,
            auto_zoom: false,
            volume_leveling: false,
            spectrum: false,
            dbclick: 'all',
            downloadPath: '',
            quality: 'standard',
            qualities: qualities,
            devices: [] as MediaDeviceInfo[],
            selectedDevice: '' as string,
            localPaths: [] as string[],
            openAtLogin: false,
            autoPlay: false,
            hideInSidebar_favorite: false as boolean,
            hideInSidebar_album: false as boolean,
            hideInSidebar_local: false as boolean,
            hideInSidebar_download: false as boolean,
        }
    },
    methods: {
        handleSwitcher(position: string) {
            const scroll = document.querySelector(`#yscroll-display-area`);
            const dom = this.main?.querySelector(`#${position}`);
            const firstDom = this.main?.querySelector('#normal');
            if (!dom || !scroll || !firstDom) return;
            const scrollTop = (dom as HTMLElement).offsetTop - (firstDom as HTMLElement).offsetTop;
            scroll.scrollTo({ top: scrollTop, behavior: 'smooth' });

        },
        handleTheme(e: Event) {
            this.switchToTheme((e.target as HTMLInputElement)?.value);
        },
        switchToTheme(theme: string) {
            this.theme = theme;
            document.body.className = `theme-${this.theme}`;
            this.setting.display.theme = this.theme;
        },
        setClose(behavior: 'minimize' | 'quit') {
            this.closeBehavior = behavior;
            this.setting.titleBar.closeButton = behavior;
        },
        setAlwaysAsk(bool: boolean) {
            this.closeAlwaysAsk = bool;
            this.setting.titleBar.closeAlwaysAsk = bool;
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
        setAutoZoom(bool: boolean) {
            this.auto_zoom = bool;
            this.setting.display.fullscreenAutoZoom = bool;
            // tbd
            // 全屏时设置自动缩放
        },
        setVolumeLeveling(bool: boolean) {
            this.volume_leveling = bool;
            this.setting.play.volume_leveling = this.volume_leveling;
            this.player.volumeLeveling = bool;
        },
        setSpectrum(bool: boolean) {
            this.spectrum = bool;
            if (this.setting.playui.spectrum !== bool) {
                this.setting.playui.spectrum = this.spectrum;
                if (bool) {
                    Message.post('info', 'setting_view.work_after_reload_window', true);
                }
            }
        },
        async getFolderPath() {
            if (window.electron?.isElectron) {
                const path = await window.electron.ipcRenderer.invoke('select-folder');
                if (path && typeof path === 'string') {
                    return path;
                } else {
                    throw new Error('No path selected');
                }
            } else {
                throw new Error('Only desktop version supports this feature');
            }
        },
        async addPath() {
            try {
                const path = await this.getFolderPath();
                this.localPaths.push(path);
                this.setting.download.localPaths = this.localPaths;
            } catch (error) {
                return;
            }
        },
        clearPath() {
            this.localPaths = [];
            this.setting.download.localPaths = this.localPaths;
        },
        deletePath(index: number) {
            this.localPaths.splice(index, 1);
            this.setting.download.localPaths = this.localPaths;
        },
        async setPath(index: number) {
            try {
                const path = await this.getFolderPath();
                this.localPaths[index] = path;
                this.setting.download.localPaths = this.localPaths;
            } catch (error) {
                return;
            }
        },
        async selectFile() {
            if (window.electron?.isElectron) {
                const path = await window.electron.ipcRenderer.invoke('select-folder');
                console.log(path);
                if (path && typeof path === 'string') {
                    this.setting.download.path = path;
                    this.downloadPath = this.setting.download.path;
                }
            } else {
                Message.post('info', this.$t('message.setting_view.download.only_desktop'));
            }
        },
        setQuality(quality: string) {
            this.quality = quality;
            this.setting.download.quality = quality;
        },
        openGitRepo() {
            if (!window.electron?.isElectron) {
                return;
            }
            window.electron.shell.openExternal('https://github.com/yiktllw/XCMusic');
        },
        openReadme() {
            if (!window.electron?.isElectron) {
                return;
            }
            this.$router.push({ path: '/markdown/README' });
        },
        openChangelog() {
            if (!window.electron?.isElectron) {
                return;
            }
            this.$router.push({ path: '/markdown/CHANGELOG' });
        },
        async getDevices() {
            // window.test = this.player;
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                this.devices = devices.filter(device => device.kind === 'audiooutput');
                this.selectedDevice = this.player.device;
                // console.log('Audio device Ids:', this.devices.map(device => device.deviceId));

            } catch (err) {
                console.error('Error fetching audio devices:', err);
            }
        },
        async selectAudioOutputDevice(deviceId: string) {
            const audioElement = this.player._audio;
            if (!audioElement) return;

            try {
                // 检查是否支持 setSinkId 方法
                if (typeof audioElement.setSinkId === 'function') {
                    await this.player.setDevice(deviceId).then(() => {
                        this.selectedDevice = deviceId;
                        this.setting.play.device = deviceId;
                    });
                    // this.selectedDevice = audioElement.sinkId;
                    console.log(`Audio output set to device: ${deviceId}`);
                } else {
                    console.error('Browser does not support setSinkId.');
                }
            } catch (err) {
                console.error('Error setting audio output device:', err);
            }
        },
        reloadWindow() {
            window.location.reload();
        },
        openCustomWindow() {
            this.globalMsg.post('open-custom-window');
            this.globalMsg.subscriber.on({
                id: 'YSettingView',
                type: 'close-custom-window',
                func: () => {
                    this.fetchThemes();
                }
            })
        },
        fetchThemes() {
            const userCustomThemes = this.setting.display.userCustomThemes.map((item) => {
                return item.data;
            });
            this.themes = themes.concat(userCustomThemes);
        },
        setOpenAtLogin(bool: boolean) {
            this.openAtLogin = bool;
            this.setting.system.openAtLogin = bool;
        },
        setAutoPlay(bool: boolean) {
            this.autoPlay = bool;
            this.setting.play.autoPlay = bool;
        },
        setHideInSidebar() {
            const hideInSidebar: TSideBarItems[] = [];
            (['favorite', 'album', 'local', 'download'] as TSideBarItems[]).forEach((item: TSideBarItems) => {
                if (this[`hideInSidebar_${item}`]) hideInSidebar.push(item);
            });
            this.setting.display.hideInSidebar = hideInSidebar;
            this.globalMsg.post('refresh-sidebar');
        },
        async exportToJSON() {
            if (!window.electron?.isElectron) return;
            const json = exportToJSON(this.setting);
            const savedPath = await window.electron.ipcRenderer.invoke('save-json', json);
            if (savedPath) {
                Message.post('success', this.$t('setting_view.about.export_success'));
            } else {
                Message.post('error', this.$t('setting_view.about.export_fail'));
            }
        },
        async importFromJSON() {
            if (!window.electron?.isElectron) return;
            const json = await window.electron.ipcRenderer.invoke('open-json');
            if (json) {
                importFromJSON(this.setting, json);
                Message.post('success', this.$t('setting_view.about.import_success'));
            } else {
                Message.post('error', this.$t('setting_view.about.import_no_file'));
            }
            this.init();
        },
        init() {
            YColor.setBackgroundColorTheme();
            this.theme = this.setting.display.theme;
            const userCustomThemes = this.setting.display.userCustomThemes.map((item) => {
                return item.data;
            });
            this.themes = this.themes.concat(userCustomThemes);
            this.zoom = this.setting.display.zoom * 100;
            this.language = this.setting.display.language;
            this.closeBehavior = this.setting.titleBar.closeButton;
            this.closeAlwaysAsk = this.setting.titleBar.closeAlwaysAsk;
            this.auto_zoom = this.setting.display.fullscreenAutoZoom;
            this.volume_leveling = this.setting.play.volume_leveling;
            this.spectrum = this.setting.playui.spectrum;
            this.dbclick = this.setting.play.dbclick;
            this.downloadPath = this.setting.download.path;
            this.quality = this.setting.download.quality;
            this.localPaths = this.setting.download.localPaths;
            this.openAtLogin = this.setting.system.openAtLogin;
            this.autoPlay = this.setting.play.autoPlay;
            this.setting.display.hideInSidebar.forEach((item: TSideBarItems) => {
                this[`hideInSidebar_${item}`] = true;
            });
            this.getDevices();
        }
    },
    mounted() {
        this.init();
    },
    beforeUnmount() {
        this.globalMsg.subscriber.offAll('YSettingView');
        this.main = null;
        this.header = null;
    },
})
</script>

<style lang="scss" scoped>
.setting {
    display: flex;
    width: inherit;
    padding: 0 10px 10px 10px;

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

                .download-path-content {
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    .select-file {
                        cursor: pointer;
                        margin-left: 10px;
                        color: var(--font-color-high);

                        &:hover {
                            color: var(--font-color-main);
                        }
                    }

                    input {
                        width: 210px;
                        height: 30px;
                        border: 1px solid rgba(var(--foreground-color-rgb), $alpha: 0.3);
                        background-color: transparent;
                        color: var(--font-color-high);
                        font-size: 16px;
                        border-radius: 5px;
                        padding: 0 10px;
                        margin-right: 10px;

                        &:focus {
                            outline: none;
                        }

                    }
                }

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

                        .custom-text {
                            cursor: pointer;
                            color: var(--font-color-high);

                            &:hover {
                                color: var(--font-color-main);
                            }
                        }

                        .reload-item {
                            cursor: pointer;
                            color: var(--font-color-high);

                            &:hover {
                                color: var(--font-color-main);
                            }
                        }

                        select {
                            // width: 210px;
                            padding: 2px 2px !important;
                            border: 1px solid rgba(var(--foreground-color-rgb), $alpha: 0.3);
                            background-color: transparent;
                            color: var(--font-color-high);
                            font-size: 16px;
                            border-radius: 5px;
                            padding: 0 10px;
                            margin-right: 10px;
                            cursor: pointer;

                            option {
                                color: var(--font-color-high);
                                background-color: var(--background-color);
                            }

                            &:focus {
                                outline: none;
                            }
                        }

                        .github-link {
                            cursor: pointer;
                            color: var(--font-color-high);
                            text-decoration: underline;

                            &:hover {
                                color: var(--font-color-main);
                            }
                        }

                        input[type="radio"] {
                            cursor: pointer;
                        }

                        label {
                            cursor: pointer;
                        }
                    }

                    .backup-content {
                        display: flex;
                        flex-direction: row;
                        align-items: center;

                        .backup-content-item {
                            cursor: pointer;
                            color: var(--font-color-high);
                            margin-right: 10px;

                            &:hover {
                                color: var(--font-color-main);
                            }
                        }
                    }

                    .download-quality-item {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: first baseline;
                        line-height: 32.1px;

                        div {
                            margin-right: 10px;
                        }
                    }

                    .item-content-close,
                    .item-play-dbclick-content {
                        display: flex;
                        flex-direction: column;
                        line-height: 32.1px;
                        align-items: start;
                    }
                    
                    .item-sidebar-content {
                        display: flex;
                        flex-direction: column;
                        flex-wrap: auto;
                        
                        .item-sidebar-content-title {
                            text-align: left;
                            margin: 0 0 10px 3px;
                        }
                        
                        .item-sidebar-content-checks {
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            
                            label {
                                margin-right: 15px;
                            }
                        }
                    }
                }

                .item-theme {
                    .item-theme-title {
                        font-weight: bold;
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
                                color: var(--font-color-high);

                                &:hover {
                                    color: var(--font-color-main);
                                }
                            }
                        }
                    }
                }

                .item-download-local {
                    .local-path-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        .head {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            width: 100%;
                            margin-bottom: 10px;

                            .head-item {
                                cursor: pointer;
                                color: var(--font-color-high);
                                margin-right: 10px;

                                &:hover {
                                    color: var(--font-color-main);
                                }
                            }
                        }

                        .path-item {
                            display: flex;
                            align-items: center;
                            flex-direction: row;
                            padding: 5px 0;

                            .delete-img {
                                cursor: pointer;
                                margin-left: 10px;
                                width: 16px;
                                height: 16px;
                                opacity: 0.7;

                                &:hover {
                                    opacity: 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>