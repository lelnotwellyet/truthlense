# 🔍 TruthLens — AI-Powered News Verification & Aggregation Platform

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-dark?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A production-grade microservice web application that uses AI to verify news credibility, detect misinformation, and aggregate personalized news feeds.

---

## Architecture

```
Frontend (React + Vite)  ←→  API Gateway (Express.js)  ←→  Supabase PostgreSQL
                                      ↕
                              FastAPI ML Service
                              (RoBERTa + Tesseract OCR)
                                      ↕
                              Google Fact Check API
```

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication** | Signup, login, logout, password reset with role-based access (USER/ADMIN) |
| 2 | **User Profiles** | Name, avatar, bio, interest selection, verification history |
| 3 | **Personalized News Feed** | News filtered by user's chosen topics |
| 4 | **News Aggregation** | Auto-fetches from GNews API every 30 minutes |
| 5 | **AI Fake News Detection** | RoBERTa transformer model classifies REAL/FAKE with confidence |
| 6 | **Fact-Check Engine** | Cross-references claims with Google Fact Check Tools API |
| 7 | **Source Credibility** | Database of news source credibility scores |
| 8 | **Composite Scoring** | 40% ML + 40% Source + 20% FactCheck = final credibility score |
| 9 | **Image Verification** | OCR extracts text from images → ML analysis |
| 10 | **Community Verification** | Share and view public verification reports |
| 11 | **Community Voting** | Thumbs up/down with auto-flagging at >60% negative |
| 12 | **Bookmarks** | Save articles and reports for later |
| 13 | **Search** | Search by keyword, topic, source, date, credibility |
| 14 | **Trending Misinformation** | Dashboard showing disputed claims and flagged domains |
| 15 | **Notifications** | In-app notifications and admin announcements |
| 16 | **Admin Dashboard** | User management, analytics, content moderation |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Query, Framer Motion |
| Backend | Node.js, Express.js, Winston, node-cron |
| ML Service | Python, FastAPI, HuggingFace Transformers, PyTorch |
| OCR | Tesseract OCR |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Deployment | Vercel (frontend), Render (backend + ML) |

## 📁 Project Structure

```
truthlens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI, layout, news, verify, community components
│   │   ├── pages/          # All page components
│   │   ├── hooks/          # React Query hooks
│   │   ├── context/        # Auth and Theme context
│   │   ├── config/         # Supabase and Axios config
│   │   └── utils/          # Formatters and validators
│   └── package.json
├── server/                 # Express API gateway
│   ├── src/
│   │   ├── routes/         # Auth, news, verify, admin, etc.
│   │   ├── middleware/     # Auth, admin, rate limiting
│   │   ├── services/       # News fetching, ML client, cron
│   │   └── utils/          # Logger, validators
│   └── package.json
├── ml-service/             # FastAPI ML service
│   ├── app/
│   │   ├── models/         # RoBERTa classifier
│   │   ├── services/       # Text, URL, image analyzers
│   │   ├── routes/         # Predict, verify, health
│   │   └── utils/          # Scoring, text cleaning
│   └── requirements.txt
├── docs/                   # Documentation
│   ├── schema.sql          # Database schema
│   ├── api-docs.md         # API documentation
│   ├── deployment.md       # Deployment guide
│   ├── technical-doc.md    # Architecture & design docs
│   ├── testing-doc.md      # Testing strategy
│   └── viva-notes.md       # Viva preparation (55 Q&A)
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+, Python 3.11+, Git
- Supabase account (free: [supabase.com](https://supabase.com))
- GNews API key (free: [gnews.io](https://gnews.io))

### Setup

```bash
# Clone the repository
git clone <repo-url> && cd truthlens

# 1. Database — run docs/schema.sql in Supabase SQL Editor

# 2. ML Service
cd ml-service
cp .env.example .env    # Add your API keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Backend
cd ../server
cp .env.example .env    # Add your Supabase keys
npm install && npm run dev

# 4. Frontend
cd ../client
cp .env.example .env    # Add your Supabase URL + key
npm install && npm run dev
```

### Environment Variables

See `.env.example` in each directory. Required keys:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GNEWS_API_KEY`
- `GOOGLE_FACT_CHECK_API_KEY` (optional, enhances fact-checking)

## 🧪 Testing

```bash
# ML Service
cd ml-service && pytest tests/ -v --cov=app

# Backend
cd server && npm test

# Frontend
cd client && npx vitest run
```

## 📖 Documentation

- [API Documentation](docs/api-docs.md)
- [Deployment Guide](docs/deployment.md)
- [Technical Documentation](docs/technical-doc.md)
- [Testing Documentation](docs/testing-doc.md)
- [Viva Notes (55 Q&A)](docs/viva-notes.md)
- [Database Schema](docs/schema.sql)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
