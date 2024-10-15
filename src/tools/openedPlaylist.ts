import { Subscriber, SubscribeOptions, UnsubscribeOptions } from "./subscribe";

export class OpenedPlaylist {
    _id: number;
    subscriber: Subscriber;
    constructor(){
        this._id = 0;
        this.subscriber = new Subscriber(['id']);
    }
    get id(){
        return this._id;
    }
    set id(id){
        this._id = id;
        this.execCallbacks();
    }
    Subscribe({
        id,
        type,
        func,
    } : SubscribeOptions ){
        this.subscriber.on({
            id,
            type,
            func,
        })
    }
    Unsubscribe({
        id,
        type,
    } : UnsubscribeOptions){
        this.subscriber.off({
            id,
            type,
        })
    }
    execCallbacks(){
        this.subscriber.exec('id');
    }
}