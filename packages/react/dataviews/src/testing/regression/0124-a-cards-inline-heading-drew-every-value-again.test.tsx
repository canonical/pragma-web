/**
 * A card draws each field's heading, so a heading rebuilt inline draws the
 * card again. Each of its values was handed the whole field and compared it
 * by reference, so every value on every card drew again too, a field's own
 * content included, though a value draws no heading.
 *
 * A value compares the field by what it reads of it.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

describe("card headings written as inline elements", () => {
  it("draw no value again when the cards render again", () => {
    const renders: string[] = [];
    const Probe = ({ rowId }: DisplayFieldCellProps) => {
      renders.push(rowId);
      return null;
    };
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <Cards
          provider={provider}
          fields={[
            { id: "name", header: <span>Name</span> },
            { id: "status", header: <span>Status</span>, cell: Probe },
          ]}
          title="name"
          label="Machines"
        />
      );
    };
    render(<Host />);
    expect(renders.length).toBeGreaterThan(0);
    renders.length = 0;
    act(() => {
      rerender();
    });
    expect(renders).toEqual([]);
  });
});
