import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { vi } from "vitest";

// Configure testing-library
configure({
  testIdAttribute: "data-testid",
});

// Polyfill for TextEncoder
class MockTextEncoder {
  encode(str: string): Uint8Array {
    return new Uint8Array([...str].map((char) => char.charCodeAt(0)));
  }
}

class MockTextDecoder {
  decode(arr: Uint8Array): string {
    return String.fromCharCode(...arr);
  }
}

global.TextEncoder = MockTextEncoder as unknown as typeof TextEncoder;
global.TextDecoder = MockTextDecoder as unknown as typeof TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    pathname: "/",
    assign: vi.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
