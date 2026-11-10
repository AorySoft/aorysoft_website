import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import BrandMark from "./BrandMark";

afterEach(cleanup);

describe("BrandMark", () => {
  it("gives every mark on the page its own gradient id", () => {
    const { container } = render(
      <>
        <BrandMark size="sm" />
        <BrandMark size="sm" />
      </>,
    );
    const ids = [...container.querySelectorAll("linearGradient")].map((node) => node.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    // Each path points at its own mark's gradient.
    container.querySelectorAll("svg").forEach((svg) => {
      const id = svg.querySelector("linearGradient")?.id;
      svg.querySelectorAll("path").forEach((path) => expect(path.getAttribute("fill")).toBe(`url(#${id})`));
    });
  });

  it("names the home link once, with the mark decorative beside the wordmark", () => {
    render(<BrandMark />);
    expect(screen.getByRole("link", { name: "AorySoft home" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("gives a standalone mark an accessible name", () => {
    render(<BrandMark href="" showWordmark={false} />);
    expect(screen.getByRole("img", { name: "AorySoft" })).toBeInTheDocument();
  });
});
