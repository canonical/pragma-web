import type { ReactElement } from "react";
import { Fragment } from "react";
import useMessages from "../hooks/useMessages.js";
import { PLACEHOLDER_PATTERN } from "./constants.js";
import type { MessageProps } from "./types.js";

/**
 * Render a sentence that wraps elements as ONE catalog message. The message
 * keeps a `{name}` placeholder where each element goes, so the translator
 * owns the whole sentence: its word order, its punctuation, and where each
 * element sits in it. The translator fills the plain-text placeholders from
 * `values` and leaves the others verbatim; this renders `elements[name]` in
 * place of each of those, and a placeholder no element names stays as text.
 *
 * `import { Message } from "#i18n";`
 */
export default function Message({
  id,
  values,
  elements,
}: MessageProps): ReactElement {
  const t = useMessages();
  const parts = t(id, values).split(PLACEHOLDER_PATTERN);
  // An element is keyed by its placeholder's name and how many times the
  // sentence has named it so far, which stays stable however a translation
  // orders the sentence.
  const occurrences = new Map<string, number>();
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return part === "" ? null : part;
        const element = elements[part];
        if (element === undefined) return `{${part}}`;
        const occurrence = occurrences.get(part) ?? 0;
        occurrences.set(part, occurrence + 1);
        return <Fragment key={`${part}:${occurrence}`}>{element}</Fragment>;
      })}
    </>
  );
}
