import { basename } from "node:path";
import type { ComponentNames } from "./types.js";

/**
 * Name a component from its folder: the folder's own name, its kebab-case
 * class name and its snake_case URI segment.
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
  const words = name.replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return {
    name,
    kebab: words.replaceAll(" ", "-"),
    snake: words.replaceAll(" ", "_"),
  };
}
