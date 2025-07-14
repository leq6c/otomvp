/**
 * Represents a single piece of spoken content identified in an analysis.
 */
export type SpokenContent = {
  id: string;
  text: string;
  checked: boolean;
  timestamp?: string; // e.g., "0:05", "1:23"
  isKeyMoment?: boolean;
  sentiment?: "positive" | "neutral" | "negative";
  summary?: string;
};

/**
 * Represents a segment in the sentiment timeline.
 */
export type SentimentSegment = {
  type: "positive" | "neutral" | "negative";
  percentage: number;
};

/**
 * Represents a keyword extracted from the analysis.
 */
export type Keyword = {
  text: string;
  weight: number;
  id: string;
};

/**
 * Represents the complete data structure for a single audio analysis result.
 */
export type AnalysisData = {
  availableDuration: string;
  language: string;
  situation: string;
  place: string;
  time: string;
  location: string;
  spokenContents: SpokenContent[];
  pointsEarned: number;
  aiSummary?: string;
  sentimentTimeline?: SentimentSegment[];
  keywords?: Keyword[];
  advice?: string[];
  boringRate?: number;
  density?: number;
  clarityScore?: number;
  engagementScore?: number;
};

/**
 * Represents a historical file entry, linking a file name to its analysis data.
 */
export type HistoricalFileEntry = {
  id: string;
  fileName: string;
  status: "completed" | "processing"; // Added status
  analysisData: AnalysisData;
};

/**
 * Represents the data structure for a user's profile.
 */
export type Profile = {
  name: string;
  age: number | string;
  nationality: string;
  firstLanguage: string;
  secondLanguages: string;
  joinedDate: string;
  customField1?: string;
  customField2?: string;
  customField3?: string;
};

/**
 * Represents a major trending topic in analytics.
 */
export type Topic = {
  id: string;
  name: string;
  volume: number;
  trend: "up" | "down" | "stable";
  shortDescription: string;
};

/**
 * Represents an emerging micro-trend in analytics.
 */
export type MicroTrend = {
  id: string;
  name: string;
  sentiment: "positive" | "neutral" | "mixed";
};

// Summary type for UploadedFilesPanel, now includes status
export type UploadedFileSummary = {
  id: string;
  fileName: string;
  status: "completed" | "processing" | "failed" | "not_started";
};

/**
 * Represents a transcript segment from the API
 */
export type TranscriptSegment = {
  id: number;
  caption: string;
  speaker: string;
  timecode: string;
};

/**
 * Represents the full transcript response from API
 */
export type FullTranscript = {
  id: string;
  created_at: string;
  updated_at: string;
  captions: TranscriptSegment[];
};

/**
 * Represents a clip caption from the API
 */
export type ClipCaption = {
  timecode_start: string;
  timecode_end: string;
  speaker: string;
  caption: string;
};

/**
 * Represents a clip from the API
 */
export type Clip = {
  id: string;
  conversation_id: string;
  created_at: string;
  updated_at: string;
  file_name: string;
  mime_type: string;
  title: string;
  description: string;
  comment: string;
  captions: ClipCaption[];
};

/**
 * Represents the clips list response from API
 */
export type ClipsResponse = {
  clips: Clip[];
  total: number;
  conversation_id?: string;
};
