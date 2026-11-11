import styles from "@/components/sections/stack.module.css";

export type StackLayer = { name: string; tools: readonly string[] };

/**
 * Technology as labeled layers of a system with a signal travelling down the
 * rail. Tools are plain text (tools we use), never vendor logos.
 */
export default function StackRows({ layers, className = "" }: { layers: readonly StackLayer[]; className?: string }) {
  if (layers.length === 0) return null;
  return (
    <dl className={`${styles.stack} relative border-t border-line ${className}`}>
      <span className={styles.signal} aria-hidden="true" />
      {layers.map((layer) => (
        <div
          key={layer.name}
          className="relative grid gap-3 border-b border-line py-6 pl-8 md:grid-cols-12 md:items-center md:gap-8 md:pl-10"
        >
          <span
            className="absolute left-[3px] top-[1.9rem] h-[9px] w-[9px] border border-line-strong bg-canvas md:left-[11px] md:top-1/2 md:-translate-y-1/2"
            aria-hidden="true"
          />
          <dt className="text-sm font-medium text-ink-muted md:col-span-3">{layer.name}</dt>
          <dd className="flex flex-wrap gap-x-8 gap-y-2 md:col-span-9">
            {layer.tools.map((tool) => (
              <span key={tool} className="font-display text-2xl text-ink md:text-3xl">
                {tool}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
