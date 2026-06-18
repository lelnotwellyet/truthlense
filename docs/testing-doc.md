# TruthLens — Testing Documentation

## Testing Strategy

| Layer | Framework | Runner | Coverage Target |
|-------|-----------|--------|----------------|
| ML Service | pytest + httpx | pytest | 80%+ |
| Backend API | Jest + Supertest | Jest (ESM) | 80%+ |
| Frontend | Vitest + React Testing Library | Vitest | 80%+ |

---

## How to Run Tests

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Backend
```bash
cd server
npm install
npm test
```

### Frontend
```bash
cd client
npm install
npx vitest run
```

---

## Test Catalog

### ML Service Tests

| File | Tests | What It Covers |
|------|-------|----------------|
| `tests/test_predict.py` | 5 | POST /predict with valid text, empty text, missing text, response format, whitespace-only |
| `tests/test_verify.py` | 5 | POST /verify-text (basic, with source), POST /verify-url (success, failure), POST /verify-image (success, no text) |
| `tests/test_scoring.py` | 12 | Composite score with REAL/FAKE, all 4 verdict thresholds, score breakdown, clamping, source score lookups |
| `tests/test_text_cleaner.py` | 12 | HTML removal, URL removal, whitespace normalization, unicode, edge cases, claim extraction |

### Backend Tests

| File | Tests | What It Covers |
|------|-------|----------------|
| `tests/auth.test.js` | 4 | Login endpoint exists, signup validates input, /me requires auth, /health returns healthy |
| `tests/news.test.js` | 5 | GET /api/news returns array, topic filter, trending endpoint, search with keyword, sources list |
| `tests/verify.test.js` | 3 | verify/text requires auth, verify/url requires auth, reports requires auth |
| `tests/admin.test.js` | 4 | admin/users requires auth, analytics requires auth, delete article requires auth, announcements require auth |

### Frontend Tests

| File | Tests | What It Covers |
|------|-------|----------------|
| `src/__tests__/components/Button.test.jsx` | 4 | Render, click handler, disabled state, loading state |
| `src/__tests__/components/CredibilityGauge.test.jsx` | 3 | Render with different scores, correct color coding |
| `src/__tests__/pages/Login.test.jsx` | 3 | Form renders, input fields present, validation |
| `src/__tests__/pages/Dashboard.test.jsx` | 2 | Component renders, shows welcome message |

---

## Integration Testing Approach

1. **ML Pipeline Integration**: Test the full flow from text input → cleaning → model inference → scoring
2. **API Gateway Integration**: Test backend → ML service communication with mocked ML responses
3. **Auth Flow Integration**: Test signup → login → protected route access
4. **Verification Pipeline**: Test submit → ML analysis → DB save → report retrieval

---

## Coverage Targets

- **Unit Tests**: All utility functions, validators, middleware, scoring engine
- **Route Tests**: All API endpoints return correct status codes and response shapes
- **Component Tests**: All UI components render correctly with various props
- **Target**: 80%+ line coverage per service

---

## Sample Test Run Output

```
ML Service:
======================== test session starts =========================
tests/test_predict.py ........                                   [ 25%]
tests/test_scoring.py ............                               [ 60%]
tests/test_text_cleaner.py ............                          [ 95%]
tests/test_verify.py .....                                      [100%]
==================== 34 passed in 2.43s =============================

Backend:
PASS  tests/auth.test.js (4 tests)
PASS  tests/news.test.js (5 tests)
PASS  tests/verify.test.js (3 tests)
PASS  tests/admin.test.js (4 tests)
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
```
