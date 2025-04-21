export type SlotConfig = {
  type: "prepend" | "append" | "index";
  index?: number;
  height: number;
};

export type VirtualItem<T> = {
  type: "item" | "slot";
  key: string | number;
  height: number;
  offset: number;
  data?: T;
  index?: number;
  slotType?: "prepend" | "append" | "index";
  slotIndex?: number;
};
