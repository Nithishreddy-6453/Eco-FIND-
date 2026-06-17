import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { CarbonIntelligenceEngine } from './src/services/carbonEngine';
import { securityHeaders } from './src/middleware/securityHeaders';
import { rateLimiter } from './src/middleware/rateLimiter';
import { logger } from './src/utils/logger';
import { LifestyleSchema } from './src/utils/schemas';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Initialize Gemini on the server safely
// Fallback key prevents startup crash, but still provides descriptive errors during actual operation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const app = express();
app.use(express.json());

// Enforce standard middleware layers for all requests
app.use(securityHeaders);
app.use(rateLimiter);

// API: Health probe
app.get('/api/health', (req, res) => {
  logger.info('Received health probe request');
  res.json({ status: 'ok', firebaseBootstrapped: !!process.env.APP_URL });
});

// API: AI Decision Coach endpoint using Deterministic Carbon Intelligence Engine
app.post('/api/coach/generate', async (req, res) => {
  try {
    const { lifestyle } = req.body;
    if (!lifestyle) {
      logger.warn('Generate request missing lifestyle data');
      return res.status(400).json({ success: false, error: 'Lifestyle data is required' });
    }

    // Enterprise-grade sanitization schema validation
    const validatedLifestyle = LifestyleSchema.validate(lifestyle);

    // Process the lifestyle data deterministically using our robust math model
    const engineResult = CarbonIntelligenceEngine.process(validatedLifestyle);

    logger.info('Processed Carbon Calculation', { uid: validatedLifestyle.uid });

    res.json({
      success: true,
      recommendations: engineResult.rankedActions,
      insight: engineResult.insight,
      breakdown: engineResult.breakdown
    });
  } catch (error) {
    logger.error('EcoMind Carbon Intelligence Engine Failed', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown backend logic error',
    });
  }
});

// API: Gemini Sustainability Coach Chat Endpoint
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { message, history, lifestyle, userProfile, recommendations, impactLogs } = req.body;
    
    if (!message) {
      logger.warn('Chat request missing message');
      return res.status(400).json({ success: false, error: 'User message is required.' });
    }

    if (!ai) {
      logger.warn('Chat request received but Gemini API is unconfigured');
      return res.status(503).json({
        success: false,
        error: 'Gemini API is not configured on the server. Please attach a secret key in the applet settings.',
      });
    }

    // Run inputs through validation schema if present
    const validatedLifestyle = lifestyle ? LifestyleSchema.validate(lifestyle) : null;

    // 1. Calculate and collect the required variables
    const footprint = validatedLifestyle ? CarbonIntelligenceEngine.calculateEmissions(validatedLifestyle) : null;
    const highestSource = footprint ? CarbonIntelligenceEngine.getHighestCategory(footprint) : null;
    const topRec = recommendations && recommendations.filter((r: any) => r.status === 'active')[0];
    
    // Format progress history summary
    const completedCount = recommendations ? recommendations.filter((r: any) => r.status === 'completed').length : 0;
    const totalCO2Saved = userProfile?.totalCo2SavedKg || 0;
    const streak = userProfile?.streakCount || 0;
    
    const logSummary = impactLogs && Array.isArray(impactLogs)
      ? impactLogs.slice(0, 5).map((log: any) => `- Logged "${log.recommendationTitle}": Saved ${log.co2SavedKg}kg CO2`).join('\n')
      : 'No actions logged in the ledger yet.';

    // 2. Draft system instructions that enforce the Coach role and ban generic advice
    const systemPrompt = `
You are the EcoMind AI Sustainability Coach, an elite sustainability science expert. 
Your primary core directive is to NEVER generate generic or boilerplate sustainability advice (like "turn off the lights" or "recycle more"). Instead, you must answer user messages and queries by explaining exactly WHY specific recommendations matter based on their real, computed carbon footprint baseline, their largest emission source, their highest impact action, and their custom progress history.

Here are the user's specific contextual profile data:
- Carbon Score (Baseline Emissions): ${footprint ? `${footprint.total.toLocaleString()} kg CO2/year` : 'Not computed yet'}
  - Transport & Flights: ${footprint ? `${footprint.transport.toLocaleString()} kg CO2/year` : 'N/A'}
  - Diet & Waste: ${footprint ? `${footprint.food.toLocaleString()} kg CO2/year` : 'N/A'}
  - Electricity & Utilities: ${footprint ? `${footprint.electricity.toLocaleString()} kg CO2/year` : 'N/A'}
  - Goods Consumption: ${footprint ? `${footprint.shopping.toLocaleString()} kg CO2/year` : 'N/A'}
  - Household Waste: ${footprint ? `${footprint.waste.toLocaleString()} kg CO2/year` : 'N/A'}
- Largest Emission Source: ${highestSource ? `${highestSource.category} (representing ${footprint && footprint.total > 0 ? Math.round((highestSource.value / footprint.total) * 100) : 0}% of total footprint)` : 'N/A'}
- Highest Impact Recommended Action: ${topRec ? `"${topRec.title}" (under category ${topRec.category} for estimated savings of ${topRec.co2SavedKgPerYear} kg CO2/year)` : 'N/A'}
- Progress and Achievements History:
  - Active Streak Count: ${streak} days
  - Total CO2 Saved to date: ${totalCO2Saved} kg
  - Completed recommendations: ${completedCount}
  - Logged Actions (Last 5 records): 
${logSummary}

Role & Guidelines:
1. EXPLAIN THE "WHY" EMPIRICALLY: Focus heavily on explaining why their specific recommended upgrades matter. Use precise sustainability facts, organic/chemical/physical pathways (e.g., combustion reactions, solar efficiencies, or thermodynamic heat losses) to demystify why these actions outperform generic guidelines.
2. CITATION OF BASELINE: Reference specific numbers from their computed baseline when answering.
3. PERSONALIZED MOTIVATION: Praise their streak (${streak} days) or total savings (${totalCO2Saved} kg CO2 saved) naturally in conversation.
4. Keep answers friendly, professional, highly motivational, and under 3-4 short paragraphs. Format with clear Markdown.
`;

    // 3. Prepare message list history
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    // Current query
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I analyzed your baseline, but need to examine your lifestyle parameters closer. How else can I guide your carbon optimization goals?';

    res.json({
      success: true,
      text: reply,
    });

  } catch (error) {
    logger.error('Sustainability Coach chat failed', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Visual coaching server error. Please try again.',
    });
  }
});

// Configure Vite middleware / asset delivery
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Explicit Node/Express v4 SPA routing wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`EcoMind AI full-stack server active at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  logger.error('Critical server starting failure', err);
});
