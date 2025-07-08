import type {
  HistoricalFileEntry,
  AnalysisData,
  Profile,
  Topic,
  MicroTrend,
  UploadedFileSummary,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

// --- MOCK DATABASE STORE ---

const historicalFilesStore: HistoricalFileEntry[] = [
  {
    id: "f9f1a9c8-c8ee-4f2a-9c38-7d47f25a2cb3",
    fileName: "project_kickoff.mp3",
    status: "completed", // Added status
    analysisData: {
      availableDuration: "5:12",
      language: "English",
      situation: "Meeting",
      place: "Office",
      time: "Afternoon",
      location: "New York",
      spokenContents: [
        {
          id: uuidv4(),
          text: "Welcome everyone to the project kickoff for 'Phoenix'.",
          checked: true,
          timestamp: "0:02",
          isKeyMoment: true,
          sentiment: "positive",
        },
        {
          id: uuidv4(),
          text: "Our main goal for this quarter is to deliver the MVP. We need to be laser-focused on this. I expect everyone to contribute their best ideas and efforts. This is critical for our success, so let's make sure we are all aligned.",
          checked: true,
          timestamp: "0:15",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "I'm a bit concerned about the timeline for feature X, it seems quite aggressive given our current resources.",
          checked: false,
          timestamp: "0:45",
          sentiment: "negative",
        },
        {
          id: uuidv4(),
          text: "Let's ensure we have clear action items by end of day.",
          checked: true,
          timestamp: "1:05",
          isKeyMoment: true,
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "Any initial questions or thoughts before we dive deeper into the specifics of the plan?",
          checked: true,
          timestamp: "1:20",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "Okay, seeing none, let's move to the architecture overview. Sarah, can you take the lead?",
          checked: true,
          timestamp: "1:35",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "Sure. We're planning a microservices-based architecture hosted on AWS. This will give us scalability and resilience.",
          checked: true,
          timestamp: "1:42",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "What about the database? Are we sticking with PostgreSQL?",
          checked: true,
          timestamp: "1:58",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "Yes, for the primary data store. We might use Redis for caching to improve performance.",
          checked: true,
          timestamp: "2:05",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "That makes sense. It aligns with our team's expertise.",
          checked: true,
          timestamp: "2:15",
          sentiment: "positive",
        },
        {
          id: uuidv4(),
          text: "Excellent. Let's finalize the tech stack by tomorrow's stand-up. Thanks, everyone.",
          checked: true,
          timestamp: "2:30",
          isKeyMoment: true,
          sentiment: "positive",
        },
      ],
      pointsEarned: 150,
      aiSummary:
        "This project kickoff for 'Phoenix' centered on the Q3 MVP delivery. While generally positive, a concern was raised regarding the timeline for Feature X, highlighting a need for resource assessment. The meeting concluded with an emphasis on establishing clear, actionable next steps.",
      sentimentTimeline: [
        { type: "positive", percentage: 25 },
        { type: "neutral", percentage: 50 },
        { type: "negative", percentage: 15 },
        { type: "neutral", percentage: 10 },
      ],
      keywords: [
        { id: uuidv4(), text: "Phoenix", weight: 5 },
        { id: uuidv4(), text: "MVP", weight: 4 },
        { id: uuidv4(), text: "Timeline", weight: 3 },
        { id: uuidv4(), text: "Action Items", weight: 3 },
        { id: uuidv4(), text: "Resources", weight: 2 },
      ],
      advice: [
        "The segment 'Our main goal for this quarter...' was quite lengthy. Consider breaking up long statements to maintain listener engagement.",
        "When discussing concerns like 'timeline for feature X', try proposing a potential solution or mitigation strategy alongside the concern.",
        "This meeting had a moderate density of information. Good job!",
      ],
      boringRate: 25,
      density: 60,
      clarityScore: 75,
      engagementScore: 60,
    },
  },
  {
    id: "a2b3c4d5-e6f7-8g9h-0i1j-k2l3m4n5o6p7",
    fileName: "client_feedback_session.wav",
    status: "completed", // Added status
    analysisData: {
      availableDuration: "12:30",
      language: "Spanish",
      situation: "Conference Call",
      place: "Remote",
      time: "Morning",
      location: "Madrid",
      spokenContents: [
        {
          id: uuidv4(),
          text: "El cliente está muy contento con el prototipo.",
          checked: true,
          timestamp: "0:08",
          sentiment: "positive",
          isKeyMoment: true,
        },
        {
          id: uuidv4(),
          text: "Sugieren algunos cambios menores en la interfaz de usuario, nada complicado.",
          checked: true,
          timestamp: "0:25",
          sentiment: "neutral",
        },
        {
          id: uuidv4(),
          text: "Necesitamos ajustar el cronograma para la Fase 2, pero es factible.",
          checked: false,
          timestamp: "0:50",
          sentiment: "neutral",
        },
      ],
      pointsEarned: 280,
      aiSummary:
        "Client feedback on the prototype was largely positive. Minor UI changes were suggested, and a timeline adjustment for Phase 2 is required but considered feasible.",
      sentimentTimeline: [
        { type: "positive", percentage: 60 },
        { type: "neutral", percentage: 40 },
      ],
      keywords: [
        { id: uuidv4(), text: "Cliente", weight: 5 },
        { id: uuidv4(), text: "Prototipo", weight: 4 },
        { id: uuidv4(), text: "Interfaz", weight: 3 },
        { id: uuidv4(), text: "Fase 2", weight: 3 },
      ],
      advice: [
        "Excellent clarity in conveying client feedback!",
        "The engagement level was high, likely due to the positive news.",
        "Consider asking clarifying questions after 'cambios menores' to ensure full understanding, e.g., 'Podrías darme un ejemplo específico?'",
      ],
      boringRate: 10,
      density: 75,
      clarityScore: 90,
      engagementScore: 85,
    },
  },
  {
    // Adding a processing file for demonstration
    id: "c3d4e5f6-g7h8-9i0j-k1l2-m3n4o5p6q7r8",
    fileName: "new_feature_brainstorm.m4a",
    status: "processing", // This one is processing
    analysisData: {
      // Minimal data as it's "processing"
      availableDuration: "0:00",
      language: "Unknown",
      situation: "Unknown",
      place: "Unknown",
      time: "Unknown",
      location: "Unknown",
      spokenContents: [],
      pointsEarned: 0,
      aiSummary: "Awaiting full analysis to generate summary.",
      sentimentTimeline: [{ type: "neutral", percentage: 100 }],
      keywords: [],
      advice: ["Analysis pending for detailed advice."],
      boringRate: undefined,
      density: undefined,
      clarityScore: undefined,
      engagementScore: undefined,
    },
  },
];

export const defaultNewAnalysisData: AnalysisData = {
  availableDuration: "0:00",
  language: "Unknown",
  situation: "Unknown",
  place: "Unknown",
  time: "Unknown",
  location: "Unknown",
  spokenContents: [],
  pointsEarned: 0,
  aiSummary: "Awaiting full analysis to generate summary.",
  sentimentTimeline: [{ type: "neutral", percentage: 100 }],
  keywords: [],
  advice: ["Analysis pending for detailed advice."],
  boringRate: undefined,
  density: undefined,
  clarityScore: undefined,
  engagementScore: undefined,
};

// --- DATA ACCESS FUNCTIONS ---
export function getHistoricalFilesSummary(): UploadedFileSummary[] {
  return historicalFilesStore.map(({ id, fileName, status }) => ({
    id,
    fileName,
    status,
  }));
}

export function getAnalysisById(id: string): HistoricalFileEntry | undefined {
  const entry = historicalFilesStore.find((entry) => entry.id === id);
  // In a real app, status update would happen via a backend process.
  // For this mock, we don't automatically change status on fetch.
  return entry;
}

export function addAnalysisEntry(entry: HistoricalFileEntry): void {
  const existingIndex = historicalFilesStore.findIndex(
    (e) => e.id === entry.id
  );
  if (existingIndex > -1) {
    historicalFilesStore[existingIndex] = entry;
  } else {
    historicalFilesStore.unshift(entry); // Add to the beginning of the list
  }
}

export const calculateTotalPoints = (): number => {
  return historicalFilesStore.reduce((sum, fileEntry) => {
    // Only add points if the status is 'completed'
    return (
      sum +
      (fileEntry.status === "completed"
        ? fileEntry.analysisData.pointsEarned
        : 0)
    );
  }, 0);
};

// --- MOCK DATA FOR PAGES ---
export const mockUserProfileData: Profile = {
  name: "Takuya Umeki",
  age: 32,
  nationality: "Japan",
  firstLanguage: "Japanese",
  secondLanguages: "English",
  joinedDate: "2023-05-10",
  customField1: "AI, Photography, Hiking",
  customField2: "2023-05-10",
  customField3: "Technology, Environment",
};

export const mockTrendingTopicsData: Topic[] = [
  {
    id: "1",
    name: "AI Ethics & Governance",
    volume: 95,
    trend: "up",
    shortDescription:
      "Navigating the complex moral and regulatory landscape of artificial intelligence.",
  },
  {
    id: "2",
    name: "This is a mock topic",
    volume: 88,
    trend: "up",
    shortDescription:
      "Adopting eco-friendly practices for a healthier planet and future.",
  },
];

export const mockMicroTrendsData: MicroTrend[] = [
  { id: "m1", name: "Hyperlocal Social Networks", sentiment: "positive" },
  { id: "m2", name: "AI-Generated Art Tools", sentiment: "neutral" },
  { id: "m3", name: "Gamified Fitness Challenges", sentiment: "positive" },
  { id: "m4", name: "This is a mock micro trend", sentiment: "neutral" },
  { id: "m5", name: "This is a mock micro trend", sentiment: "neutral" },
];
