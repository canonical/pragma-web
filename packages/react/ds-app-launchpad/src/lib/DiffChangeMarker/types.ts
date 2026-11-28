/* @canonical/generator-ds 0.9.0-experimental.12 */
import type { ComponentProps } from "react";

export type DiffChangeAutoOptions = {
  deletions: number;
  additions: number;
};

export type DiffChangeType = "added" | "deleted" | "modified";

export type DiffChangeManualOptions = {
  type: DiffChangeType;
};

export type MarkerOptions = {
  markerStyle: "detailed" | "simple";
};

type OwnProps = MarkerOptions &
  (DiffChangeAutoOptions | DiffChangeManualOptions);

export type DiffChangeMarkerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
