import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { PlaygroundLayout } from "./PlaygroundLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `PlaygroundLayout`. */
export default wrapper<ReactElement>({
  id: "playground-layout",
  component: PlaygroundLayout,
});
