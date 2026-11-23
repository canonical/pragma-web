import type { Schema, SchemaFieldDefinition } from "../src/lib/schema/index.js";
import type { SourceCapabilities } from "../src/lib/source/index.js";
import {
  decodeQuery,
  encodeCarryingQuery,
  isNarrowingIssue,
} from "../src/lib/wire/index.js";
import type { RespelledLink } from "./types.js";

/**
 * A followed link written back over itself, its narrowing refusals carried
 * as the location loop carries them, and the written link read again,
 * against the source's capabilities when given.
 */
export default function respellLink(
  schema: Schema<readonly SchemaFieldDefinition[]>,
  params: URLSearchParams,
  capabilities: SourceCapabilities | null = null,
): RespelledLink {
  const decoded = decodeQuery({ schema, params, capabilities });
  const written = encodeCarryingQuery({
    schema,
    slice: decoded.slice,
    window: null,
    preserve: params,
    carry: decoded.issues
      .filter(isNarrowingIssue)
      .map((issue) => issue.parameter),
    applied: decoded.slice,
  });
  return {
    decoded,
    written,
    reread: decodeQuery({ schema, params: written, capabilities }),
  };
}
