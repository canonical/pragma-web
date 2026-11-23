import type { Decorator } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

/**
 * Render the markup a server sends for the story, which no script ever runs
 * over: the story before hydration, or with scripts disabled.
 */
export default function withServerMarkup(
  Story: Parameters<Decorator>[0],
): ReactElement {
  return (
    <div
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the story's own server markup, rendered from its own element
      dangerouslySetInnerHTML={{ __html: renderToString(<Story />) }}
    />
  );
}
