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
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

const renders = vi.hoisted(() => ({ values: 0 }));

vi.mock("../../lib/common/FieldText/FieldText.js", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../lib/common/FieldText/FieldText.js")
    >();
  return {
    default: (...args: Parameters<typeof actual.default>) => {
      renders.values += 1;
      return actual.default(...args);
    },
  };
});

describe("card headings written as inline elements", () => {
  it("draw no value again when the cards render again", () => {
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
            { id: "status", header: <span>Status</span> },
          ]}
          title="name"
          label="Machines"
        />
      );
    };
    render(<Host />);
    const before = renders.values;
    // Counted at all, so a mock that stopped applying cannot pass unseen.
    expect(before).toBeGreaterThan(0);
    act(() => {
      rerender();
    });
    expect(renders.values).toBe(before);
  });
});
