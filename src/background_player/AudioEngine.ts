/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * AudioEngine.ts — AudioContext/Worklet/均衡器/频谱/输出设备 管理
 *---------------------------------------------------------------*/

import { type IEqualizer } from "@/dual/player";
import { getStorage, StorageKey } from "@/utils/render_storage";
import {
  WORKLET_PROCESSOR_NAME,
  equalizerKeys,
  normalizeEqualizer,
  getWorkletModuleURL,
} from "./types";

const ipcRenderer = window.electron?.ipcRenderer;

export interface AudioEngineHost {
  _audio: HTMLAudioElement;
  _preloadAudio: HTMLAudioElement;
  _outputAudio: HTMLAudioElement;
}

export class AudioEngine {
  _audioContext: AudioContext | null = null;
  _workletNode: AudioWorkletNode | null = null;
  _workletSetupPromise: Promise<void> | null = null;
  _workletReady: boolean = false;
  _workletErrorNotified: boolean = false;
  _workletPostGain: number = 1;
  _directOutput: boolean =
    getStorage(StorageKey.Setting_Play_DirectOutput) ?? true;
  _spectrumEnabled: boolean =
    getStorage(StorageKey.Setting_PlayUI_Spectrum) ?? false;
  _equalizer: IEqualizer = normalizeEqualizer(
    getStorage(StorageKey.Setting_Play_Equalizer),
  );
  _sourceNode: MediaElementAudioSourceNode | undefined;
  _preloadSourceNode: MediaElementAudioSourceNode | undefined;
  _destination: MediaStreamAudioDestinationNode | undefined;
  _analyserNode: AnalyserNode | undefined;
  _spectrumBuffer: Uint8Array | null = null;
  deviceInit: boolean = false;

  private host: AudioEngineHost;

  constructor(host: AudioEngineHost) {
    this.host = host;
  }

  initAudioContext() {
    if (this._audioContext) {
      return;
    }

    this._audioContext = new window.AudioContext();
    this._sourceNode = this._audioContext.createMediaElementSource(
      this.host._audio,
    );
    this._preloadSourceNode = this._audioContext.createMediaElementSource(
      this.host._preloadAudio,
    );
    this._destination = this._audioContext.createMediaStreamDestination();
    this.host._outputAudio.srcObject = this._destination.stream;
    void this.host._outputAudio.play().catch(() => undefined);

    this._workletSetupPromise = this.setupAudioWorklet();
    this._workletSetupPromise.catch((error) => {
      console.error("Failed to setup audio worklet", error);
    });
  }

  private async setupAudioWorklet() {
    if (
      !this._audioContext ||
      !this._sourceNode ||
      !this._preloadSourceNode ||
      !this._destination
    ) {
      return;
    }

    const audioContext = this._audioContext;
    const sourceNode = this._sourceNode;
    const preloadSourceNode = this._preloadSourceNode;
    const destinationNode = this._destination;

    try {
      await audioContext.audioWorklet.addModule(getWorkletModuleURL());

      // 防止 addModule 期间音频系统已被重建
      if (
        this._audioContext !== audioContext ||
        this._sourceNode !== sourceNode ||
        this._preloadSourceNode !== preloadSourceNode ||
        this._destination !== destinationNode
      ) {
        return;
      }

      const workletNode = new AudioWorkletNode(
        audioContext,
        WORKLET_PROCESSOR_NAME,
      );
      workletNode.onprocessorerror = (event: Event) => {
        console.error("AudioWorklet processor error", event);
      };

      sourceNode.connect(workletNode);
      preloadSourceNode.connect(workletNode);
      if (this._directOutput) {
        workletNode.connect(audioContext.destination);
      } else {
        workletNode.connect(this._destination);
      }
      this._workletNode = workletNode;
      this._workletReady = true;
      this._workletErrorNotified = false;

      this.applyEqualizerToWorklet();
      this.applyPostGainToWorklet();

      if (this._analyserNode) {
        try {
          sourceNode.disconnect(this._analyserNode);
        } catch (disconnectError) {
          console.error("Failed to reconnect analyser node", disconnectError);
        }
        this.connectSpectrumNode();
      } else if (this._spectrumEnabled) {
        this.toggleSpectrum(true);
      }
    } catch (error) {
      console.error("AudioWorklet initialization failed", error);

      this._workletNode = null;
      this._workletReady = false;

      try {
        sourceNode.disconnect();
      } catch (disconnectError) {
        console.error(
          "Failed to disconnect source node after worklet error",
          disconnectError,
        );
      }
      try {
        preloadSourceNode.disconnect();
      } catch (disconnectError) {
        console.error(
          "Failed to disconnect preload source node after worklet error",
          disconnectError,
        );
      }

      throw error;
    }

    await this.applyOutputDevice(
      getStorage(StorageKey.Setting_Play_Device) ?? "default",
    );
  }

  async ensureAudioGraphReady() {
    if (
      !this._audioContext ||
      !this._sourceNode ||
      !this._preloadSourceNode ||
      !this._destination
    ) {
      this.initAudioContext();
    }
    if (this._workletSetupPromise) {
      await this._workletSetupPromise;
      this._workletSetupPromise = null;
    }

    if (!this._workletNode || !this._workletReady) {
      if (!this._workletErrorNotified) {
        ipcRenderer?.send("player-error", {
          type: "error",
          message: "AudioWorklet 初始化失败，播放器已停止。",
        });
        this._workletErrorNotified = true;
      }
      throw new Error("AudioWorklet is required but unavailable");
    }
  }

  async resumeAudioContext() {
    if (!this._audioContext) {
      return;
    }
    if (this._audioContext.state === "suspended") {
      await this._audioContext.resume().catch((error) => {
        console.error("Failed to resume AudioContext", error);
      });
    }
  }

  private postWorkletMessage(message: unknown) {
    if (!this._workletNode) {
      return;
    }
    this._workletNode.port.postMessage(message);
  }

  applyEqualizerToWorklet() {
    const gains = equalizerKeys.map((key) => this._equalizer[key]);
    this.postWorkletMessage({ type: "setEqualizer", gains });
  }

  applyPostGainToWorklet() {
    this.postWorkletMessage({
      type: "setPostGain",
      value: this._workletPostGain,
    });
  }

  private connectSpectrumNode() {
    if (!this._analyserNode || !this._workletNode) {
      return;
    }
    this._workletNode.connect(this._analyserNode);
  }

  getSpectrumData(): Uint8Array | null {
    if (!this._analyserNode) return null;
    if (
      !this._spectrumBuffer ||
      this._spectrumBuffer.length !== this._analyserNode.frequencyBinCount
    ) {
      this._spectrumBuffer = new Uint8Array(
        this._analyserNode.frequencyBinCount,
      );
    }
    this._analyserNode.getByteFrequencyData(this._spectrumBuffer as any);
    return this._spectrumBuffer;
  }

  toggleSpectrum(enabled: boolean) {
    this._spectrumEnabled = enabled;

    if (enabled) {
      if (this._analyserNode) return;
      if (!this._audioContext || !this._workletNode) return;

      this._analyserNode = this._audioContext.createAnalyser();
      this._analyserNode.fftSize = 2048;
      this._analyserNode.smoothingTimeConstant = 0.8;
      this.connectSpectrumNode();
    } else {
      if (!this._analyserNode) return;

      try {
        this._workletNode?.disconnect(this._analyserNode);
      } catch (error) {
        console.error("Failed to disconnect analyser node", error);
      }

      this._analyserNode = undefined;
      this._spectrumBuffer = null;
    }
  }

  destroyAudioContext() {
    if (this._audioContext) {
      try {
        // 断开所有节点连接
        if (this._analyserNode) {
          try {
            this._workletNode?.disconnect(this._analyserNode);
          } catch (error) {
            console.error("Error disconnecting analyser source:", error);
          }
          this._analyserNode.disconnect();
        }
        if (this._workletNode) {
          this._workletNode.disconnect();
        }
        if (this._sourceNode) {
          this._sourceNode.disconnect();
        }
        if (this._preloadSourceNode) {
          this._preloadSourceNode.disconnect();
        }
        if (this._destination) {
          this._destination.disconnect();
        }
        // 停止输出音频
        if (this.host._outputAudio) {
          this.host._outputAudio.pause();
          this.host._outputAudio.srcObject = null;
        }
        // 关闭 AudioContext
        if (this._audioContext.state !== "closed") {
          void this._audioContext.close();
        }
      } catch (error) {
        console.error("Error destroying AudioContext:", error);
      } finally {
        // 重置所有引用
        this._audioContext = null;
        this._sourceNode = undefined;
        this._preloadSourceNode = undefined;
        this._destination = undefined;
        this._analyserNode = undefined;
        this._workletNode = null;
        this._workletSetupPromise = null;
        this._workletReady = false;
        this._workletErrorNotified = false;
      }
    }
  }

  setEqualizer(equalizer: IEqualizer) {
    this._equalizer = normalizeEqualizer(equalizer);
    this.applyEqualizerToWorklet();
  }

  getEqualizer(): IEqualizer {
    return { ...this._equalizer };
  }

  private async applyOutputDevice(value: string) {
    const outputAudio = this.host._outputAudio as HTMLAudioElement & {
      setSinkId?: (sinkId: string) => Promise<void>;
    };

    if (typeof outputAudio.setSinkId !== "function") {
      return;
    }

    await outputAudio.setSinkId(value).catch((error) => {
      console.error(error);
    });
  }

  async setDevice(value: string) {
    try {
      await this.ensureAudioGraphReady();
    } catch (error) {
      console.error("Audio graph is not ready", error);
      return;
    }
    await this.applyOutputDevice(value);
  }

  get sampleRate(): number {
    return this._audioContext?.sampleRate ?? 44100;
  }

  get device(): string {
    const outputAudio = this.host._outputAudio as HTMLAudioElement & {
      sinkId?: string;
    };
    return outputAudio.sinkId ?? "default";
  }
}
