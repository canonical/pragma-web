import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import {
  EXEMPT_MEDIA_FEATURES,
  GROUP_THRESHOLDS,
  QUERY_CONTAINER_NAME,
  SHIM_TOKENS,
  SPACE_STEP,
  UNIT_LITERAL,
  UNTHEMABLE_DECLARATIONS,
} from "./constants.js";
import nameComponent from "./nameComponent.js";
import parseStylesheet from "./parseStylesheet.js";
import splitTopLevel from "./splitTopLevel.js";
import type { AssertStylesheetsOptions, StyleRule } from "./types.js";

/**
 * List the files under `directory`, at any depth, that `accept` admits.
 *
 * @note Impure: reads the file system.
 */
function collectFiles(
  directory: string,
  accept: (name: string) => boolean,
): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(full, accept);
    return accept(entry.name) ? [full] : [];
  });
}

/**
 * List the class-shaped words a source's string literals hold: every quoted
 * and template string, split on anything a class name cannot contain.
 */
function listStringWords(source: string): string[] {
  return [...source.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)].flatMap(
    (match) =>
      (match.at(1) ?? match.at(2) ?? match.at(3) ?? "").split(/[^a-z0-9-]+/),
  );
}

/** List the custom properties a value reads, in order. */
function listReads(value: string): string[] {
  return [...value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map(
    (match) => match.at(1) ?? "",
  );
}

/**
 * List the `@container` preludes of a stylesheet with the comment right
 * above each, `undefined` where none is.
 */
function listContainerQueries(
  css: string,
): { readonly prelude: string; readonly comment: string | undefined }[] {
  return [
    ...css.matchAll(
      /(?:\/\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?(@container[^{]*)\{/g,
    ),
  ].map((match) => ({
    prelude: (match.at(2) ?? "").replaceAll(/\s+/g, " ").trim(),
    comment: match.at(1),
  }));
}

/** Describe what is wrong with a `@container` query, if anything. */
function describeContainerProblem(
  prelude: string,
  comment: string | undefined,
): string | undefined {
  const match = new RegExp(
    `^@container ${QUERY_CONTAINER_NAME} \\(width < (\\d+)px\\)$`,
  ).exec(prelude);
  const threshold = Number(match?.at(1));
  const phrase = GROUP_THRESHOLDS[threshold];
  if (match === null || phrase === undefined) {
    return `"${prelude}" is not a whole-group query on the ${QUERY_CONTAINER_NAME}`;
  }
  if (comment === undefined || !comment.includes(phrase)) {
    return `"${prelude}" has no comment naming ${phrase}`;
  }
  return undefined;
}

/**
 * List the selectors of a rule that address an element by its type past
 * the first compound.
 */
function listTypeSelectors(rule: StyleRule): string[] {
  return rule.selectors.filter((selector) =>
    splitTopLevel(selector.replaceAll(/\s*[>+~]\s*/g, " "), " ")
      .slice(1)
      .some((compound) => /^[a-z]/.test(compound)),
  );
}

/** List the classes a selector names, the `ds` namespace left out. */
function listSelectedClasses(selector: string): string[] {
  return [...selector.matchAll(/\.([a-z][a-z0-9-]*)/g)]
    .map((match) => match.at(1) ?? "")
    .filter((name) => name !== "ds");
}

/**
 * Assert a package's component stylesheets keep the rules the design rests
 * on. Each file is one `@layer <layer>` block; nothing reads a
 * `--dimension-*` primitive; every `grid-template-columns` is a subgrid, the
 * shell's grid being a preset class; `@media` queries only the exempt
 * features; `@container` queries only the shell, below a whole number of
 * four-column groups, under a comment naming the count; a `:root` block
 * declares only the document tokens named; a component token is declared on
 * its root rule and once; a rule holds no unit-bearing literal but a zero
 * or an unthemable one, so every length is a token; a `--space-*` step is
 * read only inside a component token; every other read is the component's
 * own, a shim name, the density channel or a named external token; no theme
 * is named; no selector addresses an element by its type; and every class a
 * selector names is written by the component's own sources, unless the
 * selector is one of the named reaches into another component.
 *
 * @param options - The folder, the layer and what the stylesheets may read,
 *   declare at the root and reach.
 * @throws With every problem found, one per line, each with its file.
 * @note Impure: reads the stylesheets and the sources from the file system.
 */
export default function assertStylesheets({
  directory,
  layer,
  externalTokens = [],
  documentTokens = [],
  reaches = [],
}: AssertStylesheetsOptions): void {
  const files = collectFiles(directory, (name) => name.endsWith(".css"));
  const parsed = files.map((file) => {
    const css = readFileSync(file, "utf8");
    return { file, css, sheet: parseStylesheet(css) };
  });
  const rootClasses = new Set(
    parsed.flatMap(({ sheet }) =>
      sheet.rules.flatMap(({ selectors }) =>
        selectors.flatMap((selector) =>
          [...selector.matchAll(/\.ds\.([a-z][a-z0-9-]*)/g)].map(
            (match) => match.at(1) ?? "",
          ),
        ),
      ),
    ),
  );
  const declaredTokens = new Set<string>();
  const problems: string[] = [];

  for (const { file, css, sheet } of parsed) {
    const report = (problem: string): void => {
      problems.push(`${relative(directory, file)}: ${problem}`);
    };
    const { kebab } = nameComponent(dirname(file));
    const rootSelector = `.ds.${kebab}`;
    const prefix = `--${kebab}-`;
    const written = new Set(
      collectFiles(
        dirname(file),
        (name) => /\.tsx?$/.test(name) && !/\.tests?\.tsx?$/.test(name),
      ).flatMap((source) => listStringWords(readFileSync(source, "utf8"))),
    );

    if (sheet.layers.length !== 1 || sheet.statementCount !== 1) {
      report("is not one @layer block");
    }
    if (sheet.layers.some((name) => name !== layer)) {
      report(`paints in @layer ${sheet.layers.join(", ")}, not ${layer}`);
    }
    if (css.includes("--dimension-")) {
      report("reads a --dimension-* primitive");
    }
    if (/\.(?:dark|light)\b|prefers-color-scheme/.test(css)) {
      report("names a theme");
    }
    for (const { prelude, comment } of listContainerQueries(css)) {
      const problem = describeContainerProblem(prelude, comment);
      if (problem !== undefined) report(problem);
    }

    for (const rule of sheet.rules) {
      for (const condition of rule.conditions) {
        if (condition.startsWith("@media")) {
          const residue = EXEMPT_MEDIA_FEATURES.reduce(
            (text, feature) =>
              text.replaceAll(new RegExp(`\\(${feature}[^)]*\\)`, "g"), ""),
            condition,
          );
          if (residue.includes("(")) report(`"${condition}" can reflow layout`);
        }
      }
      for (const selector of listTypeSelectors(rule)) {
        report(`"${selector}" addresses an element by its type`);
      }
      const isDocumentRoot =
        rule.selectors.length === 1 && rule.selectors.at(0) === ":root";
      const isComponentRoot =
        rule.conditions.length === 0 &&
        rule.selectors.length === 1 &&
        rule.selectors.at(0) === rootSelector;

      if (!isDocumentRoot) {
        for (const selector of rule.selectors) {
          if (reaches.includes(selector)) continue;
          for (const name of listSelectedClasses(selector)) {
            if (written.has(name)) continue;
            report(
              rootClasses.has(name)
                ? `"${selector}" reaches another component's .${name}`
                : `"${selector}" selects .${name}, which no source writes`,
            );
          }
        }
      }

      for (const { property, value } of rule.declarations) {
        const isToken = property.startsWith("--");
        if (isDocumentRoot && !documentTokens.includes(property)) {
          report(`:root declares ${property}`);
        }
        if (isToken && !isDocumentRoot) {
          if (!isComponentRoot || !property.startsWith(prefix)) {
            report(`declares ${property} off its root rule ${rootSelector}`);
          }
          if (declaredTokens.has(property)) {
            report(`declares ${property} twice`);
          }
          declaredTokens.add(property);
        }
        if (property === "grid-template-columns" && value !== "subgrid") {
          report(`authors a grid template, "${value}"`);
        }
        if (!isToken) {
          const literals = (value.match(UNIT_LITERAL) ?? []).filter(
            (literal) =>
              !/^-?0(?:\.0+)?[a-z%]*$/.test(literal) &&
              !UNTHEMABLE_DECLARATIONS.includes(literal),
          );
          if (literals.length > 0) {
            report(`${property}: ${value} holds a design literal`);
          }
        }
        for (const read of listReads(value)) {
          if (read.startsWith(prefix)) continue;
          if (SPACE_STEP.test(read)) {
            if (!isToken) report(`${property} reads ${read} outside a token`);
            continue;
          }
          if (!SHIM_TOKENS.includes(read) && !externalTokens.includes(read)) {
            report(`reads ${read}, which is neither the shim nor named`);
          }
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `The stylesheets under ${basename(directory)}:\n${problems.join("\n")}`,
    );
  }
}
