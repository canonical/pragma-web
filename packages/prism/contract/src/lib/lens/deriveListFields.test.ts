import { describe, expect, it } from "vitest";
import { SERVED_STATION_FIELDS } from "../../testing/fixtures.js";
import { deriveListFields } from "./deriveListFields.js";

describe("deriveListFields", () => {
  const { fields, display } = deriveListFields(SERVED_STATION_FIELDS);
  const byId = new Map(fields.map((field) => [field.id, field]));

  describe("fields", () => {
    it("drops the hidden fields", () => {
      expect(byId.has("secret")).toBe(false);
    });

    it("orders by group, then field order, the unordered last, then name", () => {
      expect(fields.map((field) => field.id)).toEqual([
        "name",
        "platformCount",
        "note",
        "servesLine",
        "zone",
        "opened",
        "stepFree",
      ]);
    });

    it("reads each field's type from its property's kind and range", () => {
      expect(
        Object.fromEntries(fields.map((field) => [field.id, field.type])),
      ).toEqual({
        name: "text",
        platformCount: "number",
        note: "text",
        servesLine: "choices",
        zone: "choices",
        opened: "date",
        stepFree: "flag",
      });
    });

    it("reads GraphQL's number scalars as number ranges", () => {
      const ranged = (range: string) =>
        deriveListFields(
          SERVED_STATION_FIELDS.map((served) =>
            served.name === "platformCount"
              ? { ...served, property: { ...served.property, range } }
              : served,
          ),
        ).fields.find((field) => field.id === "platformCount")?.type;
      expect(ranged("Int")).toBe("number");
      expect(ranged("Float")).toBe("number");
    });

    it("labels a field by its property, else by its name", () => {
      expect(byId.get("platformCount")?.label).toBe("platform count");
      expect(byId.get("stepFree")?.label).toBe("stepFree");
    });

    it("keeps the property, group, role and prominence", () => {
      expect(byId.get("servesLine")).toMatchObject({
        property: "http://example.org/servesLine",
        group: "http://example.org/service",
        role: null,
        prominent: true,
      });
      expect(byId.get("opened")).toMatchObject({
        group: null,
        prominent: false,
      });
      expect(byId.get("zone")?.role).toBe("CLASSIFICATION");
    });

    it("sorts by single values that are not entities", () => {
      expect(
        fields.filter((field) => field.enableSorting).map((field) => field.id),
      ).toEqual(["name", "platformCount", "note", "opened", "stepFree"]);
    });

    it("filters by entities and flags", () => {
      expect(
        fields.filter((field) => field.facetable).map((field) => field.id),
      ).toEqual(["servesLine", "zone", "stepFree"]);
    });
  });

  describe("display", () => {
    it("shows the fields with no role but classification, prominent first", () => {
      expect(display).toEqual([
        { field: "servesLine", header: "line" },
        { field: "platformCount", header: "platform count" },
        { field: "note", header: "note" },
        { field: "zone", header: "zone" },
        { field: "opened", header: "opened" },
        { field: "stepFree", header: "stepFree" },
      ]);
    });
  });

  it("answers no fields for a class that serves none", () => {
    expect(deriveListFields([])).toEqual({ fields: [], display: [] });
  });
});
