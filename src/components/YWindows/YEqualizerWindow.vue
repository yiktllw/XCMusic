<template>
  <!-- 均衡器窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <div class="header-content">
          <span class="window-title">
            {{ $t("equalizer.title") }}
          </span>
          <span
            class="reset-btn font-color-standard"
            @click="reset"
            :title="$t('equalizer.reset')"
          >
            {{ $t("equalizer.reset") }}
          </span>
        </div>
      </template>
      <div class="main">
        <div class="content">
          <div class="info-left font-color-standard">
            <div>+12dB</div>
            <div>0dB</div>
            <div>-12dB</div>
          </div>
          <div v-for="eqkey in eqkeys" class="eq-item font-color-standard">
            <div class="slider-container">
              <input
                type="range"
                v-model.number="equalizer[eqkey]"
                orient="vertical"
                min="-12"
                max="12"
                step="1"
                class="vertical-slider"
                @input="handleInput"
              />
              <div class="value-display">{{ equalizer[eqkey] }}</div>
            </div>
            <div class="freq-name">
              {{ freaDisplay[eqkey] }}
            </div>
          </div>
        </div>
        <div class="canvas-container">
          <canvas ref="canvas" width="610" height="120"></canvas>
        </div>
      </div>
    </YWindow>
  </div>
</template>

<script src="./YEqualizerWindow.ts" lang="ts"></script>

<style lang="scss" scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 10px;
}

.reset-btn {
  cursor: pointer;
  font-size: 14px;
  &:hover {
    opacity: 0.8;
  }
}

.main {
  padding: 0px 10px;
  .content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
    /* height: 321px; Removed fixed height */
    padding-top: 20px;
    padding-bottom: 5px;

    .info-left {
      display: flex;
      flex-direction: column;
      height: 170px;
      font-size: 13px;
      font-weight: bold;
      padding-bottom: 22px;
      justify-content: space-between;
      width: 25px;
      flex-shrink: 0;
    }

    .eq-item {
      font-weight: bold;
      width: 40px;
      flex-shrink: 0;

      input[type="range"] {
        writing-mode: vertical-lr;
        direction: rtl;
        width: 8px;
        height: 160px;

        &::-webkit-slider-thumb {
          cursor: pointer;
        }
      }

      .slider-container {
        position: relative;
        display: inline-block;
      }

      .value-display {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -30px;
        background: #333;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.2s;
        white-space: nowrap;
        pointer-events: none;
      }

      .vertical-slider:active + .value-display {
        opacity: 1;
      }

      .freq-name {
        width: 40px;
        height: 22px;
        font-size: 13px;
      }
    }
  }

  .canvas-container {
    margin-left: 40px;
    margin-top: 0;
    display: flex;
    justify-content: center;
  }
}
</style>
