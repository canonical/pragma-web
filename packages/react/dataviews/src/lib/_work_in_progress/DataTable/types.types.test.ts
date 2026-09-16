/**
 * The table's props: the body takes its announcer as one seam, and a
 * standalone table's footer is an element or nothing.
 */
import type { ReactElement, ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { MachineFields } from "../../../../testing/machines.js";
import type { AnnouncerTopic } from "../../common/index.js";
import type { DataTableProps, ScopedDataTableProps } from "./types.js";

describe("ScopedDataTableProps", () => {
  it("takes the announcer as one prop carrying what speaks and where", () => {
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

describe("DataTableProps", () => {
  it("takes a footer element or nothing", () => {
    expectTypeOf<DataTableProps<MachineFields>["footer"]>().toEqualTypeOf<
      ReactElement | undefined
    >();
  });
});
