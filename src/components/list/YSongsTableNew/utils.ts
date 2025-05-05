import type { ITrack } from "@/utils/tracks";
import type { AlReels } from "@/dual/YSongsTable";
import upArrow_svg from "@/assets/up-arrow.svg";
import downArrow_svg from "@/assets/down-arrow.svg";
import updownArrow_svg from "@/assets/updown-arrow.svg";

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
  slot_prepend?: {
    showTableHeader: boolean;
    showPrepend: boolean;
    prependHeight: number;
  };
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
  id: "YPlaylistView-playlist" | "YPlaylistView-album" | "YMultiSelectView",
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
      options.slot_prepend = {
        showTableHeader: true,
        showPrepend: true,
        prependHeight: 235,
      };
      break;
    case "YPlaylistView-album":
      options.id_for_subscribe = "YPlaylistView";
      options.columns.album = false;
      options.columns.cover = false;
      options.mode = "album";
      options.showHeader = true;
      options.slot_prepend = {
        showTableHeader: false,
        showPrepend: true,
        prependHeight: 225,
      };
      break;
    case "YMultiSelectView":
      options.id_for_subscribe = "YMultiSelectView";
      options.columns.popularity = false;
      options.showHeader = true;
      options.slot_prepend = {
        showTableHeader: false,
        showPrepend: false,
        prependHeight: 0,
      };
      break;
    default:
      break;
  }
  return options;
}

type positions = "title" | "artist" | "album" | "duration" | "popularity";

export type SortRole = "default" | `${positions}_asc` | `${positions}_desc`;

export interface ISortOptions {
  icon: string;
  text: string;
  role: SortRole;
}

type SortPosition<Key extends string> =
  | "default"
  | `${Key}_asc`
  | `${Key}_desc`;

interface SortConfig<Key extends string> {
  options: ISortOptions[];
  position: SortPosition<Key>;
}

type InfoSortConfig = {
  options: ISortOptions[];
  position: SortPosition<"title"> | SortPosition<"artist">;
};

type ISort = {
  [Key in "album" | "duration" | "popularity"]: SortConfig<Key>;
} & {
  info: InfoSortConfig;
};

function _getSortOptions(
  position: "title" | "artist" | "album" | "duration" | "popularity",
): ISortOptions[] {
  let options: ISortOptions[] = [];
  options.push({
    icon: updownArrow_svg,
    text: "songs_table.sort.default",
    role: "default",
  });
  options.push({
    icon: upArrow_svg,
    text: `songs_table.sort.${position}_ascending`,
    role: `${position}_asc`,
  });
  options.push({
    icon: downArrow_svg,
    text: `songs_table.sort.${position}_descending`,
    role: `${position}_desc`,
  });
  return options;
}

function getSortOptions(
  position: "info" | "artist" | "album" | "duration" | "popularity",
): ISortOptions[] {
  switch (position) {
    case "info":
      return [
        ..._getSortOptions("title"),
        ..._getSortOptions("artist").slice(1),
      ];
    default:
      return _getSortOptions(position);
  }
}

export function getNextPosition(
  position: SortRole,
  key: "info" | "album" | "duration" | "popularity",
): SortRole {
  if (key === "info") {
    switch (position) {
      case "default":
        return "title_asc";
      case "title_asc":
        return "title_desc";
      case "title_desc":
        return "artist_asc";
      case "artist_asc":
        return "artist_desc";
      case "artist_desc":
        return "default";
      default:
        return "default";
    }
  } else {
    switch (position) {
      case "default":
        return `${key}_asc`;
      case `${key}_asc`:
        return `${key}_desc`;
      case `${key}_desc`:
        return "default";
      default:
        return "default";
    }
  }
}

const sort: ISort = {
  info: {
    options: getSortOptions("info"),
    position: "default",
  },
  album: {
    options: getSortOptions("album"),
    position: "default",
  },
  duration: {
    options: getSortOptions("duration"),
    position: "default",
  },
  popularity: {
    options: getSortOptions("popularity"),
    position: "default",
  },
};

export const getSort = () => ({ ...sort });
