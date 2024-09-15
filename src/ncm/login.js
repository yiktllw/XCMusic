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
        this.init();
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
}