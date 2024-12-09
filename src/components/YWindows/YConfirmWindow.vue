<template>
  <!-- 确认窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("confirm.title") }}
        </span>
      </template>
      <div class="main">
        <div class="content">
          {{ confirm.needTranslate ? $t(confirm.content) : confirm.content }}
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

<script src="./YConfirmWindow.ts" lang="ts">
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px 0px 10px;
  min-width: 210px;

  .content {
    font-size: 18px;
    font-weight: bold;
    padding: 0 0 15px 0;
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
