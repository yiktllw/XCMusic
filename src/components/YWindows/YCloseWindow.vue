<template>
  <!-- 关闭时询问窗口 -->
  <div class="main">
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("setting_view.close") }}
        </span>
      </template>
      <div class="content font-color-high">
        <div class="items">
          <div class="item close-item1">
            <input
              type="radio"
              name="close"
              id="close_window_minimize"
              value="minimize"
              v-model="closeBehavior"
              @change="setClose('minimize')"
            />
            <label for="close_window_minimize">
              {{ $t("setting_view.close_to_minimize") }}
            </label>
          </div>
          <div class="item close-item2">
            <input
              type="radio"
              name="close"
              id="close_window_close"
              value="quit"
              v-model="closeBehavior"
              @change="setClose('quit')"
            />
            <label for="close_window_close">
              {{ $t("setting_view.close_to_quit") }}
            </label>
          </div>
          <div class="item always-ask">
            <input
              type="checkbox"
              id="close_window_always_ask"
              name="always_ask"
              v-model="closeAlwaysAsk"
              @change="setAlwaysAsk(closeAlwaysAsk)"
            />
            <label for="close_window_always_ask">
              {{ $t("setting_view.close_always_ask") }}
            </label>
          </div>
        </div>
        <div class="buttons">
          <button :tabindex="-1" @click="cancel">
            {{ $t("cancel") }}
          </button>
          <button :tabindex="-1" @click="ensure">
            {{ $t("confirm.title") }}
          </button>
        </div>
      </div>
    </YWindow>
  </div>
</template>

<script src="./YCloseWindow.ts" lang="ts">
</script>

<style lang="scss" scoped>
.main {
  .content {
    .items {
      padding: 10px 10px 5px 10px;

      .item {
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        input {
          margin-right: 10px;
        }

        label {
          cursor: pointer;
        }
      }
    }

    .buttons {
      display: flex;
      justify-content: center;

      button {
        width: 50%;
        padding: 5px 0;
        margin: 0;
        border-radius: 0;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
}
</style>
