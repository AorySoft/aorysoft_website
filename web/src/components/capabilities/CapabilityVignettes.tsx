import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Check, Database, FileInput, MessageSquare, Sparkles } from "lucide-react";
import type { VignetteKind } from "./serviceModel";
import styles from "./capabilities.module.css";

/*
 * Illustrative scenes of the kind of thing each capability produces.
 * Generic by design: no client names, figures, or results are implied.
 */

const step = (i: number) => ({ "--i": i }) as CSSProperties;

function Reveal({ i, className = "", children }: { i: number; className?: string; children?: ReactNode }) {
  return (
    <div className={`${styles.reveal} ${className}`} style={step(i)}>
      {children}
    </div>
  );
}

function Chat() {
  return (
    <div className="flex h-full flex-col justify-end gap-3 text-sm leading-snug">
      <Reveal i={0} className="max-w-[80%] self-end rounded-atelier bg-surface-raised px-3.5 py-2.5 text-ink">
        Do you have anything open Thursday morning?
      </Reveal>
      <Reveal i={1} className="max-w-[85%] rounded-atelier bg-signal-deep/25 px-3.5 py-2.5 text-ink">
        Thursday has 10:30 and 11:15 available. Shall I book 10:30 and send a confirmation?
      </Reveal>
      <Reveal i={2} className="max-w-[80%] self-end rounded-atelier bg-surface-raised px-3.5 py-2.5 text-ink">
        10:30 works.
      </Reveal>
      <Reveal i={3} className={`${styles.typing} flex gap-1 self-start px-1 py-2`}>
        <span />
        <span />
        <span />
      </Reveal>
    </div>
  );
}

function Agent() {
  const steps = [
    ["Read request", "intent: order status"],
    ["Tool call", "orders.lookup"],
    ["Tool call", "policy.check"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 text-sm">
      <Reveal i={0} className="font-mono text-xs text-ink-subtle">agent run</Reveal>
      {steps.map(([label, detail], index) => (
        <Reveal key={detail} i={index + 1} className="flex items-center gap-3 border-b border-line pb-3">
          <Check className="h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
          <span className="text-ink">{label}</span>
          <span className="ml-auto font-mono text-xs text-ink-muted">{detail}</span>
        </Reveal>
      ))}
      <Reveal i={4} className="flex items-center gap-3">
        <span className={`${styles.beacon} h-2 w-2 shrink-0 bg-signal`} />
        <span className="text-ink">Draft reply</span>
        <span className="ml-auto text-xs text-ink-muted">waiting for human review</span>
      </Reveal>
    </div>
  );
}

function Workflow() {
  const nodes = [
    { icon: FileInput, label: "Form submitted" },
    { icon: Sparkles, label: "AI classifies the request" },
    { icon: Database, label: "CRM record created" },
    { icon: MessageSquare, label: "Team notified" },
  ];
  return (
    <div className="relative flex h-full flex-col justify-center gap-4 text-sm">
      <span className={`${styles.flow} absolute bottom-8 left-[1.15rem] top-8 w-px bg-line`} aria-hidden="true" />
      {nodes.map(({ icon: Icon, label }, index) => (
        <Reveal key={label} i={index} className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-atelier border border-line bg-canvas text-signal">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-ink">{label}</span>
        </Reveal>
      ))}
    </div>
  );
}

function Insight() {
  const bars = [
    ["Web", "78%"],
    ["Mobile app", "62%"],
    ["Marketplace", "41%"],
    ["In-store", "24%"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-4 text-sm">
      <Reveal i={0} className="text-ink">
        Orders by channel
        <span className="mt-1 block font-mono text-xs text-ink-subtle">group by channel · last 8 weeks</span>
      </Reveal>
      {bars.map(([label, width], index) => (
        <div key={label} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
          <span className="text-ink-muted">{label}</span>
          <span className="h-2.5 bg-surface-raised">
            <span
              className={`${styles.grow} block h-full bg-gradient-to-r from-signal-deep to-signal`}
              style={{ width, ...step(index + 1) }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function Deploy() {
  const lines = [
    { done: true, text: "Build completed" },
    { done: true, text: "Tests passed" },
    { done: true, text: "Preview deployed" },
    { done: false, text: "Promoted to production" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 font-mono text-xs sm:text-[0.8125rem]">
      <Reveal i={0} className="text-ink-subtle">$ git push origin main</Reveal>
      {lines.map((line, index) => (
        <Reveal key={line.text} i={index + 1} className="flex items-center gap-2.5 text-ink">
          {line.done ? (
            <Check className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
          )}
          {line.text}
        </Reveal>
      ))}
      <Reveal i={5} className="flex items-center gap-2.5 text-ink-muted">
        <span className={`${styles.beacon} ml-[3px] h-2 w-2 bg-signal`} />
        Health checks passing
      </Reveal>
    </div>
  );
}

function Build() {
  return (
    <div className="relative h-full">
      <Reveal i={0} className="absolute inset-y-2 left-0 right-12 flex flex-col overflow-hidden rounded-atelier border border-line bg-canvas">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2 w-2 bg-line" />
          <span className="h-2 w-2 bg-line" />
          <span className="h-2 w-2 bg-line" />
          <span className="ml-3 h-3 flex-1 bg-surface-raised" />
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <Reveal i={1} className="h-3 w-2/5 bg-ink/80" />
          <Reveal i={2} className="h-2 w-3/4 bg-surface-raised" />
          <Reveal i={2} className="h-2 w-2/3 bg-surface-raised" />
          <Reveal i={3} className="mt-1 h-6 w-24 bg-signal" />
          <div className="mt-auto grid grid-cols-3 gap-2.5">
            {[4, 5, 6].map((i) => (
              <Reveal key={i} i={i} className="h-12 border border-line bg-surface" />
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal i={5} className="absolute bottom-0 right-0 flex h-[78%] w-[30%] max-w-[7.5rem] flex-col gap-2 rounded-atelier-lg border border-line bg-surface p-2.5">
        <span className="mx-auto h-1 w-8 bg-line" />
        <span className="h-2 w-3/4 bg-ink/80" />
        <span className="h-10 bg-surface-raised" />
        <span className="h-10 bg-surface-raised" />
        <span className="mt-auto h-5 bg-signal" />
      </Reveal>
    </div>
  );
}

function Schema() {
  const tables = [
    { name: "clients", fields: ["id", "name", "email"], className: "left-0 top-2" },
    { name: "projects", fields: ["id", "client_id", "status"], className: "right-0 top-1/2 -translate-y-1/2" },
    { name: "invoices", fields: ["id", "project_id", "due_at"], className: "bottom-2 left-0" },
  ];
  return (
    <div className="relative h-full font-mono text-xs">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M38 20 H55 V45 H62" className={styles.link} vectorEffect="non-scaling-stroke" />
        <path d="M38 80 H55 V55 H62" className={styles.link} vectorEffect="non-scaling-stroke" />
      </svg>
      {tables.map((table, index) => (
        <Reveal key={table.name} i={index} className={`absolute w-[38%] min-w-[7.5rem] border border-line bg-canvas ${table.className}`}>
          <div className="border-b border-line px-2.5 py-1.5 text-signal">{table.name}</div>
          {table.fields.map((field) => (
            <div key={field} className="px-2.5 py-1 text-ink-muted">{field}</div>
          ))}
        </Reveal>
      ))}
    </div>
  );
}

const SCENES: Record<VignetteKind, () => ReactNode> = {
  chat: Chat,
  agent: Agent,
  workflow: Workflow,
  insight: Insight,
  deploy: Deploy,
  build: Build,
  schema: Schema,
};

export default function CapabilityVignette({ kind }: { kind: VignetteKind }) {
  const Scene = SCENES[kind];
  return (
    <div className="relative aspect-[5/4] min-h-[17rem] w-full min-w-0 max-w-full overflow-hidden rounded-atelier-lg border border-line bg-canvas">
      <div className="absolute inset-5 sm:inset-6">
        <Scene />
      </div>
    </div>
  );
}
