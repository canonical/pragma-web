import type { ComponentProps } from "react";
import type { StandardProse_body$key } from "../../../../__generated__/StandardProse_body.graphql.js";

type OwnProps = {
  /** Fragment ref of the standard's prose. */
  readonly body: StandardProse_body$key;
};

/** Props accepted by `StandardProse`: the prose, and the native props of its
 * root `<div>`. */
export type StandardProseProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
