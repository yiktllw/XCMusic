/*---------------------------------------------------------------*
 * fluidTextureCore.ts
 * 纯计算函数 —— 无 DOM / Canvas 依赖
 * 供主线程 fluidBackground.ts 和 Worker 共同使用
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

export interface FluidTextureInput {
  primary: RGBColor;
  secondary: RGBColor;
  targetWidth: number;
  targetHeight: number;
}

// ──────────────── 基础工具 ────────────────

export function clampColorChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// ──────────────── HSL 工具 ────────────────

interface HSLObj {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl(color: RGBColor): HSLObj {
  let r = color.r / 255;
  let g = color.g / 255;
  let b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (min + max) / 2;
  if (delta === 0) return { h: 0, s: 0, l: l * 100 };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / delta + 2) / 6;
  else h = ((r - g) / delta + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSLObj): RGBColor {
  let h = hsl.h / 360;
  let s = hsl.s / 100;
  let l = hsl.l / 100;
  if (s === 0) {
    const gray = clampColorChannel(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  const h6 = h * 6;

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h6 < 1) {
    r1 = c;
    g1 = x;
  } else if (h6 < 2) {
    r1 = x;
    g1 = c;
  } else if (h6 < 3) {
    g1 = c;
    b1 = x;
  } else if (h6 < 4) {
    g1 = x;
    b1 = c;
  } else if (h6 < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: clampColorChannel((r1 + m) * 255),
    g: clampColorChannel((g1 + m) * 255),
    b: clampColorChannel((b1 + m) * 255),
  };
}

export function hslDistance(a: HSLObj, b: HSLObj): number {
  let hd = Math.abs(a.h - b.h) / 360;
  if (hd > 0.5) hd = 1 - hd;
  const sd = Math.abs(a.s - b.s) / 100;
  const ld = Math.abs(a.l - b.l) / 100;
  return Math.sqrt(hd * hd + sd * sd + ld * ld);
}

/**
 * 将饱和度限制 ≤50，亮度限制 [50, 70]
 */
export function makeBestPaletteColor(color: RGBColor): RGBColor {
  const hsl = rgbToHsl(color);
  const minS = 40;
  const maxS = 60;
  const minL = 50;
  const maxL = 70;
  if (hsl.s < minS) hsl.s = minS;
  if (hsl.s > maxS) hsl.s = maxS;
  if (hsl.l < minL) hsl.l = minL;
  else if (hsl.l > maxL) hsl.l = maxL;
  return hslToRgb(hsl);
}

// ──────────────── 随机数 ────────────────

export function createJavaRandom(seed: number) {
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

// ──────────────── 高斯模糊（纯像素运算） ────────────────

export function makeGaussianKernelJavaLike(radius: number): Float32Array {
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

export function convolveAndTransposeJavaLike(
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

      const ia = alpha ? clampColorChannel(Math.trunc(f32(a) + 0.5)) : 255;
      const ir = clampColorChannel(Math.trunc(f32(r) + 0.5));
      const ig = clampColorChannel(Math.trunc(f32(g) + 0.5));
      const ib = clampColorChannel(Math.trunc(f32(b) + 0.5));
      outPixels[index] = (ia << 24) | (ir << 16) | (ig << 8) | ib;
      index += height;
    }
  }
}

// ──────────────── FBM 噪声生成逻辑 ────────────────

/**
 * 生成 FBM 纹理的 pixel data（RGBA Uint8ClampedArray）
 * 纯计算，不依赖 Canvas
 */
export function generateFBMTextureData(
  primary: RGBColor,
  secondary: RGBColor,
  outputWidth: number,
  outputHeight: number,
  seed: number,
  angleSeed: number,
): Uint8ClampedArray {
  const f32 = (v: number) => Math.fround(v);
  const noiseRandom = createJavaRandom(seed);
  const angleRandom = createJavaRandom(angleSeed);

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

  const data = new Uint8ClampedArray(outputWidth * outputHeight * 4);
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

  return data;
}

// ──────────────── Twirl 滤镜（纯像素运算） ────────────────

/**
 * 对 RGBA 像素数组执行 Twirl 扭曲
 * 纯计算，不依赖 Canvas
 */
export function applyTwirlFilter(
  srcData: Uint8ClampedArray,
  dstData: Uint8ClampedArray,
  width: number,
  height: number,
  twirlAngle: number,
): void {
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const twirlRadius = width / 2;
  const clampTrunc = (value: number) =>
    Math.max(0, Math.min(255, Math.trunc(value)));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
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

      const nw = (srcY * width + srcX) * 4;
      const ne = (srcY * width + Math.min(width - 1, srcX + 1)) * 4;
      const sw = (Math.min(height - 1, srcY + 1) * width + srcX) * 4;
      const se =
        (Math.min(height - 1, srcY + 1) * width +
          Math.min(width - 1, srcX + 1)) *
        4;

      const bilerp = (channel: number) => {
        const top =
          srcData[nw + channel] +
          xWeight * (srcData[ne + channel] - srcData[nw + channel]);
        const bottom =
          srcData[sw + channel] +
          xWeight * (srcData[se + channel] - srcData[sw + channel]);
        return top + yWeight * (bottom - top);
      };

      const dstIdx = (y * width + x) * 4;
      dstData[dstIdx] = clampTrunc(bilerp(0));
      dstData[dstIdx + 1] = clampTrunc(bilerp(1));
      dstData[dstIdx + 2] = clampTrunc(bilerp(2));
      dstData[dstIdx + 3] = clampTrunc(bilerp(3));
    }
  }
}

// ──────────────── 亮度/对比度调整（纯像素运算） ────────────────

/**
 * 计算采样点的平均亮度
 */
export function computeAverageLuminance(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  let lum = 0;
  let count = 0;
  const dots: number[] = [];
  for (let i = 0; i < 1; i += 0.05) {
    dots.push(i);
  }
  for (const dw of dots) {
    for (const dh of dots) {
      let x = Math.trunc(width * dw);
      let y = Math.trunc(height * dh);
      if (x >= width) x = width - 1;
      if (y >= height) y = height - 1;
      const pi = (y * width + x) * 4;
      const r = pixels[pi] / 255;
      const g = pixels[pi + 1] / 255;
      const b = pixels[pi + 2] / 255;
      lum +=
        0.2126 *
          (r < 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
        0.7152 *
          (g < 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
        0.0722 * (b < 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));
      count += 1;
    }
  }
  return count > 0 ? lum / count : 0.5;
}

/**
 * 生成亮度/对比度映射表并就地应用到像素数据
 */
export function applyBrightnessContrast(
  pixels: Uint8ClampedArray,
  avgLum: number,
): void {
  const _f32 = (v: number) => Math.fround(v);
  const param = _f32(0.65);
  let brightness = param;
  if (avgLum > 0.8) brightness = _f32(param - _f32(0.05));
  else if (avgLum > 0.5) brightness = param;
  else if (avgLum > 0.4) brightness = _f32(param + _f32(0.1));
  else if (avgLum > 0.3) brightness = _f32(param + _f32(0.15));
  else if (avgLum > 0.2) brightness = _f32(param + _f32(0.2));
  else if (avgLum > 0.1) brightness = _f32(param + _f32(0.25));
  else if (avgLum > 0.05) brightness = _f32(param + _f32(0.3));
  else brightness = _f32(param + _f32(0.6));

  const brightnessF = _f32(brightness);
  const contrastF = _f32(1);
  const transferTable = new Uint8Array(256);
  const clampTrunc = (value: number) =>
    Math.max(0, Math.min(255, Math.trunc(value)));

  for (let i = 0; i < 256; i++) {
    let value = _f32(i / _f32(255));
    value = _f32(value * brightnessF);
    value = _f32(_f32(_f32(value - _f32(0.5)) * contrastF) + _f32(0.5));
    transferTable[i] = clampTrunc(_f32(_f32(255) * value));
  }

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = transferTable[pixels[i]];
    pixels[i + 1] = transferTable[pixels[i + 1]];
    pixels[i + 2] = transferTable[pixels[i + 2]];
  }
}

// ──────────────── Canvas 尺寸计算 ────────────────

export function computeTextureSizes(
  targetWidth: number,
  targetHeight: number,
): { fbmW: number; fbmH: number; reducedW: number; reducedH: number } {
  const outputWidth = Math.max(320, Math.floor(targetWidth));
  const outputHeight = Math.max(220, Math.floor(targetHeight));
  const reducedWidth = 256;
  const reducedHeight = Math.max(
    1,
    Math.round((outputHeight / outputWidth) * reducedWidth),
  );
  return {
    fbmW: outputWidth,
    fbmH: outputHeight,
    reducedW: reducedWidth,
    reducedH: reducedHeight,
  };
}
