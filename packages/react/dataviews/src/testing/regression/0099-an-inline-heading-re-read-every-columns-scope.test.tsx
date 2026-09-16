/**
 * The columns' scopes were keyed on the held column list, which is compared
 * with headings and cells by reference. A caller writing a heading as an
 * inline element — the ordinary case — re-read and re-checked every
 * column's scope on every render, though nothing a scope is read from had
 * moved.
 *
 * The scopes are keyed on what they read: each column's id, field and the
 * types it narrows to.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

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

describe("a heading written as an inline element", () => {
  it("re-reads no scope when the table renders again", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <DataTable
          provider={provider}
          columns={[
            { id: "name", header: <span>Name</span> },
            { id: "image", header: <span>Image</span> },
          ]}
          label="Instances"
        />
      );
    };
    render(<Host />);
    const before = calls.count;
    act(() => {
      rerender();
    });
    expect(calls.count).toBe(before);
  });
});
