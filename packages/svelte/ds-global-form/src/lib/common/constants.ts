/**
 * The event a control dispatches when its custom validity was cleared, since
 * `setCustomValidity("")` fires none: `Field` reads the validity again on it.
 * It bubbles. Dispatch it after clearing a custom validity of your own.
 */
export const VALIDITY_EVENT = "ds:validity";
