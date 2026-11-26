import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createQuickFilterProvider } from "../../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../Provider.js";
import { useQueryGroup } from "../../../../hooks/index.js";
import TypedInput from "./TypedInput.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** The memory's lower bound, with a separator of `,`, as the server draws it. */
function Host({
  provider,
  named,
}: {
  readonly provider: Provider;
  readonly named: boolean;
}) {
  const group = useQueryGroup({ provider });
  return (
    <TypedInput
      definition={
        provider.collection.schema.findField("memory") as Extract<
          SchemaFieldDefinition,
          { readonly kind: "number" }
        >
      }
      operator="gte"
      label="memory from"
      standing={{
        predicate: { field: "memory", operator: "gte", operands: [1536] },
        ref: { field: "memory", operator: "gte", nth: 0 },
      }}
      group={group}
      named={named}
      onCommit={() => undefined}
      onInvalid={() => undefined}
    />
  );
}

const renderInput = (named: boolean): string => {
  const provider = createQuickFilterProvider() as unknown as Provider;
  return renderToString(
    <DataViews provider={provider} messages={{ decimalSeparator: "," }}>
      <Host provider={provider} named={named} />
    </DataViews>,
  );
};

describe("TypedInput SSR", () => {
  it("shows a number with a point in a form, as the wire reads it", () => {
    expect(renderInput(true)).toMatch(/value="1\.5.GiB"/);
  });

  it("shows it with the reader's separator outside a form", () => {
    expect(renderInput(false)).toMatch(/value="1,5.GiB"/);
  });
});
