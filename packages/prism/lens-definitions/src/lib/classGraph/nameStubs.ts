import { compareText, requireAt, requireEntry } from "@canonical/prism-core";
import { STUB_PREFIXES } from "./constants.js";
import type { StubName } from "./types.js";

/**
 * The prefixes a stub may be named by, shortest first: the well-known
 * vocabulary's own, else its namespace's last path segment (its host's
 * first label when it has none), then each further segment and the host
 * before it, joined by dots, and last the whole namespace, which no other
 * namespace shares.
 */
function listPrefixes(namespace: string): readonly string[] {
  const known = STUB_PREFIXES.get(namespace);
  const [host = "", ...segments] = namespace
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .split(/[#/]/)
    .filter((part) => part !== "");
  const label = host.replace(/^www\./, "").replace(/\..*$/, "");
  const parts = [label, ...segments];
  const spans = parts.map((_, index) =>
    parts.slice(parts.length - 1 - index).join("."),
  );
  return [
    ...new Set([...(known === undefined ? [] : [known]), ...spans, namespace]),
  ];
}

/**
 * Name the classes relations reach in namespaces no ontology loaded, so
 * that no two stubs share a name and none takes a loaded namespace's
 * prefix: each by its local name, after the IRI's last `#` or `/`, under
 * the shortest prefix of those `listPrefixes` gives at which its compact
 * term is its own and its prefix no loaded one. A stub whose name would
 * equal another's, or whose prefix is loaded, takes the next, fuller
 * prefix, until the whole namespace tells it apart, its term then its
 * IRI. An IRI with neither separator is its own term.
 *
 * @param iris - The stubs' IRIs.
 * @param loaded - The loaded namespaces' prefixes.
 * @returns Each stub's prefix, local name and compact term, by IRI.
 */
export default function nameStubs(
  iris: readonly string[],
  loaded: ReadonlySet<string>,
): ReadonlyMap<string, StubName> {
  const stubs = [...new Set(iris)].sort(compareText).map((iri) => {
    const cut = Math.max(iri.lastIndexOf("#"), iri.lastIndexOf("/")) + 1;
    const namespace = iri.slice(0, cut);
    return {
      iri,
      local: iri.slice(cut),
      prefixes: cut === 0 ? [""] : listPrefixes(namespace),
      level: 0,
    };
  });
  const nameOf = (stub: (typeof stubs)[number]): StubName => {
    const prefix = requireAt(stub.prefixes, stub.level);
    return {
      prefix,
      local: stub.local,
      // Under its whole namespace a stub's term is its IRI.
      term:
        prefix === "" || stub.iri === `${prefix}${stub.local}`
          ? stub.iri
          : `${prefix}:${stub.local}`,
    };
  };
  // Each pass moves every stub whose name clashes one prefix on; the last
  // prefix, the whole namespace, never clashes, so it ends.
  for (;;) {
    const terms = new Map<string, number>();
    for (const stub of stubs) {
      const { term } = nameOf(stub);
      terms.set(term, (terms.get(term) ?? 0) + 1);
    }
    const clashing = stubs.filter((stub) => {
      const { prefix, term } = nameOf(stub);
      return (
        stub.level < stub.prefixes.length - 1 &&
        (requireEntry(terms, term) > 1 || loaded.has(prefix))
      );
    });
    if (clashing.length === 0) break;
    for (const stub of clashing) stub.level += 1;
  }
  return new Map(stubs.map((stub) => [stub.iri, nameOf(stub)]));
}
