import {
  defaultLyricFonts,
  defaultLyricTnsFonts,
  type IEscapedFonts,
} from "@/utils/fonts";

export const defaultPreferences = {
  fontSize: 20,
  fontFamily: [...defaultLyricFonts] as IEscapedFonts,
  is_bold: true,
  isItalic: false,

  tns_fontSize: 17,
  tns_fontFamily: [...defaultLyricTnsFonts] as IEscapedFonts,
  tns_is_bold: true,
  tns_isItalic: true,

  /** 歌词到翻译的距离 */
  distance_l_t: 10,
  /** 歌词到歌词的距离 */
  distance_l_l: 40,
};

export type ILyricsPreferences = typeof defaultPreferences;
