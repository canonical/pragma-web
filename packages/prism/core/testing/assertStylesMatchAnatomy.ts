import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type Edge,
  type Node,
  parseStyleValue,
  type Specification,
  type Style,
} from "@canonical/anatomy-dsl";
import {
  CAMEL_LIFTS,
  LINK_QUALIFIERS,
  MODIFIER_ROLE,
  PROPERTY_KEYS,
  REFLOW_KEY_FAMILIES,
  SHORTHAND_PROPERTIES,
  STATE_SELECTORS,
  UNKEYED_PROPERTIES,
} from "./constants.js";
import nameComponent from "./nameComponent.js";
import parseStylesheet from "./parseStylesheet.js";
import readStyleValue from "./readStyleValue.js";
import splitTopLevel from "./splitTopLevel.js";
import type { StyleRule } from "./types.js";

/** One element of a value's fallback order, written `symbol:…` or `primitive:…`. */
type ElementText = string;

/** Where a selector lands: the anatomy slot (`""` for the root) and state. */
interface Target {
  readonly slot: string;
  readonly state: string;
  readonly reflow: boolean;
}

/** What a stylesheet's values are read against. */
interface ValueContext {
  /** The component tokens the root declares, by name. */
  readonly tokens: ReadonlyMap<string, string>;
  /** The inline custom properties the component's props file names. */
  readonly channels: readonly string[];
  /** The prefix of the component's own custom properties. */
  readonly prefix: string;
  /** Where a problem with a value is recorded. */
  readonly problems: string[];
}

/**
 * Write a literal the way it is compared: whitespace collapsed, and none
 * inside a function's parentheses, so a value a formatter wrapped over
 * lines reads the same as one written on a single line.
 */
function normaliseLiteral(text: string): string {
  return text
    .replaceAll(/\s+/g, " ")
    .replaceAll("( ", "(")
    .replaceAll(" )", ")")
    .trim();
}

/** The key a slot and a state are tabulated under. */
function formatPlace(slot: string, state: string): string {
  return `${slot === "" ? "root" : `.${slot}`}${state === "" ? "" : `@${state}`}`;
}

/**
 * Lift a custom property's name to the token symbol it spells:
 * `--color-text-muted` is `color.text.muted`.
 */
function liftSymbol(name: string): string {
  const spelled = CAMEL_LIFTS.reduce(
    (text, [hyphenated, camel]) => text.replaceAll(hyphenated, camel),
    name.slice(2),
  );
  return spelled.replaceAll("-", ".");
}

/**
 * Read the modifier class a node's role names, `.is-faded` for the role
 * `faded node (.is-faded)`, or `""` when the role names none or the node is
 * a named component.
 */
function readModifier(node: Node): string {
  if (node.type !== "anonymous") return "";
  return MODIFIER_ROLE.exec(node.role)?.at(1) ?? "";
}

/**
 * Collect the styles of every slot of an anatomy, the root under `""`: a
 * slot is an edge's `slotName`, and a switch's cases share their edge's
 * slot. A case whose role ends in a modifier class in parentheses holds the
 * styles the slot takes with that class, filed under the slot and the class
 * (`node.is-faded`).
 */
function collectSlots(root: Node): Map<string, Style[]> {
  const slots = new Map<string, Style[]>([["", [...(root.styles ?? [])]]]);
  const visit = (node: Node): void => {
    for (const edge of node.edges ?? []) {
      const nodes = listEdgeTargets(edge);
      const slot = edge.relation.slotName;
      if (slot !== undefined) {
        for (const child of nodes) {
          const key = `${slot}${readModifier(child)}`;
          slots.set(key, [...(slots.get(key) ?? []), ...(child.styles ?? [])]);
        }
      }
      nodes.forEach(visit);
    }
  };
  visit(root);
  return slots;
}

/**
 * Name the class a node is addressed by in a child chain: the slot name its
 * edge gives it, else its role in kebab case. A published component placed
 * without a slot name has none, and no chain passes through it.
 */
function nameNodeClass(edge: Edge, node: Node): string | undefined {
  if (edge.relation.slotName !== undefined) return edge.relation.slotName;
  return node.type === "anonymous"
    ? node.role.trim().toLowerCase().replaceAll(/\s+/g, "-")
    : undefined;
}

/**
 * Collect the path of every slot of an anatomy: the classes of the nodes
 * between the root and the slot, in order, the slot's own left out. A child
 * chain that reaches the slot through child combinators names exactly these.
 */
function collectSlotPaths(root: Node): Map<string, string[]> {
  const paths = new Map<string, string[]>();
  const visit = (node: Node, path: readonly string[]): void => {
    for (const edge of node.edges ?? []) {
      for (const child of listEdgeTargets(edge)) {
        const slot = edge.relation.slotName;
        if (slot !== undefined && !paths.has(slot)) paths.set(slot, [...path]);
        visit(child, [...path, nameNodeClass(edge, child) ?? ""]);
      }
    }
  };
  visit(root, []);
  return paths;
}

/** List the nodes an edge places: its node, or every case of its switch. */
function listEdgeTargets(edge: Edge): Node[] {
  const { target } = edge;
  return "cases" in target ? target.cases.map(({ node }) => node) : [target];
}

/** Write an anatomy style's value as its elements, in fallback order. */
function readAnatomyElements(style: Style): ElementText[] {
  return parseStyleValue(readStyleValue(style), style.key).elements.map(
    ({ kind, text }) => `${kind}:${normaliseLiteral(text)}`,
  );
}

/**
 * Find the parenthesis that closes the one opened at `open`, or -1 when it
 * is never closed.
 */
function findClosingParenthesis(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    const character = text.at(index);
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (depth === 0) return index;
  }
  return -1;
}

/**
 * Record a problem for every custom property a value reads that carries the
 * component's prefix and is neither a token its root declares nor an inline
 * channel its props file names.
 *
 * @note Impure: appends to the context's problems.
 */
function checkOwnReads(value: string, context: ValueContext): void {
  for (const match of value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
    const name = match.at(1) ?? "";
    if (
      name.startsWith(context.prefix) &&
      !context.tokens.has(name) &&
      !context.channels.includes(name)
    ) {
      context.problems.push(
        `reads ${name}, which is neither declared on the root nor an inline channel`,
      );
    }
  }
}

/**
 * Read a CSS value as its fallback order: a `var()` chain lifts each
 * custom property to its symbol and ends in its literal, a component token
 * the root declares is followed to its own value, and any other value is
 * one literal, compared as written.
 *
 * @note Impure: appends a problem for each read it cannot place.
 */
function readCssElements(value: string, context: ValueContext): ElementText[] {
  const text = value.trim();
  const isWholeVar =
    text.startsWith("var(") &&
    findClosingParenthesis(text, 3) === text.length - 1;
  if (!isWholeVar) {
    checkOwnReads(text, context);
    return [`primitive:${normaliseLiteral(text)}`];
  }
  const inner = text.slice(4, -1);
  const comma = inner.indexOf(",");
  const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma === -1 ? undefined : inner.slice(comma + 1);
  const declared = context.tokens.get(name);
  if (declared !== undefined) {
    return readCssElements(declared, context);
  }
  checkOwnReads(`var(${name})`, context);
  return [
    `symbol:${liftSymbol(name)}`,
    ...(fallback === undefined ? [] : readCssElements(fallback, context)),
  ];
}

/**
 * Strip every `:has(…)` and `:not(…)` from a compound selector: a root
 * qualified by what it holds is a reflow, not a state.
 */
function stripStructuralQualifiers(compound: string): string {
  const match = /:(?:has|not)\(/.exec(compound);
  if (match === null) return compound;
  const end = findClosingParenthesis(
    compound,
    match.index + (match.at(0) ?? "").length - 1,
  );
  return stripStructuralQualifiers(
    compound.slice(0, match.index) + compound.slice(end + 1),
  );
}

/** Strip the link qualifiers from a compound's suffix: they name no state. */
function stripLinkQualifiers(suffix: string): string {
  return LINK_QUALIFIERS.reduce(
    (rest, qualifier) => rest.replace(qualifier, ""),
    suffix,
  );
}

/**
 * Map a selector to the anatomy slot and state it styles, or describe why it
 * maps to none. The root is `.ds.<kebab>`, optionally qualified by `[href]`
 * and re-flowed by `:has(…)`; a child is one further compound, `.<slot>`,
 * whether a descendant or a child combinator reaches it, or the slot's whole
 * path from the root through child combinators, one role class per node the
 * anatomy places between them, so a rule reaches nothing a slot's content or
 * another slot holds. The slot may carry one modifier class its anatomy
 * declares a case for (`.node.is-faded`, see `MODIFIER_ROLE`) and `[href]`;
 * either may end in one state selector. A root qualified by `:has(…)` or
 * `:not(…)` re-flows.
 */
function mapSelector(
  selector: string,
  kebab: string,
  slots: ReadonlyMap<string, readonly Style[]>,
  paths: ReadonlyMap<string, readonly string[]>,
): Target | string {
  const parts = splitTopLevel(selector.replaceAll(/\s*>\s*/g, " > "), " ");
  const compounds = parts.filter((part) => part !== ">");
  const [first = "", ...children] = compounds;
  const child = children.at(-1);
  const between = children.slice(0, -1);
  const rootClass = `.ds.${kebab}`;
  if (
    !first.startsWith(rootClass) ||
    /^[\w-]/.test(first.slice(rootClass.length))
  ) {
    return `"${selector}" is not rooted at ${rootClass}`;
  }
  const isChildChain = parts.length === compounds.length * 2 - 1;
  if (between.length > 0 && !isChildChain) {
    return `"${selector}" reaches deeper than one child`;
  }
  const qualified = stripStructuralQualifiers(first.slice(rootClass.length));
  const reflow = qualified !== first.slice(rootClass.length);
  const rootSuffix = stripLinkQualifiers(qualified);
  const childMatch =
    child === undefined ? undefined : /^\.([a-z][a-z0-9-]*)(.*)$/.exec(child);
  if (child !== undefined && childMatch === null) {
    return `"${selector}" addresses a child by anything but its role class`;
  }
  const modifier = /^\.[a-z][a-z0-9-]*/.exec(childMatch?.at(2) ?? "")?.at(0) ?? "";
  const slot = `${childMatch?.at(1) ?? ""}${modifier}`;
  const suffix = stripLinkQualifiers(
    (childMatch?.at(2) ?? "").slice(modifier.length),
  );
  if (child !== undefined && rootSuffix !== "") {
    return `"${selector}" puts a state on the root and reaches a child`;
  }
  const stateSelector = child === undefined ? rootSuffix : suffix;
  const state = stateSelector === "" ? "" : STATE_SELECTORS[stateSelector];
  if (state === undefined) {
    return `"${selector}" ends in "${stateSelector}", which is no anatomy state`;
  }
  if (!slots.has(slot)) {
    return `"${selector}" styles .${slot}, which no anatomy slot names`;
  }
  const path = paths.get(childMatch?.at(1) ?? "") ?? [];
  if (
    between.length > 0 &&
    between.map((compound) => compound.slice(1)).join(" ") !== path.join(" ")
  ) {
    return `"${selector}" does not follow the anatomy's path to .${slot}, ${[rootClass, ...path.map((name) => `.${name}`), `.${slot}`].join(" > ")}`;
  }
  return { slot, state, reflow };
}

/**
 * Collect the component tokens the root rule declares: the custom
 * properties of `.ds.<kebab>`, outside any at-rule.
 */
function collectRootTokens(
  rules: readonly StyleRule[],
  kebab: string,
): Map<string, string> {
  return new Map(
    rules
      .filter(
        ({ selectors, conditions }) =>
          conditions.length === 0 &&
          selectors.length === 1 &&
          selectors.at(0) === `.ds.${kebab}`,
      )
      .flatMap(({ declarations }) => declarations)
      .filter(({ property }) => property.startsWith("--"))
      .map(({ property, value }) => [property, value]),
  );
}

/**
 * List the inline custom properties a component's props file names.
 *
 * @note Impure: reads the props file from the file system.
 */
function listChannels(folder: string, prefix: string): string[] {
  const types = join(folder, "types.ts");
  if (!existsSync(types)) return [];
  const pattern = new RegExp(`"(${prefix}[a-z0-9-]+)"`, "g");
  return [...readFileSync(types, "utf8").matchAll(pattern)].map(
    (match) => match.at(1) ?? "",
  );
}

/**
 * Assert a component's `styles.css` transcribes its anatomy: per slot and
 * per state, the stylesheet binds exactly the style keys the anatomy
 * declares, each to the same fallback order. A selector maps to a slot
 * through the role class the slot's `slotName` names; a declaration maps to
 * its style keys through `PROPERTY_KEYS`; a component token the root
 * declares is followed to its value; a `var()` chain is read as its symbols
 * and its terminal literal. Rules under `@container`, and rules that re-flow
 * the root through `:has()` or `:not()`, are reflow: each must style a slot that exists
 * and may only re-value placement, size, spacing, visibility and border
 * width (`REFLOW_KEY_FAMILIES`). Rules under
 * `@media` (the exempt feature queries) and the `:root` block are left to
 * `assertStylesheets`.
 *
 * @param folder - The component's folder.
 * @param specification - The component's anatomy, as `assertAnatomy`
 *   returns it.
 * @throws With every mismatch, one per line, naming the slot, the state, the
 *   key, the stylesheet's value and the anatomy's.
 * @note Impure: reads the stylesheet and the props file from the file
 *   system.
 */
export default function assertStylesMatchAnatomy(
  folder: string,
  specification: Specification,
): void {
  const { kebab } = nameComponent(folder);
  const file = join(folder, "styles.css");
  const slots = collectSlots(specification.root);
  const paths = collectSlotPaths(specification.root);
  const expected = new Map<string, Map<string, string>>();
  for (const [slot, styles] of slots) {
    for (const style of styles) {
      const place = formatPlace(slot, style.state ?? "");
      const table = expected.get(place) ?? new Map<string, string>();
      table.set(style.key, readAnatomyElements(style).join(" → "));
      expected.set(place, table);
    }
  }

  const problems: string[] = [];
  const actual = new Map<string, Map<string, string>>();
  if (existsSync(file)) {
    const { layers, statementCount, rules } = parseStylesheet(
      readFileSync(file, "utf8"),
    );
    if (layers.length !== 1 || statementCount !== 1) {
      problems.push("the stylesheet is not one @layer block");
    }
    const prefix = `--${kebab}-`;
    const context: ValueContext = {
      tokens: collectRootTokens(rules, kebab),
      channels: listChannels(folder, prefix),
      prefix,
      problems,
    };
    for (const rule of rules) {
      if (rule.conditions.some((condition) => condition.startsWith("@media"))) {
        continue;
      }
      if (rule.selectors.length === 1 && rule.selectors.at(0) === ":root") {
        continue;
      }
      const contained = rule.conditions.some((condition) =>
        condition.startsWith("@container"),
      );
      for (const selector of rule.selectors) {
        const target = mapSelector(selector, kebab, slots, paths);
        if (typeof target === "string") {
          problems.push(target);
          continue;
        }
        const reflow = contained || target.reflow;
        const place = formatPlace(target.slot, target.state);
        for (const { property, value } of rule.declarations) {
          if (property.startsWith("--")) {
            if (place !== "root" || reflow || rule.conditions.length > 0) {
              problems.push(`${place}: declares ${property} off the root rule`);
            }
            continue;
          }
          if (UNKEYED_PROPERTIES.includes(property)) continue;
          const keys = PROPERTY_KEYS[property];
          if (keys === undefined) {
            problems.push(`${place}: ${property} binds no style key`);
            continue;
          }
          if (
            SHORTHAND_PROPERTIES.includes(property) &&
            splitTopLevel(value, " ").length > 1
          ) {
            problems.push(`${place}: ${property} sets its longhands apart`);
            continue;
          }
          if (reflow) {
            for (const key of keys) {
              const inFamily = REFLOW_KEY_FAMILIES.some((family) =>
                key.startsWith(family),
              );
              if (!inFamily) {
                problems.push(`${place}: a reflow re-values ${key}`);
              }
            }
            continue;
          }
          const elements = readCssElements(value, context).join(" → ");
          const table = actual.get(place) ?? new Map<string, string>();
          for (const key of keys) {
            if (table.has(key)) {
              problems.push(`${place}: ${key} is bound twice`);
            }
            table.set(key, elements);
          }
          actual.set(place, table);
        }
      }
    }
  }

  for (const place of new Set([...expected.keys(), ...actual.keys()])) {
    const want = expected.get(place) ?? new Map<string, string>();
    const have = actual.get(place) ?? new Map<string, string>();
    for (const key of new Set([...want.keys(), ...have.keys()])) {
      const css = have.get(key);
      const anatomy = want.get(key);
      if (css !== anatomy) {
        problems.push(
          `${place} ${key}: css ${css ?? "(unbound)"}, anatomy ${anatomy ?? "(unbound)"}`,
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `${file} does not match its anatomy:\n${problems.join("\n")}`,
    );
  }
}
