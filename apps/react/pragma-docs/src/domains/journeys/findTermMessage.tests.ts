import { describe, expect, it } from "vitest";
import { ARRIVAL_MESSAGES, ROLE_MESSAGES } from "./constants.js";
import { findSurfaceTypeMessage, findTermMessage } from "./findTermMessage.js";

describe("findTermMessage", () => {
  it("finds a role's words by either spelling of the term", () => {
    expect(findTermMessage(ROLE_MESSAGES, "sem://surface#primary")).toBe(
      "journeys.role.primary",
    );
    expect(findTermMessage(ROLE_MESSAGES, "surface:Secondary")).toBe(
      "journeys.role.secondary",
    );
  });

  it("finds an arrival's words by either spelling of the term", () => {
    expect(findTermMessage(ARRIVAL_MESSAGES, "surface:cold_entry")).toBe(
      "journeys.arrival.coldEntry",
    );
    expect(findTermMessage(ARRIVAL_MESSAGES, "surface:NoMove")).toBe(
      "journeys.arrival.noMove",
    );
  });

  it("finds nothing for an absent term or one the map does not hold", () => {
    expect(findTermMessage(ROLE_MESSAGES, undefined)).toBeUndefined();
    expect(findTermMessage(ROLE_MESSAGES, null)).toBeUndefined();
    expect(findTermMessage(ROLE_MESSAGES, "surface:tertiary")).toBeUndefined();
  });
});

describe("findSurfaceTypeMessage", () => {
  it("finds a surface kind's words by its GraphQL type", () => {
    expect(findSurfaceTypeMessage("LensSurface")).toBe(
      "journeys.surfaceType.lens",
    );
    expect(findSurfaceTypeMessage("Port")).toBe("journeys.surfaceType.port");
  });

  it("finds nothing for an absent type or one the map does not hold", () => {
    expect(findSurfaceTypeMessage(undefined)).toBeUndefined();
    expect(findSurfaceTypeMessage("Surface")).toBeUndefined();
  });
});
