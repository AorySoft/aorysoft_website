# QuoteForm refactor: plan only (not started)

**Date:** 2026-11-09 · **Status:** implemented 2026-11-10 · **Rule:** keep files under 450 lines (warn at 300)

## Goal

Split `src/app/quote/QuoteForm.tsx` (631 lines) into small, single-purpose files. Visitor-facing behaviour, markup and the submission payload must not change.

## Non-goals

- No change to the server action, `validateQuoteForm`, rate limiting, Turnstile or the honeypot (`src/lib/public-forms/*` is untouched).
- No new libraries (no form library, no state manager), no copy changes, no visual redesign.
- No change to the field names or values the server receives.

## Current state (measured)

| Lines | Part |
|---|---|
| 1–105 | Types, `initialData`, five option arrays (project types, budgets, timelines, tech, integrations) |
| 107–215 | Component state, handlers, `stepIsValid`, `handleFormSubmit` (builds the `FormData` payload, calls `submitQuote`) |
| 217–480 | `renderStepContent()`: a 260-line switch with five cases (steps 1–4 plus success) |
| 482–631 | Page shell: header, progress bar, `<form>` with honeypot + `TurnstileField`, error alert, nav buttons |

`page.tsx` is the only consumer. `ChoiceGroup.tsx` was already extracted (pass 3) and has tests. **QuoteForm itself has no component test**, so it has to get one before anything moves.

## Steps (each one small, and the suite stays green after it)

1. **Characterization tests first** (`QuoteForm.test.tsx`, jsdom). Pin today's behaviour:
   - Next stays disabled until step 1 is valid; the same gate applies on step 3.
   - Enter on a middle step advances instead of submitting.
   - Back keeps the values already entered.
   - The submit payload contains exactly today's keys. `technologies` and `integrations` are repeated keys, and the honeypot field `website` is present. Use a `vi.mock` of `submitQuote` that captures the `FormData`.
   - The success state renders, and the error alert renders with `fieldErrors`.
   - Submit is blocked while Turnstile is configured but has no token.
2. **`quoteOptions.ts`**: move the types, `initialData` and the option arrays (about 100 lines). Pure data, nothing to break.
3. **`useQuoteWizard.ts`** hook: state, `handleInputChange`, `handleArrayToggle`, `stepIsValid`, `nextStep`/`prevStep`. Keep `buildQuotePayload(formData, form)` as a pure exported function and unit-test it directly. This is the riskiest part, which is why step 1 comes first.
4. **One component per step**: `steps/ProjectStep.tsx`, `TechStep.tsx`, `ContactStep.tsx`, `ReviewStep.tsx`, `QuoteSuccess.tsx`. Each takes `formData` plus the change handlers as props and keeps its current `motion.div` wrapper and markup.
5. **`QuoteProgress.tsx`**: the progress bar with its `role="progressbar"`, label and value text unchanged.
6. **`QuoteForm.tsx`** becomes the shell: header, `<form>` with the honeypot and `TurnstileField` (these stay here so they remain inside the form), the alert, nav buttons and a step switch. Target is about 150 lines.

The expected result is no file over about 160 lines, and roughly the same total.

## Verification after every step

`npx tsc --noEmit` · `npx eslint src/app/quote` · `npx vitest run --pool=threads` (the characterization suite must stay green without changes) · `npm run build`. Then one manual browser pass at 1440 and 375 px with keyboard only: walk all four steps without submitting, and confirm in the DOM that the honeypot and Turnstile are still inside the form.

## Risks and mitigations

- **Payload drift.** Today the honeypot and Turnstile values come from the DOM, while the wizard values are copied in explicitly. Covered by the payload test and the pure `buildQuotePayload`.
- **Honeypot and Turnstile moving outside the `<form>`.** They would silently drop out of the payload. They stay in the shell, and a test asserts they are present.
- **Lost state on step change.** State lives in the hook at shell level, never inside the step components.
- **Security.** Server-side code is untouched; no new public write path.
- **No real submissions during verification.** `submitQuote` is mocked in tests, and the browser pass stops before Submit, so nothing reaches Supabase or Resend.
