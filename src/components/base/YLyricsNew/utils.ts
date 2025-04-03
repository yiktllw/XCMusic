export const defaultPreferences = {
  fontSize: 20,
  fontFamily: "Avenir, Helvetica, Arial, sans-serif",
  fontWeight: "bold" as "normal" | "bold",
  isItalic: false,

  tns_fontSize: 17,
  tns_fontFamily: `"Georgia", "Times New Roman", Times, serif`,
  tns_fontWeight: "bold" as "normal" | "bold",
  tns_isItalic: true,

  /** 歌词到翻译的距离 */
  distance_l_t: 10,
  /** 歌词到歌词的距离 */
  distance_l_l: 40,
};

export type ILyricsPreferences = typeof defaultPreferences;
