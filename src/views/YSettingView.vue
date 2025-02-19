<template>
  <!-- 设置界面 -->
  <div class="setting" ref="main">
    <div class="header">
      <div class="title font-color-main">{{ $t("settings") }}</div>
      <div class="switcher">
        <YHeader
          :switcher="switcher"
          @new-position="handleSwitcher"
          ref="header"
        ></YHeader>
      </div>
    </div>
    <YScroll
      :style="{
        maxHeight: 'calc(100vh - 260px)',
        marginTop: '110px',
        width: '100%',
      }"
      :need-listener="true"
      ref="scroll"
    >
      <div class="main font-color-main">
        <!-- 常规 -->
        <div class="normal item" id="normal">
          <!-- 常规-标题 -->
          <div class="normal-title item-title">
            {{ $t("header.setting_view.normal") }}
          </div>
          <!-- 常规-内容 -->
          <div class="normal-content item-content">
            <!-- 常规-语言 -->
            <div class="content-item item-languige">
              <div class="content-item-title">
                {{ $t("setting_view.language") }}
              </div>
              <div class="content-item-content">
                <input
                  type="radio"
                  id="setting_zh"
                  name="language"
                  value="zh"
                  v-model="language"
                  @change="switchToLanguage('zh')"
                />
                <label for="setting_zh"> 简体中文 </label>
                <input
                  type="radio"
                  id="setting_en"
                  name="language"
                  value="en"
                  v-model="language"
                  @change="switchToLanguage('en')"
                />
                <label for="setting_en"> English </label>
              </div>
            </div>
            <!-- 常规-开机自启动 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.open_sys") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_open_at_login"
                  name="open_at_login"
                  v-model="openAtLogin"
                  @change="setOpenAtLogin(openAtLogin)"
                />
                <label for="setting_open_at_login">
                  {{ $t("setting_view.open_at_login") }}
                </label>
              </div>
            </div>
            <!-- 常规-关闭按钮行为 -->
            <div class="content-item close-item">
              <div class="content-item-title">
                {{ $t("setting_view.close") }}
              </div>
              <div class="content-item-content item-content-close">
                <div class="close-item1">
                  <input
                    type="radio"
                    id="setting_minimize"
                    name="close"
                    value="minimize"
                    v-model="closeBehavior"
                    @change="setClose('minimize')"
                  />
                  <label for="setting_minimize">
                    {{ $t("setting_view.close_to_minimize") }}
                  </label>
                </div>
                <div class="close-item2">
                  <input
                    type="radio"
                    id="setting_close"
                    name="close"
                    value="quit"
                    v-model="closeBehavior"
                    @change="setClose('quit')"
                  />
                  <label for="setting_close">
                    {{ $t("setting_view.close_to_quit") }}
                  </label>
                </div>
                <div class="always-ask">
                  <input
                    type="checkbox"
                    id="setting_always_ask"
                    name="always_ask"
                    v-model="closeAlwaysAsk"
                    @change="setAlwaysAsk(closeAlwaysAsk)"
                  />
                  <label for="setting_always_ask">
                    {{ $t("setting_view.close_always_ask") }}
                  </label>
                </div>
              </div>
            </div>
            <!-- 常规-硬件加速 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.gpu") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_disable_gpu"
                  v-model="disableGpu"
                  @change="setDisableGpu(disableGpu)"
                />
                <label for="setting_disable_gpu">
                  {{ $t("setting_view.disable_gpu") }}
                  <span style="color: var(--font-color-low)">
                    {{ $t("setting_view.disable_gpu_also") }}
                  </span>
                </label>
              </div>
            </div>
            <!-- 常规-重载窗口 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.reload") }}
              </div>
              <div class="content-item-content">
                <div class="reload-item" @click="reloadWindow">
                  {{ $t("setting_view.click_to_reload") }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 外观 -->
        <div class="appearance item" id="appearance">
          <!-- 外观-标题 -->
          <div class="appearance-title item-title">
            {{ $t("header.setting_view.appearance") }}
          </div>
          <!-- 外观-内容 -->
          <div class="appearance-content item-content">
            <!-- 外观-主题 -->
            <div class="content-item item-theme">
              <div class="content-item-title item-theme-title">
                {{ $t("setting_view.theme") }}
              </div>
              <div class="content-item-content">
                <select v-model="theme" @change="handleTheme">
                  <option v-for="item in themes" :value="item.value">
                    {{
                      [
                        "setting_view.theme_name.dark",
                        "setting_view.theme_name.dark_high_contrast",
                        "setting_view.theme_name.light",
                        "setting_view.theme_name.light_high_contrast",
                      ].includes(item.display)
                        ? $t(item.display)
                        : item.display
                    }}
                  </option>
                </select>
              </div>
            </div>
            <!-- 外观-自定义主题 -->
            <div class="content-item item-custom">
              <div class="content-item-title">
                {{ $t("setting_view.appearance.custom") }}
              </div>
              <div class="content-item-content">
                <div class="custom-text" @click="openCustomWindow">
                  {{ $t("setting_view.appearance.click_to_create_theme") }}
                </div>
              </div>
            </div>
            <!-- 外观-缩放 -->
            <div class="content-item item-zoom">
              <div class="content-item-title item-zoom-title">
                {{ $t("setting_view.zoom") }}
              </div>
              <div class="zoom-item">
                <div class="item-zoom-content">
                  <input
                    type="number"
                    min="50"
                    max="200"
                    step="5"
                    v-model="zoom"
                  />
                  <div class="zoom-apply" @click="handleZoom">
                    {{ $t("setting_view.apply") }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 外观-全屏时自动缩放 -->
            <div class="content-item item-fullscreen-auto-zoom">
              <div class="content-item-title">
                {{ $t("setting_view.display.fullscreen") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_auto_zoom"
                  name="auto_zoom"
                  v-model="auto_zoom"
                  @change="setAutoZoom(auto_zoom)"
                />
                <label
                  for="setting_auto_zoom"
                  :title="$t('setting_view.display.press_f11_to_fullscreen')"
                >
                  {{ $t("setting_view.display.fullscreen_auto_zoom") }}
                  <span class="font-color-low">
                    ({{ $t("setting_view.display.press_f11_to_fullscreen") }})
                  </span>
                </label>
              </div>
            </div>
            <!-- 外观-侧边栏样式 -->
            <div class="content-item item-sidebar">
              <div class="content-item-title">
                {{ $t("setting_view.display.sidebar") }}
              </div>
              <div class="content-item-content item-sidebar-content">
                <div class="item-sidebar-content-title">
                  {{ $t("setting_view.display.hideInSidebar") }}
                </div>
                <div class="item-sidebar-content-checks">
                  <div>
                    <input
                      type="checkbox"
                      id="setting_sidebar_favorite"
                      name="setting_sidebar_favorite"
                      v-model="hideInSidebar_favorite"
                      @change="setHideInSidebar"
                    />
                    <label for="setting_sidebar_favorite">
                      {{ $t("playlist_view.my_favorite_musics") }}
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="setting_sidebar_album"
                      name="setting_sidebar_album"
                      v-model="hideInSidebar_album"
                      @change="setHideInSidebar"
                    />
                    <label for="setting_sidebar_album">
                      {{ $t("subscribed_album") }}
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="setting_sidebar_local"
                      name="setting_sidebar_local"
                      v-model="hideInSidebar_local"
                      @change="setHideInSidebar"
                    />
                    <label for="setting_sidebar_local">
                      {{ $t("local_music") }}
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="setting_sidebar_download"
                      name="setting_sidebar_download"
                      v-model="hideInSidebar_download"
                      @change="setHideInSidebar"
                    />
                    <label for="setting_sidebar_download">
                      {{ $t("manage_download") }}
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="setting_sidebar_cloud"
                      name="setting_sidebar_cloud"
                      v-model="hideInSidebar_cloud"
                      @change="setHideInSidebar"
                    />
                    <label for="setting_sidebar_cloud">
                      {{ $t("cloud") }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 播放 -->
        <div class="play item" id="play">
          <!-- 播放-标题 -->
          <div class="play-title item-title">
            {{ $t("header.setting_view.play") }}
          </div>
          <!-- 播放-内容 -->
          <div class="play-content item-content">
            <!-- 播放-启动时自动播放 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.play.launch") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_auto_play"
                  name="auto_play"
                  v-model="autoPlay"
                  @change="setAutoPlay(autoPlay)"
                />
                <label for="setting_auto_play">
                  {{ $t("setting_view.play.auto_play") }}
                </label>
              </div>
            </div>
            <!-- 播放-记住播放进度 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.play.remember_progress.title") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_remember_progress"
                  name="remember_progress"
                  v-model="rememberProgress"
                  @change="setRememberProgress(rememberProgress)"
                />
                <label for="setting_remember_progress">
                  {{ $t("setting_view.play.remember_progress.label") }}
                </label>
              </div>
            </div>
            <!-- 播放-音量均衡 -->
            <div class="content-item item-play-volume_leveling">
              <div class="content-item-title">
                {{ $t("setting_view.play.volume_leveling") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_volume_leveling"
                  name="volume_leveling"
                  v-model="volume_leveling"
                  @change="setVolumeLeveling(volume_leveling)"
                />
                <label for="setting_volume_leveling">
                  {{ $t("setting_view.play.volume_leveling_content") }}
                </label>
              </div>
            </div>
            <!-- 播放界面-频谱图 -->
            <div class="content-item item-playui">
              <div class="content-item-title">
                {{ $t("setting_view.play.playui") }}
              </div>
              <div class="content-item-content">
                <input
                  type="checkbox"
                  id="setting_spectrum"
                  name="spectrum"
                  v-model="spectrum"
                  @change="setSpectrum(spectrum)"
                />
                <label for="setting_spectrum">
                  {{ $t("setting_view.play.show_spectrum") }}
                </label>
              </div>
            </div>
            <!-- 播放-双击列表行为 -->
            <div class="content-item item-play-dbclick">
              <div class="content-item-title">
                {{ $t("setting_view.play.dbclick") }}
              </div>
              <div class="content-item-content item-play-dbclick-content">
                <div class="dbclick-item1">
                  <input
                    type="radio"
                    id="setting_play-dbclick"
                    name="play"
                    value="all"
                    v-model="dbclick"
                    @change="setDbClick('all')"
                  />
                  <label for="setting_play-dbclick">
                    {{ $t("setting_view.play.dbclick_playall") }}
                  </label>
                </div>
                <div class="dbclick-item2">
                  <input
                    type="radio"
                    id="setting_play-click"
                    name="play"
                    value="single"
                    v-model="dbclick"
                    @change="setDbClick('single')"
                  />
                  <label for="setting_play-click">
                    {{ $t("setting_view.play.dbclick_playsingle") }}
                  </label>
                </div>
              </div>
            </div>
            <!-- 播放-输出设备 -->
            <div class="content-item">
              <div class="content-item-title">
                {{ $t("setting_view.play.device") }}
              </div>
              <div class="content-item-content">
                <select
                  v-model="selectedDevice"
                  @change="selectAudioOutputDevice(selectedDevice)"
                >
                  <option v-for="device in devices" :value="device.deviceId">
                    {{ device.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <!-- 下载 -->
        <div class="download item" id="download">
          <!-- 下载-标题 -->
          <div class="download-title item-title">
            {{ $t("header.setting_view.download") }}
          </div>
          <!-- 下载-内容 -->
          <div class="download-content item-content">
            <!-- 下载-音质 -->
            <div class="content-item item-download-quality">
              <div class="content-item-title">
                {{ $t("setting_view.download.quality") }}
              </div>
              <div class="content-item-content download-quality-item">
                <select
                  v-model="quality"
                  @change="
                    setQuality(($event.target as HTMLSelectElement).value)
                  "
                >
                  <option
                    v-for="quality_item in qualities"
                    :value="quality_item"
                  >
                    {{ $t(`quality.${quality_item}`) }}
                  </option>
                </select>
              </div>
            </div>
            <!-- 下载-下载路径 -->
            <div class="content-item item-download-path">
              <div class="content-item-title">
                {{ $t("setting_view.download.path") }}
              </div>
              <div class="content-item-content download-path-content">
                <input type="text" v-model="downloadPath" />
                <div class="select-file" @click="selectFile">
                  {{ $t("setting_view.download.select") }}
                </div>
              </div>
            </div>
            <!-- 下载-本地音乐路径 -->
            <div class="content-item item-download-local">
              <div class="content-item-title">
                {{ $t("setting_view.download.local") }}
              </div>
              <div
                class="content-item-content local-path-content download-path-content"
              >
                <div class="head">
                  <div class="head-item add-path" @click="addPath">
                    {{ $t("setting_view.download.add") }}
                  </div>
                  <div class="head-item clear-path" @click="clearPath">
                    {{ $t("setting_view.download.clear") }}
                  </div>
                </div>
                <div class="path-item" v-for="(path, index) in localPaths">
                  <input type="text" v-model="localPaths[index]" />
                  <div class="select-file" @click="setPath(index)">
                    {{ $t("setting_view.download.select") }}
                  </div>
                  <img
                    src="@/assets/delete.svg"
                    class="g-icon delete-img"
                    @click="deletePath(index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 工具 -->
        <div class="tools item" id="tools">
          <!-- 工具-标题 -->
          <div class="tools-title item-title">
            {{ $t("header.setting_view.tools") }}
          </div>
          <!-- 工具-内容 -->
          <div class="tools-content item-content">
            <!-- 工具-代理 -->
            <div class="content-item item-tools-proxy">
              <div class="content-item-title">
                {{ $t("setting_view.tools.proxy.title") }}
              </div>
              <div class="content-item-content">
                <div class="proxy-choice">
                  <select v-model="proxy.mode">
                    <option value="none">
                      {{ $t("setting_view.tools.proxy.none") }}
                    </option>
                    <option value="http">
                      {{ $t("setting_view.tools.proxy.http") }}
                    </option>
                    <option value="socks4">
                      {{ $t("setting_view.tools.proxy.socks4") }}
                    </option>
                    <option value="socks5">
                      {{ $t("setting_view.tools.proxy.socks5") }}
                    </option>
                  </select>
                  <div class="proxy-apply" @click="setProxy">
                    {{ $t("setting_view.tools.proxy.apply") }}
                  </div>
                </div>
                <div class="proxy-content" v-if="proxy.mode !== 'none'">
                  <div class="proxy-line1 proxy-line">
                    <span class="proxy-content-item-title">
                      {{ $t("setting_view.tools.proxy.server") }}
                    </span>
                    <input
                      class="proxy-input proxy-host"
                      type="text"
                      v-model="proxy_host"
                      :placeholder="
                        $t('setting_view.tools.proxy.example_server')
                      "
                    />
                    <span class="proxy-content-item-title">
                      {{ $t("setting_view.tools.proxy.port") }}
                    </span>
                    <input
                      class="proxy-input proxy-port"
                      type="text"
                      v-model="proxy_port"
                      :placeholder="$t('setting_view.tools.proxy.example_port')"
                    />
                  </div>
                  <div class="proxy-line2 proxy-line">
                    <span class="proxy-content-item-title">
                      {{ $t("setting_view.tools.proxy.username") }}
                    </span>
                    <input
                      class="proxy-input proxy-username"
                      type="text"
                      v-model="proxy.username"
                      :placeholder="$t('setting_view.tools.proxy.optional')"
                    />
                    <span class="proxy-content-item-title">
                      {{ $t("setting_view.tools.proxy.password") }}
                    </span>
                    <input
                      class="proxy-input proxy-password"
                      type="password"
                      v-model="proxy.password"
                      :placeholder="$t('setting_view.tools.proxy.optional')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 关于 -->
        <div class="about item" id="about">
          <!-- 关于-标题 -->
          <div class="about-title item-title">
            {{ $t("header.setting_view.about") }}
          </div>
          <!-- 关于-内容 -->
          <div class="about-content item-content">
            <!-- 关于-版本 -->
            <div class="content-item item-about-version">
              <div class="content-item-title">
                {{ $t("setting_view.about.version") }}
              </div>
              <div class="content-item-content">
                {{ version }}
              </div>
            </div>
            <!-- 关于-介绍 -->
            <div class="content-item item-about-github">
              <div class="content-item-title">
                {{ $t("setting_view.about.readme") }}
              </div>
              <div class="content-item-content">
                <div class="github-link" @click="openReadme">README</div>
                <div class="github-link" @click="openChangelog">
                  {{ $t("setting_view.about.changelog") }}
                </div>
              </div>
            </div>
            <!-- 关于-GITHUB -->
            <div class="content-item item-about-github">
              <div class="content-item-title">GitHub</div>
              <div class="content-item-content">
                <div class="github-link" @click="openAuthor">
                  {{ $t("setting_view.about.author") }}
                  : yiktllw
                </div>
                <div class="github-link" @click="openGitRepo('default')">
                  {{ $t("setting_view.about.source_code") }}
                </div>
                <div class="github-link" @click="openGitRepo('issues')">
                  {{ $t("setting_view.about.issues") }}
                </div>
                <div class="github-link" @click="openGitRepo('license')">
                  {{ $t("setting_view.about.license") }}
                  : MIT
                </div>
              </div>
            </div>
            <!-- 关于-备份 -->
            <div class="content-item item-backup">
              <div class="content-item-title">
                {{ $t("setting_view.about.backup") }}
              </div>
              <div class="content-item-content backup-content">
                <div>
                  <div
                    class="export backup-content-item"
                    @click="exportToJSON_Setting"
                  >
                    {{ $t("setting_view.about.export") }}
                  </div>
                  <div
                    class="import backup-content-item"
                    @click="importFromJSON_Setting"
                  >
                    {{ $t("setting_view.about.import") }}
                  </div>
                </div>
                <div>
                  <div
                    class="export backup-content-item"
                    @click="exportToJSON_Download"
                  >
                    {{ $t("setting_view.about.export_download") }}
                  </div>
                  <div
                    class="import backup-content-item"
                    @click="importFromJSON_Download"
                  >
                    {{ $t("setting_view.about.import_download") }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </YScroll>
  </div>
</template>

<script src="./YSettingView.ts" lang="ts"></script>

<style lang="scss" scoped>
// input[type="checkbox"] {
//   accent-color: rgb(var(--highlight-color-rgb));
// }
// input[type="radio"] {
//   accent-color: rgb(var(--highlight-color-rgb));
// }
.setting {
  display: flex;
  width: inherit;
  padding: 0 10px 0px 10px;

  .header {
    display: flex;
    flex-direction: column;
    width: calc(100% - 40px);
    text-align: left;
    position: absolute;

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
              height: 28;
              min-width: 100px;
              padding: 2px 2px !important;
              border: 1px solid rgba(var(--foreground-color-rgb), $alpha: 0.3);
              background-color: transparent;
              color: var(--font-color-high);
              font-size: 16px;
              border-radius: 20px;
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

            .proxy-choice {
              display: flex;
              flex-direction: row;

              .proxy-apply {
                cursor: pointer;
                margin-left: 10px;
                color: var(--font-color-high);

                &:hover {
                  color: var(--font-color-main);
                }
              }
            }

            .proxy-content {
              .proxy-line {
                margin-top: 10px;
                display: flex;
                align-items: start;
              }

              .proxy-input {
                margin: 0px 15px 0px 10px;
                border-radius: 20px;
                height: 25px;
                padding: 0px 10px;
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
            flex-wrap: wrap;
            line-height: 30px;
            max-width: 500px;

            .backup-content-item {
              cursor: pointer;
              text-align: left;
              color: var(--font-color-high);
              margin-right: 30px;

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
              flex-wrap: wrap;

              label {
                margin-right: 15px;
              }
            }
          }
        }

        .item-about-github {
          .content-item-content {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            max-width: 500px;
            flex-direction: row;
            gap: 15px;
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
