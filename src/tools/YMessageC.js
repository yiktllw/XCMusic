
export class YMessageC {
    #types = ['info', 'success', 'warning', 'error'];
    #message = '';
    #type = '';
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

export class Message{
    static post(message) {
        if (message instanceof YMessageC) {
            window.postMessage({
                type: 'message-show',
                data: message.data,
            });
        } else {
            console.error('Invalid message: ', message);
        }
    }
}