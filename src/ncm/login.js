import { Subscriber } from "@/tools/subscribe";
import { useApi } from "./api";
import { ref, reactive, markRaw, shallowReactive } from 'vue'; // eslint-disable-line

export class Login {
    constructor() {
        this._cookie = ((localStorage.getItem('login_cookie') ?? null));
        this._status = ref(localStorage.getItem('login_cookie') ? true : false);
        this._userId = ref(localStorage.getItem('login_user_id') ?? null);
        this._userName = ref(localStorage.getItem('login_user_name') ?? null);
        this._likelist = markRaw([]);
        this._avatar = ref(localStorage.getItem('login_avatar') ?? null);
        this._userPlaylists = reactive([]);
        this._userSubscribes = reactive([]);
        this.subscriber = markRaw(new Subscriber());
        this.subscribeEvents = markRaw([
            'userPlaylists',
        ]);
        this.init();
        this.interval = setInterval(() => {
            if (this._cookie && this._userId) {
                this.refreshUserPlaylists();
            }
        }, 1000 * 60);
    }
    subscribe({
        id = '',
        func = () => { },
        type = '',
    }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('type is not in subscribeEvents: ', type);
            return;
        }
        this.subscriber.on({
            id: id,
            func: func,
            type: type
        });
    }
    unSubscribe({
        id = '',
        type = '',
    }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('type is not in subscribeEvents: ', type);
            return;
        }
        this.subscriber.off({
            id: id,
            type: type
        });
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
        console.log('updateInfo');
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
        this.subscriber = markRaw(new Subscriber());
    }
    get cookie() {
        return this._cookie;
    }
    set cookie(value) {
        localStorage.setItem('login_cookie', value);
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
    async refreshUserPlaylists() {
        if (!this._cookie) {
            return;
        }
        if (!this._userId) {
            await this.updateInfo();
        }
        await useApi('/user/playlist', {
            uid: this._userId,
            cookie: this._cookie,
            timestamp: new Date().getTime(),
        }).then(res => {
            this._userPlaylists = [];
            this._userSubscribes = [];
            res.playlist.forEach(playlist => {
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
            this.userPlaylists[0].label = '我喜欢的音乐';
        }
        this.subscriber.exec('userPlaylists');
    }
}