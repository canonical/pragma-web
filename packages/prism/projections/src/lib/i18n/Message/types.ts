import type { ReactNode } from "react";
import type { MessageKey, MessageValues } from "../types.js";

/** Props accepted by `Message`. */
export interface MessageProps {
  /** The catalog key of the whole sentence. */
  readonly id: MessageKey;
  /** The values that fill its plain-text placeholders. */
  readonly values?: MessageValues;
  /** The elements that render in place of its other placeholders, by name. */
  readonly elements: Readonly<Record<string, ReactNode>>;
}
