// Registers app-loader.mjs as a module customization hook, for use with
//   node --import ./scripts/register-app-loader.mjs ...
// This is the modern (non-deprecated) way to install an ESM resolve hook.
import { register } from "node:module";

register("./app-loader.mjs", import.meta.url);
