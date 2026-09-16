/**
 * The cards read their fields' scopes once per held field list, and held
 * the list with headings compared by reference. A caller writing its
 * headings as inline elements re-read and re-checked every field's scope on
 * every render — the defect the table had shed, left in the cards.
 *
 * The cards key their scopes on what a scope is read from alone.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

const calls = vi.hoisted(() => ({ count: 0 }));

vi.mock("../../lib/utils/readFieldScopes.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/utils/readFieldScopes.js")>();
  return {
    default: (...args: Parameters<typeof actual.default>) => {
      calls.count += 1;
      return actual.default(...args);
    },
  };
});

describe("a card heading written as an inline element", () => {
  it("re-reads no scope when the cards render again", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <Cards
          provider={provider}
          fields={[
            { id: "name", header: <span>Name</span> },
            { id: "image", header: <span>Image</span> },
          ]}
          title="name"
          label="Instances"
        />
      );
    };
    render(<Host />);
    const before = calls.count;
    expect(before).toBeGreaterThan(0);
    act(() => {
      rerender();
    });
    expect(calls.count).toBe(before);
  });
});
