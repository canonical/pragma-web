import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useDataViewsRoot } from "../src/lib/_work_in_progress/DataViews/hooks/index.js";
import DataViews from "../src/lib/_work_in_progress/DataViews/Provider.js";
import createMachineProvider from "./createMachineProvider.js";
import type { MachineProviderConfig, RootedHook } from "./types.js";

/**
 * Render a hook inside a DataViews root over a fresh machine provider, as
 * a connected part reads it: through the root's provider. Answers the
 * fixture, the rendered hook, and how many times the hook has rendered.
 *
 * @note Impure: renders into the document, and the root observes the
 * provider while it is mounted.
 */
export default function renderInRoot<TResult>(
  part: string,
  read: (
    provider: DataViewsProvider<readonly SchemaFieldDefinition[]>,
  ) => TResult,
  config: MachineProviderConfig = {},
): RootedHook<TResult> {
  const fixture = createMachineProvider(config);
  let renders = 0;
  const hook = renderHook(
    () => {
      renders += 1;
      const { provider } = useDataViewsRoot(part);
      return read(provider);
    },
    {
      wrapper: ({ children }: { readonly children: ReactNode }) => (
        <DataViews provider={fixture.provider}>{children}</DataViews>
      ),
    },
  );
  return { ...fixture, hook, readRenders: () => renders };
}
