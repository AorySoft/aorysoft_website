---
name: aorysoft-conventions
description: >-
  AorySoft naming, imports, server/client boundaries, and code examples. Use
  when creating files, renaming symbols, adding components, or reviewing style
  consistency in web/src.
---

# Conventions

## Naming

| Kind | Pattern | Example |
|---|---|---|
| Route segments | lowercase kebab | `src/app/blog/[slug]/page.tsx` |
| Components | PascalCase file | `HeroSection.tsx` |
| Lib modules | kebab or camel file | `rate-limit.ts`, `resources.ts` |
| Server actions file | `actions.ts` next to UI | `admin/(panel)/submissions/actions.ts` |
| Tests | `*.test.ts(x)` beside source | `validate.test.ts` |
| SQL migrations | `NNNN_name.sql` | `0005_lockdown_anon_select.sql` |

## Imports

- Alias: `@/` → `src/` (tsconfig + vitest).
- Server-only modules: start with `import "server-only"`.
- ✅ `import { getPublishedPosts } from "@/lib/data"`
- ❌ Relative `../../../lib/data` across package roots
- ❌ Importing `@/lib/supabase/admin` from a client component

## Patterns

✅ Server page fetches data, passes props to client islands:

```tsx
export default async function Page() {
  const services = await getActiveServices();
  return <ServicesSection services={services} />;
}
```

❌ Fetch with service role inside a client component.

✅ Extend admin fields via `src/lib/admin/resources.ts` + matching SQL + `validate.ts`.

❌ One-off admin pages that bypass `ResourceDef` for posts/categories/services/jobs.

✅ Honest empty/setup states when Supabase env is missing (`null` from `data.ts`, `SetupNotice`).

❌ Fake success / invented content presented as live CMS data.

## Comments

Comment **why** (security order, RLS intent). Do not narrate obvious TypeScript.
