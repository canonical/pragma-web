// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import splitPassage from "./splitPassage.js";
import type { SearchPassageProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-passage";

/**
 * The passage of a search result that holds the text, on one muted line,
 * each run of the text in it marked.
 *
 * `import { SearchPassage } from "@canonical/prism-projections";`
 *
 * @implements prism.component.search_passage
 */
export default function SearchPassage({
  passage,
  ranges,
  className,
  ...props
}: SearchPassageProps): ReactElement {
  return (
    <p
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {splitPassage(passage, ranges).map((piece) =>
        piece.matched ? (
          <mark className="match" key={piece.start}>
            {piece.text}
          </mark>
        ) : (
          <span key={piece.start}>{piece.text}</span>
        ),
      )}
    </p>
  );
}
