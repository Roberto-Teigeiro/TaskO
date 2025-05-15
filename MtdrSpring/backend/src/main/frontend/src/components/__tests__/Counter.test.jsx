import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Example Counter Component
const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h2 data-testid="count-display">Count: {count}</h2>
      <button
        onClick={() => setCount(count + 1)}
        data-testid="increment-button"
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        data-testid="decrement-button"
      >
        Decrement
      </button>
      <button onClick={() => setCount(0)} data-testid="reset-button">
        Reset
      </button>
    </div>
  );
};

describe("Counter Component", () => {
  test("renders with initial count of 0", () => {
    render(<Counter />);
    expect(screen.getByTestId("count-display")).toHaveTextContent("Count: 0");
  });

  test("increments count when increment button is clicked", async () => {
    render(<Counter />);

    const incrementButton = screen.getByTestId("increment-button");
    await userEvent.click(incrementButton);

    expect(screen.getByTestId("count-display")).toHaveTextContent("Count: 1");
  });

  test("decrements count when decrement button is clicked", async () => {
    render(<Counter />);

    // First increment to 1
    const incrementButton = screen.getByTestId("increment-button");
    await userEvent.click(incrementButton);

    // Then decrement back to 0
    const decrementButton = screen.getByTestId("decrement-button");
    await userEvent.click(decrementButton);

    expect(screen.getByTestId("count-display")).toHaveTextContent("Count: 0");
  });

  test("resets count to 0 when reset button is clicked", async () => {
    render(<Counter />);

    // First increment to 2
    const incrementButton = screen.getByTestId("increment-button");
    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);

    // Then reset to 0
    const resetButton = screen.getByTestId("reset-button");
    await userEvent.click(resetButton);

    expect(screen.getByTestId("count-display")).toHaveTextContent("Count: 0");
  });

  test("handles multiple increments and decrements", async () => {
    render(<Counter />);

    const incrementButton = screen.getByTestId("increment-button");
    const decrementButton = screen.getByTestId("decrement-button");

    // Increment twice
    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);

    // Decrement once
    await userEvent.click(decrementButton);

    expect(screen.getByTestId("count-display")).toHaveTextContent("Count: 1");
  });
});
