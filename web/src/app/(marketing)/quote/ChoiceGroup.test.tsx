import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ChoiceGroup from "./ChoiceGroup";

afterEach(cleanup);

function Harness({ multi = false }: { multi?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <ChoiceGroup
      legend="Project timeline"
      options={["1-3 months", "Flexible"]}
      columns="grid-cols-2"
      isSelected={(option) => selected.includes(option)}
      onToggle={(option) =>
        setSelected((prev) =>
          multi
            ? prev.includes(option)
              ? prev.filter((item) => item !== option)
              : [...prev, option]
            : [option],
        )
      }
    />
  );
}

describe("ChoiceGroup", () => {
  it("is a named group of toggle buttons", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Project timeline" })).toBeInTheDocument();
    screen.getAllByRole("button").forEach((button) => expect(button).toHaveAttribute("aria-pressed", "false"));
  });

  it("announces the selected option through aria-pressed", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Flexible" }));
    expect(screen.getByRole("button", { name: "Flexible" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "1-3 months" })).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles multi-select options off again", () => {
    render(<Harness multi />);
    const option = screen.getByRole("button", { name: "Flexible" });
    fireEvent.click(option);
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-pressed", "false");
  });
});
