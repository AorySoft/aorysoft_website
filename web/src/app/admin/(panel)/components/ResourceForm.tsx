"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FieldDef, ResourceDef } from "@/lib/admin/resources";
import {
  createResource,
  updateResource,
  type ActionState,
} from "@/lib/admin/actions";

const initialState: ActionState = { ok: true };

const inputClasses =
  "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20";

const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";

function Field({
  def,
  value,
  error,
  categories,
  media,
}: {
  def: FieldDef;
  value: unknown;
  error?: string;
  categories: { id: string; name: string }[];
  media: { id: string; url: string; alt: string }[];
}) {
  const describedBy = error ? `${def.name}-error` : undefined;

  let control: React.ReactNode;

  switch (def.kind) {
    case "textarea": {
      const rows = def.name === "body_html" ? 12 : 4;
      control = (
        <textarea
          id={def.name}
          name={def.name}
          rows={rows}
          defaultValue={typeof value === "string" ? value : ""}
          maxLength={def.maxLength}
          className={`${inputClasses} resize-y`}
          aria-describedby={describedBy}
        />
      );
      break;
    }
    case "checkbox": {
      control = (
        <input
          type="checkbox"
          id={def.name}
          name={def.name}
          defaultChecked={value === true}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-400/40"
        />
      );
      break;
    }
    case "select": {
      control = (
        <select
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "string" && value ? value : ""}
          className={inputClasses}
          aria-describedby={describedBy}
        >
          {!def.required && <option value="">—</option>}
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "stringList": {
      const text = Array.isArray(value) ? value.join("\n") : "";
      control = (
        <textarea
          id={def.name}
          name={def.name}
          rows={6}
          defaultValue={text}
          className={`${inputClasses} resize-y`}
          aria-describedby={describedBy}
        />
      );
      break;
    }
    case "number": {
      control = (
        <input
          type="number"
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "number" ? value : 0}
          className={inputClasses}
          aria-describedby={describedBy}
        />
      );
      break;
    }
    case "date": {
      control = (
        <input
          type="date"
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "string" ? value : ""}
          className={inputClasses}
          aria-describedby={describedBy}
        />
      );
      break;
    }
    case "categoryRef": {
      control = (
        <select
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "string" ? value : ""}
          className={inputClasses}
          aria-describedby={describedBy}
        >
          <option value="">— none —</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "mediaRef": {
      control = (
        <select
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "string" ? value : ""}
          className={inputClasses}
          aria-describedby={describedBy}
        >
          <option value="">— none —</option>
          {media.map((item) => (
            <option key={item.id} value={item.id}>
              {item.alt || item.url.split("/").pop()}
            </option>
          ))}
        </select>
      );
      break;
    }
    default: {
      control = (
        <input
          type="text"
          id={def.name}
          name={def.name}
          defaultValue={typeof value === "string" ? value : ""}
          maxLength={def.maxLength}
          className={inputClasses}
          aria-describedby={describedBy}
        />
      );
    }
  }

  return (
    <div className={def.kind === "checkbox" ? "flex items-center gap-3" : ""}>
      <label htmlFor={def.name} className={labelClasses}>
        {def.label}
        {def.required ? " *" : ""}
      </label>
      <div className={def.kind === "checkbox" ? "pt-1" : ""}>{control}</div>
      {def.help && (
        <p className="mt-1 text-xs text-gray-500">{def.help}</p>
      )}
      {error && (
        <p
          id={describedBy}
          className="mt-1 text-xs font-medium text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function ResourceForm({
  def,
  initial,
  categories = [],
  media = [],
}: {
  def: ResourceDef;
  initial?: Record<string, unknown>;
  categories?: { id: string; name: string }[];
  media?: { id: string; url: string; alt: string }[];
}) {
  const isEdit = Boolean(initial?.id);
  const id = typeof initial?.id === "string" ? initial.id : "";

  // Bind the resource key (and id when editing) into the server action.
  const action = async (state: ActionState, formData: FormData) =>
    isEdit
      ? updateResource(def.key, id, formData)
      : createResource(def.key, null, formData);

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const fieldsets = Array.from(
    new Set(def.fields.map((field) => field.fieldset ?? "")),
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {state.error}
        </p>
      )}

      {fieldsets.map((fieldset) => (
        <section
          key={fieldset || "fields"}
          className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
        >
          {fieldset && (
            <h2 className="text-lg font-semibold text-white">{fieldset}</h2>
          )}
          <div
            className={
              def.key === "posts" && fieldset === "SEO"
                ? "space-y-4"
                : "grid grid-cols-1 gap-4 md:grid-cols-2"
            }
          >
            {def.fields
              .filter((field) => (field.fieldset ?? "") === fieldset)
              .map((field) => (
                <div
                  key={field.name}
                  className={
                    field.kind === "textarea" ||
                    field.kind === "stringList" ||
                    field.kind === "checkbox"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <Field
                    def={field}
                    value={initial?.[field.name]}
                    error={state.errors?.[field.name]}
                    categories={categories}
                    media={media}
                  />
                </div>
              ))}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : `Create ${def.singular}`}
        </button>
        <Link
          href={`/admin/${def.key}`}
          className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
