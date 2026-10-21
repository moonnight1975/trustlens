# 🛡️ TrustLens

> **Evidence before confidence.**  
> TrustLens is a transparent, evidence-based AI answer verification engine. It extracts verifiable claims from AI outputs, searches for independent external evidence, cross-examines facts, and computes a deterministic, multi-dimensional trust score.

---

## 🌟 Overview

Large Language Models (LLMs) often generate confident but incorrect assertions ("hallucinations"). Typical validation approaches either rely on user intuition or ask another LLM to grade itself—introducing circular bias.

**TrustLens** takes a fundamentally different approach:
1. **Extracts factual claims** and filters out opinions and subjective claims.
2. **Retrieves independent evidence** directly from the live web and trusted knowledge bases (Wikipedia, Brave Search).
3. **Audits each claim** using lexical pattern verification and model-assisted semantic checking.
4. **Calculates a deterministic trust score in code**—the AI model *never* chooses or tweaks the final score.
5. **Complements deterministic scores with Soft Computing (Fuzzy Logic)** and **TCS (Trust–Confidence–Stability)** intervals.

---

## ✨ Key Features

### 🔍 Claim-by-Claim Verification
- **Automated Claim Extraction**: Parses AI answers into atomic factual claims.
- **Categorization & Weighting**: Identifies category (numerical, historical, scientific, financial, temporal, etc.) and assigns importance levels (1–5).
- **Status Classification**:
  - `SUPPORTED`: Validated with linked external citations.
  - `PARTIALLY_SUPPORTED`: Broadly aligned, missing exact figures, or dated sources for time-sensitive facts.
  - `CONTRADICTED`: Conflicts directly with retrieved data.
  - `UNVERIFIED`: Insufficient or inaccessible sources (not assumed to be false).
  - `NOT_APPLICABLE`: Subjective statements or opinions not scored as factual claims.

### 🌐 Ground-Truth Evidence Retrieval
- Live search queries hit **Wikipedia**, **Brave Search**, and web extractors.
- Sources are evaluated with a **Source Quality Index**:
  - `PRIMARY_OFFICIAL` (1.0x factor)
  - `SECONDARY_REPUTABLE` (0.92x factor)
  - `GENERAL` (0.78x factor)
  - `LOW_CONFIDENCE` (0.55x factor)
- Links are validated for safety and displayed with excerpts and last-updated timestamps.

### 🧠 Soft Computing & Fuzzy Trust
- **Mamdani Fuzzy Inference System**: Evaluates support, contradiction, and coverage against linguistic membership functions (low, medium, high).
- **Centroid Defuzzification**: Computes a continuous fuzzy trust score independent of standard linear summation.
- Fired rule inspection directly displayed in every analysis report.

### 📊 TCS Index (Trust · Confidence · Stability)
- **Trust**: Base fuzzy trust output.
- **Confidence**: An explicit confidence interval (e.g. `68–84`), with interval width expanding when sources are sparse or low-quality.
- **Stability**: Monitors time-sensitive claims (inflation, stock prices, elected officials, laws) against source publication and update dates.

### 🤖 Multi-AI Model Comparison
- Run prompts concurrently across multiple AI engines (xAI / Grok, OpenAI, Anthropic, Gemini, or local models).
- Compare responses side-by-side to detect where models diverge or agree on specific facts.

### 📈 Multi-Dimensional Score Radar
- Interactive SVG / Recharts radar diagram analyzing:
  - **Factuality**
  - **Evidence Support**
  - **Evidence Coverage**
  - **Logical Consistency**
  - **Semantic Alignment**
  - **Groundedness** (100 minus Hallucination Risk)

### 🎙️ Interactive Voice Assistant
- Built-in floating Assistant Dock powered by the **Web Speech API**.
- Supports Speech Recognition (voice queries) and Speech Synthesis (spoken answers).
- Context-aware: can answer questions specifically about the open report's claims, sources, and score breakdown.

### 🎨 Modern Neumorphic & Glassmorphic UI
- Fixed floating navbar with glassmorphic backdrop blur and neumorphic drop-shadows.
- Dual-state 3D flip buttons with smooth vertical slide transitions on hover.
- Full mobile responsiveness with horizontal scrollbar hiding.

---

## 🧮 Trust Score Methodology

The deterministic Trust Score (Formula v2026.10.1) is calculated in code via `@/lib/scoring/score.ts`:

$$\text{Trust Score} = \sum (\text{Metric} \times \text{Weight})$$

| Metric | Weight | Description |
| :--- | :---: | :--- |
| **Claim Support** | `30%` | Weighted proportion of supported verifiable claims |
| **Low Contradiction** | `22%` | Penalty based on severity and importance of contradicted claims |
| **Low Unverified Share** | `10%` | Penalty for unverified factual assertions |
| **Source Quality** | `10%` | Reliability grade of retrieved citations |
| **Evidence Coverage** | `10%` | Ratio of claims matched to external corroborating text |
| **Logical Consistency** | `10%` | Deductions for internal numerical or temporal contradictions |
| **Question Alignment** | `8%` | Semantic relevance between prompt and answer |

> **Critical Claim Protection**: If any claim with High Importance (level 4 or 5) is contradicted, the final score blends 65% of the weighted sum with 35% of that claim's score to prevent major errors from hiding behind superficial details.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- **UI Library**: React 19, [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com)
- **Icons & Visuals**: [Lucide React](https://lucide.dev), [Recharts](https://recharts.org)
- **Database / Cache**: [PGlite](https://github.com/electric-sql/pglite) (in-memory / client-side Postgres) & Local Storage
- **Build & Dev Tooling**: [Vite 8](https://vitejs.dev), [TypeScript](https://www.typescriptlang.org)
- **Testing**: Node.js Test Runner, Playwright

---

## 📁 Project Structure

```text
trust/
├── src/
│   ├── components/
│   │   ├── assistant-dock.tsx     # Voice & text AI assistant dock (STT / TTS)
│   │   ├── charts.tsx             # Radar charts & score visualizations
│   │   ├── report-view.tsx        # Comprehensive report view (Claims, TCS, Fuzzy)
│   │   ├── shell.tsx              # Application layout & floating pill navbar
│   │   └── ui.tsx                 # Core UI components (Buttons, Cards, Chips)
│   ├── lib/
│   │   ├── ai/                    # LLM provider clients & prompt assembly
│   │   ├── assistant/             # Assistant conversation and context handlers
│   │   ├── scoring/
│   │   │   ├── config.ts          # Score weights, status points, quality factors
│   │   │   ├── fuzzy.ts           # Mamdani fuzzy inference & centroid defuzzification
│   │   │   ├── score.ts           # Deterministic trust score formula
│   │   │   └── tcs.ts             # Trust-Confidence-Stability calculation
│   │   ├── search/                # Wikipedia & Brave search clients
│   │   ├── verify/                # Pipeline orchestration, claim extraction & judge
│   │   ├── storage.ts             # LocalStorage & analysis persistence
│   │   └── types.ts               # Core TypeScript definitions
│   ├── routes/
│   │   ├── __root.tsx             # Root document & layout shell
│   │   ├── index.tsx              # Analyze view (question/answer input)
│   │   ├── report.$id.tsx         # Detailed analysis report page
│   │   ├── history.tsx            # Past verification reports history
│   │   ├── compare.tsx            # Side-by-side report comparison
│   │   ├── multi.tsx              # Multi-AI model comparison
│   │   ├── verify.tsx             # Live web claim verification
│   │   ├── wellbeing.tsx          # Screen time & fact-checking mindfulness
│   │   └── settings.tsx           # API keys & model configuration
│   └── styles.css                 # Neumorphic utilities, theme tokens, flip buttons
├── scripts/                       # Migration, dev server & environment scripts
└── package.json                   # Dependencies & build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22.0.0 or higher
- **npm**: v10.0.0 or higher

### Installation

1. Clone the repository or navigate to the workspace:
   ```bash
   cd trust
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

---

## ⚙️ Configuration & API Keys

TrustLens functions out-of-the-box with local heuristic audits and Wikipedia public search. To enable advanced AI generation and broader web search:

1. Open the **Settings** tab in the navigation bar (`/settings`).
2. Configure your desired providers:
   - **xAI / Grok API Key**: For model-assisted claim verification and answer generation.
   - **Brave Search API Key**: For comprehensive real-time web evidence retrieval.
   - **OpenAI / Anthropic / Gemini**: For Multi-AI engine comparisons.
3. Settings are saved locally in browser storage.

---

## 🧪 Testing & Quality Checks

Run the verification suite:

```bash
# Type checking
npm run typecheck

# Unit tests
npm test

# Production build
npm run build
```

---

## 📄 Disclaimer

TrustLens provides evidence-based assistance and automated factual auditing. The presence or absence of retrieved citations does not constitute absolute ground truth. Always consult primary documentation for high-stakes decisions in legal, medical, or financial matters.

---

## 📜 License

Private / Proprietary. Developed for TrustLens workspace.
# trustlens
# trustlens
