/**
 * The path every collected file is known by: `<package>/<path relative to
 * the package>`, the same for a Turtle source and for its prose sidecars, so
 * a sidecar's directory can be matched against its sources' directories as
 * plain strings.
 */

import { relative, sep } from "node:path";

/**
 * `<label>/<path relative to base>`, with forward slashes on every platform.
 *
 * @param label - The package name the path is filed under.
 * @param base - The package directory.
 * @param full - The file's absolute path, under `base`.
 * @returns The store-visible path.
 */
export const formatStoreVisiblePath = (
  label: string,
  base: string,
  full: string,
): string => `${label}/${relative(base, full).split(sep).join("/")}`;

/**
 * Order two collected files by their store-visible paths. Paths are unique
 * (each root's label is its package name, and `REF_PACKAGES` names each
 * package once), so there is no equal arm.
 *
 * @param a - One collected file.
 * @param b - The other.
 * @returns A negative number when `a` sorts first, else a positive one.
 */
export const compareByPath = (
  a: { readonly path: string },
  b: { readonly path: string },
): number => (a.path < b.path ? -1 : 1);
