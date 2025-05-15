import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Example Form Component
const Form = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit({
      username: formData.get("username"),
      email: formData.get("email"),
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="test-form">
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          minLength={3}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

describe("Form Component", () => {
  test("renders form elements correctly", () => {
    render(<Form onSubmit={() => {}} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    render(<Form onSubmit={() => {}} />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    expect(screen.getByLabelText(/username/i)).toBeInvalid();
    expect(screen.getByLabelText(/email/i)).toBeInvalid();
  });

  test("submits form with valid data", async () => {
    const mockSubmit = jest.fn();
    render(<Form onSubmit={mockSubmit} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
    });
  });
});
