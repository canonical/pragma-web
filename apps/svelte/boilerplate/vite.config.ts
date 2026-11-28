import { fileURLToPath } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// The design-system fonts live in the workspace's ds-assets package, outside
// this app, so the dev server must be allowed to serve the monorepo root.
const workspaceRoot = fileURLToPath(new URL("../../..", import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  server: { fs: { allow: [workspaceRoot] } },
});
