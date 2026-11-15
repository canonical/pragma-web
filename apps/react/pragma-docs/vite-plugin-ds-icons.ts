import { createReadStream, existsSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";

/** One directory of SVGs, by exact name: no traversal, no directory listing. */
const ICON_NAME = /^[a-z0-9-]+\.svg$/;

/**
 * Resolve the icons directory of the installed `@canonical/ds-assets`.
 *
 * @returns The absolute path of the package's `icons` directory.
 * @note Impure: it reads the module resolution of the running process, so the
 * path follows whichever version of the package is installed.
 */
const resolveIconsDir = (): string =>
  join(
    dirname(
      fileURLToPath(import.meta.resolve("@canonical/ds-assets/package.json")),
    ),
    "icons",
  );

/**
 * Create the Vite plugin that serves the design system's icons at `/icons`,
 * in development and in the build.
 *
 * `Icon`, `Spinner`, and every component that renders one resolve
 * `/icons/<name>.svg#<name>` at runtime, from the site root. An unserved icon
 * renders as nothing at all, with no error and no broken-image glyph, so the
 * files must be reachable in development and in the assembled app alike. They
 * live in `@canonical/ds-assets`; the plugin serves them from there rather
 * than copying them into the repository, so they can never drift from the
 * installed package version. In development a middleware answers
 * `/icons/<name>.svg` from the package (a 404 for an unknown icon); after a
 * client build the directory is copied into the build's output directory.
 *
 * @returns The Vite plugin.
 * @note Impure: the plugin's hooks register a middleware on the dev server,
 * read icon files from the filesystem, and write the copied icons into the
 * client build output.
 */
export function createIconsPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "design-system-icons-at-root",
    configResolved(resolved) {
      config = resolved;
    },
    configureServer(server) {
      server.middlewares.use("/icons", (request, response, next) => {
        // The request URL comes from the client: an absent URL reads as empty.
        const path = (request.url ?? "").split("?").at(0) ?? "";
        const name = path.replace(/^\//, "");
        if (!ICON_NAME.test(name)) {
          next();
          return;
        }
        const file = join(resolveIconsDir(), name);
        if (!existsSync(file)) {
          // A real 404, not the SPA fallback: a missing icon should be
          // visible in the network tab, not silently resolve to HTML.
          response.statusCode = 404;
          response.end();
          return;
        }
        response.setHeader("Content-Type", "image/svg+xml");
        createReadStream(file).pipe(response);
      });
    },
    async writeBundle() {
      // The client build only: `build:server` (the SSR renderers) has no
      // static output to serve from. The dev/preview/production servers all
      // serve the client output directory, so the copy lands where every
      // one of them looks.
      if (config.command !== "build" || config.build.ssr) {
        return;
      }
      const target = join(config.build.outDir, "icons");
      await mkdir(target, { recursive: true });
      await cp(resolveIconsDir(), target, { recursive: true });
    },
  };
}
