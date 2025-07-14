"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  AudioSpectrumAnalyzer,
  type FrequencyPoint,
  type SpectrumConfig,
} from "@/lib/audio-spectrum";

export interface SpectrumHookConfig extends SpectrumConfig {
  updateInterval: number; // milliseconds
  enabled: boolean;
}

const DEFAULT_CONFIG: SpectrumHookConfig = {
  fftSize: 2048, // Higher resolution for smoother waveform
  smoothingTimeConstant: 0.9, // Increased smoothing
  minDecibels: -90,
  maxDecibels: -10,
  updateInterval: 3, // ~30 FPS for smoother animation
  enabled: true,
};

export interface SpectrumState {
  frequencySpectrum: FrequencyPoint[];
  waveform: number[];
  isAnalyzing: boolean;
  error: string | null;
}

export type SpectrumData = {
  frequency: number;
  amplitude: number;
};

export const useAudioSpectrum = (
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean,
  config: Partial<SpectrumHookConfig> = {}
) => {
  const finalConfig = useMemo(() => {
    return { ...DEFAULT_CONFIG, ...config };
  }, [
    config.fftSize,
    config.smoothingTimeConstant,
    config.minDecibels,
    config.maxDecibels,
    config.updateInterval,
    config.enabled,
  ]);

  const [state, setState] = useState<SpectrumState>({
    frequencySpectrum: [],
    waveform: [],
    isAnalyzing: false,
    error: null,
  });

  const analyzerRef = useRef<AudioSpectrumAnalyzer | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const previousWaveformRef = useRef<number[]>([]);

  const updateState = useCallback((updates: Partial<SpectrumState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Interpolate between previous and current waveform for smoother transitions
  const interpolateWaveform = useCallback(
    (current: number[], previous: number[], factor = 0.7): number[] => {
      if (previous.length === 0) return current;
      if (current.length !== previous.length) return current;

      return current.map((value, index) => {
        const prevValue = previous[index] || 0;
        return prevValue * (1 - factor) + value * factor;
      });
    },
    []
  );

  // Initialize spectrum analyzer
  const initializeAnalyzer = useCallback(async () => {
    if (
      !audioElement ||
      !finalConfig.enabled ||
      analyzerRef.current?.isInitialized
    ) {
      return;
    }

    try {
      analyzerRef.current = new AudioSpectrumAnalyzer(finalConfig);
      await analyzerRef.current.initialize(audioElement);
      updateState({ error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize spectrum analyzer";
      updateState({ error: errorMessage });
    }
  }, [audioElement, finalConfig, updateState]);

  // FFT analysis loop
  const analyzeSpectrum = useCallback(() => {
    if (!analyzerRef.current?.isInitialized || !isPlaying) {
      updateState({
        frequencySpectrum: [],
        waveform: [],
        isAnalyzing: false,
      });
      return;
    }

    const now = performance.now();

    // Throttle updates based on updateInterval
    if (now - lastUpdateRef.current >= finalConfig.updateInterval) {
      const frequencySpectrum = analyzerRef.current.getFrequencySpectrum();
      const rawWaveform = analyzerRef.current.getWaveform();

      // Apply interpolation for smoother waveform
      const smoothWaveform = interpolateWaveform(
        rawWaveform,
        previousWaveformRef.current,
        0.9
      );
      previousWaveformRef.current = smoothWaveform;

      updateState({
        frequencySpectrum,
        waveform: smoothWaveform,
        isAnalyzing: true,
      });

      lastUpdateRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(analyzeSpectrum);
  }, [isPlaying, finalConfig.updateInterval, updateState, interpolateWaveform]);

  // Start spectrum analysis
  const startAnalysis = useCallback(() => {
    if (analyzerRef.current?.isInitialized && isPlaying) {
      analyzeSpectrum();
    }
  }, [analyzeSpectrum, isPlaying]);

  // Stop spectrum analysis
  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    previousWaveformRef.current = [];
    updateState({
      frequencySpectrum: [],
      waveform: [],
      isAnalyzing: false,
    });
  }, [updateState]);

  // Resume audio context
  const resumeContext = useCallback(async () => {
    if (analyzerRef.current) {
      await analyzerRef.current.resume();
    }
  }, []);

  // Effect: Initialize analyzer when audio element is available
  useEffect(() => {
    if (audioElement && finalConfig.enabled) {
      initializeAnalyzer();
    }
  }, [audioElement, finalConfig.enabled, initializeAnalyzer]);

  // Effect: Start/stop analysis based on playing state
  useEffect(() => {
    if (isPlaying && finalConfig.enabled) {
      startAnalysis();
    } else {
      stopAnalysis();
    }

    return stopAnalysis;
  }, [isPlaying, finalConfig.enabled, startAnalysis, stopAnalysis]);

  // Effect: Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
      if (analyzerRef.current) {
        analyzerRef.current.destroy();
        analyzerRef.current = null;
      }
    };
  }, [stopAnalysis]);

  const actions = useMemo(
    () => ({
      initializeAnalyzer,
      startAnalysis,
      stopAnalysis,
      resumeContext,
    }),
    [initializeAnalyzer, startAnalysis, stopAnalysis, resumeContext]
  );

  return {
    ...state,
    actions,
    config: finalConfig,
  };
};
