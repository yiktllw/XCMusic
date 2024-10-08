
export class YPageC {
    /**
     * 分类类，用于YPage.vue
     * @param {number} totalPage 总页数
     */
    constructor(totalPage) {
        this._current = 1;
        this._total = totalPage;
        this._onPageChange = null;
    }
    get current() {
        return this._current;
    }
    set current(page) {
        if (page > 0 && page <= this._total && page !== this._current) {
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
        if (this._current < this._total) {
            this._current++;
            if (this._onPageChange) {
                this._onPageChange();
            }
        }
    }
    /**
     * 上一页
     */
    previous() {
        if (this._current > 1) {
            this._current--;
            if (this._onPageChange) {
                this._onPageChange();
            }
        }
    }
}