import { basename } from "node:path";
import type { ComponentNames } from "./types.js";

/**
 * Name a component from its folder: the folder's own name, its kebab-case
 * class name and its snake_case URI segment. The words are split as the
 * component generator splits them: before a capital that follows a
 * lowercase letter or a digit, and before the last capital of a run of
 * capitals that a lowercase letter follows, so an acronym stays one word
 * (`UIBlockCard` is `ui-block-card`, `HTMLParser` is `html-parser`).
 *
 * @param folder - The component's folder.
 * @returns The component's three spellings.
 * @throws When the folder's name is not PascalCase.
 */
export default function nameComponent(folder: string): ComponentNames {
  const name = basename(folder);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`${folder}: a component folder is named in PascalCase`);
  }
  const words = name
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
  return {
    name,
    kebab: words.replaceAll(" ", "-"),
    snake: words.replaceAll(" ", "_"),
  };
}
