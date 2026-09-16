/**
 * A card's value subscribed to its record's type whatever it drew, so a
 * record returning as another type drew every plain text value on the card
 * again, though text reads no type. The table's cells draw from parts that
 * subscribe to what each reads: text to its field, a field's own content to
 * the type besides.
 *
 * A card's value draws from the same parts.
 */

import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  buildContainer,
  buildVirtualMachine,
  createInstanceProvider,
  type Instance,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

const renders = vi.hoisted(() => ({ texts: 0 }));

vi.mock("../../lib/common/FieldText/FieldText.js", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../lib/common/FieldText/FieldText.js")
    >();
  return {
    default: (...args: Parameters<typeof actual.default>) => {
      renders.texts += 1;
      return actual.default(...args);
    },
  };
});

describe("a record returning on a card as another type", () => {
  it("draws no plain value again whose text did not move", () => {
    const { provider, source } = createInstanceProvider();
    const deliver = (rows: readonly Instance[]) => {
      act(() => {
        source.latest().deliver({ status: "succeeded", page: pageOf(rows) });
      });
    };
    render(
      <Cards
        provider={provider}
        fields={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
        ]}
        title="name"
        label="Instances"
      />,
    );
    deliver([buildContainer("i-1", "host-01")]);
    const before = renders.texts;
    // Counted at all, so a mock that stopped applying cannot pass unseen.
    expect(before).toBeGreaterThan(0);
    act(() => {
      provider.refresh();
    });
    deliver([buildVirtualMachine("i-1", "host-01")]);
    expect(renders.texts).toBe(before);
  });
});
