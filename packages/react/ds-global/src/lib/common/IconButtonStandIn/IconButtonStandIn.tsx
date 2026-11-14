import type React from "react";
import { Button } from "../../component/Button/index.js";
import type { IconButtonStandInProps } from "./types.js";

/**
 * Private stand-in for IconButton: its props, drawn by Button until
 * IconButton and its sheet land.
 */
export default function IconButtonStandIn(
  props: IconButtonStandInProps,
): React.ReactElement {
  return <Button {...props} />;
}
