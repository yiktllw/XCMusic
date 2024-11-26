/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * color.ts主要为背景颜色相关内容
 * darkThemeColors为暗色主题对应的部分内容色_
 * _用于在内容改变时，设置内容色到背景色的渐变
 * YColor命名空间为一些颜色相关的，包装较完善的函数
 * 其它导出的函数为兼容旧代码，待优化
 *---------------------------------------------------------------*/

import Color from "color";
import { Theme1, Theme2, themes } from "@/utils/theme";
import { getStorage } from "@/utils/render_storage";

type COLOR = {
  r: number;
  g: number;
  b: number;
};

type COLOR_THEME_TYPE = "dark" | "light";

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
      }> = getStorage("setting.display.userCustomThemes") ?? "[]";
      let _res = userCustomThemes.find(
        (theme) => theme.data.value === themeValue
      );
      if (!_res) {
        throw new Error(
          `THEME NOT FOUND. \nrequire: ${themeValue} \nuserCustomThemes: ${JSON.stringify(userCustomThemes, null, 2)}`
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
    background = "#FFFFFF"
  ): string | null {
    const rgb = YColor.hexToRgb(hex);
    if (!rgb) return null; // 如果 HEX 格式不正确，则返回 null

    // 背景的 RGB 值
    const backgroundColor = YColor.hexToRgb(background);

    // 计算与背景之间的折中颜色
    /** 得到新颜色的比例 */
    const ratio = 0.8;
    /** 新颜色的与背景色的最大偏差 */
    const maxSaturation = 30;
    const closerColor = {
      r: Math.max(
        Math.round(rgb.r + (backgroundColor.r - rgb.r) * ratio),
        backgroundColor.r - maxSaturation
      ),
      g: Math.max(
        Math.round(rgb.g + (backgroundColor.g - rgb.g) * ratio),
        backgroundColor.g - maxSaturation
      ),
      b: Math.max(
        Math.round(rgb.b + (backgroundColor.b - rgb.b) * ratio),
        backgroundColor.b - maxSaturation
      ),
    };

    // 将 RGB 转换回 HEX 格式
    return YColor.rgbToHex(closerColor.r, closerColor.g, closerColor.b);
  }

  /**
   * 从字符串中获取HEX颜色
   * @param str 任意字符串
   * @returns HEX颜色值
   */
  export function stringToHexColor(str: string): string {
    // Step 1: 将字符串转换成数值哈希
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Step 2: 将哈希值分为 R, G, B
    const r = (hash >> 16) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = hash & 0xff;

    // Step 3: 转换成Hex格式
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * 从图片中获取颜色,并根据主题类型设置背景颜色
   * @param {string} imgSrc 图片地址
   * @param {Document} document Document 对象
   * @param {COLOR_THEME_TYPE} colorThemeType 颜色主题类型，'dark' 或 'light'
   * @param {string} themeBackground 主题的背景颜色，HEX，默认为 '#131319'
   */
  export function setBkColorFromImg(
    imgSrc: string,
    document: Document,
    colorThemeType: COLOR_THEME_TYPE | undefined,
    themeBackground: string = "#131319",
    nullColorCallback?: () => void
  ) {
    getColorFromImg(imgSrc, document).then((color) => {
      if (color) {
        if (colorThemeType === "dark") {
          // 暗色主题
          setBackgroundColor(color);
        } else if (colorThemeType === "light") {
          // 亮色主题
          let lightColor = YColor.getLightThemeColor(
            YColor.rgbToHex(color.r, color.g, color.b)
          );
          setBackgroundColor(YColor.hexToRgb(lightColor ?? "#FFFFFF"));
        } else {
          // 其他主题，对应colorThemeType为Undefined
          const DOM = document.querySelector("#mainContainer");
          if (!DOM) return;
          const themeColorHEX = YColor.getLightThemeColor(
            YColor.rgbToHex(color.r, color.g, color.b),
            themeBackground
          );
          const themeColorRGB = YColor.hexToRgb(themeColorHEX ?? "#FFFFFF");
          (DOM as HTMLElement).style.background =
            `linear-gradient(180deg, rgb(${themeColorRGB.r}, ${themeColorRGB.g}, ${themeColorRGB.b}) 0%,  var(--background-color) 500px, var(--background-color) 100%)`;
        }
      } else {
        if (nullColorCallback) nullColorCallback();
        else setBackgroundColorTheme();
      }
    });
  }

  /**
   * 设置背景颜色为主题色
   */
  export function setBackgroundColorTheme() {
    const DOM = document.querySelector("#mainContainer");
    if (!DOM) return;
    (DOM as HTMLElement).style.background = "var(--background-color)";
  }

  /**
   * 设置背景颜色为HEX颜色
   */
  export function setBackgroundColorHex(
    hex: string,
    colorThemeType?: COLOR_THEME_TYPE,
    themeBackground: string = "#131319"
  ) {
    if (colorThemeType === "dark") {
      setBackgroundColor(YColor.hexToRgb(hex));
    } else if (colorThemeType === "light") {
      let lightColor = YColor.getLightThemeColor(hex);
      setBackgroundColor(YColor.hexToRgb(lightColor ?? "#FFFFFF"));
    } else {
      const DOM = document.querySelector("#mainContainer");
      if (!DOM) return;
      const themeColorHEX = YColor.getLightThemeColor(hex, themeBackground);
      const themeColorRGB = YColor.hexToRgb(themeColorHEX ?? "#FFFFFF");
      (DOM as HTMLElement).style.background =
        `linear-gradient(180deg, rgb(${themeColorRGB.r}, ${themeColorRGB.g}, ${themeColorRGB.b}) 0%,  var(--background-color) 500px, var(--background-color) 100%)`;
    }
  }

  /**
   * 设置背景颜色为HEX颜色，简化版
   */
  export function setBackgroundColorHex2(hex: string) {
    try {
      const setting_theme = getStorage("setting.display.theme");
      if (!setting_theme) return;
      const theme = YColor.findTheme(setting_theme);
      YColor.setBackgroundColorHex(
        YColor.stringToHexColor(hex),
        (theme as Theme1).type,
        (theme as Theme2).background
      );
    } catch (error) {
      console.error("Error set background color from hex: ", error);
    }
  }

  /**
   * 从三个字母中获取HEX颜色
   */
  export function getColorFromThreeLetters(letters: string): string {
    if (letters.length < 3) {
      console.log("letters length less than 3");
      return "#FFFFFF";
    }
    let i1 = letters.toLocaleLowerCase().charCodeAt(0) - 97;
    let i2 = letters.toLocaleLowerCase().charCodeAt(1) - 97;
    let i3 = letters.toLocaleLowerCase().charCodeAt(2) - 97;
    const group = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
      71, 73, 79, 83, 89, 97, 101,
    ];
    let r = Math.ceil(group[i1] * 2.5);
    let g = Math.ceil(group[i2] * 2.5);
    let b = Math.ceil(group[i3] * 2.5);
    const result = YColor.rgbToHex(r, g, b);
    console.log("getColorFromThreeLetters: ", letters, "color: ", result);
    return result;
  }

  export function isHexColor(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/i.test(hex);
  }
}

/**
 * 从图片中获取颜色,并设置背景颜色
 * @param {string} imgSrc 图片地址
 * @param {Document} document Document 对象
 */
export function setColorFromImg(imgSrc: string, document: Document) {
  getColorFromImg(imgSrc, document).then((color) => {
    if (color) {
      setBackgroundColor(color);
    } else {
      setBackgroundColor({ r: 19, g: 19, b: 25 });
    }
  });
}

/**
 * 设置背景颜色
 * @param {COLOR} color 对象: { r: number, g: number, b: number }
 * @returns
 */
export function setBackgroundColor(color: COLOR) {
  const DOM = document.querySelector("#mainContainer");
  if (!DOM) return;
  (DOM as HTMLElement).style.background =
    `linear-gradient(180deg, rgb(${color.r}, ${color.g}, ${color.b}) 0%,  var(--background-color) 500px, var(--background-color) 100%)`;
}

/**
 * 设置HEX颜色的背景颜色
 * @param {string} hex HEX颜色值
 * @returns
 */
export function setBackgroundColorHex(hex: string) {
  const DOM = document.querySelector("#mainContainer");
  if (!DOM) return;
  (DOM as HTMLElement).style.background =
    `linear-gradient(180deg, ${hex} 0%,  var(--background-color) 500px, var(--background-color) 100%)`;
}

/**
 * 设置当前主题的背景色
 * @returns
 */
export function setBackgroundColorTheme() {
  const DOM = document.querySelector("#mainContainer");
  if (!DOM) return;
  (DOM as HTMLElement).style.background = "var(--background-color)";
}

/**
 * 增加颜色的饱和度
 * @param {number} r 红色值
 * @param {number} g 绿色值
 * @param {number} b 蓝色值
 * @returns {COLOR} 对象: { r: number, g: number, b: number }
 */
function increaseSaturation(r: number, g: number, b: number): COLOR {
  // 创建一个 Color 对象
  const color = Color.rgb(r, g, b);

  // 获取 HSL 颜色
  let hsl = color.hsl();
  // 使用平方根函数增加饱和度
  let newHsl = hsl.saturationl(20 + 3 * Math.sqrt(hsl.saturationl()));

  // 获取新的 RGB 值
  const [newR, newG, newB] = newHsl.rgb().array();
  // 返回新的 RGB 值
  return { r: Math.round(newR), g: Math.round(newG), b: Math.round(newB) };
}

/**
 * 从图片中获取颜色
 * @param {string} imgSrc 图片地址
 * @param {Document} document Document 对象
 * @returns {COLOR} 对象: { r: number, g: number, b: number }
 */
export async function getColorFromImg(
  imgSrc: string,
  document: Document
): Promise<COLOR | null> {
  // 创建一个图片对象
  // console.log('step1');
  const img = new Image();
  img.crossOrigin = "Anonymous";
  // 设置图片 URL为歌单封面
  img.src = imgSrc;
  if (!img.src) {
    return new Promise((resolve, reject) => {
      reject("img src is null");
    });
  }

  // 使用 Promise 包装 img.onload
  const color: COLOR | null =
    (await new Promise<COLOR>((resolve, reject) => {
      // 图片加载完成后执行
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;
          
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const data = imageData.data;
          let r = 0,
            g = 0,
            b = 0;
          let count = 0;
          const threshold = 30;

          // 遍历图片的每个像素
          for (let i = 0; i < data.length; i += 4) {
            const pixelR = data[i];
            const pixelG = data[i + 1];
            const pixelB = data[i + 2];
            const pixelA = data[i + 3];

            const maxRGB = Math.max(pixelR, pixelG, pixelB);
            const minRGB = Math.min(pixelR, pixelG, pixelB);
            const rgbDifference = maxRGB - minRGB;

            if (rgbDifference >= threshold && pixelA > 0) {
              r += pixelR;
              g += pixelG;
              b += pixelB;
              count++;
            }
          }

          if (count === 0) {
            reject("no valid pixel");
            return;
          }

          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          let increasedData = increaseSaturation(r, g, b);
          r = increasedData.r * 0.5;
          g = increasedData.g * 0.5;
          b = increasedData.b * 0.5;

          const avgColor = { r, g, b };
          let closestColor = darkThemeColors[0];
          let minDistance = colorDistance(avgColor, hexToRgb(closestColor));

          for (const color of darkThemeColors) {
            const colorRgb = hexToRgb(color);
            const distance = colorDistance(avgColor, colorRgb);

            if (distance < minDistance) {
              minDistance = distance;
              closestColor = color;
            }
          }

          resolve(hexToRgb(closestColor)); // 通过 resolve 返回计算结果
        } catch (error) {
          reject(error); // 如果有错误，通过 reject 传递错误
        }
      };

      img.onerror = (error) => {
        reject(error); // 处理图片加载错误
      };
    }).catch((error) => {
      console.log("get color from image error: ", error, ", return null"); // 捕获错误
      return null; // 返回 null
    })) ?? null;

  // console.log('color of img', color);
  return color; // 返回结果
}

export function hexToRgb(hex: string): COLOR {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function colorDistance(color1: COLOR, color2: COLOR): number {
  // 计算两个颜色之间的欧几里得距离
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
  );
}
