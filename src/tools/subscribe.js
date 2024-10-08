import { reactive, markRaw } from 'vue'; // eslint-disable-line 

export class Subscriber {
    _subscribes = markRaw([]);
    globalIndex = markRaw(0);
    /**
     * 订阅事件类   
     * @param {Array<string>} allowedEvents 允许订阅的事件类型
     */
    constructor(allowedEvents) {
        this.allowedEvents = allowedEvents;
    }
    #push({
        id = '',
        func = () => { },
        type = ''
    }) {
        this._subscribes.push({
            globalIndex: this.globalIndex,
            id: id,
            func: func,
            type: type
        });
        this.globalIndex++;
    }
    #updateSubscribe(globalIndex, func) {
        let index = this._subscribes.findIndex(item => item.index === globalIndex);
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
    }) {
        if (typeof func !== 'function') {
            console.log('func is not a function: ', func);
            return;
        }
        if (id === '' || type === '') {
            console.log('id is empty');
            return;
        }
        if (!this.allowedEvents?.includes(type)) {
            console.log('type is not in allowedEvents: ', type);
            return;
        }
        let arrayWithId = this._subscribes.filter(item => item.id === id);
        if (arrayWithId.length === 0) {
            // 如果没有这个id的订阅，则直接添加到订阅列表。
            this.#push({
                id: id,
                func: func,
                type: type
            });
        }
        // 如果有这个id的订阅
        else {
            let index = arrayWithId.findIndex(_item => _item.type === type);
            if (index === -1) {
                // 如果有这个id的订阅，但是没有这个type的订阅，则直接添加到订阅列表。
                this.#push({
                    id: id,
                    func: func,
                    type: type
                });
            } else {
                // 如果有这个id的订阅，而且也有这个type的订阅，则更新这个订阅。
                this.#updateSubscribe(this.arrayWithId[index].globalIndex, func);
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
        id = '',
        type = '',
    }) {
        let arrayWithId = this._subscribes.filter(item => item.id === id);
        if (arrayWithId.length !== 0) {
            arrayWithId.forEach(item => {
                if (item.type === type) {
                    let index = this._subscribes.findIndex(_item => _item.globalIndex === item.globalIndex);
                    this._subscribes.splice(index, 1);
                }
            })
        }
    }
    /**
     * 执行某种事件
     * @param {string} type - 要执行的事件类型
     */
    exec(type) {
        this._subscribes.forEach(item => {
            if (item.type === type) {
                item.func();
            }
        });
    }
}