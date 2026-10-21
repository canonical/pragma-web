import { DEFAULT_PROSE_LANG } from "./constants.js";
import { extractReferences } from "./extractReferences.js";
import type {
  ProseBinding,
  ProseCandidate,
  ProseDocument,
  ProseIndex,
} from "./types.js";

/**
 * One entity's prose from its bound candidates, one per language.
 *
 * @throws When no text is in the default language, which is the text every
 * request falls back to.
 */
const buildProseDocument = (
  iri: string,
  texts: ReadonlyMap<string, ProseCandidate>,
  prefixes: Readonly<Record<string, string>>,
): ProseDocument => {
  const fallback = texts.get(DEFAULT_PROSE_LANG);
  if (fallback === undefined) {
    throw new Error(
      `${iri} has prose in ${[...texts.keys()].join(", ")} but none in the default language "${DEFAULT_PROSE_LANG}": add a sidecar whose name carries no language.`,
    );
  }
  const others = [...texts.values()]
    .filter((candidate) => candidate.lang !== DEFAULT_PROSE_LANG)
    .sort((a, b) => Number(a.lang > b.lang) - Number(a.lang < b.lang));
  const ordered = [fallback, ...others];
  return {
    texts: Object.fromEntries(
      ordered.map((candidate) => [candidate.lang, candidate.markdown]),
    ),
    availableLanguages: ordered.map((candidate) => candidate.lang),
    references: [
      ...new Set(
        ordered.flatMap((candidate) =>
          extractReferences(candidate.markdown, prefixes),
        ),
      ),
    ],
  };
};

/**
 * Group the candidates whose IRI the graph describes by the sidecar they
 * were read from.
 *
 * @throws When one sidecar is bound to more than one entity: its name reads
 * more than one way.
 */
const groupBoundByPath = (
  candidates: readonly ProseCandidate[],
  subjects: ReadonlySet<string>,
): ReadonlyMap<string, readonly ProseCandidate[]> => {
  const boundByPath = new Map<string, ProseCandidate[]>();
  for (const candidate of candidates) {
    if (subjects.has(candidate.iri)) {
      boundByPath.set(candidate.path, [
        ...(boundByPath.get(candidate.path) ?? []),
        candidate,
      ]);
    }
  }
  for (const [path, bound] of boundByPath) {
    if (bound.length > 1) {
      throw new Error(
        `prose sidecar ${path} names more than one entity (${bound.map((candidate) => candidate.iri).join(", ")}): rename it so its name reads one way.`,
      );
    }
  }
  return boundByPath;
};

/**
 * Group bound candidates by the entity they describe, one per language.
 *
 * @throws When two sidecars hold the same entity's text in the same language.
 */
const groupTextsByEntity = (
  bound: readonly ProseCandidate[],
): ReadonlyMap<string, ReadonlyMap<string, ProseCandidate>> => {
  const textsByIri = new Map<string, Map<string, ProseCandidate>>();
  for (const candidate of bound) {
    const texts: Map<string, ProseCandidate> =
      textsByIri.get(candidate.iri) ?? new Map();
    const clash = texts.get(candidate.lang);
    if (clash !== undefined) {
      throw new Error(
        `prose sidecars ${clash.path} and ${candidate.path} both hold the "${candidate.lang}" text of ${candidate.iri}: keep one.`,
      );
    }
    texts.set(candidate.lang, candidate);
    textsByIri.set(candidate.iri, texts);
  }
  return textsByIri;
};

/**
 * Bind sidecars to the entities they describe and index their prose.
 *
 * A candidate is bound when its IRI is in `subjects`. Three outcomes cannot
 * be read one way and throw rather than guess: a sidecar bound to more than
 * one entity, two sidecars bound to the same entity in the same language,
 * and an entity with text in some language but none in the default one. A
 * sidecar bound to nothing is not an error; its path is listed so the caller
 * can say so.
 *
 * @param input.sidecars - The paths of every collected sidecar.
 * @param input.candidates - Every reading of every sidecar.
 * @param input.subjects - The candidate IRIs the graph describes.
 * @param input.prefixes - The prefix map references are expanded against.
 * @returns The index, and the sidecars left unbound.
 */
export const indexProse = ({
  sidecars,
  candidates,
  subjects,
  prefixes,
}: {
  readonly sidecars: readonly { readonly path: string }[];
  readonly candidates: readonly ProseCandidate[];
  readonly subjects: ReadonlySet<string>;
  readonly prefixes: Readonly<Record<string, string>>;
}): ProseBinding => {
  const boundByPath = groupBoundByPath(candidates, subjects);
  const textsByIri = groupTextsByEntity([...boundByPath.values()].flat());
  const index: ProseIndex = new Map(
    [...textsByIri].map(([iri, texts]) => [
      iri,
      buildProseDocument(iri, texts, prefixes),
    ]),
  );
  return {
    index,
    unbound: sidecars
      .map((sidecar) => sidecar.path)
      .filter((path) => !boundByPath.has(path)),
  };
};
