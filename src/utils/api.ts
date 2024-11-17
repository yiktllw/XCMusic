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
import { ISearchSuggestion } from "@/dual/YTitlebar";
import { getStorage } from "@/utils/render_storage";
import { IPlaylist } from "@/utils/api.interface";
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

/**
 * 设置喜欢/不喜欢
 * @param {number} id 歌曲id
 * @param {*} like 是否喜欢
 * @param {*} cookie 登录cookie
 * @returns
 */
export async function setLike(
  id: number | string,
  like: boolean,
  cookie: string
) {
  let result = await useApi("/like", {
    id: id,
    like: like,
    cookie: cookie,
  }).catch((error) => {
    console.error("use api error: a", error);
    throw error;
  });
  return result;
}

/**
 * 切换喜欢状态
 * @param {number} id 歌曲id
 * @param {*} status 当前状态
 */
export async function toogleLike(id: number | string, status: boolean) {
  if (status) {
    await setLike(id, false, getStorage("login_cookie") ?? "");
  } else {
    await setLike(id, true, getStorage("login_cookie") ?? "");
  }
}

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
}

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
}

/**
 * 歌单相关API
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
      });
    return lrc;
  }
}
