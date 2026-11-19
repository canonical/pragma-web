import type React from "react";
import { Button } from "../../component/Button/index.js";
import type { IconButtonStandInProps } from "./types.js";

const componentCssClassName = "ds icon-button";

/**
 * A private stand-in for IconButton, which is not on the main branch yet. It
 * renders what IconButton renders, a Button with the `icon-button` class, and
 * its props are IconButton's. It carries no stylesheet, so it draws Button's
 * box. It is not exported from the package, and it is deleted once IconButton
 * lands.
 */
export default function IconButtonStandIn({
  className,
  ...props
}: IconButtonStandInProps): React.ReactElement {
  return (
    <Button
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
