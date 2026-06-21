# 🏗️ EcoMind AI System Architecture

EcoMind AI is engineered around a **Hallucination-Resistant Hybrid AI Pipeline**. Instead of querying LLMs to estimate emissions or rank raw lifestyle recommendations directly (which leads to statistical inconsistencies and AI hallucinations), we decouples mathematical logic from the dynamic language interface.

This page explains the **4-Engine Architecture** that powers our production system.

```
       [ Raw User Input Parameters ]
                     │
                     ▼
┌──────────────────────────────────────────┐
│  1. CARBON INTELLIGENCE ENGINE           │ ◄─── (Deterministic Mathematical Core)
└────────────────────┬─────────────────────┘
                     │  Emissions Breakdown (CO₂ kg)
                     ▼
┌──────────────────────────────────────────┐
│  2. CONTEXT ENGINE                       │ ◄─── (Fuses Lifestyle + Logs + Profile)
└────────────────────┬─────────────────────┘
                     │  Unified Cohort Context (State)
                     ▼
┌──────────────────────────────────────────┐
│  3. DECISION ENGINE                      │ ◄─── (Computes Tradeoffs & Peak Sources)
└────────────────────┬─────────────────────┘
                     │  Action Priorities & Constraints
                     ▼
┌──────────────────────────────────────────┐
│  4. RECOMMENDATION ENGINE                │ ◄─── (Dynamic Re-ordering & Filtering)
└──────────────────────────────────────────┘
                     │
                     ├────────► Active Action Cards (UI Dashboard)
                     │
                     └────────► Context Injection Loop ──► [ Server-Side Gemini API ]
```

---

## 🛡️ The 4 Core Engines

### 1. Carbon Intelligence Engine (`/src/services/carbonEngine.ts`)
*   **Role**: Mathematical Truth Generator.
*   **Behavior**:
    *   Applies strict EPA-certified multipliers across domains (Transport, Diet, Utility Power, and Goods Consumption).
    *   Computes absolute carbon footprint outputs (`kg CO₂/year`).
    *   No LLM involvement occurs during calculations, ensuring **0% risk of arithmetic hallucinations**.

### 2. Context Engine (`/src/services/contextEngine.ts`)
*   **Role**: Profile & Identity Aggregator.
*   **Behavior**:
    *   Fuses raw telemetry datasets with active `UserProfile` parameters and chronological `ImpactLogs`.
    *   Aggregates historic user achievements, current streaks, and completed action item IDs.
    *   Extracts relative offsets (such as current XP-levels, badge acquisitions) to establish local persistence states.

### 3. Decision Engine (`/src/services/decisionEngine.ts`)
*   **Role**: Strategic Priority Evaluator.
*   **Behavior**:
    *   Identifies the "Peak Lever"—the single category representing the highest ratio of a user's total carbon signature.
    *   Calculates the exact footprint contribution percentage of the largest source.
    *   Filters prospective recommendations against **previously completed items**, dynamically moving satisfied milestones to a historical ledger to eliminate repetitive suggestions.

### 4. Recommendation Engine (`/src/services/recommendationEngine.ts`)
*   **Role**: Behavioral Action Personalizer & Re-ranker.
*   **Behavior**:
    *   Generates optimized alternatives tailored specifically to user friction points.
    *   Applies a strict mathematical sorting algorithm descending by raw CO₂ saving potential.
    *   Compiles structured comparative reasoning explanations, detailing exactly *why* the top item is selected and *why* secondary alternatives were rejected.
