import { defineComponent, ref } from "vue";
import { Login, Search, User } from "@/utils/api";
import { useStore } from "vuex";
import YPanel from "@/components/base/YPanel.vue";
import YScroll from "@/components/base/YScroll.vue";
import { IHotSearch, ISearchSuggestion } from "@/dual/YTitlebar";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { LoginEvents } from "@/dual/login";

let QRInterval: NodeJS.Timeout | null = null;

export default defineComponent({
  name: "YTitlebar",
  emits: ["navigate-back", "navigate-forward", "user-login", "close-panel"],
  props: {
    type: {
      type: String as () => "default" | "play-ui",
      default: "default",
    },
  },
  setup() {
    const search_panel = ref<typeof YPanel | null>(null);
    const search_panel_trigger = ref<HTMLElement | null>(null);
    const search_input = ref<HTMLElement | null>(null);
    const dropdownMenu = ref<HTMLElement | null>(null);
    const user_info_panel = ref<typeof YPanel | null>(null);
    const user_info_menu_trigger = ref<HTMLElement | null>(null);

    const store = useStore();
    const login = store.state.login;
    const setting = store.state.setting;

    return {
      search_panel,
      search_panel_trigger,
      search_input,
      dropdownMenu,
      user_info_panel,
      user_info_menu_trigger,
      login,
      setting,
      globalMsg: store.state.globalMsg,
    };
  },
  components: {
    YPanel,
    YScroll,
  },
  data() {
    return {
      /** 用于存储用户信息 */
      userProfile: {
        follows: 0,
        followeds: 0,
        level: 0,
      },
      /** 用于存储头像 */
      avatar: "",
      /** 用于存储登录状态 */
      status: false,
      /** 用于控制下拉登录菜单的显示 */
      showDropdown: false,
      /** 用于存储搜索历史 */
      searchHistory: [] as string[],
      /** 用于存储 Base64 图片 */
      base64Image: "",
      /** 用于存储用户昵称 */
      userNickName: "用户昵称",
      /** 用于存储头像地址 */
      avatarSrc: "",
      /** 用于存储搜索输入 */
      searchInput: "",
      /** 用于存储二维码 key */
      qrKey: "",
      /** 用于存储搜索建议 */
      searchSuggestions: [] as ISearchSuggestion[],
      /** 用于存储热搜榜 */
      hotSearches: [] as IHotSearch[],
      /** 用于存储选中的搜索建议 */
      selectedSuggestion: 0,
    };
  },
  watch: {
    searchHistory(newHistory) {
      if (newHistory.length > 0) {
        this.setting.titleBar.searchHistory = newHistory;
      }
    },
  },
  computed: {},
  methods: {
    back() {
      this.$router.go(-1);
    },
    forward() {
      this.$router.go(1);
    },
    async openUserPage() {
      if (this.login.status) {
        this.$router.push({ path: `/user/${this.login.userId}` });
      }
    },
    /** 用户信息 */
    async userInfo(event: MouseEvent) {
      event.stopPropagation(); // 阻止事件冒泡以免立即触发外部点击处理器
      // 如果已登录，则打开用户信息窗口
      if (this.login.cookie && this.login.status) {
        this.user_info_panel?.tooglePanel();
        console.log("open userInfo");
      } else {
        // 如果未登录，则显示二维码登录
        let qrKey = await Login.getQrKey();
        if (!qrKey) return;
        this.qrKey = qrKey;
        let qrCoke = await Login.createQrImg(this.qrKey);
        if (!qrCoke) return;
        this.base64Image = qrCoke;
        this.globalMsg.post(GlobalMsgEvents.OpenLoginWindow, this.base64Image);
        this.toggleDropdown(); // 切换下拉菜单显示
        this.pollQRCodeStatus(); // 轮询二维码状态
      }
    },
    // 轮询二维码状态
    async pollQRCodeStatus() {
      QRInterval = setInterval(async () => {
        let checkResponse = await Login.checkQrStatus(this.qrKey);
        if (checkResponse && checkResponse.code === 803) {
          // 关闭扫码窗口
          this.showDropdown = false;
          this.globalMsg.post(GlobalMsgEvents.CloseLoginWindow);
          if (QRInterval) clearInterval(QRInterval);
          this.$emit("user-login");
          await this.init();
          this.login.cookie = checkResponse.cookie;
        }
      }, 2000); // 每2秒轮询一次
      setInterval(() => {
        if (this.showDropdown === false && QRInterval) {
          clearInterval(QRInterval);
        }
      }, 2000); // 停止轮询
    },
    /** 切换下拉菜单显示 */
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    /** 最小化 */
    minimize() {
      if (window.electron?.isElectron) {
        window.electron.ipcRenderer.send("minimize");
      } else {
        console.log("not in electron, cannot minimize");
      }
    },
    /** 最大化 */
    maximize() {
      if (window.electron?.isElectron) {
        window.electron.ipcRenderer.send("maximize");
      } else {
        console.log("not in electron, cannot maximize");
      }
    },
    /** 关闭 */
    close() {
      if (window.electron?.isElectron) {
        const closeAlwaysAsk = this.setting.titleBar.closeAlwaysAsk;
        if (closeAlwaysAsk) {
          this.globalMsg.post(GlobalMsgEvents.OpenCloseWindow);
          return;
        }
        const closeBehavior = this.setting.titleBar.closeButton;
        if (closeBehavior === "minimize") {
          window.electron.ipcRenderer.send("close");
        } else if (closeBehavior === "quit") {
          window.electron.ipcRenderer.send("quit");
        }
      } else {
        console.log("not in electron, cannot close");
      }
    },
    /** 搜索事件 */
    handleSearch(event: KeyboardEvent) {
      this.search((event.target as HTMLInputElement).value);
    },
    search(text: string) {
      if (text === "") {
        console.log("search text is empty");
        return;
      }
      this.$router.push({ path: `/search/${text}/default` });
      this.search_panel?.closePanel();
      const SEARCH_HISTORY_LENGTH = 10;
      this.searchInput = text;
      if (
        this.searchHistory.length > 0 &&
        this.searchHistory.length <= SEARCH_HISTORY_LENGTH
      ) {
        console.log("search0");
        if (!this.searchHistory.includes(text)) {
          this.searchHistory = [text, ...this.searchHistory];
        } else {
          this.searchHistory = [
            text,
            ...this.searchHistory.filter((item) => item !== text),
          ];
        }
      } else if (this.searchHistory.length === 0) {
        this.searchHistory = [text];
      } else if (this.searchHistory.length >= SEARCH_HISTORY_LENGTH) {
        if (!this.searchHistory.includes(text)) {
          this.searchHistory = [
            text,
            ...this.searchHistory.slice(0, SEARCH_HISTORY_LENGTH - 1),
          ];
        } else {
          this.searchHistory = [
            text,
            ...this.searchHistory
              .filter((item) => item !== text)
              .slice(0, SEARCH_HISTORY_LENGTH - 1),
          ];
        }
      }
      console.log("search:", text);
    },
    async getSearchSuggestions(event: Event) {
      this.search_panel?._showPanel();
      const searchText = (event.target as HTMLInputElement)?.value;
      if (searchText.length === 0) this.searchSuggestions = [];
      this.searchSuggestions = await Search.getSearchSuggestion(searchText);
      // 确保选中的搜索建议不超出范围
      if (this.selectedSuggestion >= this.searchSuggestions.length) {
        this.selectedSuggestion = this.searchSuggestions.length - 1;
      }
    },
    async init() {
      if (this.login.cookie) {
        this.userNickName = this.login.userName as string;
        this.avatarSrc = this.login.avatar as string;

        if (!this.login.userId) {
          await this.login.updateInfo();
        }
        let userProfile = await User.detail(
          this.login.userId as unknown as number,
        );
        if (!userProfile) return;
        this.userProfile = userProfile.profile;
        this.userProfile.level = userProfile.level;
      }
    },
    highlightMatching(keyword: string) {
      if (keyword.startsWith(this.searchInput)) {
        return `<span style="color: rgb(var(--highlight-color-rgb));
">${this.searchInput}</span>${keyword.slice(this.searchInput.length)}`;
      }
      return keyword;
    },
    async getHotSearches() {
      // 获取热搜榜
      this.hotSearches = await Search.getHotSearch();
    },
    openTestPage() {
      this.$router.push({ path: "/test" });
      this.user_info_panel?.closePanel();
    },
    openListenRank() {
      this.$router.push({ path: `/user_songs_rank/${this.login.userId}` });
      this.user_info_panel?.closePanel();
    },
    deleteSearchHistory(item: string) {
      this.searchHistory = this.searchHistory.filter(
        (history) => history !== item,
      );
    },
    openAboutPage() {
      this.$router.push({ path: "/markdown/README" });
      this.user_info_panel?.closePanel();
    },
    openFollow(type: "follow" | "follower") {
      this.$router.push({ path: `/${type}/${this.login.userId}` });
      this.user_info_panel?.closePanel();
    },
    scrollToSuggestion() {
      try {
        const suggestions: HTMLElement[] =
          this.search_panel?.$el.querySelectorAll(".suggestion-to-select");
        suggestions.forEach((suggestion) => {
          suggestion.classList.remove("focus");
        });
        const nowSelected = suggestions[this.selectedSuggestion];
        if (!nowSelected) return;
        nowSelected.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        nowSelected.classList.add("focus");
      } catch (error) {
        console.error("Failed to scroll to suggestion:", error);
      }
    },
    search_Up(event: KeyboardEvent) {
      event.preventDefault();
      if (this.selectedSuggestion > 0) {
        this.selectedSuggestion--;
        this.searchInput =
          this.searchSuggestions[this.selectedSuggestion].keyword;
        this.scrollToSuggestion();
      }
    },
    search_Down(event: KeyboardEvent) {
      event.preventDefault();
      if (this.selectedSuggestion < this.searchSuggestions.length - 1) {
        this.selectedSuggestion++;
        this.searchInput =
          this.searchSuggestions[this.selectedSuggestion].keyword;
        this.scrollToSuggestion();
      }
    },
  },
  async mounted() {
    // 添加外部点击处理器
    await this.init();
    this.avatar = this.login.avatar;
    this.status = this.login.status;
    this.userNickName = this.login.userName;
    this.login.subscriber.on("YTitlebar", LoginEvents.status, async () => {
      this.avatar = this.login.avatar;
    });
    this.login.subscriber.on("YTitlebar", LoginEvents.avatar, async () => {
      this.status = this.login.status;
    });
    this.login.subscriber.on("YTitlebar", LoginEvents.userName, async () => {
      this.userNickName = this.login.userName;
    });
    if (this.type === "default") {
      await this.getHotSearches();
      this.searchHistory = this.setting.titleBar.searchHistory;
    }
    this.globalMsg.subscriber.on(
      "YTitlebar",
      GlobalMsgEvents.CloseLoginWindowFromHomeView,
      () => {
        this.showDropdown = false;
      },
    );
  },
  beforeUnmount() {
    if (QRInterval) clearInterval(QRInterval);
    this.globalMsg.subscriber.offAll("YTitlebar");
    this.login.subscriber.offAll("YTitlebar");
    this.search_panel = null;
    this.search_panel_trigger = null;
    this.search_input = null;
    this.dropdownMenu = null;
    this.user_info_panel = null;
    this.user_info_menu_trigger = null;
  },
});
