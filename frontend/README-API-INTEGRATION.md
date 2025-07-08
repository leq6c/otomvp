# API Integration Implementation

This document describes the implementation of frontend features using backend APIs for the OTO MVP project.

## Overview

The frontend has been updated to integrate with the backend APIs for:

- **Upload**: File upload and conversation creation
- **Analysis**: Retrieving and displaying analysis results
- **Profile**: User profile management

## Architecture

### API Service Layer (`lib/api-service.ts`)

- Centralized API client with clean interfaces
- Type-safe request/response handling
- Error handling and response transformation
- Authentication headers management

### Custom Hooks (`hooks/use-api.ts`)

- React hooks for API state management
- Loading states and error handling
- Specialized hooks for different features:
  - `useUpload()` - File upload functionality
  - `useProfile()` - Profile management
  - `useConversations()` - Conversation listing and retrieval
  - `useAnalysis()` - Analysis data fetching
  - `useTranscript()` - Full transcript retrieval

### Data Transformers (`lib/data-transformers.ts`)

- Transform backend API responses to frontend types
- Handle data structure differences between backend and frontend
- Provide utility functions for data formatting

## Features Implemented

### 1. Upload Feature (`app/upload/page.tsx`)

- **File Upload**: Upload audio files to backend
- **Real-time Status**: Display upload progress and processing status
- **Conversation List**: Show uploaded files with their processing status
- **Points Calculation**: Calculate total points from completed analyses

**API Endpoints Used:**

- `POST /conversation/create` - Upload audio file
- `GET /conversation/list` - Get user's conversations

### 2. Analysis Feature (`app/analysis/[id]/page.tsx`)

- **Analysis Display**: Show detailed analysis results
- **Processing States**: Handle different conversation states (processing, completed, failed)
- **Data Transformation**: Convert backend analysis format to frontend format
- **Historical Files**: Display user's conversation history
- **Full Transcript Modal**: Display complete transcript with timestamp matching

**API Endpoints Used:**

- `GET /conversation/{id}` - Get specific conversation
- `GET /analysis/{id}` - Get analysis results
- `GET /transcript/{id}` - Get full transcript with segments
- `GET /conversation/list` - Get conversations for sidebar

### 3. Profile Feature (`app/profile/page.tsx`)

- **Profile Loading**: Fetch user profile data
- **Profile Editing**: Update user profile information
- **Data Synchronization**: Keep profile data in sync with backend
- **Form Validation**: Handle profile update success/error states

**API Endpoints Used:**

- `GET /user/get` - Get user profile
- `POST /user/update` - Update user profile
- `GET /conversation/list` - Get conversations for points calculation

## Authentication

The implementation uses a simple authentication scheme:

- User ID is passed via `Oto-User-Id` header
- Bearer token format: `Bearer secret:{user_id}`
- Default user ID: `default-user`

## Error Handling

- Comprehensive error handling at API service level
- User-friendly error messages via toast notifications
- Graceful fallbacks for failed API calls
- Loading states during API operations

## Type Safety

- Full TypeScript integration
- Type definitions for all API requests/responses
- Interface definitions matching backend models
- Type-safe data transformations

## Environment Configuration

- API base URL configurable via `NEXT_PUBLIC_API_URL`
- Default: `http://localhost:8000`
- Environment file: `.env.local`

## Usage Examples

### Upload a File

```typescript
const { uploadFile, loading, error } = useUpload();

const handleUpload = async (file: File) => {
  const result = await uploadFile(file);
  if (result) {
    console.log("Upload successful:", result.id);
  }
};
```

### Get Analysis Data

```typescript
const { getAnalysis, analysisData, analysisLoading } = useAnalysis();

useEffect(() => {
  if (conversationId) {
    getAnalysis(conversationId);
  }
}, [conversationId]);
```

### Get Full Transcript

```typescript
const { getTranscript, transcriptData, transcriptLoading } = useTranscript();

useEffect(() => {
  if (conversationId) {
    getTranscript(conversationId);
  }
}, [conversationId]);
```

### Update Profile

```typescript
const { updateProfile, updateLoading } = useProfile();

const handleSave = async (profileData) => {
  const result = await updateProfile(profileData);
  if (result) {
    console.log("Profile updated successfully");
  }
};
```

## Backend API Compatibility

The implementation is designed to work with the existing backend API structure:

### Conversation Model

- Maps to conversation creation and listing
- Handles processing status tracking
- Supports file metadata and points

### User Model

- Maps to profile management
- Supports all profile fields
- Handles optional field updates

### Analysis Model

- Complex data transformation from backend format
- Supports highlights, insights, and breakdown data
- Converts to frontend-friendly format

### Transcript Model

- Maps to full transcript segments with timestamps
- Supports timestamp-based navigation and matching
- Handles segment-level transcript data

## Transcript Modal Features

The `TranscriptDetailModal` component now provides:

### Full Transcript Display

- Fetches complete transcript via `GET /transcript/{id}` API
- Shows all transcript segments with precise timestamps
- Displays loading states and error handling

### Timestamp Matching

- Automatically matches selected highlights with transcript segments
- Highlights relevant transcript segments in yellow
- Auto-scrolls to matching segments when modal opens

### Interactive Navigation

- Click any transcript segment to select it
- Visual feedback with blue highlighting for selected segments
- Smooth scrolling between segments

### Time Formatting

- Converts seconds to readable MM:SS or HH:MM:SS format
- Shows start and end times for each segment
- Handles time range parsing for highlight matching

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live status updates
2. **Caching**: Implement API response caching for better performance
3. **Retry Logic**: Add automatic retry for failed requests
4. **Pagination**: Support for paginated conversation lists
5. **File Validation**: Enhanced client-side file validation
6. **Progress Tracking**: Real upload progress tracking
7. **Offline Support**: Handle offline scenarios gracefully
8. **Audio Playback**: Integrate audio player with transcript synchronization
9. **Search in Transcript**: Add search functionality within transcript segments
10. **Export Transcript**: Allow users to export transcript data

## Testing

To test the implementation:

1. Start the backend server on port 8000
2. Start the frontend development server
3. Navigate to `/upload` to test file upload
4. Navigate to `/profile` to test profile management
5. Navigate to `/analysis/{id}` to test analysis display

The implementation provides a robust foundation for the OTO MVP with clean separation of concerns and type-safe API integration.
