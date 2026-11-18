/**
 * The decorators every story of the package shares: the application scope
 * the parts assume, and the frames a layout or a panel would put them in.
 */

import type { Decorator } from "@storybook/react-vite";
import { renderToString } from "react-dom/server";

/**
 * Render the story inside the `.app` scope, which the table and its bars
 * assume: primary text there takes the application sizes, and the density
 * channel its application values.
 */
export const withAppScope: Decorator = (Story) => (
  <div className="app">
    <Story />
  </div>
);

/** Render the story inside a frame of the given width, as a layout would. */
export const withFrame =
  (maxWidth: string): Decorator =>
  (Story) => (
    <div style={{ maxWidth }}>
      <Story />
    </div>
  );

/** A frame of the given height that scrolls its content, as a panel would. */
export const withScrollingFrame =
  (height: string): Decorator =>
  (Story) => (
    <div style={{ maxHeight: height, overflow: "auto" }}>
      <Story />
    </div>
  );

/** Render the story in a right-to-left context. */
export const withRightToLeft: Decorator = (Story) => (
  <div dir="rtl">
    <Story />
  </div>
);

/**
 * Render the markup a server sends for the story, which no script ever runs
 * over: the story before hydration, or with scripts disabled.
 */
export const withServerMarkup: Decorator = (Story) => (
  <div
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the story's own server markup, rendered from its own element
    dangerouslySetInnerHTML={{ __html: renderToString(<Story />) }}
  />
);
