/**
 * The scope reader serves the table's columns and the cards' fields alike,
 * and its errors, like the row-header check's, named "column" and "the
 * table" whatever renderer mounted: a card field naming a type the
 * collection does not declare failed with an error about a table column.
 * The package's other mount-time errors name the component that threw.
 *
 * Each error names its renderer and what that renderer calls the thing.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import silenceRenderErrors from "../../../testing/silenceRenderErrors.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const fields = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status", appliesTo: ["sandbox"] },
];

describe("a narrowing naming a type nothing declares", () => {
  it("names the renderer that mounted it", () => {
    silenceRenderErrors();
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    expect(() =>
      render(
        <Cards
          provider={provider}
          fields={fields}
          title="name"
          label="Instances"
        />,
      ),
    ).toThrow(/^Cards field "status" applies to "sandbox"/);
    expect(() =>
      render(
        <DataTable provider={provider} columns={fields} label="Instances" />,
      ),
    ).toThrow(/^DataTable column "status" applies to "sandbox"/);
  });
});
