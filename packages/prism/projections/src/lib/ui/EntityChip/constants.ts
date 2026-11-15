/**
 * How long the pointer rests on a chip's link before its peek opens: long
 * enough that a pointer crossing a paragraph opens nothing, short enough
 * that a reader who stops on a mention sees it without asking.
 */
export const PEEK_OPEN_DELAY_MS = 500;

/**
 * How long a peek stays open once the pointer has left the link and the
 * peek: the time it takes to cross the 4px gap between them.
 */
export const PEEK_CLOSE_DELAY_MS = 200;
