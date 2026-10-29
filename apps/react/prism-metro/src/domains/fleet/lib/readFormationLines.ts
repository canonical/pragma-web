import { graphql, readInlineData } from "react-relay";
import type { readFormationLines_formation$key } from "#relay/__generated__/readFormationLines_formation.graphql.js";
import readFormationLinesFragmentNode from "#relay/__generated__/readFormationLines_formation.graphql.js";
import type { PlatformLine } from "../types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * What the platform fit reads of a formation: the lines run with it, each
 * with the stops it serves and their shortest platforms.
 */
const declareFormationLinesFragment = (): unknown => graphql`
  fragment readFormationLines_formation on Formation @inline {
    lines {
      code
      _meta {
        title
      }
      servedBy {
        platformLength
        _meta {
          title
        }
      }
    }
  }
`;
void declareFormationLinesFragment;
/* v8 ignore stop */

/**
 * Read the lines a formation runs on, each with the stops it serves, for
 * the formation's platform fit.
 *
 * @param formation - The formation, as a key of
 *   `readFormationLines_formation`.
 * @returns The lines, in the order the graph gives them.
 */
export default function readFormationLines(
  formation: readFormationLines_formation$key,
): readonly PlatformLine[] {
  const { lines } = readInlineData(readFormationLinesFragmentNode, formation);
  return lines.map(({ code, _meta, servedBy }) => ({
    title: _meta.title,
    code,
    stops: servedBy.map((stop) => ({
      title: stop._meta.title,
      // A nullable field at the graph's boundary: unknown stays unknown.
      platformLength: stop.platformLength ?? null,
    })),
  }));
}
