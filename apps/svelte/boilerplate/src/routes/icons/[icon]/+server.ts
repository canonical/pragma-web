import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/** One directory of SVGs, by exact name: no traversal, no directory listing. */
const ICON_NAME = /^[a-z0-9-]+\.svg$/;

const iconsDirectory = join(
  dirname(
    createRequire(import.meta.url).resolve("@canonical/ds-assets/package.json"),
  ),
  "icons",
);

/**
 * Serves the `@canonical/ds-assets` icons at `/icons/<name>.svg`: design-system
 * components and styles fetch glyphs from there at runtime, and an unserved
 * icon renders empty with no error.
 */
export const GET: RequestHandler = async ({ params }) => {
  if (!ICON_NAME.test(params.icon)) error(404, "Icon not found");

  const icon = await readFile(join(iconsDirectory, params.icon)).catch(
    () => undefined,
  );

  if (!icon) error(404, "Icon not found");

  return new Response(icon, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600",
    },
  });
};
