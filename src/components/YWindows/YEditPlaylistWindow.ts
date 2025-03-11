import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import { type IPlaylist } from "@/utils/login";
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
