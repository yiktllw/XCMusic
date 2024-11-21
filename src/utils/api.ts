/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * api.ts 为所有网易云API请求的封装
 * apiClient是为了在不同环境中使用不同的API地址设置的
 * useApi是一个自定义的请求函数，用于请求网易云API
 * playlist是一个命名空间，包含了所有与歌单相关的请求
 * 待优化: 所有的api请求都应当在这里进行封装
 * 比如歌单相关api应当在playlist命名空间中
 *---------------------------------------------------------------*/

import axios from "axios";
import { Tracks } from "@/utils/tracks";
import { IHotSearch, ISearchSuggestion } from "@/dual/YTitlebar";
import { getStorage } from "@/utils/render_storage";
import {
  IComment,
  ILike,
  ILogin,
  IPlaylist,
  ISong,
  IUser,
} from "@/utils/api.interface";
import { isLocal } from "@/utils/localTracks_renderer";
import { LrcItem, LrcItem2, Lyrics as _Lyrics, YrcItem } from "@/utils/lyric";

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API || "http://localhost:43210", // 设置基本请求地址
  timeout: 10000, // 设置请求超时时间
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
        config.baseURL = process.env.VUE_APP_API; // 使用环境变量中的 API 地址
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
 * @param {Object} params 剩余参数对象
 * @returns {Promise<any>} 返回一个Promise对象
 */
export async function useApi(
  relativePath: string,
  params?: Object
): Promise<any> {
  try {
    const response = await apiClient.get(relativePath, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/** 喜欢、不喜欢歌曲的api */
export namespace Like {
  /** 设置喜欢 */
  export async function on(id: number): Promise<ILike.Response | null> {
    const cookie = getStorage("login_cookie");
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }
    let result = await useApi("/like", {
      id: id,
      like: true,
      cookie: cookie,
    }).catch((error) => {
      console.error(`error when set like of ${id}`, error);
      return null;
    });
    return result;
  }
  /** 设置不喜欢 */
  export async function off(id: number): Promise<ILike.Response | null> {
    const cookie = getStorage("login_cookie");
    if (!cookie) {
      console.error("No login cookie found");
      return null;
    }
    let result = await useApi("/like", {
      id: id,
      like: false,
      cookie: cookie,
    }).catch((error) => {
      console.error(`error when set like of ${id}`, error);
      return null;
    });
    return result;
  }
  /** 切换喜欢的状态 */
  export async function toggle(
    id: number,
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
    id: number
  ): Promise<IPlaylist.DetailResponse> {
    const cookie = getStorage("login_cookie");
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
  export async function getAllTracks(playlistId: number, _trackCount?: number) {
    let trackCount = 0;
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
   * @param {number} playlistId 歌单id
   * @param {number} page 页码
   * @param {number} limit 每页数量，默认500
   */
  export async function fetchTracks(
    playlistId: number,
    page: number,
    limit: number = 500
  ) {
    let offset = (page - 1) * limit;
    let getTracks = await useApi("/playlist/track/all", {
      id: playlistId,
      limit: limit,
      offset: offset,
    }).catch((error) => {
      console.log("Failed to fetch tracks:", error);
    });
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
   * @param id 歌单id
   * @param name 歌单名称
   * @param desc 歌单描述
   */
  export async function editPlaylist(id: number, name: string, desc: string) {
    const cookie = getStorage("login_cookie");
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
    playlistId: number,
    ids: number[]
  ): Promise<IPlaylist.AddTracksResponse> {
    const cookie = getStorage("login_cookie");
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
   * 创建歌单
   */
  export async function create(
    name: string,
    privacy: 10 | 0
  ): Promise<IPlaylist.CreateResponse> {
    const cookie = getStorage("login_cookie");
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
}

/**
 * 歌曲相关api
 */
export namespace Song {
  /**
   * 获取歌曲的某个音质的链接
   */
  export async function getUrl(id: number, level: string): Promise<string> {
    const url: string = await useApi("/song/url/v1", {
      id: id,
      level: level,
      cookie: getStorage("login_cookie") ?? undefined,
    })
      .then((res) => res.data[0].url)
      .catch((err) => {
        console.error("Failed to get URL:", err);
        return "";
      });
    return url;
  }

  /** 获取歌曲百科 */
  export async function getWiki(
    id: number
  ): Promise<null | ISong.WikiResponse> {
    const cookie = getStorage("login_cookie");
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

  /** 获取歌曲曲谱列表 */
  export async function getSheets(
    id: number
  ): Promise<null | ISong.SheetResponse> {
    const cookie = getStorage("login_cookie");
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
}

/**
 * 搜索相关API
 */
export namespace Search {
  /** 从关键词获取搜索建议 */
  export async function getSearchSuggestion(
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
  /** 获取热搜榜 */
  export async function getHotSearch(): Promise<IHotSearch[]> {
    const res = await useApi("/search/hot/detail").catch((error) => {
      console.error("Failed to get hot searches:", error);
      return [];
    });
    return res?.result?.hots ?? [];
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
    id: number
  ): Promise<Array<LrcItem | YrcItem | LrcItem2>> {
    let lrc: Array<LrcItem | LrcItem2 | YrcItem> = [];
    if (!id || isLocal(id)) return [];
    await useApi("/lyric/new", {
      id: id,
    })
      .then((res) => {
        if (res?.yrc) {
          lrc = new _Lyrics({
            type: "yrc",
            data: res.yrc.lyric,
          }).lyrics;
        } else if (res?.lrc) {
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
   * 获取用户信息
   */
  export async function detail(
    uid: number
  ): Promise<IUser.DetailResponse | null> {
    const cookie = getStorage("login_cookie");
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
}

/**
 * 评论相关API
 */
export namespace Comment {
  /** 歌曲评论相关api */
  export namespace Song {
    /** 获取评论信息，通常用法为获取某个歌曲的评论数量 */
    export async function info(
      id: number,
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
  export async function createQrImg(key: string): Promise<string | null> {
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
}
