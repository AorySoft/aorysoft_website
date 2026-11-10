import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ServicesSection from "./ServicesSection";
import { requestCapability } from "./capabilities/serviceModel";

const tabs = () => screen.getAllByRole("tab");

afterEach(cleanup);

describe("Capabilities switchboard", () => {
  it("renders one tab per capability with the first selected", () => {
    render(<ServicesSection />);
    expect(tabs()).toHaveLength(4);
    expect(tabs()[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs()[0]).toHaveAttribute("tabindex", "0");
    expect(tabs()[1]).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("AI Automation");
  });

  it("moves selection and focus with arrow, Home, and End keys", () => {
    render(<ServicesSection />);
    const list = screen.getByRole("tablist");

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(tabs()[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs()[1]).toHaveFocus();

    fireEvent.keyDown(list, { key: "End" });
    expect(tabs()[3]).toHaveFocus();

    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(tabs()[0]).toHaveFocus();

    fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(tabs()[3]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(list, { key: "Home" });
    expect(tabs()[0]).toHaveFocus();
  });

  it("selects on click and shows that capability's details", async () => {
    render(<ServicesSection />);
    fireEvent.click(tabs()[2]);
    expect(tabs()[2]).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByRole("link", { name: /Get started with AI Agents & Chat/ })).toHaveAttribute(
      "href",
      "/quote",
    );
  });

  it("opens the capability a hero node requests", () => {
    render(<ServicesSection />);
    act(() => requestCapability(["cloud"]));
    expect(tabs()[3]).toHaveAttribute("aria-selected", "true");
  });

  it("no longer opens a modal dialog", () => {
    render(<ServicesSection />);
    fireEvent.click(tabs()[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
