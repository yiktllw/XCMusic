<template>
  <!-- 编辑歌单信息窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("context.edit_playlist") }}
        </span>
      </template>
      <div class="main">
        <div class="item">
          <div class="item-title">
            {{ $t("edit_playlist.name") }}
          </div>
          <textarea
            class="input font-size-large"
            v-model="name"
            :maxlength="40"
            :placeholder="$t('edit_playlist.input_name')"
            rows="2"
          ></textarea>
        </div>
        <div class="item">
          <div class="item-title">
            {{ $t("edit_playlist.name") }}
          </div>
          <textarea
            class="input font-size-large"
            v-model="desc"
            :maxlength="1000"
            :placeholder="$t('edit_playlist.input_desc')"
            rows="3"
          ></textarea>
        </div>
        <div class="buttons">
          <button
            :tabindex="-1"
            class="create cancel font-size-large"
            @click="cancel"
          >
            {{ $t("cancel") }}
          </button>
          <button
            :tabindex="-1"
            class="create font-size-large"
            @click="confirmModify"
          >
            {{ $t("confirm.title") }}
          </button>
        </div>
      </div>
    </YWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import { IPlaylist } from "@/utils/login";
import { Playlist } from "@/utils/api";
import { useStore } from "vuex";

export default defineComponent({
  name: "YEditPlaylistWindow",
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();
    return {
      window,
      login: store.state.login,
    };
  },
  emits: ["new-window-state"],
  props: {
    playlist: {
      type: Object as () => IPlaylist,
      required: true,
    },
  },
  components: {
    YWindow,
  },
  data() {
    return {
      id: 0,
      name: "",
      desc: "",
    };
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    confirmModify() {
      Playlist.editPlaylist(this.id, this.name, this.desc).then(() => {
        this.login.refreshUserPlaylists();
        this.window?.closeWindow();
      });
    },
    cancel() {
      this.window?.closeWindow();
    },
  },
  mounted() {
    this.id = this.playlist.id;
    this.name = this.playlist.name;
    this.desc = "";
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

  .item {
    display: flex;
    flex-direction: row;
    gap: 5px;
    width: 100%;
    align-items: first baseline;

    .item-title {
      width: 100px;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .buttons {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .input {
    padding: 5px 10px;
    resize: none;
    width: calc(100% - 20px);
  }

  .create {
    width: fit-content;
    border-radius: 20px;
    padding: 5px 20px 8px 20px;
    background-color: rgb(var(--highlight-color-rgb));
    color: #fff;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: rgba(var(--highlight-color-rgb), 0.8);
    }
  }

  .cancel {
    background-color: rgba(var(--foreground-color-rgb), 0.1);

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.2);
    }
  }
}
</style>
