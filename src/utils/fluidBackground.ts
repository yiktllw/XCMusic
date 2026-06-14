/*---------------------------------------------------------------*
 * fluidBackground.ts — 严格参照 test/fbm_pipeline_test.html 重写
 * 从专辑封面提取配色，生成流体动态背景
 * 供 PlayUI 和主界面共同使用
 *---------------------------------------------------------------*/

// ──────────────── 工具类型 ────────────────

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface Palette {
  primary: RGBColor;
  secondary: RGBColor;
}

// ──────────────── 基础工具 ────────────────

function clampByte(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value | 0;
}

function clampColorChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// ──────────────── HSL 工具 (Java LightMusic 写法) ────────────────

interface HSLObj {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl(color: RGBColor): HSLObj {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (min + max) / 2;
  if (delta === 0) return { h: h * 360, s: s * 100, l: l * 100 };
  s = delta / (l <= 0.5 ? min + max : 2 - max - min);
  if (r === max) h = g === min ? 5 + (max - b) / delta : 1 - (max - g) / delta;
  else if (g === max)
    h = b === min ? 1 + (max - r) / delta : 3 - (max - b) / delta;
  else h = r === min ? 3 + (max - g) / delta : 5 - (max - r) / delta;
  h /= 6;
  if (h === 1) h = 0;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(hsl: HSLObj): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  const v = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  if (s === 0) {
    const gray = clampColorChannel(l * 255);
    return { r: gray, g: gray, b: gray };
  }
  const y = 2 * l - v;
  const v1 = (v - y) * (6 * h - Math.floor(6 * h));
  const x = y + v1;
  const z = v - v1;
  let r: number, g: number, b: number;
  switch (Math.floor(6 * h)) {
    case 1:
      r = z;
      g = v;
      b = y;
      break;
    case 2:
      r = y;
      g = v;
      b = x;
      break;
    case 3:
      r = y;
      g = z;
      b = v;
      break;
    case 4:
      r = x;
      g = y;
      b = v;
      break;
    case 5:
      r = v;
      g = y;
      b = z;
      break;
    default:
      r = v;
      g = x;
      b = y;
      break;
  }
  return {
    r: clampColorChannel(r * 255),
    g: clampColorChannel(g * 255),
    b: clampColorChannel(b * 255),
  };
}

function hslDistance(a: HSLObj, b: HSLObj): number {
  let hd = Math.abs(a.h - b.h) / 360;
  if (hd > 0.5) hd = 1 - hd;
  const sd = Math.abs(a.s - b.s) / 100;
  const ld = Math.abs(a.l - b.l) / 100;
  return Math.sqrt(hd * hd + sd * sd + ld * ld);
}

/**
 * 参照 test HTML：将饱和度限制 ≤50，亮度限制 [50, 70]
 */
export function makeBestPaletteColor(color: RGBColor): RGBColor {
  const hsl = rgbToHsl(color);
  const maxS = 50;
  const minL = 50;
  const maxL = 70;
  if (hsl.s > maxS) hsl.s = maxS;
  if (hsl.l < minL) hsl.l = minL;
  else if (hsl.l > maxL) hsl.l = maxL;
  return hslToRgb(hsl);
}

// ──────────────── Java 随机数 (参照 test HTML) ────────────────

function createJavaRandom(seed: number) {
  const multiplier = 0x5deece66dn;
  const addend = 0xbn;
  const mask = (1n << 48n) - 1n;
  let state = (BigInt(seed) ^ multiplier) & mask;

  const next = (bits: number) => {
    state = (state * multiplier + addend) & mask;
    return Number(state >> BigInt(48 - bits));
  };

  return {
    nextInt(bound?: number) {
      if (bound === undefined) {
        const value = next(32);
        return value >= 0x80000000 ? value - 0x100000000 : value;
      }
      if (!Number.isInteger(bound) || bound <= 0) {
        throw new Error("bound must be a positive integer");
      }
      if ((bound & -bound) === bound) {
        return Number((BigInt(bound) * BigInt(next(31))) >> 31n);
      }
      let bits: number, value: number;
      do {
        bits = next(31);
        value = bits % bound;
      } while (bits - value + (bound - 1) < 0);
      return value;
    },
  };
}

// ──────────────── Canvas 工具 (严格参照 test HTML) ────────────────

function makeGaussianKernelJavaLike(radius: number): Float32Array {
  const f32 = Math.fround;
  const r = Math.ceil(radius);
  const rows = r * 2 + 1;
  const matrix = new Float32Array(rows);
  const sigma = f32(f32(radius) / f32(3));
  const sigma22 = f32(f32(f32(2) * sigma) * sigma);
  const sigmaPi2 = f32(f32(6.2831855) * sigma);
  const sigmaPi2Sqrt = f32(Math.sqrt(sigmaPi2));
  const radius2 = f32(f32(radius) * f32(radius));

  let total = f32(0);
  let index = 0;
  for (let row = -r; row <= r; row++) {
    const distance = f32(row * row);
    const value =
      distance > radius2
        ? f32(0)
        : f32(f32(Math.exp(f32(-distance / sigma22))) / sigmaPi2Sqrt);
    matrix[index++] = value;
    total = f32(total + value);
  }

  for (let i = 0; i < rows; i++) {
    matrix[i] = f32(matrix[i] / total);
  }
  return matrix;
}

function convolveAndTransposeJavaLike(
  kernel: Float32Array,
  inPixels: Int32Array,
  outPixels: Int32Array,
  width: number,
  height: number,
  alpha: boolean,
  premultiply: boolean,
  unpremultiply: boolean,
  edgeAction: number,
): void {
  const f32 = Math.fround;
  const cols2 = kernel.length >> 1;
  const CLAMP_EDGES = 1;

  for (let y = 0; y < height; y++) {
    let index = y;
    const ioffset = y * width;
    for (let x = 0; x < width; x++) {
      let r = f32(0);
      let g = f32(0);
      let b = f32(0);
      let a = f32(0);

      for (let col = -cols2; col <= cols2; col++) {
        const f = kernel[cols2 + col];
        if (f === 0) continue;

        let ix = x + col;
        if (ix < 0) {
          ix = edgeAction === CLAMP_EDGES ? 0 : (x + width) % width;
        } else if (ix >= width) {
          ix = edgeAction === CLAMP_EDGES ? width - 1 : (x + width) % width;
        }

        const rgb = inPixels[ioffset + ix];
        const pa = (rgb >>> 24) & 0xff;
        let pr = (rgb >>> 16) & 0xff;
        let pg = (rgb >>> 8) & 0xff;
        let pb = rgb & 0xff;

        if (premultiply) {
          const alphaScale = f32(pa * f32(0.003921569));
          pr = Math.trunc(f32(pr * alphaScale));
          pg = Math.trunc(f32(pg * alphaScale));
          pb = Math.trunc(f32(pb * alphaScale));
        }

        a = f32(a + f32(f * pa));
        r = f32(r + f32(f * pr));
        g = f32(g + f32(f * pg));
        b = f32(b + f32(f * pb));
      }

      if (unpremultiply && a !== 0 && a !== 255) {
        const invA = f32(f32(255) / a);
        r = f32(r * invA);
        g = f32(g * invA);
        b = f32(b * invA);
      }

      const ia = alpha ? clampByte(Math.trunc(f32(a) + 0.5)) : 255;
      const ir = clampByte(Math.trunc(f32(r) + 0.5));
      const ig = clampByte(Math.trunc(f32(g) + 0.5));
      const ib = clampByte(Math.trunc(f32(b) + 0.5));
      outPixels[index] = (ia << 24) | (ir << 16) | (ig << 8) | ib;
      index += height;
    }
  }
}

function gaussianBlurCanvasJavaLike(
  sourceCanvas: HTMLCanvasElement,
  radius: number,
): HTMLCanvasElement | null {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!srcCtx) return null;
  const srcImage = srcCtx.getImageData(0, 0, width, height);
  const srcPixels = srcImage.data;

  const inPixels = new Int32Array(width * height);
  const outPixels = new Int32Array(width * height);
  for (let i = 0, p = 0; p < inPixels.length; p++, i += 4) {
    const r = srcPixels[i];
    const g = srcPixels[i + 1];
    const b = srcPixels[i + 2];
    const a = srcPixels[i + 3];
    inPixels[p] = (a << 24) | (r << 16) | (g << 8) | b;
  }

  if (radius > 0) {
    const kernel = makeGaussianKernelJavaLike(radius);
    const CLAMP_EDGES = 1;
    convolveAndTransposeJavaLike(
      kernel,
      inPixels,
      outPixels,
      width,
      height,
      true,
      true,
      false,
      CLAMP_EDGES,
    );
    convolveAndTransposeJavaLike(
      kernel,
      outPixels,
      inPixels,
      height,
      width,
      true,
      false,
      true,
      CLAMP_EDGES,
    );
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!outCtx) return null;
  const outImage = outCtx.createImageData(width, height);
  const outData = outImage.data;

  for (let p = 0, i = 0; p < inPixels.length; p++, i += 4) {
    const rgb = inPixels[p];
    outData[i] = (rgb >>> 16) & 0xff;
    outData[i + 1] = (rgb >>> 8) & 0xff;
    outData[i + 2] = rgb & 0xff;
    outData[i + 3] = (rgb >>> 24) & 0xff;
  }

  outCtx.putImageData(outImage, 0, 0);
  return outCanvas;
}

function resizeCanvasBilinearJavaLike(
  sourceCanvas: HTMLCanvasElement,
  targetW: number,
  targetH: number,
): HTMLCanvasElement | null {
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;
  const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!srcCtx) return null;
  const srcPixels = srcCtx.getImageData(0, 0, srcW, srcH).data;

  const ONE_32 = 4294967296;
  const HALF_32 = 2147483648;
  const FRACT_SHIFT_24 = 16777216;

  const toLong = (value: number) => {
    const scaled = value * ONE_32;
    return scaled < 0 ? Math.ceil(scaled) : Math.floor(scaled);
  };
  const wholeOfLong = (value: number) => Math.floor(value / ONE_32);
  const fractOfLong = (value: number) => value - wholeOfLong(value) * ONE_32;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = targetW;
  outCanvas.height = targetH;
  const outCtx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!outCtx) return null;

  const outImage = outCtx.createImageData(targetW, targetH);
  const outPixels = outImage.data;

  const dxdxLong = toLong(srcW / targetW);
  const dydyLong = toLong(srcH / targetH);
  const xbase0 = toLong((0.5 * srcW) / targetW);
  const ybase0 = toLong((0.5 * srcH) / targetH);

  const read = (x: number, y: number, channel: number) => {
    return srcPixels[(y * srcW + x) * 4 + channel];
  };

  let yLong = ybase0;
  for (let y = 0; y < targetH; y++) {
    const yAdj = yLong - HALF_32;
    let y0 = wholeOfLong(yAdj);
    let y1 = y0 + 1;
    if (y0 < 0) {
      y0 = 0;
      y1 = 0;
    } else if (y0 >= srcH - 1) {
      y0 = srcH - 1;
      y1 = y0;
    }
    const yFactor = Math.floor(fractOfLong(yAdj) / FRACT_SHIFT_24);

    let xLong = xbase0;
    for (let x = 0; x < targetW; x++) {
      const xAdj = xLong - HALF_32;
      let x0 = wholeOfLong(xAdj);
      let x1 = x0 + 1;
      if (x0 < 0) {
        x0 = 0;
        x1 = 0;
      } else if (x0 >= srcW - 1) {
        x0 = srcW - 1;
        x1 = x0;
      }
      const xFactor = Math.floor(fractOfLong(xAdj) / FRACT_SHIFT_24);

      const dstIdx = (y * targetW + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = read(x0, y0, c);
        const p10 = read(x1, y0, c);
        const p01 = read(x0, y1, c);
        const p11 = read(x1, y1, c);
        const top = (p00 << 8) + (p10 - p00) * xFactor;
        const bottom = (p01 << 8) + (p11 - p01) * xFactor;
        const accum = (top << 8) + (bottom - top) * yFactor;
        outPixels[dstIdx + c] = clampByte((accum + (1 << 15)) >> 16);
      }

      xLong += dxdxLong;
    }

    yLong += dydyLong;
  }

  outCtx.putImageData(outImage, 0, 0);
  return outCanvas;
}

function resizeImageBilinearJavaLike(
  image: HTMLImageElement,
  targetW: number,
  targetH: number,
): HTMLCanvasElement | null {
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = image.width;
  srcCanvas.height = image.height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) return null;
  srcCtx.drawImage(image, 0, 0, image.width, image.height);
  return resizeCanvasBilinearJavaLike(srcCanvas, targetW, targetH);
}

// ──────────────── MMCQ 调色板提取 (严格参照 test HTML) ────────────────

interface VBox {
  r1: number;
  r2: number;
  g1: number;
  g2: number;
  b1: number;
  b2: number;
  axis: string;
  volume: number;
  pixelNum: number;
}

class JavaPriorityQueue {
  comparator: (a: any, b: any) => number;
  data: any[];

  constructor(comparator: (a: any, b: any) => number) {
    this.comparator = comparator;
    this.data = [];
  }

  offer(item: any): void {
    let k = this.data.length;
    this.data.push(item);
    while (k > 0) {
      const parent = (k - 1) >>> 1;
      const e = this.data[parent];
      if (this.comparator(item, e) >= 0) break;
      this.data[k] = e;
      k = parent;
    }
    this.data[k] = item;
  }

  poll(): any | undefined {
    const n = this.data.length;
    if (n === 0) return undefined;
    const result = this.data[0];
    const x = this.data.pop();
    if (n > 1 && x !== undefined) {
      const size = n - 1;
      let k = 0;
      const half = size >>> 1;
      while (k < half) {
        let child = (k << 1) + 1;
        let c = this.data[child];
        const right = child + 1;
        if (right < size && this.comparator(this.data[right], c) < 0) {
          child = right;
          c = this.data[child];
        }
        if (this.comparator(x, c) <= 0) break;
        this.data[k] = c;
        k = child;
      }
      this.data[k] = x;
    }
    return result;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  toArray(): any[] {
    return this.data.slice();
  }

  addAll(items: any[]): void {
    for (const item of items) this.offer(item);
  }

  clear(): void {
    this.data.length = 0;
  }
}

function extractCoverPaletteFromImage(image: HTMLImageElement): Palette | null {
  const MAX_IMG_WIDTH = 256;
  const scale = image.width > MAX_IMG_WIDTH ? MAX_IMG_WIDTH / image.width : 1;
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = resizeImageBilinearJavaLike(image, w, h);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const pixels = ctx.getImageData(0, 0, w, h).data;

  const maxColor = 3;
  const fraction = 0.85;
  const sigBits = 5;
  const rShift = 8 - sigBits;
  const multiple = 1 << rShift;
  const maxIterations = 100;
  const minProportion = 0.01;

  const histo = new Map<number, number>();
  const getColorIndex = (r: number, g: number, b: number) =>
    (r << 16) | (g << 8) | b;

  let orMinR = 255,
    orMinG = 255,
    orMinB = 255;
  let orMaxR = 0,
    orMaxG = 0,
    orMaxB = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 128) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    orMinR = Math.min(orMinR, r);
    orMaxR = Math.max(orMaxR, r);
    orMinG = Math.min(orMinG, g);
    orMaxG = Math.max(orMaxG, g);
    orMinB = Math.min(orMinB, b);
    orMaxB = Math.max(orMaxB, b);

    const sr = r >> rShift;
    const sg = g >> rShift;
    const sb = b >> rShift;
    const key = getColorIndex(sr, sg, sb);
    histo.set(key, (histo.get(key) ?? 0) + 1);
  }

  if (!histo.size) return null;

  const rMin = orMinR >> rShift;
  const rMax = orMaxR >> rShift;
  const gMin = orMinG >> rShift;
  const gMax = orMaxG >> rShift;
  const bMin = orMinB >> rShift;
  const bMax = orMaxB >> rShift;

  const calcPopulation = (v: VBox) => {
    let sum = 0;
    for (let r = v.r1; r <= v.r2; r++) {
      for (let g = v.g1; g <= v.g2; g++) {
        for (let b = v.b1; b <= v.b2; b++) {
          sum += histo.get(getColorIndex(r, g, b)) ?? 0;
        }
      }
    }
    return sum;
  };

  const buildVBox = (
    rv1: number,
    rv2: number,
    gv1: number,
    gv2: number,
    bv1: number,
    bv2: number,
  ): VBox => {
    const rl = Math.abs(rv2 - rv1) + 1;
    const gl = Math.abs(gv2 - gv1) + 1;
    const bl = Math.abs(bv2 - bv1) + 1;
    const maxLen = Math.max(rl, gl, bl);
    const axis = maxLen === rl ? "r" : maxLen === gl ? "g" : "b";
    const v: VBox = {
      r1: rv1,
      r2: rv2,
      g1: gv1,
      g2: gv2,
      b1: bv1,
      b2: bv2,
      axis,
      volume: rl * gl * bl,
      pixelNum: 0,
    };
    v.pixelNum = calcPopulation(v);
    return v;
  };

  const calcAvgRgb = (v: VBox): RGBColor => {
    let total = 0;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    for (let r = v.r1; r <= v.r2; r++) {
      for (let g = v.g1; g <= v.g2; g++) {
        for (let b = v.b1; b <= v.b2; b++) {
          const count = histo.get(getColorIndex(r, g, b)) ?? 0;
          if (!count) continue;
          total += count;
          rSum += Math.trunc(count * (r + 0.5) * multiple);
          gSum += Math.trunc(count * (g + 0.5) * multiple);
          bSum += Math.trunc(count * (b + 0.5) * multiple);
        }
      }
    }
    if (!total) {
      return {
        r: clampColorChannel(Math.trunc(((v.r1 + v.r2 + 1) * multiple) / 2)),
        g: clampColorChannel(Math.trunc(((v.g1 + v.g2 + 1) * multiple) / 2)),
        b: clampColorChannel(Math.trunc(((v.b2 + v.b2 + 1) * multiple) / 2)),
      };
    }
    return {
      r: clampColorChannel(Math.trunc(rSum / total)),
      g: clampColorChannel(Math.trunc(gSum / total)),
      b: clampColorChannel(Math.trunc(bSum / total)),
    };
  };

  const rgbDistance = (a: RGBColor, b: RGBColor): number => {
    const dr = (a.r - b.r) / 255;
    const dg = (a.g - b.g) / 255;
    const db = (a.b - b.b) / 255;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const medianCutApply = (vbox: VBox): [VBox | null, VBox | null] => {
    const axes =
      vbox.axis === "r"
        ? ["r", "g", "b"]
        : vbox.axis === "g"
          ? ["g", "b"]
          : ["b"];
    let cumulative = 0;

    for (const axis of axes) {
      const min = axis === "r" ? vbox.r1 : axis === "g" ? vbox.g1 : vbox.b1;
      const max = axis === "r" ? vbox.r2 : axis === "g" ? vbox.g2 : vbox.b2;
      if (min >= max) continue;

      for (let i = min; i <= max; i++) {
        if (axis === "r") {
          for (let g = vbox.g1; g <= vbox.g2; g++) {
            for (let b = vbox.b1; b <= vbox.b2; b++) {
              cumulative += histo.get(getColorIndex(i, g, b)) ?? 0;
            }
          }
        } else if (axis === "g") {
          for (let b = vbox.b1; b <= vbox.b2; b++) {
            for (let r = vbox.r1; r <= vbox.r2; r++) {
              cumulative += histo.get(getColorIndex(r, i, b)) ?? 0;
            }
          }
        } else {
          for (let r = vbox.r1; r <= vbox.r2; r++) {
            for (let g = vbox.g1; g <= vbox.g2; g++) {
              cumulative += histo.get(getColorIndex(r, g, i)) ?? 0;
            }
          }
        }

        if (cumulative >= vbox.pixelNum / 2) {
          const left = i - min;
          const right = max - i;
          const split =
            left >= right
              ? Math.max(min, i - 1 - Math.trunc(left / 2))
              : Math.min(max - 1, i + Math.trunc(right / 2));

          const v1 =
            axis === "r"
              ? buildVBox(vbox.r1, split, vbox.g1, vbox.g2, vbox.b1, vbox.b2)
              : axis === "g"
                ? buildVBox(vbox.r1, vbox.r2, vbox.g1, split, vbox.b1, vbox.b2)
                : buildVBox(vbox.r1, vbox.r2, vbox.g1, vbox.g2, vbox.b1, split);

          const v2 =
            axis === "r"
              ? buildVBox(
                  split + 1,
                  vbox.r2,
                  vbox.g1,
                  vbox.g2,
                  vbox.b1,
                  vbox.b2,
                )
              : axis === "g"
                ? buildVBox(
                    vbox.r1,
                    vbox.r2,
                    split + 1,
                    vbox.g2,
                    vbox.b1,
                    vbox.b2,
                  )
                : buildVBox(
                    vbox.r1,
                    vbox.r2,
                    vbox.g1,
                    vbox.g2,
                    split + 1,
                    vbox.b2,
                  );

          if (rgbDistance(calcAvgRgb(v1), calcAvgRgb(v2)) < 0.5) break;
          return [v1, v2];
        }
      }
    }
    return [vbox, null];
  };

  const iterCut = (target: number, queue: JavaPriorityQueue) => {
    let nColors = 1;
    let nIters = 0;
    const store: any[] = [];
    while (true) {
      if (nColors >= target || queue.isEmpty()) break;
      const vbox = queue.poll();
      if (vbox.pixelNum === 0) continue;
      const [v1, v2] = medianCutApply(vbox);
      if (!v1) continue;
      if (!v2 || v1.pixelNum === vbox.pixelNum) {
        store.push(v1);
        continue;
      }
      queue.offer(v1);
      queue.offer(v2);
      nColors += 1;
      if (++nIters >= maxIterations) break;
    }
    queue.addAll(store);
  };

  const oriVBox = buildVBox(rMin, rMax, gMin, gMax, bMin, bMax);
  if (oriVBox.pixelNum <= 0) return null;

  const pOneQueue = new JavaPriorityQueue((a: any, b: any) => {
    if (b.pixelNum < a.pixelNum) return -1;
    if (b.pixelNum > a.pixelNum) return 1;
    return 0;
  });
  pOneQueue.offer(oriVBox);
  const popColors = Math.floor(maxColor * fraction);
  iterCut(popColors, pOneQueue);

  const boxQueue = new JavaPriorityQueue((a: any, b: any) => {
    const bp = b.pixelNum * b.volume;
    const ap = a.pixelNum * a.volume;
    if (bp < ap) return -1;
    if (bp > ap) return 1;
    return 0;
  });
  boxQueue.addAll(pOneQueue.toArray());
  pOneQueue.clear();
  iterCut(maxColor - popColors + 1, boxQueue);
  pOneQueue.addAll(boxQueue.toArray());
  boxQueue.clear();

  const themeQueue = new JavaPriorityQueue((a: any, b: any) => {
    if (b.priority < a.priority) return -1;
    if (b.priority > a.priority) return 1;
    return 0;
  });

  while (!pOneQueue.isEmpty()) {
    const vbox = pOneQueue.poll();
    const avg = calcAvgRgb(vbox);
    const proportion = vbox.pixelNum / oriVBox.pixelNum;
    if (proportion < minProportion) continue;
    const dist = hslDistance(rgbToHsl(avg), { h: 180, s: 50, l: 50 });
    themeQueue.offer({
      r: avg.r,
      g: avg.g,
      b: avg.b,
      proportion,
      priority: proportion * (1 - dist),
    });
  }

  const themeColors = themeQueue.toArray();
  if (!themeColors.length) return null;

  const primary = makeBestPaletteColor({
    r: themeColors[0].r,
    g: themeColors[0].g,
    b: themeColors[0].b,
  });
  const secondRaw = themeColors[1] ?? { r: 18, g: 150, b: 219 };
  const secondary = makeBestPaletteColor({
    r: secondRaw.r,
    g: secondRaw.g,
    b: secondRaw.b,
  });

  return { primary, secondary };
}

// ──────────────── 公开：提取封面配色 ────────────────

/**
 * 从封面 URL 提取主色/辅助色
 */
export async function extractCoverPalette(
  picUrl: string,
): Promise<Palette | null> {
  const fallback = (): Palette => ({
    primary: { r: 88, g: 86, b: 214 },
    secondary: { r: 19, g: 19, b: 25 },
  });

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Image load failed"));
      i.src = picUrl;
    });
    return extractCoverPaletteFromImage(img) ?? fallback();
  } catch {
    return fallback();
  }
}

// ──────────────── 流体纹理生成 (严格参照 test HTML) ────────────────

const FIXED_SEED = 0x5a17c9ef;

/**
 * 生成流体背景纹理的 data URL
 * 管线：FBM(output尺寸) → resize至256 → Twirl → GaussianBlur → resize回output尺寸 → Darken
 */
export function createFluidTextureDataUrl(
  primary: RGBColor,
  secondary: RGBColor,
  targetWidth: number,
  targetHeight: number,
): string | null {
  const outputWidth = Math.max(320, Math.floor(targetWidth));
  const outputHeight = Math.max(220, Math.floor(targetHeight));

  const createJavaRandomLocal = (seed: number) => createJavaRandom(seed);
  const noiseRandom = createJavaRandomLocal(FIXED_SEED);
  const angleRandom = createJavaRandomLocal(FIXED_SEED);

  const fbmCanvas = document.createElement("canvas");
  fbmCanvas.width = outputWidth;
  fbmCanvas.height = outputHeight;
  const fbmCtx = fbmCanvas.getContext("2d", { willReadFrequently: true });
  if (!fbmCtx) return null;

  const imageData = fbmCtx.createImageData(outputWidth, outputHeight);
  const data = imageData.data;
  const f32 = (v: number) => Math.fround(v);
  const lerpIntByFloat = (t: number, a: number, b: number) => {
    const tf = f32(t);
    const value = f32(f32(a) + f32(tf * f32(b - a)));
    return Math.trunc(value);
  };
  const clampTrunc = (value: number) =>
    Math.max(0, Math.min(255, Math.trunc(value)));

  const B = 0x100;
  const BM = 0xff;
  const N = 0x1000;
  const SCALE = 32;
  const fN = f32(N);
  const fSCALE = f32(SCALE);
  const fLac = f32(0.35);
  const randomInt = () => noiseRandom.nextInt() & 0x7fffffff;

  const perm = new Uint8Array(B + B + 2);
  const gx = new Float32Array(B + B + 2);
  const gy = new Float32Array(B + B + 2);

  for (let i = 0; i < B; i++) {
    perm[i] = i;
    randomInt();
    gx[i] = ((randomInt() % (B + B)) - B) / B;
    gy[i] = ((randomInt() % (B + B)) - B) / B;
    const gxv = gx[i];
    const gyv = gy[i];
    const s = f32(Math.sqrt(f32(f32(gxv * gxv) + f32(gyv * gyv))));
    gx[i] = f32(gxv / s);
    gy[i] = f32(gyv / s);
    randomInt();
    randomInt();
    randomInt();
  }
  for (let i = B - 1; i >= 0; i--) {
    const j = randomInt() % B;
    const k = perm[i];
    perm[i] = perm[j];
    perm[j] = k;
  }
  for (let i = 0; i < B + 2; i++) {
    perm[B + i] = perm[i];
    gx[B + i] = gx[i];
    gy[B + i] = gy[i];
  }

  const lerpFloat = (t: number, a: number, b: number) =>
    f32(f32(a) + f32(f32(t) * f32(f32(b) - f32(a))));
  const sCurve = (t: number) => {
    const tf = f32(t);
    return f32(f32(tf * tf) * f32(f32(3) - f32(f32(2) * tf)));
  };

  const noise2 = (x: number, y: number) => {
    const xf = f32(x);
    const yf = f32(y);

    let t = f32(xf + fN);
    const bx0 = Math.trunc(t) & BM;
    const bx1 = (bx0 + 1) & BM;
    const rx0 = f32(t - Math.trunc(t));
    const rx1 = f32(rx0 - 1);

    t = f32(yf + fN);
    const by0 = Math.trunc(t) & BM;
    const by1 = (by0 + 1) & BM;
    const ry0 = f32(t - Math.trunc(t));
    const ry1 = f32(ry0 - 1);

    const i0 = perm[bx0];
    const i1 = perm[bx1];
    const b00 = perm[i0 + by0];
    const b10 = perm[i1 + by0];
    const b01 = perm[i0 + by1];
    const b11 = perm[i1 + by1];

    const sx = sCurve(rx0);
    const sy = sCurve(ry0);

    const u = f32(f32(rx0 * gx[b00]) + f32(ry0 * gy[b00]));
    const v = f32(f32(rx1 * gx[b10]) + f32(ry0 * gy[b10]));
    const a = lerpFloat(sx, u, v);

    const u2 = f32(f32(rx0 * gx[b01]) + f32(ry1 * gy[b01]));
    const v2 = f32(f32(rx1 * gx[b11]) + f32(ry1 * gy[b11]));
    const b = lerpFloat(sx, u2, v2);

    return f32(f32(1.5) * lerpFloat(sy, a, b));
  };

  const ridged = (x: number, y: number) => 1 - Math.abs(noise2(x, y));

  const H = 5;
  const lac = fLac;
  const octaves = 4;
  const exponents = new Float32Array(octaves + 1);
  let freq = f32(1);
  for (let i = 0; i <= octaves; i++) {
    exponents[i] = Math.pow(freq, -H);
    freq = f32(freq * lac);
  }

  const fbmRaw = (x: number, y: number) => {
    let v = f32(0);
    let cx = f32(f32(x) + f32(371));
    let cy = f32(f32(y) + f32(529));
    for (let i = 0; i < octaves; i++) {
      v = f32(v + f32(ridged(cx, cy) * exponents[i]));
      cx = f32(cx * lac);
      cy = f32(cy * lac);
    }
    return f32(v);
  };

  const fbmAngle = f32((angleRandom.nextInt(360) * Math.PI) / 180);
  const cosA = f32(Math.cos(fbmAngle));
  const sinA = f32(Math.sin(fbmAngle));

  let fmin = f32(0);
  let fmax = f32(0);
  for (let sy = f32(-100); sy < 100; sy = f32(sy + f32(10.35173))) {
    for (let sx = f32(-100); sx < 100; sx = f32(sx + f32(10.77139))) {
      const v = f32(fbmRaw(sx, sy));
      if (v < fmin) fmin = v;
      if (v > fmax) fmax = v;
    }
  }
  const frange = f32(fmax - fmin) || f32(1);

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const nx = f32(f32(f32(cosA * x) + f32(sinA * y)) / fSCALE);
      const ny = f32(f32(f32(-sinA * x) + f32(cosA * y)) / fSCALE);
      const v = f32(fbmRaw(nx, ny));
      const tone = f32(Math.min(1, Math.max(0, f32(f32(v - fmin) / frange))));
      const idx = (y * outputWidth + x) * 4;
      data[idx] = clampTrunc(lerpIntByFloat(tone, secondary.r, primary.r));
      data[idx + 1] = clampTrunc(lerpIntByFloat(tone, secondary.g, primary.g));
      data[idx + 2] = clampTrunc(lerpIntByFloat(tone, secondary.b, primary.b));
      data[idx + 3] = 255;
    }
  }
  fbmCtx.putImageData(imageData, 0, 0);

  // Scale to 256
  const reducedWidth = 256;
  const reducedHeight = Math.max(
    1,
    Math.round((outputHeight / outputWidth) * reducedWidth),
  );
  const reducedCanvas = resizeCanvasBilinearJavaLike(
    fbmCanvas,
    reducedWidth,
    reducedHeight,
  );
  if (!reducedCanvas) return null;

  const reducedCtx = reducedCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  if (!reducedCtx) return null;

  // Twirl at 256px
  const twirlCanvas = document.createElement("canvas");
  twirlCanvas.width = reducedWidth;
  twirlCanvas.height = reducedHeight;
  const twirlCtx = twirlCanvas.getContext("2d", { willReadFrequently: true });
  if (!twirlCtx) return null;

  const sourceData = reducedCtx.getImageData(0, 0, reducedWidth, reducedHeight);
  const twirledData = twirlCtx.createImageData(reducedWidth, reducedHeight);
  const src = sourceData.data;
  const dst = twirledData.data;
  const centerX = reducedWidth * 0.5;
  const centerY = reducedHeight * 0.5;
  const twirlRadius = reducedWidth / 2;
  const twirlAngle = ((angleRandom.nextInt(340) + 10) * Math.PI) / 180;

  for (let y = 0; y < reducedHeight; y++) {
    for (let x = 0; x < reducedWidth; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.hypot(dx, dy);
      let sx = x;
      let sy = y;
      if (dist < twirlRadius) {
        const factor = (twirlRadius - dist) / twirlRadius;
        const offset = twirlAngle * factor;
        const baseAngle = Math.atan2(dy, dx);
        sx = centerX + dist * Math.cos(baseAngle + offset);
        sy = centerY + dist * Math.sin(baseAngle + offset);
      }
      const srcX = Math.floor(sx);
      const srcY = Math.floor(sy);
      const xWeight = sx - srcX;
      const yWeight = sy - srcY;

      const nw = (srcY * reducedWidth + srcX) * 4;
      const ne =
        (srcY * reducedWidth + Math.min(reducedWidth - 1, srcX + 1)) * 4;
      const sw =
        (Math.min(reducedHeight - 1, srcY + 1) * reducedWidth + srcX) * 4;
      const se =
        (Math.min(reducedHeight - 1, srcY + 1) * reducedWidth +
          Math.min(reducedWidth - 1, srcX + 1)) *
        4;

      const bilerp = (channel: number) => {
        const top =
          src[nw + channel] + xWeight * (src[ne + channel] - src[nw + channel]);
        const bottom =
          src[sw + channel] + xWeight * (src[se + channel] - src[sw + channel]);
        return top + yWeight * (bottom - top);
      };

      const dstIdx = (y * reducedWidth + x) * 4;
      dst[dstIdx] = clampTrunc(bilerp(0));
      dst[dstIdx + 1] = clampTrunc(bilerp(1));
      dst[dstIdx + 2] = clampTrunc(bilerp(2));
      dst[dstIdx + 3] = clampTrunc(bilerp(3));
    }
  }
  twirlCtx.putImageData(twirledData, 0, 0);

  // Gaussian blur at 256px
  const gaussianRadius = Math.max(1, reducedWidth * 0.3);
  const blurCanvas = gaussianBlurCanvasJavaLike(twirlCanvas, gaussianRadius);
  if (!blurCanvas) return null;

  // Scale to output size
  const finalCanvas = resizeCanvasBilinearJavaLike(
    blurCanvas,
    outputWidth,
    outputHeight,
  );
  if (!finalCanvas) return null;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;

  // Darken (参照 test HTML：直接 brightness 乘法，不做 gamma correction)
  const finalData = finalCtx.getImageData(0, 0, outputWidth, outputHeight);
  const finalPixels = finalData.data;

  let lum = 0;
  let count = 0;
  const dots: number[] = [];
  for (let i = f32(0); i < 1; i = f32(i + f32(0.05))) {
    dots.push(i);
  }
  for (const dw of dots) {
    for (const dh of dots) {
      let x = Math.trunc(outputWidth * dw);
      let y = Math.trunc(outputHeight * dh);
      if (x >= outputWidth) x = outputWidth - 1;
      if (y >= outputHeight) y = outputHeight - 1;
      const pi = (y * outputWidth + x) * 4;
      const r = finalPixels[pi] / 255;
      const g = finalPixels[pi + 1] / 255;
      const b = finalPixels[pi + 2] / 255;
      lum +=
        0.2126 *
          (r < 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
        0.7152 *
          (g < 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
        0.0722 * (b < 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));
      count += 1;
    }
  }
  const avgLum = count > 0 ? lum / count : 0.5;
  const param = f32(0.65);
  let brightness = param;
  if (avgLum > 0.8) brightness = f32(param - f32(0.05));
  else if (avgLum > 0.5) brightness = param;
  else if (avgLum > 0.4) brightness = f32(param + f32(0.1));
  else if (avgLum > 0.3) brightness = f32(param + f32(0.15));
  else if (avgLum > 0.2) brightness = f32(param + f32(0.2));
  else if (avgLum > 0.1) brightness = f32(param + f32(0.25));
  else if (avgLum > 0.05) brightness = f32(param + f32(0.3));
  else brightness = f32(param + f32(0.6));

  const brightnessF = f32(brightness);
  const contrastF = f32(1);
  const transferTable = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let value = f32(i / f32(255));
    value = f32(value * brightnessF);
    value = f32(f32(f32(value - f32(0.5)) * contrastF) + f32(0.5));
    transferTable[i] = clampTrunc(f32(f32(255) * value));
  }

  for (let i = 0; i < finalPixels.length; i += 4) {
    finalPixels[i] = transferTable[finalPixels[i]];
    finalPixels[i + 1] = transferTable[finalPixels[i + 1]];
    finalPixels[i + 2] = transferTable[finalPixels[i + 2]];
  }
  finalCtx.putImageData(finalData, 0, 0);

  return finalCanvas.toDataURL("image/png");
}

// ──────────────── 应用到容器 ────────────────

/**
 * 设置流体背景到指定 DOM 容器
 */
export function applyFluidBackground(
  container: HTMLElement,
  primary: RGBColor,
  secondary: RGBColor,
  fade = true,
): void {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const textureDataUrl = createFluidTextureDataUrl(
    primary,
    secondary,
    width,
    height,
  );
  const style = container.style;

  style.setProperty("--playui-rgb", `${primary.r}, ${primary.g}, ${primary.b}`);
  style.setProperty(
    "--playui-rgb-dark",
    `${secondary.r}, ${secondary.g}, ${secondary.b}`,
  );
  style.setProperty(
    "--playui-rgb-light",
    `${primary.r}, ${primary.g}, ${primary.b}`,
  );

  const nextTexture = textureDataUrl ? `url("${textureDataUrl}")` : "none";

  if (fade) {
    const previousTexture = style
      .getPropertyValue("--playui-fluid-image")
      .trim();
    if (previousTexture && previousTexture !== "none") {
      style.setProperty("--playui-fluid-prev-image", previousTexture);
    }
    style.setProperty("--playui-fluid-image", nextTexture);
    style.background = `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`;

    if (
      previousTexture &&
      previousTexture !== "none" &&
      nextTexture !== "none"
    ) {
      style.setProperty("--playui-fluid-opacity", "0");
      startFadeAnimation(style);
    } else {
      style.setProperty("--playui-fluid-opacity", "1");
    }
  } else {
    style.setProperty("--playui-fluid-prev-image", "none");
    style.setProperty("--playui-fluid-image", nextTexture);
    style.setProperty("--playui-fluid-opacity", "1");
    style.background = `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`;
  }
}

/**
 * 清除流体背景，恢复默认暗色
 */
export function clearFluidBackground(container: HTMLElement): void {
  const style = container.style;
  style.removeProperty("--playui-rgb");
  style.removeProperty("--playui-rgb-dark");
  style.removeProperty("--playui-rgb-light");
  style.removeProperty("--playui-fluid-prev-image");
  style.removeProperty("--playui-fluid-image");
  style.removeProperty("--playui-fluid-opacity");
  style.background = "";
}

let _fadeFrame: number | null = null;

function startFadeAnimation(style: CSSStyleDeclaration): void {
  if (_fadeFrame !== null) {
    cancelAnimationFrame(_fadeFrame);
  }
  const start = performance.now();
  const duration = 400;

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    style.setProperty("--playui-fluid-opacity", `${t}`);
    if (t < 1) {
      _fadeFrame = requestAnimationFrame(step);
    } else {
      style.setProperty("--playui-fluid-prev-image", "none");
      _fadeFrame = null;
    }
  };
  _fadeFrame = requestAnimationFrame(step);
}
