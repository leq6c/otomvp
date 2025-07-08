"use client";

import { useState, useCallback } from "react";
import { apiService, type ApiResponse } from "@/lib/api-service";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiCall();

        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || "Unknown error",
          });
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hooks for common operations
export function useUpload() {
  const { execute, loading, error } = useApi<{ id: string; status: string }>();
  const [progress, setProgress] = useState<number>(0);

  const uploadFile = useCallback(
    async (file: File, onProgress?: (progress: number) => void) => {
      setProgress(0);
      return await execute(() =>
        apiService.uploadFile(file, (progressValue) => {
          setProgress(progressValue);
          if (onProgress) {
            onProgress(progressValue);
          }
        })
      );
    },
    [execute]
  );

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  return {
    uploadFile,
    loading,
    error,
    progress,
    resetProgress,
  };
}

export function useProfile() {
  const getProfileApi = useApi();
  const updateProfileApi = useApi();

  const getProfile = useCallback(async () => {
    return await getProfileApi.execute(() => apiService.getUser());
  }, [getProfileApi.execute]);

  const updateProfile = useCallback(
    async (profileData: any) => {
      return await updateProfileApi.execute(() =>
        apiService.updateUser(profileData)
      );
    },
    [updateProfileApi.execute]
  );

  return {
    getProfile,
    updateProfile,
    profileData: getProfileApi.data,
    profileLoading: getProfileApi.loading,
    profileError: getProfileApi.error,
    updateLoading: updateProfileApi.loading,
    updateError: updateProfileApi.error,
  };
}

export function useConversations() {
  const listApi = useApi();
  const getApi = useApi();

  const getConversations = useCallback(async () => {
    return await listApi.execute(() => apiService.getConversations());
  }, [listApi.execute]);

  const getConversation = useCallback(
    async (conversationId: string) => {
      return await getApi.execute(() =>
        apiService.getConversation(conversationId)
      );
    },
    [getApi.execute]
  );

  return {
    getConversations,
    getConversation,
    conversations: listApi.data,
    conversationsLoading: listApi.loading,
    conversationsError: listApi.error,
    conversation: getApi.data,
    conversationLoading: getApi.loading,
    conversationError: getApi.error,
  };
}

export function useAnalysis() {
  const { execute, data, loading, error } = useApi();

  const getAnalysis = useCallback(
    async (conversationId: string) => {
      return await execute(() => apiService.getAnalysis(conversationId));
    },
    [execute]
  );

  return {
    getAnalysis,
    analysisData: data,
    analysisLoading: loading,
    analysisError: error,
  };
}

export function useTranscript() {
  const { execute, data, loading, error } = useApi();

  const getTranscript = useCallback(
    async (conversationId: string) => {
      return await execute(() => apiService.getTranscript(conversationId));
    },
    [execute]
  );

  return {
    getTranscript,
    transcriptData: data,
    transcriptLoading: loading,
    transcriptError: error,
  };
}

export function usePoints() {
  const { execute, data, loading, error } = useApi();

  const getPoints = useCallback(async () => {
    return await execute(() => apiService.getPoints());
  }, [execute]);

  return {
    getPoints,
    pointsData: data,
    pointsLoading: loading,
    pointsError: error,
  };
}

export function useTrends() {
  const trendsApi = useApi();
  const microTrendsApi = useApi();
  const trendApi = useApi();
  const microTrendApi = useApi();

  const getTrends = useCallback(async () => {
    return await trendsApi.execute(() => apiService.getTrends());
  }, [trendsApi.execute]);

  const getMicroTrends = useCallback(async () => {
    return await microTrendsApi.execute(() => apiService.getMicroTrends());
  }, [microTrendsApi.execute]);

  const getTrend = useCallback(
    async (trendId: string) => {
      return await trendApi.execute(() => apiService.getTrend(trendId));
    },
    [trendApi.execute]
  );

  const getMicroTrend = useCallback(
    async (microtrendId: string) => {
      return await microTrendApi.execute(() =>
        apiService.getMicroTrend(microtrendId)
      );
    },
    [microTrendApi.execute]
  );

  return {
    getTrends,
    getMicroTrends,
    getTrend,
    getMicroTrend,
    trends: trendsApi.data,
    trendsLoading: trendsApi.loading,
    trendsError: trendsApi.error,
    microTrends: microTrendsApi.data,
    microTrendsLoading: microTrendsApi.loading,
    microTrendsError: microTrendsApi.error,
    trend: trendApi.data,
    trendLoading: trendApi.loading,
    trendError: trendApi.error,
    microTrend: microTrendApi.data,
    microTrendLoading: microTrendApi.loading,
    microTrendError: microTrendApi.error,
  };
}
