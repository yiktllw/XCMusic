import YWindow from "@/components/base/YWindow.vue";
import { type IEqualizer, equalizerFreqsDisplay } from "@/dual/player";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YEqualizerWindow",
  components: {
    YWindow,
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const canvas = ref<HTMLCanvasElement | null>(null);
    const store = useStore();
    const player = store.state.player;
    const setting = store.state.setting;

    return {
      window,
      canvas,
      player,
      setting,
    };
  },
  data() {
    let equalizer: IEqualizer = {
      _32Hz: 0,
      _64Hz: 0,
      _125Hz: 0,
      _250Hz: 0,
      _500Hz: 0,
      _1kHz: 0,
      _2kHz: 0,
      _4kHz: 0,
      _8kHz: 0,
      _16kHz: 0,
    };
    const eqkeys = Object.keys(equalizer) as Array<keyof IEqualizer>;
    const freaDisplay = equalizerFreqsDisplay;

    return {
      equalizer,
      eqkeys,
      freaDisplay,
    };
  },
  emits: ["new-window-state"],
  mounted() {
    this.equalizer = this.setting.play.equalizer;
    this.$nextTick(() => {
      this.drawCurve();
    });
  },
  beforeUnmount() {
    this.window = null;
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    handleInput() {
      this.apply();
    },
    apply() {
      try {
        this.setting.play.equalizer = Object.assign(this.equalizer);
        this.player.setEqualizer(this.equalizer);
        this.drawCurve();
      } catch (e) {
        console.error(e);
      }
    },
    reset() {
      this.equalizer = {
        _32Hz: 0,
        _64Hz: 0,
        _125Hz: 0,
        _250Hz: 0,
        _500Hz: 0,
        _1kHz: 0,
        _2kHz: 0,
        _4kHz: 0,
        _8kHz: 0,
        _16kHz: 0,
      };
      this.apply();
    },
    drawCurve() {
      const canvas = this.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Layout parameters
      const paddingTop = 8;
      const paddingBottom = 20;
      const paddingLeft = 35;
      const paddingRight = 15;

      const plotHeight = height - paddingTop - paddingBottom;
      const plotWidth = width - paddingLeft - paddingRight;

      const zeroY = paddingTop + plotHeight / 2;
      const bottomY = height - paddingBottom;
      const topY = paddingTop;

      const pixelsPerDb = plotHeight / 24;

      // Logarithmic Scale Setup
      const minFreq = 32;
      const maxFreq = 20000;
      const minLog = Math.log10(minFreq);
      const maxLog = Math.log10(maxFreq);
      const logRange = maxLog - minLog;

      const getX = (freq: number) => {
        const logFreq = Math.log10(freq);
        return paddingLeft + ((logFreq - minLog) / logRange) * plotWidth;
      };
      const getY = (db: number) => zeroY - db * pixelsPerDb;

      // Draw grid lines (horizontal)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(128, 128, 128, 0.15)";
      ctx.lineWidth = 1;

      [12, 6, 0, -6].forEach((db) => {
        const y = getY(db);
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
      });
      ctx.stroke();

      // Draw grid lines (vertical - Logarithmic)
      ctx.beginPath();
      ctx.fillStyle = "rgba(128, 128, 128, 0.8)";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // 1. Draw Standard Log Grid Lines (Minor) - Faint
      const minorFreqs = [];
      const multipliers = [1, 10, 100, 1000, 10000];
      for (const m of multipliers) {
        for (let i = 1; i <= 9; i++) {
          const f = i * m;
          if (f >= minFreq && f <= maxFreq) {
            minorFreqs.push(f);
          }
        }
      }

      ctx.strokeStyle = "rgba(128, 128, 128, 0.08)";
      minorFreqs.forEach((f) => {
        const x = getX(f);
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
      });
      ctx.stroke();

      // 2. Draw Slider Frequency Lines & Labels - More visible
      ctx.beginPath();
      ctx.strokeStyle = "rgba(128, 128, 128, 0.2)";
      this.eqkeys.forEach((key) => {
        const freqStr = key
          .replace("_", "")
          .replace("Hz", "")
          .replace("k", "000");
        const f = parseInt(freqStr);
        const x = getX(f);

        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);

        // Label
        let label = key.replace("_", "").replace("Hz", "");
        ctx.fillText(label, x, bottomY + 4);
      });
      ctx.stroke();

      // Draw Axes
      ctx.beginPath();
      ctx.strokeStyle = "rgba(128, 128, 128, 0.8)";
      ctx.lineWidth = 1.5;

      // X-Axis (at -12dB)
      ctx.moveTo(paddingLeft, bottomY);
      ctx.lineTo(width - 5, bottomY);
      // X-Axis Arrow
      ctx.lineTo(width - 10, bottomY - 3);
      ctx.moveTo(width - 5, bottomY);
      ctx.lineTo(width - 10, bottomY + 3);

      // Y-Axis (at left edge)
      ctx.moveTo(paddingLeft, bottomY);
      ctx.lineTo(paddingLeft, paddingTop - 5);
      // Y-Axis Arrow
      ctx.lineTo(paddingLeft - 3, paddingTop);
      ctx.moveTo(paddingLeft, paddingTop - 5);
      ctx.lineTo(paddingLeft + 3, paddingTop);

      // Y-Axis Ticks & Labels
      ctx.fillStyle = "rgba(128, 128, 128, 0.8)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      [12, 6, 0, -6, -12].forEach((db) => {
        const y = getY(db);
        // Tick
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(paddingLeft - 4, y);
        // Label
        ctx.fillText(db > 0 ? `+${db}` : `${db}`, paddingLeft - 6, y);
      });

      ctx.stroke();

      // Draw Curve
      const gains = this.eqkeys.map((key) => this.equalizer[key]);
      const points = gains.map((gain, index) => {
        // Parse frequency from key (e.g., "_32Hz" -> 32)
        const freqStr = this.eqkeys[index]
          .replace("_", "")
          .replace("Hz", "")
          .replace("k", "000");
        const freq = parseInt(freqStr);
        return {
          x: getX(freq),
          y: getY(gain),
        };
      });

      ctx.beginPath();
      const computedStyle = getComputedStyle(canvas);
      ctx.strokeStyle =
        computedStyle.getPropertyValue("--font-color-main").trim() || "#fff";
      ctx.lineWidth = 2;

      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const midX = (p0.x + p1.x) / 2;
          ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
        }
      }

      ctx.stroke();

      // Fill area
      if (points.length > 0) {
        ctx.lineTo(points[points.length - 1].x, bottomY);
        ctx.lineTo(points[0].x, bottomY);
        ctx.closePath();
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fill();
      }
    },
  },
});
