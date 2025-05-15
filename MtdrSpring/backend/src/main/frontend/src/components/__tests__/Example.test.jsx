import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Example component to test
const ExampleComponent = ({ onClick }) => (
  <div>
    <h1>Example Component</h1>
    <button onClick={onClick}>Click me</button>
  </div>
);

describe("ExampleComponent", () => {
  test("renders the component", () => {
    render(<ExampleComponent />);
    expect(screen.getByText("Example Component")).toBeInTheDocument();
  });

  test("handles click events", async () => {
    const handleClick = jest.fn();
    render(<ExampleComponent onClick={handleClick} />);

    const button = screen.getByText("Click me");
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
