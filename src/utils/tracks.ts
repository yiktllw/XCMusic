/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * tracks.ts 为处理歌曲列表的工具
 * 需要使用时，将从api获取的歌曲列表和对应参数传入Tracks类中
 * Tracks类会将歌曲列表处理成统一的格式
 *---------------------------------------------------------------*/

import { useApi } from "./api";
function generateUniqueString(address: string): string {
  const crypto = window.api?.crypto;
  if (!crypto) {
    return address
      .replace(/\//, "_yikt_") // 替换开头的 '/' 为 '_yikt_'
      .replace(/\s/g, "_space_") // 替换空格
      .replace(/[^\w-._]/g, "_other_")
      .replace(/\./g, "_");
  }
  return crypto(address);
}

export interface ITrack {
  id: number; // 歌曲 id，唯一标识
  name: string; // 歌曲名
  tns: string; // 歌曲别名
  al: {
    // 专辑信息
    id: number; // 专辑 id，唯一标识
    name: string; // 专辑名
    picUrl: string; // 专辑封面
    tns: string; // 专辑别名
  };
  ar: Array<{
    // 歌手信息
    id: number; // 歌手 id，唯一标识
    name: string; // 歌手名
    tns: string; // 歌手别名
  }>;
  _picUrl: string | null; // 专辑封面地址
  cd: number; // 专辑序号
  no: number; // 专辑内歌曲序号
  reelName: string | null; // 专辑内歌曲简称
  reelIndex: number; // 专辑内歌曲reel序号
  songInReelIndex: number;
  dt: number; // 歌曲时长
  pop: number; // 歌曲流行度, 0-100的整数
  playCount: number; // 歌曲播放次数
  lyrics: Array<string>; // 歌词
  h: any; // higher信息
  l: any; // standard信息
  sq: any; // lossless信息
  hr: any; // hi-res信息
  jyeffect: any; // 高清环绕声信息
  sky: any; // 沉浸环绕声信息
  jymaster: any; // 超清母带信息
  originalIndex: number; // 原始序号, 用于歌单内歌曲排序
  local: boolean; // 是否为本地歌曲
  localPath: string; // 本地歌曲路径
}

export class Tracks {
  _tracks: Array<ITrack>;
  /**
   * 初始化歌曲列表
   * @param {object} params 参数
   * @param {string} params.url 请求地址
   * @param {Array} params.tracks 歌曲列表
   * @param {object} params.params 额外参数
   */
  constructor({
    url,
    tracks,
    params,
  }: {
    url: string;
    tracks: Array<any>;
    params?: any;
  }) {
    this._tracks = tracks.map((item, index): ITrack => {
      let resultTrack: ITrack = {
        id: 0,
        name: "",
        tns: "",
        al: {
          id: 0,
          name: "",
          picUrl: "",
          tns: "",
        },
        ar: [
          {
            id: 0,
            name: "",
            tns: "",
          },
        ],
        _picUrl: "",
        cd: 1,
        no: 1,
        reelName: null,
        reelIndex: 0,
        songInReelIndex: 0,
        dt: 0,
        pop: 0,
        playCount: 0,
        lyrics: [""],
        h: null,
        l: null,
        sq: null,
        hr: null,
        jyeffect: null,
        sky: null,
        jymaster: null,
        originalIndex: 0,
        local: false,
        localPath: "",
      };
      if (item !== null) {
        let track: any = null;
        if (url === "/user/record") {
          track = item.song;
        } else if (
          url === "/cloudsearch?type=1" ||
          url === "/cloudsearch?type=1006"
        ) {
          track = item;
        } else if (url === "/artist/songs") {
          track = item;
          let index = params.albums.findIndex(
            (album: { id: number }) => album.id === track.al.id,
          );
          if (index === -1) {
            track.al.picUrl = require("@/assets/song.svg");
          } else {
            track.al.picUrl = params.albums[index].picUrl;
          }
        } else if (url === "/api/v2/artist/songs") {
          track = item;
          track.tns = track.transNames;
          track.al = {
            id: track.album.id,
            name: track.album.name,
            picUrl: track.album.picUrl,
            tns: "",
          };
          track.ar = track.artists.map((ar: { id: number; name: string }) => {
            return {
              id: ar.id,
              name: ar.name,
              tns: "",
            };
          });
          track.pop = track.popularity;
          track.dt = track.duration;
        } else if (url === "/api/album/v3/detail") {
          track = item;
          track.cd = parseInt(track.cd);
          if (params.needIndex) {
            resultTrack = {
              ...resultTrack,
              originalIndex: params.page
                ? (params.page - 1) * 500 + index
                : index,
            };
          }
          if (params.reels) {
            interface IReel {
              songList: Array<{
                songId: number;
                song: Object;
                songName: string;
                songIndex: number;
              }>;
            }
            params.reels.forEach((reel: IReel, reelIndex: number) => {
              reel.songList.forEach((song, songIndex) => {
                if (song.songId == track.id) {
                  track.reelName = song.songName;
                  resultTrack.reelIndex = reelIndex;
                  resultTrack.songInReelIndex = songIndex;
                }
              });
            });
          }
        } else if (url === "/playlist/track/all" || url === "/album") {
          track = item;
          if (params.needIndex) {
            resultTrack = {
              ...resultTrack,
              originalIndex: params.page
                ? (params.page - 1) * 500 + index
                : index,
            };
          }
          if (url === "/album" && params.alPicUrl) {
            track.al.picUrl = params.alPicUrl;
          }
        } else if (url === "local") {
          const path = item.path.replace(/\\/g, "/");
          const validId = generateUniqueString(path);
          track = {
            id: validId,
            name: item.name,
            al: {
              id: validId,
              name: item.album,
              picUrl: "/src/assets/song.svg",
            },
            ar: [
              {
                id: validId,
                name: item.artist,
              },
            ],
            dt: Math.ceil(item.duration * 1000),
            pop: 0,
            localPath: item.path,
          };
        }
        resultTrack.id = track.id;
        resultTrack.name = track.name;
        resultTrack.tns = track.tns ?? "";
        resultTrack.al.id = track.al.id;
        resultTrack.al.name = track.al.name;
        resultTrack.al.picUrl = track.al.picUrl;
        resultTrack.al.tns = track.al.tns ?? "";
        if (url !== "local") {
          resultTrack._picUrl = track.al.picUrl + "?param=80y80";
        } else {
          resultTrack._picUrl = track.al.picUrl;
        }
        resultTrack.cd = track.cd ?? 1;
        resultTrack.no = track.no ?? 1;
        resultTrack.ar = track.ar.map(
          (ar: { id: number; name: string; tns: string }) => {
            return {
              id: ar.id,
              name: ar.name,
              tns: ar.tns ?? "",
            };
          },
        );
        resultTrack.dt = track.dt;
        resultTrack.pop = track.pop;
        resultTrack.h = track.h ? { size: track.h.size } : null;
        resultTrack.l = track.l ? { size: track.l.size } : null;
        resultTrack.sq = track.sq ? { size: track.sq.size } : null;
        resultTrack.hr = track.hr ? { size: track.hr.size } : null;
        if (url === "/cloudsearch?type=1006") {
          resultTrack.lyrics = track.lyrics;
        } else if (url === "/user/record") {
          resultTrack.playCount = item.playCount;
        } else if (url === "local") {
          resultTrack.local = true;
        }
        resultTrack.reelName = track.reelName ?? null;
        resultTrack.localPath = track.localPath ?? "";
      }

      return resultTrack;
    });
  }
  get tracks() {
    return this._tracks;
  }
}

export class TrackIds {
  _ids: Array<number>;
  result: ITrack[] = [];
  constructor(ids: Array<number>) {
    this._ids = ids;
  }
  async initData() {
    if (this._ids.length === 0) {
      return;
    }
    await useApi("/song/detail", {
      ids: this._ids.join(","),
    })
      .then((res) => {
        this.result = res.songs.map((item: { al: { picUrl: string } }) => {
          return {
            ...item,
            _picUrl: item.al.picUrl + "?param=80y80",
          };
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  get tracks() {
    return this.result;
  }
}

export class Track {
  _track: object;
  _url: string;
  _params: object;
  /**
   * 初始化歌曲信息
   * @param {object} params 参数
   * @param {string} params.url 请求地址
   * @param {object} params.track 歌曲信息
   * @param {object} params.params 额外参数
   */
  constructor({
    url = "/playlist/tracks/all",
    track = {},
    params = {
      type: "local",
      path: "C:/",
    },
  }: {
    url: string;
    track: object;
    params: any;
  }) {
    this._track = track;
    this._url = url;
    this._params = params;
    if (params.type === "local") {
      //
    }
  }
  get track() {
    return this._track;
  }
}
