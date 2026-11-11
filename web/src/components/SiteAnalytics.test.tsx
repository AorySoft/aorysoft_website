import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));
vi.mock("@/components/CloudflareAnalytics", () => ({ default: () => null }));

import SiteAnalytics, { dropAdminEvent } from "./SiteAnalytics";

afterEach(cleanup);

describe("SiteAnalytics", () => {
  it("mounts Analytics and Speed Insights on public pages", () => {
    pathname.current = "/services";
    const { queryByTestId } = render(<SiteAnalytics />);
    expect(queryByTestId("vercel-analytics")).not.toBeNull();
    expect(queryByTestId("speed-insights")).not.toBeNull();
  });

  it("mounts nothing on /admin", () => {
    pathname.current = "/admin/settings";
    const { queryByTestId } = render(<SiteAnalytics />);
    expect(queryByTestId("vercel-analytics")).toBeNull();
    expect(queryByTestId("speed-insights")).toBeNull();
  });
});

describe("dropAdminEvent", () => {
  it("drops admin URLs and keeps public ones", () => {
    expect(dropAdminEvent({ url: "https://www.aorysoft.com/admin/users" })).toBeNull();
    expect(dropAdminEvent({ url: "not a url /admin" })).toBeNull();
    const event = { url: "https://www.aorysoft.com/work" };
    expect(dropAdminEvent(event)).toBe(event);
  });
});
