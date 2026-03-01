"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  /** Called once the widget is ready with an imperative reset function */
  onReady?: (reset: () => void) => void;
}

export default function Turnstile({
  siteKey,
  onToken,
  onExpire,
  onError,
  onReady,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Keep callback refs stable so the widget is never torn down due to
  // parent re-renders producing new function references.
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    function render() {
      if (!containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onExpireRef.current?.(),
        "error-callback": () => onErrorRef.current?.(),
      });
      const reset = () => {
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      };
      onReadyRef.current?.(reset);
    }

    // Script may already be loaded
    if (window.turnstile) {
      render();
      return;
    }

    // Inject the Turnstile script once
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      // Script tag exists but turnstile may not be ready yet — poll briefly
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 50);
      return () => clearInterval(interval);
    }
    // Only re-register if siteKey or theme changes (structural changes).
    // Callbacks are read from refs so they never trigger a re-registration.
  }, [siteKey]);

  return <div ref={containerRef} />;
}
