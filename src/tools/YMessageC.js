/**
 * @typedef {'info'|'success'|'warning'|'error'} MSG_TYPES
 */

/**
 * @typedef {Object} Msg
 * @property {string} message
 * @property {MSG_TYPES} type
 */

export class YMessageC {
    #types = ['info', 'success', 'warning', 'error'];
    #message = '';
    #type = '';
    /**
     * 
     * @param {Msg} param Msg对象，包含message和type，type必须是['info', 'success', 'warning', 'error']中的一个
     */
    constructor({
        message,
        type,
    }) {
        this.#message = message;
        if (this.#types.includes(type)) {
            this.#type = type;
        } else {
            console.error('Invalid type: ', type);
        }
    }
    get message() {
        return this.#message;
    }
    get type() {
        return this.#type;
    }
    get data() {
        return {
            message: this.#message,
            type: this.#type,
        };
    }
}

export class Message {
    /**
     * 发送程序内通知
     * @param {'info'|'success'|'warning'|'error'} type 消息类型
     * @param {string} message 消息内容
     */
    static post(type, message) {
        if (['info', 'success', 'warning', 'error'].includes(type)) {
            const msg = new YMessageC({
                type: type,
                message: message,
            });
            window.postMessage({
                type: 'message-show',
                data: msg.data,
            })
        } else {
            console.error('Invalid type: ', type);
        }
    }
}