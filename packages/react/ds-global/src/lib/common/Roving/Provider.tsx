import type { ReactElement } from "react";
import Context from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { RovingProviderProps } from "./types.js";

/**
 * Shares one roving tab stop among the items of a composite, such as the
 * segments and chips of a query input's toolbar. The host owns the stop: it
 * says which item holds it, hears when an item claims it, and moves it with
 * the arrow keys. It renders no element of its own.
 *
 * `import { RovingProvider } from "@canonical/react-ds-global";`
 */
const Provider = ({
  children,
  ...props
}: RovingProviderProps): ReactElement => {
  const state = useProviderState(props);
  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export default Provider;
