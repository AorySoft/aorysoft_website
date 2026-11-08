"use client";

// Client half of the Turnstile integration (plan §7).
//
// The SITE key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) is public by design and is
// safe in the bundle; the SECRET key never appears here — it is read only by
// the server action's verifyTurnstile() call.
//
// When no site key is configured this component renders a hidden input that
// carries an empty token, so the server-side check skips cleanly in
// development and no widget script is downloaded at all.

import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __turnstileLoaded?: boolean;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileField({
  onTokenChange,
}: {
  onTokenChange: (token: string | null) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleToken = useCallback((next: string | null) => {
    setToken(next);
    onTokenChange(next);
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey) return;

    // Inject the Cloudflare script once per page, even across components.
    if (!window.__turnstileLoaded) {
      window.__turnstileLoaded = true;
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current) return;
      if (!window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        // Invisible-ish: the widget is a compact checkbox, not an image puzzle.
        appearance: "interaction-only",
        callback: handleToken,
        "expired-callback": () => handleToken(null),
        "error-callback": () => handleToken(null),
      });
    };

    if (window.turnstile) renderWidget();
    else {
      const poll = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(poll);
          renderWidget();
        }
      }, 50);
      return () => {
        window.clearInterval(poll);
        cancelled = true;
      };
    }

    return () => {
      cancelled = true;
    };
  }, [siteKey, handleToken]);

  if (!siteKey) {
    // Unconfigured: submit an empty token so the server-side check skips.
    return <input type="hidden" name="turnstileToken" value="" />;
  }

  return (
    <>
      <div ref={containerRef} data-testid="turnstile-widget" />
      {/* Mirrors the widget's current token into the form payload. Empty until
          the callback fires, and cleared again when the token expires. */}
      <input type="hidden" name="turnstileToken" value={token ?? ""} />
    </>
  );
}
