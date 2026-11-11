"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MARK_PATHS, MARK_STOPS } from "@/components/brand/markGeometry";
import { requestCapability } from "@/components/capabilities/serviceModel";
import styles from "./HeroSculpture.module.css";
import { HERO_NODES } from "./nodes";

/** Mark placement inside the 600 × 600 scene: base lands on the horizon (y ≈ 399). */
const MARK_TRANSFORM = "translate(130 90) scale(8)";
const DEPTH_LAYERS = [7, 6, 5, 4, 3, 2, 1];

const NODES = HERO_NODES;

function MarkPaths(props: React.SVGProps<SVGPathElement>) {
  return (
    <>
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} {...props} />
      ))}
    </>
  );
}

/**
 * The AorySoft A as a light sculpture: stacked outline planes that extrude
 * toward the pointer, a light sweep across the filled mark, and signal lines
 * carrying pulses out to the four disciplines.
 */
export default function HeroSculpture({
  nodeHrefs = [],
}: {
  /** Per node (same order as NODES): a published service page, or null to open the capability tab. */
  nodeHrefs?: readonly (string | null)[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Per-instance SVG ids: duplicate ids would point every copy at the first (possibly hidden) one.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    fill: `${uid}-fill`,
    sweep: `${uid}-sweep`,
    horizon: `${uid}-horizon`,
    glow: `${uid}-glow`,
    clip: `${uid}-clip`,
  };
  const [activeNode, setActiveNode] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Pause every loop while the hero is off screen.
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    observer.observe(root);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (still.matches || !finePointer.matches) return () => observer.disconnect();

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      root.style.setProperty("--px", current.x.toFixed(4));
      root.style.setProperty("--py", current.y.toFixed(4));
      const settled =
        Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      target.x = Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth / 2)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight / 2)));
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <svg
        className={styles.scene}
        viewBox="0 0 600 600"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={ids.fill}
            x1="0"
            y1="0.6"
            x2="0"
            y2="38.6"
            gradientUnits="userSpaceOnUse"
          >
            {MARK_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <linearGradient id={ids.sweep} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={ids.horizon} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgb(30 40 54)" stopOpacity="0" />
            <stop offset="0.5" stopColor="rgb(6 182 212)" stopOpacity="0.7" />
            <stop offset="1" stopColor="rgb(30 40 54)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={ids.glow} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgb(37 99 235)" stopOpacity="0.32" />
            <stop offset="0.55" stopColor="rgb(6 182 212)" stopOpacity="0.08" />
            <stop offset="1" stopColor="rgb(6 182 212)" stopOpacity="0" />
          </radialGradient>
          <clipPath id={ids.clip}>
            <g transform={MARK_TRANSFORM}>
              <MarkPaths />
            </g>
          </clipPath>
        </defs>

        <ellipse className={styles.glow} cx="300" cy="260" rx="290" ry="250" fill={`url(#${ids.glow})`} />

        {/* Extruded outline planes, deepest first. */}
        {DEPTH_LAYERS.map((layer) => (
          <g
            key={layer}
            className={styles.plane}
            style={{ "--layer": layer } as React.CSSProperties}
          >
            <g transform={MARK_TRANSFORM}>
              <MarkPaths
                stroke={layer > 4 ? "rgb(37 99 235)" : "rgb(6 182 212)"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="miter"
              />
            </g>
          </g>
        ))}

        {/* Front face with the moving light sweep. */}
        <g className={styles.face}>
          <g transform={MARK_TRANSFORM}>
            <MarkPaths fill={`url(#${ids.fill})`} />
          </g>
          <g clipPath={`url(#${ids.clip})`}>
            <rect className={styles.sweep} x="-120" y="60" width="200" height="360" fill={`url(#${ids.sweep})`} />
          </g>
        </g>

        <line x1="20" y1="399" x2="580" y2="399" stroke={`url(#${ids.horizon})`} strokeWidth="1" />

        {NODES.map((node, index) => (
          <g key={node.label} data-active={activeNode === index || undefined} className={styles.route}>
            <path className={styles.track} d={node.path} />
            <path
              className={styles.pulse}
              d={node.path}
              pathLength={1}
              style={{ animationDelay: `${index * 0.7}s` }}
            />
            <rect className={styles.node} x={node.x - 5} y="535" width="10" height="10" />
          </g>
        ))}
      </svg>

      <span className={styles.wordmark} aria-hidden="true">
        AorySoft
      </span>

      <ul className={styles.labels} aria-label="What we build">
        {NODES.map((node, index) => {
          const href = nodeHrefs[index] ?? null;
          return (
            <li key={node.label} style={{ left: `${(node.x / 600) * 100}%` }}>
              <a
                href={href ?? "#services"}
                className={styles.label}
                onPointerEnter={() => setActiveNode(index)}
                onPointerLeave={() => setActiveNode(null)}
                onFocus={() => setActiveNode(index)}
                onBlur={() => setActiveNode(null)}
                onClick={href ? undefined : () => requestCapability(node.keys)}
              >
                {node.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
