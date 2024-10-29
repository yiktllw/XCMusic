import { Subscriber } from "./subscribe";

const events = [
    'create-playlist',
    'open-login-window',
    'close-login-window',
    'close-login-window-from-homeview',
]

export class GlobalMsg {
    subscriber: Subscriber;
    dataTemp: any = null;
    constructor() {
        this.subscriber = new Subscriber(events);
    }
    post(msg: string, data?: any) {
        if (!events.includes(msg)) {
            console.error('msg not exist in allowed list:', msg);
            return;
        }
        this.dataTemp = data ?? null;
        this.subscriber.exec(msg);
    }
}