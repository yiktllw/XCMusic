/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YTitlebar.ts 为YTitlebar组件配套的处理工具
 *---------------------------------------------------------------*/

export interface ISearchSuggestion {
  keyword: string;
  type: number;
  alg: string;
  lastKeyword: string;
}

export interface IHotSearch {
  first: string;
}
