# TruthLens — Technical Documentation

## 1. System Architecture

TruthLens follows a **microservice architecture** with four distinct services:

```
┌─────────────────┐     REST API      ┌──────────────────┐
│                 │ ←───────────────→ │                  │
│   React SPA     │                   │  Express.js API  │
│   (Vite)        │                   │  Gateway         │
│                 │                   │                  │
└─────────────────┘                   └───────┬──────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                              ▼               ▼               ▼
                       ┌────────────┐  ┌────────────┐  ┌────────────┐
                       │ Supabase   │  │ FastAPI ML  │  │  GNews     │
                       │ PostgreSQL │  │ Service     │  │  API       │
                       │ + Auth     │  │ (RoBERTa)   │  │            │
                       └────────────┘  └─────┬──────┘  └────────────┘
                                             │
                                    ┌────────┼────────┐
                                    │        │        │
                                    ▼        ▼        ▼
                              Tesseract  Google FC  trafilatura
                              OCR        API        (scraping)
```

### Service Responsibilities

| Service | Role | Technology |
|---------|------|------------|
| Frontend | User interface, routing, state management | React 19, Vite, Tailwind CSS |
| API Gateway | Authentication, routing, data aggregation, cron jobs | Node.js, Express.js |
| ML Service | AI inference, OCR, content extraction, scoring | Python, FastAPI, PyTorch |
| Database | Data persistence, auth, file storage | Supabase (PostgreSQL) |

---

## 2. Entity-Relationship Diagram

### Entities and Relationships

**profiles** (1:1 with auth.users)
- Primary entity for user data
- One profile per authenticated user
- Has one user_preferences record
- Has many submissions, verification_reports, votes, bookmarks, notifications

**user_preferences** (1:1 with profiles)
- Stores topic interests as TEXT array
- Email notification settings

**sources** (1:N with articles)
- News source registry with credibility scores
- One source can have many articles

**articles** (N:1 with sources)
- Aggregated news articles
- Belongs to one source
- Can have many bookmarks

**submissions** (N:1 with profiles, 1:1 with verification_reports)
- User-submitted content for verification
- Types: url, text, headline, image
- Each submission produces one verification report

**verification_reports** (1:1 with submissions, N:1 with profiles)
- AI-generated credibility analysis
- Contains composite score, ML results, fact-check evidence
- Can have many votes and bookmarks

**votes** (N:1 with profiles, N:1 with verification_reports)
- Community up/down votes on reports
- Unique constraint: one vote per user per report

**bookmarks** (N:1 with profiles)
- User bookmarks for articles or reports

**notifications** (N:1 with profiles)
- In-app notifications and announcements

**admin_actions** (N:1 with profiles)
- Immutable audit log of admin operations

---

## 3. Data Flow Diagrams

### Level 0 — Context Diagram

```
┌──────────┐                  ┌──────────────────┐                  ┌──────────┐
│          │  Submit Content  │                  │  Fetch News      │          │
│   User   │ ──────────────→ │   TruthLens      │ ←──────────────  │ News     │
│          │  View Results   │   System         │  Fact Checks     │ Sources  │
│          │ ←────────────── │                  │ ←──────────────  │          │
└──────────┘                  └──────────────────┘                  └──────────┘
```

### Level 1 — System Components

```
User → Frontend (React)
  → API Gateway (Express)
    → Supabase Auth (authenticate)
    → Supabase DB (store/retrieve data)
    → ML Service (verify content)
      → RoBERTa Model (classify text)
      → Tesseract OCR (extract text from images)
      → Google Fact Check API (cross-reference claims)
      → Scoring Engine (compute composite score)
    → GNews API (fetch news articles)
```

### Level 2 — Verification Pipeline

```
1. User submits content (text/URL/image)
2. API Gateway creates submission record (status: pending)
3. API Gateway forwards to ML Service
4. ML Service processes:
   a. URL → trafilatura extracts article text + metadata
   b. Image → Tesseract OCR extracts text
   c. Text → cleaned and normalized
5. Cleaned text → RoBERTa model → prediction (REAL/FAKE) + confidence
6. Extract claims from text
7. Query Google Fact Check API with claims
8. Look up source domain credibility
9. Compute composite score: 40% ML + 40% Source + 20% FactCheck
10. Determine verdict based on score thresholds
11. Return complete analysis to API Gateway
12. API Gateway saves verification_report to database
13. API Gateway returns report to frontend
14. Frontend displays CredibilityGauge, ScoreBreakdown, Evidence
```

---

## 4. Use Case Descriptions

### User Actor

| Use Case | Description | Precondition | Flow |
|----------|-------------|--------------|------|
| UC-01: Register | Create account with email/password | None | Enter details → verify email → select interests |
| UC-02: Login | Authenticate with credentials | Registered account | Enter email/password → receive session |
| UC-03: Read News | Browse personalized news feed | Authenticated | View dashboard → filter by topic → read articles |
| UC-04: Verify Text | Submit text for AI analysis | Authenticated | Enter text → submit → view credibility report |
| UC-05: Verify URL | Submit URL for analysis | Authenticated | Enter URL → submit → view report with extracted content |
| UC-06: Verify Image | Upload image for OCR + analysis | Authenticated | Upload image → OCR extracts text → view report |
| UC-07: Vote | Rate verification reports | Authenticated | View report → click thumbs up/down |
| UC-08: Bookmark | Save articles and reports | Authenticated | Click bookmark icon → saved to bookmarks page |
| UC-09: Search | Find specific articles | Authenticated | Enter keyword → apply filters → view results |

### Admin Actor

| Use Case | Description |
|----------|-------------|
| UC-10: Manage Users | View, ban, suspend, or change roles for users |
| UC-11: Manage Sources | Add/edit news source credibility scores |
| UC-12: Override Verdicts | Manually override AI-generated verdicts |
| UC-13: View Analytics | Dashboard with platform statistics and trends |
| UC-14: Send Announcements | Broadcast notifications to all users |
| UC-15: Review Disputes | Review reports flagged by community voting |

### System Actor

| Use Case | Description |
|----------|-------------|
| UC-16: Fetch News | Automatically fetch news every 30 minutes via cron |
| UC-17: Auto-Flag | Flag reports when >60% of votes are negative |

---

## 5. Security Considerations

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based (USER/ADMIN) with middleware guards
- **Row Level Security**: All Supabase tables have RLS policies
- **Rate Limiting**: Different limits for general, auth, and verification endpoints
- **Input Validation**: Express-validator on all request bodies
- **CORS**: Restricted to frontend origin
- **Helmet.js**: Security headers (XSS, content-type sniffing, etc.)
- **Service Role Key**: Never exposed to frontend; only used in backend

---

## 6. Scalability Considerations

- **Horizontal Scaling**: Each service can be independently scaled
- **Database**: Supabase PostgreSQL with indexed queries
- **ML Service**: Can be deployed with GPU instances for faster inference
- **Caching**: React Query provides client-side caching with stale-while-revalidate
- **CDN**: Frontend served via Vercel's global CDN
- **Background Jobs**: News fetching runs on cron without blocking API requests
