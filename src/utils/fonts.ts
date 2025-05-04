type IEscapedFonts = string[];
type IUnescapedFonts = string[];

const defaultFonts = ["Avenir", "Helvetica", "Arial", "sans-serif"] as const;
const defaultFontsStr = "Avenir, Helvetica, Arial, sans-serif" as const;

const defaultLyricFonts = defaultFonts;
const defaultLyricFontsStr = defaultFontsStr;

const defaultLyricTnsFonts = [
  "Georgia",
  `"Times New Roman"`,
  "Times",
  "serif",
] as const;
const defaultLyricTnsFontsStr =
  `"Georgia", "Times New Roman", Times, serif` as const;

function get_css_str_from_escaped_fonts(escaped_fonts: IEscapedFonts) {
  return escaped_fonts.join(",");
}

function escape_fonts(fonts: IUnescapedFonts): IEscapedFonts {
  return fonts.map((font) => {
    if (font.includes(" ")) {
      return `"${font}"`;
    }
    return font;
  }) as IEscapedFonts;
}
function get_css_str_from_unescaped_fonts(fonts: IUnescapedFonts) {
  const escaped_fonts = escape_fonts(fonts);
  return get_css_str_from_escaped_fonts(escaped_fonts);
}

export {
  type IEscapedFonts,
  type IUnescapedFonts,
  defaultFonts,
  defaultFontsStr,
  defaultLyricFonts,
  defaultLyricFontsStr,
  defaultLyricTnsFonts,
  defaultLyricTnsFontsStr,
  get_css_str_from_escaped_fonts,
  get_css_str_from_unescaped_fonts,
};
