import { type IArtist } from "@/dual/YPlaylistView";
import type { AlReels } from "@/dual/YSongsTable";
import { Playlist } from "@/utils/api";
import { formatDate_yyyymmdd } from "@/utils/time";
import { Tracks, type ITrack } from "@/utils/tracks";

const playlistDetail = {
  /** 歌单/专辑的ID */
  id: 0,
  /** 名称 */
  name: "",
  /** 译名(专辑) */
  transName: "",
  /** 封面URL */
  cover: "",
  /** 艺术家 */
  artists: [] as IArtist[],
  /** 播放次数 */
  playCount: 0,
  /** 创建时间(歌单)/发行时间(专辑) */
  createTime: "",
  /** 创建者ID(歌单) */
  creatorId: 0,
  /** 创建者名称(歌单) */
  creatorName: "",
  /** 创建者头像(歌单) */
  creatorAvatar: "",
  /** 歌曲数量 */
  trackCount: 0,
  /** 专辑额外信息 */
  alReels: [] as AlReels[],
  /** 歌曲列表 */
  tracks: [] as ITrack[],
};

export const getDefaultPlaylistDetail = () => ({ ...playlistDetail });

export type IPlaylistDetail = typeof playlistDetail;

export async function getPlaylistDetail(id: number): Promise<IPlaylistDetail> {
  let result = { ...playlistDetail };
  await Playlist.getDetail(id).then((res) => {
    if (res.code !== 200) return;
    const { playlist } = res;
    result.id = id;
    result.name = playlist.name;
    result.transName = "";
    result.cover = playlist.coverImgUrl + "?param=160y160";
    result.playCount = playlist.playCount;
    result.createTime = formatDate_yyyymmdd(playlist.createTime);
    result.creatorId = playlist.creator.userId;
    result.creatorName = playlist.creator.nickname;
    result.creatorAvatar = playlist.creator.avatarUrl;
    result.trackCount = playlist.trackCount;
    result.tracks = new Tracks({
      url: "/playlist/detail",
      tracks: playlist.tracks,
    }).tracks;
  });
  return result;
}

export async function getAlbumDetail(id: number): Promise<IPlaylistDetail> {
  let result = { ...playlistDetail };
  await Playlist.getAlbum(id).then((res) => {
    if (!res) return;
    result.id = id;
    result.name = res.album.name;
    result.transName = res.album.transNames
      ? " (" + res.album.transNames + ")"
      : "";
    result.cover = res.album.picUrl;
    result.createTime = formatDate_yyyymmdd(res.album.publishTime);
    result.artists = res.album.artists;
    result.trackCount = res.album.size;
    result.alReels = res.showreels;
    result.tracks = new Tracks({
      url: "/api/album/v3/detail",
      tracks: res.songs,
      params: {
        needIndex: true,
        reels: res.showreels,
      },
    }).tracks;
  });
  return result;
}
