import { Subscriber } from "./subscribe";

const events = [
    'create-playlist',
    'open-login-window',
    'close-login-window',
    'close-login-window-from-homeview',
    'open-custom-window',
    'close-custom-window',
    'open-close-window',
    'open-ctx-menu-playlist',
    'confirm',
]

export interface IConfirm {
    content: string;
    needTranslate: boolean;
    callback: Function;
}

export class GlobalMsg {
    subscriber: Subscriber;
    constructor() {
        this.subscriber = new Subscriber(events);
    }
    post(msg: string, data?: any) {
        if (!events.includes(msg)) {
            console.error('msg not exist in allowed list:', msg);
            return;
        }
        this.subscriber.exec(msg, data);
    }
    confirm(args: IConfirm) {
        this.subscriber.exec('confirm', args);
    }
}