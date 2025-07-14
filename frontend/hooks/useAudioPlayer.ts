"use client";

import { useState, useRef, useCallback, useMemo } from "react";

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  hasPlayed: boolean;
}

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    hasPlayed: false,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const updateState = useCallback((updates: Partial<AudioPlayerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      updateState({ isLoading: true, error: null });
      audioRef.current.playbackRate = 1.2;
      await audioRef.current.play();
      updateState({
        isPlaying: true,
        isLoading: false,
        currentTime: audioRef.current.currentTime,
      });
      setTimeout(() => {
        if (audioRef.current) {
          updateState({ currentTime: audioRef.current.currentTime });
        }
      }, 10);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to play audio";
      updateState({ error: errorMessage, isLoading: false });
    }
  }, [updateState]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      updateState({ isPlaying: false });
    }
  }, [updateState]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      updateState({ isPlaying: false, currentTime: 0, hasPlayed: true });
    }
  }, [updateState]);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        updateState({ currentTime: time });
      }
    },
    [updateState]
  );

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      updateState({ currentTime: audioRef.current.currentTime });
    }
  }, [updateState]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      updateState({ duration: audioRef.current.duration });
    }
  }, [updateState]);

  const handleEnded = useCallback(() => {
    updateState({ isPlaying: false, currentTime: 0, hasPlayed: true });
  }, [updateState]);

  const handlePlay = useCallback(() => {
    updateState({ isPlaying: true });
  }, [updateState]);

  const handlePause = useCallback(() => {
    updateState({ isPlaying: false });
  }, [updateState]);

  const handleError = useCallback(() => {
    if (audioRef.current?.error) {
      updateState({
        error: `Audio error: ${audioRef.current.error.message}`,
        isPlaying: false,
        isLoading: false,
      });
    }
  }, [updateState]);

  const eventHandlers = useMemo(
    () => ({
      handleTimeUpdate,
      handleLoadedMetadata,
      handleEnded,
      handlePlay,
      handlePause,
      handleError,
    }),
    [
      handleTimeUpdate,
      handleLoadedMetadata,
      handleEnded,
      handlePlay,
      handlePause,
      handleError,
    ]
  );

  const actions = useMemo(
    () => ({
      play,
      pause,
      stop,
      seek,
    }),
    [play, pause, stop, seek]
  );

  return {
    audioRef,
    state,
    actions,
    eventHandlers,
  };
};
