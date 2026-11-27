const CHROME_KEYS = [
  "id",
  "class",
  "style",
  "name",
  "label",
  "description",
  "error",
  "isOptional",
  "requiredIndicator",
  "condition",
  "descriptionPosition",
  "controlLabel",
  "labelPosition",
] as const;

/** The props a field hands to its chrome rather than its control. */
export type ChromeKey = (typeof CHROME_KEYS)[number];

/**
 * Splits a field's props into the ones its chrome (label, description, error,
 * layout and condition) consumes and the ones spread onto its control. `name`
 * goes to both, since the chrome derives IDs from it and the control submits
 * under it. Attachments go to the control.
 * @note Pure.
 */
export default function splitChromeProps<P extends { name: string }>(
  props: P,
): {
  chrome: Pick<P, Extract<keyof P, ChromeKey>>;
  control: Omit<P, ChromeKey>;
} {
  const chrome: Record<PropertyKey, unknown> = {};
  const control: Record<PropertyKey, unknown> = {};
  // Symbol keys are attachments passed with `{@attach}`: they go to the control.
  for (const key of Reflect.ownKeys(props)) {
    const value = props[key as keyof P];
    if ((CHROME_KEYS as readonly PropertyKey[]).includes(key))
      chrome[key] = value;
    else control[key] = value;
  }
  return {
    chrome: chrome as Pick<P, Extract<keyof P, ChromeKey>>,
    control: control as Omit<P, ChromeKey>,
  };
}
