const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConversationResponse {
  id: string;
  user_id: string;
  status: "not_started" | "processing" | "completed" | "failed";
  inner_status: string;
  created_at: string;
  updated_at: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  available_duration?: string;
  language?: string;
  situation?: string;
  place?: string;
  time?: string;
  location?: string;
  points: number;
}

export interface ConversationJobResponse {
  status: string;
  started_at: string;
  estimated_run_time_in_seconds: number;
}

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  name?: string;
  age?: number;
  nationality?: string;
  first_language?: string;
  second_languages?: string;
  interests?: string;
  preferred_topics?: string;
}

export interface UpdateUserProfile {
  name?: string;
  age?: number;
  nationality?: string;
  first_language?: string;
  second_languages?: string;
  interests?: string;
  preferred_topics?: string;
}

export interface AnalysisResponse {
  availableDuration: string;
  language: string;
  situation: string;
  place: string;
  time: string;
  location: string;
  spokenContents: Array<{
    id: string;
    text: string;
    checked: boolean;
    timestamp?: string;
    isKeyMoment?: boolean;
    sentiment?: "positive" | "neutral" | "negative";
  }>;
  pointsEarned: number;
  aiSummary?: string;
  sentimentTimeline?: Array<{
    type: "positive" | "neutral" | "negative";
    percentage: number;
  }>;
  keywords?: Array<{
    text: string;
    weight: number;
    id: string;
  }>;
  advice?: string[];
  boringRate?: number;
  density?: number;
  clarityScore?: number;
  engagementScore?: number;
}

export interface TranscriptResponse {
  id: string;
  created_at: string;
  updated_at: string;
  captions: Array<{
    id: number;
    caption: string;
    speaker: string;
    timecode: string;
  }>;
}

export interface PointResponse {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  points: number;
}

export interface TrendResponse {
  id: string;
  title: string;
  description: string;
  volume: number;
  overall_positive_sentiment: number;
  overall_negative_sentiment: number;
  cluster_id: number;
  created_at: string;
  updated_at: string;
}

export interface MicroTrendResponse {
  id: string;
  title: string;
  description: string;
  volume: number;
  overall_positive_sentiment: number;
  overall_negative_sentiment: number;
  created_at: string;
  updated_at: string;
}

export interface ClipResponse {
  id: string;
  conversation_id: string;
  created_at: string;
  updated_at: string;
  file_name: string;
  mime_type: string;
  title: string;
  description: string;
  comment: string;
  captions: Array<{
    timecode_start: string;
    timecode_end: string;
    speaker: string;
    caption: string;
  }>;
}

export interface ClipsListResponse {
  clips: ClipResponse[];
  total: number;
  conversation_id?: string;
}

export interface ClaimRequest {
  tx_base64: string;
}

export interface ClaimResponse {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface ClaimableAmountResponse {
  amount: number;
  display_amount: number;
}

class ApiService {
  private baseUrl: string;
  private userId: string;
  private token: string = "";
  private tokenRefresherFn: (() => Promise<string>) | null = null;

  constructor(userId: string = "default-user") {
    if (typeof window !== "undefined") {
      userId = localStorage.getItem("userId") || "default-user";
    }
    this.baseUrl = API_BASE_URL;
    this.userId = userId;
  }

  setToken(token: string): void {
    this.token = token;
  }

  setTokenRefresherFn(fn: () => Promise<string>): void {
    this.tokenRefresherFn = fn;
  }

  async getToken(): Promise<string> {
    if (this.tokenRefresherFn) {
      const token = await this.tokenRefresherFn();
      this.token = token;
    }
    return this.token;
  }

  private async getHeaders(): Promise<HeadersInit> {
    return {
      "Content-Type": "application/json",
      "Oto-User-Id": this.userId,
      Authorization: `Bearer ${await this.getToken()}`,
    };
  }

  private async getFormDataHeaders(): Promise<HeadersInit> {
    return {
      "Oto-User-Id": this.userId,
      Authorization: `Bearer ${await this.getToken()}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getClaimableAmount(): Promise<ApiResponse<ClaimableAmountResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/point/claimable_amount`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<ClaimableAmountResponse>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get claimable amount",
      };
    }
  }

  async claim(tx_base64: string): Promise<ApiResponse<ClaimResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/point/claim`, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify({ tx_base64 }),
      });
      return this.handleResponse<ClaimResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to claim",
      };
    }
  }

  // User Profile APIs
  async createUser(): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/user/create`, {
        method: "POST",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<{ id: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  async getUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/user/get`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<UserProfile>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get user profile",
      };
    }
  }

  async updateUser(
    profileData: UpdateUserProfile
  ): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/user/update`, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(profileData),
      });
      return this.handleResponse<{ id: string }>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user profile",
      };
    }
  }

  // Conversation APIs
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              data,
            });
          } else {
            resolve({
              success: false,
              error: `HTTP ${xhr.status}: ${xhr.responseText}`,
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to parse response",
          });
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        resolve({
          success: false,
          error: "Network error occurred during upload",
        });
      });

      // Handle abort
      xhr.addEventListener("abort", () => {
        resolve({
          success: false,
          error: "Upload was aborted",
        });
      });

      // Set up request
      xhr.open("POST", `${this.baseUrl}/conversation/create`);

      // Set headers (excluding Content-Type for FormData)
      this.getFormDataHeaders()
        .then((headers) => {
          Object.entries(headers).forEach(([key, value]) => {
            if (key !== "Content-Type") {
              // Let browser set Content-Type for FormData
              xhr.setRequestHeader(key, value as string);
            }
          });

          // Send the request
          xhr.send(formData);
        })
        .catch((error) => {
          resolve({
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to set headers",
          });
        });
    });
  }

  async getConversations(): Promise<ApiResponse<ConversationResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/conversation/list`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<ConversationResponse[]>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get conversations",
      };
    }
  }

  async getConversation(
    conversationId: string
  ): Promise<ApiResponse<ConversationResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversation/${conversationId}`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );
      return this.handleResponse<ConversationResponse>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get conversation",
      };
    }
  }

  async getConversationJob(
    conversationId: string
  ): Promise<ApiResponse<ConversationJobResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversation/${conversationId}/job`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );
      return this.handleResponse<ConversationJobResponse>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get conversation job",
      };
    }
  }

  // Analysis APIs
  async getAnalysis(
    conversationId: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analysis/${conversationId}`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );
      return this.handleResponse<AnalysisResponse>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get analysis",
      };
    }
  }

  // Transcript APIs
  async getTranscript(
    conversationId: string
  ): Promise<ApiResponse<TranscriptResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transcript/${conversationId}`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );
      const transcriptResponse = await this.handleResponse<TranscriptResponse>(
        response
      );
      console.log("transcriptResponse", transcriptResponse);
      // add incremental ids
      transcriptResponse.data?.captions.forEach((segment, index) => {
        segment.id = index + 1;
      });
      return transcriptResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get transcript",
      };
    }
  }

  // Points APIs
  async getPoints(): Promise<ApiResponse<PointResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/point/get`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<PointResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get points",
      };
    }
  }

  // Trend APIs
  async getTrends(): Promise<ApiResponse<TrendResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trend/trends`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<TrendResponse[]>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get trends",
      };
    }
  }

  async getMicroTrends(): Promise<ApiResponse<MicroTrendResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trend/microtrends`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<MicroTrendResponse[]>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get microtrends",
      };
    }
  }

  async getTrend(trendId: string): Promise<ApiResponse<TrendResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/trend/trends/${trendId}`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<TrendResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get trend",
      };
    }
  }

  async getMicroTrend(
    microtrendId: string
  ): Promise<ApiResponse<MicroTrendResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trend/microtrends/${microtrendId}`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );
      return this.handleResponse<MicroTrendResponse>(response);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get microtrend",
      };
    }
  }

  // Clip APIs
  async getClips(
    conversationId?: string
  ): Promise<ApiResponse<ClipsListResponse>> {
    try {
      const url = conversationId
        ? `${this.baseUrl}/clip/list?conversation_id=${conversationId}`
        : `${this.baseUrl}/clip/list`;

      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<ClipsListResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get clips",
      };
    }
  }

  async getClip(clipId: string): Promise<ApiResponse<ClipResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/clip/${clipId}`, {
        method: "GET",
        headers: await this.getHeaders(),
      });
      return this.handleResponse<ClipResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get clip",
      };
    }
  }

  async getClipAudioUrl(clipId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/clip/${clipId}/audio`, {
      method: "GET",
      headers: await this.getHeaders(),
    });
    return response.text();
  }

  async getClipCommentAudioUrl(clipId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/clip/${clipId}/comment-audio`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );
    return response.text();
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
      });
      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      };
    }
  }

  // Utility method to set user ID
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Utility method to get current user ID
  getUserId(): string {
    return this.userId;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for creating new instances if needed
export default ApiService;
