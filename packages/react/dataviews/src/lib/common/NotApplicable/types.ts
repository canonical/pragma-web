/**
 * Props of the not-applicable content: none; its words are the messages'.
 *
 * Exempt from the native-prop extension convention: it renders a dash and a
 * word as a fragment, with no one root to forward a caller's props to.
 */
export type NotApplicableProps = Record<string, never>;
