<template>
  <!-- 登录窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("titlebar.scanQRCodeToLogin") }}
        </span>
      </template>
      <img :src="base64Image" />
    </YWindow>
  </div>
</template>

<script src="./YLoginWindow.ts" lang="ts">
</script>
