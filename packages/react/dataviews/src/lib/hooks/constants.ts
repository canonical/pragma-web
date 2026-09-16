/**
 * How many rows a renderer draws without virtualization before it warns, in
 * development, that the count deserves a measurement. A prompt and never a
 * cap: the renderer still draws every row the viewer asked for, and a
 * production build says nothing. Not a performance threshold — no universal
 * row count is one — but the count at which a table rendering every row is
 * worth a look. Documented as its value, not exported: an application acts on
 * the warning, never on the number.
 */
export const RENDER_CEILING = 500;

/**
 * How long a touch is held on a row before it is a long press, in
 * milliseconds: the platforms' own long-press delay, so it feels like one.
 */
export const LONG_PRESS_MS = 500;

/**
 * How far a touch may drift, in CSS pixels, before it is a scroll and no
 * longer a press.
 */
export const LONG_PRESS_SLOP_PX = 10;
