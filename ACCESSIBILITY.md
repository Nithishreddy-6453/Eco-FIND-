# ♿ Accessibility Compliance Directory (WCAG 2.1 AA)

EcoMind AI is engineered to be inclusive, accessible, and compliant with **WCAG 2.1 AA standards**. We ensure that any user can confidently measure their footprint, complete challenges, and chat with the science coach.

---

## 🏗️ Semantic Landmark Structure

The DOM is laid out using accessible landmark nodes rather than flat nested layout structures:

```html
<body>
  <!-- Skip navigation links for keyboard utility -->
  <a href="#main-content" class="sr-only focus:not-sr-only">Skip to Content</a>

  <!-- Banner element containing high-level branding -->
  <header role="banner">
    <nav aria-label="Primary Site Navigation"></nav>
  </header>

  <!-- Central application container -->
  <main id="main-content" role="main">
    
    <!-- Visual carbon metrics prioritized region -->
    <section role="region" aria-labelledby="metric-heading">
      <h2 id="metric-heading">Your Carbon Balance</h2>
    </section>

    <!-- Recommendation scroll decks -->
    <section role="region" aria-labelledby="recs-heading">
      <h2 id="recs-heading">Active Recommendations</h2>
      <ul role="list">
        <!-- Interactive recommendation items -->
      </ul>
    </section>

  </main>
</body>
```

---

## ♿ Core Accessibility Controls In Place

### 1. High Contrast Palettes (4.5:1 ratio)
*   Our theme utilizes slate backgrounds (`#0f172a` and `#1e293b`) with clean secondary elements.
*   Text values employ highly distinct contrast parameters (off-white `#f8fafc` and slate `#64748b`), reaching or exceeding WCAG contrast thresholds.

### 2. High Keyboard Focus Prominence
*   All interactive buttons, slides, inputs, and tab controllers are accessible via `Tab` index streams.
*   All focus states feature high-contrast visible indicators, e.g., using Tailwind utility focus outlines:
    ```tailwind
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
    ```

### 3. Screen Reader Optimization
*   **Descriptive Action Headers**: Action buttons include context-supplementing labels (e.g., `aria-label="Filter recommendations"`, `aria-label="Send message to Sustainability Coach"`).
*   **Status Signals**: When calculators update, dynamic notifications are piped into an ARIA live region (`aria-live="polite"`) to announce calculated scores without shifting focus.

### 4. Interactive Target Proximity
*   Mobile viewport controls maintain a minimum touch target size of `48px x 48px` to guarantee physical accessibility.
