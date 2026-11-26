import type { RefCallback } from "react";
import { useMemo, useRef } from "react";
import type { FilterButtonPanelHandle } from "../../../../../../component/FilterButton/index.js";
import type { UseQuickFilterPanelsResult } from "./types.js";

/**
 * Hold each quick filter's panel handle by field, through one ref callback
 * per field that keeps its identity, so a quick filter's props stay the
 * same from render to render; and close every open panel at once.
 *
 * @returns The ref for each field, and the call closing every panel.
 */
export default function useQuickFilterPanels(): UseQuickFilterPanelsResult {
  const handles = useRef(new Map<string, FilterButtonPanelHandle>());
  const refs = useRef(new Map<string, RefCallback<FilterButtonPanelHandle>>());
  return useMemo(
    () => ({
      collectPanel: (field) => {
        const held = refs.current.get(field);
        if (held !== undefined) return held;
        const ref: RefCallback<FilterButtonPanelHandle> = (handle) => {
          if (handle === null) handles.current.delete(field);
          else handles.current.set(field, handle);
        };
        refs.current.set(field, ref);
        return ref;
      },
      // @note Impure: closes the popovers.
      hidePanels: () => {
        for (const handle of handles.current.values()) handle.hide();
      },
    }),
    [],
  );
}
