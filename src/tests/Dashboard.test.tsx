import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardView } from '../components/DashboardView';
import { UserProfile, LifestyleData, Recommendation } from '../types';

describe('DashboardView Component', () => {
  const mockProfile: UserProfile = {
    uid: 'u1',
    email: 'guardian@ecomind.ai',
    displayName: 'Eco King',
    photoURL: null,
    createdAt: new Date().toISOString(),
    streakCount: 5,
    totalCo2SavedKg: 250,
    lastActiveDate: null,
    xp: 400,
    levelName: 'Green Explorer',
    badges: ['bdg_streak'],
    weeklyGoalCo2: 50,
    weeklyProgressCo2: 12,
    completedChallengeIds: []
  };

  const mockLifestyle: LifestyleData = {
    uid: 'u1',
    commuteMode: 'car',
    distancePerDayKm: 15,
    annualFlights: 1,
    dietType: 'vegetarian',
    localFoodPercent: 40,
    foodWasteLevel: 'low',
    electricityKwhPerMonth: 200,
    greenEnergyPercent: 20,
    heatingType: 'electric',
    thermostatOffsetC: 1,
    shoppingHabits: 'moderate',
    recyclingLevel: 'some',
    updatedAt: new Date().toISOString()
  };

  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec_01',
      uid: 'u1',
      title: 'Replace gasoline commute with public transport',
      description: 'Opting for clean public transit will substantially lower your footprint.',
      category: 'Transport',
      co2SavedKgPerYear: 380,
      difficulty: 'medium',
      personalizedReasoning: 'Saves 380kg/yr by altering your 15km gasoline drives.',
      actionItems: ['Buy transit card', 'Locate near stops'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      whySelected: 'Targeted high travel emission profiles.',
      comparisonMetric: {
        primaryActionMetric: 'Replacing car commute with transit',
        secondaryAlternativeMetric: 'Reducing appliance standby loss',
        primaryCo2Saved: 380,
        secondaryCo2Saved: 80
      }
    }
  ];

  it('renders dashboard widgets and personalized recommendation', () => {
    render(
      <DashboardView
        userProfile={mockProfile}
        lifestyleData={mockLifestyle}
        recommendations={mockRecommendations}
        impactLogs={[]}
        chatMessages={[]}
        isChatLoading={false}
        isGenerating={false}
        isGuestMode={false}
        onUpdateStatus={async () => {}}
        onDismissLog={async () => {}}
        onSendCoachMessage={async () => {}}
        onRecalibrate={() => {}}
        onLogout={async () => {}}
      />
    );

    expect(screen.getByText('Hi, Eco King')).toBeDefined();
    expect(screen.getByText('Replace gasoline commute with public transport')).toBeDefined();
    expect(screen.getByText(/380 kg CO₂\/yr/i)).toBeDefined();
  });

  it('handles custom completing click actions', () => {
    const handleUpdateStatus = vi.fn().mockImplementation(async () => {});
    render(
      <DashboardView
        userProfile={mockProfile}
        lifestyleData={mockLifestyle}
        recommendations={mockRecommendations}
        impactLogs={[]}
        chatMessages={[]}
        isChatLoading={false}
        isGenerating={false}
        isGuestMode={false}
        onUpdateStatus={handleUpdateStatus}
        onDismissLog={async () => {}}
        onSendCoachMessage={async () => {}}
        onRecalibrate={() => {}}
        onLogout={async () => {}}
      />
    );

    const logDoneBtn = screen.getByRole('button', { name: /log done/i });
    expect(logDoneBtn).toBeDefined();

    fireEvent.click(logDoneBtn);
    expect(handleUpdateStatus).toHaveBeenCalledWith(mockRecommendations[0], 'completed');
  });
});
