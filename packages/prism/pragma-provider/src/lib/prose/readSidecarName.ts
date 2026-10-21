import { PROSE_EXTENSION } from "../config/index.js";
import { DEFAULT_PROSE_LANG, LANGUAGE_TAG } from "./constants.js";
import type { SidecarReading } from "./types.js";

/**
 * The ways a sidecar's file name can be read.
 *
 * `button.md` reads one way: the local name `button`, in the default
 * language. `button.fr.md` reads two ways, because a local name may itself
 * contain dots and end in a segment that looks like a language
 * (`lit.component.ssr`): the local name `button.fr` in the default language,
 * or the local name `button` in `fr`. Which reading names an entity is for
 * the graph to decide. A last segment that is not a language tag
 * (`button.FR`) leaves only the first reading.
 *
 * @param fileName - The sidecar's file name, extension included.
 * @returns One or two readings, the whole name first.
 * @throws When the name does not end in the sidecar extension.
 */
export const readSidecarName = (fileName: string): SidecarReading[] => {
  if (!fileName.endsWith(PROSE_EXTENSION)) {
    throw new Error(
      `${fileName} is not a prose sidecar: its name does not end in ${PROSE_EXTENSION}`,
    );
  }
  const stem = fileName.slice(0, -PROSE_EXTENSION.length);
  const dot = stem.lastIndexOf(".");
  const segment = stem.slice(dot + 1);
  const whole: SidecarReading = { localName: stem, lang: DEFAULT_PROSE_LANG };
  return dot > 0 && LANGUAGE_TAG.test(segment)
    ? [whole, { localName: stem.slice(0, dot), lang: segment }]
    : [whole];
};
