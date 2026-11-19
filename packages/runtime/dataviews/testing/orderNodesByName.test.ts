import { describe, expect, it } from "vitest";
import orderNodesByName from "./orderNodesByName.js";

const NODES = [
  { id: "z", name: "zeta" },
  { id: "a", name: "äpple" },
];

describe("orderNodesByName", () => {
  it("answers the ids in the order the declared collation gives", () => {
    expect(orderNodesByName(NODES, "en")).toEqual(["a", "z"]);
    expect(orderNodesByName(NODES, "sv")).toEqual(["z", "a"]);
  });
});
