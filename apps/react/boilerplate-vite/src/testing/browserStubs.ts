import { vi } from "vitest";

/**
 * jsdom implements no `matchMedia`. `usePreferredTheme` queries it, and the
 * side navigation does after mounting; this answers every query with no
 * match, as a wide screen with no preferences would.
 */
export function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
