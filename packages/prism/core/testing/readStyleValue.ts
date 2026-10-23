import type { Style } from "@canonical/anatomy-dsl";
import { parse } from "yaml";

/**
 * Read a parsed style's value back into what the YAML held for it: a
 * scalar, or the sequence that is its fallback order. The parsed style
 * keeps the authored spelling, which writes a sequence in its flow form.
 *
 * @param style - A style of a parsed anatomy.
 * @returns The scalar or the sequence of scalars the anatomy wrote.
 */
export default function readStyleValue(style: Style): unknown {
  return style.value.startsWith("[") ? parse(style.value) : style.value;
}
