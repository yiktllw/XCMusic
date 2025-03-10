import type { ITrack } from "@/utils/tracks";

export interface ISongsTableProps {
  // 由于同时有数个组件使用此组件，所以需要提供id来区分订阅事件。
  id_for_subscribe: string;
  songs: ITrack[];
  mode: "playlist" | "album";
  columns: IColumn;
  editable?: true | undefined;
  allow_play_all: boolean;
  showDeleteButton?: true | undefined;
}

interface IColumn {
  index: boolean;
  cover: boolean;
  title: boolean;
  artist: boolean;
  album: boolean;
  like: boolean;
  duration: boolean;
  popularity: boolean;
}

const defaultColumns: IColumn = {
  index: true,
  cover: true,
  title: true,
  artist: true,
  album: true,
  like: true,
  duration: true,
  popularity: true,
} as const;

export const getDefaultColumns = () => ({ ...defaultColumns }) as IColumn;
