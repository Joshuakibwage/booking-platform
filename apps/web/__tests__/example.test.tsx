import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

function Greeting() {
  return <h1>Hello, developer!</h1>;
}

describe("Greeting", () => {
  it("renders the greeting heading", () => {
    render(<Greeting />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Hello, developer!",
      }),
    ).toBeInTheDocument();
  });
});
