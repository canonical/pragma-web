import { Button } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import type { IconButtonStandInProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds icon-button";

/**
 * A private copy of the design system's IconButton, which is not released
 * yet: a Button with one icon and no visible label, and IconButton's sheet.
 */
export default function IconButtonStandIn({
  className,
  ...props
}: IconButtonStandInProps): ReactElement {
  return (
    <Button
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
