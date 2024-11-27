/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * login.ts 为渲染进程中，处理登录状态的工具
 * 封装了以下功能：
 * 1. 获取登录信息(状态，用户ID，用户名，头像)
 * 2. 获取用户创建的歌单，用户收藏的歌单
 *---------------------------------------------------------------*/

import { Subscriber } from "@/utils/subscribe";
import { Login as LoginApi, User } from "@/utils/api";
import { reactive, markRaw, Reactive } from "vue";
import { getStorage, setStorage, StorageKey } from "@/utils/render_storage";
import { LoginEvents } from "@/dual/login";

export interface IPlaylist {
  /** 歌单名 */
  name: string;
  /** 侧边栏使用，显示在按钮的内容 */
  label: string;
  /** 歌单ID */
  id: number;
  /** 歌曲数量 */
  trackCount: number;
  /** 歌单图片 */
  img: string;
}

type LoginEventCallbacks = {
  [LoginEvents.userPlaylists]: () => void;
  [LoginEvents.status]: () => void;
  [LoginEvents.userId]: () => void;
  [LoginEvents.userName]: () => void;
  [LoginEvents.avatar]: () => void;
}

export class Login {
  /** 登录凭证 */
  _cookie: string = getStorage(StorageKey.LoginCookie) ?? "";
  /** 登录状态 */
  _status: boolean = getStorage(StorageKey.LoginCookie) ? true : false;
  /** 用户ID */
  _userId: number = getStorage(StorageKey.LoginUserId) ?? 0;
  /** 用户名 */
  _userName: string = getStorage(StorageKey.LoginUserName) ?? "";
  /** 用户喜欢的音乐 */
  _likelist: number[] = [];
  /** 用户头像 */
  _avatar: string = getStorage(StorageKey.LoginAvatar) ?? "";
  /** 用户创建的歌单 */
  _userPlaylists: Reactive<IPlaylist[]> = reactive([]);
  /** 用户订阅的歌单 */
  _userSubscribes: Reactive<IPlaylist[]> = reactive([]);
  /** 订阅事件 */
  subscriber = new Subscriber<LoginEventCallbacks>(LoginEvents);
  /** 每隔一段时间，自动更新用户的歌单 */
  interval: NodeJS.Timeout;
  _userFavoriteId: number = 0;
  constructor() {
    this.init();
    this.interval = setInterval(() => {
      if (this._cookie && this._userId) {
        this.refreshUserPlaylists();
      }
    }, 1000 * 100);
  }
  /** 初始化 */
  init() {
    if (this._cookie && (!this._userId || !this._userName || this._avatar)) {
      this.updateInfo();
    }
    if (!this._cookie) {
      this.clear();
    }
  }
  /** 更新信息 */
  async updateInfo() {
    await User.account()
      .then((res) => {
        if (!res) return;

        this.userId = res.userId;
        this.userName = res.nickname;
        this.avatar = res.avatarUrl + "?param=200y200";
      })
      .catch((error) => {
        console.log(error);
      });
    await this.reloadLikelist();
    await this.refreshUserPlaylists();
  }
  async logout() {
    await LoginApi.out();
    this.clear();
    window.location.reload();
  }
  clear() {
    /** 使用_cookie是为了不触发window.location.reload() */
    this._cookie = "";
    setStorage(StorageKey.LoginCookie, "");
    this.status = false;
    this._userId = 0;
    this.userName = "";
    this._likelist = markRaw([]);
    this.avatar = "";
    this._userPlaylists = markRaw([]);
    this._userSubscribes = markRaw([]);
    this.subscriber.clear();
  }
  get cookie() {
    return this._cookie;
  }
  set cookie(value) {
    setStorage(StorageKey.LoginCookie, value ?? "");
    this._cookie = value;
    this.status = true;
    this.updateInfo();
    window.location.reload();
  }
  get userId() {
    return this._userId;
  }
  private set userId(value) {
    if (value !== this._userId && value) {
      this._userId = value;
      setStorage(StorageKey.LoginUserId, value);
      this.subscriber.exec(LoginEvents.userId);
    }
  }
  get userName() {
    return this._userName;
  }
  private set userName(value) {
    if (value !== this._userName && value) {
      this._userName = value;
      setStorage(StorageKey.LoginUserName, value);
      this.subscriber.exec(LoginEvents.userName);
    }
  }
  get likelist() {
    return this._likelist;
  }
  private set likelist(value) {
    if (Array.isArray(value)) this._likelist = value;
  }
  /** 重新加载用户喜欢的音乐 */
  async reloadLikelist() {
    if (!this._userId) await this.updateInfo();
    this.likelist = await User.getLikelist(
      this._userId as unknown as number,
      true
    );
  }
  get status() {
    return this._status;
  }
  private set status(value) {
    if (typeof value === "boolean" && value !== this._status) {
      this._status = value;
      setStorage(StorageKey.LoginStatus, value);
      this.subscriber.exec(LoginEvents.status);
    }
  }
  get avatar() {
    return this._avatar;
  }
  private set avatar(value) {
    if (value !== this._avatar && value) {
      this._avatar = value;
      setStorage(StorageKey.LoginAvatar, value);
      this.subscriber.exec(LoginEvents.avatar);
    }
  }
  get userPlaylists() {
    return this._userPlaylists;
  }
  get userSubscribes() {
    return this._userSubscribes;
  }
  get userFavoriteId() {
    return this._userFavoriteId;
  }
  /** 刷新用户的歌单 */
  async refreshUserPlaylists() {
    if (!this._cookie) {
      return;
    }
    if (!this._userId) {
      await this.updateInfo();
      if (!this._userId) return;
    }
    await User.getPlaylists(this._userId as unknown as number)
      .then((res) => {
        this._userPlaylists = [];
        this._userSubscribes = [];
        res.forEach((playlist) => {
          if (!playlist.subscribed) {
            this._userPlaylists.push({
              name: playlist.name,
              label: playlist.name,
              id: playlist.id,
              trackCount: playlist.trackCount,
              img: playlist.coverImgUrl,
            });
          } else {
            this._userSubscribes.push({
              name: playlist.name,
              label: playlist.name,
              id: playlist.id,
              trackCount: playlist.trackCount,
              img: playlist.coverImgUrl,
            });
          }
        });
      })
      .catch((error) => {
        console.error("Failed to get user playlist:", error);
      });
    if (this.userPlaylists.length > 0) {
      this._userFavoriteId = this.userPlaylists[0].id;
      this.userPlaylists.splice(0, 1);
    }
    this.subscriber.exec(LoginEvents.userPlaylists);
  }
}
