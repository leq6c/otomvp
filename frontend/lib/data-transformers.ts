/**
 * Data transformation utilities to convert API responses to frontend types
 */

import type {
  AnalysisData,
  SpokenContent,
  SentimentSegment,
  Keyword,
  Topic,
  MicroTrend,
} from "@/types";
import type {
  ConversationResponse,
  TrendResponse,
  MicroTrendResponse,
} from "./api-service";

// Backend analysis response structure (based on the backend domain models)
interface BackendAnalysisResponse {
  summary: {
    summary: string;
  };
  highlights: Array<{
    summary: string;
    highlight: string;
    timecode_start_at: string;
    timecode_end_at: string;
    favorite: boolean;
  }>;
  insights: {
    suggestions: string[];
    boring_score: number;
    density_score: number;
    clarity_score: number;
    engagement_score: number;
    interesting_score: number;
  };
  breakdown: {
    metadata: {
      duration: string;
      language: string;
      situation: string;
      place: string;
      time: string;
      location: string;
      participants: string[];
    };
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    keywords: Array<{
      keyword: string;
      importance_score: number;
    }>;
  };
}

/**
 * Transform backend analysis response to frontend AnalysisData type
 */
export function transformAnalysisData(
  backendData: BackendAnalysisResponse,
  conversation: ConversationResponse
): AnalysisData {
  // Transform highlights to spoken contents
  const spokenContents: SpokenContent[] = backendData.highlights.map(
    (highlight, index) => ({
      id: `highlight-${index}`,
      text: highlight.highlight,
      checked: highlight.favorite,
      timestamp: `${highlight.timecode_start_at}-${highlight.timecode_end_at}`,
      isKeyMoment: highlight.favorite,
      sentiment: determineSentiment(highlight.highlight), // Simple sentiment determination
      summary: highlight.summary,
    })
  );

  // Transform sentiment data to timeline
  const sentimentTimeline: SentimentSegment[] = [
    {
      type: "positive",
      percentage: Math.round(backendData.breakdown.sentiment.positive * 100),
    },
    {
      type: "neutral",
      percentage: Math.round(backendData.breakdown.sentiment.neutral * 100),
    },
    {
      type: "negative",
      percentage: Math.round(backendData.breakdown.sentiment.negative * 100),
    },
  ];

  // Transform keywords
  const keywords: Keyword[] = backendData.breakdown.keywords.map(
    (kw, index) => ({
      id: `keyword-${index}`,
      text: kw.keyword,
      weight: kw.importance_score,
    })
  );

  return {
    availableDuration: backendData.breakdown.metadata.duration,
    language: backendData.breakdown.metadata.language,
    situation: backendData.breakdown.metadata.situation,
    place: backendData.breakdown.metadata.place,
    time: backendData.breakdown.metadata.time,
    location: backendData.breakdown.metadata.location,
    spokenContents,
    pointsEarned: conversation.points,
    aiSummary: backendData.summary.summary,
    sentimentTimeline,
    keywords,
    advice: backendData.insights.suggestions,
    boringRate: Math.round((1 - backendData.insights.boring_score) * 100), // Invert boring score
    density: Math.round(backendData.insights.density_score * 100),
    clarityScore: Math.round(backendData.insights.clarity_score * 100),
    engagementScore: Math.round(backendData.insights.engagement_score * 100),
  };
}

/**
 * Simple sentiment determination based on text content
 * This is a placeholder - in a real app you might use a more sophisticated approach
 */
function determineSentiment(text: string): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "like",
    "happy",
    "excited",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "dislike",
    "sad",
    "angry",
    "frustrated",
    "disappointed",
  ];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Format duration from seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Transform backend trend response to frontend Topic type
 */
export function transformTrendData(trendData: TrendResponse): Topic {
  // Determine trend direction based on sentiment
  const positiveRatio = trendData.overall_positive_sentiment;
  const negativeRatio = trendData.overall_negative_sentiment;

  let trend: "up" | "down" | "stable" = "stable";
  if (positiveRatio > negativeRatio + 0.1) {
    trend = "up";
  } else if (negativeRatio > positiveRatio + 0.1) {
    trend = "down";
  }

  return {
    id: trendData.id,
    name: trendData.title,
    volume: Math.round(trendData.volume),
    trend,
    shortDescription: trendData.description,
  };
}

/**
 * Transform backend microtrend response to frontend MicroTrend type
 */
export function transformMicroTrendData(
  microTrendData: MicroTrendResponse
): MicroTrend {
  // Determine sentiment based on positive/negative ratios
  const positiveRatio = microTrendData.overall_positive_sentiment;
  const negativeRatio = microTrendData.overall_negative_sentiment;

  let sentiment: "positive" | "neutral" | "mixed" = "neutral";
  if (positiveRatio > negativeRatio + 0.1) {
    sentiment = "positive";
  } else if (
    negativeRatio > positiveRatio + 0.1 ||
    (positiveRatio > 0.3 && negativeRatio > 0.3)
  ) {
    sentiment = "mixed";
  }

  return {
    id: microTrendData.id,
    name: microTrendData.title,
    sentiment,
  };
}

/**
 * Transform arrays of backend trend responses to frontend types
 */
export function transformTrendsData(trendsData: TrendResponse[]): Topic[] {
  return trendsData.map(transformTrendData);
}

export function transformMicroTrendsData(
  microTrendsData: MicroTrendResponse[]
): MicroTrend[] {
  return microTrendsData.map(transformMicroTrendData);
}

/**
 * Generate a unique ID for frontend use
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
