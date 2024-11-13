import { State } from "@/store";
import { Store } from "vuex"; // 导入 Store

// 声明 Vuex 模块
declare module "vuex" {
  // 导入所有 vuex 的内容
  export * from "vuex";

  // 自定义 useStore 函数，添加类型支持
  export function useStore<S = State>(): Store<S>;
}
