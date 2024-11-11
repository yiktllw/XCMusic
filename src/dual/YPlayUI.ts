/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YPlayUI.ts 为YPlayUI组件配套的处理工具
*---------------------------------------------------------------*/

export interface ICreative{
    title: string;
    content: string[];
}

/**
 * song/wiki/summary接口返回的数据
 */
export namespace SongWikiSummary{
    /**
     * song/wiki/summary接口的res.data.blocks[1]的数据
     */
    export interface IWikiSummary{
        creatives: Array<IWikiSummary_Creatives> ;
        uiElement: {
            mainTitle: {
                title: string;
            },
        };
    }
    export interface IWikiSummary_Creatives{
        uiElement?: {
            textLinks: Array<{
                text: string;
            }>,
            mainTitle: {
                title: string;
            },
        };
        resources?: Array<{
            uiElement: {
                mainTitle?: {
                    title: string;
                },
            }
        }>;
    }
    /**
     * song/wiki/summary接口的res.data.blocks[1]的数据
     */
    export interface IFirstListen {
        creatives: Array<{
            resources: Array<{
                resourceExt: {
                    musicFirstListenDto: {
                        season: string;
                        period: string;
                        date: string;
                    },
                    musicTotalPlayDto: {
                        playCount: number;
                        duration: number;
                        text: string;
                    },
                },
                uiElement: {
                    mainTitle: {
                        title: string;
                    },
                },
            }>,
        }>;
        uiElement: {
            mainTitle: {
                title: string;
            },
        };
    }
}

/**
 * sheet/list接口返回的数据
 */
export namespace SheetList {
    export interface ISheet {
        id: number;
        name: string;
        coverImageUrl: string;
    }
}