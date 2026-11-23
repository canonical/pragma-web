/**
 * Message-record types used only by the i18n-react tests.
 */

/** A record with text, a one-fact message and a plural message. */
export type Greetings = {
  readonly heading: string;
  readonly greeting: (name: string) => string;
  readonly items: (count: number) => string;
};

/** A record with one plural message, for the server-render tests. */
export type Rows = {
  readonly rowsSelected: (count: number) => string;
};
