import { defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YSpecCanvas",
  setup() {
    const store = useStore();
    const canvas = ref<HTMLCanvasElement | null>();
    return {
      player: store.state.player,
      setting: store.state.setting,
      canvas,
    };
  },
  beforeUnmount() {
    this.canvas = null;
  },
  data() {
    return {
      dataArray: null as null | Uint8Array,
      showSpectrum: true,
    };
  },
  mounted() {
    this.showSpectrum = this.setting.playui.spectrum;
    if (this.player._analyserNode) {
      this.dataArray = new Uint8Array(
        this.player._analyserNode.frequencyBinCount,
      );
      this.setupCanvas();
    }
  },
  methods: {
    setupCanvas() {
      const canvas = this.canvas;
      if (!canvas) {
        // console.log("canvas not found");
        return;
      }

      // 提高 canvas 分辨率，解决模糊问题
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * scale;
      canvas.height = canvas.clientHeight * scale;
      canvas.style.width = `${canvas.clientWidth}px`;
      canvas.style.height = `${canvas.clientHeight}px`;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) {
        // console.log("canvas context not found");
        return;
      }
      canvasCtx.scale(scale, scale); // 适配缩放

      // 起始频率和截止频率（单位：赫兹 Hz）
      const minFreq = 80; // 提高起始频率，避免极低频噪音
      const maxFreq = 12000; // 截止频率

      // 获取频谱数据的采样率
      const sampleRate = this.player._analyserNode?.context.sampleRate ?? 44100;
      const bufferLength = this.dataArray?.length ?? 0;

      // 将起始频率和截止频率映射到 dataArray 的索引
      const minIndex = Math.floor((minFreq / (sampleRate / 2)) * bufferLength);
      const maxIndex = Math.floor((maxFreq / (sampleRate / 2)) * bufferLength);

      // 使用对数映射函数，针对音乐频谱优化
      const logScale = (normalizedIndex: number) => {
        const range = maxIndex - minIndex;
        // 特殊处理第0条，让其对应较有意义的低频
        if (normalizedIndex === 0) {
          return minIndex + Math.floor(range * 0.07); // 对应约5%位置的频率
        }
        // 其他使用幂函数映射
        const logIndex = Math.floor(Math.pow(normalizedIndex, 0.7) * range);
        return Math.min(minIndex + logIndex, maxIndex - 1);
      };

      const draw = () => {
        requestAnimationFrame(draw);
        if (this.dataArray && this.player._analyserNode) {
          this.player._analyserNode.getByteFrequencyData(this.dataArray as any);
        }

        // 清除画布，保持透明背景
        canvasCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        if (!this.dataArray) {
          return;
        }

        // 使用固定数量的条形，增加条形数量以更好分布频率
        const barCount = 70; // 增加条形数量，更好展现钢琴音域
        const totalWidth = canvas.clientWidth;
        const centerX = totalWidth / 2;
        const barWidth = centerX / barCount;
        const barSpacing = barWidth * 0.15;
        const actualBarWidth = barWidth - barSpacing;

        for (let i = 0; i < barCount; i++) {
          // 使用对数映射获取数据索引
          const dataIndex = logScale(i / barCount);
          const value = this.dataArray[dataIndex] || 0;
          const barHeight = (value / 255) * canvas.clientHeight * 1;

          if (barHeight < 1) continue; // 跳过太小的条形

          const barY = canvas.clientHeight - barHeight;

          // 创建渐变颜色，根据音量动态变化
          const gradient = canvasCtx.createLinearGradient(
            0,
            barY,
            0,
            canvas.clientHeight,
          );

          // 使用青绿色系渐变
          const hue = 160 + (value / 255) * 40; // 从青色到绿色
          const lightness = 45 + (value / 255) * 15; // 动态亮度
          gradient.addColorStop(0, `hsl(${hue}, 70%, ${lightness + 15}%)`);
          gradient.addColorStop(1, `hsl(${hue}, 70%, ${lightness}%)`);

          if (i === 0) {
            // 第0条只在中心显示一条
            const barX = centerX - actualBarWidth / 2;

            // 绘制主体条形
            canvasCtx.fillStyle = gradient;
            const radius = Math.min(3, actualBarWidth / 2); // 圆角半径

            canvasCtx.beginPath();
            canvasCtx.moveTo(barX, barY + barHeight); // 左下角
            canvasCtx.lineTo(barX, barY + radius); // 左侧
            canvasCtx.quadraticCurveTo(barX, barY, barX + radius, barY); // 左上角圆角
            canvasCtx.lineTo(barX + actualBarWidth - radius, barY); // 顶部
            canvasCtx.quadraticCurveTo(
              barX + actualBarWidth,
              barY,
              barX + actualBarWidth,
              barY + radius,
            ); // 右上角圆角
            canvasCtx.lineTo(barX + actualBarWidth, barY + barHeight); // 右侧
            canvasCtx.closePath();
            canvasCtx.fill();

            // 添加顶部高光效果
            if (barHeight > 8) {
              const highlightHeight = Math.min(12, barHeight * 0.3);
              const highlight = canvasCtx.createLinearGradient(
                0,
                barY,
                0,
                barY + highlightHeight,
              );
              highlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
              highlight.addColorStop(1, "rgba(255, 255, 255, 0)");

              canvasCtx.fillStyle = highlight;
              canvasCtx.beginPath();
              canvasCtx.moveTo(barX, barY + radius);
              canvasCtx.quadraticCurveTo(barX, barY, barX + radius, barY);
              canvasCtx.lineTo(barX + actualBarWidth - radius, barY);
              canvasCtx.quadraticCurveTo(
                barX + actualBarWidth,
                barY,
                barX + actualBarWidth,
                barY + radius,
              );
              canvasCtx.lineTo(barX + actualBarWidth, barY + highlightHeight);
              canvasCtx.lineTo(barX, barY + highlightHeight);
              canvasCtx.closePath();
              canvasCtx.fill();
            }
          } else {
            // 其他条形绘制左右两侧对称
            const leftBarX = centerX - actualBarWidth / 2 - i * barWidth;
            const rightBarX =
              centerX + actualBarWidth / 2 + (i - 1) * barWidth + barSpacing;

            // 绘制左侧和右侧条形
            for (const barX of [leftBarX, rightBarX]) {
              // 绘制主体条形
              canvasCtx.fillStyle = gradient;
              const radius = Math.min(3, actualBarWidth / 2); // 圆角半径

              canvasCtx.beginPath();
              canvasCtx.moveTo(barX, barY + barHeight); // 左下角
              canvasCtx.lineTo(barX, barY + radius); // 左侧
              canvasCtx.quadraticCurveTo(barX, barY, barX + radius, barY); // 左上角圆角
              canvasCtx.lineTo(barX + actualBarWidth - radius, barY); // 顶部
              canvasCtx.quadraticCurveTo(
                barX + actualBarWidth,
                barY,
                barX + actualBarWidth,
                barY + radius,
              ); // 右上角圆角
              canvasCtx.lineTo(barX + actualBarWidth, barY + barHeight); // 右侧
              canvasCtx.closePath();
              canvasCtx.fill();

              // 添加顶部高光效果
              if (barHeight > 8) {
                const highlightHeight = Math.min(12, barHeight * 0.3);
                const highlight = canvasCtx.createLinearGradient(
                  0,
                  barY,
                  0,
                  barY + highlightHeight,
                );
                highlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                highlight.addColorStop(1, "rgba(255, 255, 255, 0)");

                canvasCtx.fillStyle = highlight;
                canvasCtx.beginPath();
                canvasCtx.moveTo(barX, barY + radius);
                canvasCtx.quadraticCurveTo(barX, barY, barX + radius, barY);
                canvasCtx.lineTo(barX + actualBarWidth - radius, barY);
                canvasCtx.quadraticCurveTo(
                  barX + actualBarWidth,
                  barY,
                  barX + actualBarWidth,
                  barY + radius,
                );
                canvasCtx.lineTo(barX + actualBarWidth, barY + highlightHeight);
                canvasCtx.lineTo(barX, barY + highlightHeight);
                canvasCtx.closePath();
                canvasCtx.fill();
              }
            }
          }
        }
      };

      draw();
    },
  },
});
