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
    Subscribe(param: {id: string, type: string, func: Function}) {
        this.subscriber.on({id: param.id, type: param.type, func: param.func});
    }
    Unsubscribe(param: {id: string, type: string}) {
        this.subscriber.off({id: param.id, type: param.type});
    }
}