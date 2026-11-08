"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { SiteSettingsData } from "@/lib/types";
import { saveSettings } from "./actions";
import type { ActionState } from "@/lib/admin/actions";

const initialState: ActionState = { ok: true };

const inputClasses =
  "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20";

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}

type Pair = { keyA: string; keyB: string; a: string; b: string };

function pairsFrom(
  list: { [k: string]: string }[] | undefined,
  keyA: string,
  keyB: string,
): Pair[] {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => ({
    keyA: keyA,
    keyB: keyB,
    a: String(item[keyA] ?? ""),
    b: String(item[keyB] ?? ""),
    key: `${keyA}-${index}`,
  })) as Pair[];
}

export default function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [form, setForm] = useState<SiteSettingsData>({
    heroBadge: initial.heroBadge ?? "",
    heroTitleLine1: initial.heroTitleLine1 ?? "",
    heroTitleLine2: initial.heroTitleLine2 ?? "",
    heroSubtitle: initial.heroSubtitle ?? "",
    aboutHeading: initial.aboutHeading ?? "",
    aboutText: initial.aboutText ?? "",
    ctaTitle: initial.ctaTitle ?? "",
    ctaText: initial.ctaText ?? "",
    footerEmail: initial.footerEmail ?? "",
    footerPhone: initial.footerPhone ?? "",
    footerAddress: initial.footerAddress ?? "",
  });

  const [industries, setIndustries] = useState<Pair[]>(
    pairsFrom(initial.industries, "title", "description"),
  );
  const [technologies, setTechnologies] = useState<Pair[]>(
    pairsFrom(initial.technologies, "name", "category"),
  );
  const [socialLinks, setSocialLinks] = useState<{ label: string; url: string }[]>(
    initial.socialLinks ?? [],
  );

  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState,
  );

  const set = (key: keyof SiteSettingsData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = (): SiteSettingsData => ({
    ...form,
    industries: industries.map((item) => ({
      title: item.a,
      description: item.b,
    })),
    technologies: technologies.map((item) => ({
      name: item.a,
      category: item.b,
    })),
    socialLinks: socialLinks.filter((link) => link.label && link.url),
  });

  const editPairs = (
    list: Pair[],
    setter: (next: Pair[]) => void,
    keyA: string,
    keyB: string,
  ) => (
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
            className={inputClasses}
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
            className={inputClasses}
            placeholder={keyB}
          />
          <button
            type="button"
            onClick={() => setter(list.filter((_, i) => i !== index))}
            aria-label={`Remove row ${index + 1}`}
            className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:border-red-500/50 hover:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setter([...list, { keyA, keyB, a: "", b: "", key: `${keyA}-${Date.now()}` } as Pair])
        }
        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700"
      >
        + Add row
      </button>
    </div>
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="payload" value={JSON.stringify(buildPayload())} />

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Hero</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Labeled label="Badge">
            <input
              value={form.heroBadge}
              onChange={(e) => set("heroBadge")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="Subtitle">
            <input
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="Title line 1">
            <input
              value={form.heroTitleLine1}
              onChange={(e) => set("heroTitleLine1")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="Title line 2">
            <input
              value={form.heroTitleLine2}
              onChange={(e) => set("heroTitleLine2")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">About</h2>
        <Labeled label="Heading">
          <input
            value={form.aboutHeading}
            onChange={(e) => set("aboutHeading")(e.target.value)}
            className={inputClasses}
          />
        </Labeled>
        <Labeled label="Text">
          <textarea
            rows={4}
            value={form.aboutText}
            onChange={(e) => set("aboutText")(e.target.value)}
            className={`${inputClasses} resize-y`}
          />
        </Labeled>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Industries</h2>
        {editPairs(industries, setIndustries, "title", "description")}
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Technologies</h2>
        {editPairs(technologies, setTechnologies, "name", "category")}
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">CTA</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Labeled label="CTA title">
            <input
              value={form.ctaTitle}
              onChange={(e) => set("ctaTitle")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="CTA text">
            <input
              value={form.ctaText}
              onChange={(e) => set("ctaText")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Footer contact</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Labeled label="Email">
            <input
              value={form.footerEmail}
              onChange={(e) => set("footerEmail")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="Phone">
            <input
              value={form.footerPhone}
              onChange={(e) => set("footerPhone")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
          <Labeled label="Address">
            <input
              value={form.footerAddress}
              onChange={(e) => set("footerAddress")(e.target.value)}
              className={inputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Social links</h2>
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                aria-label={`Social label ${index + 1}`}
                value={link.label}
                placeholder="Label"
                onChange={(event) =>
                  setSocialLinks(
                    socialLinks.map((other, i) =>
                      i === index ? { ...other, label: event.target.value } : other,
                    ),
                  )
                }
                className={inputClasses}
              />
              <input
                aria-label={`Social URL ${index + 1}`}
                value={link.url}
                placeholder="https://…"
                onChange={(event) =>
                  setSocialLinks(
                    socialLinks.map((other, i) =>
                      i === index ? { ...other, url: event.target.value } : other,
                    ),
                  )
                }
                className={inputClasses}
              />
              <button
                type="button"
                onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                aria-label={`Remove social link ${index + 1}`}
                className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:border-red-500/50 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-700"
          >
            + Add social link
          </button>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
