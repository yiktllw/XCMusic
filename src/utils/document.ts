/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * document.ts 为所有与文档操作相关的函数
 * 主要用于自定义主题
*-----------------------------------------*/

import { Theme1, Theme2 } from "./theme";

export namespace Doc {
    /**
     * 更新全局Class
     */
    export function updateDocumentClass(data: Array<{
        className: string;
        styleContent: string;
    }>) {
        // 查找或创建一个包含动态样式的 <style> 元素
        let styleElement = document.getElementById("dynamic-styles") as HTMLStyleElement;
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "dynamic-styles";
            document.head.appendChild(styleElement);
        }
        
        styleElement.innerHTML = "";

        data.forEach(({ className, styleContent }) => {
            // 生成类的完整样式
            const ruleContent = `.${className} { ${styleContent.trim()} }`;

            // 直接设置 style 元素的 innerHTML
            styleElement.innerHTML += ruleContent;
        });
    }
    /**
     * 更新全局Class，以setting.display.userCustomThemes为参数
     */
    export function updateDocumentClassBySetting(userCustomThemes: Array<{
        data: Theme1 | Theme2,
        classContent: string,
    }>) {
        const processed = userCustomThemes.map((theme) => {
            return {
                className: `theme-${theme.data.value}`,
                styleContent: theme.classContent,
            };
        });
        updateDocumentClass(processed);
    }
}