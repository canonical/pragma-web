import type { MessageKey } from "#i18n";
import type { HOME_LENS_MESSAGES } from "./constants.js";

/** A lens the landing opens a door to, by its index route's name. */
export type HomeLensName = keyof typeof HOME_LENS_MESSAGES;

/** A door's catalog keys: its counted noun and its summary line. */
export interface HomeLensMessages {
  /** The plural record that states the count, selected by `count`. */
  readonly count: MessageKey;
  /** The line on what the lens is for. */
  readonly summary: MessageKey;
}

/** One count per lens, as the graph gives it. */
export type LensCounts = Readonly<Record<HomeLensName, number>>;
