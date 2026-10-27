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

/** A title, as a node's `_meta` gives it. */
interface Titled {
  readonly _meta: { readonly title: string };
}

/**
 * What a stop's card reads to list its key values: its platform count, its
 * fare zone and the lines it serves, each as the graph asserts it.
 */
export interface StopFacts {
  /** The station's platform count, null when the graph asserts none. */
  readonly platformCount?: number | null;
  /** The fare zone the station is in, null when it is in none. */
  readonly inZone?: Titled | null;
  /** The lines that call at the station. */
  readonly servesLine: readonly Titled[];
}
