# 🚢 Deployment & Continuous Integration Guide

This guide details the continuous integration pipelines, Docker configurations, and server production execution environment designed for EcoMind AI.

---

## 🛠️ Continuous Integration (CI)
EcoMind AI includes a automated GitHub Actions pipeline located at `.github/workflows/ci.yml`. On every `push` or `pull_request` to target branches, the following phases run sequentially:

1.  **Environment Setup**: Hooks Node.js v20.x environment caching packages using `npm ci`.
2.  **Lint & Code Quality Audit**: Ensures rigid compliance with TypeScript and ESLint standards by running `npm run lint`.
3.  **Vitest Execution**: Runs the comprehensive browser component unit tests.
4.  **Mathematical Integrity Check**: Executes direct backend mathematical diagnostics on the underlying Carbon Engine.
5.  **Integration Test Suite**: Assesses Level, Badge, and XP state calculation boundaries.
6.  **Production Asset Build Check**: Confirms Vite and server compilation complete without warnings.

---

## 📦 Containerization & Docker Setup

To deploy EcoMind AI uniformly across cloud providers, a multi-stage production-ready `Dockerfile` is provided at the repository root.

### Multi-Stage Compilation Path
*   **Stage 1: Asset Builder**: Uses a temporary `node:20-alpine` environment. Compiles all client assets via Vite and packages the Express backend server into a single bundled file `/dist/server.cjs` utilizing `esbuild`.
*   **Stage 2: Minimalist Runner**: Discards developer tools and unused source files. Spawns a high-performance bare container, installs production-only dependencies, registers a secure non-root `nodejs` execution context, and exposes port `3000`.

### Local Multi-Container Deployment
To start the application locally inside a sandboxed environment:

```bash
docker-compose up --build
```

---

## 🔒 Security Posture & Propping

The production environment implements several operational hardening measures:
*   `no-new-privileges:true`: Restricts containers from obtaining supplementary root capabilities during runtimes.
*   `cap_drop: [ALL]`: Drops default Linux system kernel capabilities to minimize container breakout risks.
*   `cap_add: [NET_BIND_SERVICE]`: Permits binding solely to port 3000 with unprivileged system roles.
