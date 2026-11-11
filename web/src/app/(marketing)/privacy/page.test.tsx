import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PrivacyPage from "./page";

afterEach(cleanup);

describe("Privacy page cookie disclosure (F34)", () => {
  it("lists every cookie and storage item observed on the site", () => {
    render(<PrivacyPage />);
    const table = screen.getByRole("table", { name: /cookies and storage/i });
    const text = table.textContent ?? "";
    for (const name of ["sb-…-auth-token", "__cf_bm", "Cloudflare Turnstile", "__va_attribution"]) {
      expect(text).toContain(name);
    }
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Name",
      "Set by",
      "Purpose",
      "Duration",
    ]);
  });

  it("states that the public pages set no cookies", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/public pages of this website set no cookies/i)).toBeInTheDocument();
  });
});
