/**
 * The root's contracts: the props it mounts with, which are no element's,
 * and the value it installs for its connected parts.
 */
import type {
  DataViewsMessages,
  DataViewsProvider,
  FilterHandles,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { ContextOptions, DataViewsProps } from "./types.js";

type Fields = readonly SchemaFieldDefinition[];

describe("DataViewsProps", () => {
  it("mounts a provider, with words over English and the composition's parts", () => {
    expectTypeOf<DataViewsProps<Fields>["provider"]>().toEqualTypeOf<
      DataViewsProvider<Fields>
    >();
    expectTypeOf<DataViewsProps<Fields>["messages"]>().toEqualTypeOf<
      Partial<DataViewsMessages> | undefined
    >();
    expectTypeOf<DataViewsProps<Fields>["children"]>().toEqualTypeOf<
      ReactNode | undefined
    >();
  });

  it("takes no native props: the root is a context mount, not an element", () => {
    expectTypeOf<DataViewsProps<Fields>>().not.toHaveProperty("className");
  });
});

describe("ContextOptions", () => {
  it("carries the root's own filter records and the words it speaks", () => {
    expectTypeOf<ContextOptions["filters"]>().toEqualTypeOf<
      FilterHandles<Fields>
    >();
    expectTypeOf<
      ContextOptions["messages"]
    >().toEqualTypeOf<DataViewsMessages>();
  });

  it("ends every typing session of the root's records at once", () => {
    expectTypeOf<ContextOptions["endSessions"]>().toEqualTypeOf<() => void>();
  });
});
