/**
 * Whether a field applies to a record was decided by a callback held at one
 * identity that read the latest scopes through a ref written as the renderer
 * rendered. Rows and cards call it while they render, and re-render on their
 * own subscriptions, so a row could read scopes from a renderer's render
 * React never committed — a column list that was discarded — and throw for
 * a column its scopes were never read for, or decide by types never shown.
 *
 * The decision is a callback over the scopes it reads: an earlier decision
 * answers from the scopes it was made over.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import type { DisplayField } from "../../lib/common/index.js";
import type { UseFieldScopesProps } from "../../lib/hooks/types.js";
import useFieldScopes from "../../lib/hooks/useFieldScopes.js";

const over = (name: DisplayField): UseFieldScopesProps => ({
  collection: instances,
  fields: [name],
  renderer: "DataTable",
});

describe("a decision whether a field applies", () => {
  it("answers from the scopes it was made over, not from later ones", () => {
    const name = { id: "name", header: "Name" };
    const { result, rerender } = renderHook(
      (props: UseFieldScopesProps) => useFieldScopes(props),
      { initialProps: over(name) },
    );
    const earlier = result.current.decideApplicability;
    expect(earlier(name, "virtual-machine")).toBe("applies");
    rerender(over({ ...name, appliesTo: ["container"] }));
    expect(result.current.decideApplicability(name, "virtual-machine")).toBe(
      "not-applicable",
    );
    // Still the scopes it was made over.
    expect(earlier(name, "virtual-machine")).toBe("applies");
  });
});
