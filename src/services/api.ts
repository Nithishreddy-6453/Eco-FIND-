import { LifestyleData, CoachResponse, UserProfile, Recommendation, ImpactLog } from '../types';

/**
 * Service to interface with the EcoMind AI full-stack backend
 */
export const EcoMindAPI = {
  /**
   * Ping backend to check if active and if Gemini keys are supplied
   */
  async checkHealth(): Promise<{ status: string; firebaseBootstrapped: boolean }> {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error('Backend healthcheck failed');
    }
    return response.json();
  },

  /**
   * Request recommendations containing highly specific lifestyle tradeoffs
   */
  async generatePersonalizedCoachRecommendations(
    lifestyle: LifestyleData,
    userProfile: UserProfile | null = null,
    impactLogs: ImpactLog[] = []
  ): Promise<CoachResponse> {
    const response = await fetch('/api/coach/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lifestyle, userProfile, impactLogs }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || 'Failed to generate comparative analytical coaching recommendations.');
    }

    return response.json();
  },

  /**
   * Interact with the Gemini Sustainability Coach chatbot with user profiles & histories pre-filled as context
   */
  async sendCoachChatMessage(
    message: string,
    history: { sender: 'user' | 'coach'; text: string }[],
    lifestyle: LifestyleData | null,
    userProfile: UserProfile | null,
    recommendations: Recommendation[],
    impactLogs: ImpactLog[]
  ): Promise<{ success: boolean; text: string }> {
    const response = await fetch('/api/coach/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        lifestyle,
        userProfile,
        recommendations,
        impactLogs,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || 'The Gemini Coach is currently optimizing its decision core. Please try again in a moment.');
    }

    return response.json();
  }
};
