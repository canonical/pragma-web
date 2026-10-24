import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { AccountLayout } from "./lib/AccountLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `AccountLayout`. */
export default wrapper<ReactElement>({
  id: "account-layout",
  component: AccountLayout,
});
