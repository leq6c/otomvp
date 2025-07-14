import { useState, useCallback } from "react";
import { apiService } from "@/lib/api-service";
import type { Clip, ClipsResponse } from "@/types";

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClips = useCallback(async (conversationId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getClips(conversationId);

      if (response.success && response.data) {
        setClips(response.data.clips);
        return response.data;
      } else {
        setError(response.error || "Failed to load clips");
        return null;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load clips";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClip = useCallback(async (clipId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getClip(clipId);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || "Failed to load clip");
        return null;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load clip";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClipAudioUrl = useCallback(async (clipId: string) => {
    return await apiService.getClipAudioUrl(clipId);
  }, []);

  const getClipCommentAudioUrl = useCallback(async (clipId: string) => {
    return await apiService.getClipCommentAudioUrl(clipId);
  }, []);

  return {
    clips,
    loading,
    error,
    getClips,
    getClip,
    getClipAudioUrl,
    getClipCommentAudioUrl,
  };
}
