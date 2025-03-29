/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * api.interface.ts 是 api.ts 的接口定义
 *---------------------------------------------------------------*/

import { type SheetList } from "@/dual/YPlayUI";
import { type ITrack } from "@/utils/tracks";
import { type IPlaylist as IPlaylist_List } from "@/dual/YPlaylistList";
import { type IArtist } from "@/dual/YArtistList";
import { type IArtist as IArtist_ } from "@/dual/YPlaylistView";
import { type ISheet } from "@/dual/YSheetView";

namespace Public {
  export interface IPrivilege {
    /** 歌曲ID */
    id: number;
    /** 未知参数 */
    fee: number;
    /** 是否购买 */
    payed: number;
    /** 未知参数 */
    st: number;
    /** 未知参数 */
    pl: number;
    /** 未知参数 */
    dl: number;
    /** 未知参数 */
    sp: number;
    /** 未知参数 */
    cp: number;
    /** 未知参数 */
    subp: number;
    /** 未知参数 */
    cs: boolean;
    /** 最大比特率 */
    maxbr: number;
    /** 未知参数 */
    fl: number;
    /** 未知参数 */
    toast: boolean;
    /** 未知参数 */
    flag: number;
    /** 未知参数 */
    preSell: number;
    /** 播放最大比特率 */
    playMaxbr: number;
    /** 下载最大比特率 */
    downloadMaxbr: number;
    /** 最大比特率对应的音质 */
    maxBrLevel: string;
    /** 播放最大比特率对应的音质 */
    playMaxBrLevel: string;
    /** 下载最大比特率对应的音质 */
    downloadMaxBrLevel: string;
    /** 未知参数 */
    plLevel: string;
    /** 未知参数 */
    dlLevel: string;
    /** 未知参数 */
    flLevel: string;
    /** 未知参数 */
    rscl: any;
    /** 未知参数 */
    freeTrialPrivilege: {
      /** 未知参数 */
      resConsumable: boolean;
      /** 未知参数 */
      userConsumable: boolean;
      /** 未知参数 */
      listenType: any;
    };
    /** 未知参数 */
    chargeInfoList: any;
  }
}

export namespace ILike {
  export interface Response {
    /** 未知作用 */
    songs: Array<any>;
    /** 200为成功 */
    code: number;
    /** 喜欢的歌单ID */
    playlistId: number;
  }
}

export namespace IPlaylist {
  /** /playlist/detail的参数 */
  export interface DetailParams {
    id: number;
    cookie?: string;
  }

  /** /playlist/detail的返回信息 */
  export interface DetailResponse {
    /** 200为成功 */
    code: number;
    /** 歌单 */
    playlist: {
      /** 歌单ID */
      id: number;
      /** 歌单名称 */
      name: string;
      /** 歌单封面 */
      coverImgUrl: string;
      /** 创建时间，UNIX时间戳 */
      createTime: number;
      /** 创建者 */
      creator: {
        /** 用户ID */
        userId: number;
        /** 用户名 */
        nickname: string;
        /** 用户头像 */
        avatarUrl: string;
      };
      /** 播放次数 */
      playCount: number;
      /** 歌曲的ID */
      trackIds: Array<number>;
      /** 歌单内的歌曲 */
      tracks: Array<ITrack>;
      /** 歌曲数量 */
      trackCount: number;
      /** 用户ID */
      userId: number;
    };
    /** 歌曲权限信息，暂未使用 */
    privileges: Array<Public.IPrivilege>;
  }

  export interface AddTracksResponse {
    /** 200为成功 */
    status: number;
    body: {
      /** 未知参数 */
      code: number;
      /** 信息，若成功则为空字符串 */
      message: string;
    };
  }

  export interface CreateResponse {
    /** 200为成功 */
    code: number;
  }

  export interface AlbumResponse {
    /** 专辑信息 */
    album: {
      /** 专辑名称 */
      name: string;
      /** 专辑译名 */
      transNames: Array<string>;
      /** 专辑封面 */
      picUrl: string;
      /** 发布时间 */
      publishTime: number;
      /** 专辑艺术家 */
      artists: Array<IArtist_>;
      /** 专辑歌曲数量 */
      size: number;
    };
    /** 专辑的歌曲 */
    songs: Array<ITrack>;
    /** 专辑的单曲信息 */
    showreels: Array<any>;
  }
}

export namespace ISearch {
  export interface SongsResponse {
    /** 歌曲数组 */
    songs: Array<ITrack>;
    /** 歌曲数量 */
    songCount: number;
  }

  interface IPlaylist_ extends IPlaylist_List {
    /** 封面URL */
    coverImgUrl: string;
  }

  export interface PlaylistsResponse {
    /** 歌单数组 */
    playlists: Array<IPlaylist_>;
    /** 歌单数量 */
    playlistCount: number;
  }

  interface IAlbum_ extends IPlaylist_List {
    /** 封面URL */
    picUrl: string;
  }

  export interface AlbumsResponse {
    /** 专辑数组 */
    albums: Array<IAlbum_>;
    /** 专辑数量 */
    albumCount: number;
  }

  interface IArtist_ extends IArtist {
    /** 封面URL */
    picUrl: string;
  }

  export interface ArtistsResponse {
    /** 歌手数组 */
    artists: Array<IArtist_>;
    /** 歌手数量 */
    artistCount: number;
  }

  interface IUser_ extends IArtist {
    /** 封面URL */
    avatarUrl: string;
  }

  export interface UsersResponse {
    /** 用户数组 */
    userprofiles: Array<IUser_>;
    /** 用户数量 */
    userprofileCount: number;
  }
}

export namespace IUser {
  /** 云盘信息的参数 */
  export interface CloudParams {
    cookie: string;
    /** 默认30 */
    limit?: number;
    /** 默认0 */
    offset?: number;
  }
  interface IQuality {
    /** 比特率 */
    br: number;
    /** 未知参数 */
    fid: number;
    /** 大小 */
    size: number;
    /** 未知参数 */
    vd: number;
  }

  /** 云盘歌曲简要参数 */
  interface CloudSimpleSong {
    name: string;
    /** 歌曲ID */
    id: number;
    /** 未知参数 */
    pst: number;
    /** 未知参数 */
    t: number;
    /** 歌手 */
    ar: Array<{
      /** 歌手ID */
      id: number;
      /** 歌手名称 */
      name: string | null;
      /** 歌手译名 */
      tns: Array<string>;
      /** 歌手别名 */
      alias: Array<string>;
    }> | null;
    /** 歌曲别名 */
    alia: Array<string>;
    /** 人气 */
    pop: number;
    /** 未知参数 */
    st: number;
    /** 未知参数 */
    rt: number;
    /** 未知参数 */
    fee: number;
    /** 未知参数 */
    v: number;
    /** 未知参数 */
    crbt: any;
    /** 未知参数 */
    cf: any;
    /** 专辑 */
    al: {
      /** 专辑ID */
      id: number;
      /** 专辑名称 */
      name: string | null;
      /** 专辑封面 */
      picUrl: string;
      /** 专辑别名 */
      tns: Array<string>;
      /** 未知参数 */
      pic: number;
    } | null;
    /** 时长 */
    dt: number;
    /** h音质信息 */
    h: IQuality | null;
    /** m音质信息 */
    m: IQuality | null;
    /** l音质信息 */
    l: IQuality | null;
    /** 未知参数 */
    a: null;
    /** 专辑里的cd计数 */
    cd: number | null;
    /** cd里的歌曲数 */
    no: number;
    /** 未知参数 */
    rtUrl: any;
    /** 未知参数 */
    ftype: number;
    /** 未知参数 */
    rtUrls: Array<any>;
    /** 未知参数 */
    djId: number;
    /** 未知参数 */
    copyright: number;
    /** 未知参数 */
    s_id: number;
    /** 未知参数 */
    mark: number;
    /** 未知参数 */
    originCoverType: number;
    /** 未知参数 */
    originSongSimpleData: any;
    /** 未知参数 */
    single: number;
    /** 未知参数 */
    noCopyrightRcmd: any;
    /** 未知参数 */
    rtype: number;
    /** 未知参数 */
    cp: number;
    /** 未知参数 */
    mst: number;
    /** 未知参数 */
    mv: number;
    /** 未知参数 */
    rurl: any;
    /** 发布时间 */
    publishTime: number;
    /** 未知参数 */
    videoInfo: any;
    /** 权限信息 */
    privilege: Public.IPrivilege;
  }

  /** 云盘歌曲 */
  export interface CloudTrack {
    /** 云盘歌曲简要参数  */
    simpleSong: CloudSimpleSong;
    /** 专辑 */
    album: string;
    /** 歌手 */
    artist: string;
    /** 比特率 */
    bitrate: number;
    /** 歌曲ID */
    songId: number;
    /** 歌曲名 */
    songName: string;
    /** 添加到云盘的时间 */
    addTime: number;
    /** 未知用法 */
    cover: number;
    /** 未知用法 */
    coverId: string;
    /** 未知用法 */
    lyricId: string;
    /** 未知用法 */
    version: number;
    /** 文件大小 */
    fileSize: number;
    /** 文件名 */
    fileName: string;
  }

  /** 云盘信息的返回值 */
  export interface CloudResponse {
    data: Array<CloudTrack>;
    /** 云盘歌曲数量 */
    count: number;
    /** 云盘已用容量 */
    size: number;
    /** 云盘总容量 */
    maxSize: number;
    /** 未知参数 */
    upgradeSign: number;
    /** 是否有更多歌曲 */
    hasMore: boolean;
    /** 200为成功 */
    code: number;
  }
  /** 用户详情的返回值 */
  export interface DetailResponse {
    /** 用户信息 */
    profile: {
      /** 用户ID */
      userId: number;
      /** 用户昵称 */
      nickname: string;
      /** 用户头像 */
      avatarUrl: string;
      /** 用户创建的歌单数量 */
      playlistCount: number;
      /** 用户关注 */
      follows: number;
      /** 用户粉丝 */
      followeds: number;
      /** 用户等级 */
      level: number;
    };
    /** 用户等级 */
    level: number;
    /** 用户听歌数量 */
    listenSongs: number;
  }

  /** 歌手详情的返回值 */
  export interface ArtistDetailResponse {
    /** 歌手ID */
    id: number;
    /** 歌手名称 */
    name: string;
    /** 歌手译名 */
    transNames: Array<string>;
    /** 歌手头像 */
    avatar: string;
    /** 歌手身份 */
    identity: string;
    /** 歌手简要描述 */
    briefDesc: string;
    /** 歌手的音乐数量 */
    musicSize: number;
    /** 歌手的专辑数量 */
    albumSize: number;
  }

  /** 用户账户的返回值 */
  export interface AccountResponse {
    /** 用户ID */
    userId: number;
    /** 用户昵称 */
    nickname: string;
    /** 用户头像 */
    avatarUrl: string;
  }

  /** 用户订阅的专辑的返回值 */
  export interface SubAlbumsResponse {
    /** 专辑数量 */
    count: number;
    /** 专辑数组 */
    albums: Array<{
      /** 专辑ID */
      id: number;
      /** 专辑封面 */
      picUrl: string;
      /** 专辑名称 */
      name: string;
      /** 专辑的歌曲数量 */
      size: number;
    }>;
  }

  export interface ArtistSongsResponse {
    /** 歌手的歌曲 */
    songs: Array<ITrack>;
    /** 歌曲数量 */
    total: number;
  }
}

export namespace IComment {
  export interface SongInfoResponse {
    /** 总评论数量 */
    total: number;
    /** 200为成功 */
    code: number;
    /** 未知参数 */
    isMusician: boolean;
    /** 未知参数 */
    cnum: number;
    /** 未知参数 */
    userId: number;
    /** 未知参数 */
    topComments: Array<any>;
    /** 是否有更多热评 */
    moreHot: boolean;
    /** 热评，暂未使用 */
    hotComments: Array<any>;
    /** 未知参数 */
    commentBanner: any;
    /** 评论 */
    comments: Array<any>;
    /** 是否有更多评论 */
    more: boolean;
  }
}

export namespace ISong {
  export interface QualityResponse {
    size: number;
    gain: number;
    peak: number;
  }

  export interface UrlObjResponse extends QualityResponse {
    url: string;
  }

  interface IBaseUIElement {
    /** 主标题 */
    mainTitle: {
      /** 标题 */
      title: string;
      /** 未知参数 */
      titleImgId: any;
      /** 未知参数 */
      titleImgUrl: any;
      /** 未知参数 */
      action: any;
    };
    /** 副标题 */
    subTitles: Array<{
      /** 副标题 */
      title: string;
      /** 未知参数 */
      titleImgId: any;
      /** 未知参数 */
      titleImgUrl: any;
      /** 未知参数 */
      action: any;
    }> | null;
    images: Array<{
      /** 未知参数 */
      tag: any;
      /** 图片标题 */
      title: string | null;
      /** 未知参数 */
      superscript: any;
      /** 未知参数 */
      imageId: number;
      /** 图片URL */
      imageUrl: string;
      /** 未知参数 */
      imageWithoutTextUrl: any;
      /** 未知参数 */
      md5: any;
      /** 未知参数 */
      width: number;
      /** 未知参数 */
      height: number;
      /** 未知参数 */
      action: any;
    }> | null;
    /** 未知参数 */
    labels: any;
    /** 未知参数 */
    textLinks: null | Array<{
      /** 未知参数 */
      tag: null;
      /** 未知参数 */
      text: string;
      /** 未知参数 */
      url: string;
    }>;
    /** 未知参数 */
    descriptions: any;
    /** 未知参数 */
    icons: any;
    /** 未知参数 */
    buttons: any;
    /** 未知参数 */
    videos: any;
    /** 未知参数 */
    superscript: any;
    /** 未知参数 */
    type: any;
    /** 未知参数 */
    coverTagV0: any;
    /** 未知参数 */
    colorList: any;
  }
  export interface WikiResponse {
    /** 200为成功 */
    code: number;
    /** 百科数据 */
    data: {
      /** 未知参数 */
      cursor: string;
      /** 区块 */
      blocks: Array<{
        /** ui元素 */
        uiElement: IBaseUIElement;
        /**
         *
         */
        creatives: Array<{
          /** 未知参数 */
          id: any;
          /** 未知参数 */
          blockId: any;
          /** 未知参数 */
          creativeId: any;
          /** 未知参数 */
          creativeType: string;
          /** 未知参数 */
          position: any;
          /** 未知参数 */
          action: any;
          /**
           *
           */
          uiElement: null | IBaseUIElement;
          /** 未知参数 */
          adInfo: any;
          /** 未知参数 */
          code: any;
          /** 未知参数 */
          resources: Array<{
            /** 未知参数 */
            resourceType: any;
            /** 未知参数 */
            resourceId: any;
            /** 未知参数 */
            resourceUrl: any;
            /** 未知参数 */
            resourceExtInfo: any;
            /**
             *
             */
            resourceExt: Array<{
              /** 未知参数 */
              specialType: number;
              /** 未知参数 */
              musicMemoryTextType?: number;
              /** 未知参数 */
              musicFirstListenDto?: {
                /** 第一次听的时间，是UNIX时间戳 */
                timestamp: number;
                /** 第一次听的季节，如“初秋” */
                season: string;
                /** 第一次听的时间段，如“深夜” */
                period: string;
                /** 第一次听的日期，如“2025.03.21 03:21” */
                date: string;
                /** 未知参数 */
                subTitle: any;
                /** 未知参数 */
                desc: any;
              };
              musicTotalPlayDto?: {
                /** 总播放次数 */
                playCount: number;
                /** 总播放时长，分钟 */
                duration: number;
                /** 说明性文字 */
                text: string;
                /** 未知参数 */
                subTitle: any;
                /** 未知参数 */
                desc: any;
              };
            }> | null;
            /** 未知参数 */
            resourcePolicyId: any;
            /** 未知参数 */
            action: any;
            /** ui元素 */
            uiElement: IBaseUIElement;
            /** 未知参数 */
            valid: boolean;
            /** 未知参数 */
            alg: any;
            /** 未知参数 */
            scm: any;
            /** 未知参数 */
            visibleStatus: any;
          }>;
        }>;
        /** 未知参数 */
        showType: string;
        /** 未知参数 */
        alg: string;
        /** 未知参数 */
        scm: string;
        /** 未知参数 */
        id: string;
        /** 未知参数 */
        adInfo: any;
        /** 未知参数 */
        extInfo: any;
        /** 未知参数 */
        position: number;
        /** 未知参数 */
        md5: string;
        /** 未知参数 */
        channel: string;
        /** 未知参数 */
        code: string;
        /** 未知参数 */
        canRefresh: boolean;
        /** 未知参数 */
        visibleStatus: any;
        /** 未知参数 */
        blockConfig: any;
        /** 未知参数 */
        blockCursor: string;
        /** 是否有更多 */
        hasMore: boolean;
        /** 未知参数 */
        blockParam: any;
        /** 未知参数 */
        crossPlatformConfig: any;
        /** 未知参数 */
        hideTitle: boolean;
        /** 未知参数 */
        opRcmd: number;
      }>;
      /** 是否有更多 */
      hasMore: boolean;
      /** 未知参数 */
      pageConfig: any;
      /** 未知参数 */
      pageCodeContext: any;
    };
    /** 未知参数 */
    message: string;
  }

  export interface SheetResponse {
    /** 200为成功 */
    code: number;
    data: {
      musicSheetSimpleInfoVOS?: SheetList.ISheet[];
    };
  }

  export interface SheetDetailResponse {
    data: ISheet[];
  }
}

export namespace ILogin {
  export interface CheckQrResponse {
    /** 803为登录成功 */
    code: number;
    cookie: string;
  }
}

export namespace ILyrics {
  export interface OriginalResponse {
    type: "lrc" | "yrc";
    data: string;
  }
}
