import type { ModifierFamily } from "@canonical/ds-types";
import type { ComponentProps } from "react";

/** The stand-in's own props; the rest are native span props. */
type OwnProps = {
  /** The text the tag shows. */
  value: string;

  /** Optional key shown before the value, followed by a colon. */
  lead?: string;

  /** Criticality modifier for status indication. */
  criticality?: ModifierFamily<"criticality">;
};

/**
 * Tag's props: read-only metadata on a `<span>`, no action. Copied from the
 * read-only chip this stand-in replaces.
 */
export type TagStandInProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
