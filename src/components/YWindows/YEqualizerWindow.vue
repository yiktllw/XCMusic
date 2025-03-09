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
        // appearance: slider-vertical;
        -webkit-appearance: slider-vertical;
        width: 8px;
        height: 210px;

        &::-webkit-slider-thumb {
          cursor: pointer;
        }
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
