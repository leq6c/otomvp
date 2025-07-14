"use client";

import { useState, useEffect, useMemo } from "react";
import type { ClipCaption } from "@/types";
import { parseTimecode } from "@/lib/audio-utils";

export interface CaptionState {
  currentCaption: ClipCaption | null;
  nextCaption: ClipCaption | null;
  progress: number; // 0-100 percentage through current caption
}

export const useCaptions = (
  captions: ClipCaption[],
  currentTime: number,
  hasPlayed: boolean
): CaptionState => {
  const [captionState, setCaptionState] = useState<CaptionState>({
    currentCaption: null,
    nextCaption: null,
    progress: 0,
  });

  // Memoize parsed captions for performance
  const parsedCaptions = useMemo(() => {
    return captions.map((caption) => ({
      ...caption,
      startTime: parseTimecode(caption.timecode_start),
      endTime: parseTimecode(caption.timecode_end),
    }));
  }, [captions]);

  useEffect(() => {
    console.log("Has Played", hasPlayed);
    if (currentTime === -1 || hasPlayed) {
      setCaptionState({
        currentCaption: null,
        nextCaption: null,
        progress: 0,
      });
      return;
    }
    let currentCaption = parsedCaptions.find(
      (caption) =>
        currentTime >= caption.startTime && currentTime <= caption.endTime
    );

    const nextCaption = parsedCaptions.find(
      (caption) => caption.startTime > currentTime
    );

    if (!currentCaption && nextCaption) {
      currentCaption = nextCaption;
    }

    let progress = 0;
    if (currentCaption) {
      const duration = currentCaption.endTime - currentCaption.startTime;
      const elapsed = currentTime - currentCaption.startTime;
      progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
    }

    setCaptionState({
      currentCaption: currentCaption || null,
      nextCaption: nextCaption || null,
      progress,
    });
  }, [parsedCaptions, currentTime, hasPlayed]);

  return captionState;
};
