import type { ITrack } from "@/utils/tracks";
import type { AlReels } from "@/dual/YSongsTable";

export interface ISongsTableProps {
  // 由于同时有数个组件使用此组件，所以需要提供id来区分订阅事件。
  id_for_subscribe: string;
  songs: ITrack[];
  mode: "playlist" | "album";
  columns: IColumn;
  editable?: true | undefined;
  allow_play_all: boolean;
  reelOptions?: reelOptions;
  showDeleteButton?: true | undefined;
  showHeader?: true | undefined;
  playlistId?: number;
}

interface reelOptions {
  showReels: boolean;
  reels: AlReels[];
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

export function getSongsTableOptions(
  id: "YPlaylistView-playlist" | "YPlaylistView-album",
): ISongsTableProps {
  let columnsOptions = getDefaultColumns();
  let options: ISongsTableProps = {
    id_for_subscribe: "",
    songs: [] as ITrack[],
    mode: "playlist",
    columns: columnsOptions,
    allow_play_all: true,
  };
  switch (id) {
    case "YPlaylistView-playlist":
      options.id_for_subscribe = "YPlaylistView";
      options.columns.popularity = false;
      options.showHeader = true;
      break;
    case "YPlaylistView-album":
      options.id_for_subscribe = "YPlaylistView";
      options.columns.album = false;
      options.columns.cover = false;
      options.mode = "album";
      options.showHeader = true;
      break;
    default:
      break;
  }
  return options;
}
