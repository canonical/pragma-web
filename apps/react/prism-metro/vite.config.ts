import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import redirectPackageArtifacts from "./src/relay/redirectPackageArtifacts.js";
import { createIconsPlugin } from "./vite-plugin-ds-icons.js";

// Path aliases are declared as Node subpath imports in package.json
// "imports", one per domain, each naming that domain's barrel (#lib/ui,
// #domains/lenses, #server, …), and Vite resolves them natively: no resolver
// plugin.
const PORT = Number(process.env.PORT) || undefined;

/** The app's root, where this file and its Relay configuration sit. */
const APP_ROOT = dirname(fileURLToPath(import.meta.url));

// `build:server` runs `vite build --mode server` to compile the two server
// renderers in a single pass. Each is a separate, individually-instantiated
// brick, so they are named Rollup inputs: the build emits
// `dist/server/renderer.js` (the JSX app) and `dist/server/sitemap.js` (the
// XML sitemap), which the preview server imports directly. Every other
// command (`dev`, `build:client`, `preview`) uses the default mode and the
// client build (`--ssrManifest --outDir dist/client`).
export default defineConfig(({ mode }) => ({
  // No Relay transform: every document, the app's and the packages', is
  // declared as a tag nothing calls beside an import of its compiled
  // artifact, so nothing needs rewriting. The app runs the lens and
  // projection packages on its own compile: `bun run relay` compiles their
  // documents beside the app's against this app's schema, and the plugin
  // resolves each package's artifact import to the app's artifact of the
  // same name, so the packages' queries fetch what the site's own arms read.
  // vitest, the dev server (its prepare step and its render), the server
  // build and Storybook all load this file, so each of them runs the
  // packages the same way. createIconsPlugin() serves the
  // @canonical/ds-assets icons at /icons in dev and copies them into the
  // client build output: design-system components fetch glyphs at runtime
  // from `/icons/<name>.svg#<name>`, and an unserved icon renders empty with
  // no error.
  plugins: [
    createIconsPlugin(),
    redirectPackageArtifacts({
      appRoot: APP_ROOT,
      relayConfig: join(APP_ROOT, "relay.config.json"),
    }),
    react(),
  ],
  // Honour the PORT env var for `dev` and `preview`, as the SSR servers do.
  server: { port: PORT },
  preview: { port: PORT },
  // CSS delivery is the app's job, not the libraries': @canonical/* packages
  // ship modern, uncompiled per-component CSS and take no stance on browser
  // support. Lightning CSS (bundled with Vite 8) compiles that CSS down to
  // this app's browser floor, the browserslist query in .browserslistrc.
  // Math functions like `mod()` (used by the typography baseline grid) have no
  // polyfillable form, so that feature's Chromium ≥ 125 floor is unchanged.
  css: {
    transformer: "lightningcss",
    lightningcss: { targets: browserslistToTargets(browserslist()) },
  },
  build: {
    // Lightning CSS minifies too, so one tool owns both downleveling and
    // minification, in the client build and the server build alike.
    cssMinify: "lightningcss",
    ...(mode === "server"
      ? {
          ssr: true,
          outDir: "dist/server",
          rollupOptions: {
            input: {
              renderer: "src/server/renderer.tsx",
              sitemap: "src/sitemap/renderer.ts",
            },
          },
        }
      : undefined),
  },
  ssr: {
    // Bundle @canonical/* for SSR rather than externalising them: some
    // packages declare only a "module" entry, which Vite's Node-style SSR
    // resolver ignores, and the source-shipped prism packages import CSS as a
    // side effect, which Node cannot load but Vite's SSR transform handles.
    // The Relay packages and graphql stay external like react itself; the
    // workspace root's `patchedDependencies` fix the packaging defects that
    // would otherwise break their named imports under Node.
    noExternal: [/^@canonical\//],
  },
}));
