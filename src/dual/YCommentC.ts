/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YCommentC.ts 为YComment组件配套的处理工具
 *---------------------------------------------------------------*/

import { useApi } from "@/utils/api";
import { YPageC } from "@/dual/YPageC";
import { isLocal } from "@/utils/localTracks_renderer";
import { IArtist } from "./YPlaylistView";
export type Types = "song" | "playlist" | "album";

/** 在专辑、歌单的评论界面中使用的信息 */
export interface ICommentInfo {
  name: string;
  transName: string;
  cover: string;
  creatorId: number;
  creatorName: string;
  artists: IArtist[];
}

export interface IComment {
  commentId: number;
  time: number;
  user: {
    userId: number;
    nickname: string;
    avatarUrl: string;
  };
  content: string;
  likedCount: number;
}

class YCommentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YCommentError";
  }
}

export class YCommentC {
  _type: Types;
  _id: string | number;
  _commentsTitle: string;
  _comments: IComment[];
  _sortType: string;
  page: YPageC;
  _count: number;
  _onCommentUpdate: Function;
  /**
   *
   * @param {'song'|'playlist'|'album'} type 评论资源的类型
   * @param {number|string} id 评论资源的id
   */
  constructor(type: Types, id: number | string) {
    this._type = "album";
    // 0: song, 2: playlist, 3: album
    this.type = type;
    // id
    this._id = id;
    // 评论标题
    this._commentsTitle = "";
    // 评论列表
    this._comments = [];
    // 排序方式
    this._sortType = "recommend";
    // 分页
    this.page = new YPageC(1);
    // 评论总数
    this._count = 0;
    // 初始化数据
    this.initData(true);
    // 回调函数
    this._onCommentUpdate = () => {};
  }
  /**
   * 初始化评论数据
   * @param {boolean} newPageInstance 是否创建新的分页实例，创建则会重置页码
   */
  async initData(newPageInstance: boolean = false) {
    if (isLocal(this._id)) return;
    await useApi("/comment/new", {
      id: this._id,
      type: this.typeId,
      pageSize: 100,
      pageNo: this.page.current,
      sortType: this.sortTypeId,
      cursor:
        this._comments.length > 0 &&
        this.page.current > 1 &&
        this._sortType === "time"
          ? this._comments[this._comments.length - 1].time
          : null,
    })
      .then((res) => {
        this.handleApiResponse(res, newPageInstance);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  handleApiResponse(res: any, newPageInstance: boolean) {
    this.comments = res.data?.comments;
    this.title = res.data?.commentsTitle;
    this._count = res.data?.totalCount;
    if (newPageInstance) {
      this.page = new YPageC(Math.ceil(res.data?.totalCount / 100) || 1);
      // console.log('new page instance: ', this.page);
    } else {
      this.page.total = Math.ceil(res.data?.totalCount / 100);
    }
    this.page.onPageChange = () => {
      this.initData(false);
    };
  }
  get type() {
    return this._type;
  }
  set type(type: Types) {
    if (type !== "song" && type !== "album" && type !== "playlist") {
      throw new YCommentError(
        "type error: type must be song, album or playlist, but got " + type,
      );
    }
    this._type = type;
  }
  get typeId() {
    if (this._type === "song") {
      return 0;
    } else if (this._type === "album") {
      return 3;
    } else if (this._type === "playlist") {
      return 2;
    } else {
      return -1;
    }
  }
  get sortType() {
    return this._sortType;
  }
  set sortType(sortType) {
    if (sortType !== "recommend" && sortType !== "hot" && sortType !== "time") {
      throw new YCommentError(
        "sortType error: sortType must be recommend or time, but got " +
          sortType,
      );
    }
    if (this._sortType !== sortType) {
      this._sortType = sortType;
      this.initData(true);
      console.log("sortType changed: ", this._sortType);
    }
  }
  get sortTypeId() {
    if (this._sortType === "recommend") {
      return 1;
    } else if (this._sortType === "hot") {
      return 2;
    } else if (this._sortType === "time") {
      return 3;
    } else {
      return -1;
    }
  }
  get comments() {
    return this._comments;
  }
  set comments(comments) {
    if (!(comments instanceof Array)) {
      throw new YCommentError(
        "comments error: comments must be an array, but got " + comments,
      );
    }
    this._comments = comments;
    this.onCommentUpdate();
  }
  get title() {
    return this._commentsTitle;
  }
  set title(commentsTitle) {
    if (typeof commentsTitle !== "string") {
      throw new YCommentError(
        "commentsTitle error: commentsTitle must be a string, but got " +
          commentsTitle,
      );
    }
    this._commentsTitle = commentsTitle;
  }
  get onCommentUpdate() {
    return this._onCommentUpdate;
  }
  set onCommentUpdate(onCommentUpdate) {
    if (typeof onCommentUpdate !== "function") {
      throw new YCommentError(
        "onCommentUpdate error: onCommentUpdate must be a function, but got " +
          onCommentUpdate,
      );
    }
    this._onCommentUpdate = onCommentUpdate;
  }
  get count() {
    return this._count;
  }
}
