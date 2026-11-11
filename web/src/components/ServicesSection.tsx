"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceRow } from "@/lib/types";
import CapabilityVignette from "@/components/capabilities/CapabilityVignettes";
import { CapabilityIcon } from "@/components/capabilities/icons";
import styles from "@/components/capabilities/capabilities.module.css";
import {
  CAPABILITY_EVENT,
  findCapabilityIndex,
  toCapabilities,
  vignetteFor,
} from "@/components/capabilities/serviceModel";

const EASE = [0.16, 1, 0.3, 1] as const;

const ServicesSection = ({ services: rows }: { services?: ServiceRow[] | null }) => {
  const capabilities = useMemo(() => toCapabilities(rows), [rows]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = capabilities[Math.min(activeIndex, Math.max(capabilities.length - 1, 0))];
  const reduceMotion = useReducedMotion();

  const select = useCallback(
    (index: number, tab?: HTMLElement | null, focus = false) => {
      setActiveIndex(index);
      if (!tab) return;
      if (focus) tab.focus({ preventScroll: true });
      // Keep the chosen tab in view inside the scrolling rail without moving the page.
      const rail = tab.parentElement;
      if (rail && rail.scrollWidth > rail.clientWidth) {
        const left = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
        rail.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
      }
    },
    [reduceMotion],
  );

  // Hero nodes ask for a capability by icon key.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const keys = (event as CustomEvent<{ keys: string[] }>).detail?.keys ?? [];
      const index = findCapabilityIndex(capabilities, keys);
      if (index !== -1) select(index);
    };
    window.addEventListener(CAPABILITY_EVENT, onRequest);
    return () => window.removeEventListener(CAPABILITY_EVENT, onRequest);
  }, [capabilities, select]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = capabilities.length - 1;
    if (last < 0) return;
    const moves: Record<string, number> = {
      ArrowDown: activeIndex === last ? 0 : activeIndex + 1,
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowUp: activeIndex === 0 ? last : activeIndex - 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = moves[event.key];
    const tabs = event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
    select(next, tabs[next] ?? null, true);
  };

  return (
    <section id="services" aria-labelledby="services-title" className="section-y scroll-mt-16">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 id="services-title" className="display-title">
            Capabilities
          </h2>
          <p className="body-lead mt-5">
            Product engineering, AI, and automation in one place. Pick what you
            need, or ask us to help shape the first version.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 text-sm text-signal transition-colors hover:text-ink"
          >
            All services
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {capabilities.length === 0 || !active ? (
          <div className="mt-12 max-w-2xl space-y-6 md:mt-16">
            <p className="text-base leading-relaxed text-ink-muted">
              No published capabilities yet. When services are listed in the
              CMS they appear here. Until then, tell us what you need and we
              will help shape the first version.
            </p>
            <Link href="/quote" className="btn-primary inline-flex">
              Get a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <CapabilitySwitchboard
            capabilities={capabilities}
            active={active}
            activeIndex={activeIndex}
            reduceMotion={Boolean(reduceMotion)}
            onKeyDown={onKeyDown}
            select={select}
          />
        )}
      </div>
    </section>
  );
};

function CapabilitySwitchboard({
  capabilities,
  activeIndex,
  reduceMotion,
  onKeyDown,
  select,
}: {
  capabilities: ReturnType<typeof toCapabilities>;
  active: NonNullable<(typeof capabilities)[number]>;
  activeIndex: number;
  reduceMotion: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  select: (index: number, tab?: HTMLElement | null, focus?: boolean) => void;
}) {
  return (
    <div className="mt-12 md:mt-16">
      <div
        role="tablist"
        aria-label="Capabilities"
        onKeyDown={onKeyDown}
        className="relative -mx-4 flex snap-x overflow-x-auto border-b border-line px-4 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-2.5rem),transparent)] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {capabilities.map((capability, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={capability.id}
              id={`capability-tab-${capability.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`capability-panel-${capability.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={(event) => select(index, event.currentTarget)}
              className={`group relative flex min-h-12 shrink-0 snap-start items-center gap-2.5 px-4 py-3 text-left transition-colors duration-200 lg:px-5 ${
                selected ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {selected ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "capability-indicator"}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-x-0 bottom-[-1px] h-px bg-signal"
                  aria-hidden="true"
                />
              ) : null}
              <CapabilityIcon
                iconKey={capability.iconKey}
                className={`h-4 w-4 shrink-0 transition-colors ${selected ? "text-signal" : "text-ink-subtle group-hover:text-ink-muted"}`}
              />
              <span className="whitespace-nowrap font-display text-xl">
                {capability.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Every capability stays in the DOM for crawlers/LLMs; only the active panel is shown.
          The display utility goes on the selected panel only: `grid` would override `[hidden]`. */}
      <div className="mt-10 rounded-atelier-lg md:mt-12">
        {capabilities.map((capability, index) => {
          const selected = index === activeIndex;
          return (
            <div
              key={capability.id}
              id={`capability-panel-${capability.id}`}
              role="tabpanel"
              aria-labelledby={`capability-tab-${capability.id}`}
              tabIndex={selected ? 0 : -1}
              hidden={!selected}
              className={
                selected
                  ? "grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-12"
                  : "hidden"
              }
            >
              <div className="flex flex-col lg:col-span-5">
                <h3 className="flex items-center gap-3 font-display text-3xl text-ink md:text-[2.25rem] md:leading-tight">
                  <CapabilityIcon iconKey={capability.iconKey} className="h-5 w-5 shrink-0 text-signal" />
                  {capability.title}
                </h3>
                {capability.subtitle ? (
                  <p className="mt-2 text-sm font-medium text-signal">
                    {capability.subtitle}
                  </p>
                ) : null}
                {capability.description ? (
                  <p className="mt-5 text-pretty text-base leading-relaxed text-ink-muted">
                    {capability.description}
                  </p>
                ) : null}
                {capability.features.length > 0 ? (
                  <>
                    <h4 className="mt-8 text-sm font-semibold text-ink">
                      What this can include
                    </h4>
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                      {capability.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 py-2.5 text-sm text-ink-muted"
                        >
                          <span
                            className="h-1 w-1 shrink-0 bg-signal"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <Link href="/quote" className="btn-primary mt-8 self-start">
                  Get started with {capability.title}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div
                aria-hidden="true"
                className={`${styles.stage} min-w-0 lg:sticky lg:top-24 lg:col-span-7 lg:self-start`}
              >
                {selected ? (
                  <CapabilityVignette kind={vignetteFor(capability.iconKey)} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ServicesSection;
