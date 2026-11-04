import type { ListRendererProps, Renderer } from "@canonical/prism-core";
import { useMemo } from "react";
import { useMessages } from "../i18n/index.js";
import {
  ENTITY_LIST_RENDERERS,
  RENDERER_LABEL_KEYS,
} from "../ui/EntityList/constants.js";
import { EntityList } from "../ui/index.js";

/**
 * The list renderers a site gives every index by default: the table (the
 * rows) and the cards, in that order, each drawing the index's items in
 * the shared `EntityList`. Labelled in the reader's language.
 *
 * @returns The two renderers, the table first.
 * @note Impure: reads the translator in scope.
 */
export default function useListRenderers(): readonly Renderer<ListRendererProps>[] {
  const t = useMessages();
  return useMemo(
    () =>
      ENTITY_LIST_RENDERERS.map((name) => ({
        name,
        label: t(RENDERER_LABEL_KEYS[name]),
        render: ({ children, empty }: ListRendererProps) => (
          <EntityList empty={empty} renderer={name}>
            {children}
          </EntityList>
        ),
      })),
    [t],
  );
}
