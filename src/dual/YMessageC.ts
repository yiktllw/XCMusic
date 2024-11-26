/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YMessageC.ts 为YMessage组件配套的处理工具
 *---------------------------------------------------------------*/

import i18n from "@/i18n";

type Msg = {
  message: string;
  type: "info" | "success" | "warning" | "error";
};

class YMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YMessageError";
  }
}

export class YMessageC {
  #types = ["info", "success", "warning", "error"];
  #message = "";
  #type = "";
  /**
   *
   * @param {Msg} param Msg对象，包含message和type，type必须是['info', 'success', 'warning', 'error']中的一个
   */
  constructor({ message, type }: Msg) {
    this.#message = message;
    if (!this.#types.includes(type)) {
      throw new YMessageError("Invalid type: " + type);
    }
    this.#type = type;
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

export namespace Message {
  /**
   * 发送程序内通知
   * @param {'info'|'success'|'warning'|'error'} type 消息类型
   * @param {string} message 消息内容
   */
  export function post(
    type: "info" | "success" | "warning" | "error",
    message: string,
    needTrans: boolean = false
  ) {
    if (!["info", "success", "warning", "error"].includes(type)) {
      throw new YMessageError("Invalid type: " + type);
    }
    let transMsg = message;
    if (needTrans) transMsg = i18n.global.t(message);
    const msg = new YMessageC({
      type: type,
      message: transMsg,
    });
    window.postMessage({
      type: "message-show",
      data: msg.data,
    });
  }
}
