import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Header } from "../Header";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ProjectProvider } from "../../context/ProjectContext";
// ... existing code ...

// Mock ClerkProvider
vi.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useUser: () => ({
    user: {
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
    isLoaded: true,
  }),
}));

// Mock ProjectContext
vi.mock("../../context/ProjectContext", () => ({
  ProjectProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useProjects: () => ({
    selectedProject: {
      id: "1",
      name: "Test Project",
      description: "Test Description",
    },
    loading: false,
    error: null,
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ClerkProvider publishableKey="test">
      <BrowserRouter>
        <ProjectProvider>{component}</ProjectProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
};

describe("Header Component", () => {
  it("renders header with correct title", () => {
    renderWithProviders(<Header title="TaskO" />);
    expect(screen.getByText("TaskO")).toBeInTheDocument();
  });

  it("shows user profile section", () => {
    renderWithProviders(<Header title="TaskO" />);
    const userElement = screen.getByText((content) =>
      content.includes("Test User")
    );
    expect(userElement).toBeInTheDocument();
  });
});
