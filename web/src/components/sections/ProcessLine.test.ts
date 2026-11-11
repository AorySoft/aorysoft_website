import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PROCESS_STEPS } from "@/lib/about-content";
import ProcessLine from "./ProcessLine";

afterEach(cleanup);

describe("ProcessLine", () => {
  it("renders every delivery step, in order, as an ordered list", () => {
    render(createElement(ProcessLine));
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(PROCESS_STEPS.length);
    PROCESS_STEPS.forEach((step, index) => {
      expect(items[index]).toHaveTextContent(step.title);
      expect(items[index]).toHaveTextContent(step.text);
    });
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("keeps the section title above the steps", () => {
    render(createElement(ProcessLine));
    expect(screen.getByRole("heading", { level: 3, name: "How a project runs" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(PROCESS_STEPS.length);
  });
});
