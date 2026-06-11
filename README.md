# EcoMind AI &bull; Premium Carbon Intelligence Companion

EcoMind AI is a premium, full-stack, AI-powered Sustainability Coach and Carbon Decision Companion. It is designed to act not as a simple carbon calculator, but as an advanced personalized strategy companion inspired by Apple Health's aesthetic quality and modern wellness dashboards.

Rather than presenting generic eco-tips or raw carbon values, EcoMind AI utilizes a multi-stage decision architecture that highlights exact trade-offs with highly engaging gameplay triggers.

---

## 📋 Problem Statement

Traditional carbon calculators suffer from low engagement due to abstract metrics (e.g., tons of CO₂), lack of personalization, and static, unscientific recommendation formulas. Users are overwhelmed by generic ecological tips that fail to address their specific lifestyle levers. There is a critical disconnect between identifying a carbon footprint and executing a targeted, verified plan to reduce it.

## 💡 Approach

EcoMind AI provides an action-oriented solution by translating raw consumer metrics into personalized high-leverage steps. 
*   **Structured Core Pipeline**: We decouple quantitative emissions calculations and decision reasoning from the language model to prevent AI hallucinations. Calculations are managed by deterministic mathematical models.
*   **Explainability Engines**: Interactive explanations map out *why* a dynamic action step is prioritized and why other alternatives are rejected.
*   **Gamified Behavior Loops**: To encourage long-term adoption, we integrate standard engagement models: XP levels, badge triggers, dynamic daily/weekly quests, and real-time ledger histories.

---

## 🎯 Main Reasoning Architecture

EcoMind AI implements a strict, context-aware operational pipeline:

```
  [User Profile, Habits & Goals]
                 │
                 ▼
          [Context Engine] ───► Consolidated Unified Context
                 │
                 ▼
         [Decision Engine] ───► Identify Largest Emission Group & Top Action
                 │
                 ▼
     [Recommendation Engine] ─► Generate Ranked Actions with Multi-Reasoning Logs
                 │
                 ▼
   [Gemini Explanation Layer] ─► Contextual Explanation, Education & Coaching
```

1. **Context Engine**: Aggregates and normalizes multiple disparate data sources into a high-integrity, unified state representation containing user stats, historical logs, emission profiles, and specific goals.
2. **Decision Engine**: Conducts algorithmic multi-criteria evaluations over the compiled context, identifying the heaviest emission category and isolating the single highest-impact target action.
3. **Recommendation Engine**: Generates and ranks actionable upgrades, appending rich explainability metrics (`whySelected`, `whyRejected`, and `estimatedImpact`) for every recommendation.
4. **Gemini Explanation Layer (Restricted)**: Strictly restricted from generating recommendations directly. Instead, it serves purely to explain *why* recommendations matter, provide scientific education, and personalize the coaching journey.
5. **Durable Ledger Integration**: Completing recommendations awards XP and adds the saving record to an immutable audit ledger history synchronized to Google Cloud Firestore database partitions.

---

## ⚙️ Core Technical Engines

### 1. Context Engine (`src/services/contextEngine.ts`)
Creates a high-integrity `UnifiedContext` block, combining user profiles, historical logs, milestones, goals, and raw lifestyle factors into a single source of truth:
*   **Input**: `UserProfile`, `LifestyleData`, `ImpactLog[]`.
*   **Output**: `UnifiedContext` containing profile state, sanitized lifestyle data, ledger achievements history, and calculated emissions baseline.

### 2. Decision Engine (`src/services/decisionEngine.ts`)
Applies logic rules over the unified context to pinpoint peak-leverage carbon adjustments:
*   **Input**: `UnifiedContext` block.
*   **Output**: `largestEmissionSource`, `contributionPercentage`, `highestImpactAction`, `estimatedReduction`, and a rigorous comparative mathematical `reasoning` log.
*   **Trade-off Calculation**: Measures the exact performance gap of major structural shifts (e.g. EV commuting) over ambient domestic actions (e.g. standard material recycling) to demonstrate clear mathematical superiority.

### 3. Recommendation Engine (`src/services/recommendationEngine.ts`)
Compiles actionable, highly tailored structural upgrades ranked strictly in descending order of CO₂ saving potential:
*   **whySelected**: Clear, profile-driven reasons explaining why this specific action was generated (targeted directly at the user's high-emissions habits).
*   **whyRejected**: Detailed comparative rationale showing why it was deprioritized compared to the peak primary recommendation (with multiplier savings ratios).
*   **estimatedImpact**: Verifiable emission reduction outputs represented as solid, human-readable annual and monthly metrics.

### 4. Restricted Gemini Explanation Layer (`server.ts`)
The machine-learning layer is strictly prohibited from manufacturing arbitrary or hallucinatory recommendations. It functions solely as a coach to:
*   **Explain**: Break down chemical and physical pathways of chosen actions (e.g., thermal losses, grids combustion).
*   **Personalize**: Tailor explanations based on user's active progress metrics, badge collections, and historic savings.
*   **Educate**: Provide authoritative answers to sustainability queries without fabricating mock carbon scores.

---

## 🎮 Gamification & Engagement Mechanics

EcoMind AI translates environmental tracking into a game-like journey, encouraging daily habits:
*   **XP Progression**: Earn XP with daily missions and custom check-ins.
*   **Ranks**:
    *   `Level 1 (0-199 XP)`: Eco Beginner
    *   `Level 2 (200-399 XP)`: Green Explorer
    *   `Level 3 (400-599 XP)`: Climate Warrior
    *   `Level 4 (600-799 XP)`: Eco Hero
    *   `Level 5+ (800+ XP)`: Planet Guardian (growth scales infinitely)
*   **Badge Matrix**: Automatic evaluations for:
    *   `Streak King`: Maintain a 3+ consecutive active streak.
    *   `Meatless Maverick`: Log plant-based vegetarian dietary goals.
    *   `Watt Saver`: Register home electricity adjustments.
    *   `Quests Conqueror`: Clear at least 3 daily or weekly missions.
*   **Virtual Sprout Game**: Hydrate and nurture a virtual sprout to maturity using earned gamified XP, transferring digital dedication into real biological metrics.

---

## 🔒 Durable Security & Persistence

All database schemas, document properties, and relationship bounds are strictly declared inside the custom transaction-protected Firestore system:
*   **User Profiles (`/users/{userId}`)**: Durably tracks Streaks, Active Levels, badges earned, and weekly progress.
*   **Personal Habits (`/users/{userId}/lifestyle/current`)**: Real-time habit logs.
*   **Bespoke Plans (`/users/{userId}/recommendations/{recId}`)**: Tracks active, completed, or dismissed plans.
*   **Immutable Historical Ledgers (`/users/{userId}/impact_logs/{logId}`)**: Audit trails logging genuine saving accomplishments.
*   **Historical Coach Chats (`/users/{userId}/coach_chats/{msgId}`)**: Chats backed by full history context to enable personalized continuing advice.

### Firestore Rules
Secure client-side configurations enforce authorization constraints checking authentication states (`request.auth`), content sizes, data types, field bounds, schema requirements, and cross-document transactional atomicity.

---

## 🧪 Comprehensive Integration Testing

A reliable, custom integration test framework is built directly into the repository, simulating onboarding flows, emissions processing, XP gains, level transitions, badge evaluations, and boundary clamping.

### Run Tests:
```bash
npm run test
```

These verify that all features work seamlessly under edge cases, malformed payloads, or dirty inputs without any runtime state failures.

---

## ♿ Accessibility

EcoMind AI is engineered to adhere to strict WCAG 2.1 AA parameters:
*   **Semantic Structures**: Configured with proper semantic elements (`<main>`, `<header>`, `<footer>`, `<section>`) and distinct document-flow hierarchies.
*   **Label Integrity**: Interactive elements (buttons, inputs, and tab switches) use exact, highly-descriptive labels or explicit `aria-label` tags (e.g. `aria-label="List actionable recommendations"`).
*   **Tap Targets**: Touchpoints maintain a minimum 44px active dimension on mobile layouts, providing comfortable tapping bounds.
*   **Contrast Pairing**: Designed with accessible color rules — avoiding thin primary fonts and enforcing clean slate-800 or slate-900 typography over soft, clean off-white backgrounds.

---

## 🚀 Deployment

The system compiles into a robust full-stack production container matching the platform's requirements:
*   **Static Asset Bundles**: Client-side TypeScript assets are compiled via Vite into `/dist/`.
*   **Server Component Packaging**: The server script (`server.ts`) is bundled cleanly into a single self-contained CJS bundle `/dist/server.cjs` using `esbuild`.
*   **Egress Readiness**: The production container binds to host `0.0.0.0` on port `3000` for seamless routing inside Cloud Run.
*   **Start Command**: Deployed environments initiate execution via the compiled handler:
    ```bash
    node dist/server.cjs
    ```

---

## 📌 Assumptions & Scope Bounds

To deliver deterministic carbon modeling, the following engineering assumptions are configured:
1.  **Metric Co₂ Constants**: Baseline coefficients are compiled from standard EPA greenhouse gas equivalent profiles (e.g. car transportation at `0.18 kg` CO₂ per km).
2.  **Annual Projections**: All daily calculations (e.g., commute mileage) are projected linearly assuming standard yearly active durations.
3.  **Local Storage Parity**: Guest profiles utilize the exact same schema structure mapped to local browser state (`localStorage`) to guarantee instant fallback and no-auth parity.
4.  **Static Fuel Averages**: Standard utility averages are referenced where actual localized grid-mix ratios are unavailable.

---

## 🛠️ Setup & Local Development

### 1. Configure the Environment
Copy the example environment credentials config:
```bash
cp .env.example .env
```
Ensure a real, private server-side key `GEMINI_API_KEY` is specified.

### 2. Install Packages
```bash
npm install
```

### 3. Star Dev Servers
```bash
npm run dev
```

### 4. Direct Builds
```bash
npm run build
```
Production outputs compile cleanly into self-hosted, lightweight `dist` assets with server bundles.
