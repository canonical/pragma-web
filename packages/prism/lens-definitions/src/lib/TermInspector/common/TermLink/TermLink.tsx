import { Link } from "@canonical/router-react";
import type React from "react";
import compactUri from "../../../compactUri.js";
import type { TermLinkProps } from "./types.js";

/**
 * A term link for a related class/property, labelled by the graph.
 *
 * `import { TermLink } from "../TermLink/index.js";`
 */
export default function TermLink({
  uri,
  label,
  namespaces,
}: TermLinkProps): React.ReactElement {
  const prefixed = compactUri(uri, namespaces);
  return (
    <Link params={{ term: prefixed }} to="definitionsTerm">
      {label ?? prefixed}
    </Link>
  );
}
