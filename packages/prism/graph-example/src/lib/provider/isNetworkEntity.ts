import { NETWORK_TYPENAMES } from "./constants.js";
import type { ExampleEntity, ExampleNetworkEntity } from "./types.js";

/**
 * Whether a record belongs to the network (a line, a station, an interchange
 * or a fare zone) rather than to the fleet, narrowing it to the network's
 * record shape.
 */
export const isNetworkEntity = (
  entity: ExampleEntity,
): entity is ExampleNetworkEntity => NETWORK_TYPENAMES.has(entity.typename);
