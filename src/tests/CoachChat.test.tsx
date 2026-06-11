import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachChat } from '../components/CoachChat';
import { CoachChatMessage } from '../types';

describe('CoachChat Component', () => {
  const mockMessages: CoachChatMessage[] = [
    {
      id: 'welcome',
      uid: 'u1',
      sender: 'coach',
      text: 'Hello! I am your sustainability coach.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr1',
      uid: 'u1',
      sender: 'user',
      text: 'How can I save CO2?',
      createdAt: new Date().toISOString(),
    },
  ];

  it('renders chat messages correctly', () => {
    render(
      <CoachChat
        chatMessages={mockMessages}
        isChatLoading={false}
        onSendMessage={async () => {}}
      />
    );

    expect(screen.getByText('Hello! I am your sustainability coach.')).toBeDefined();
    expect(screen.getByText('How can I save CO2?')).toBeDefined();
  });

  it('submits typed questions correctly', async () => {
    const handleSend = vi.fn().mockImplementation(async () => {});
    render(
      <CoachChat
        chatMessages={mockMessages}
        isChatLoading={false}
        onSendMessage={handleSend}
      />
    );

    const input = screen.getByPlaceholderText(/Ask your coach/i) as HTMLInputElement;
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Compare public transit versus driving' } });
    expect(input.value).toBe('Compare public transit versus driving');

    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSend).toHaveBeenCalledWith('Compare public transit versus driving');
  });

  it('displays loaders on query submission', () => {
    render(
      <CoachChat
        chatMessages={mockMessages}
        isChatLoading={true}
        onSendMessage={async () => {}}
      />
    );

    expect(screen.getByText(/is calculating offsets/i)).toBeDefined();
  });
});
