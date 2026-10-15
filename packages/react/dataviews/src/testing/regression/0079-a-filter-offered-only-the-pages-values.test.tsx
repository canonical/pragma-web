/**
 * A timeline's actor filter offered the actors found on the events it was
 * handed: on a page holding only one actor's events, no other actor could
 * be chosen, though the collection held them. The filter's choices are now
 * the source's facet values over the whole matching collection.
 */

import { createPage } from "@canonical/dataviews-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_MAPPING,
  activity,
  createActivityProvider,
} from "../../../testing/activities.js";
import { countExactly } from "../../../testing/fixtures.js";
import { Timeline } from "../../lib/_work_in_progress/Timeline/index.js";

describe("a page holding one actor's events", () => {
  it("offers every actor the collection holds", () => {
    const { provider } = createActivityProvider({
      answer: () =>
        createPage({
          rows: [activity("a-1", 1, "jane")],
          matched: 3,
          total: 3,
          facets: {
            actor: {
              kind: "values",
              values: [
                { value: "jane", count: countExactly(1) },
                { value: "john", count: countExactly(2) },
              ],
            },
          },
        }),
    });
    render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actor" }));
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Jane Doe", "john"]);
  });
});
