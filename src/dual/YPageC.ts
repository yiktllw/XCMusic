/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YPageC.ts 为YPage组件配套的处理工具
 *---------------------------------------------------------------*/

export class YPageC {
  _current: number;
  _total: number;
  _onPageChange: null | Function;
  _unknown_page: boolean | undefined;
  _allow_page_increase: boolean = true;
  _requestSequence: number;
  /**
   * 分类类，用于YPage.vue
   * @param {number} totalPage 总页数
   */
  constructor(totalPage: number) {
    this._current = 1;
    this._total = totalPage;
    this._onPageChange = null;
    this._requestSequence = 0;
    if (totalPage === 0) {
      this._unknown_page = true;
      this._allow_page_increase = true;
    }
  }
  get current() {
    return this._current;
  }
  set current(page) {
    const targetPage = Math.floor(Number(page));
    if (!Number.isFinite(targetPage) || targetPage <= 0) return;
    if (!this._unknown_page && targetPage > this.total) return;
    if (
      this._unknown_page &&
      targetPage > this._current &&
      !this._allow_page_increase
    )
      return;
    if (targetPage === this.current) return;

    this._current = targetPage;
    this.emitPageChange("set-current");
  }
  get total() {
    return this._total;
  }
  set total(total) {
    const normalizedTotal = Math.floor(Number(total));
    if (!Number.isFinite(normalizedTotal) || normalizedTotal < 0) return;

    this._total = normalizedTotal;
    this._unknown_page = false;
    if (this._total === 0) {
      this._current = 1;
      return;
    }

    if (this._current > this._total) {
      this._current = this._total;
    }
  }
  get onPageChange() {
    return this._onPageChange;
  }
  set onPageChange(func) {
    if (typeof func !== "function") {
      console.error("onPageChange must be a function");
      return;
    }
    this._onPageChange = func;
  }

  emitPageChange(reason: string) {
    if (this._onPageChange) {
      this._onPageChange({
        current: this._current,
        total: this._total,
        unknown: Boolean(this._unknown_page),
        reason,
      });
    }
  }

  nextRequestId() {
    this._requestSequence += 1;
    return this._requestSequence;
  }

  isLatestRequest(requestId: number) {
    return requestId === this._requestSequence;
  }

  setHasMore(hasMore: boolean) {
    this._unknown_page = true;
    this._allow_page_increase = hasMore;
  }
  get leftPage() {
    if (this._unknown_page) return [];
    if (this._current <= 2) {
      return [1, 2, 3];
    } else if (this._current > 2 && this._current < this._total - 1) {
      return [1];
    } else if (this._current >= this._total - 1) {
      return [1, 2, 3];
    } else {
      return [1];
    }
  }
  get middlePage() {
    if (this._unknown_page) return [];
    if (this._current <= 2) {
      return [];
    } else if (this._current > 2 && this._current < this._total - 1) {
      return [this._current - 1, this._current, this._current + 1];
    } else if (this._current >= this._total - 1) {
      return [];
    } else {
      return [];
    }
  }
  get rightPage() {
    if (this._unknown_page) return [];
    if (this._current <= 2) {
      return [this._total - 2, this._total - 1, this._total];
    } else if (this._current > 2 && this._current < this._total - 1) {
      return [this._total];
    } else if (this._current >= this._total - 1) {
      return [this._total - 2, this._total - 1, this._total];
    } else {
      return [];
    }
  }
  /**
   * 下一页
   */
  next() {
    if (this._unknown_page) {
      if (this._allow_page_increase) {
        this.current = this._current + 1;
      }
      return;
    }
    if (this._current < this._total) {
      this.current = this._current + 1;
    }
  }
  /**
   * 上一页
   */
  previous() {
    if (this._current > 1) {
      this._allow_page_increase = true;
      this.current = this._current - 1;
    }
  }
}
