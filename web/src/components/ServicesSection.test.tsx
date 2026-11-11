import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ServiceRow } from "@/lib/types";
import ServicesSection from "./ServicesSection";
import { requestCapability } from "./capabilities/serviceModel";
import { PLACEHOLDER_CAPABILITIES } from "./capabilities/testPlaceholders";

const fixtureServices: ServiceRow[] = PLACEHOLDER_CAPABILITIES.map((item, index) => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  description: item.description,
  features: item.features,
  icon: item.iconKey,
  color: null,
  sort_order: index,
  active: true,
  slug: null,
  seo_title: null,
  seo_description: null,
  deliverables: [],
  process_steps: [],
  technologies: [],
  faqs: [],
  created_at: "",
  updated_at: "",
}));

const tabs = () => screen.getAllByRole("tab");

afterEach(cleanup);

describe("Capabilities switchboard", () => {
  it("shows an honest empty state when the CMS has no services", () => {
    render(<ServicesSection services={[]} />);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(
      screen.getByText(/No published capabilities yet/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get a Quote/i })).toHaveAttribute(
      "href",
      "/quote",
    );
  });

  it("renders one tab per capability with the first selected", () => {
    render(<ServicesSection services={fixtureServices} />);
    expect(tabs()).toHaveLength(4);
    expect(tabs()[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs()[0]).toHaveAttribute("tabindex", "0");
    expect(tabs()[1]).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("AI Automation");
  });

  it("keeps every panel in the DOM but displays only the selected one", () => {
    const { container } = render(<ServicesSection services={fixtureServices} />);
    const panels = Array.from(container.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    expect(panels).toHaveLength(4);
    // jsdom has no Tailwind: assert the cause of the bug directly. A display
    // utility such as `grid` on a hidden panel overrides the [hidden] attribute.
    for (const [index, panel] of panels.entries()) {
      const selected = index === 0;
      expect(panel.hidden).toBe(!selected);
      expect(panel.classList.contains("grid")).toBe(selected);
    }
    fireEvent.click(tabs()[2]);
    expect(panels[2].classList.contains("grid")).toBe(true);
    expect(panels[0].classList.contains("grid")).toBe(false);
    expect(panels[0]).toHaveTextContent("AI Automation");
  });

  it("moves selection and focus with arrow, Home, and End keys", () => {
    render(<ServicesSection services={fixtureServices} />);
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

  it("selects on click and shows that capability's details", () => {
    render(<ServicesSection services={fixtureServices} />);
    fireEvent.click(tabs()[2]);
    expect(tabs()[2]).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAccessibleName("AI Agents & Chat");
    expect(within(panel).getByRole("link", { name: /Get a Quote/ })).toHaveAttribute("href", "/quote");
  });

  it("labels the illustrative scene as an example", () => {
    const { container } = render(<ServicesSection services={fixtureServices} />);
    const caption = container.querySelector("figcaption");
    expect(caption).toHaveTextContent("Illustrative example");
  });

  it("links to the service page only when the service is published", () => {
    const published = fixtureServices.map((service, index) =>
      index === 0
        ? { ...service, slug: "test-ai-chatbots", deliverables: ["a", "b", "c", "d"] }
        : service,
    );
    render(<ServicesSection services={published} />);
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("link", { name: /View AI Automation/ })).toHaveAttribute(
      "href",
      "/services/test-ai-chatbots",
    );
    fireEvent.click(tabs()[1]);
    expect(within(screen.getByRole("tabpanel")).queryByRole("link", { name: /^View / })).toBeNull();
  });

  it("opens the capability a hero node requests", () => {
    render(<ServicesSection services={fixtureServices} />);
    act(() => requestCapability(["cloud"]));
    expect(tabs()[3]).toHaveAttribute("aria-selected", "true");
  });

  it("no longer opens a modal dialog", () => {
    render(<ServicesSection services={fixtureServices} />);
    fireEvent.click(tabs()[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
