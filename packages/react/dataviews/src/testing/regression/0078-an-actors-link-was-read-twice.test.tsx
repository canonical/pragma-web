/**
 * An event whose actor links to a profile drew two links to it: the actor's
 * name and the marker. A reader moving by link or by tab met the same
 * destination twice in a row. The marker's link is now out of the reading
 * and tab order wherever the name beside it already links there.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_MAPPING,
  activity,
  createActivityProvider,
} from "../../../testing/activities.js";
import { Timeline } from "../../lib/_work_in_progress/Timeline/index.js";

describe("an event whose actor links to a profile", () => {
  it("offers the profile once", () => {
    const { provider } = createActivityProvider({
      rows: [activity("a-1", 1)],
    });
    render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        showControls={false}
        decorate={(row) => ({ actorLink: `/people/${row.actor}` })}
      />,
    );
    expect(screen.getAllByRole("link", { name: "Jane Doe" })).toHaveLength(1);
  });
});
