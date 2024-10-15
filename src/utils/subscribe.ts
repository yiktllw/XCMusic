import { reactive, markRaw } from 'vue';

export interface SubscribeOptions {
    id: string | number;
    func: Function;
    type: string;
}

export interface UnsubscribeOptions {
    id: string;
    type: string;
}

interface SubscriberItem {
    globalIndex: number;
    id: number | string;
    func: Function;
    type: string;
}

export class Subscriber {
    _subscribes: any | Array<SubscriberItem> = markRaw([]);
    globalIndex = 0;
    allowedEvents: string[];
    arrayWithId: any;
    /**
     * 订阅事件类   
     * @param {Array<string>} allowedEvents 允许订阅的事件类型
     */
    constructor(allowedEvents: Array<string>) {
        this.allowedEvents = allowedEvents;
    }
    push({
        id,
        func,
        type,
    }: {
        id: string | number,
        func: Function,
        type: string,
    }) {
        this._subscribes.push({
            globalIndex: this.globalIndex,
            id: id,
            func: func,
            type: type
        });
        this.globalIndex++;
    }
    updateSubscribe(globalIndex: string | number, func: Function) {
        let index = this._subscribes.findIndex((item: { index: string | number; }) => item.index === globalIndex);
        if (index !== -1) {
            this._subscribes[index].func = func;
        }
    }
    /**
     * 订阅一种事件
     * @param {Object} options - 事件处理的参数对象
     * @param {string} [options.id=''] - 用来标识订阅者的唯一id
     * @param {Function} [options.func=()=>{}] - 事件处理函数
     * @param {string} [options.type=''] - 订阅的事件类型
     */
    on({
        id,
        type,
        func = () => { },
    }: SubscribeOptions) {
        if (typeof func !== 'function') {
            console.log('func is not a function: ', func);
            return;
        }
        if (id === '' || type === '') {
            console.log('id is empty');
            return;
        }
        if (!this.allowedEvents?.includes(type as string)) {
            console.log('type is not in allowedEvents: ', type);
            return;
        }
        let arrayWithId = this._subscribes.filter((item: { id: string | undefined; }) => item.id === id);
        if (arrayWithId.length === 0) {
            // 如果没有这个id的订阅，则直接添加到订阅列表。
            this.push({
                id: id as string,
                func: func,
                type: type as string
            });
        }
        // 如果有这个id的订阅
        else {
            let index = arrayWithId.findIndex((_item: { type: string | undefined; }) => _item.type === type);
            if (index === -1) {
                // 如果有这个id的订阅，但是没有这个type的订阅，则直接添加到订阅列表。
                this.push({
                    id: id as string,
                    func: func,
                    type: type as string
                });
            } else {
                // 如果有这个id的订阅，而且也有这个type的订阅，则更新这个订阅。
                this.updateSubscribe(this.arrayWithId[index].globalIndex, func);
            }

        }
    }

    /**
     * 取消订阅一种事件
     * @param {Object} options - 事件处理的参数对象
     * @param {string} [options.id=''] - 用来标识订阅者的唯一id
     * @param {string} [options.type=''] - 要取消订阅的事件类型
     */
    off({
        id,
        type,
    }: UnsubscribeOptions) {
        let arrayWithId = this._subscribes.filter((item: { id: string; }) => item.id === id);
        if (arrayWithId.length !== 0) {
            arrayWithId.forEach((item: { type: string; globalIndex: any; }) => {
                if (item.type === type) {
                    let index = this._subscribes.findIndex((_item: { globalIndex: any; }) => _item.globalIndex === item.globalIndex);
                    this._subscribes.splice(index, 1);
                }
            })
        }
    }
    /**
     * 执行某种事件
     * @param {string} type - 要执行的事件类型
     */
    exec(type: string) {
        this._subscribes.forEach((item: { type: string; func: () => void; }) => {
            if (item.type === type) {
                item.func();
            }
        });
    }
}