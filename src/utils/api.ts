/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * api.ts 为所有网易云API请求的封装
 * apiClient是为了在不同环境中使用不同的API地址设置的
 * useApi是一个自定义的请求函数，用于请求网易云API
 * 每一个命名空间，都包含了所有相关的请求
 *---------------------------------------------------------------*/

import axios from "axios";
import { ITrack, Tracks } from "@/utils/tracks";
import { IHotSearch, ISearchSuggestion } from "@/dual/YTitlebar";
import { getStorage, StorageKey } from "@/utils/render_storage";
import {
  IComment,
  ILike,
  ILogin,
  IPlaylist,
  ISearch,
  ISong,
  IUser,
} from "@/utils/api.interface";
import { isLocal } from "@/utils/localTracks_renderer";
import { LrcItem, LrcItem2, Lyrics as _Lyrics, YrcItem } from "@/utils/lyric";
import { UserPlaylist } from "@/dual/login";
import { IPlaylist as IPlaylist_ } from "@/dual/YPlaylistList";
import { ProxyConfig } from "@/dual/userProxy.interface";

let proxy: string | undefined = undefined;

export function setProxyUrl(proxyConfig: ProxyConfig) {
  // `none` 表示不使用代理
  if (proxyConfig.mode === "none") {
    proxy = undefined;
    console.log("代理已禁用");
  }
  // 使用 HTTP 代理 / SOCKS 代理（SOCKS4 或 SOCKS5）
  else {
    try {
      // 验证代理的正确性
      proxy = new URL(`${proxyConfig.mode}://${proxyConfig.server}`).toString();
      if (proxyConfig.username && proxyConfig.password)
        proxy = `${proxyConfig.mode}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.server}`;
      console.log(`使用 ${proxyConfig.mode.toUpperCase()} 代理: ${proxy}`);
    } catch (error) {
      console.error("代理服务器地址无效: ", proxyConfig);
    }
  }
}

// 创建 Axios 实例
const apiClient = axios.create({
  // 设置基本请求地址
  baseURL: process.env.VUE_APP_API || "http://localhost:43210",
  // 设置请求超时时间
  timeout: 10000,
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    if (window.electron?.isElectron) {
      // 在 Electron 中直接使用 localhost 地址
      config.baseURL = "http://localhost:43210";
    } else {
      // 在非 Electron 环境中，使用 /api 作为前缀
      if (process.env.VUE_APP_API) {
        // 使用环境变量中的 API 地址
        config.baseURL = process.env.VUE_APP_API;
      } else {
        console.error("请设置环境变量 VUE_APP_API");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 自定义 API 请求函数
/**
 * 使用网易云音乐的API
 * @param {string} relativePath api的相对路径
 */
export async function useApi(
  /** api的相对路径 */
  relativePath: string,
  /** 剩余参数对象 */
  params?: { [key: string]: any }
): Promise<any> {
  try {
    if (proxy) {
      params = params || {};
      params.proxy = proxy;
    }
    const response = await apiClient.get(relativePath, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * 喜欢相关api
 */
export namespace Like {
  /**
   * 设置喜欢
   */
  export async function on(
    /** 歌曲id */
    id: number
  ): Promise<ILike.Response | null> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }
    let result = await useApi("/like", {
      id: id,
      like: true,
      cookie: cookie,
      timestamp: new Date().getTime(),
    }).catch((error) => {
      console.error(`error when set like of ${id}`, error);
      return null;
    });
    return result;
  }

  /**
   * 设置不喜欢
   */
  export async function off(
    /** 歌曲id */
    id: number
  ): Promise<ILike.Response | null> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }

    let result = await useApi("/like", {
      id: id,
      like: false,
      cookie: cookie,
      timestamp: new Date().getTime(),
    }).catch((error) => {
      console.error(`error when set like of ${id}`, error);
      return null;
    });

    return result;
  }

  /**
   * 切换喜欢状态
   */
  export async function toggle(
    /** 歌曲id */
    id: number,
    /** 喜欢状态 */
    status: boolean
  ): Promise<ILike.Response | null> {
    return status ? await off(id) : await on(id);
  }
}

/**
 * 歌单相关api
 */
export namespace Playlist {
  /**
   * 获取某个歌单的信息，这个接口的返回信息量很大，谨慎使用
   */
  export async function getDetail(
    /** 歌单id */
    id: number
  ): Promise<IPlaylist.DetailResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    const params: IPlaylist.DetailParams = { id: id };
    if (cookie && cookie.length > 0) params["cookie"] = cookie;
    let res = await useApi("/playlist/detail", params).catch((error) => {
      console.error("Failed to get playlist detail:", error);
    });
    return res;
  }

  /**
   * 获取某个歌单的全部歌曲
   * @param {number} playlistId 歌单id
   */
  export async function getAllTracks(
    /** 歌单id */
    playlistId: number,
    /** 歌单的歌曲数量，可选 */
    _trackCount?: number
  ) {
    let trackCount = 0;

    // 如果没有传入歌曲数量，获取歌单详情
    if (!_trackCount) {
      console.log("Fetching track count");
      await getDetail(playlistId)
        .then((res) => {
          trackCount = res.playlist.trackCount;
        })
        .catch((error) => {
          console.error("Failed to fetch playlist detail:", error);
        });
    } else {
      trackCount = _trackCount;
    }

    const limit = 1000;
    let pageCount = Math.ceil(trackCount / limit);

    // 请求所有页的歌曲
    let requests = [];
    for (let i = 1; i <= pageCount; i++) {
      requests.push(fetchTracks(playlistId, i, limit));
    }

    let allTracks = await Promise.all(requests).then((values) => {
      return values.flat();
    });
    return allTracks;
  }

  /**
   * 获取某个歌单的第i页的歌曲，默认一页500首
   */
  export async function fetchTracks(
    /** 歌单id */
    playlistId: number,
    /** 页码 */
    page: number,
    /** 每页数量，可选，默认500 */
    limit: number = 500,
    /** 是否刷新，可选，默认false */
    refresh = false
  ) {
    // 计算偏移量
    const offset = (page - 1) * limit;
    // 请求参数
    const params: {
      id: number;
      limit: number;
      offset: number;
      timestamp?: number;
    } = {
      id: playlistId,
      limit: limit,
      offset: offset,
    };

    // 如果需要刷新，添加时间戳
    if (refresh) params["timestamp"] = new Date().getTime();

    let getTracks = await useApi("/playlist/track/all", params).catch(
      (error) => {
        console.log("Failed to fetch tracks:", error);
      }
    );

    // 加入新的属性 originalIndex，用于排序
    return new Tracks({
      url: "/playlist/track/all",
      tracks: getTracks.songs,
      params: {
        needIndex: true,
        page: page,
      },
    }).tracks;
  }

  /**
   * 更新歌单信息
   */
  export async function editPlaylist(
    /** 歌单id */
    id: number,
    /** 歌单名称 */
    name: string,
    /** 歌单描述 */
    desc: string
  ) {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) console.error("No login cookie found");
    await useApi("/playlist/update", {
      id: id,
      name: name,
      desc: desc,
      cookie: cookie,
    });
  }

  /**
   * 添加歌曲到歌单
   */
  export async function addTracks(
    /** 歌单id */
    playlistId: number,
    /** 需要添加的歌曲id数组 */
    ids: number[]
  ): Promise<IPlaylist.AddTracksResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      throw new Error("No login cookie found");
    }

    const res = await useApi("/playlist/tracks", {
      op: "add",
      pid: playlistId,
      tracks: ids.join(","),
      cookie: cookie,
    });

    return res;
  }

  /**
   * 从歌单中删除歌曲，会抛出异常
   */
  export async function removeTracks(
    /** 歌单id */
    playlistId: number,
    /** 需要删除的歌曲id数组 */
    ids: number[]
  ): Promise<{
    /** 200为成功 */
    status: number;
    /** 消息 */
    message?: string;
  }> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      throw new Error("No login cookie found");
    }

    const res = await useApi("/playlist/tracks", {
      op: "del",
      pid: playlistId,
      tracks: ids.join(","),
      cookie: cookie,
    });
    return res;
  }

  /**
   * 删除歌单
   */
  export async function Delete(
    /** 歌单id */
    playlistId: number
  ) {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return;
    }

    const res = await useApi("/playlist/delete", {
      id: playlistId,
      cookie: cookie,
    }).catch((error) => {
      console.error("Failed to delete playlist:", error);
      return error;
    });
    return res;
  }

  /**
   * 创建歌单
   */
  export async function create(
    /** 歌单名称 */
    name: string,
    /** 歌单隐私，0为公开，10为私人 */
    privacy: 10 | 0
  ): Promise<IPlaylist.CreateResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      return { code: 301 };
    }

    const res = await useApi("/playlist/create", {
      name: name,
      privacy: privacy,
      cookie: cookie,
      timestamp: new Date().getTime(),
    });

    return res;
  }

  /**
   * 更新歌单播放量
   */
  export async function updatePlaycount(
    /** 歌单id */
    id: number
  ): Promise<Object | null> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }

    const res = await useApi("/playlist/update/playcount", {
      id: id,
      cookie: cookie,
    }).catch((error) => {
      console.error("Failed to update playlist playcount:", error);
      return null;
    });
    return res;
  }

  /**
   * 获取专辑信息
   */
  export async function getAlbum(
    /** 专辑id */
    id: number
  ): Promise<IPlaylist.AlbumResponse | null> {
    const res = await useApi("/api/album/v3/detail", {
      id: id,
    }).catch((error) => {
      console.error("Failed to get album:", error);
      return null;
    });
    return res;
  }

  /**
   * 收藏/取消收藏专辑
   */
  export async function subAlbum(
    /** 专辑ID */
    id: number,
    /** on为收藏，off为取消收藏 */
    type: "on" | "off"
  ) {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }
    const res = await useApi("/album/sub", {
      t: type === "on" ? 1 : 0,
      cookie: cookie,
      timestamp: new Date().getTime(),
      id: id,
    }).catch((error) => {
      console.error("Failed to sub album:", error);
      return null;
    });
    return res;
  }

  /**
   * 收藏/取消收藏歌单
   */
  export async function subPlaylist(
    /** 歌单ID */
    id: number,
    /** on为收藏，off为取消收藏 */
    type: "on" | "off"
  ) {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }
    const res = await useApi("/playlist/subscribe", {
      t: type === "on" ? 1 : 2,
      cookie: cookie,
      timestamp: new Date().getTime(),
      id: id,
    }).catch((error) => {
      console.error("Failed to sub playlist:", error);
      return null;
    });
    return res;
  }
}

/**
 * 歌曲相关api
 */
export namespace Song {
  /**
   * 获取歌曲的详细信息
   */
  export async function detail(
    /** 歌曲id数组 */
    ids: number[]
  ): Promise<ITrack[]> {
    const res = await useApi("/song/detail", {
      ids: ids.join(","),
    })
      .then((res) => {
        return res.songs;
      })
      .catch((error) => {
        console.error("Failed to get song detail:", error);
        return [];
      });

    return res;
  }

  /**
   * 获取歌曲的某个音质的链接
   */
  export async function getUrl(
    /** 歌曲id */
    id: number,
    /** 音质等级 */
    level: string
  ): Promise<string> {
    const url: string = await useApi("/song/url/v1", {
      id: id,
      level: level,
      cookie: getStorage(StorageKey.LoginCookie) ?? undefined,
    })
      .then((res) => res.data[0].url)
      .catch((err) => {
        console.error("Failed to get URL:", err);
        return "";
      });

    return url;
  }

  /**
   * 获取音质信息
   */
  export async function getQuality(
    id: number,
    quality: string
  ): Promise<ISong.QualityResponse> {
    const res = await useApi("/song/url/v1", {
      id: id,
      level: quality,
      cookie: getStorage(StorageKey.LoginCookie) ?? undefined,
    });

    return {
      gain: res.data[0].gain,
      peak: res.data[0].peak,
      size: res.data[0].size,
    };
  }

  /**
   * 获取音质的完整信息
   */
  export async function getUrlObj(
    id: number,
    level: string
  ): Promise<ISong.UrlObjResponse> {
    const res = await useApi("/song/url/v1", {
      id: id,
      level: level,
      cookie: getStorage(StorageKey.LoginCookie) ?? undefined,
    });

    return res.data[0];
  }

  /** 获取歌曲百科 */
  export async function getWiki(
    /** 歌曲id */
    id: number
  ): Promise<null | ISong.WikiResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("Failed to get song wiki: No login cookie found");
      return null;
    }

    const res = await useApi("/song/wiki/summary", {
      id: id,
      cookie: cookie,
    }).catch((error) => {
      console.error(`Failed to get song wiki of ${id}`, error);
    });
    return res;
  }

  /**
   * 获取歌曲曲谱列表
   */
  export async function getSheets(
    /** 歌曲id */
    id: number
  ): Promise<null | ISong.SheetResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("Failed to get song sheets: No login cookie found");
      return null;
    }

    const res = await useApi("/sheet/list", {
      id: id,
      cookie: cookie,
    });
    return res;
  }

  /**
   * 获取曲谱详情
   */
  export async function getSheetDetail(
    /** 曲谱id */
    id: number
  ): Promise<null | ISong.SheetDetailResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("Failed to get sheet detail: No login cookie found");
      return null;
    }

    const res = await useApi("/sheet/preview", {
      id: id,
      cookie: cookie,
    }).catch((error) => {
      console.error(`Failed to get sheet detail of ${id}`, error);
      return {
        data: null,
      };
    });

    return {
      data: res.data,
    };
  }
}

/**
 * 搜索相关API
 */
export namespace Search {
  /**
   * 从关键词获取搜索建议
   */
  export async function getSearchSuggestion(
    /** 搜索关键词 */
    keyword: string
  ): Promise<ISearchSuggestion[]> {
    // 如果关键词为空，直接返回空数组
    if (keyword === "" || !keyword) {
      console.log("Empty keyword");
      return [];
    }
    interface Ires {
      code: number;
      result: {
        allMatch: ISearchSuggestion[];
      };
    }
    const res: Ires = await useApi("/search/suggest", {
      keywords: keyword,
      type: "mobile",
    }).catch((error) => {
      console.error("Failed to get search suggestion(net):", error);
      return [];
    });

    if (res.code !== 200) {
      console.log("Failed to get search suggestion:", res);
      return [];
    }

    return res.result.allMatch ?? [];
  }

  /**
   * 获取热搜
   */
  export async function getHotSearch(): Promise<IHotSearch[]> {
    const res = await useApi("/search/hot/detail").catch((error) => {
      console.error("Failed to get hot searches:", error);
      return [];
    });

    return res?.result?.hots ?? [];
  }

  /**
   * 搜索歌曲
   */
  export async function songs(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.SongsResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 1,
      limit: limit,
      offset: (page - 1) * limit,
    }).catch((error) => {
      console.error("Failed to search songs:", error);
      return {
        result: {
          songs: [],
          songCount: 0,
        },
      };
    });
    return {
      songs: new Tracks({
        url: "/cloudsearch?type=1",
        tracks: res.result.songs,
      }).tracks,
      songCount: res.result.songCount,
    };
  }

  /**
   * 搜索歌单
   */
  export async function playlists(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.PlaylistsResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 1000,
      limit: limit,
      offset: (page - 1) * limit,
    }).catch((error) => {
      console.error("Failed to search playlists:", error);
      return {
        result: {
          playlists: [],
          playlistCount: 0,
        },
      };
    });
    return {
      playlists: res.result.playlists,
      playlistCount: res.result.playlistCount,
    };
  }

  /**
   * 搜索专辑
   */
  export async function albums(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.AlbumsResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 10,
      limit: limit,
      offset: (page - 1) * limit,
    }).catch((error) => {
      console.error("Failed to search albums:", error);
      return {
        result: {
          albums: [],
          albumCount: 0,
        },
      };
    });

    return {
      albums: res.result.albums,
      albumCount: res.result.albumCount,
    };
  }

  /**
   * 搜索歌手
   */
  export async function artists(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.ArtistsResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 100,
      limit: limit,
      offset: (page - 1) * limit,
    }).catch((error) => {
      console.error("Failed to search artists:", error);
      return {
        result: {
          artists: [],
          artistCount: 0,
        },
      };
    });

    return {
      artists: res.result.artists,
      artistCount: res.result.artistCount,
    };
  }

  /**
   * 搜索带歌词的歌曲
   */
  export async function songsWithLyrics(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.SongsResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 1006,
      offset: (page - 1) * limit,
      limit: limit,
    }).catch((error) => {
      console.error("Failed to search songs with lyrics:", error);
      return {
        result: {
          songs: [],
          songCount: 0,
        },
      };
    });

    return {
      songs: new Tracks({
        url: "/cloudsearch?type=1006",
        tracks: res.result.songs,
      }).tracks,
      songCount: res.result.songCount,
    };
  }

  /**
   * 搜索用户
   */
  export async function users(
    /** 搜索关键词 */
    keyword: string,
    /** 页码，从1开始 */
    page: number = 1,
    /** 每页数量，默认100 */
    limit: number = 100
  ): Promise<ISearch.UsersResponse> {
    const res = await useApi("/cloudsearch", {
      keywords: keyword,
      type: 1002,
      limit: limit,
      offset: (page - 1) * limit,
    }).catch((error) => {
      console.error("Failed to search users:", error);
      return {
        result: {
          userprofiles: [],
          userprofileCount: 0,
        },
      };
    });

    return {
      userprofiles: res.result.userprofiles,
      userprofileCount: res.result.userprofileCount,
    };
  }
}

/**
 * 歌词相关API
 */
export namespace Lyrics {
  /**
   * 获取歌词
   */
  export async function get(
    /** 歌曲id */
    id: number
  ): Promise<Array<LrcItem | YrcItem | LrcItem2>> {
    let lrc: Array<LrcItem | LrcItem2 | YrcItem> = [];

    if (!id || isLocal(id)) return [];

    await useApi("/lyric/new", {
      id: id,
    })
      .then((res) => {
        if (res?.yrc) {
          // 有yrc歌词
          lrc = new _Lyrics({
            type: "yrc",
            data: res.yrc.lyric,
          }).lyrics;
        } else if (res?.lrc) {
          // 有lrc歌词
          lrc = new _Lyrics({
            type: "lrc",
            data: res.lrc.lyric,
          }).lyrics;
        }
      })
      .catch((error) => {
        console.error("Failed to get lyrics:", error);
        return [];
      });

    return lrc;
  }

  export async function getLrcStr(
    /** 歌曲id */
    id: number
  ): Promise<string | null> {
    let lrc: string = "";

    if (!id || isLocal(id)) return null;

    await useApi("/lyric/new", {
      id: id,
    })
      .then((res) => {
        if (res?.lrc) {
          // 有lrc歌词
          lrc = res.lrc.lyric;
        }
      })
      .catch((error) => {
        console.error("Failed to get lyrics:", error);
      });
    return lrc;
  }
}

/**
 * 用户相关API
 */
export namespace User {
  /**
   * 音乐云盘信息
   */
  export async function getCloudInfo(
    params: IUser.CloudParams
  ): Promise<IUser.CloudResponse> {
    let res = await useApi("/user/cloud", params).catch((error) => {
      console.error("Failed to get cloud info:", error);
    });
    return res;
  }

  /**
   * 获取全部云盘歌曲
   */
  export async function getAllCloudTracks(): Promise<IUser.CloudTrack[]> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return [];
    }

    const LIMIT = 1000;

    let cloudInfo = await getCloudInfo({ cookie: cookie });
    let pageCount = Math.ceil(cloudInfo.count / LIMIT);
    let requests = [];
    for (let i = 1; i <= pageCount; i++) {
      requests.push(
        getCloudInfo({ cookie, limit: LIMIT, offset: (i - 1) * LIMIT })
      );
    }

    let allCloudTracks = await Promise.all(requests).then((values) => {
      return values.map((value) => value.data).flat();
    });

    return allCloudTracks;
  }

  /**
   * 获取用户信息
   */
  export async function detail(
    /** 用户id */
    uid: number
  ): Promise<IUser.DetailResponse | null> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }

    const res = await useApi("/user/detail", {
      uid: uid,
      cookie: cookie,
    }).catch((error) => {
      console.error("Failed to get user detail:", error);
      return null;
    });

    return res;
  }

  /**
   * 获取歌手信息
   */
  export async function artistDetail(
    /** 歌手id */
    id: number
  ): Promise<IUser.ArtistDetailResponse | null> {
    const res = await useApi("/artist/detail", {
      id: id,
    }).catch((err) => {
      return null;
    });

    return res?.data?.artist
      ? {
          ...res.data.artist,
          identity: res.data.identify?.imageDesc ?? "",
        }
      : null;
  }

  /**
   * 用户账户信息
   */
  export async function account(): Promise<IUser.AccountResponse | null> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }

    const res = await useApi("/user/account", {
      cookie: cookie,
    });

    return res.profile;
  }

  /**
   * 获取喜欢的音乐
   */
  export async function getLikelist(
    /** 用户id */
    uid: number,
    /** 是否刷新 */
    reload = false
  ): Promise<number[]> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return [];
    }

    const params: {
      uid: number;
      cookie: string;
      timestamp?: number;
    } = {
      uid: uid,
      cookie: cookie,
    };
    // 如果需要刷新，添加时间戳
    if (reload) params["timestamp"] = new Date().getTime();

    const res = await useApi("/likelist", params).catch((error) => {
      console.error("Failed to get likelist:", error);
      return {
        ids: [],
      };
    });

    return res.ids;
  }

  /**
   * 获取用户创建的歌单和收藏的歌单
   */
  export async function getPlaylists(
    /** 用户id */
    uid: number
  ): Promise<UserPlaylist[]> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return [];
    }

    const res = await useApi("/user/playlist", {
      uid: uid,
      cookie: cookie,
      timestamp: new Date().getTime(),
    })
      .then((res: { playlist: UserPlaylist[] }) => res.playlist)
      .catch((error) => {
        console.error("Failed to get user playlists:", error);
        return [];
      });

    return res;
  }

  /**
   * 获取用户订阅的专辑
   */
  export async function getSubAlbums(
    /** 页码 */
    page: number = 1,
    /** 每页数量 */
    limit: number = 100
  ): Promise<IUser.SubAlbumsResponse> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return {
        count: 0,
        albums: [],
      };
    }

    const res = await useApi("/album/sublist", {
      offset: (page - 1) * limit,
      limit: limit,
      timestamp: new Date().getTime(),
      cookie: cookie,
    });

    return {
      count: res.count,
      albums: res.data,
    };
  }

  /**
   * 获取用户的听歌排行
   */
  export async function songsRank(
    /** 用户id */
    uid: number,
    /** 一周的数据或所有时间的数据 */
    type: "week" | "alltime" = "week"
  ): Promise<ITrack[]> {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return [];
    }

    const res = await useApi("/user/record", {
      uid: uid,
      type: type === "week" ? 1 : 0,
      cookie: cookie,
    });
    return new Tracks({
      url: "/user/record",
      tracks: type === "week" ? res.weekData : res.allData,
    }).tracks;
  }

  /**
   * 获取歌手的歌曲
   */
  export async function getArtistSongs(
    /** 歌手id */
    id: number,
    /** 页码 */
    page: number = 1,
    /** 每页数量 */
    SONGS_PER_PAGE: number = 100
  ): Promise<IUser.ArtistSongsResponse> {
    const res = await useApi("/api/v2/artist/songs", {
      id: id,
      limit: SONGS_PER_PAGE,
      offset: (page - 1) * SONGS_PER_PAGE,
    }).catch((error) => {
      console.error("Failed to get artist songs:", error);
      return {
        songs: [],
        total: 0,
      };
    });

    return {
      songs: new Tracks({
        url: "/api/v2/artist/songs",
        tracks: res.songs,
      }).tracks,
      total: res.total,
    };
  }

  /**
   * 获取歌手的专辑
   */
  export async function getArtistAlbums(
    /** 歌手id */
    id: number
  ): Promise<IPlaylist_[]> {
    const res = await useApi("/artist/album", {
      id: id,
      limit: 1900,
    }).catch((err) => {
      console.log("fetch artist albums error:", err);
      return {
        hotAlbums: [],
      };
    });

    return res.hotAlbums.map((album: any) => {
      return {
        ...album,
        _picUrl: album.picUrl + "?param=80y80",
        _bigPicUrl: album.picUrl + "?param=180y180",
      };
    });
  }

  /**
   * 获取歌手的描述
   */
  export async function getArtistDesc(
    /** 歌手id */
    id: number
  ): Promise<
    Array<{
      ti: string;
      txt: string;
    }>
  > {
    const res = await useApi("/artist/desc", { id });

    return res.introduction;
  }
}

/**
 * 评论相关API
 */
export namespace Comment {
  /** 歌曲评论相关api */
  export namespace Song {
    /** 获取评论信息，通常用法为获取某个歌曲的评论数量 */
    export async function info(
      /** 歌曲id */
      id: number,
      /** 评论数量限制，默认为0 */
      limit = 0
    ): Promise<IComment.SongInfoResponse | null> {
      if (!id) {
        console.error("No valid id: ", id);
        return null;
      }

      let res = await useApi("/comment/music", {
        id: id,
        limit: limit,
      }).catch((error) => {
        console.error(`Failed to get song comment of ${id}`, error);
        return null;
      });

      return res;
    }
  }
}

/**
 * 登录相关API
 */
export namespace Login {
  /** 获取二维码key */
  export async function getQrKey(): Promise<string | null> {
    const res = await useApi("/login/qr/key", {
      timestamp: new Date().getTime(),
    }).catch((error) => {
      console.error("Failed to get qr key:", error);
      return null;
    });

    if (res?.data?.unikey) return res.data.unikey;

    return null;
  }

  /** 从二维码key生成图片,返回base64图片 */
  export async function createQrImg(
    /** 二维码key */
    key: string
  ): Promise<string | null> {
    const res = await useApi("/login/qr/create", {
      key: key,
      qrimg: true,
      timestamp: new Date().getTime(),
    }).catch((error) => {
      console.error("Failed to create qr image:", error);
      return null;
    });

    if (res?.data?.qrimg) return res.data.qrimg;

    return null;
  }

  /** 检查二维码状态 */
  export async function checkQrStatus(
    /** 二维码key */
    key: string
  ): Promise<ILogin.CheckQrResponse | null> {
    const res = await useApi("/login/qr/check", {
      key: key,
      timestamp: new Date().getTime(),
    }).catch((error) => {
      console.error("Failed to check qr status:", error);
      return null;
    });

    if (res) return res;

    return null;
  }

  /**
   * 登出
   */
  export async function out() {
    const cookie = getStorage(StorageKey.LoginCookie);
    if (!cookie) {
      console.error("No login cookie found");
      return;
    }

    await useApi("/logout", {
      cookie: cookie,
    }).catch((error) => {
      console.error("Failed to logout:", error);
    });
  }
}
