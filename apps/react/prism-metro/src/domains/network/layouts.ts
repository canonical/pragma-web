import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { NetworkLayout } from "./lib/NetworkLayout/index.js";

/**
 * The map's wrapper: the workspace the network lens's map renders in, with
 * the metro rail and the network's lines and stations as its inspector. The
 * station and line pages are documents and render their own archetype, as
 * each reads its aside from its own data.
 */
export const networkLayout = wrapper<ReactElement>({
  id: "network-layout",
  component: NetworkLayout,
});
