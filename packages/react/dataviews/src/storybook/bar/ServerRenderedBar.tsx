import {
  createArraySource,
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import { type ReactElement, useState } from "react";
import { renderToString } from "react-dom/server";
import QueryBar from "../../lib/pattern/DataViews/common/controls/QueryBar/QueryBar.js";
import DataViews from "../../lib/pattern/DataViews/Provider.js";
import { barMachineCollection, barMachines } from "../machines/index.js";
import pickStoryWords from "../pickStoryWords.js";
import followInFrame from "./followInFrame.js";
import type { ServerRenderedBarProps } from "./types.js";

/**
 * The bar's server markup over the machines, at an address or in memory, in
 * the story's words. A followed link or a submitted form renders, within the
 * frame, the page it leads to. Story-only.
 */
export default function ServerRenderedBar({
  href,
  inlineSize,
  messages,
  ...args
}: ServerRenderedBarProps): ReactElement {
  const words = pickStoryWords({ messages });
  const [markup] = useState(() => {
    const provider = createDataViewsProvider({
      collection: barMachineCollection,
      source: createArraySource({
        rows: barMachines,
        collection: barMachineCollection,
        searchFields: ["hostname"],
      }),
      ...(href === undefined
        ? { snapshot: { query: "status=deployed&q=web", presentation: {} } }
        : { location: createMemoryLocation({ href }) }),
    });
    return renderToString(
      <DataViews provider={provider} {...words}>
        <QueryBar {...args} />
      </DataViews>,
    );
  });
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the frame only re-addresses the server markup's own links and forms, which keep their roles
    // biome-ignore lint/a11y/useKeyWithClickEvents: a link followed by keys fires the same click
    <div
      className="no-scripts"
      style={inlineSize === undefined ? undefined : { inlineSize }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the story shows the server's own markup, before any script takes it over
      dangerouslySetInnerHTML={{ __html: markup }}
      onClick={(event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>(
          "a[href]",
        );
        if (link === null) return;
        event.preventDefault();
        followInFrame(new URL(link.href).search);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        const params = new URLSearchParams();
        for (const [key, value] of data) params.append(key, String(value));
        followInFrame(`?${params.toString()}`);
      }}
    />
  );
}
