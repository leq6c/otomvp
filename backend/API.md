# Oto API Documentation

## Overview

The Oto API is a FastAPI-based backend service for conversation analysis. It processes audio files, transcribes them, and provides AI-powered analysis including summaries, highlights, insights, and sentiment analysis.

**Base URL:** `http://localhost:8000` (development)

**Technology Stack:**

- FastAPI
- SQLModel
- Pydantic
- Prefect (for background processing)

## Authentication

All protected endpoints require authentication using Bearer token with a custom user ID header.

**Headers Required:**

- `Authorization: Bearer {privy_access_token}`
- `Oto-User-Id: {privy_user_id}`

Example:

```bash
curl -H "Authorization: Bearer {privy_access_token}" \
     -H "Oto-User-Id: {privy_user_id}" \
     http://localhost:8000/user/get
```

## API Endpoints

### Health Check

#### GET /health

Check API health status.

**Authentication:** Not required

**Response:**

```json
{
  "status": "ok"
}
```

---

### User Management

#### POST /user/create

Create a new user account.

**Authentication:** Required

**Response:**

```json
{
  "id": "user123"
}
```

#### GET /user/get

Get user profile information.

**Authentication:** Required

**Response:**

```json
{
  "id": "user123",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "name": "John Doe",
  "age": 30,
  "nationality": "US",
  "first_language": "English",
  "second_languages": "Spanish, French",
  "interests": "Technology, Music",
  "preferred_topics": "AI, Programming"
}
```

#### POST /user/update

Update user profile information.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "John Doe",
  "age": 30,
  "nationality": "US",
  "first_language": "English",
  "second_languages": "Spanish, French",
  "interests": "Technology, Music",
  "preferred_topics": "AI, Programming"
}
```

**Response:**

```json
{
  "id": "user123"
}
```

---

### Conversation Processing

#### POST /conversation/create

Upload an audio file for processing and analysis.

**Authentication:** Required

**Request:**

- Content-Type: `multipart/form-data`
- File: Audio file (max 300MB)
- Supported formats: Any audio MIME type

**Validation:**

- File must be audio format
- Maximum file size: 300MB
- Server capacity limits apply

**Response:**

```json
{
  "id": "conv-uuid-123",
  "status": "processing",
  "flow_run_id": "flow-uuid-456"
}
```

**Status Values:**

- `not_started` - Processing hasn't begun
- `processing` - Currently being processed
- `completed` - Processing finished successfully
- `failed` - Processing failed

#### GET /conversation/list

Get list of user's conversations (last 30, ordered by creation date).

**Authentication:** Required

**Response:**

```json
[
  {
    "id": "conv-uuid-123",
    "user_id": "user123",
    "status": "completed",
    "inner_status": "",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "file_name": "meeting.mp3",
    "file_path": "uploads/user123/meeting.mp3",
    "mime_type": "audio/mpeg",
    "available_duration": "00:15:30",
    "language": "English",
    "situation": "Business meeting",
    "place": "Office",
    "time": "Morning",
    "location": "New York",
    "points": 150
  }
]
```

#### GET /conversation/{conversation_id}

Get specific conversation details.

**Authentication:** Required
**Authorization:** User must own the conversation

**Response:**

```json
{
  "id": "conv-uuid-123",
  "user_id": "user123",
  "status": "completed",
  "inner_status": "",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "file_name": "meeting.mp3",
  "file_path": "uploads/user123/meeting.mp3",
  "mime_type": "audio/mpeg",
  "available_duration": "00:15:30",
  "language": "English",
  "situation": "Business meeting",
  "place": "Office",
  "time": "Morning",
  "location": "New York",
  "points": 150
}
```

---

### Transcription

#### GET /transcript/{conversation_id}

Get conversation transcript with timestamped captions.

**Authentication:** Required
**Authorization:** User must own the conversation

**Response:**

```json
{
  "id": "conv-uuid-123",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "captions": [
    {
      "timecode": "00:00:15",
      "speaker": "Speaker 1",
      "caption": "Welcome everyone to today's meeting."
    },
    {
      "timecode": "00:00:20",
      "speaker": "Speaker 2",
      "caption": "Thank you for having us."
    }
  ]
}
```

---

### Analysis

#### GET /analysis/{conversation_id}

Get AI-powered conversation analysis including summary, highlights, insights, and breakdown.

**Authentication:** Required
**Authorization:** User must own the conversation

**Response:**

```json
{
  "summary": {
    "summary": "This was a productive business meeting discussing quarterly goals and project timelines."
  },
  "highlights": [
    {
      "summary": "Key decision made",
      "highlight": "The team agreed to move forward with the new product launch.",
      "timecode_start_at": "00:05:30",
      "timecode_end_at": "00:06:15",
      "favorite": false
    }
  ],
  "insights": {
    "suggestions": [
      "Consider scheduling follow-up meetings",
      "Document action items clearly"
    ],
    "boring_score": 0.2,
    "density_score": 0.8,
    "clarity_score": 0.9,
    "engagement_score": 0.7,
    "interesting_score": 0.8
  },
  "breakdown": {
    "metadata": {
      "duration": "00:15:30",
      "language": "English",
      "situation": "Business meeting",
      "place": "Office",
      "time": "Morning",
      "location": "New York",
      "participants": ["Speaker 1", "Speaker 2", "Speaker 3"]
    },
    "sentiment": {
      "positive": 0.6,
      "neutral": 0.3,
      "negative": 0.1
    },
    "keywords": [
      {
        "keyword": "project",
        "importance_score": 0.9
      },
      {
        "keyword": "deadline",
        "importance_score": 0.7
      }
    ]
  }
}
```

---

### Points System

#### GET /point/get

Get user's current point balance.

**Authentication:** Required

**Response:**

```json
{
  "id": "point-uuid-123",
  "user_id": "user123",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "points": 1500
}
```

#### GET /point/transaction/list

Get user's point transaction history (ordered by creation date, newest first).

**Authentication:** Required

**Response:**

```json
[
  {
    "id": "trans-uuid-123",
    "user_id": "user123",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "amount": 150,
    "conversation_id": "conv-uuid-123"
  },
  {
    "id": "trans-uuid-124",
    "user_id": "user123",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "amount": -50,
    "conversation_id": null
  }
]
```

---

### Trends

#### GET /trend/trends

Get all trending topics (ordered by volume, descending).

**Authentication:** Not required

**Response:**

```json
[
  {
    "id": "trend-uuid-123",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "title": "AI Technology",
    "description": "Discussions about artificial intelligence and machine learning",
    "volume": 0.85,
    "overall_positive_sentiment": 0.7,
    "overall_negative_sentiment": 0.1,
    "cluster_id": 1
  }
]
```

#### GET /trend/microtrends

Get all microtrends (ordered by volume, descending).

**Authentication:** Not required

**Response:**

```json
[
  {
    "id": "microtrend-uuid-123",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "title": "Remote Work Tools",
    "description": "Emerging tools for remote collaboration",
    "volume": 0.45,
    "overall_positive_sentiment": 0.8,
    "overall_negative_sentiment": 0.05
  }
]
```

#### GET /trend/trends/{trend_id}

Get specific trend by ID.

**Authentication:** Not required

**Response:**

```json
{
  "id": "trend-uuid-123",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "title": "AI Technology",
  "description": "Discussions about artificial intelligence and machine learning",
  "volume": 0.85,
  "overall_positive_sentiment": 0.7,
  "overall_negative_sentiment": 0.1,
  "cluster_id": 1
}
```

#### GET /trend/microtrends/{microtrend_id}

Get specific microtrend by ID.

**Authentication:** Not required

**Response:**

```json
{
  "id": "microtrend-uuid-123",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "title": "Remote Work Tools",
  "description": "Emerging tools for remote collaboration",
  "volume": 0.45,
  "overall_positive_sentiment": 0.8,
  "overall_negative_sentiment": 0.05
}
```

---

## Data Models

### User

```json
{
  "id": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "name": "string | null",
  "age": "integer | null",
  "nationality": "string | null",
  "first_language": "string | null",
  "second_languages": "string | null",
  "interests": "string | null",
  "preferred_topics": "string | null"
}
```

### Conversation

```json
{
  "id": "string",
  "user_id": "string",
  "status": "ProcessingStatus",
  "inner_status": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "file_name": "string",
  "file_path": "string",
  "mime_type": "string",
  "available_duration": "string | null",
  "language": "string | null",
  "situation": "string | null",
  "place": "string | null",
  "time": "string | null",
  "location": "string | null",
  "points": "integer"
}
```

### Caption

```json
{
  "timecode": "string",
  "speaker": "string",
  "caption": "string"
}
```

### ConversationHighlight

```json
{
  "summary": "string",
  "highlight": "string",
  "timecode_start_at": "string",
  "timecode_end_at": "string",
  "favorite": "boolean"
}
```

### ConversationInsight

```json
{
  "suggestions": ["string"],
  "boring_score": "float",
  "density_score": "float",
  "clarity_score": "float",
  "engagement_score": "float",
  "interesting_score": "float"
}
```

### ConversationBreakdown

```json
{
  "metadata": {
    "duration": "string",
    "language": "string",
    "situation": "string",
    "place": "string",
    "time": "string",
    "location": "string",
    "participants": ["string"]
  },
  "sentiment": {
    "positive": "float",
    "neutral": "float",
    "negative": "float"
  },
  "keywords": [
    {
      "keyword": "string",
      "importance_score": "float"
    }
  ]
}
```

---

## Enums

### ProcessingStatus

- `not_started` - Processing hasn't begun
- `processing` - Currently being processed
- `completed` - Processing finished successfully
- `failed` - Processing failed

### SentimentType

- `positive` - Positive sentiment
- `neutral` - Neutral sentiment
- `negative` - Negative sentiment

---

## Error Handling

### Standard HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid file format, file too large)
- `401` - Unauthorized (invalid or missing credentials)
- `403` - Forbidden (user doesn't own resource)
- `404` - Not Found (resource doesn't exist)
- `503` - Service Unavailable (server capacity exceeded)

### Error Response Format

```json
{
  "detail": "Error message description"
}
```

### Common Error Scenarios

**Authentication Errors:**

```json
{
  "detail": "Invalid or missing credentials"
}
```

**File Upload Errors:**

```json
{
  "detail": "File is not an audio file"
}
```

```json
{
  "detail": "File is too large (max 300MB)"
}
```

**Capacity Errors:**

```json
{
  "detail": "Our server reached its limit"
}
```

**Resource Not Found:**

```json
{
  "detail": "Conversation not found"
}
```

```json
{
  "detail": "Transcript not found"
}
```

```json
{
  "detail": "Analysis not found"
}
```

---

## Rate Limits and Constraints

- **File Upload Size:** Maximum 300MB per audio file
- **Conversation List:** Returns last 30 conversations
- **Audio Format:** Must be valid audio MIME type
- **Server Capacity:** Limited concurrent processing (503 error when exceeded)

---

## Background Processing

The conversation processing pipeline uses Prefect for background task orchestration:

1. **File Upload** - Audio file is uploaded and stored
2. **Transcription** - Audio is transcribed using Whisper
3. **Analysis** - AI analysis generates summary, highlights, insights
4. **Point Calculation** - Points are awarded based on conversation quality

Processing status can be monitored via the conversation status field and flow_run_id returned from the create endpoint.
