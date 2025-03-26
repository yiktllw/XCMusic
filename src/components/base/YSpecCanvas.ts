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

      const spacing = 5; // 条形图间距
      // 起始频率和截止频率（单位：赫兹 Hz）
      const minFreq = 20; // 起始频率
      const maxFreq = 12000; // 截止频率

      const draw = () => {
        requestAnimationFrame(draw);
        if (this.dataArray) {
          this.player._analyserNode?.getByteFrequencyData(this.dataArray);
        }
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (!this.dataArray) {
          // console.log("dataArray not found");
          return;
        }

        // 获取频谱数据的采样率
        const sampleRate =
          this.player._analyserNode?.context.sampleRate ?? 44100;

        // 计算数据数组的长度，即频率范围
        const bufferLength = this.dataArray.length;

        // 将起始频率和截止频率映射到 dataArray 的索引
        const minIndex = Math.floor(
          (minFreq / (sampleRate / 2)) * bufferLength,
        );
        const maxIndex = Math.floor(
          (maxFreq / (sampleRate / 2)) * bufferLength,
        );

        // 绘制条形图
        const barWidth =
          (canvas.clientWidth / (maxIndex - minIndex)) * 2.5 - spacing; // 根据选定频率范围调整宽度
        let barHeight,
          x = 0;

        for (let i = minIndex; i < maxIndex; i++) {
          // 高度计算
          barHeight = (this.dataArray[i] / 2) * 0.75; // 调整缩放系数

          canvasCtx.fillStyle = `rgba(32, 150, 90, 1)`;
          const barX = x;
          const barY = canvas.clientHeight - barHeight; // 改为 clientHeight

          // 绘制顶部带圆角的矩形
          const radius = 5; // 圆角半径，适用于顶部
          canvasCtx.beginPath();
          canvasCtx.moveTo(barX, barY + barHeight); // 左下角
          canvasCtx.lineTo(barX, barY + radius); // 左侧
          canvasCtx.quadraticCurveTo(barX, barY, barX + radius, barY); // 左上角圆角
          canvasCtx.lineTo(barX + barWidth - radius, barY); // 顶部
          canvasCtx.quadraticCurveTo(
            barX + barWidth,
            barY,
            barX + barWidth,
            barY + radius,
          ); // 右上角圆角
          canvasCtx.lineTo(barX + barWidth, barY + barHeight); // 右侧
          canvasCtx.closePath();
          canvasCtx.fill();

          x += barWidth + 1 + spacing;
        }
      };

      draw();
    },
  },
});
