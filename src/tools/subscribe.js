import { reactive, markRaw } from 'vue'; // eslint-disable-line 

export class Subscriber {
    _subscribes = markRaw([]);
    globalIndex = markRaw(0);
    constructor() {

    }
    _push({
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
    updateSubscribe(globalIndex, func) {
        let index = this._subscribes.findIndex(item => item.index === globalIndex);
        if (index !== -1) {
            this._subscribes[index].func = func;
        }
    }
    on({
        id = '',
        func = () => { },
        type = '',
    }) {
        if (typeof func !== 'function') {
            console.log('func is not a function: ', func);
            return;
        }
        if (id === '' || type === '') {
            console.log('id is empty');
            return;
        }
        let arrayWithId = this._subscribes.filter(item => item.id === id);
        if (arrayWithId.length === 0) {
            // 如果没有这个id的订阅，则直接添加到订阅列表。
            this._push({
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
                this._push({
                    id: id,
                    func: func,
                    type: type
                });
            } else {
                // 如果有这个id的订阅，而且也有这个type的订阅，则更新这个订阅。
                this.updateSubscribe(this.arrayWithId[index].globalIndex, func);
            }

        }
    }
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
    exec(type) {
        this._subscribes.forEach(item => {
            if (item.type === type) {
                item.func();
            }
        });
    }
}