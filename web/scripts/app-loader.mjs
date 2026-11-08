// ESM resolve hook so a plain `node` script can import the app's TypeScript
// modules that rely on (a) the `@/` path alias (a tsconfig/vitest concept Node
// does not natively know) and (b) the `server-only` package, which deliberately
// throws outside a React Server Component graph. In vitest both are aliased in
// vitest.config.ts; here we reproduce that so integration checks can execute
// the REAL rate-limit code path (not a re-implementation) against the live DB.
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC = path.join(process.cwd(), "src");
const SERVER_ONLY_STUB = pathToFileURL(
  path.join(SRC, "test/server-only-stub.ts"),
).href;

function resolveWithExtensions(baseNoExt) {
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = baseNoExt + ext;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return { url: SERVER_ONLY_STUB, shortCircuit: true };
  }
  if (specifier.startsWith("@/")) {
    const target = resolveWithExtensions(path.join(SRC, specifier.slice(2)));
    if (target) return { url: target, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
