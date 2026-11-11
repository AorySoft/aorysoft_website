import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import EmptyState from "./EmptyState";
import ExampleFrame from "./ExampleFrame";
import PageEndCta from "./PageEndCta";
import PageHero from "./PageHero";
import SectionHeader from "./SectionHeader";
import ServiceRow from "./ServiceRow";
import StackRows from "./StackRows";
import StepRoute from "./StepRoute";

afterEach(cleanup);

describe("PageHero", () => {
  it("renders one h1 with eyebrow and lead, and keeps the brand art decorative", () => {
    const { container } = render(<PageHero eyebrow="Services" title="What we build" lead="Lead copy" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Lead copy")).toBeInTheDocument();
    for (const svg of container.querySelectorAll("svg")) expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});

describe("SectionHeader", () => {
  it("labels the h2 with the given id", () => {
    render(<SectionHeader id="x-title" eyebrow="Process" title="How it runs" lead="Lead" />);
    expect(screen.getByRole("heading", { level: 2, name: "How it runs" })).toHaveAttribute("id", "x-title");
  });
});

describe("ExampleFrame", () => {
  it("always shows a visible example caption and hides the scene from assistive tech", () => {
    const { container } = render(
      <ExampleFrame>
        <p>Scene text</p>
      </ExampleFrame>,
    );
    const caption = container.querySelector("figcaption");
    expect(caption).toHaveTextContent("Illustrative example");
    expect(caption).toHaveTextContent("not a real client conversation, system, or result");
    expect(screen.getByText("Scene text").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});

describe("StepRoute", () => {
  const steps = [
    { title: "Intake", text: "A request arrives." },
    { title: "Reason", text: "The agent decides." },
    { title: "Act" },
  ];

  it("renders steps in order as an ordered list with numbered headings", () => {
    render(<StepRoute steps={steps} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Intake",
      "Reason",
      "Act",
    ]);
    expect(items[0]).toHaveTextContent("01");
  });

  it("renders nothing for an empty route", () => {
    const { container } = render(<StepRoute steps={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("StackRows", () => {
  it("renders layers as a description list", () => {
    const { container } = render(<StackRows layers={[{ name: "Data", tools: ["PostgreSQL"] }]} />);
    expect(container.querySelector("dt")).toHaveTextContent("Data");
    expect(container.querySelector("dd")).toHaveTextContent("PostgreSQL");
  });
});

describe("ServiceRow", () => {
  it("shows at most three highlights and one link", () => {
    render(
      <ServiceRow
        title="AI chatbots"
        subtitle="Answers on your site"
        iconKey="bot"
        highlights={["a", "b", "c", "d"]}
        href="/services/x"
        linkLabel="View service"
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "AI chatbots" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "View service" })).toHaveAttribute("href", "/services/x");
  });
});

describe("EmptyState and PageEndCta", () => {
  it("EmptyState has a title, text, and optional action", () => {
    render(<EmptyState title="No posts yet" action={<a href="/quote">Get a Quote</a>}>Soon.</EmptyState>);
    expect(screen.getByRole("heading", { level: 3, name: "No posts yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get a Quote" })).toBeInTheDocument();
  });

  it("PageEndCta defaults to the site's primary action", () => {
    render(<PageEndCta />);
    expect(screen.getByRole("link", { name: "Get a Quote" })).toHaveAttribute("href", "/quote");
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
  });
});
