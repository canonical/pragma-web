import type { MessageKey } from "../../i18n/index.js";

/** The contact form's fields, as posted. */
export interface ContactValues {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

/** The catalog key of each invalid field's message. */
export type ContactErrors = Partial<Record<keyof ContactValues, MessageKey>>;
