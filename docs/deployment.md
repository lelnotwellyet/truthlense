# TruthLens — Deployment Guide

## Prerequisites
- Node.js 20+
- Python 3.11+
- Git
- Supabase account (free tier)
- GNews API key (free tier)
- Google Cloud account (for Fact Check API, optional)

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to **SQL Editor** → **New Query**
4. Copy the contents of `docs/schema.sql` and run it
5. Go to **Settings** → **API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ Never expose the service_role key in frontend code.

---

## 2. ML Service Deployment (Render)

### Option A: Docker (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** truthlens-ml
   - **Root Directory:** `ml-service`
   - **Runtime:** Docker
   - **Instance Type:** Standard (need GPU for faster inference, but CPU works)
   
5. Environment Variables:
   ```
   GOOGLE_FACT_CHECK_API_KEY=your_key_here
   ```
   
6. Health Check Path: `/health`

### Option B: Manual

```bash
cd ml-service
pip install -r requirements.txt
sudo apt-get install tesseract-ocr  # For OCR support
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> ⚠️ First startup downloads ~500MB model. Allow 5-10 minutes.

---

## 3. Backend Deployment (Render)

1. Go to Render → **New** → **Web Service**
2. Settings:
   - **Name:** truthlens-api
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   
3. Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ML_SERVICE_URL=https://truthlens-ml.onrender.com
   GNEWS_API_KEY=your_gnews_key
   GOOGLE_FACT_CHECK_API_KEY=your_google_key
   FRONTEND_URL=https://truthlens.vercel.app
   ```

---

## 4. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
4. Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://truthlens-api.onrender.com/api
   ```

---

## 5. Post-Deployment Checklist

- [ ] ML Service `/health` returns `{ "status": "healthy", "model_loaded": true }`
- [ ] Backend `/health` returns `{ "status": "healthy" }`
- [ ] Frontend loads at Vercel URL
- [ ] User can sign up and log in
- [ ] News articles load on dashboard
- [ ] Text verification returns credibility score
- [ ] URL verification extracts and analyzes content
- [ ] Image upload triggers OCR + analysis
- [ ] Admin dashboard accessible for admin users
- [ ] CORS configured correctly (no console errors)

---

## Local Development

```bash
# Terminal 1: ML Service
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Backend
cd server
npm install
npm run dev

# Terminal 3: Frontend
cd client
npm install
npm run dev
```

Copy `.env.example` to `.env` in each directory and fill in your keys.
