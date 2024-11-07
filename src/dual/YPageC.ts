/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YPageC.ts 为YPage组件配套的处理工具
*-----------------------------------------*/

export class YPageC {
    _current: number;
    _total: number;
    _onPageChange: null | Function;
    _unknown_page: boolean | undefined;
    _allow_page_increase: boolean = true;
    /**
     * 分类类，用于YPage.vue
     * @param {number} totalPage 总页数
     */
    constructor(totalPage: number) {
        this._current = 1;
        this._total = totalPage;
        this._onPageChange = null;
        if (totalPage === 0) {
            this._unknown_page = true;
            this._allow_page_increase = true;
        }
    }
    get current() {
        return this._current;
    }
    set current(page) {
        if ((page > 0 && page <= this._total && page !== this._current) || this._unknown_page) {
            this._current = page;
            if (this._onPageChange) {
                this._onPageChange();
            }
        }
    }
    get total() {
        return this._total;
    }
    set total(total) {
        if (total > 0) {
            this._total = total;
        }
    }
    get onPageChange() {
        return this._onPageChange;
    }
    set onPageChange(func) {
        if (typeof func === 'function') {
            this._onPageChange = func;
        }
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
        if ((this._current < this._total || this._unknown_page) && this._allow_page_increase) {
            this._current++;
            if (this._onPageChange) {
                // this._onPageChange();
            }
        }
    }
    /**
     * 上一页
     */
    previous() {
        if (this._current > 1) {
            this._current--;
            this._allow_page_increase = true;
            if (this._onPageChange) {
                // this._onPageChange();
            }
        }
    }
}