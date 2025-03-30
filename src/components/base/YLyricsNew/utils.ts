export const defaultPreferences = {
  fontSize: 20,
  fontFamily: "Avenir, Helvetica, Arial, sans-serif",
  paddingTop: 15,
  paddingBottom: 15,
  fontWeight: "bold" as "normal" | "bold",
  isItalic: false,

  tns_fontSize: 17,
  tns_fontFamily: `"Georgia", "Times New Roman", Times, serif`,
  tns_paddingTop: 0,
  tns_paddingBottom: 20,
  tns_fontWeight: "bold" as "normal" | "bold",
  tns_isItalic: true,
};

export type ILyricsPreferences = typeof defaultPreferences;
