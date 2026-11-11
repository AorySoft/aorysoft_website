import { Check } from "lucide-react";

type ChoiceGroupProps = {
  legend: string;
  options: readonly string[];
  isSelected: (option: string) => boolean;
  onToggle: (option: string) => void;
  /** Tailwind grid-cols classes for this group's layout. */
  columns: string;
};

/**
 * A labelled group of toggle buttons. The fieldset/legend gives the group a
 * name, aria-pressed announces each option's state, and the check icon means
 * selection is not shown by colour alone.
 */
export default function ChoiceGroup({ legend, options, isSelected, onToggle, columns }: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-ink-muted">{legend}</legend>
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option) => {
          const selected = isSelected(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option)}
              className={`flex min-h-11 items-center justify-between gap-2 rounded-atelier border p-3 text-left text-sm font-medium transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${
                selected
                  ? "border-signal bg-signal text-canvas"
                  : "border-line-strong bg-surface-raised text-ink-muted hover:border-signal/60 hover:text-ink"
              }`}
            >
              <span>{option}</span>
              {selected ? <Check size={16} className="shrink-0" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
