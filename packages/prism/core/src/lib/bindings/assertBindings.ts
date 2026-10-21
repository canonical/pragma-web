import { type DocumentNode, Kind, parse } from "graphql";
import type { EntityBinding } from "./types.js";

/**
 * Every object type the schema declares, with the interfaces it implements
 * across its definition and its extensions.
 */
const collectObjectTypes = (
  document: DocumentNode,
): ReadonlyMap<string, ReadonlySet<string>> => {
  const types = new Map<string, Set<string>>();
  for (const definition of document.definitions) {
    if (
      definition.kind !== Kind.OBJECT_TYPE_DEFINITION &&
      definition.kind !== Kind.OBJECT_TYPE_EXTENSION
    ) {
      continue;
    }
    const interfaces = types.get(definition.name.value) ?? new Set<string>();
    // graphql's parser always sets `interfaces`; the node type marks it
    // optional, so the fallback guards hand-built documents.
    /* v8 ignore next -- external boundary: `parse` never omits `interfaces` */
    for (const implemented of definition.interfaces ?? []) {
      interfaces.add(implemented.name.value);
    }
    types.set(definition.name.value, interfaces);
  }
  return types;
};

/**
 * Check `bindings` against the provider's schema, as a site's `check` step
 * does: every binding's id is unique, and every binding's type is an object
 * type the schema declares and that implements `Node`.
 *
 * @param sdl - The provider's schema, in SDL.
 * @param bindings - The site's bindings.
 * @throws When the SDL does not parse, or a binding breaks a rule; the
 *   message names the binding.
 */
export const assertBindings = (
  sdl: string,
  bindings: readonly EntityBinding[],
): void => {
  const types = collectObjectTypes(parse(sdl));
  const seen = new Set<string>();
  for (const { id, typename } of bindings) {
    if (seen.has(id)) {
      throw new Error(`assertBindings: binding "${id}" is declared twice`);
    }
    seen.add(id);
    const interfaces = types.get(typename);
    if (interfaces === undefined) {
      throw new Error(
        `assertBindings: binding "${id}" names type "${typename}", which the schema does not declare`,
      );
    }
    if (!interfaces.has("Node")) {
      throw new Error(
        `assertBindings: binding "${id}" names type "${typename}", which does not implement Node`,
      );
    }
  }
};
