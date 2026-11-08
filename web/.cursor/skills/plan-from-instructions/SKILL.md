---
name: plan-from-instructions
description: >-
  Process skill: before writing an implementation plan for AorySoft web/, read
  the relevant project skills/docs, then save the plan under plans/. Use when
  the user asks for a plan, roadmap, phased approach, or plan-from-instructions.
---

# Plan from instructions

## Steps

1. Read `CLAUDE.md` and `.cursor/docs/stack.md`.
2. Load only the skills that match the request (architecture, api-integration, security-pii, testing, yagni, …).
3. Skim real paths in `src/` / `supabase/` — do not plan against imaginary folders.
4. Write the plan as a file:

   `plans/YYYY-MM-DD-short-name.md`

5. Plan structure:

   - Goal (1–2 sentences)
   - Non-goals (YAGNI)
   - Current state (what already exists)
   - Steps (small, ordered, verifiable)
   - Files likely touched
   - Verification commands (`test`, `test:rls`, `typecheck`, …)
   - Risks (RLS, PII, service role, fat files)

6. Do **not** start implementation until the user approves the saved plan (unless they explicitly said implement now).

## Forbidden

- Leaving the only copy of the plan in chat  
- Planning Payload / second auth / rewriting `frontend/`  
- Skipping security-pii when forms, RLS, or admin roles are involved  
