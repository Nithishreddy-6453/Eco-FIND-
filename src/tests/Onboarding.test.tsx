import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingQuestionnaire } from '../components/OnboardingQuestionnaire';

describe('OnboardingQuestionnaire Component', () => {
  it('renders onboarding correctly and slides transit elements', () => {
    render(
      <OnboardingQuestionnaire
        onSave={async () => {}}
      />
    );

    // Step 1: Transport commute and travel
    expect(screen.getByText('Commute & Travel')).toBeDefined();
    expect(screen.getByText('Petrol Engine Car')).toBeDefined();
  });

  it('cycles steps on clicking continue', () => {
    render(
      <OnboardingQuestionnaire
        onSave={async () => {}}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDefined();

    // Move to step 2: Diet
    fireEvent.click(continueBtn);
    expect(screen.getByText('Meals & Dietary Habits')).toBeDefined();
  });
});
