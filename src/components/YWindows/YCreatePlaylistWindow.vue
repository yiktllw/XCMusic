<template>
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("create_playlist.title") }}
        </span>
      </template>
      <div class="main">
        <textarea
          class="input font-size-large"
          v-model="inputValue"
          :maxlength="40"
          :placeholder="$t('create_playlist.input_playlist_name')"
          rows="3"
        ></textarea>
        <div class="check">
          <input type="checkbox" v-model="isPrivate" />
          <label @click="switchPrivate">
            {{ $t("create_playlist.private") }}
          </label>
        </div>
        <button class="create font-size-large" @click="createPlaylist">
          {{ $t("create_playlist.create") }}
        </button>
      </div>
    </YWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import YWindow from "../YWindow.vue";
import { useApi } from "@/utils/api";
import { Message } from "@/dual/YMessageC";
import { useStore } from "vuex";

export default defineComponent({
  name: "YCreatePlaylistWindow",
  components: {
    YWindow,
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();

    return {
      window,
      login: store.state.login,
    };
  },
  beforeUnmount() {
    this.window = null;
  },
  data() {
    return {
      inputValue: "",
      isPrivate: false,
    };
  },
  emits: ["new-window-state"],
  methods: {
    switchPrivate() {
      this.isPrivate = !this.isPrivate;
    },
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    async createPlaylist() {
      if (this.inputValue.length === 0) {
        Message.post("error", this.$t("create_playlist.no_name"));
        return;
      }
      await useApi("/playlist/create", {
        name: this.inputValue,
        privacy: this.isPrivate ? 10 : 0,
        cookie: this.login.cookie,
        timestamp: new Date().getTime(),
      })
        .then((res) => {
          console.log(res);
          if (res.code !== 200) {
            Message.post("error", this.$t("create_playlist.error"));
            return;
          } else {
            Message.post("success", this.$t("create_playlist.success"));
          }
          this.login.refreshUserPlaylists();
        })
        .catch((err) => {
          console.error(err);
          Message.post("error", this.$t("create_playlist.error"));
        });
      this.window?.closeWindow();
    },
  },
});
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 10px 10px 10px;
  width: 321px;

  .input {
    padding: 5px 10px;
    resize: none;
    width: calc(100% - 20px);
  }

  .check {
    display: flex;
    align-items: center;
    width: 100%;
    // gap: 5px;

    input {
      cursor: pointer;
    }

    label {
      cursor: pointer;
      color: var(--font-color-high);
    }
  }

  .create {
    width: fit-content;
    border-radius: 20px;
    padding: 5px 20px 8px 20px;
    background-color: rgb(var(--highlight-color-rgb));
    color: #fff;
    border: none;
    cursor: pointer;
  }
}
</style>
