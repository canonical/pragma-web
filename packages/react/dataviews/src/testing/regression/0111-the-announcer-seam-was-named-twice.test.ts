/**
 * The table's body took the announcer of its UI scope as two props: the
 * function that says an outcome, and the region it is said through. They
 * are one seam, and a table handed one without the other spoke into no
 * region, or placed a region nothing spoke into.
 *
 * The body takes the announcer once, as both.
 */
import type { ReactElement, ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { MachineFields } from "../../../testing/machines.js";
import type { ScopedDataTableProps } from "../../lib/_work_in_progress/DataTable/types.js";
import type { AnnouncerTopic } from "../../lib/common/index.js";

describe("the table body's announcer", () => {
  it("is one prop carrying what speaks and where", () => {
    expectTypeOf<ScopedDataTableProps<MachineFields>>().not.toHaveProperty(
      "announce",
    );
    expectTypeOf<
      ScopedDataTableProps<MachineFields>["announcer"]
    >().toEqualTypeOf<{
      readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
      readonly region: ReactElement | null;
    }>();
  });
});
