import { ITrack } from "@/utils/tracks";

export interface ISongsTableProps {
  songs: ITrack[];
  mode: "playlist" | "album";
  columns: {
    index: boolean;
    title: boolean;
    cover: boolean;
    artist: boolean;
    album: boolean;
    duration: boolean;
    like: boolean;
    popularity: boolean;
  };
}
