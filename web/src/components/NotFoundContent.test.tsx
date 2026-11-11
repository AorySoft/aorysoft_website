import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import NotFoundContent from "./NotFoundContent";

afterEach(cleanup);

describe("NotFoundContent", () => {
  it("has one h1 and links to existing public routes", () => {
    render(<NotFoundContent />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/services", "/about", "/contact"]);
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
