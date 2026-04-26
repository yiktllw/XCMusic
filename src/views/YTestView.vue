<template>
  <!-- 测试界面 -->
  <div class="display">
    <div class="test-panel">
      <div class="panel-title font-color-main">基础测试</div>
      <button
        class="button font-color-main"
        @click="$router.push({ path: '/audio/test' })"
      >
        点击跳转到音频调试界面
      </button>
      <button class="button font-color-main" @click="clearCache">
        点击清除webFrame缓存
      </button>
      <button class="button font-color-main" @click="outputGaplessBufferState">
        输出当前/下一首缓冲状态
      </button>
    </div>

    <div class="test-panel">
      <div class="panel-title font-color-main">通知测试</div>
      <div class="button-grid">
        <button class="button font-color-main" @click="notifyByType('info')">
          发送 Info
        </button>
        <button class="button font-color-main" @click="notifyByType('success')">
          发送 Success
        </button>
        <button class="button font-color-main" @click="notifyByType('warning')">
          发送 Warning
        </button>
        <button class="button font-color-main" @click="notifyByType('error')">
          发送 Error
        </button>
        <button class="button font-color-main" @click="notifyLongMessage">
          长文本测试
        </button>
        <button class="button font-color-main" @click="notifyDuplicate">
          重复去重测试
        </button>
        <button class="button font-color-main" @click="notifyBurst">
          连续 8 条通知
        </button>
        <button class="button font-color-main" @click="notifyStressDisappear">
          消失与堆叠压力测试
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./YTestView.ts" lang="ts"></script>

<style lang="scss" scoped>
.display {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 18px;
  padding: 24px 20px;
  overflow-y: auto;

  .test-panel {
    width: min(760px, calc(100vw - 60px));
    background: rgba(var(--foreground-color-rgb), 0.05);
    border: 1px solid rgba(var(--foreground-color-rgb), 0.12);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 700;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  .scrollable {
    width: 100%;
    height: 100%;
  }

  .button {
    cursor: pointer;
    text-align: left;
    border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
    border-radius: 9px;
    padding: 8px 10px;
    background: rgba(var(--foreground-color-rgb), 0.02);
    transition:
      background-color 0.16s ease,
      border-color 0.16s ease;

    &:hover {
      background: rgba(var(--foreground-color-rgb), 0.09);
      border-color: rgba(var(--foreground-color-rgb), 0.34);
    }
  }
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.songs-table {
  width: calc(100% - 40px);
}
</style>
