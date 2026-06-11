import { vi } from 'vitest';

// Stub global browser APIs that are missing in classic JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockMatchMedia = (query: string): MediaQueryList => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
};

window.matchMedia = window.matchMedia || mockMatchMedia;

// Stub scrollIntoView which is absent in standard JSDOM environments
window.HTMLElement.prototype.scrollIntoView = vi.fn();
