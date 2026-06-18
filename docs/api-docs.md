# TruthLens API Documentation

## Base URLs

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:5000/api` |
| ML Service | `http://localhost:8000` |

## Authentication

All protected endpoints require the header:
```
Authorization: Bearer <supabase_access_token>
```

---

## Auth Endpoints

### POST /api/auth/signup
Create a new account.

**Body:**
```json
{ "email": "user@example.com", "password": "securepass123", "full_name": "John Doe" }
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### POST /api/auth/login
Sign in with credentials.

**Body:**
```json
{ "email": "user@example.com", "password": "securepass123" }
```

**Response (200):**
```json
{ "user": { "id": "uuid", "email": "..." }, "session": { "access_token": "..." } }
```

### POST /api/auth/logout
🔒 Auth required. Sign out the current user.

**Response:** `{ "message": "Logged out successfully" }`

### POST /api/auth/forgot-password
Send password reset email.

**Body:** `{ "email": "user@example.com" }`

**Response:** `{ "message": "Password reset email sent" }`

### POST /api/auth/reset-password
🔒 Auth required. Update password.

**Body:** `{ "password": "newpassword123" }`

**Response:** `{ "message": "Password updated successfully" }`

### GET /api/auth/me
🔒 Auth required. Get current user profile.

**Response:** `{ "profile": { "id": "uuid", "email": "...", "full_name": "...", "role": "USER", ... } }`

---

## Profile Endpoints

### GET /api/profile
🔒 Auth required. Get profile with preferences.

**Response:**
```json
{
  "profile": { "id": "uuid", "full_name": "John", "bio": "...", "role": "USER" },
  "preferences": { "topics": ["technology", "science"], "email_notifications": true }
}
```

### PUT /api/profile
🔒 Auth required. Update profile.

**Body:** `{ "full_name": "New Name", "bio": "Updated bio", "avatar_url": "https://..." }`

### PUT /api/profile/preferences
🔒 Auth required. Update topic interests.

**Body:** `{ "topics": ["technology", "science", "health"] }`

### GET /api/profile/history
🔒 Auth required. Get user's verification history.

**Response:** `{ "reports": [...] }`

---

## News Endpoints

### GET /api/news
List articles with pagination and filters.

**Query params:** `topic`, `page` (default 1), `limit` (default 20)

**Response:**
```json
{ "articles": [...], "total": 150, "page": 1, "totalPages": 8 }
```

### GET /api/news/trending
Get trending articles.

**Response:** `{ "articles": [...] }`

### GET /api/news/search
Search articles.

**Query params:** `keyword`, `topic`, `source`, `from`, `to`, `credibility` (e.g. "80-100")

### GET /api/news/:id
Get single article with source details.

**Response:** `{ "article": { "id": "uuid", "title": "...", "sources": {...} } }`

---

## Verification Endpoints

### POST /api/verify/text
🔒 Auth required. Verify text content.

**Body:** `{ "text": "Article text to verify...", "source_name": "reuters.com" }`

**Response:**
```json
{
  "submission": { "id": "uuid", "type": "text", "status": "completed" },
  "report": {
    "verdict": "Highly Credible",
    "composite_score": 87,
    "ml_confidence": 92.5,
    "source_score": 95,
    "fact_check_score": 70,
    "evidence": [...]
  },
  "ml_result": { ... }
}
```

### POST /api/verify/url
🔒 Auth required. Verify URL.

**Body:** `{ "url": "https://example.com/article" }`

### POST /api/verify/image
🔒 Auth required. Verify image via OCR.

**Content-Type:** `multipart/form-data`
**Field:** `image` (file upload)

### GET /api/verify/reports
🔒 Auth required. List verification reports.

**Query:** `public=true` for all public reports, otherwise user's own.

### GET /api/verify/reports/:id
Get single report with vote counts.

**Response:**
```json
{
  "report": { "verdict": "...", "composite_score": 82, ... },
  "votes": { "up": 15, "down": 3, "total": 18 }
}
```

---

## Bookmark Endpoints

### GET /api/bookmarks
🔒 Auth required. List user's bookmarks.

### POST /api/bookmarks
🔒 Auth required. Add bookmark.

**Body:** `{ "type": "article", "article_id": "uuid" }` or `{ "type": "report", "report_id": "uuid" }`

### DELETE /api/bookmarks/:id
🔒 Auth required. Remove bookmark.

---

## Vote Endpoints

### POST /api/votes
🔒 Auth required. Cast or update vote.

**Body:** `{ "report_id": "uuid", "vote_type": "up" }`

> If negative votes exceed 60% of total, the report is auto-flagged.

### DELETE /api/votes/:report_id
🔒 Auth required. Remove vote.

---

## Source Endpoints

### GET /api/sources
Public. List all news sources with credibility scores.

### POST /api/sources
🔒 Admin only. Add new source.

**Body:** `{ "name": "Source Name", "domain": "source.com", "credibility_score": 85 }`

### PUT /api/sources/:id
🔒 Admin only. Update source credibility.

---

## Notification Endpoints

### GET /api/notifications
🔒 Auth required. List user's notifications.

### PUT /api/notifications/:id/read
🔒 Auth required. Mark notification as read.

### PUT /api/notifications/read-all
🔒 Auth required. Mark all as read.

---

## Admin Endpoints

All admin endpoints require authentication + ADMIN role.

### GET /api/admin/users
List all users. Query: `page`, `limit`, `search`.

### PUT /api/admin/users/:id
Update user. Body: `{ "is_banned": true }` or `{ "is_suspended": true }` or `{ "role": "ADMIN" }`.

### GET /api/admin/articles
List all articles with pagination.

### DELETE /api/admin/articles/:id
Delete an article.

### GET /api/admin/analytics
Dashboard statistics.

**Response:**
```json
{
  "totalUsers": 150,
  "totalArticles": 1200,
  "totalVerifications": 350,
  "totalFlagged": 12,
  "votes": { "up": 500, "down": 80 },
  "verdictDistribution": { "Highly Credible": 120, "Uncertain": 80 },
  "topicDistribution": { "technology": 300, "politics": 250 },
  "topSources": [...]
}
```

### GET /api/admin/disputes
List flagged/disputed reports.

### PUT /api/admin/reports/:id/override
Override report verdict. Body: `{ "verdict": "Highly Credible", "composite_score": 90 }`.

### POST /api/admin/notifications
Send announcement to all users. Body: `{ "title": "...", "message": "..." }`.

---

## ML Service Endpoints

### GET /health
Health check. Returns: `{ "status": "healthy", "model_loaded": true, "timestamp": "..." }`

### POST /predict
Raw ML prediction.

**Body:** `{ "text": "News text to classify" }`

**Response:**
```json
{
  "prediction": "REAL",
  "confidence": 94.2,
  "probabilities": { "REAL": 94.2, "FAKE": 5.8 }
}
```

### POST /verify-text
Full verification pipeline.

**Body:** `{ "text": "...", "source_name": "bbc.com" }`

### POST /verify-url
URL verification with content extraction.

**Body:** `{ "url": "https://..." }`

### POST /verify-image
Image OCR + verification.

**Content-Type:** `multipart/form-data`
**Field:** `file` (image upload)
