import type { SourceRefusal } from "../result/index.js";

/** Build one structured refusal, naming no field or operator by default. */
export default function createRefusal(
  part: SourceRefusal["part"],
  code: SourceRefusal["code"],
  reason: string,
  field: string | null = null,
  operator: SourceRefusal["operator"] = null,
): SourceRefusal {
  return { part, code, field, operator, reason };
}
