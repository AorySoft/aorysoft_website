import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));

import Navbar from "./Navbar";

function renderWithPage() {
  return render(
    <>
      <Navbar />
      <div id="main-content">
        <a href="/x">Page link</a>
      </div>
      <footer>
        <a href="/y">Footer link</a>
      </footer>
    </>,
  );
}

const tab = (shiftKey = false) => fireEvent.keyDown(window, { key: "Tab", shiftKey });

afterEach(cleanup);

describe("Navbar mobile menu", () => {
  it("traps focus including the close button, inerts the page, and restores focus", () => {
    renderWithPage();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const close = screen.getByRole("button", { name: "Close menu" });
    const panelLinks = screen
      .getAllByRole("link")
      .filter((link) => link.closest("[id]")?.id !== "main-content" && !link.closest("footer"));
    const quote = panelLinks.filter((l) => l.textContent === "Get a Quote").at(-1)!;

    expect(document.getElementById("main-content")).toHaveAttribute("inert");
    expect(document.querySelector("footer")).toHaveAttribute("inert");

    // Tab from the last panel item wraps to the close button…
    quote.focus();
    tab();
    expect(close).toHaveFocus();

    // …and Shift+Tab from the close button wraps to the last item.
    tab(true);
    expect(quote).toHaveFocus();

    // Escape closes and returns focus to the toggle.
    fireEvent.keyDown(window, { key: "Escape" });
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveFocus();
    expect(document.getElementById("main-content")).not.toHaveAttribute("inert");
  });

  it("pulls stray focus (e.g. the logo link) back into the menu", () => {
    renderWithPage();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    screen.getByRole("link", { name: "AorySoft home" }).focus();
    tab();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveFocus();
  });
});
