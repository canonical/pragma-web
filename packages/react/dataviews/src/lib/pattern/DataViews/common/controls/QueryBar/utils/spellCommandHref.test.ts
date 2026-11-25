import {
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Machine } from "../../../../../../../../testing/index.js";
import {
  MACHINE_CAPABILITIES,
  machines,
} from "../../../../../../../../testing/machines.js";
import useQueryGroup from "../hooks/useQueryGroup.js";
import spellCommandHref from "./spellCommandHref.js";

/** The query group over a provider with or without a location. */
const readGroup = (href: string | null) => {
  const provider = createDataViewsProvider({
    collection: machines,
    source: createManualSource<Machine>({
      capabilities: MACHINE_CAPABILITIES,
    }).source,
    ...(href === null ? {} : { location: createMemoryLocation({ href }) }),
  });
  return renderHook(() => useQueryGroup(provider as never)).result.current;
};

describe("spellCommandHref", () => {
  it("spells where a command leads, from the query that applies", () => {
    const group = readGroup("/m?status=running&q=web");
    expect(
      spellCommandHref(group, {
        kind: "removePredicate",
        field: "status",
        operator: "isAny",
        nth: 0,
      }),
    ).toBe("?q=web&page=1&size=50");
    expect(spellCommandHref(group, { kind: "setSearch", search: "" })).toBe(
      "?status=running&page=1&size=50",
    );
  });

  it("carries on a clause the source refused, so the query never widens", () => {
    const group = readGroup("/m?status=running&status__isNone=melted");
    expect(
      spellCommandHref(group, { kind: "setSearch", search: "" }),
    ).toContain("status__isNone=melted");
  });

  it("spells nothing without a location", () => {
    expect(
      spellCommandHref(readGroup(null), { kind: "setSearch", search: "" }),
    ).toBeNull();
  });
});
