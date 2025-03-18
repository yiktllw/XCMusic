<template>
  <!-- 均衡器窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("equalizer.title") }}
        </span>
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
                @change="apply"
              />
              <div class="value-display">{{ equalizer[eqkey] }}</div>
            </div>
            <div class="freq-name">
              {{ freaDisplay[eqkey] }}
            </div>
          </div>
        </div>
      </div>
    </YWindow>
  </div>
</template>

<script src="./YEqualizerWindow.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  padding: 0px 20px;
  .content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
    height: 321px;

    .info-left {
      display: flex;
      flex-direction: column;
      height: 210px;
      font-size: 13px;
      font-weight: bold;
      padding-bottom: 22px;
      justify-content: space-between;
    }

    .eq-item {
      font-weight: bold;
      width: 40px;

      input[type="range"] {
        writing-mode: vertical-lr;
        direction: rtl;
        width: 8px;
        height: 210px;

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
}
</style>
