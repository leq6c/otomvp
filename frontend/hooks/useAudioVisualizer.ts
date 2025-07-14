"use client";

import { useRef, useCallback, useEffect, useState } from "react";

export const useAudioVisualizer = (
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean
) => {
  const [frequencyData, setFrequencyData] = useState<
    { x: number; y: number }[]
  >([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const setupAudioContext = useCallback(() => {
    if (!audioElement || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Smaller for better performance
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (error) {
      console.error("Failed to setup audio context:", error);
    }
  }, [audioElement]);

  const startVisualization = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateFrequencyData = () => {
      if (!isPlaying) {
        setFrequencyData([]);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
      analyser.getByteFrequencyData(dataArray);

      // Convert to array of numbers and normalize
      const normalizedData = Array.from(dataArray).map((value, index) => ({
        x: index,
        y: (value / 255) * 100, // Normalize to 0-100
      }));

      setFrequencyData(normalizedData);
    };

    updateFrequencyData();
  }, [isPlaying]);

  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setFrequencyData([]);
  }, []);

  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startVisualization();
    } else {
      stopVisualization();
    }
  }, [isPlaying, startVisualization, stopVisualization]);

  return {
    frequencyData,
    setupAudioContext,
    resumeAudioContext,
    stopVisualization,
  };
};
