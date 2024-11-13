<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useStore } from "vuex";
import YPanel from "@/components/YPanel.vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const player = store.state.player;

    function increment() {
      store.commit("increment");
    }
    const panel = ref<InstanceType<typeof YPanel>>();
    onMounted(() => {
      console.log(panel.value);
    });

    return {
      player,
      increment,
      panel,
    };
  },
  computed: {},
  methods: {
    test(val: string) {
      console.log("test", val);
    },
  },
  components: {
    YPanel,
  },
  mounted() {
    console.log("TSTest mounted");
    this.test("hello");
  },
});
</script>
