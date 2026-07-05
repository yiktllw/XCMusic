/*---------------------------------------------------------------*
 * fluidBackground.ts
 * 从专辑封面提取配色，生成流体动态背景
 * 供 PlayUI 和主界面共同使用
 * 算法来自于 LightMusic
 *
 * 架构：
 *   - 纯计算函数在 fluidTextureCore.ts（主线程 & Worker 共享）
 *   - 纹理生成委托给 fluidTexture.worker.ts（OffscreenCanvas）
 *   - 本文件只保留 DOM 相关操作：图片加载、MMCQ、CSS 应用
 *---------------------------------------------------------------*/

import {
  type RGBColor,
  type Palette,
  clampColorChannel,
  hslToRgb,
  rgbToHsl,
  hslDistance,
  makeBestPaletteColor,
} from "@/utils/fluidTextureCore";

// 重新导出类型（兼容旧 import）
export type { RGBColor, Palette };

// 重新导出 makeBestPaletteColor（App.vue 直接使用）
export { makeBestPaletteColor };

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
        outPixels[dstIdx + c] = clampColorChannel((accum + (1 << 15)) >> 16);
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

// ──────────────── MMCQ 调色板提取（仅主线程） ────────────────

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
  data: any[] = [];

  constructor(comparator: (a: any, b: any) => number) {
    this.comparator = comparator;
  }

  offer(x: any): void {
    this.data.push(x);
    let k = this.data.length - 1;
    while (k > 0) {
      const parent = (k - 1) >>> 1;
      if (this.comparator(x, this.data[parent]) >= 0) break;
      this.data[k] = this.data[parent];
      k = parent;
    }
    this.data[k] = x;
  }

  poll(): any {
    const result = this.data[0];
    const x = this.data.pop();
    if (this.data.length > 0) {
      let k = 0;
      const half = this.data.length >>> 1;
      while (k < half) {
        let child = (k << 1) + 1;
        let c = this.data[child];
        const right = child + 1;
        if (
          right < this.data.length &&
          this.comparator(c, this.data[right]) > 0
        ) {
          c = this.data[(child = right)];
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
  // const fraction = 0.85;
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
        b: clampColorChannel(Math.trunc(((v.b1 + v.b2 + 1) * multiple) / 2)),
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

          return [v1.pixelNum > 0 ? v1 : null, v2.pixelNum > 0 ? v2 : null];
        }
      }
    }
    return [null, null];
  };

  const vbox0 = buildVBox(rMin, rMax, gMin, gMax, bMin, bMax);
  const pq = new JavaPriorityQueue(
    (a: VBox, b: VBox) => b.pixelNum * b.volume - a.pixelNum * a.volume,
  );
  pq.offer(vbox0);
  const vboxSplit = (vbox: VBox) => {
    const [v1, v2] = medianCutApply(vbox);
    if (v1) pq.offer(v1);
    if (v2) pq.offer(v2);
  };
  vboxSplit(vbox0);

  let iterations = 0;
  while (iterations < maxIterations && !pq.isEmpty()) {
    const vbox = pq.poll();
    if (vbox.pixelNum < minProportion * vbox0.pixelNum) break;
    vboxSplit(vbox);
    iterations++;
  }

  const candidates: RGBColor[] = [];
  const targetColors = Math.min(maxColor * 2, pq.data.length + 2);
  while (!pq.isEmpty()) {
    const vbox = pq.poll();
    candidates.push(calcAvgRgb(vbox));
  }
  if (candidates.length < 2) {
    candidates.push(calcAvgRgb(vbox0));
  }

  // Filter dark colors
  const filtered: RGBColor[] = [];
  for (const c of candidates) {
    const hsl = rgbToHsl(c);
    if (hsl.l >= 15 && hsl.s >= 8) filtered.push(c);
  }
  if (filtered.length >= 2)
    candidates.splice(0, candidates.length, ...filtered);

  // Sort by distance from pure gray
  const GRAY_EPSILON = 1e-6;
  candidates.sort(
    (a, b) =>
      Math.abs(b.r - b.g) +
      Math.abs(b.g - b.b) +
      GRAY_EPSILON -
      (Math.abs(a.r - a.g) + Math.abs(a.g - a.b) + GRAY_EPSILON),
  );

  const selected: RGBColor[] = [];
  const centroid = { r: 128, g: 128, b: 128 };
  const avgDistToCentroid = (color: RGBColor) => {
    return Math.hypot(
      (color.r - centroid.r) / 255,
      (color.g - centroid.g) / 255,
      (color.b - centroid.b) / 255,
    );
  };

  while (selected.length < targetColors && candidates.length > 0) {
    let best: RGBColor | null = null;
    let bestIdx = -1;
    let bestValue = -Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const dist = avgDistToCentroid(c);
      let minDist = Infinity;
      for (const s of selected) {
        const d = rgbDistance(c, s);
        if (d < minDist) minDist = d;
      }
      const value = dist * (selected.length === 0 ? 1 : minDist);
      if (value > bestValue) {
        bestValue = value;
        best = c;
        bestIdx = i;
      }
    }
    if (!best) break;
    selected.push(best);
    candidates.splice(bestIdx, 1);
  }

  let primary: RGBColor;
  let secondary: RGBColor;

  if (selected.length >= 2) {
    // Find the pair with largest hue distance
    let bestPair: [RGBColor, RGBColor] = [selected[0], selected[1]];
    let bestDist = -1;
    const hsls = selected.map((c) => rgbToHsl(c));

    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const d = hslDistance(hsls[i], hsls[j]);
        if (d > bestDist) {
          bestDist = d;
          bestPair = [selected[i], selected[j]];
        }
      }
    }
    primary = makeBestPaletteColor(bestPair[0]);
    secondary = makeBestPaletteColor(bestPair[1]);
  } else {
    primary = makeBestPaletteColor(selected[0]);
    const hsl = rgbToHsl(primary);
    hsl.h = (hsl.h + 180) % 360;
    hsl.s = Math.min(60, hsl.s + 10);
    hsl.l = Math.max(19, hsl.l - 30);
    secondary = hslToRgb(hsl);
  }

  return { primary, secondary };
}

// ──────────────── 公开 API：封面提取 ────────────────

/**
 * 从封面 URL 提取主色/辅助色
 */
export async function extractCoverPalette(
  picUrl: string,
): Promise<Palette | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Image load failed"));
      i.src = picUrl;
    });
    return extractCoverPaletteFromImage(img);
  } catch {
    return null;
  }
}

// ──────────────── Worker 管理 ────────────────

let _worker: Worker | null = null;

function getFluidTextureWorker(): Worker {
  if (_worker) return _worker;
  _worker = new Worker(
    // @ts-expect-error -- import.meta.url 需要 ES2020+ module；webpack 在构建时解析 URL
    new URL("../workers/fluidTexture.worker.ts", import.meta.url),
  );
  return _worker;
}

interface FluidTextureResult {
  type: "success";
  blob: Blob;
}

interface FluidTextureError {
  type: "error";
  message: string;
}

/**
 * 设置流体背景到指定 DOM 容器
 *
 * Phase 1（同步，立即可用）：CSS 颜色变量
 * Phase 2（Worker/异步，不阻塞 UI）：流体纹理生成 + cross-fade 动画
 */
// ── 纹理缓存：同颜色+尺寸不重复生成 ──
const _textureCache = new Map<string, string>();

function _cacheKey(
  primary: RGBColor,
  secondary: RGBColor,
  w: number,
  h: number,
): string {
  return `${primary.r},${primary.g},${primary.b}|${secondary.r},${secondary.g},${secondary.b}|${w}x${h}`;
}

function _applyTextureToDom(
  style: CSSStyleDeclaration,
  container: HTMLElement,
  secondary: RGBColor,
  nextTexture: string,
) {
  const oldUrl = style.getPropertyValue("--playui-fluid-image").trim();
  style.background = `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`;

  if (oldUrl && oldUrl !== "none" && oldUrl !== 'url("")') {
    style.setProperty("--playui-fluid-opacity", "1");
    let start: number | null = null;
    const duration = 700;
    function step(ts: number) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      style.setProperty(
        "--playui-fluid-image",
        `-webkit-cross-fade(${oldUrl}, ${nextTexture}, ${t * 100}%)`,
      );
      if (t < 1) requestAnimationFrame(step);
      else {
        style.setProperty("--playui-fluid-image", nextTexture);
        style.setProperty("--playui-fluid-prev-image", "none");
      }
    }
    requestAnimationFrame(step);
  } else {
    style.setProperty("--playui-fluid-image", nextTexture);
    style.setProperty("--playui-fluid-opacity", "0");
    const curr = container.querySelector<HTMLElement>(".bg-fluid-curr");
    if (curr) {
      curr.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 700,
        easing: "linear",
        fill: "forwards",
      });
    }
    setTimeout(() => style.setProperty("--playui-fluid-opacity", "1"), 700);
  }
}

export function applyFluidBackground(
  container: HTMLElement,
  primary: RGBColor,
  secondary: RGBColor,
): void {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const style = container.style;

  // ── Phase 1: 颜色立即可用 ──
  style.setProperty("--playui-rgb", `${primary.r}, ${primary.g}, ${primary.b}`);
  style.setProperty(
    "--playui-rgb-dark",
    `${secondary.r}, ${secondary.g}, ${secondary.b}`,
  );
  style.setProperty(
    "--playui-rgb-light",
    `${primary.r}, ${primary.g}, ${primary.b}`,
  );

  // ── Phase 2: 纹理生成（缓存 + Worker） ──
  const cacheKey = _cacheKey(primary, secondary, width, height);
  const cached = _textureCache.get(cacheKey);
  if (cached) {
    _applyTextureToDom(style, container, secondary, cached);
    return;
  }

  function onTextureReady(nextTexture: string) {
    _textureCache.set(cacheKey, nextTexture);
    _applyTextureToDom(style, container, secondary, nextTexture);
  }

  const worker = getFluidTextureWorker();

  const onMessage = (
    e: MessageEvent<FluidTextureResult | FluidTextureError>,
  ) => {
    worker.removeEventListener("message", onMessage);
    const result = e.data;
    if (result.type === "error") {
      console.warn("[fluidBackground] Worker 纹理生成失败:", result.message);
      return;
    }
    const blobUrl = URL.createObjectURL(result.blob);
    const img = new Image();
    img.onload = () => onTextureReady(`url("${blobUrl}")`);
    img.src = blobUrl;
  };
  worker.addEventListener("message", onMessage);
  worker.postMessage({
    primary,
    secondary,
    targetWidth: width,
    targetHeight: height,
  });
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
