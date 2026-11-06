/**
 * The server reads a channel as the client's first render does: the same
 * selection, with nothing held yet for isEqual to compare against.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import createFakeChannel from "../../../testing/createFakeChannel.js";
import createListing from "../../../testing/createListing.js";
import listIds from "../../../testing/listIds.js";
import useDataViewsValue from "./useDataViewsValue.js";

describe("useDataViewsValue on the server", () => {
  it("reads the same value on the server", () => {
    const channel = createFakeChannel(createListing());
    const isEqual = vi.fn(
      (previous: readonly number[], next: readonly number[]) =>
        previous.join() === next.join(),
    );
    const Probe = () => (
      <output>{useDataViewsValue(channel, listIds, isEqual).join(",")}</output>
    );
    expect(renderToString(<Probe />)).toBe("<output>1,2</output>");
    expect(isEqual).not.toHaveBeenCalled();
  });
});
