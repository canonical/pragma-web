import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import {
  BREADCRUMBS_STYLESHEETS,
  SHELL_RULES,
  SKIP_LINK_STYLESHEET,
} from "./constants.js";

/** The package's own components, two levels up from this file. */
const UI_DIRECTORY = fileURLToPath(
  new URL("../../src/lib/ui", import.meta.url),
);

/**
 * Read the stylesheets a site loads before the core components': the layer
 * order, the primitive tokens the shim resolves to, the spacing shim and
 * the grid presets, the published skip link's, which takes the link out of
 * the flow, and the published Breadcrumbs', then the given stylesheets of
 * `@canonical/styles` by file name, such as the density modifiers, and
 * the given core components' own, each named by its folder under
 * `src/lib/ui`.
 *
 * @note Impure: reads the stylesheets from the file system.
 */
export function readStylesheets(
  components: readonly string[],
  modifiers: readonly string[] = [],
): string {
  const require = createRequire(import.meta.url);
  const styles = dirname(require.resolve("@canonical/styles/package.json"));
  const tokens = createRequire(join(styles, "package.json")).resolve(
    "@canonical/design-tokens/dist/sets.primitive.css",
  );
  return [
    join(styles, "src", "layers.css"),
    tokens,
    join(styles, "src", "spacing.css"),
    join(styles, "src", "grid.css"),
    require.resolve(`@canonical/react-ds-global/${SKIP_LINK_STYLESHEET}`),
    ...BREADCRUMBS_STYLESHEETS.map((name) =>
      require.resolve(`@canonical/react-ds-global/${name}`),
    ),
    ...modifiers.map((name) => join(styles, "src", name)),
    ...components.map((name) => join(UI_DIRECTORY, name, "styles.css")),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

/**
 * Server-render a layout inside a stand-in for a site's shell, the
 * document element carrying the given classes, such as a styles context.
 */
export function renderPage(
  layout: ReactElement,
  css: string,
  documentClassName = "",
): string {
  return `<!doctype html><html class="${documentClassName}"><head><style>${css}${SHELL_RULES}</style></head><body><div class="ds shell grid intrinsic">${renderToString(layout)}</div></body></html>`;
}
