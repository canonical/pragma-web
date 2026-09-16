/**
 * A renderer's field scopes, held while what a scope reads says the same:
 * a heading rebuilt inline reads no scope again, a field narrowed anew does,
 * and the applicability callback keeps one identity across both.
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import type { DisplayField } from "../common/index.js";
import type { UseFieldScopesProps } from "./types.js";
import useFieldScopes from "./useFieldScopes.js";

const withImage = (image: DisplayField): UseFieldScopesProps => ({
  collection: instances,
  fields: [{ id: "name", header: "Name" }, image],
  renderer: "DataTable",
});

describe("useFieldScopes", () => {
  it("holds the scopes while what they read says the same", () => {
    const { result, rerender } = renderHook(
      (props: UseFieldScopesProps) => useFieldScopes(props),
      { initialProps: withImage({ id: "image", header: "Image" }) },
    );
    const first = result.current;
    const image = { id: "image", header: "Image" };
    expect(first.readScope(image).scope).toEqual(["container"]);
    expect(first.decideApplicability(image, "virtual-machine")).toBe(
      "not-applicable",
    );
    rerender(withImage({ id: "image", header: "Container image" }));
    expect(result.current).toBe(first);
    rerender(
      withImage({ id: "image", header: "Image", appliesTo: ["container"] }),
    );
    expect(result.current.readScope).not.toBe(first.readScope);
    expect(result.current.decideApplicability).toBe(first.decideApplicability);
  });
});
