# FreelanceFlow AI - API Specifications

## Overview
This document outlines the detailed API specifications for the FreelanceFlow AI platform, including authentication flows, endpoint definitions, request/response formats, and integration points with external services.

## Authentication API

### User Registration
- **Endpoint**: `POST /api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "displayName": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "uid": "string",
      "email": "string",
      "displayName": "string"
    },
    "token": "string"
  }
  ```
- **Error Responses**:
  - 400: Invalid input
  - 409: Email already exists

### User Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and get access token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "uid": "string",
      "email": "string",
      "displayName": "string"
    },
    "token": "string"
  }
  ```
- **Error Responses**:
  - 400: Invalid credentials
  - 403: Account disabled

### Password Reset
- **Endpoint**: `POST /api/auth/reset-password`
- **Description**: Send password reset email
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```
- **Error Responses**:
  - 404: Email not found

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Invalidate user session
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## User API

### Get User Profile
- **Endpoint**: `GET /api/users/profile`
- **Description**: Get current user profile information
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "uid": "string",
    "email": "string",
    "displayName": "string",
    "createdAt": "timestamp",
    "subscription": {
      "tier": "string",
      "startDate": "timestamp",
      "endDate": "timestamp"
    },
    "skills": ["string"],
    "preferences": {
      "property": "value"
    }
  }
  ```

### Update User Profile
- **Endpoint**: `PUT /api/users/profile`
- **Description**: Update user profile information
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "displayName": "string",
    "skills": ["string"],
    "preferences": {
      "property": "value"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "uid": "string",
      "email": "string",
      "displayName": "string",
      "skills": ["string"],
      "preferences": {
        "property": "value"
      }
    }
  }
  ```

### Get Subscription
- **Endpoint**: `GET /api/users/subscription`
- **Description**: Get user subscription details
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "tier": "string",
    "startDate": "timestamp",
    "endDate": "timestamp",
    "features": {
      "pitchesPerMonth": "number",
      "analytics": "boolean",
      "multiPlatform": "boolean"
    }
  }
  ```

### Update Subscription
- **Endpoint**: `PUT /api/users/subscription`
- **Description**: Update user subscription
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "tier": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "subscription": {
      "tier": "string",
      "startDate": "timestamp",
      "endDate": "timestamp",
      "features": {
        "pitchesPerMonth": "number",
        "analytics": "boolean",
        "multiPlatform": "boolean"
      }
    }
  }
  ```

## Pitch API

### Generate Pitch
- **Endpoint**: `POST /api/pitches/generate`
- **Description**: Generate a new pitch using AI
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "skills": ["string"],
    "gigDetails": {
      "projectType": "string",
      "budget": "number",
      "timeline": "string",
      "platform": "string",
      "additionalInfo": "string"
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "createdAt": "timestamp",
    "skills": ["string"],
    "gigDetails": {
      "projectType": "string",
      "budget": "number",
      "timeline": "string",
      "platform": "string",
      "additionalInfo": "string"
    },
    "generatedPitch": "string",
    "status": "draft"
  }
  ```
- **Error Responses**:
  - 400: Invalid input
  - 402: Monthly pitch limit exceeded
  - 500: AI generation error

### Get All Pitches
- **Endpoint**: `GET /api/pitches`
- **Description**: Get all pitches for the current user
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - status: Filter by status (optional)
  - limit: Number of results (optional, default 20)
  - offset: Pagination offset (optional, default 0)
- **Response**:
  ```json
  {
    "pitches": [
      {
        "id": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "skills": ["string"],
        "gigDetails": {
          "projectType": "string",
          "budget": "number"
        },
        "generatedPitch": "string",
        "editedPitch": "string",
        "status": "string",
        "calendarEventId": "string"
      }
    ],
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
  ```

### Get Pitch by ID
- **Endpoint**: `GET /api/pitches/:id`
- **Description**: Get a specific pitch by ID
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "skills": ["string"],
    "gigDetails": {
      "projectType": "string",
      "budget": "number",
      "timeline": "string",
      "platform": "string",
      "additionalInfo": "string"
    },
    "generatedPitch": "string",
    "editedPitch": "string",
    "status": "string",
    "calendarEventId": "string"
  }
  ```
- **Error Responses**:
  - 404: Pitch not found

### Update Pitch
- **Endpoint**: `PUT /api/pitches/:id`
- **Description**: Update a pitch
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "editedPitch": "string",
    "status": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "updatedAt": "timestamp",
    "editedPitch": "string",
    "status": "string"
  }
  ```
- **Error Responses**:
  - 404: Pitch not found

### Delete Pitch
- **Endpoint**: `DELETE /api/pitches/:id`
- **Description**: Delete a pitch
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pitch deleted successfully"
  }
  ```
- **Error Responses**:
  - 404: Pitch not found

### Schedule Pitch
- **Endpoint**: `POST /api/pitches/:id/schedule`
- **Description**: Schedule a pitch to Google Calendar
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "scheduledDate": "timestamp",
    "duration": "number", // in minutes
    "title": "string",
    "description": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "pitch": {
      "id": "string",
      "status": "scheduled",
      "calendarEventId": "string"
    },
    "calendarEvent": {
      "id": "string",
      "summary": "string",
      "description": "string",
      "start": "timestamp",
      "end": "timestamp",
      "htmlLink": "string"
    }
  }
  ```
- **Error Responses**:
  - 404: Pitch not found
  - 401: Google Calendar not authorized
  - 500: Calendar API error

## Calendar API

### Authorize Google Calendar
- **Endpoint**: `POST /api/calendar/authorize`
- **Description**: Authorize access to Google Calendar
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "success": true,
    "authUrl": "string" // URL to redirect user for Google OAuth
  }
  ```

### OAuth Callback
- **Endpoint**: `GET /api/calendar/callback`
- **Description**: Handle Google OAuth callback
- **Query Parameters**:
  - code: Authorization code
  - state: State parameter for security
- **Response**: Redirects to application with success/error message

### Get Calendar Events
- **Endpoint**: `GET /api/calendar/events`
- **Description**: Get user's calendar events
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - startDate: Filter by start date (optional)
  - endDate: Filter by end date (optional)
  - limit: Number of results (optional, default 10)
- **Response**:
  ```json
  {
    "events": [
      {
        "id": "string",
        "summary": "string",
        "description": "string",
        "start": "timestamp",
        "end": "timestamp",
        "htmlLink": "string"
      }
    ]
  }
  ```
- **Error Responses**:
  - 401: Google Calendar not authorized
  - 500: Calendar API error

### Create Calendar Event
- **Endpoint**: `POST /api/calendar/events`
- **Description**: Create a new calendar event
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "summary": "string",
    "description": "string",
    "start": "timestamp",
    "end": "timestamp",
    "pitchId": "string" // Optional, to link with a pitch
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "summary": "string",
    "description": "string",
    "start": "timestamp",
    "end": "timestamp",
    "htmlLink": "string"
  }
  ```
- **Error Responses**:
  - 401: Google Calendar not authorized
  - 400: Invalid input
  - 500: Calendar API error

### Update Calendar Event
- **Endpoint**: `PUT /api/calendar/events/:id`
- **Description**: Update a calendar event
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "summary": "string",
    "description": "string",
    "start": "timestamp",
    "end": "timestamp"
  }
  ```
- **Response**:
  ```json
  {
    "id": "string",
    "summary": "string",
    "description": "string",
    "start": "timestamp",
    "end": "timestamp",
    "htmlLink": "string"
  }
  ```
- **Error Responses**:
  - 401: Google Calendar not authorized
  - 404: Event not found
  - 500: Calendar API error

### Delete Calendar Event
- **Endpoint**: `DELETE /api/calendar/events/:id`
- **Description**: Delete a calendar event
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "success": true,
    "message": "Event deleted successfully"
  }
  ```
- **Error Responses**:
  - 401: Google Calendar not authorized
  - 404: Event not found
  - 500: Calendar API error

## OpenAI Integration

### OpenAI Service Interface
```typescript
interface OpenAIService {
  generatePitch(skills: string[], gigDetails: GigDetails): Promise<string>;
}
```

### Implementation Details
- Server-side implementation using OpenAI API
- Prompt engineering for optimal pitch generation
- Error handling and retry logic
- Rate limiting to manage API costs

### Example Prompt Template
```
Generate a professional freelance pitch for a {gigDetails.projectType} project with a budget of ${gigDetails.budget}.

Skills: {skills.join(', ')}
Timeline: {gigDetails.timeline}
Platform: {gigDetails.platform}
Additional Information: {gigDetails.additionalInfo}

The pitch should be concise, professional, and highlight relevant experience and skills.
```

## Google Calendar Integration

### Google Calendar Service Interface
```typescript
interface GoogleCalendarService {
  getAuthUrl(userId: string): string;
  handleCallback(code: string, state: string): Promise<void>;
  getEvents(userId: string, startDate?: Date, endDate?: Date, limit?: number): Promise<CalendarEvent[]>;
  createEvent(userId: string, event: CalendarEventInput): Promise<CalendarEvent>;
  updateEvent(userId: string, eventId: string, event: CalendarEventInput): Promise<CalendarEvent>;
  deleteEvent(userId: string, eventId: string): Promise<void>;
}
```

### Implementation Details
- OAuth 2.0 authentication flow
- Token storage and refresh
- Event CRUD operations
- Error handling and retry logic

## Frontend-Backend Communication

### API Client
- Axios-based HTTP client
- JWT token management
- Request/response interceptors
- Error handling

### Example API Client Usage
```typescript
// Authentication
const register = (email, password, displayName) => 
  api.post('/auth/register', { email, password, displayName });

const login = (email, password) => 
  api.post('/auth/login', { email, password });

// Pitch Generation
const generatePitch = (skills, gigDetails) => 
  api.post('/pitches/generate', { skills, gigDetails });

const updatePitch = (id, editedPitch, status) => 
  api.put(`/pitches/${id}`, { editedPitch, status });

// Calendar Integration
const schedulePitch = (id, scheduledDate, duration, title, description) => 
  api.post(`/pitches/${id}/schedule`, { scheduledDate, duration, title, description });
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" // Optional
  }
}
```

### Common Error Codes
- `auth/invalid-credentials`: Invalid email or password
- `auth/email-already-exists`: Email already registered
- `auth/weak-password`: Password doesn't meet requirements
- `pitch/limit-exceeded`: Monthly pitch limit exceeded
- `pitch/not-found`: Pitch not found
- `calendar/not-authorized`: Google Calendar not authorized
- `calendar/api-error`: Error from Google Calendar API
- `openai/api-error`: Error from OpenAI API

## Rate Limiting

### Rate Limit Headers
- `X-RateLimit-Limit`: Maximum number of requests allowed in a time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time when the rate limit window resets

### Rate Limit Response (429 Too Many Requests)
```json
{
  "success": false,
  "error": {
    "code": "rate-limit-exceeded",
    "message": "Too many requests, please try again later",
    "details": {
      "retryAfter": "number" // Seconds until retry is allowed
    }
  }
}
```

## Authentication Flow

### Registration Flow
1. Client submits email, password, displayName to `/api/auth/register`
2. Server creates user in Firebase Authentication
3. Server creates user document in Firestore
4. Server returns user data and JWT token
5. Client stores token in localStorage/sessionStorage
6. Client redirects to dashboard

### Login Flow
1. Client submits email and password to `/api/auth/login`
2. Server authenticates with Firebase
3. Server returns user data and JWT token
4. Client stores token in localStorage/sessionStorage
5. Client redirects to dashboard

### Token Refresh Flow
1. Client detects expired token (401 response)
2. Client attempts to refresh token
3. If refresh succeeds, retry original request
4. If refresh fails, redirect to login

## Subscription Management

### Subscription Tiers
- Free Tier: 5 pitches/month, basic features
- Pro Tier ($10/month): Unlimited pitches, basic analytics
- Premium Tier ($50/month): Multi-platform integrations, advanced analytics

### Subscription Enforcement
- Backend validates user's subscription tier before processing requests
- Rate limiting applied based on subscription tier
- Feature flags enabled/disabled based on subscription tier

## Security Considerations

### API Security
- All endpoints require authentication (except register/login)
- JWT tokens with short expiration
- CSRF protection
- Rate limiting to prevent abuse
- Input validation on all endpoints

### Data Security
- Sensitive data encrypted at rest
- API keys stored securely (not in client-side code)
- OpenAI API called server-side only
- Minimal data collection, adhering to GDPR/CCPA

## Monitoring and Logging

### Request Logging
- Log all API requests (excluding sensitive data)
- Track response times
- Monitor error rates

### Performance Monitoring
- Track API endpoint performance
- Monitor external API calls (OpenAI, Google)
- Alert on high error rates or slow responses

## API Versioning

### Version Strategy
- URL-based versioning (e.g., `/api/v1/pitches`)
- Initial version is v1
- Support for multiple versions simultaneously during transitions

### Deprecation Policy
- Minimum 6-month deprecation period
- Deprecation notices in response headers
- Documentation of migration paths
