import type { FileRole } from "./types.js";

const ROLES: readonly { readonly pattern: RegExp; readonly role: FileRole }[] =
  [
    { pattern: /\.test\.tsx?$/, role: "test" },
    { pattern: /\.d\.ts$/, role: "d.ts" },
    { pattern: /\.stories\.tsx?$/, role: "stories" },
    { pattern: /\.spec\.tsx?$/, role: "spec" },
    // A browser suite, run by Playwright rather than the unit runner.
    { pattern: /\.keyboard\.tsx?$/, role: "spec" },
    { pattern: /\.config\.(?:ts|mts|js|mjs)$/, role: "config" },
    { pattern: /^index\.tsx?$/, role: "barrel" },
    { pattern: /\.css$/, role: "css" },
    { pattern: /\.tsx?$/, role: "source" },
  ];

/** Read a file's role for the file rules from its name. */
export default function readFileRole(name: string): FileRole {
  return ROLES.find(({ pattern }) => pattern.test(name))?.role ?? "other";
}
