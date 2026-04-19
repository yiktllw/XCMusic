const WORKLET_PROCESSOR_NAME = "xc-audio-engine-processor";
const BAND_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

class XCBiquadBand {
  constructor() {
    this.reset();
    this.b0 = 1;
    this.b1 = 0;
    this.b2 = 0;
    this.a1 = 0;
    this.a2 = 0;
  }

  reset() {
    this.x1 = 0;
    this.x2 = 0;
    this.y1 = 0;
    this.y2 = 0;
  }

  update(sampleRateValue, frequency, q, gainDb) {
    const safeQ = q > 0 ? q : 1;
    const safeFreq = Math.max(10, Math.min(frequency, sampleRateValue * 0.45));
    const A = Math.pow(10, gainDb / 40);
    const omega = (2 * Math.PI * safeFreq) / sampleRateValue;
    const alpha = Math.sin(omega) / (2 * safeQ);
    const cosw = Math.cos(omega);

    const b0 = 1 + alpha * A;
    const b1 = -2 * cosw;
    const b2 = 1 - alpha * A;
    const a0 = 1 + alpha / A;
    const a1 = -2 * cosw;
    const a2 = 1 - alpha / A;

    if (!Number.isFinite(a0) || a0 === 0) {
      this.b0 = 1;
      this.b1 = 0;
      this.b2 = 0;
      this.a1 = 0;
      this.a2 = 0;
      return;
    }

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
  }

  process(sample) {
    const y =
      this.b0 * sample +
      this.b1 * this.x1 +
      this.b2 * this.x2 -
      this.a1 * this.y1 -
      this.a2 * this.y2;

    this.x2 = this.x1;
    this.x1 = sample;
    this.y2 = this.y1;
    this.y1 = y;

    return y;
  }
}

class XCAudioEngineProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.eqGains = new Array(BAND_FREQUENCIES.length).fill(0);
    this.targetPostGain = 1;
    this.q = 1.4;
    this.channelBands = [];
    this.lastSampleRate = sampleRate;
    this.rebuildBands(2);

    this.port.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "setEqualizer" && Array.isArray(data.gains)) {
        for (let i = 0; i < this.eqGains.length; i++) {
          const value = Number(data.gains[i]);
          this.eqGains[i] = Number.isFinite(value) ? value : 0;
        }
        this.refreshCoefficients();
      } else if (data.type === "setPostGain") {
        const gainValue = Number(data.value);
        this.targetPostGain = Number.isFinite(gainValue) ? gainValue : 1;
      }
    };
  }

  rebuildBands(channelCount) {
    this.channelBands = [];
    for (let channel = 0; channel < channelCount; channel++) {
      const bands = [];
      for (let index = 0; index < BAND_FREQUENCIES.length; index++) {
        const band = new XCBiquadBand();
        band.update(
          sampleRate,
          BAND_FREQUENCIES[index],
          this.q,
          this.eqGains[index],
        );
        bands.push(band);
      }
      this.channelBands.push(bands);
    }
  }

  ensureChannelCount(channelCount) {
    if (this.channelBands.length === channelCount) {
      return;
    }
    this.rebuildBands(channelCount);
  }

  refreshCoefficients() {
    for (let channel = 0; channel < this.channelBands.length; channel++) {
      for (let index = 0; index < BAND_FREQUENCIES.length; index++) {
        this.channelBands[channel][index].update(
          sampleRate,
          BAND_FREQUENCIES[index],
          this.q,
          this.eqGains[index],
        );
      }
    }
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!output || output.length === 0) {
      return true;
    }

    if (sampleRate !== this.lastSampleRate) {
      this.lastSampleRate = sampleRate;
      this.refreshCoefficients();
    }

    this.ensureChannelCount(output.length);

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      const inputChannel = (input && (input[channel] || input[0])) || null;
      if (!inputChannel) {
        outputChannel.fill(0);
        continue;
      }

      const bands = this.channelBands[channel];
      for (let i = 0; i < outputChannel.length; i++) {
        let value = inputChannel[i] || 0;
        for (let bandIndex = 0; bandIndex < bands.length; bandIndex++) {
          value = bands[bandIndex].process(value);
        }

        let out = value * this.targetPostGain;
        if (!Number.isFinite(out)) {
          out = 0;
        }
        outputChannel[i] = out;
      }
    }

    return true;
  }
}

registerProcessor(WORKLET_PROCESSOR_NAME, XCAudioEngineProcessor);
