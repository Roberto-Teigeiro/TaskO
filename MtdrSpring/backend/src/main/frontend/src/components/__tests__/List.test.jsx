import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Example List Component
const List = ({ items }) => {
  const [filter, setFilter] = React.useState("");

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Filter items..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        data-testid="filter-input"
      />
      <ul data-testid="item-list">
        {filteredItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

describe("List Component", () => {
  const testItems = ["Apple", "Banana", "Orange", "Pineapple"];

  test("renders all items initially", () => {
    render(<List items={testItems} />);

    testItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test("filters items based on input", async () => {
    render(<List items={testItems} />);

    const filterInput = screen.getByTestId("filter-input");
    await userEvent.type(filterInput, "apple");

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Pineapple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    expect(screen.queryByText("Orange")).not.toBeInTheDocument();
  });

  test("shows no items when filter has no matches", async () => {
    render(<List items={testItems} />);

    const filterInput = screen.getByTestId("filter-input");
    await userEvent.type(filterInput, "xyz");

    testItems.forEach((item) => {
      expect(screen.queryByText(item)).not.toBeInTheDocument();
    });
  });
});
