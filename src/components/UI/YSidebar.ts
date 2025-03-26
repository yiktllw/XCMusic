import { Message } from "@/dual/YMessageC";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import YScroll from "@/components/base/YScroll.vue";
import { type IPlaylistCtxData } from "@/dual/YContextMenuItemC";
import { type IPlaylist } from "@/utils/login";
import { LoginEvents } from "@/dual/login";
import { type TSideBarItems } from "@/utils/setting";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { OpenedPlaylistEvents } from "@/utils/openedPlaylist";

export default defineComponent({
  name: "YSidebar",
  data() {
    return {
      buttonTextColor: "#ccc", // 统一设置按钮的文字颜色
      showMyPlaylist: true,
      showMySubscribedPlaylist: true,
      sidebarWidth: 200,
      newWidth: 0,
      activeButtonId: 0,
      userSubscribes: [] as IPlaylist[],
      userPlaylists: [] as IPlaylist[],
      hideInSidebar: [] as TSideBarItems[],
    };
  },
  props: {
    opened_playlist: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const sidebar_component = ref<HTMLElement | null>(null);
    const store = useStore();

    return {
      sidebar_component,
      globalMsg: store.state.globalMsg,
      login: store.state.login,
      setting: store.state.setting,
      OpenedPlaylist: store.state.openedPlaylist,
    };
  },
  components: {
    YScroll,
  },
  methods: {
    handleButtonClick(buttonId: number | string) {
      const url = `/playlist/${buttonId}`;
      this.$router.push(url);
      // console.log(`Button with ID ${buttonId} clicked`);
    },
    initResize() {
      window.addEventListener("mousemove", this.resize);
      window.addEventListener("mouseup", this.stopResize);
    },
    resize(e: MouseEvent) {
      const sidebar = this.sidebar_component;
      let newWidth = e.clientX;
      if (newWidth > 220 && newWidth < 260 && sidebar) {
        this.newWidth = newWidth;
        sidebar.style.width = `${this.newWidth}px`;
      }
    },
    stopResize() {
      this.setting.display.sidebarWidth = this.newWidth;
      window.removeEventListener("mousemove", this.resize);
      window.removeEventListener("mouseup", this.stopResize);
    },
    createPlaylist() {
      if (!this.login.status) {
        Message.post("error", this.$t("need_login"));
        return;
      }
      this.globalMsg.post(GlobalMsgEvents.CreatePlaylist);
    },
    openCtxMenu(
      event: MouseEvent,
      id: number,
      from: "created-playlists" | "subscribed-playlists",
    ) {
      event.preventDefault();
      const playlist =
        from === "created-playlists"
          ? this.userPlaylists.find((item) => item.id === id)
          : this.userSubscribes.find((item) => item.id === id);
      if (!playlist) return;
      const data: IPlaylistCtxData = {
        id: id,
        playlist: playlist,
        x: event.clientX,
        y: event.clientY,
        from: from,
      };
      this.globalMsg.post(GlobalMsgEvents.OpenCtxMenuPlaylist, data);
    },
  },
  mounted() {
    this.sidebarWidth = this.setting.display.sidebarWidth;
    this.login.subscriber.on("YSidebar", LoginEvents.userPlaylists, () => {
      this.userPlaylists = this.login.userPlaylists;
      this.userSubscribes = this.login.userSubscribes;
    })?.();
    this.OpenedPlaylist.subscriber.on(
      "YSidebar",
      OpenedPlaylistEvents.id,
      () => {
        this.activeButtonId = this.OpenedPlaylist.id;
      },
    );
    this.globalMsg.subscriber.on(
      "YSidebar",
      GlobalMsgEvents.RefreshSidebar,
      () => {
        this.hideInSidebar = this.setting.display.hideInSidebar;
      },
    );
  },
  beforeUnmount() {
    this.login.subscriber.offAll("YSidebar");
    this.OpenedPlaylist.subscriber.offAll("YSidebar");
    this.sidebar_component = null;
  },
});
