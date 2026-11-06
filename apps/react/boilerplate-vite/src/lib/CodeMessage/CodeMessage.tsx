import { InlineCode } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import type { CodeMessageProps } from "./types.js";

/**
 * A translated paragraph that names code. The message marks code names with
 * backticks, as Markdown does, and each one renders as the design system's
 * `InlineCode`, so a translator writes a natural sentence and the names stay
 * exactly as they are in the source.
 *
 * `import { CodeMessage } from "#lib/index.js";`
 */
export default function CodeMessage({
  message,
  ...props
}: CodeMessageProps): ReactElement {
  // Splitting on backticks leaves prose at even indexes and code at odd ones.
  const parts = message.split("`");

  return (
    <p {...props}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one message never reorder
          <InlineCode key={index}>{part}</InlineCode>
        ) : (
          part
        ),
      )}
    </p>
  );
}
