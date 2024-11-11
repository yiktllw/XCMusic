/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * login.ts 为渲染进程中，处理登录状态的工具
 * 封装了以下功能：
 * 1. 获取登录信息(状态，用户ID，用户名，头像)
 * 2. 获取用户创建的歌单，用户收藏的歌单
*---------------------------------------------------------------*/

import { Subscriber } from "@/utils/subscribe";
import { useApi } from "./api";
import { ref, reactive, markRaw, Ref, Raw, Reactive } from 'vue';
import { UserPlaylist } from "@/dual/login";

export interface IPlaylist {
    name: string;
    label: string;
    id: number;
    img: string;
}

export class Login {
    _cookie: string | null;
    _status: Ref<boolean> | boolean;
    _userId: Ref<number | string | null> | number | string | null;
    _userName: Ref<string | null> | string | null;
    _likelist: Raw<number[]>;
    _avatar: Ref<string | null> | string | null;
    _userPlaylists: Reactive<IPlaylist[]>;
    _userSubscribes: Reactive<IPlaylist[]>;
    subscriber: Subscriber;
    interval: NodeJS.Timeout;
    _userFavoriteId: number = 0;
    constructor() {
        this._cookie = ((localStorage.getItem('login_cookie') ?? null));
        this._status = ref(localStorage.getItem('login_cookie') ? true : false);
        this._userId = ref(localStorage.getItem('login_user_id') ?? null);
        this._userName = ref(localStorage.getItem('login_user_name') ?? null);
        this._likelist = markRaw([]);
        this._avatar = ref(localStorage.getItem('login_avatar') ?? null);
        this._userPlaylists = reactive([]);
        this._userSubscribes = reactive([]);
        this.subscriber = markRaw(new Subscriber(['userPlaylists']));
        this.init();
        this.interval = setInterval(() => {
            if (this._cookie && this._userId) {
                this.refreshUserPlaylists();
            }
        }, 1000 * 100);
    }
    init() {
        if (this._cookie && (!this._userId || !this._userName || this._avatar)) {
            this.updateInfo();
        }
        if (!this._cookie) {
            this.clear();
        }
    }
    async updateInfo() {
        // console.log('updateInfo');
        await useApi('/user/account', {
            cookie: this._cookie
        }).then(res => {
            this._userId = res.profile.userId;
            localStorage.setItem('login_user_id', res.profile.userId);
            this._userName = res.profile.nickname;
            localStorage.setItem('login_user_name', res.profile.nickname);
            this._avatar = res.profile.avatarUrl + '?param=200y200';
            localStorage.setItem('login_avatar', res.profile.avatarUrl + '?param=200y200');
        }).catch(error => {
            console.log(error);
        });
        await this.reloadLikelist();
        await this.refreshUserPlaylists();
    }
    async logout() {
        if (this._cookie) {
            await useApi('/logout', {
                cookie: this._cookie
            }).catch(error => {
                console.error('Failed to logout:', error);
            });
        }
        this.clear();
        window.location.reload();
    }
    clear() {
        this._cookie = null;
        localStorage.removeItem('login_cookie');
        this._status = false;
        localStorage.removeItem('login_user_id');
        this._userId = null;
        localStorage.removeItem('login_user_name');
        this._userName = null;
        this._likelist = markRaw([]);
        localStorage.removeItem('login_avatar');
        this._avatar = null;
        this._userPlaylists = markRaw([]);
        this._userSubscribes = markRaw([]);
        this.subscriber = markRaw(new Subscriber(['userPlaylists']));
    }
    get cookie() {
        return this._cookie;
    }
    set cookie(value) {
        localStorage.setItem('login_cookie', value ?? '');
        this._cookie = value;
        this._status = true;
        this.updateInfo();
        window.location.reload();
    }
    get userId() {
        return this._userId;
    }
    get userName() {
        return this._userName;
    }
    get likelist() {
        return this._likelist;
    }
    async reloadLikelist() {
        if (!this._cookie) {
            return;
        }
        if (!this._userId) {
            await this.updateInfo();
        }
        useApi('/likelist', {
            cookie: this._cookie,
            uid: this._userId
        }).then((res) => {
            this._likelist = markRaw(res.ids);
        }).catch((error) => {
            console.error('Failed to get likelist:', error);
        });
    }
    get status() {
        return this._status;
    }
    get avatar() {
        return this._avatar;
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
    async refreshUserPlaylists() {
        if (!this._cookie) {
            return;
        }
        if (!this._userId) {
            await this.updateInfo();
            if (!this._userId) return;
        }
        await useApi('/user/playlist', {
            uid: this._userId,
            cookie: this._cookie,
            timestamp: new Date().getTime(),
        }).then(res => {
            this._userPlaylists = [];
            this._userSubscribes = [];
            res.playlist.forEach((playlist: UserPlaylist) => {
                if (!playlist.subscribed) {
                    this._userPlaylists.push({
                        name: playlist.name,
                        label: playlist.name,
                        id: playlist.id,
                        img: playlist.coverImgUrl,
                    });
                } else {
                    this._userSubscribes.push({
                        name: playlist.name,
                        label: playlist.name,
                        id: playlist.id,
                        img: playlist.coverImgUrl,
                    });
                }
            });
        }).catch((error) => {
            console.error('Failed to get user playlist:', error);
        });
        if (this.userPlaylists.length > 0) {
            this._userFavoriteId = this.userPlaylists[0].id;
            this.userPlaylists.splice(0, 1);
        }
        this.subscriber.exec('userPlaylists');
    }
}