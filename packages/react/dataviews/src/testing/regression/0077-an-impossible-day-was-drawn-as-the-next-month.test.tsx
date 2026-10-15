/**
 * A date the calendar does not have, such as the thirtieth of February, was
 * read with `Date.parse`, which some engines roll into the next month: the
 * event was drawn on the first of March. The timeline reads a date as the
 * core orders it, and a day the calendar does not have is no instant.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_MAPPING,
  activity,
  createActivityProvider,
} from "../../../testing/activities.js";
import { Timeline } from "../../lib/_work_in_progress/Timeline/index.js";

describe("an event on a day the calendar does not have", () => {
  it("is drawn without a date, never on another day", () => {
    const { provider } = createActivityProvider({
      rows: [{ ...activity("a-1", 1), at: "2024-02-30T09:00:00Z" }],
    });
    const { container } = render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
      />,
    );
    expect(container.querySelector(".data-timeline-event")).not.toBeNull();
    expect(container.querySelector("time")).toBeNull();
    expect(container.textContent).not.toMatch(/Mar/u);
  });
});
