/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * color.ts 颜色工具
 * 已删除旧的背景颜色设置函数（由 fluidBackground.ts 替代）
 *---------------------------------------------------------------*/

import { themes } from "@/utils/theme";
import type { Theme1, Theme2 } from "@/utils/theme";
import { getStorage, StorageKey } from "@/utils/render_storage";

type COLOR = {
  r: number;
  g: number;
  b: number;
};

export const darkThemeColors = [
  "#056706", // YColor.getColorFromThreeLetters('Amadeus'),
  "#081c30", // YColor.getColorFromThreeLetters('BeHappy'),
  "#1d2932",
  "#301c5d", // YColor.getColorFromThreeLetters('Hello'),
  "#3c4871",
  "#405772",
  "#425d72",
  "#435f2f",
  "#486f63",
  "#4b3c71",
  "#4d6e45",
  "#576f46",
  "#583d71",
  "#5c6f45",
  "#5d3d71",
  "#5e6f45",
  "#6e4455",
  "#673e71",
  "#693c4b",
  "#6a3d60",
  "#6a423f",
  "#6d5a42",
  "#6e6544",
  "#6f6845",
  "#707046",
];

export namespace YColor {
  /**
   * 查询值对应的主题
   * @param {string} themeValue 主题值
   * @returns {Object} 主题对象: { value: string, display: string, type?: string, background?: string }
   */
  export function findTheme(themeValue: string): Theme1 | Theme2 {
    var res = themes.find((theme) => theme.value === themeValue);
    if (!res) {
      const userCustomThemes: Array<{
        data: Theme1 | Theme2;
        classContent: string;
      }> = getStorage(StorageKey.Setting_Display_UserCustomThemes) ?? [];
      let _res = userCustomThemes.find(
        (theme) => theme.data.value === themeValue,
      );
      if (!_res) {
        throw new Error(
          `THEME NOT FOUND. \nrequire: ${JSON.stringify(themeValue, null, 2)} \nuserCustomThemes: ${JSON.stringify(userCustomThemes, null, 2)}`,
        );
      }
      res = _res?.data;
    }
    if (!res) throw new Error("theme not found");
    return res;
  }

  /**
   * 将HEX颜色转换为RGB颜色，返回一个对象
   * @param {string} hex hex颜色值
   * @returns {COLOR} 对象: { r: number, g: number, b: number }
   */
  export function hexToRgb(hex: string): COLOR {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  /**
   * 将RGB颜色转换为HEX颜色
   * @param {number} r 红色值
   * @param {number} g 绿色值
   * @param {number} b 蓝色值
   * @returns HEX颜色值
   */
  export function rgbToHex(r: number, g: number, b: number) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * 将暗色转化为亮色
   * @param {string} hex HEX颜色值
   * @returns {string} HEX颜色值
   */
  export function getLightThemeColor(
    hex: string,
    background = "#FFFFFF",
  ): string | null {
    const rgb = YColor.hexToRgb(hex);
    if (!rgb) return null;

    const backgroundColor = YColor.hexToRgb(background);
    const ratio = 0.8;
    const maxSaturation = 30;
    const closerColor = {
      r: Math.max(
        Math.round(rgb.r + (backgroundColor.r - rgb.r) * ratio),
        backgroundColor.r - maxSaturation,
      ),
      g: Math.max(
        Math.round(rgb.g + (backgroundColor.g - rgb.g) * ratio),
        backgroundColor.g - maxSaturation,
      ),
      b: Math.max(
        Math.round(rgb.b + (backgroundColor.b - rgb.b) * ratio),
        backgroundColor.b - maxSaturation,
      ),
    };

    return YColor.rgbToHex(closerColor.r, closerColor.g, closerColor.b);
  }

  /**
   * 从字符串中获取HEX颜色
   * @param str 任意字符串
   * @returns HEX颜色值
   */
  export function stringToHexColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const r = (hash >> 16) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = hash & 0xff;

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * 从三个字母中获取HEX颜色
   */
  export function getColorFromThreeLetters(letters: string): string {
    if (letters.length < 3) {
      return "#FFFFFF";
    }
    const i1 = letters.toLocaleLowerCase().charCodeAt(0) - 97;
    const i2 = letters.toLocaleLowerCase().charCodeAt(1) - 97;
    const i3 = letters.toLocaleLowerCase().charCodeAt(2) - 97;
    const group = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
      71, 73, 79, 83, 89, 97, 101,
    ];
    const r = Math.ceil(group[i1] * 2.5);
    const g = Math.ceil(group[i2] * 2.5);
    const b = Math.ceil(group[i3] * 2.5);
    return YColor.rgbToHex(r, g, b);
  }

  export function isHexColor(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/i.test(hex);
  }
}

export function hexToRgb(hex: string): COLOR {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// 类型定义保留供外部引用
export type { COLOR };
