import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Configuración global de mocks
vi.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useUser: () => ({
    user: {
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
    isLoaded: true,
  }),
  useAuth: () => ({
    signOut: vi.fn(),
  }),
  useSignIn: () => ({
    signIn: vi.fn(),
    setActive: vi.fn(),
    isLoaded: true,
  }),
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
});
