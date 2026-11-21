import { describe, expect, it } from "vitest";
import { SERVED_STATION_FIELDS } from "../../testing/fixtures.js";
import { deriveListFields } from "./deriveListFields.js";
import { readNodeValues } from "./readNodeValues.js";

const { fields } = deriveListFields(SERVED_STATION_FIELDS);
const pick = (...ids: string[]) =>
  ids.flatMap((id) => fields.filter((field) => field.id === id));

describe("readNodeValues", () => {
  it("answers each field in the order given, with its label", () => {
    const values = readNodeValues(pick("zone", "name"), () => []);
    expect(values.map((value) => [value.field, value.label])).toEqual([
      ["zone", fields.find((field) => field.id === "zone")?.label],
      ["name", fields.find((field) => field.id === "name")?.label],
    ]);
  });

  it("answers no text and no IRI for a field without values", () => {
    expect(readNodeValues(pick("name"), () => []).at(0)).toMatchObject({
      text: null,
      uri: null,
    });
  });

  it("carries the IRI of a single entity value", () => {
    const [value] = readNodeValues(pick("zone"), () => [
      { text: "Zone 1", uri: "http://example.org/zone-1" },
    ]);
    expect(value).toMatchObject({
      text: "Zone 1",
      uri: "http://example.org/zone-1",
    });
  });

  it("shows a list's first value and how many more, and carries no IRI", () => {
    const [value] = readNodeValues(pick("servesLine"), () => [
      { text: "Circle Line", uri: "http://example.org/circle" },
      { text: "Red Line", uri: "http://example.org/red" },
      { text: "Ringway Line", uri: "http://example.org/ringway" },
    ]);
    expect(value).toMatchObject({ text: "Circle Line +2", uri: null });
  });

  it("groups a number field's value and answers the field's type", () => {
    const [value] = readNodeValues(pick("platformCount"), () => [
      { text: "1600", uri: null },
    ]);
    expect(value).toMatchObject({
      text: new Intl.NumberFormat().format(1600),
      type: "number",
    });
  });

  it("keeps a text field's value as read", () => {
    const [value] = readNodeValues(pick("name"), () => [
      { text: "007", uri: null },
    ]);
    expect(value).toMatchObject({ text: "007", type: "text" });
  });
});
