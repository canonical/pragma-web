import { STUB_PREFIXES } from "./constants.js";

/**
 * Name a class a relation reaches in a namespace no ontology loaded: its
 * local name, after the IRI's last `#` or `/`, under a prefix that is the
 * W3C vocabulary's own, else the namespace's last path segment, else its
 * host's first label (`https://dt.canonical.com/TokenSymbol` is
 * `dt:TokenSymbol`). An IRI with neither separator is its own term.
 *
 * @param iri - The class's full IRI.
 * @returns Its prefix, its local name and its compact term.
 */
export default function nameStub(iri: string): {
  readonly prefix: string;
  readonly local: string;
  readonly term: string;
} {
  const cut = Math.max(iri.lastIndexOf("#"), iri.lastIndexOf("/")) + 1;
  const namespace = iri.slice(0, cut);
  const local = iri.slice(cut);
  const [host = "", ...segments] = namespace
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .split(/[#/]/)
    .filter((part) => part !== "");
  const prefix =
    STUB_PREFIXES.get(namespace) ??
    segments.at(-1) ??
    host.replace(/\..*$/, "");
  return { prefix, local, term: prefix === "" ? local : `${prefix}:${local}` };
}
