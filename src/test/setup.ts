import '@testing-library/react';

/**
 * Vitest global setup.
 *
 * Provides a minimal jsdom environment for component tests.
 * No external service mocking here — individual tests mock what they need.
 */

// jsdom does not implement matchMedia; stub it for components that check
// prefers-reduced-motion or other media queries.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
