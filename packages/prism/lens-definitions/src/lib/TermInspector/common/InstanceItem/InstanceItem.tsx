import { EntityChip } from "@canonical/prism-projections";
import type React from "react";
import type { InstanceItemProps } from "./types.js";

/**
 * One instance of the class, mentioned as an entity chip: it links to the
 * page the site declares as the home of the instance's type and reads as
 * text where the site declares none. Its compact address follows it, the
 * same `_meta.curie` the chip's link addresses it by; `uri` stays Relay's
 * identity and the list key.
 *
 * `import { InstanceItem } from "../InstanceItem/index.js";`
 */
export default function InstanceItem({
  node,
  ...props
}: InstanceItemProps): React.ReactElement {
  return (
    <li {...props}>
      <EntityChip node={node} />{" "}
      <code className="identifier">{node._meta.curie}</code>
    </li>
  );
}
