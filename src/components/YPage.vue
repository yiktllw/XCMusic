<template>
  <div>
    <div
      class="page-main font-color-main"
      v-if="page.total > 1 || page._unknown_page"
    >
      <div class="previous" @click="page.previous">
        <img src="@/assets/backarrow.svg" class="arrow-img g-icon" />
      </div>
      <div class="all" v-if="page.total < 8">
        <div
          class="pages"
          v-for="i in page.total"
          @click="page.current = i"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
      </div>
      <div class="omit" v-else>
        <div
          class="pages"
          v-for="i in page.leftPage"
          @click="page.current = i"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
        <div class="pages">...</div>
        <div
          class="pages"
          v-for="i in page.middlePage"
          @click="page.current = i"
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
          @click="page.current = i"
          :class="page.current === i ? 'currentPage' : ''"
        >
          {{ i }}
        </div>
      </div>
      <div class="next" @click="page.next">
        <img src="@/assets/forwardarrow.svg" class="arrow-img g-icon" />
      </div>
    </div>
    <div class="page-goto" v-if="page.total > 8">
      <input
        type="number"
        :min="1"
        :max="page.total"
        v-model="tempPage"
        @keydown.enter="goto()"
      />
      <span>/ &nbsp;{{ page.total }} &nbsp;</span>
      <button class="font-size-std" @click="goto()">跳转</button>
    </div>
  </div>
</template>

<script lang="ts">
import { YPageC } from "@/dual/YPageC";
import { defineComponent, ref, watch } from "vue";
export default defineComponent({
  name: "YPage",
  data() {
    return {
      tempPage: 1,
    };
  },
  props: {
    modelValue: {
      type: YPageC,
      default: new YPageC(1),
    },
  },
  watch: {
    "page.current"(newVal) {
      this.page.current = newVal;
    },
  },
  setup(props) {
    const page = ref(props.modelValue);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      (newValue) => {
        page.value = newValue;
      },
    );

    return {
      page,
    };
  },
  methods: {
    goto() {
      if (this.tempPage < 1) {
        this.tempPage = 1;
      } else if (this.tempPage > this.page.total) {
        this.tempPage = this.page.total;
      }
      this.page.current = this.tempPage;
    },
  },
});
</script>

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
    color: rgb(200, 136, 166);
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
    width: 16px;
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
