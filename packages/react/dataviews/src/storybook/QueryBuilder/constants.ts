import type { Operator, Part } from "./types.js";

/** The fields and the values each takes. */
export const FIELDS: Record<string, string[]> = {
  status: ["deployed", "ready", "commissioning", "broken"],
  pool: ["default", "gpu", "storage"],
  owner: ["admin", "alice", "bob"],
};

/** The operators, their words and their Condition values. */
export const OPERATORS: Operator[] = [
  { id: "is", label: "is", condition: "inclusion" },
  { id: "is not", label: "is not", condition: "exclusion" },
  { id: "contains", label: "contains", condition: "match" },
];

/** The parts in the order a clause is built. */
export const PARTS: Part[] = ["field", "operator", "value"];
