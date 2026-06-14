<template>
  <div class="export-select-overlay" @click.self="cancel">
    <div class="window-wrapper">
      <YWindow ref="window" @new-window-state="handleNewWindowState">
        <template #header>
          <span class="window-title">
            {{ $t(titleKey) }}
          </span>
        </template>
        <div class="main">
          <div class="option-row">
            <input
              type="checkbox"
              id="opt-settings"
              v-model="selected.settings"
              :disabled="disabledOptions.settings"
            />
            <label
              for="opt-settings"
              :class="{ disabled: disabledOptions.settings }"
            >
              {{ $t("setting_view.about.export_option_settings") }}
            </label>
          </div>
          <div class="option-row">
            <input
              type="checkbox"
              id="opt-playhistory"
              v-model="selected.playHistory"
              :disabled="disabledOptions.playHistory"
            />
            <label
              for="opt-playhistory"
              :class="{ disabled: disabledOptions.playHistory }"
            >
              {{ $t("setting_view.about.export_option_play_history") }}
            </label>
          </div>
          <div class="option-row">
            <input
              type="checkbox"
              id="opt-downloaded"
              v-model="selected.downloadedSongs"
              :disabled="disabledOptions.downloadedSongs"
            />
            <label
              for="opt-downloaded"
              :class="{ disabled: disabledOptions.downloadedSongs }"
            >
              {{ $t("setting_view.about.export_option_downloaded") }}
            </label>
          </div>
          <div class="buttons">
            <button :tabindex="-1" @click="cancel">
              {{ $t("cancel") }}
            </button>
            <button :tabindex="-1" @click="confirm">
              {{ $t("confirm.title") }}
            </button>
          </div>
        </div>
      </YWindow>
    </div>
  </div>
</template>

<script src="./YExportSelectWindow.ts" lang="ts"></script>

<style lang="scss" scoped>
.window-wrapper {
  width: auto;
  min-width: 300px;
  max-width: 420px;
}

.export-select-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 30px;
  min-width: 260px;

  .option-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0;
    font-size: 16px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: rgb(var(--highlight-color-rgb));
      cursor: pointer;
    }

    label {
      cursor: pointer;
      user-select: none;

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }

  .buttons {
    display: flex;
    width: 100%;
    padding: 0px;

    button {
      width: 50%;
      font-weight: bold;
      font-size: 17px;
      padding: 5px 0;
      border-radius: 0;
    }
  }
}
</style>
