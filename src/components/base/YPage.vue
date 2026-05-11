<template>
  <!-- 底部分页组件 -->
  <div>
    <div
      class="page-main font-color-main"
      v-if="page.total > 1 || page._unknown_page"
    >
      <div
        class="previous"
        :class="{ disabled: !canPrevious }"
        @click="previousPage"
      >
        <img src="@/assets/backarrow.svg" class="arrow-img g-icon" />
      </div>
      <div class="all" v-if="page.total < 8">
        <div
          class="pages"
          v-for="i in page.total"
          :key="`all-${i}`"
          @click="selectPage(i)"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
      </div>
      <div class="omit" v-else>
        <div
          class="pages"
          v-for="i in page.leftPage"
          :key="`left-${i}`"
          @click="selectPage(i)"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
        <div class="pages">...</div>
        <div
          class="pages"
          v-for="i in page.middlePage"
          :key="`middle-${i}`"
          @click="selectPage(i)"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
        <div
          class="pages"
          v-if="page.current > 2 && page.current < page.total - 1"
        >
          ...
        </div>
        <div
          class="pages"
          v-for="i in page.rightPage"
          :key="`right-${i}`"
          @click="selectPage(i)"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
      </div>
      <div class="next" :class="{ disabled: !canNext }" @click="nextPage">
        <img src="@/assets/forwardarrow.svg" class="arrow-img g-icon" />
      </div>
    </div>
    <div class="page-goto" v-if="page.total > 8">
      <input
        type="number"
        :min="1"
        :max="page.total"
        v-model.number="tempPage"
        placeholder="1"
        @keydown.enter="goto()"
      />
      <span>/ &nbsp;{{ page.total }} &nbsp;</span>
      <button :tabindex="-1" class="font-size-std" @click="goto()">跳转</button>
    </div>
  </div>
</template>

<script src="./YPage.ts" lang="ts"></script>

<style lang="scss" scoped>
.page-main {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-weight: bold;
  background-color: transparent;

  .previous,
  .next {
    display: flex;
    cursor: pointer;
    padding: 5px;
    margin: 5px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    align-items: center;
    justify-content: center;

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .all {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .omit {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .pages {
    cursor: pointer;
    padding: 5px;
    margin: 5px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
  }

  .currentPage {
    color: rgb(var(--highlight-color-rgb));
  }

  .arrow-img {
    width: 14px;
    height: 14px;
  }
}

.page-goto {
  color: var(--font-color-main);
  padding-bottom: 10px;

  input {
    width: 26px;
    background-color: transparent;
    border: none;
    text-decoration: underline;
    color: var(--font-color-main);

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      appearance: none;
    }

    &:focus {
      outline: none;
    }
  }

  button {
    background-color: transparent;
    border: none;
    color: var(--font-color-main);
  }
}
</style>
