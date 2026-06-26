/*---------------------------------------------------------------*
 * fluidTexture.worker.ts
 * Web Worker —— 在后台线程用 OffscreenCanvas 生成流体背景纹理
 * 完全不阻塞主线程 UI
 *---------------------------------------------------------------*/

import {
  clampColorChannel,
  computeAverageLuminance,
  applyBrightnessContrast,
  computeTextureSizes,
  createJavaRandom,
  type FluidTextureInput,
  generateFBMTextureData,
  makeGaussianKernelJavaLike,
  convolveAndTransposeJavaLike,
  applyTwirlFilter,
} from "@/utils/fluidTextureCore";

// ──────────────── OffscreenCanvas 版高斯模糊 ────────────────

function gaussianBlurOffscreen(
  source: OffscreenCanvas,
  radius: number,
): OffscreenCanvas {
  const width = source.width;
  const height = source.height;
  const ctx = source.getContext("2d")!;
  const srcImage = ctx.getImageData(0, 0, width, height);
  const srcPixels = srcImage.data;

  const inPixels = new Int32Array(width * height);
  const convOutPixels = new Int32Array(width * height);
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
      convOutPixels,
      width,
      height,
      true,
      true,
      false,
      CLAMP_EDGES,
    );
    convolveAndTransposeJavaLike(
      kernel,
      convOutPixels,
      inPixels,
      height,
      width,
      true,
      false,
      true,
      CLAMP_EDGES,
    );
  }

  const outCanvas = new OffscreenCanvas(width, height);
  const outCtx = outCanvas.getContext("2d")!;
  const outImage = outCtx.createImageData(width, height);
  const outPixels = outImage.data;

  for (let i = 0, p = 0; p < inPixels.length; p++, i += 4) {
    const pixel = inPixels[p];
    outPixels[i] = (pixel >>> 16) & 0xff;
    outPixels[i + 1] = (pixel >>> 8) & 0xff;
    outPixels[i + 2] = pixel & 0xff;
    outPixels[i + 3] = (pixel >>> 24) & 0xff;
  }
  outCtx.putImageData(outImage, 0, 0);
  return outCanvas;
}

// ──────────────── OffscreenCanvas 版双线性缩放 ────────────────

function resizeBilinearOffscreen(
  source: OffscreenCanvas,
  targetW: number,
  targetH: number,
): OffscreenCanvas {
  const srcW = source.width;
  const srcH = source.height;
  const ctx = source.getContext("2d")!;
  const srcPixels = ctx.getImageData(0, 0, srcW, srcH).data;

  const ONE_32 = 4294967296;
  const HALF_32 = 2147483648;
  const FRACT_SHIFT_24 = 16777216;

  const toLong = (value: number) => {
    const scaled = value * ONE_32;
    return scaled < 0 ? Math.ceil(scaled) : Math.floor(scaled);
  };
  const wholeOfLong = (value: number) => Math.floor(value / ONE_32);
  const fractOfLong = (value: number) => value - wholeOfLong(value) * ONE_32;

  const outCanvas = new OffscreenCanvas(targetW, targetH);
  const outCtx = outCanvas.getContext("2d")!;
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

// ──────────────── 主纹理生成（纯 OffscreenCanvas） ────────────────

function generateTextureOnOffscreen(
  primary: { r: number; g: number; b: number },
  secondary: { r: number; g: number; b: number },
  targetWidth: number,
  targetHeight: number,
): OffscreenCanvas {
  const { fbmW, fbmH, reducedW, reducedH } = computeTextureSizes(
    targetWidth,
    targetHeight,
  );

  const SEED = Date.now();
  const angleRandom = createJavaRandom(SEED);

  // ── Phase 1: FBM 噪声 ──
  const fbmData = generateFBMTextureData(
    primary,
    secondary,
    fbmW,
    fbmH,
    SEED,
    SEED,
  );

  const fbmCanvas = new OffscreenCanvas(fbmW, fbmH);
  const fbmCtx = fbmCanvas.getContext("2d")!;
  const imageData = fbmCtx.createImageData(fbmW, fbmH);
  imageData.data.set(fbmData);
  fbmCtx.putImageData(imageData, 0, 0);

  // ── Phase 2: 缩放到 256 ──
  const reducedCanvas = resizeBilinearOffscreen(fbmCanvas, reducedW, reducedH);
  const reducedCtx = reducedCanvas.getContext("2d")!;
  const sourceData = reducedCtx.getImageData(0, 0, reducedW, reducedH);

  // ── Phase 3: Twirl 滤镜 ──
  const twirlCanvas = new OffscreenCanvas(reducedW, reducedH);
  const twirlCtx = twirlCanvas.getContext("2d")!;
  const twirledImage = twirlCtx.createImageData(reducedW, reducedH);
  const twirlAngle = ((angleRandom.nextInt(340) + 10) * Math.PI) / 180;

  applyTwirlFilter(
    new Uint8ClampedArray(sourceData.data.buffer),
    new Uint8ClampedArray(twirledImage.data.buffer),
    reducedW,
    reducedH,
    twirlAngle,
  );
  twirlCtx.putImageData(twirledImage, 0, 0);

  // ── Phase 4: 高斯模糊 ──
  const gaussianRadius = Math.max(1, reducedW * 0.3);
  const blurCanvas = gaussianBlurOffscreen(twirlCanvas, gaussianRadius);

  // ── Phase 5: 缩放回目标尺寸 ──
  const finalCanvas = resizeBilinearOffscreen(blurCanvas, fbmW, fbmH);
  const finalCtx = finalCanvas.getContext("2d")!;
  const finalData = finalCtx.getImageData(0, 0, fbmW, fbmH);
  const finalPixels = finalData.data as Uint8ClampedArray;

  // ── Phase 6: 亮度/对比度 ──
  const avgLum = computeAverageLuminance(finalPixels, fbmW, fbmH);
  applyBrightnessContrast(finalPixels, avgLum);
  finalCtx.putImageData(finalData, 0, 0);

  return finalCanvas;
}

// ──────────────── Worker 消息处理 ────────────────

self.onmessage = async (e: MessageEvent<FluidTextureInput>) => {
  const { primary, secondary, targetWidth, targetHeight } = e.data;

  try {
    const offscreen = generateTextureOnOffscreen(
      primary,
      secondary,
      targetWidth,
      targetHeight,
    );

    // 将 OffscreenCanvas 转换为 Blob 传回主线程
    // 注意：Blob 不是 Transferable 对象，不能放入 transfer list
    // 结构化克隆 ~50KB PNG 代价可忽略（<1ms）
    const blob = await offscreen.convertToBlob({ type: "image/png" });
    self.postMessage({ type: "success", blob });
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

// 告知 TypeScript 这是 Worker 上下文
export {};
