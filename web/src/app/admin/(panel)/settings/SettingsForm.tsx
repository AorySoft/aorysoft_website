"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { SiteSettingsData } from "@/lib/types";
import { saveSettings } from "./actions";
import type { ActionState } from "@/lib/admin/actions";
import {
  Labeled,
  PairEditor,
  pairsFrom,
  settingsInputClasses,
  type Pair,
} from "./SettingsFields";

const initialState: ActionState = { ok: true };

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

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="payload" value={JSON.stringify(buildPayload())} />

      {state.error && (
        <p role="alert" className="rounded-atelier-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">Hero</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Labeled label="Badge" htmlFor="settings-hero-badge">
            <input
              id="settings-hero-badge"
              value={form.heroBadge}
              onChange={(e) => set("heroBadge")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="Subtitle" htmlFor="settings-hero-subtitle">
            <input
              id="settings-hero-subtitle"
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="Title line 1" htmlFor="settings-hero-title-1">
            <input
              id="settings-hero-title-1"
              value={form.heroTitleLine1}
              onChange={(e) => set("heroTitleLine1")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="Title line 2" htmlFor="settings-hero-title-2">
            <input
              id="settings-hero-title-2"
              value={form.heroTitleLine2}
              onChange={(e) => set("heroTitleLine2")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">About</h2>
        <Labeled label="Heading" htmlFor="settings-about-heading">
          <input
            id="settings-about-heading"
            value={form.aboutHeading}
            onChange={(e) => set("aboutHeading")(e.target.value)}
            className={settingsInputClasses}
          />
        </Labeled>
        <Labeled label="Text" htmlFor="settings-about-text">
          <textarea
            id="settings-about-text"
            rows={4}
            value={form.aboutText}
            onChange={(e) => set("aboutText")(e.target.value)}
            className={`${settingsInputClasses} resize-y`}
          />
        </Labeled>
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">Industries</h2>
        <PairEditor
          list={industries}
          setter={setIndustries}
          keyA="title"
          keyB="description"
        />
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">Technologies</h2>
        <PairEditor
          list={technologies}
          setter={setTechnologies}
          keyA="name"
          keyB="category"
        />
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">CTA</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Labeled label="CTA title" htmlFor="settings-cta-title">
            <input
              id="settings-cta-title"
              value={form.ctaTitle}
              onChange={(e) => set("ctaTitle")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="CTA text" htmlFor="settings-cta-text">
            <input
              id="settings-cta-text"
              value={form.ctaText}
              onChange={(e) => set("ctaText")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">Footer contact</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Labeled label="Email" htmlFor="settings-footer-email">
            <input
              id="settings-footer-email"
              value={form.footerEmail}
              onChange={(e) => set("footerEmail")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="Phone" htmlFor="settings-footer-phone">
            <input
              id="settings-footer-phone"
              value={form.footerPhone}
              onChange={(e) => set("footerPhone")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
          <Labeled label="Address" htmlFor="settings-footer-address">
            <input
              id="settings-footer-address"
              value={form.footerAddress}
              onChange={(e) => set("footerAddress")(e.target.value)}
              className={settingsInputClasses}
            />
          </Labeled>
        </div>
      </section>

      <section className="space-y-4 rounded-atelier-lg border border-line bg-surface/80 p-6">
        <h2 className="text-lg font-semibold text-ink">Social links</h2>
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
                className={settingsInputClasses}
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
                className={settingsInputClasses}
              />
              <button
                type="button"
                onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                aria-label={`Remove social link ${index + 1}`}
                className="rounded-atelier border border-line px-3 py-2 text-xs text-ink-subtle hover:border-red-500/50 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}
            className="rounded-atelier bg-surface-raised px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-raised"
          >
            + Add social link
          </button>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-atelier-lg bg-signal px-6 py-2.5 text-sm font-semibold text-canvas transition-all duration-200 hover:shadow-lg hover:shadow-signal disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
