import type { ControlProps } from "../types.js";

/**
 * Builds the identity and accessibility wiring of a field's control from the
 * field's base ID: the control ID, its label, description and error
 * references, and its required and invalid state. The description is
 * referenced only when the field renders one.
 * @note Pure.
 */
export default function createControlProps(
  baseId: string,
  isError: boolean,
  isRequired: boolean,
  hasDescription = false,
): ControlProps {
  const errorId = `${baseId}-error`;
  return {
    id: baseId,
    "aria-labelledby": `${baseId}-label`,
    "aria-describedby":
      [hasDescription ? `${baseId}-description` : "", isError ? errorId : ""]
        .filter(Boolean)
        .join(" ") || undefined,
    "aria-errormessage": isError ? errorId : undefined,
    "aria-invalid": isError,
    "aria-required": isRequired || undefined,
    required: isRequired,
  };
}
