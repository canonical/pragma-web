import type { ReactElement } from "react";
import Context from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { QueryEntryProviderProps } from "./types.js";

/**
 * Lets a combobox host, such as a query input with suggestions, drive the
 * query entry among its children: the entry passes its input's props through
 * the host's `getInputProps`, which adds the combobox role, the listbox
 * reference and the key handling. Without a provider the entry is a plain
 * text input. It renders no element of its own.
 *
 * `import { QueryEntryProvider } from "@canonical/react-ds-global";`
 */
const Provider = ({
  children,
  ...props
}: QueryEntryProviderProps): ReactElement => {
  const state = useProviderState(props);
  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export default Provider;
