import { useMemo } from "react";
import { useMessages } from "../../i18n/index.js";
import { EntitySource } from "../../ui/EntitySource/index.js";
import { PAGE_RENDERER_NAMES, RENDERER_LABEL_KEYS } from "../constants.js";
import type { PageRendererProps, Renderer } from "../types.js";

/**
 * Core's page renderers, the defaults a site gives every entity page: the
 * page as its lens renders it, and its statements as Turtle, offered only
 * when the provider serves `source`. Labelled in the reader's language.
 *
 * @returns The two renderers, the page first.
 * @note Impure: reads the translator in scope.
 */
export default function usePageRenderers(): readonly Renderer<PageRendererProps>[] {
  const t = useMessages();
  return useMemo(
    () => [
      {
        name: PAGE_RENDERER_NAMES.page,
        label: t(RENDERER_LABEL_KEYS.page),
        render: ({ children }) => children,
      },
      {
        name: PAGE_RENDERER_NAMES.turtle,
        label: t(RENDERER_LABEL_KEYS.turtle),
        render: ({ uri, title }) => <EntitySource title={title} uri={uri} />,
        offered: ({ extensions }) => extensions.has("source"),
      },
    ],
    [t],
  );
}
