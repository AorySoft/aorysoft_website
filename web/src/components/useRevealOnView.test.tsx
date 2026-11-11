import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRevealOnView } from "./useRevealOnView";

let ioCallback: IntersectionObserverCallback | null = null;

function Box({ top }: { top: number }) {
  const ref = useRevealOnView<HTMLDivElement>();
  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (el) el.getBoundingClientRect = () => ({ top }) as DOMRect;
      }}
      data-testid="box"
      className="atelier-fade-up"
    />
  );
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as never;
}

beforeEach(() => {
  ioCallback = null;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  setReducedMotion(false);
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useRevealOnView", () => {
  it("leaves items in the first viewport animating on load", () => {
    render(<Box top={100} />);
    const box = screen.getByTestId("box");
    expect(box).toHaveClass("atelier-fade-up");
    expect(box.dataset.reveal).toBeUndefined();
  });

  it("defers below-the-fold items until they scroll into view", () => {
    render(<Box top={2000} />);
    const box = screen.getByTestId("box");
    expect(box).not.toHaveClass("atelier-fade-up");
    expect(box.dataset.reveal).toBe("pending");

    act(() => {
      ioCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(box).toHaveClass("atelier-fade-up");
    expect(box.dataset.reveal).toBeUndefined();
  });

  it("does nothing under prefers-reduced-motion", () => {
    setReducedMotion(true);
    render(<Box top={2000} />);
    const box = screen.getByTestId("box");
    expect(box.dataset.reveal).toBeUndefined();
  });

  it("never leaves content hidden after unmount", () => {
    const { unmount } = render(<Box top={2000} />);
    const box = screen.getByTestId("box");
    unmount();
    expect(box.dataset.reveal).toBeUndefined();
  });
});
