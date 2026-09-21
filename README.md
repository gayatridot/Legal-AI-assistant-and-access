# LexiGuard — AI for Legal Assistance & Access

> **Hackathon Vertical:** AI for Legal Assistance & Access  
> **Architecture:** Next.js / Express + React 18 + LangChain.js + In-Memory Vector Store RAG + Google Gemini API  
> **Repository Size:** ~278 KB (Hard constraint: < 10 MB)  
> **Test Coverage:** Vitest unit test suite covering PDF parsing, risk score aggregation, and vector retrieval.

---

## 1. Executive Summary & Problem Statement

Legal documents—such as commercial real estate leases, contractor services agreements, non-disclosure agreements, and employment contracts—are routinely drafted with dense, asymmetric legalese designed to protect corporate balance sheets at the expense of everyday citizens, tenants, and independent freelancers.

Most individuals and small businesses cannot afford legal representation ($400–$800/hour) merely to evaluate basic risks before signing. **LexiGuard** democratizes access to justice by providing an accessible, instant, and privacy-first legal document assistant that:
1. Translates predatory clauses into plain 8th-grade English.
2. Flags hidden risks (e.g. unilateral indemnities, automatic renewals with penalties, liquidated damages, and unfair venue selection).
3. Provides grounded conversational Q&A via in-memory LangChain RAG.
4. Prepares an actionable consultation kit with prioritized questions for legal counsel.

---

## 2. Core Features

- **Smart Document Analyzer:** Ingests contracts via drag-and-drop PDF upload, `.txt` file parsing, or direct text pasting. Includes pre-loaded realistic contract templates (Commercial Lease, Freelance Services, Mutual NDA) for immediate testing.
- **Clause Risk & Flagging Engine:** Automatically detects predatory patterns and assigns High, Medium, or Low risk severity with clear explanations and suggested fairer counter-clauses.
- **Side-by-Side Legalese Simplifier:** Side-by-side comparison between verbatim contract text and everyday 8th-grade explanations, backed by an interactive Jargon Glossary.
- **RAG-Based Interactive Q&A:** Grounded document chatbot powered by LangChain memory vector retrieval. Every answer includes source clause citations and match scores.
- **Lawyer Consultation Checklist:** Auto-generates an actionable attorney prep kit, missing contract safeguards to insert, immediate red-flag checklist, and negotiation priorities.
- **Accessibility & Compliance:** Full ARIA compliance, keyboard navigation, high-contrast mode toggle, and persistent Legal Disclaimer banners.

---

## 3. Architecture & Technical Approach

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 + Tailwind)           │
│  - DocumentUploader  - RiskOverviewCard  - RagChatBot   │
│  - ClauseRiskEngine  - LegaleseSimplifier - PrepKit    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP /api/analyze & /api/chat
┌──────────────────────────▼─────────────────────────────┐
│             Node.js / Express Server API                │
├──────────────────────────┬─────────────────────────────┤
│ Sanitization & Security  │ Sanitizes inputs, removes   │
│                          │ null bytes, blocks injection│
├──────────────────────────┼─────────────────────────────┤
│ PDF Extraction Engine    │ In-memory text extraction   │
│                          │ via pdf-parse               │
├──────────────────────────┼─────────────────────────────┤
│ Heuristic Risk Engine    │ Regex pattern matcher for   │
│                          │ predatory traps & scoring   │
├──────────────────────────┼─────────────────────────────┤
│ In-Memory LangChain RAG  │ Ephemeral Vector Store with │
│                          │ semantic cosine similarity  │
├──────────────────────────┼─────────────────────────────┤
│ LLM Provider Engine      │ Google Gemini 1.5 Flash     │
│                          │ with responsible guardrails │
└──────────────────────────┴─────────────────────────────┘
```

### Serverless & Zero-Cost Vector Store
Instead of requiring costly external vector databases (e.g. Pinecone, Weaviate), LexiGuard utilizes a lightweight in-memory vector store implementing LangChain's `VectorStore` interface. Each document is chunked with section boundary awareness and indexed with normalized embeddings, enabling zero-latency similarity retrieval directly on the server.

---

## 4. Security & Responsible AI Safeguards

1. **Zero Hardcoded Secrets:** All Gemini API interactions occur strictly server-side via `process.env.GEMINI_API_KEY`.
2. **Strict Client-Side & Server-Side Sanitization:** Null bytes, dangerous control characters, and common prompt injection payloads (e.g. `"ignore previous instructions"`) are stripped prior to model ingestion.
3. **Mandatory Legal Notice Banner:** A prominent disclaimer is displayed across all views:
   > *"Provides educational and informational assistance only; does not replace formal legal counsel."*
4. **System Guardrails Against Binding Legal Advice:** The system instructions forbid the model from providing definitive legal counsel, establishing attorney-client relationships, or guaranteeing outcome predictions.
5. **No Data Retention / Ephemeral Memory:** In-memory vector indexes are ephemeral and deleted upon session termination, preventing data leakage.

---

## 5. Directory Structure

```
├── app/
│   └── api/
│       ├── analyze/route.ts   # Document ingestion, parsing, & scoring endpoint
│       └── chat/route.ts      # Grounded RAG conversation endpoint
├── components/
│   ├── ClauseRiskEngine.tsx   # Risk tagging, category filtering & counter-clauses
│   ├── DocumentUploader.tsx   # File dropzone & sample contracts
│   ├── Header.tsx             # Navigation, theme toggle, and print controls
│   ├── LawyerPrepKit.tsx      # Consultation checklist & missing clauses
│   ├── LegalDisclaimerBanner.tsx # Prominent disclaimer with guardrail details
│   ├── LegaleseSimplifier.tsx # Side-by-side translation & legal glossary
│   ├── RagChatBot.tsx         # Vector-grounded Q&A with source citations
│   └── RiskOverviewCard.tsx   # Score gauge & executive summary
├── lib/
│   ├── document-analyzer.ts   # Main analysis orchestration
│   ├── gemini.ts              # Server-side Gemini client wrapper
│   ├── pdf-parser.ts          # PDF parsing & text normalization
│   ├── rag.ts                 # LangChain in-memory RAG pipeline
│   ├── risk-engine.ts         # Risk scoring & pattern detector
│   ├── sample-contracts.ts    # Realistic test contracts
│   └── sanitizer.ts           # Input sanitization & injection guards
├── types/
│   └── legal.ts               # Strict TypeScript interfaces & Enums
├── __tests__/
│   ├── pdf-parser.test.ts     # Unit tests for PDF parsing
│   ├── rag.test.ts            # Unit tests for chunking & vector search
│   └── risk-engine.test.ts    # Unit tests for predatory risk scoring
├── server.ts                  # Express server entry point with Vite middleware
├── package.json               # Scripts & dependencies
└── metadata.json              # Applet metadata
```

---

## 6. Testing & Quality Assurance

All unit tests are written with **Vitest**:

```bash
# Run unit tests
npm test
```

### Test Suite Summary
- `__tests__/pdf-parser.test.ts`: Validates PDF buffer decoding, page count extraction, and sanitization of corrupted inputs.
- `__tests__/risk-engine.test.ts`: Tests predatory pattern matching (indemnity, auto-renewal, liquidated damages, jury trial waivers), risk level categorization, and score calculation.
- `__tests__/rag.test.ts`: Verifies section-aware text chunking, normalized embedding generation, and in-memory similarity retrieval.

---

## 7. Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key (`GEMINI_API_KEY`)

### Installation & Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start the dev server on port 3000
npm run dev

# Build for production
npm run build
```

Open `http://localhost:3000` in your browser. Select any sample contract to immediately inspect clause risks, translations, grounded RAG search, and lawyer prep checklists.

---

## 8. Deploying to Vercel

LexiGuard is pre-configured for seamless deployment to **Vercel** via Serverless Functions (`api/index.ts`) and automatic SPA routing (`vercel.json`).

### Step-by-Step Vercel Setup

1. **Push Code to GitHub / Git Repository**.
2. **Import Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Select your repository.
   - Vercel will automatically detect Vite / Node framework configuration.
3. **Configure Environment Variables**:
   - Under **Project Settings** -> **Environment Variables**, add:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: `Your_Actual_Gemini_API_Key`
   - Click **Save**.
4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and route `/api/*` requests to Vercel Serverless Functions.

