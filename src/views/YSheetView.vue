<template>
  <!-- 曲谱查看界面 -->
  <div class="main">
    <div class="sheet-titlebar font-color-high">
      <div class="left">
        <span class="sheet-titlebar-item">
          {{
            $t("sheet_view.current_page_left") +
            page.current +
            $t("sheet_view.current_page_right")
          }}
        </span>
      </div>
      <div class="center">
        <span class="prev sheet-titlebar-item"
          >{{ $t("sheet_view.prev_page") }} H</span
        >
        <span class="scroll-item sheet-titlebar-item"
          >{{ $t("sheet_view.scroll") }} J&nbsp;/&nbsp;K</span
        >
        <span class="next sheet-titlebar-item"
          >{{ $t("sheet_view.next_page") }} L</span
        >
      </div>
      <div class="right">
        <span class="sheet-titlebar-item">
          {{
            $t("sheet_view.total_page_left") +
            page.total +
            $t("sheet_view.total_page_right")
          }}
        </span>
      </div>
    </div>
    <div class="sheet-item" v-if="sheet.length > 0">
      <img :src="sheet[page.current - 1].url" class="sheet-img" />
    </div>
    <div class="no-sheet font-color-high" v-else>暂无权限查看</div>
    <YPage v-model="page" />
  </div>
</template>

<script src="./YSheetView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: start;
  padding: 10px;
  align-items: first baseline;
  height: calc(100% - 50px);
  width: 100%;

  .sheet-titlebar {
    display: flex;
    margin-bottom: 10px;
    flex-direction: row;
    justify-content: space-between;
    width: 90%;

    .center {
      display: flex;
      flex-direction: row;
    }

    .sheet-titlebar-item {
      font-size: 18px;
      margin: 0 13px;
      font-weight: bold;
    }
  }

  .sheet-item {
    margin: 10px;
    width: 100%;

    .sheet-img {
      width: 90%;
    }
  }

  .no-sheet {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 24px;
    font-weight: bold;
  }
}
</style>
