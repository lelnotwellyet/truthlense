# TruthLens — Viva Preparation Notes

## 50+ Expected Questions and Answers

---

### Architecture & Design

**Q1: Why did you choose a microservice architecture?**
A: We use three independent services (React frontend, Express API gateway, FastAPI ML service) to achieve separation of concerns. The ML model requires Python/PyTorch which can't run in Node.js. Microservices also allow independent scaling — the ML service can be deployed on GPU instances while the API gateway runs on cheaper CPU instances. Each service can be developed, tested, and deployed independently.

**Q2: Why is the backend an API gateway instead of directly connecting frontend to services?**
A: The API gateway pattern provides: (1) single entry point for the frontend, (2) authentication/authorization enforcement before requests reach services, (3) request aggregation and data transformation, (4) rate limiting, (5) the frontend never directly accesses the ML service or database admin functions, improving security.

**Q3: Why Supabase instead of a self-hosted PostgreSQL?**
A: Supabase provides: managed PostgreSQL with automatic backups, built-in authentication (email/password, JWT tokens), Row Level Security policies at the database level, real-time subscriptions, file storage, and a generous free tier. This reduces infrastructure complexity for a student project while maintaining production-grade security.

**Q4: Explain the data flow when a user verifies an article URL.**
A: (1) User enters URL in React frontend → (2) Frontend sends POST /api/verify/url to Express backend → (3) Backend authenticates the request → (4) Backend forwards to FastAPI ML service POST /verify-url → (5) ML service uses trafilatura to extract article text and metadata → (6) Extracted text is cleaned and fed to RoBERTa model → (7) Claims are extracted and sent to Google Fact Check API → (8) Source domain credibility is looked up → (9) Composite score is calculated (40% ML + 40% Source + 20% FactCheck) → (10) Result returned to backend → (11) Backend saves submission and report to Supabase → (12) Report returned to frontend for display.

**Q5: How do you handle service failures?**
A: Graceful degradation: if the ML service is down, the backend returns a 502 error with a meaningful message. If the Fact Check API fails, we default to a neutral score of 50. If GNews API is unavailable, we skip news fetching but the app still works with cached articles. All errors are logged with Winston (backend) and Python logging (ML service).

---

### Machine Learning

**Q6: What ML model do you use and why?**
A: We use `hamzab/roberta-fake-news-classification`, a RoBERTa model fine-tuned on fake news datasets. RoBERTa (Robustly Optimized BERT Approach) is a transformer-based language model from Facebook AI. We chose this specific model because: (1) it's pre-trained and ready to use — no training required, (2) it achieves ~90% accuracy on fake news classification, (3) it's available on HuggingFace for easy loading.

**Q7: How does the RoBERTa model work?**
A: RoBERTa is based on the Transformer architecture with self-attention mechanisms. Input text is tokenized into subword tokens, converted to embeddings, and passed through 12 transformer layers. Each layer uses multi-head self-attention to capture contextual relationships between tokens. The final [CLS] token representation is passed through a classification head that outputs logits for two classes (REAL/FAKE). We apply softmax to get probabilities.

**Q8: Did you train the model?**
A: No. We use the model as-is from HuggingFace. It was pre-trained on a large corpus (RoBERTa base) and then fine-tuned on a fake news dataset by the model author. We load it using `AutoModelForSequenceClassification.from_pretrained()` and run inference only.

**Q9: What is the composite credibility score formula?**
A: `Final Score = 0.4 × ML Score + 0.4 × Source Credibility + 0.2 × Fact Check Score`. The ML Score is the model's confidence if it predicts REAL, or (100 - confidence) if it predicts FAKE. This multi-signal approach is more reliable than ML alone because it considers the reputation of the source and existing fact-checks.

**Q10: How do you handle the model's limitations?**
A: The model has limitations: it was trained on English text, it may not understand recent events, and it can be fooled by well-written misinformation. We mitigate this by: (1) combining ML with source credibility and fact-checking, (2) community voting to flag incorrect results, (3) admin override capability, (4) clearly showing score breakdown so users understand the basis.

**Q11: What is OCR and how do you use it?**
A: OCR (Optical Character Recognition) converts images of text into machine-readable text. We use Tesseract OCR (via pytesseract) to extract text from uploaded images (screenshots of articles, social media posts). The extracted text is then fed through the same ML pipeline as text submissions.

---

### Database

**Q12: Explain your database schema design.**
A: We have 10 tables following 3NF normalization. The core entities are: profiles (users), articles (news), sources (credibility ratings), submissions (user inputs), and verification_reports (AI results). Supporting tables handle votes, bookmarks, notifications, user_preferences, and admin_actions. Foreign keys enforce referential integrity, and we use UUIDs as primary keys for security (no sequential IDs).

**Q13: What is Row Level Security (RLS)?**
A: RLS is a PostgreSQL feature that automatically filters rows based on the current user. For example, users can only see their own bookmarks and notifications, but articles are visible to everyone. Admins bypass these restrictions. RLS is enforced at the database level, so even if application code has bugs, unauthorized data access is prevented.

**Q14: How do you prevent duplicate articles?**
A: The `articles.url` column has a UNIQUE constraint. When fetching from GNews, we check if the URL already exists before inserting. If it does, we skip it. This happens in the `processAndStoreArticles` function.

**Q15: Explain the trigger that creates profiles automatically.**
A: We have a PostgreSQL trigger `on_auth_user_created` that fires AFTER INSERT on `auth.users`. It calls `handle_new_user()` which automatically creates a profile record and default user_preferences for every new signup. This ensures data consistency — every authenticated user always has a profile.

---

### API Design

**Q16: Why REST instead of GraphQL?**
A: REST is simpler to implement, debug, and document. Our API has straightforward CRUD operations that map naturally to REST endpoints. GraphQL would add complexity without significant benefit for our use case. REST is also more widely understood, which is important for a team project.

**Q17: How does authentication work?**
A: We use Supabase Auth which issues JWT tokens. On login, the user receives an access_token. This token is sent in the Authorization header with every API request. The backend middleware extracts the token, verifies it with Supabase's auth.getUser(), and attaches the user to the request object.

**Q18: How do you prevent API abuse?**
A: Three-tier rate limiting: general routes (100 req/15min), auth routes (10 req/15min), verification routes (20 req/15min). We use express-rate-limit middleware. Additionally, Helmet.js sets security headers, CORS restricts origins, and input validation prevents injection attacks.

---

### Frontend

**Q19: Why React with Vite instead of Next.js?**
A: Vite provides faster development builds and HMR (Hot Module Replacement). Since our backend is a separate Express service, we don't need Next.js's server-side rendering or API routes. React SPA (Single Page Application) with client-side routing is sufficient for our use case.

**Q20: How do you manage state?**
A: Three state management approaches: (1) React Context for global auth state (user, session, profile), (2) React Query for server state (news, reports, bookmarks) with automatic caching and refetching, (3) Local component state (useState) for UI state (form inputs, modal visibility).

**Q21: How does the CredibilityGauge component work?**
A: It's an SVG-based circular arc gauge. We calculate the arc path using trigonometry based on the score (0-100). The stroke color transitions from green (80+) to blue (60-79) to amber (40-59) to red (0-39). Framer Motion animates the arc fill on mount for a smooth appearance.

---

### Security

**Q22: What OWASP Top 10 vulnerabilities do you address?**
A: (1) Broken Access Control → RLS + middleware auth + admin guards. (2) Cryptographic Failures → passwords handled by Supabase Auth with bcrypt. (3) Injection → parameterized queries via Supabase client, input validation. (4) Security Misconfiguration → Helmet.js, CORS. (5) Identification/Auth Failures → rate limiting on auth endpoints. We also validate all file uploads (type, size limits).

**Q23: How do you store passwords?**
A: We don't store passwords directly. Supabase Auth handles password hashing using bcrypt with salt rounds. We only receive JWT tokens after authentication.

---

### Testing

**Q24: What is your testing strategy?**
A: Three-layer testing: (1) Unit tests for utility functions, scoring engine, text cleaning. (2) Route/API tests for endpoint behavior, authentication guards, input validation. (3) Component tests for React UI rendering and user interactions. We use mocking extensively to isolate units.

**Q25: How do you test the ML service without loading the model?**
A: We use pytest fixtures with MagicMock to create a mock classifier that returns predictable results. The test client uses httpx AsyncClient with ASGITransport to test FastAPI endpoints without a running server.

---

### Deployment

**Q26: Explain your deployment architecture.**
A: Frontend on Vercel (global CDN, automatic builds from Git), Backend on Render (Node.js web service), ML Service on Render (Docker container with Tesseract), Database on Supabase (managed PostgreSQL). Each service has its own environment variables and can be scaled independently.

**Q27: How does the news fetching cron job work?**
A: node-cron schedules a job every 30 minutes (`*/30 * * * *`). It calls `fetchAllTopics()` which iterates through 7 topics, fetches articles from GNews API, deduplicates by URL, looks up source credibility, and inserts new articles into the database.

---

### Advanced / Future

**Q28: What improvements would you make?**
A: (1) Real-time notifications using Supabase Realtime, (2) Multi-language support with multilingual models, (3) Browser extension for in-page verification, (4) Multiple ML models ensemble for higher accuracy, (5) User reputation system based on voting accuracy, (6) Automated fact-checking with web search, (7) CI/CD pipeline with GitHub Actions.

**Q29: How would you scale to millions of users?**
A: (1) Add Redis caching for frequently accessed articles, (2) Deploy ML service on GPU instances with load balancing, (3) Use Supabase connection pooling, (4) Add CDN for static assets, (5) Implement database read replicas, (6) Queue-based architecture for verification requests using Bull/Redis.

**Q30: How does the community voting auto-flagging work?**
A: After each vote, the system checks if downvotes exceed 60% of total votes (minimum 5 votes). If so, the report's `is_public` flag is set to false, effectively hiding it. Admins can review flagged reports and either restore or permanently remove them.

---

### More Questions (Q31-Q55)

**Q31:** What is a transformer model? — Self-attention based neural network architecture.
**Q32:** What is tokenization? — Converting text into numerical tokens the model can process.
**Q33:** What is softmax? — Function that converts logits to probabilities that sum to 1.
**Q34:** What are REST principles? — Stateless, resource-based URLs, HTTP methods, JSON responses.
**Q35:** What is JWT? — JSON Web Token for stateless authentication.
**Q36:** What is CORS? — Cross-Origin Resource Sharing policy for browser security.
**Q37:** What is middleware in Express? — Functions that process requests before reaching route handlers.
**Q38:** What is React Context? — Built-in state management for sharing data across components.
**Q39:** What is React Query? — Server state management library with caching and auto-refetching.
**Q40:** What is Tailwind CSS? — Utility-first CSS framework for rapid UI development.
**Q41:** What is glassmorphism? — UI design trend using frosted glass effect with backdrop blur.
**Q42:** What is Vite? — Fast build tool using native ES modules for development.
**Q43:** What is ESM? — ECMAScript Modules (import/export syntax).
**Q44:** What is Docker? — Containerization platform for consistent deployment.
**Q45:** What is a cron job? — Scheduled task that runs at specified intervals.
**Q46:** What is rate limiting? — Restricting the number of API requests per time window.
**Q47:** What is input validation? — Checking user input for correctness and security.
**Q48:** What is an API gateway pattern? — Single entry point that routes to multiple backend services.
**Q49:** What is database normalization? — Organizing data to reduce redundancy (1NF, 2NF, 3NF).
**Q50:** What is trafilatura? — Python library for extracting text content from web pages.
**Q51:** What is Tesseract? — Open-source OCR engine maintained by Google.
**Q52:** What is Supabase? — Open-source Firebase alternative built on PostgreSQL.
**Q53:** What is Framer Motion? — React animation library for declarative animations.
**Q54:** What is Axios? — Promise-based HTTP client for making API requests.
**Q55:** What makes this a 150-mark worthy project? — Microservice architecture, AI/ML integration, 16 features, complete testing, production deployment, comprehensive documentation, professional UI.
