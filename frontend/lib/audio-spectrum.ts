/**
 * Audio Spectrum Analysis using Web Audio API
 * Handles FFT calculations and frequency data processing
 */

export interface SpectrumConfig {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}

export interface FrequencyPoint {
  frequency: number;
  amplitude: number;
  decibels: number;
}

export class AudioSpectrumAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private frequencyData: Uint8Array | null = null;
  private frequencyBinCount = 0;

  constructor(private config: SpectrumConfig) {}

  async initialize(audioElement: HTMLAudioElement): Promise<void> {
    if (this.audioContext) return;

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create and configure AnalyserNode for FFT
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.minDecibels = this.config.minDecibels;
      this.analyser.maxDecibels = this.config.maxDecibels;

      // Connect audio element to analyser
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Initialize frequency data array
      this.frequencyBinCount = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(this.frequencyBinCount);

      // Resume context if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error("Failed to initialize audio spectrum analyzer:", error);
      throw error;
    }
  }

  /**
   * Perform FFT analysis and return frequency domain data
   */
  getFrequencySpectrum(): FrequencyPoint[] {
    if (!this.analyser || !this.frequencyData) {
      return [];
    }

    // Get frequency data from FFT
    this.analyser.getByteFrequencyData(this.frequencyData);

    const sampleRate = this.audioContext!.sampleRate;
    const nyquistFrequency = sampleRate / 2;
    const frequencyStep = nyquistFrequency / this.frequencyBinCount;

    // Convert FFT bins to frequency points
    const spectrum: FrequencyPoint[] = [];

    for (let i = 0; i < this.frequencyBinCount; i++) {
      const frequency = i * frequencyStep;
      const amplitude = this.frequencyData[i] / 255; // Normalize to 0-1
      const decibels =
        this.config.minDecibels +
        amplitude * (this.config.maxDecibels - this.config.minDecibels);

      spectrum.push({
        frequency: Math.round(frequency),
        amplitude: amplitude * 100, // Convert to percentage for visualization
        decibels,
      });
    }

    return spectrum;
  }

  /**
   * Get time domain data (waveform) with smoothing
   */
  getWaveform(): number[] {
    if (!this.analyser) return [];

    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    // Convert to normalized values and apply smoothing
    const rawWaveform = Array.from(dataArray).map(
      (value) => ((value - 128) / 128) * 100
    );

    // Apply smoothing filter
    return this.smoothWaveform(rawWaveform);
  }

  /**
   * Apply smoothing to waveform data using moving average
   */
  private smoothWaveform(data: number[], windowSize = 3): number[] {
    if (data.length === 0) return data;

    const smoothed: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;

      // Calculate moving average
      for (
        let j = Math.max(0, i - halfWindow);
        j <= Math.min(data.length - 1, i + halfWindow);
        j++
      ) {
        sum += data[j];
        count++;
      }

      smoothed[i] = sum / count;
    }

    return smoothed;
  }

  async resume(): Promise<void> {
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  destroy(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.frequencyData = null;
  }

  get isInitialized(): boolean {
    return this.audioContext !== null && this.analyser !== null;
  }

  get contextState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }
}
