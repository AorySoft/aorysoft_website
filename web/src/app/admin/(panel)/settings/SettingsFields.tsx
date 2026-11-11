"use client";

export const settingsInputClasses =
  "w-full rounded-atelier border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder-ink-subtle focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20";

export function Labeled({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export type Pair = { keyA: string; keyB: string; a: string; b: string };

export function pairsFrom(
  list: { [k: string]: string }[] | undefined,
  keyA: string,
  keyB: string,
): Pair[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => ({
    keyA,
    keyB,
    a: String(item[keyA] ?? ""),
    b: String(item[keyB] ?? ""),
  }));
}

export function PairEditor({
  list,
  setter,
  keyA,
  keyB,
}: {
  list: Pair[];
  setter: (next: Pair[]) => void;
  keyA: string;
  keyB: string;
}) {
  return (
    <div className="space-y-2">
      {list.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            aria-label={`${keyA} ${index + 1}`}
            value={item.a}
            onChange={(event) =>
              setter(
                list.map((other, i) =>
                  i === index ? { ...other, a: event.target.value } : other,
                ),
              )
            }
            className={settingsInputClasses}
            placeholder={keyA}
          />
          <input
            aria-label={`${keyB} ${index + 1}`}
            value={item.b}
            onChange={(event) =>
              setter(
                list.map((other, i) =>
                  i === index ? { ...other, b: event.target.value } : other,
                ),
              )
            }
            className={settingsInputClasses}
            placeholder={keyB}
          />
          <button
            type="button"
            onClick={() => setter(list.filter((_, i) => i !== index))}
            aria-label={`Remove row ${index + 1}`}
            className="rounded-atelier border border-line px-3 py-2 text-xs text-ink-subtle hover:border-red-500/50 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setter([...list, { keyA, keyB, a: "", b: "" }])
        }
        className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-raised"
      >
        + Add row
      </button>
    </div>
  );
}
