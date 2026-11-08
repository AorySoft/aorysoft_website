// No-op stand-in for the `server-only` package, used ONLY by vitest
// (see vitest.config.ts alias). The real package throws when imported from a
// non-server graph, which is exactly the browser-leak guard we want in the
// production build but not when unit-testing the server modules directly.
export {};
