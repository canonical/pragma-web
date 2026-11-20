import type React from "react";
import { useContext } from "react";
import { Icon } from "../../../Icon/index.js";
import Context from "../Context.js";
import type { DismissProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds chip-dismiss";

/**
 * The control that dismisses a chip. Use it as the only child of a `Chip`; it
 * makes the chip dismissible, and is then the chip's one action.
 *
 * Disabling it disables the whole chip.
 *
 * TODO: add `@implements ds:global.subcomponent.chip-dismiss` once the
 * subcomponent exists in the design-system ontology.
 */
const Dismiss = ({ className, ...props }: DismissProps): React.ReactElement => {
  const chip = useContext(Context);

  if (!chip) {
    throw new Error("Chip.Dismiss must be used within a Chip.");
  }

  return (
    // `type` and `aria-label` are defaults placed before the spread, so a
    // caller can still override either through the native prop.
    <button
      type="button"
      aria-label={chip.defaultDismissLabel}
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Icon icon="close" />
    </button>
  );
};

Dismiss.displayName = "Chip.Dismiss";

export default Dismiss;
