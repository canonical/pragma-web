/* @canonical/generator-ds 0.9.0-experimental.12 */

import type { DiffChangeType } from "lib/DiffChangeMarker/types.js";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The type of change this marker represents. */
  changeType: DiffChangeType;
};

export type SimpleChangeMarkerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
