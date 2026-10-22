import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { componentLayerFor } from "@canonical/summon-core";
import {
  COMPONENT_PLACEMENTS,
  COMPONENT_SUBFOLDERS,
  GENERATOR_BANNER,
  NO_ELEMENT_EXEMPTION,
} from "./constants.js";
import nameComponent from "./nameComponent.js";
import type { AssertScaffoldOptions } from "./types.js";

/**
 * Read a file of the folder, or `undefined` when it does not exist.
 *
 * @note Impure: reads the file system.
 */
function readOptional(folder: string, file: string): string | undefined {
  const path = join(folder, file);
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

/**
 * Read the package's name from the `package.json` at its root.
 *
 * @note Impure: reads the file system.
 */
function readPackageName(packageRoot: string): string {
  const manifest: unknown = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );
  const name = (manifest as { readonly name?: unknown }).name;
  if (typeof name !== "string") {
    throw new Error(`${packageRoot}/package.json names no package`);
  }
  return name;
}

/**
 * Assert a component folder has the shape the React component generator
 * scaffolds, and sits where components are placed: the folder is
 * `src/lib/ui/<Name>` or `src/domains/<subject>/lib/<Name>` with a
 * PascalCase name; `<Name>.tsx` opens with the generator's banner, defines
 * `componentCssClassName` as `"ds <kebab>"`, has a default export and
 * imports its stylesheet exactly when there is one; `types.ts` writes
 * `<Name>Props` as `OwnProps & Omit<ComponentProps<…>, keyof OwnProps…>`
 * (or a union of such intersections, one per root element), or states in one line that the component renders no element of its own
 * (then no class name is asked for); `index.ts` re-exports the default
 * export and every type; the anatomy, the test and the SSR test are
 * present, and the stories exactly when the package runs Storybook; a
 * stylesheet opens with the generator's banner, the layer comment and the
 * package's layer, then the root rule; and the only subfolders are
 * `common/` and `hooks/`.
 *
 * @param folder - The component's folder.
 * @param options - The package root and the package's test suffix.
 * @throws With every problem found, one per line.
 * @note Impure: reads the folder and the package manifest from the file
 *   system.
 */
export default function assertScaffold(
  folder: string,
  { packageRoot, testSuffix }: AssertScaffoldOptions,
): void {
  const { name, kebab } = nameComponent(folder);
  const problems: string[] = [];
  const placement = relative(packageRoot, folder).split(sep).join("/");
  if (!COMPONENT_PLACEMENTS.some((pattern) => pattern.test(placement))) {
    problems.push(`${placement} is not a component placement`);
  }

  const types = readOptional(folder, "types.ts") ?? "";
  const rendersNoElement = types.includes(NO_ELEMENT_EXEMPTION);
  // One intersection, or a union of them when the root element depends on
  // a prop: each extends the native props of its root, its own keys first.
  const declaresProps = new RegExp(`export type ${name}Props\\b`).test(types);
  const extendsRoot =
    /OwnProps(?:<[^>]*>)? &/.test(types) &&
    /Omit<\s*ComponentProps<"[a-z]+">,\s*keyof OwnProps/.test(types);
  if (!rendersNoElement && !(declaresProps && extendsRoot)) {
    problems.push(
      `types.ts does not write ${name}Props as OwnProps & Omit<ComponentProps<…>, keyof OwnProps>`,
    );
  }

  const source = readOptional(folder, `${name}.tsx`);
  const stylesheet = readOptional(folder, "styles.css");
  if (source === undefined) {
    problems.push(`${name}.tsx is missing`);
  } else {
    if (!GENERATOR_BANNER.test(source)) {
      problems.push(`${name}.tsx does not open with the generator's banner`);
    }
    if (
      !rendersNoElement &&
      !source.includes(`const componentCssClassName = "ds ${kebab}"`)
    ) {
      problems.push(
        `${name}.tsx does not define componentCssClassName as "ds ${kebab}"`,
      );
    }
    if (!/^export default /m.test(source)) {
      problems.push(`${name}.tsx has no default export`);
    }
    if (
      source.includes('import "./styles.css";') !==
      (stylesheet !== undefined)
    ) {
      problems.push(
        `${name}.tsx imports styles.css if and only if there is one`,
      );
    }
  }

  const barrel = readOptional(folder, "index.ts") ?? "";
  for (const line of [
    `export { default as ${name} } from "./${name}.js";`,
    'export type * from "./types.js";',
  ]) {
    if (!barrel.includes(line)) {
      problems.push(`index.ts does not hold: ${line}`);
    }
  }

  const storybook = existsSync(join(packageRoot, ".storybook"));
  const required = [
    "anatomy.yaml",
    `${name}.${testSuffix}.tsx`,
    `${name}.ssr.${testSuffix}.tsx`,
    ...(storybook ? [`${name}.stories.tsx`] : []),
  ];
  for (const file of required) {
    if (!existsSync(join(folder, file))) problems.push(`${file} is missing`);
  }
  if (!storybook && existsSync(join(folder, `${name}.stories.tsx`))) {
    problems.push(
      `${name}.stories.tsx is there, and the package runs no Storybook`,
    );
  }

  if (stylesheet !== undefined) {
    const layer = componentLayerFor(readPackageName(packageRoot));
    const opening = [
      /^\/\* Generated by @canonical\/summon-component:react v\d+\.\d+\.\d+ \*\/\s*/,
      new RegExp(
        `^/\\* Layer: ${layer.replaceAll(".", "\\.")} \\(@canonical/styles README, "Cascade layers"\\)\\. \\*/\\s*`,
      ),
      new RegExp(`^@layer ${layer.replaceAll(".", "\\.")} \\{\\s*`),
      new RegExp(`^(?:/\\*(?:(?!\\*/)[\\s\\S])*\\*/\\s*)*\\.ds\\.${kebab} \\{`),
    ];
    opening.reduce((rest, pattern) => {
      const match = pattern.exec(rest);
      if (match === null) {
        problems.push(
          `styles.css does not open as the generator writes it (${pattern.source})`,
        );
        return rest;
      }
      return rest.slice((match.at(0) ?? "").length);
    }, stylesheet);
  }

  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.isDirectory() && !COMPONENT_SUBFOLDERS.includes(entry.name)) {
      problems.push(`${entry.name}/ is not a component subfolder`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`${folder} is not scaffolded:\n${problems.join("\n")}`);
  }
}
